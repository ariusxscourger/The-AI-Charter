from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


class SubmissionPayload(BaseModel):
    feature_name: str
    description: str
    intended_use: str
    feature_type: Literal[
        "new_feature", "model_change", "prompt_change", "integration", "other"
    ]
    affected_systems: list[str]
    data_sources: str
    pii_involved: Literal["yes", "no", "unknown"]
    third_party_deps: Optional[str] = None
    existing_risk_assessment: Optional[str] = None
    jurisdiction: list[str]
    compliance_targets: Optional[list[str]] = None


class Finding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    domain: str                            # Which evaluation domain produced this
    severity: Literal["critical", "high", "medium", "low", "info"]
    title: str                             # Short, specific — max 80 chars
    detail: str                            # 2–5 sentence explanation
    recommendation: Optional[str] = None  # Concrete mitigation step


class AgentRecord(BaseModel):
    agent_id: str
    agent_name: str
    agent_emoji: str
    vote: Literal["approve", "reject", "flag"]
    confidence: Literal["high", "medium", "low"]
    reasoning: str
    findings: list[Finding]
    completed_at: str


class CrossExamEntry(BaseModel):
    timestamp: str
    from_agent: str
    to_agent: str
    challenge: str
    counter_position: str


class GovernanceRecord(BaseModel):
    reference_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:12].upper())
    session_id: str
    feature_name: str
    created_at: str
    completed_at: str
    verdict: Literal["approved", "rejected", "conditional_approval", "human_review_required"]
    conditions: Optional[list[str]] = None
    submission: SubmissionPayload
    agent_records: list[AgentRecord]
    cross_examination_log: list[CrossExamEntry] = []
