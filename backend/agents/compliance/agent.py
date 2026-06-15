from agents.base_agent import BaseGovernanceAgent
from shared.schemas import SubmissionPayload, Finding
from agents.compliance.evaluator import evaluate_all_domains
from agents.compliance.prompts import REASONING_PROMPT

class ComplianceAgent(BaseGovernanceAgent):
    AGENT_ID = "compliance"
    AGENT_NAME = "Compliance Agent"
    AGENT_EMOJI = "✅"
    DOMAIN_DESCRIPTION = "internal policy compliance, standards coverage, audit evidence, governance completeness, and required approvals"

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        """Run compliance control evaluations and deterministic artifact checks."""
        return await evaluate_all_domains(submission, self.llm)

    async def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        """
        Deterministic compliance vote rules. LLM is used only for narrative
        reasoning, never to decide the vote.
        """
        severities = [f.severity for f in findings]
        missing_control_domains = {
            f.domain for f in findings
            if f.domain in {"policy_checklist", "standards_coverage", "documentation_artifacts", "governance_completeness", "required_approvals"}
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
        elif len(missing_control_domains) >= 3:
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
            f"Jurisdictions: {', '.join(submission.jurisdiction)}\n"
            f"Compliance targets: {', '.join(submission.compliance_targets) if submission.compliance_targets else 'None stated'}\n"
            f"PII involved: {submission.pii_involved}\n"
            f"Compliance findings: {summary if summary else 'None identified'}\n"
            f"Vote: {vote.upper()}\n\n"
            "Write a 3-6 sentence compliance reasoning narrative. Be specific about "
            "policy checklist coverage, audit evidence, missing controls, governance "
            "artifacts, standards, and approvals. Do not use bullet points."
        )
        try:
            return await self.llm.complete(REASONING_PROMPT, prompt_user)
        except Exception as exc:
            return f"Compliance evaluation concluded with vote {vote.upper()}. Identified {len(findings)} findings. Fallback reasoning due to LLM error: {exc}."
