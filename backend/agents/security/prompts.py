from shared.schemas import SubmissionPayload

SYSTEM_PROMPT = """You are the Security Agent on an AI governance review panel.
Your job is to evaluate AI feature proposals for security risks in one specific domain.
Domain: {domain_label}
Evaluation criteria:
{domain_criteria}

Respond ONLY with a valid JSON array of findings. No preamble, no explanation outside the JSON.
If no issues are found, return an empty array: []

Each finding must have exactly these fields:
- "severity": one of "critical", "high", "medium", "low", "info"
- "title": short specific finding title, max 80 characters
- "detail": 2-5 sentence explanation of the risk
- "recommendation": concrete mitigation step (optional, include when you have one)"""

REASONING_PROMPT = """You are the Security Agent. Write a concise reasoning narrative
for your governance vote. Be specific — reference actual findings. 3–6 sentences. No bullets."""

DOMAIN_CRITERIA = {
    "data_handling": """
        - Unencrypted storage or transmission of sensitive data
        - PII collected beyond what is necessary (data minimization violations)
        - Unclear data retention or deletion policy
        - Data shared with third parties without explicit disclosure
        - Lack of user consent mechanisms where required by law
    """,
    "attack_surface": """
        - Prompt injection: can a user manipulate model behavior through inputs?
        - Adversarial inputs: can crafted inputs cause unexpected model outputs?
        - New API endpoints or input fields that are not validated
        - Indirect injection through external data sources (RAG, browsing, tool calls)
        - Model output used in downstream execution (code eval, SQL, shell commands)
    """,
    "abuse_misuse": """
        - Missing or insufficient rate limiting
        - Potential for automated abuse at scale (bots, scrapers)
        - Feature that could be weaponized against other users
        - Output that could be used for spam, phishing, or disinformation
        - Cost amplification: abuse resulting in disproportionate compute or API cost
    """,
    "auth_authorization": """
        - Missing authentication requirements on new endpoints
        - Insufficient authorization checks (user A accessing user B's data)
        - Privilege escalation: unprivileged users triggering privileged actions
        - IDOR (insecure direct object reference) risks
        - Token or session handling weaknesses
    """,
    "third_party_deps": """
        - External APIs receiving sensitive data without DPA or contractual protections
        - Dependencies with poor security track records or no disclosure policy
        - Single points of failure introduced in critical paths
        - AI model providers receiving user data without data processing agreements
        - Open-source packages with unreviewed supply chain risk
    """,
    "logging_monitoring": """
        - No audit log for feature actions (especially sensitive operations)
        - PII or secrets logged in plain text
        - No alerting on anomalous usage patterns
        - Silent failures (no error surface, no trace)
        - Missing correlation IDs that would impede forensics
    """,
    "model_output_safety": """
        - Raw model output displayed to users without filtering or guardrails
        - Model output used in high-stakes decisions without human review
        - Hallucination risk in consequential use cases
        - Output format interpretable as executable code, HTML injection, or SQL
        - Lack of output validation or post-processing safety checks
    """,
}


def build_domain_user_prompt(domain: str, s: SubmissionPayload) -> str:
    return f"""Evaluate the "{domain.replace('_', ' ').title()}" security domain for this submission.

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

Return a JSON array of findings for this domain only. Return [] if no issues found."""
