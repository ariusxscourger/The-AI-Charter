import asyncio
import json
import logging

from agents.ethics.prompts import SYSTEM_PROMPT, DOMAIN_CRITERIA, build_domain_user_prompt
from shared.llm_client import LLMClient
from shared.schemas import Finding, SubmissionPayload

logger = logging.getLogger(__name__)

DOMAINS = [
    "fairness_demographic_impact",
    "bias_risk",
    "foreseeable_harm",
    "misuse_scenarios",
    "principles_alignment",
]

HIGH_STAKES_TERMS = (
    "hiring", "employment", "candidate", "resume", "job", "promotion",
    "credit", "loan", "mortgage", "insurance", "eligibility", "benefits",
    "housing", "tenant", "school", "education", "student", "admission",
    "medical", "health", "diagnosis", "clinical", "patient", "therapy",
    "legal", "law enforcement", "criminal", "policing", "safety",
)

PROTECTED_ATTRIBUTE_TERMS = (
    "race", "ethnicity", "gender", "sex", "sexual orientation", "religion",
    "disability", "age", "nationality", "citizenship", "pregnancy",
    "veteran", "protected class", "demographic",
)

DECISION_AUTOMATION_TERMS = (
    "approve", "deny", "reject", "rank", "score", "prioritize", "classify",
    "recommend", "route", "decide", "eligibility", "screen", "shortlist",
)

MISUSE_TERMS = (
    "surveillance", "facial recognition", "face recognition", "biometric",
    "emotion recognition", "monitor employees", "profile users", "profiling",
    "impersonation", "deepfake", "deception",
)

HUMAN_OVERSIGHT_TERMS = (
    "human review", "human-in-the-loop", "human in the loop", "manual review",
    "appeal", "contest", "override", "escalation", "reviewer",
)

FAIRNESS_EVIDENCE_TERMS = (
    "fairness", "bias", "subgroup", "disparate impact", "equalized odds",
    "demographic parity", "model card", "impact assessment", "red team",
)


async def evaluate_ethics_risks(
    submission: SubmissionPayload,
    llm: LLMClient,
    deterministic: bool = False,
) -> list[Finding]:
    """
    Evaluate ethics risks. Deterministic checks always run; LLM domain review
    is skipped when deterministic=True for reproducible tests and governance runs.
    """
    findings = evaluate_deterministic_ethics_checks(submission)
    if deterministic:
        return dedupe_findings(findings)

    sem = asyncio.Semaphore(5)

    async def evaluate_with_sem(domain: str):
        async with sem:
            result = await evaluate_domain(domain, submission, llm)
            await asyncio.sleep(0.5)
            return result

    tasks = [evaluate_with_sem(domain) for domain in DOMAINS]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    failed_domains = []
    for domain, result in zip(DOMAINS, results):
        if isinstance(result, Exception):
            logger.error("Ethics domain %s evaluation failed: %s", domain, result, exc_info=result)
            failed_domains.append(domain)
        else:
            findings.extend(result)

    if len(failed_domains) == len(DOMAINS) and not findings:
        raise RuntimeError("Ethics evaluation failed completely: all domains returned errors.")

    return dedupe_findings(findings)


async def evaluate_domain(
    domain: str,
    submission: SubmissionPayload,
    llm: LLMClient,
) -> list[Finding]:
    system = SYSTEM_PROMPT.format(
        domain_label=domain.replace("_", " ").title(),
        domain_criteria=DOMAIN_CRITERIA[domain],
    )
    user = build_domain_user_prompt(domain, submission)
    raw = await llm.complete(system, user)
    return parse_findings(raw, domain)


