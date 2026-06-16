import asyncio
import json
import logging
from typing import Literal

from agents.legal.prompts import SYSTEM_PROMPT, DOMAIN_CRITERIA, build_domain_user_prompt
from shared.llm_client import LLMClient
from shared.schemas import Finding, SubmissionPayload

logger = logging.getLogger(__name__)

DOMAINS = [
    "privacy_data_protection",
    "intellectual_property",
    "consumer_protection",
    "employment_labor",
    "jurisdictional_compliance",
    "contracts_vendor_obligations",
]


async def evaluate_all_domains(
    submission: SubmissionPayload,
    llm: LLMClient
) -> list[Finding]:
    """Run all 6 legal domain evaluations concurrently via the configured LLM."""
    sem = asyncio.Semaphore(6)

    async def evaluate_with_sem(domain: str):
        async with sem:
            result = await evaluate_domain(domain, submission, llm)
            await asyncio.sleep(0.5)
            return result

    tasks = [evaluate_with_sem(domain) for domain in DOMAINS]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    findings = []
    failed_domains = []
    for domain, result in zip(DOMAINS, results):
        if isinstance(result, Exception):
            logger.error("Legal domain %s evaluation failed: %s", domain, result, exc_info=result)
            failed_domains.append(domain)
        else:
            if isinstance(result, list):
                findings.extend(result)

    if len(failed_domains) == len(DOMAINS):
        raise RuntimeError("Legal evaluation failed completely: all evaluation domains returned errors.")

    findings.extend(evaluate_required_artifacts(submission))
    return dedupe_findings(findings)


async def evaluate_domain(
    domain: str,
    submission: SubmissionPayload,
    llm: LLMClient
) -> list[Finding]:
    system = SYSTEM_PROMPT.format(
        domain_label=domain.replace("_", " ").title(),
        domain_criteria=DOMAIN_CRITERIA[domain]
    )
    user = build_domain_user_prompt(domain, submission)
    raw = await llm.complete(system, user)
    return parse_findings(raw, domain)


