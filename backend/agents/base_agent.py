from shared.schemas import SubmissionPayload, Finding
from shared.llm_client import LLMClient
from shared.cross_exam_prompts import build_cross_exam_prompt, parse_challenge

class BaseGovernanceAgent:
    AGENT_ID: str        # Override: "security", "ethics", etc.
    AGENT_NAME: str      # Override: "Security Agent", etc.
    AGENT_EMOJI: str     # Override: "🔒", "⚖️", etc.
    DOMAIN_DESCRIPTION: str  # Override: one-line domain summary for cross-exam prompt

    def __init__(self, band_client, llm_client: LLMClient):
        self.band = band_client
        self.llm = llm_client

    # ─── Main lifecycle ───────────────────────────────────────────────────────

    async def run(self, room_id: str, submission: SubmissionPayload):
        await self._join(room_id)
        await self._post_status(room_id, "reviewing")

        findings = await self.evaluate(submission)          # subclass implements
        await self._post_findings(room_id, findings)

        await self._cross_examine(room_id)

        vote, confidence, reasoning = self._determine_vote(findings, submission)  # subclass implements
        await self._post_vote(room_id, vote, confidence, reasoning, findings)

    # ─── To be implemented by subclasses ─────────────────────────────────────

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        raise NotImplementedError

    def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        # Returns (vote, confidence, reasoning)
        raise NotImplementedError

    # ─── Band messaging helpers ───────────────────────────────────────────────

    async def _join(self, room_id: str):
        await self.band.rooms.join(room_id, agent_id=self.AGENT_ID)

    async def _post_status(self, room_id: str, status: str):
        await self.band.rooms.post_message(
            room_id=room_id,
            role=self.AGENT_ID,
            type="status_update",
            content={"status": status, "agent": self.AGENT_NAME, "emoji": self.AGENT_EMOJI}
        )

    async def _post_findings(self, room_id: str, findings: list[Finding]):
        await self.band.rooms.post_message(
            room_id=room_id,
            role=self.AGENT_ID,
            type="findings",
            content={
                "agent": self.AGENT_NAME,
                "emoji": self.AGENT_EMOJI,
                "findings": [f.model_dump() for f in findings]
            }
        )

    async def _post_vote(self, room_id, vote, confidence, reasoning, findings):
        await self.band.rooms.post_message(
            room_id=room_id,
            role=self.AGENT_ID,
            type="vote",
            content={
                "agent": self.AGENT_NAME,
                "emoji": self.AGENT_EMOJI,
                "vote": vote,
                "confidence": confidence,
                "reasoning": reasoning,
                "findings": [f.model_dump() for f in findings]
            }
        )

    # ─── Cross-examination ────────────────────────────────────────────────────

    async def _cross_examine(self, room_id: str):
        """
        Read peer findings from the Band room.
        If a challenge is warranted, post it.
        This is genuine agent-to-agent communication through Band.
        """
        all_messages = await self.band.rooms.get_messages(
            room_id=room_id,
            type_filter="findings"
        )
        peer_messages = [m for m in all_messages if m.role != self.AGENT_ID]

        if not peer_messages:
            return  # No peers have posted findings yet — skip cross-exam

        system, user = build_cross_exam_prompt(
            this_agent=self.AGENT_NAME,
            this_domain=self.DOMAIN_DESCRIPTION,
            peer_messages=peer_messages
        )
        raw = await self.llm.complete(system, user)
        challenge = parse_challenge(raw)

        if challenge and challenge.get("should_challenge"):
            await self.band.rooms.post_message(
                room_id=room_id,
                role=self.AGENT_ID,
                type="challenge",
                content={
                    "from_agent": self.AGENT_NAME,
                    "to_agent": challenge["target_agent"],
                    "finding_title": challenge["finding_title"],
                    "challenge": challenge["challenge"],
                    "counter_position": challenge["your_counter_position"]
                }
            )
