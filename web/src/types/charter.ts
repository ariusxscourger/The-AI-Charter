export type SubmissionPayload = {
  featureName: string
  description: string
  intendedUse: string
  featureType: "new_feature" | "model_change" | "prompt_change" | "integration" | "other"
  affectedSystems: string[]
  dataSources: string
  piiInvolved: "yes" | "no" | "unknown"
  thirdPartyDeps?: string
  existingRiskAssessment?: string
  jurisdiction: string[]
  complianceTargets?: string[]
}

export type Vote = "approve" | "reject" | "flag"
export type Severity = "critical" | "high" | "medium" | "low" | "info"
export type AgentStatus = "pending" | "reviewing" | "voted"
export type Verdict = "approved" | "rejected" | "conditional_approval" | "human_review_required"
export type Confidence = "high" | "medium" | "low"

export type Finding = {
  id: string
  domain: string
  severity: Severity
  title: string
  detail: string
  recommendation?: string
}

export type SessionStatus = {
  sessionId: string
  featureName: string
  status: "pending" | "reviewing" | "complete" | "error"
  agents: {
    id: string
    name: string
    emoji: string
    status: AgentStatus
    vote?: Vote
  }[]
  activityFeed: {
    timestamp: string
    agentId: string
    message: string
  }[]
}

export type AgentRecord = {
  agentId: string
  name: string
  emoji: string
  vote: Vote
  confidence: Confidence
  reasoning: string
  findings: Finding[]
  completedAt: string
}

export type CrossExamEntry = {
  timestamp: string
  fromAgent: string
  toAgent: string
  challenge: string
  counterPosition: string
}

export type GovernanceRecord = {
  referenceId: string
  sessionId: string
  featureName: string
  createdAt: string
  completedAt: string
  verdict: Verdict
  conditions?: string[]
  submission: SubmissionPayload
  agentRecords: AgentRecord[]
  crossExaminationLog: CrossExamEntry[]
}
