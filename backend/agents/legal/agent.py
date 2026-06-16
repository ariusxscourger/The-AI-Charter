from agents.base_agent import BaseGovernanceAgent
from shared.schemas import SubmissionPayload, Finding
from agents.legal.evaluator import evaluate_all_domains
from agents.legal.prompts import REASONING_PROMPT


class LegalAgent(BaseGovernanceAgent):
    AGENT_ID = "legal"
    AGENT_NAME = "Legal Agent"
    AGENT_EMOJI = "📜"
    DOMAIN_DESCRIPTION = "regulatory exposure, IP concerns, privacy obligations, contractual terms, and jurisdictional requirements"

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        """Run legal domain evaluations and deterministic artifact checks."""
        return await evaluate_all_domains(submission, self.llm)

    async def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        """
        Deterministic legal vote rules. LLM is used only for narrative
        reasoning, never to decide the vote.
        """
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
        elif len(submission.jurisdiction) > 2 and "medium" in severities:
            vote, confidence = "flag", "medium"
        elif severities:
            vote, confidence = "approve", "medium"
        else:
            vote, confidence = "approve", "low"

        reasoning = await self._generate_reasoning(findings, vote, submission)
        return vote, confidence, reasoning

    async def _generate_reasoning(self, findings, vote, submission) -> str:
        summary = "; ".join([f"[{f.domain}:{f.severity}] {f.title}" for f in findings[:6]])
        prompt_user = (
            f"Feature: {submission.feature_name}\n"
            f"Jurisdictions: {', '.join(submission.jurisdiction)}\n"
            f"PII involved: {submission.pii_involved}\n"
            f"Compliance targets: {', '.join(submission.compliance_targets) if submission.compliance_targets else 'None stated'}\n"
            f"Legal findings: {summary if summary else 'None identified'}\n"
            f"Vote: {vote.upper()}\n\n"
            "Write a 3-6 sentence legal reasoning narrative. Be specific about "
            "privacy, IP, jurisdictional obligations, vendor terms, and required "
            "approvals or artifacts. Do not use bullet points."
        )
        try:
            return await self.llm.complete(REASONING_PROMPT, prompt_user)
        except Exception as exc:
            return f"Legal evaluation concluded with vote {vote.upper()}. Identified {len(findings)} findings. Fallback reasoning due to LLM error: {exc}."
