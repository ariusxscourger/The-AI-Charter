from shared.schemas import GovernanceRecord, AgentRecord, CrossExamEntry, Finding, SubmissionPayload
import uuid
from datetime import datetime

async def generate_record(session_id: str, band_client) -> GovernanceRecord:
    """
    Reads the full Band room transcript and compiles the governance record.
    The room IS the audit trail. This structures it.
    """
    all_messages = await band_client.rooms.get_messages(session_id)
    if not all_messages:
        raise ValueError(f"No messages found for session {session_id}")

    # Extract typed message groups
    submission_msg = next((m for m in all_messages if m.type == "submission_context"), None)
    vote_msgs      = [m for m in all_messages if m.type == "vote"]
    challenge_msgs = [m for m in all_messages if m.type == "challenge"]

    if not submission_msg:
        raise ValueError("No submission context found in room")

    submission = SubmissionPayload(**submission_msg.content)
    agent_records = [_build_agent_record(m) for m in vote_msgs]
    verdict = _determine_verdict([r.vote for r in agent_records])
    conditions = _extract_conditions(agent_records, verdict)

    # Reconstruct timestamps
    created_at = submission_msg.timestamp or datetime.utcnow().isoformat()
    completed_at = all_messages[-1].timestamp or datetime.utcnow().isoformat()

    return GovernanceRecord(
        reference_id=str(uuid.uuid4())[:12].upper(),
        session_id=session_id,
        feature_name=submission.feature_name,
        created_at=created_at,
        completed_at=completed_at,
        verdict=verdict,
        conditions=conditions,
        submission=submission,
        agent_records=agent_records,
        cross_examination_log=[_build_cross_exam_entry(m) for m in challenge_msgs]
    )

def _determine_verdict(votes: list[str]) -> str:
    """Deterministic. No LLM."""
    if not votes:
        return "human_review_required"
    if any(v == "reject" for v in votes):
        return "rejected"
    if all(v == "approve" for v in votes):
        return "approved"
    if votes.count("flag") >= len(votes) // 2:
        return "human_review_required"
    return "conditional_approval"

def _build_agent_record(msg) -> AgentRecord:
    c = msg.content
    completed_at = msg.timestamp or datetime.utcnow().isoformat()
    return AgentRecord(
        agent_id=msg.role,
        agent_name=c["agent"],
        agent_emoji=c["emoji"],
        vote=c["vote"],
        confidence=c["confidence"],
        reasoning=c["reasoning"],
        findings=[Finding(**f) for f in c.get("findings", [])],
        completed_at=completed_at
    )

def _build_cross_exam_entry(msg) -> CrossExamEntry:
    c = msg.content
    timestamp = msg.timestamp or datetime.utcnow().isoformat()
    return CrossExamEntry(
        timestamp=timestamp,
        from_agent=c["from_agent"],
        to_agent=c["to_agent"],
        challenge=c["challenge"],
        counter_position=c["counter_position"]
    )

def _extract_conditions(agent_records: list[AgentRecord], verdict: str) -> list[str] | None:
    """Extract recommended mitigations from high/medium findings when verdict is conditional."""
    if verdict not in ("conditional_approval", "human_review_required"):
        return None
    conditions = []
    for record in agent_records:
        for finding in record.findings:
            if finding.severity in ("high", "medium") and finding.recommendation:
                conditions.append(f"[{record.agent_name}] {finding.recommendation}")
    return conditions or None
