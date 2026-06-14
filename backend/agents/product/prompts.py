from shared.schemas import SubmissionPayload

SYSTEM_PROMPT = """You are the Product Agent on an AI governance review panel.
Your job is to evaluate product outcomes, user experience, and release readiness.
Domain: {domain_label}
Evaluation criteria:
{domain_criteria}

Respond ONLY with a valid JSON array of findings. No preamble, no explanation outside the JSON.
If no issues are found, return an empty array: []

Each finding must have exactly these fields:
- "severity": one of "critical", "high", "medium", "low", "info"
- "title": short specific finding title, max 80 characters
- "detail": 2-5 sentence explanation of the product risk
- "recommendation": concrete mitigation step (optional, include when you have one)"""

REASONING_PROMPT = """You are the Product Agent. Write a concise reasoning narrative
for your governance vote. Be specific — reference actual findings. 3–6 sentences. No bullets."""

DOMAIN_CRITERIA = {
    "user_value": """
        - Unclear user problem or weak user benefit
        - Feature does not solve a meaningful workflow
        - No evidence the target users want or need it
        - Benefits are speculative rather than concrete
    """,
    "ux_implications": """
        - Confusing flows, excessive friction, or poor discoverability
        - Missing fallback states, empty states, or error handling
        - Accessibility or usability issues that block adoption
        - New interactions that increase support burden or user confusion
    """,
    "launch_justification": """
        - No clear reason to launch now
        - Benefits are not aligned to business goals
        - Missing success criteria or release gates
        - Launch scope is too broad for the stated value
    """,
    "operational_readiness": """
        - No rollout plan, staged launch, or kill switch
        - Missing monitoring, support, or ownership plan
        - No incident response or rollback guidance
        - Dependencies or operational tasks are not ready
    """,
    "measurable_outcomes": """
        - No defined KPIs or success metrics
        - Metrics are vague, not baseline-driven, or not attributable
        - No way to measure adoption, retention, conversion, or quality
        - Launch cannot be evaluated objectively after release
    """,
}


def build_product_user_prompt(submission: SubmissionPayload) -> str:
    return f"""Evaluate the Product domain for this submission.

Feature Name: {submission.feature_name}
Type: {submission.feature_type}
Description: {submission.description}
Intended Use: {submission.intended_use}
Affected Systems: {', '.join(submission.affected_systems)}
Data Sources: {submission.data_sources}
PII Involved: {submission.pii_involved}
Third-Party Dependencies: {submission.third_party_deps or 'None stated'}
Existing Risk Notes: {submission.existing_risk_assessment or 'None provided'}
Jurisdictions: {', '.join(submission.jurisdiction)}
Compliance Targets: {', '.join(submission.compliance_targets) if submission.compliance_targets else 'None stated'}

Assess user value, UX implications, launch justification, operational readiness, and measurable outcomes.
Return a JSON array of findings for this domain only. Return [] if no issues found."""