def evaluate_required_artifacts(submission: SubmissionPayload) -> list[Finding]:
    """Deterministic legal artifact checks the LLM might miss."""
    findings: list[Finding] = []

    if not submission.compliance_targets:
        findings.append(Finding(
            domain="jurisdictional_compliance",
            severity="high",
            title="No legal or compliance targets declared",
            detail=(
                "The submission does not identify applicable legal frameworks, regulatory "
                "targets, or governance standards. Without this mapping, legal review cannot "
                "confirm which obligations apply to the proposed feature."
            ),
            recommendation="Declare applicable legal frameworks such as GDPR, CCPA, HIPAA, SOC2, ISO 27001, NIST AI RMF, or document why none apply."
        ))

    if not _has_text(submission.existing_risk_assessment):
        severity: Literal["high", "medium"] = (
            "high"
            if submission.pii_involved in ("yes", "unknown") or len(submission.jurisdiction) > 1
            else "medium"
        )
        findings.append(Finding(
            domain="jurisdictional_compliance",
            severity=severity,
            title="Missing legal risk assessment evidence",
            detail=(
                "No prior legal, privacy, compliance, DPIA, or risk assessment artifact is "
                "referenced. The record lacks evidence that legal exposure, data obligations, "
                "and jurisdiction-specific requirements were reviewed before release."
            ),
            recommendation="Attach or reference the relevant legal review, DPIA, privacy assessment, vendor review, or exception approval."
        ))

    if submission.pii_involved == "unknown":
        findings.append(Finding(
            domain="privacy_data_protection",
            severity="high",
            title="PII classification unresolved",
            detail=(
                "The submission marks PII involvement as unknown. Legal approval cannot confirm "
                "lawful basis, notice, consent, retention, deletion, or cross-border transfer "
                "obligations until the data classification is resolved."
            ),
            recommendation="Complete data classification and privacy review before production deployment."
        ))

    if submission.pii_involved == "yes" and not _targets_include_privacy(submission.compliance_targets):
        findings.append(Finding(
            domain="privacy_data_protection",
            severity="medium",
            title="PII present without privacy framework",
            detail=(
                "The feature processes PII, but the stated compliance targets do not include "
                "a privacy law or privacy control framework. This leaves privacy obligations "
                "and evidence requirements ambiguous."
            ),
            recommendation="Map PII processing to an applicable privacy law or control set such as GDPR, CCPA, CPRA, HIPAA, or an approved internal privacy baseline."
        ))

    if _has_text(submission.third_party_deps) and submission.pii_involved in ("yes", "unknown"):
        findings.append(Finding(
            domain="contracts_vendor_obligations",
            severity="medium",
            title="Vendor legal review required",
            detail=(
                "The submission lists third-party dependencies while sensitive data may be "
                "processed. The audit record should show vendor due diligence, data processing "
                "terms, transfer mechanisms, and approval evidence before release."
            ),
            recommendation="Provide vendor risk review evidence and applicable DPA, SCC, BAA, procurement approval, or documented exception."
        ))

    if len(submission.jurisdiction) > 1 and not submission.compliance_targets:
        findings.append(Finding(
            domain="jurisdictional_compliance",
            severity="medium",
            title="Multi-jurisdiction legal mapping missing",
            detail=(
                "The feature is planned for multiple jurisdictions but does not list the legal "
                "frameworks or controls for those regions. Cross-border deployment requires "
                "explicit mapping of privacy, consumer, and regulatory obligations."
            ),
            recommendation="Document jurisdiction-specific obligations and the controls used to satisfy them before deployment."
        ))

    if _appears_high_stakes_legal_use(submission) and not _has_text(submission.existing_risk_assessment):
        findings.append(Finding(
            domain="consumer_protection",
            severity="high",
            title="High-stakes legal review required",
            detail=(
                "The proposal appears to affect a high-stakes or regulated decision area such "
                "as employment, housing, credit, health, education, legal rights, or government "
                "benefits. No legal risk assessment or exception artifact is referenced."
            ),
            recommendation="Obtain documented legal review and define human review, appeal, or escalation controls before production use."
        ))

    return findings


def parse_findings(raw: str, domain: str) -> list[Finding]:
    """Parse a JSON array of legal findings and drop invalid items."""
    try:
        start = raw.find("[")
        end = raw.rfind("]")
        if start == -1 or end == -1:
            logger.warning("Could not find JSON array bounds in Legal LLM output for domain %s.", domain)
            return []
        clean = raw[start:end + 1]
        items = json.loads(clean)
        if not isinstance(items, list):
            logger.warning("JSON parsed successfully but is not a list for legal domain %s.", domain)
            return []
        findings = []
        for item in items:
            try:
                findings.append(Finding(domain=domain, **item))
            except Exception as exc:
                logger.warning("Dropped invalid legal finding in %s: %s", domain, exc)
        return findings
    except Exception as exc:
        logger.error("parse_findings failed for legal domain %s: %s. Raw: %s", domain, exc, raw[:200])
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


def _targets_include_privacy(targets: list[str] | None) -> bool:
    if not targets:
        return False
    privacy_terms = ("gdpr", "ccpa", "cpra", "hipaa", "privacy", "data protection")
    return any(any(term in target.lower() for term in privacy_terms) for target in targets)


def _has_text(value: str | None) -> bool:
    return bool(value and str(value).strip())


def _appears_high_stakes_legal_use(submission: SubmissionPayload) -> bool:
    text = " ".join([
        submission.feature_name,
        submission.description,
        submission.intended_use,
    ]).lower()
    high_stakes_terms = (
        "employment", "hiring", "termination", "tenant", "housing", "credit", "loan",
        "mortgage", "insurance", "medical", "health", "education", "school", "legal",
        "court", "criminal", "law enforcement", "government benefit", "welfare", "child", "minor"
    )
    return any(term in text for term in high_stakes_terms)
