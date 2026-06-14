from shared.schemas import SubmissionPayload

SYSTEM_PROMPT = """You are the Compliance Agent on an AI governance review panel.
Your job is to evaluate AI feature proposals for adherence to internal governance
requirements and external standards in one specific compliance domain.
Domain: {domain_label}
Evaluation criteria:
{domain_criteria}

Respond ONLY with a valid JSON array of findings. No preamble, no explanation outside the JSON.
If no issues are found, return an empty array: []

Each finding must have exactly these fields:
- "severity": one of "critical", "high", "medium", "low", "info"
- "title": short specific finding title, max 80 characters
- "detail": 2-5 sentence explanation with audit-ready evidence from the submission
- "recommendation": concrete mitigation, control, approval, or artifact required"""

REASONING_PROMPT = """You are the Compliance Agent. Write a concise reasoning narrative
for your governance vote. Reference policy checklist coverage, missing controls,
governance artifacts, approvals, and applicable standards. 3-6 sentences. No bullets."""

DOMAIN_CRITERIA = {
    "policy_checklist": """
        - Submission states which internal AI governance policies apply
        - Purpose, owner, intended use, affected systems, and deployment scope are clear
        - Data classification and PII status are documented
        - Existing risk assessment or compliance review is referenced when required
        - Exceptions or deviations from policy are explicitly documented
    """,
    "standards_coverage": """
        - Applicable external standards are listed based on jurisdiction and data use
        - GDPR, CCPA, SOC2, ISO 27001, NIST AI RMF, HIPAA, PCI, or similar targets are covered when relevant
        - Controls map to the stated compliance targets rather than only naming them
        - Cross-border data handling obligations are acknowledged for multi-jurisdiction deployments
        - High-stakes or regulated use cases include appropriate domain-specific standards
    """,
    "documentation_artifacts": """
        - Required documentation exists or is referenced: DPIA, model card, data inventory, risk assessment, vendor review, test evidence, runbook, rollback plan
        - Audit evidence is concrete enough for a reviewer to trace the decision
        - Data sources, third-party dependencies, and processing flows are described
        - Retention, deletion, monitoring, incident response, and change management are documented when applicable
        - Missing documents are identified as explicit remediation items
    """,
    "governance_completeness": """
        - Ownership and accountability are clear for model behavior, data handling, and operations
        - Human review or escalation is defined for consequential decisions
        - Monitoring, periodic review, and drift or performance checks are planned
        - Release gates and post-launch controls are described
        - Residual risk acceptance is documented for unresolved issues
    """,
    "required_approvals": """
        - Security, legal, privacy, compliance, product, and data owner approvals are identified when applicable
        - Vendor or procurement approval exists for third-party processors
        - DPA, SCC, BAA, or similar contractual controls are referenced where needed
        - Approval gaps are flagged before production deployment
        - Emergency or exception approval paths are not used without justification
    """,
}


def build_domain_user_prompt(domain: str, s: SubmissionPayload) -> str:
    return f"""Evaluate the "{domain.replace('_', ' ').title()}" compliance domain for this submission.

Feature Name: {s.feature_name}
Type: {s.feature_type}
Description: {s.description}
Intended Use: {s.intended_use}
Affected Systems: {', '.join(s.affected_systems)}
Data Sources: {s.data_sources}
PII Involved: {s.pii_involved}
Third-Party Dependencies: {s.third_party_deps or 'None stated'}
Existing Risk Notes: {s.existing_risk_assessment or 'None provided'}
Jurisdictions: {', '.join(s.jurisdiction)}
Compliance Targets: {', '.join(s.compliance_targets) if s.compliance_targets else 'None stated'}

Return a JSON array of compliance findings for this domain only. Include missing
controls, missing documentation, missing approvals, and audit evidence gaps.
Return [] if no issues found."""
