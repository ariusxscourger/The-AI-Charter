from agents.base_agent import BaseGovernanceAgent
from shared.schemas import SubmissionPayload, Finding
from agents.product.evaluator import evaluate_product_risks
from agents.product.prompts import REASONING_PROMPT

class ProductAgent(BaseGovernanceAgent):
    AGENT_ID = "product"
    AGENT_NAME = "Product Agent"
    AGENT_EMOJI = "🚀"
    DOMAIN_DESCRIPTION = "user impact, UX implications, and business rationale"

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        return await evaluate_product_risks(submission, self.llm)

    async def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        severities = [f.severity for f in findings]

        if "critical" in severities:
            vote, confidence = "reject", "high"
        elif severities.count("high") >= 2:
            vote, confidence = "reject", "high"
        elif "high" in severities and severities.count("medium") >= 2:
            vote, confidence = "reject", "high"
        elif "high" in severities:
            vote, confidence = "flag", "high"
        elif severities.count("medium") >= 4:
            vote, confidence = "flag", "high"
        elif severities.count("medium") >= 2 and submission.pii_involved == "yes":
            vote, confidence = "flag", "medium"
        elif severities:
            vote, confidence = "approve", "medium"
        else:
            vote, confidence = "approve", "low"

        reasoning = await self._generate_reasoning(findings, vote, submission)
        return vote, confidence, reasoning

    async def _generate_reasoning(self, findings, vote, submission) -> str:
        summary = "; ".join([f"[{f.severity}] {f.title}" for f in findings[:5]])
        prompt_user = (
            f"Feature: {submission.feature_name}\n"
            f"Product findings: {summary if summary else 'None identified'}\n"
            f"Vote: {vote.upper()}\n\n"
            "Write a 3–6 sentence reasoning narrative explaining this vote. "
            "Reference user impact, UX, rollout readiness, and measurable outcomes. "
            "Do not use bullet points."
        )
        try:
            return await self.llm.complete(REASONING_PROMPT, prompt_user)
        except Exception as exc:
            return f"Product evaluation concluded with vote {vote.upper()}. Identified {len(findings)} findings. Fallback reasoning due to LLM error: {exc}."
