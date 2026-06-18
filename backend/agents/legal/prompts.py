from shared.schemas import SubmissionPayload

SYSTEM_PROMPT = """You are the Legal Agent on an AI governance review panel.
Your job is to evaluate AI feature proposals for legal risk in one specific legal domain.
Domain: {domain_label}
Evaluation criteria:
{domain_criteria}

Respond ONLY with a valid JSON array of findings. No preamble, no explanation outside the JSON.
If no issues are found, return an empty array: []

Each finding must have exactly these fields:
- "severity": one of "critical", "high", "medium", "low", "info"
- "title": short specific finding title, max 80 characters
- "detail": 2-5 sentence explanation of the legal risk or obligation
- "recommendation": concrete legal, contractual, privacy, or governance mitigation step"""

REASONING_PROMPT = """You are the Legal Agent. Write a concise reasoning narrative
for your governance vote. Be specific — reference actual findings, legal obligations,
jurisdictions, IP concerns, and contractual or privacy exposure. 3-6 sentences. No bullets."""

DOMAIN_CRITERIA = {
    "privacy_data_protection": """
        - Lawful basis, notice, consent, and user rights for personal data processing
        - Data minimization, purpose limitation, retention, deletion, and anonymization controls
        - Cross-border transfers, SCCs, DPAs, and localization requirements
        - DPIA or privacy impact assessment needs for sensitive or high-risk processing
        - Privacy notices, opt-out rights, and consent management for regulated jurisdictions
    """,
    "intellectual_property": """
        - Training, fine-tuning, or inference use of copyrighted, licensed, or scraped data
        - Ownership of generated outputs, prompts, datasets, and model artifacts
        - Open-source license compatibility and attribution obligations
        - Trademark, brand, content, or dataset permissions for external sources
        - Risk of reproducing protected material or infringing third-party rights
    """,
    "consumer_protection": """
        - Misleading claims, transparency, or disclosure obligations for AI-generated outputs
        - Human review, appeal, or escalation for consequential user-facing decisions
        - Fairness, accessibility, and non-discrimination exposure in user interactions
        - High-stakes use cases involving credit, housing, employment, health, education, or legal rights
        - Required disclosures for automated decision-making or AI assistance
    """,
    "employment_labor": """
        - Worker monitoring, profiling, productivity scoring, or automated management
        - Employment decisions such as hiring, promotion, discipline, termination, or scheduling
        - Collective bargaining, works council, or employee notice obligations
        - Bias, discrimination, and explainability requirements in HR workflows
        - Documentation of human oversight and appeal rights for affected workers
    """,
    "jurisdictional_compliance": """
        - Jurisdiction-specific privacy, AI, consumer, sectoral, and data transfer obligations
        - Regulatory filings, registrations, impact assessments, or prior consultation needs
        - Conflict between deployment regions or transfer restrictions
        - Local representative, controller/processor, or data residency requirements
        - Evidence that legal obligations have been mapped to concrete controls
    """,
    "contracts_vendor_obligations": """
        - Vendor DPAs, SCCs, BAAs, subprocessors, and data processing restrictions
        - Customer contract commitments, SLAs, confidentiality, and indemnity exposure
        - Procurement, security, privacy, and legal approvals for third-party dependencies
        - Restrictions on model provider training, retention, support access, and logging
        - Contractual notice, audit, breach, and termination obligations
    """,
}


def build_domain_user_prompt(domain: str, s: SubmissionPayload) -> str:
    return f"""Evaluate the "{domain.replace('_', ' ').title()}" legal domain for this submission.

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

Return a JSON array of legal findings for this domain only. Include legal obligations,
contractual exposure, IP concerns, privacy requirements, jurisdiction-specific risks,
and required approvals or documentation. Return [] if no issues found."""
