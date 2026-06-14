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

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "feature_name": "Smart Customer Support Router",
                    "description": "An AI-powered agent that classifies incoming customer support tickets, routes them to the correct department, and drafts suggested responses.",
                    "intended_use": "Automate sorting and draft generation for support teams globally.",
                    "feature_type": "new_feature",
                    "affected_systems": ["ZenDesk Ticket System", "Internal Customer Database", "Slack Alert Webhooks"],
                    "data_sources": "Zendesk customer history, past support emails, and CRM profiles.",
                    "pii_involved": "yes",
                    "third_party_deps": "OpenAI API (GPT-4o), Salesforce CRM SDK",
                    "existing_risk_assessment": "Completed security review for OpenAI enterprise agreement; data sharing policies updated.",
                    "jurisdiction": ["US", "EU", "CA"],
                    "compliance_targets": ["GDPR", "CCPA", "SOC2"]
                }
            ]
        }
    }


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

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "reference_id": "GOV-8F3D7C9A",
                    "session_id": "room_12345678",
                    "feature_name": "Smart Customer Support Router",
                    "created_at": "2026-06-14T11:00:00Z",
                    "completed_at": "2026-06-14T11:42:00Z",
                    "verdict": "conditional_approval",
                    "conditions": [
                        "Ensure all customer data is pseudonymized before sending to OpenAI APIs.",
                        "Add a human-in-the-loop review step for any tickets classified under legal or billing."
                    ],
                    "submission": {
                        "feature_name": "Smart Customer Support Router",
                        "description": "An AI-powered agent that classifies incoming customer support tickets, routes them to the correct department, and drafts suggested responses.",
                        "intended_use": "Automate sorting and draft generation for support teams globally.",
                        "feature_type": "new_feature",
                        "affected_systems": ["ZenDesk Ticket System", "Internal Customer Database", "Slack Alert Webhooks"],
                        "data_sources": "Zendesk customer history, past support emails, and CRM profiles.",
                        "pii_involved": "yes",
                        "third_party_deps": "OpenAI API (GPT-4o), Salesforce CRM SDK",
                        "existing_risk_assessment": "Completed security review for OpenAI enterprise agreement; data sharing policies updated.",
                        "jurisdiction": ["US", "EU", "CA"],
                        "compliance_targets": ["GDPR", "CCPA", "SOC2"]
                    },
                    "agent_records": [
                        {
                            "agent_id": "security",
                            "agent_name": "Security Agent",
                            "agent_emoji": "🔒",
                            "vote": "approve",
                            "confidence": "high",
                            "reasoning": "The data transit routes are TLS encrypted and OpenAI enterprise APIs are configured not to train on submitted customer data.",
                            "findings": [],
                            "completed_at": "2026-06-14T11:15:00Z"
                        },
                        {
                            "agent_id": "ethics",
                            "agent_name": "Ethics Agent",
                            "agent_emoji": "⚖️",
                            "vote": "flag",
                            "confidence": "medium",
                            "reasoning": "High risk of bias if responses to sensitive customer categories (such as complaints or legal claims) are fully automated without human oversight.",
                            "findings": [
                                {
                                    "id": "ETH-01",
                                    "domain": "ethics",
                                    "severity": "high",
                                    "title": "Automated responses to high-sensitivity tickets",
                                    "detail": "Drafting responses for legal complaints or service termination without human review can cause legal liabilities or customer frustration.",
                                    "recommendation": "Enforce human-in-the-loop review for all legal, compliance, and billing-related support tickets."
                                }
                            ],
                            "completed_at": "2026-06-14T11:22:00Z"
                        }
                    ],
                    "cross_examination_log": [
                        {
                            "timestamp": "2026-06-14T11:20:00Z",
                            "from_agent": "ethics",
                            "to_agent": "product",
                            "challenge": "How will you ensure sensitive support queries are not processed automatically?",
                            "counter_position": "We will implement a routing layer that filters tickets containing keywords related to compliance or billing to human agents directly."
                        }
                    ]
                }
            ]
        }
    }


class SubmitResponse(BaseModel):
    sessionId: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "sessionId": "room_12345678"
                }
            ]
        }
    }


class AgentStatus(BaseModel):
    id: str
    name: str
    emoji: str
    status: str
    vote: Optional[str] = None


class ActivityFeedEntry(BaseModel):
    timestamp: str
    agentId: str
    message: str


class StatusResponse(BaseModel):
    sessionId: str
    featureName: str
    status: Literal["complete", "reviewing"]
    agents: list[AgentStatus]
    activityFeed: list[ActivityFeedEntry]

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "sessionId": "room_12345678",
                    "featureName": "Smart Customer Support Router",
                    "status": "reviewing",
                    "agents": [
                        {"id": "security", "name": "Security Agent", "emoji": "🔒", "status": "voted", "vote": "approve"},
                        {"id": "ethics", "name": "Ethics Agent", "emoji": "⚖️", "status": "pending", "vote": None}
                    ],
                    "activityFeed": [
                        {"timestamp": "2026-06-14T11:42:00Z", "agentId": "security", "message": "voted APPROVE with high confidence"}
                    ]
                }
            ]
        }
    }
