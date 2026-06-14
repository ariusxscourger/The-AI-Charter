from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


class SubmissionPayload(BaseModel):
    feature_name: str = Field(..., description="The name of the feature or project being submitted for governance review.")
    description: str = Field(..., description="Detailed explanation of what the feature does and how it operates.")
    intended_use: str = Field(..., description="The main business purpose or goal of the proposed AI system.")
    feature_type: Literal[
        "new_feature", "model_change", "prompt_change", "integration", "other"
    ] = Field(..., description="The operational type classification of the changes.")
    affected_systems: list[str] = Field(..., description="List of internal or external systems integrated with or affected by this feature.")
    data_sources: str = Field(..., description="Description of the datasets, data feeds, or APIs supplying data to the system.")
    pii_involved: Literal["yes", "no", "unknown"] = Field(..., description="Indication of whether Personally Identifiable Information (PII) is processed.")
    third_party_deps: Optional[str] = Field(None, description="Any third-party APIs, libraries, or external vendor integrations utilized.")
    existing_risk_assessment: Optional[str] = Field(None, description="Reference to any existing risk reviews, security assessments, or compliance audits.")
    jurisdiction: list[str] = Field(..., description="Geographical territories or legal jurisdictions where this feature will be deployed.")
    compliance_targets: Optional[list[str]] = Field(None, description="Regulatory frameworks or compliance standards targeted (e.g. GDPR, CCPA, SOC2).")

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
    id: str = Field(
        default_factory=lambda: str(uuid.uuid4())[:8],
        description="A unique, short identifier for the specific finding."
    )
    domain: str = Field(..., description="The evaluator agent domain which flagged this finding (e.g. security, ethics).")
    severity: Literal["critical", "high", "medium", "low", "info"] = Field(..., description="The risk level classification of this finding.")
    title: str = Field(..., description="Concise headline summarizing the concern (maximum 80 characters).")
    detail: str = Field(..., description="A detailed explanation explaining the risks and implications (2-5 sentences).")
    recommendation: Optional[str] = Field(None, description="An actionable mitigation step or remediation plan.")


class AgentRecord(BaseModel):
    agent_id: str = Field(..., description="The unique identifier of the evaluating agent.")
    agent_name: str = Field(..., description="Human-readable name of the agent.")
    agent_emoji: str = Field(..., description="Icon representing the agent.")
    vote: Literal["approve", "reject", "flag"] = Field(..., description="The agent's decision on the proposal.")
    confidence: Literal["high", "medium", "low"] = Field(..., description="The confidence level of the agent's decision.")
    reasoning: str = Field(..., description="Detailed justification explaining the vote decision.")
    findings: list[Finding] = Field(..., description="List of specific issues or findings highlighted by this agent.")
    completed_at: str = Field(..., description="Timestamp indicating when the agent finished evaluation.")


class CrossExamEntry(BaseModel):
    timestamp: str = Field(..., description="Timestamp of the exchange.")
    from_agent: str = Field(..., description="The agent raising the challenge.")
    to_agent: str = Field(..., description="The agent answering the challenge.")
    challenge: str = Field(..., description="The specific question or objection raised.")
    counter_position: str = Field(..., description="The response or defense provided by the target agent.")


class GovernanceRecord(BaseModel):
    reference_id: str = Field(
        default_factory=lambda: str(uuid.uuid4())[:12].upper(),
        description="A globally unique reference code for this finalized record."
    )
    session_id: str = Field(..., description="The unique session ID associated with the Band.ai room.")
    feature_name: str = Field(..., description="The name of the feature under evaluation.")
    created_at: str = Field(..., description="Timestamp indicating when the session was created.")
    completed_at: str = Field(..., description="Timestamp indicating when all evaluations concluded.")
    verdict: Literal["approved", "rejected", "conditional_approval", "human_review_required"] = Field(..., description="The final combined governance decision.")
    conditions: Optional[list[str]] = Field(None, description="Actionable conditions required if conditional approval is granted.")
    submission: SubmissionPayload = Field(..., description="The original submission proposal data.")
    agent_records: list[AgentRecord] = Field(..., description="The individual feedback, reasoning, and findings from each agent.")
    cross_examination_log: list[CrossExamEntry] = Field(default=[], description="Log of interactive debates and challenges between agents.")

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


class UserRegister(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime


class TokenResponse(BaseModel):
    message: str
    user: UserResponse
    token: str

