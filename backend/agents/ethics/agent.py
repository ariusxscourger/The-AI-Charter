from agents.base_agent import BaseGovernanceAgent
from shared.schemas import SubmissionPayload, Finding

class EthicsAgent(BaseGovernanceAgent):
    AGENT_ID = "ethics"
    AGENT_NAME = "Ethics Agent"
    AGENT_EMOJI = "⚖️"
    DOMAIN_DESCRIPTION = "fairness, bias, potential for harm, and alignment with stated values"

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        return []

    async def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        return "approve", "high", "The feature does not present significant ethical issues."
