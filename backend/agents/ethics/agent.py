from agents.base_agent import BaseGovernanceAgent
from shared.schemas import SubmissionPayload, Finding
from agents.ethics.evaluator import evaluate_ethics_risks
from agents.ethics.prompts import REASONING_PROMPT

class EthicsAgent(BaseGovernanceAgent):
    AGENT_ID = "ethics"
    AGENT_NAME = "Ethics Agent"
    AGENT_EMOJI = "⚖️"
    DOMAIN_DESCRIPTION = "fairness, bias, potential for harm, and alignment with stated values"

    def __init__(self, band_client, llm_client, deterministic: bool = False):
        super().__init__(band_client, llm_client)
        self.deterministic = deterministic

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        return await evaluate_ethics_risks(
            submission,
            self.llm,
            deterministic=self.deterministic,
        )

    async def evaluate_structured(self, submission: SubmissionPayload) -> dict:
        """
        Standalone ethics evaluation shape for future adversarial review flows.
        The live governance record still uses BaseGovernanceAgent._post_vote.
        """
        findings = await self.evaluate(submission)
        vote, confidence, reasoning = await self._determine_vote(findings, submission)
        return {
            "vote": self._external_vote(vote),
            "confidence": self._confidence_score(confidence),
            "reasoning": self._reasoning_trail(reasoning, findings),
            "identified_risks": [finding.model_dump() for finding in findings],
            "required_mitigations": [
                finding.recommendation for finding in findings
                if finding.recommendation
            ],
        }

    async def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        """
        Deterministic ethics vote rules. LLM is used only for the narrative
        reasoning trail, never to decide the vote.
        """
        severities = [f.severity for f in findings]
        ethics_domains = {
            f.domain for f in findings
            if f.domain in {
                "fairness_demographic_impact",
                "bias_risk",
                "foreseeable_harm",
                "misuse_scenarios",
                "principles_alignment",
            }
            and f.severity in {"critical", "high", "medium"}
        }

        if "critical" in severities:
            vote, confidence = "reject", "high"
        elif severities.count("high") >= 2:
            vote, confidence = "reject", "high"
        elif "high" in severities and severities.count("medium") >= 2:
            vote, confidence = "reject", "high"
        elif "high" in severities:
            vote, confidence = "flag", "high"
        elif len(ethics_domains) >= 3:
            vote, confidence = "flag", "high"
        elif severities.count("medium") >= 2:
            vote, confidence = "flag", "medium"
        elif severities:
            vote, confidence = "approve", "medium"
        else:
            vote, confidence = "approve", "high"

        reasoning = await self._generate_reasoning(findings, vote, submission)
        return vote, confidence, reasoning

    async def _generate_reasoning(self, findings, vote, submission) -> str:
        summary = "; ".join([f"[{f.domain}:{f.severity}] {f.title}" for f in findings[:6]])
        prompt_user = (
            f"Feature: {submission.feature_name}\n"
            f"Intended use: {submission.intended_use}\n"
            f"PII involved: {submission.pii_involved}\n"
            f"Ethics findings: {summary if summary else 'None identified'}\n"
            f"Vote: {vote.upper()}\n\n"
            "Write a 3-6 sentence ethics reasoning narrative. Be specific about "
            "fairness, demographic impact, bias, foreseeable harm, misuse, "
            "human oversight, and principles alignment. Do not use bullet points."
        )
        try:
            return await self.llm.complete(REASONING_PROMPT, prompt_user)
        except Exception as exc:
            return f"Ethics evaluation concluded with vote {vote.upper()}. Identified {len(findings)} findings. Fallback reasoning due to LLM error: {exc}."

    @staticmethod
    def _external_vote(vote: str) -> str:
        return {
            "approve": "APPROVE",
            "reject": "REJECT",
            "flag": "HUMAN_REVIEW",
        }.get(vote, "HUMAN_REVIEW")

    @staticmethod
    def _confidence_score(confidence: str) -> float:
        return {
            "high": 0.9,
            "medium": 0.65,
            "low": 0.35,
        }.get(confidence, 0.0)

    @staticmethod
    def _reasoning_trail(reasoning: str, findings: list[Finding]) -> list[str]:
        trail = [reasoning]
        trail.extend(
            f"{finding.domain}:{finding.severity} - {finding.title}"
            for finding in findings
        )
        return trail