def evaluate_deterministic_ethics_checks(submission: SubmissionPayload) -> list[Finding]:
    findings: list[Finding] = []
    text = _submission_text(submission)
    high_stakes = _contains_any(text, HIGH_STAKES_TERMS)
    automated_decision = _contains_any(text, DECISION_AUTOMATION_TERMS)
    human_oversight = _contains_any(text, HUMAN_OVERSIGHT_TERMS)
    fairness_evidence = _contains_any(text, FAIRNESS_EVIDENCE_TERMS)

    if high_stakes and automated_decision and not human_oversight:
        findings.append(Finding(
            domain="foreseeable_harm",
            severity="critical",
            title="Consequential automation lacks human oversight",
            detail=(
                "The submission appears to automate or materially influence a high-stakes decision "
                "without describing human review, appeal, escalation, or override. Errors in this "
                "context could affect access to employment, finance, healthcare, legal outcomes, "
                "education, safety, or other consequential services."
            ),
            recommendation="Add human review, appeal rights, escalation paths, and release gates before production use."
        ))

    if _contains_any(text, PROTECTED_ATTRIBUTE_TERMS):
        findings.append(Finding(
            domain="fairness_demographic_impact",
            severity="high" if automated_decision else "medium",
            title="Protected attribute impact requires fairness review",
            detail=(
                "The submission references protected attributes or demographic groups. Governance "
                "needs evidence that these attributes are not used in a discriminatory way and that "
                "affected groups are evaluated for disparate impact."
            ),
            recommendation="Provide subgroup performance analysis, fairness metrics, and documented mitigation for protected-class impacts."
        ))

    if high_stakes and not fairness_evidence:
        findings.append(Finding(
            domain="bias_risk",
            severity="high",
            title="High-stakes use lacks fairness evidence",
            detail=(
                "The feature appears to operate in a consequential domain, but the submission does "
                "not reference fairness testing, bias evaluation, impact assessment, model card, or "
                "red-team evidence. This leaves demographic and proxy-bias risks unresolved."
            ),
            recommendation="Attach fairness and bias evaluation evidence before approval."
        ))

    if submission.pii_involved == "unknown":
        findings.append(Finding(
            domain="principles_alignment",
            severity="medium",
            title="Unknown PII status weakens ethical review",
            detail=(
                "The submission marks PII involvement as unknown. Ethical review cannot confirm "
                "data minimization, informed use, user expectations, or proportionality without a "
                "resolved data classification."
            ),
            recommendation="Complete data classification and update the submission before release."
        ))

    if _contains_any(text, MISUSE_TERMS):
        severity = "critical" if "biometric" in text or "facial recognition" in text or "face recognition" in text else "high"
        findings.append(Finding(
            domain="misuse_scenarios",
            severity=severity,
            title="Misuse and surveillance risks need controls",
            detail=(
                "The submission contains signals associated with surveillance, profiling, biometric "
                "processing, impersonation, or deceptive use. These capabilities can create harms "
                "outside the intended use if access controls, use restrictions, and monitoring are weak."
            ),
            recommendation="Define prohibited uses, access controls, abuse monitoring, and incident response for misuse scenarios."
        ))

    if "minor" in text or "child" in text or "children" in text:
        findings.append(Finding(
            domain="foreseeable_harm",
            severity="high",
            title="Vulnerable user group safeguards required",
            detail=(
                "The submission indicates that minors or children may be affected. This requires "
                "heightened safeguards for consent, age-appropriate design, safety escalation, and "
                "limits on behavioral influence."
            ),
            recommendation="Document age-appropriate safeguards, consent handling, and human escalation before launch."
        ))

    if not submission.existing_risk_assessment and (high_stakes or submission.pii_involved in ("yes", "unknown")):
        findings.append(Finding(
            domain="principles_alignment",
            severity="medium",
            title="Ethical risk assessment evidence missing",
            detail=(
                "The submission does not reference an existing risk assessment or equivalent review. "
                "For sensitive or consequential AI features, the governance record should show known "
                "ethical risks, residual risk owners, and mitigation commitments."
            ),
            recommendation="Attach an AI impact assessment, model card, risk review, or documented residual-risk acceptance."
        ))

    return findings


def parse_findings(raw: str, domain: str) -> list[Finding]:
    try:
        start = raw.find("[")
        end = raw.rfind("]")
        if start == -1 or end == -1:
            logger.warning("Could not find JSON array bounds in ethics domain %s.", domain)
            return []
        clean = raw[start:end + 1]
        items = json.loads(clean)
        if not isinstance(items, list):
            logger.warning("JSON parsed successfully but is not a list for ethics domain %s.", domain)
            return []

        findings = []
        for item in items:
            try:
                findings.append(Finding(domain=domain, **item))
            except Exception as exc:
                logger.warning("Dropped invalid ethics finding in %s: %s", domain, exc)
        return findings
    except Exception as exc:
        logger.error("parse_findings failed for ethics domain %s: %s. Raw: %s", domain, exc, raw[:200])
        return []


def dedupe_findings(findings: list[Finding]) -> list[Finding]:
    seen = set()
    unique = []
    for finding in findings:
        key = (finding.domain, finding.severity, finding.title.lower())
        if key not in seen:
            seen.add(key)
            unique.append(finding)
    return unique


def _submission_text(submission: SubmissionPayload) -> str:
    parts = [
        submission.feature_name,
        submission.description,
        submission.intended_use,
        " ".join(submission.affected_systems),
        submission.data_sources,
        submission.third_party_deps or "",
        submission.existing_risk_assessment or "",
        " ".join(submission.jurisdiction),
        " ".join(submission.compliance_targets or []),
    ]
    return " ".join(parts).lower()


def _contains_any(text: str, terms: tuple[str, ...]) -> bool:
    return any(term in text for term in terms)
