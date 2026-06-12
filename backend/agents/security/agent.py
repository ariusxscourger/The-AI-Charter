from agents.base_agent import BaseGovernanceAgent
from shared.schemas import SubmissionPayload, Finding
from agents.security.evaluator import evaluate_all_domains
from agents.security.prompts import REASONING_PROMPT

class SecurityAgent(BaseGovernanceAgent):
    AGENT_ID = "security"
    AGENT_NAME = "Security Agent"
    AGENT_EMOJI = "🔒"
    DOMAIN_DESCRIPTION = "attack surface, data handling, authentication, abuse risks, and model output safety"

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        """Run all 7 security domain evaluations in parallel via Featherless.ai."""
        return await evaluate_all_domains(submission, self.llm)

    def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        """
        Deterministic vote rules. LLM is NOT involved in the vote decision.
        Applied in order — first matching rule wins.
        """
        severities = [f.severity for f in findings]

        if "critical" in severities:
            vote, confidence = "reject", "high"
        elif severities.count("high") >= 2:
            vote, confidence = "reject", "high"
        elif "high" in severities:
            vote, confidence = "flag", "high"
        elif severities.count("medium") >= 3 and submission.pii_involved == "yes":
            vote, confidence = "flag", "medium"
        elif severities:
            vote, confidence = "approve", "medium"
        else:
            # No findings at all — always surface something, so flag confidence low
            vote, confidence = "approve", "low"

        reasoning = self._generate_reasoning_sync(findings, vote, submission)
        return vote, confidence, reasoning

    def _generate_reasoning_sync(self, findings, vote, submission) -> str:
        """
        Short synchronous LLM call to produce the 3–6 sentence narrative.
        This is the ONLY LLM call not in evaluate() — it summarises, it doesn't decide.
        """
        # Build a brief findings summary for the prompt
        summary = "; ".join([f"[{f.severity}] {f.title}" for f in findings[:5]])
        prompt_user = (
            f"Feature: {submission.feature_name}\n"
            f"Security findings: {summary if summary else 'None identified'}\n"
            f"Vote: {vote.upper()}\n\n"
            "Write a 3–6 sentence reasoning narrative explaining this vote. "
            "Be specific. Reference the actual findings. Do not use bullet points."
        )
        import asyncio
        return asyncio.run(self.llm.complete(REASONING_PROMPT, prompt_user))
