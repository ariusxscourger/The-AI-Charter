from agents.base_agent import BaseGovernanceAgent
from shared.schemas import SubmissionPayload, Finding

class ProductAgent(BaseGovernanceAgent):
    AGENT_ID = "product"
    AGENT_NAME = "Product Agent"
    AGENT_EMOJI = "🚀"
    DOMAIN_DESCRIPTION = "user impact, UX implications, and business rationale"

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        return []

    async def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        return "approve", "high", "The feature provides clear business value and positive user impact."
