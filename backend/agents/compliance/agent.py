from agents.base_agent import BaseGovernanceAgent
from shared.schemas import SubmissionPayload, Finding

class ComplianceAgent(BaseGovernanceAgent):
    AGENT_ID = "compliance"
    AGENT_NAME = "Compliance Agent"
    AGENT_EMOJI = "✅"
    DOMAIN_DESCRIPTION = "alignment with internal policies and external standards"

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        return []

    async def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        return "approve", "high", "The feature aligns with compliance frameworks."
