import asyncio
import json
import logging

from agents.compliance.prompts import SYSTEM_PROMPT, DOMAIN_CRITERIA, build_domain_user_prompt
from shared.llm_client import LLMClient
from shared.schemas import Finding, SubmissionPayload

logger = logging.getLogger(__name__)

DOMAINS = [
    "policy_checklist",
    "standards_coverage",
    "documentation_artifacts",
    "governance_completeness",
    "required_approvals",
]


async def evaluate_all_domains(
    submission: SubmissionPayload,
    llm: LLMClient
) -> list[Finding]:
    """
    Runs compliance control checks concurrently. Each domain maps to a policy
    checklist area and returns audit-ready findings.
    """
    sem = asyncio.Semaphore(5)

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
            logger.error("Compliance domain %s evaluation failed: %s", domain, result, exc_info=result)
            failed_domains.append(domain)
        else:
            findings.extend(result)

    if len(failed_domains) == len(DOMAINS):
        raise RuntimeError("Compliance evaluation failed completely: all domains returned errors.")

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
    """Deterministic policy checks for artifacts and approvals the LLM might miss."""
    findings: list[Finding] = []

    if not submission.compliance_targets:
        findings.append(Finding(
            domain="standards_coverage",
            severity="high",
            title="No compliance targets declared",
            detail=(
                "The submission does not identify applicable regulatory frameworks "
                "or standards. This prevents a reviewer from mapping the feature to "
                "required controls or producing a defensible audit trail."
            ),
            recommendation="Declare applicable standards such as GDPR, CCPA, SOC2, ISO 27001, NIST AI RMF, or document why none apply."
        ))

    if not submission.existing_risk_assessment:
        severity = "high" if submission.pii_involved in ("yes", "unknown") else "medium"
        findings.append(Finding(
            domain="documentation_artifacts",
            severity=severity,
            title="Missing risk assessment evidence",
            detail=(
                "No prior risk assessment, security review, compliance audit, DPIA, "
                "or equivalent governance artifact is referenced. The record lacks "
                "evidence that known risks and controls have been reviewed before release."
            ),
            recommendation="Attach or reference the relevant risk assessment, DPIA, compliance review, or exception approval."
        ))

    if submission.pii_involved == "unknown":
        findings.append(Finding(
            domain="policy_checklist",
            severity="high",
            title="PII classification unresolved",
            detail=(
                "The submission marks PII involvement as unknown. Governance approval "
                "cannot confirm data minimization, privacy notices, retention controls, "
                "or lawful processing obligations without this classification."
            ),
            recommendation="Complete data classification and privacy review before production deployment."
        ))

    if submission.pii_involved == "yes" and not _targets_include_privacy(submission.compliance_targets):
        findings.append(Finding(
            domain="standards_coverage",
            severity="medium",
            title="PII present without privacy standard",
            detail=(
                "The feature processes PII, but the stated compliance targets do not "
                "include a privacy framework such as GDPR, CCPA, HIPAA, or an internal "
                "privacy control set. This leaves privacy control coverage ambiguous."
            ),
            recommendation="Map PII processing to an applicable privacy standard or document the privacy control baseline used."
        ))

    if submission.third_party_deps and submission.pii_involved in ("yes", "unknown"):
        findings.append(Finding(
            domain="required_approvals",
            severity="medium",
            title="Vendor approval evidence required",
            detail=(
                "The submission lists third-party dependencies while sensitive data "
                "may be processed. The audit record should show vendor due diligence, "
                "contractual controls, and data processing approvals before release."
            ),
            recommendation="Provide vendor risk review evidence and applicable DPA, SCC, BAA, or procurement approval references."
        ))

    if len(submission.jurisdiction) > 1 and not submission.compliance_targets:
        findings.append(Finding(
            domain="governance_completeness",
            severity="medium",
            title="Multi-jurisdiction controls missing",
            detail=(
                "The feature is planned for multiple jurisdictions but does not list "
                "the standards or control obligations for those regions. Cross-border "
                "deployment requires explicit governance coverage."
            ),
            recommendation="Document jurisdiction-specific obligations and the controls used to satisfy them."
        ))

    return findings


def parse_findings(raw: str, domain: str) -> list[Finding]:
    try:
        start = raw.find("[")
        end = raw.rfind("]")
        if start == -1 or end == -1:
            logger.warning("Could not find JSON array bounds in LLM output for compliance domain %s.", domain)
            return []
        clean = raw[start:end + 1]
        items = json.loads(clean)
        if not isinstance(items, list):
            logger.warning("JSON parsed successfully but is not a list for compliance domain %s.", domain)
            return []
        findings = []
        for item in items:
            try:
                findings.append(Finding(domain=domain, **item))
            except Exception as exc:
                logger.warning("Dropped invalid compliance finding in %s: %s", domain, exc)
        return findings
    except Exception as exc:
        logger.error("parse_findings failed for compliance domain %s: %s. Raw: %s", domain, exc, raw[:200])
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
