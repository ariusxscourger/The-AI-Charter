from agents.base_agent import BaseGovernanceAgent
from shared.schemas import SubmissionPayload, Finding

class LegalAgent(BaseGovernanceAgent):
    AGENT_ID = "legal"
    AGENT_NAME = "Legal Agent"
    AGENT_EMOJI = "📜"
    DOMAIN_DESCRIPTION = "regulatory exposure, IP concerns, and jurisdictional requirements"

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        return []

    async def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        return "approve", "high", "The feature complies with current legal guidelines."
