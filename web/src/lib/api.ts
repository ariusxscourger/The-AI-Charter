import { env } from "@/env"
import type {
  Confidence,
  GovernanceRecord,
  SessionStatus,
  Severity,
  SubmissionPayload,
  Verdict,
  Vote,
} from "@/types/charter"

const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL

// Get authentication headers
function getHeaders(contentType = "application/json"): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const headers: HeadersInit = {}
  if (contentType) {
    headers["Content-Type"] = contentType
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Invalid credentials")
  }
  return res.json()
}

export async function registerApi(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Registration failed")
  }
  return res.json()
}

export async function submitProposal(payload: SubmissionPayload): Promise<{ sessionId: string }> {
  // Convert typescript camelCase back to snake_case for Python FastAPI server model
  const pythonPayload = {
    feature_name: payload.featureName,
    description: payload.description,
    intended_use: payload.intendedUse,
    feature_type: payload.featureType,
    affected_systems: payload.affectedSystems,
    data_sources: payload.dataSources,
    pii_involved: payload.piiInvolved,
    third_party_deps: payload.thirdPartyDeps || null,
    existing_risk_assessment: payload.existingRiskAssessment || null,
    jurisdiction: payload.jurisdiction,
    compliance_targets: payload.complianceTargets || null,
  }

  const res = await fetch(`${API_BASE_URL}/submit`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(pythonPayload),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Proposal submission failed")
  }
  return res.json()
}

export async function getSessionStatus(sessionId: string): Promise<SessionStatus> {
  const res = await fetch(`${API_BASE_URL}/status/${sessionId}`, {
    method: "GET",
    headers: getHeaders(),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to load session status")
  }
  return res.json()
}

export async function getGovernanceRecord(sessionId: string): Promise<GovernanceRecord> {
  const res = await fetch(`${API_BASE_URL}/record/${sessionId}`, {
    method: "GET",
    headers: getHeaders(),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to compile governance record")
  }
  return res.json()
}

export async function saveRecord(record: GovernanceRecord): Promise<{ message: string }> {
  // Translate TS structure back to Python-compliant schema structures
  const pythonRecord = {
    reference_id: record.referenceId,
    session_id: record.sessionId,
    feature_name: record.featureName,
    created_at: record.createdAt,
    completed_at: record.completedAt,
    verdict: record.verdict,
    conditions: record.conditions || null,
    submission: {
      feature_name: record.submission.featureName,
      description: record.submission.description,
      intended_use: record.submission.intendedUse,
      feature_type: record.submission.featureType,
      affected_systems: record.submission.affectedSystems,
      data_sources: record.submission.dataSources,
      pii_involved: record.submission.piiInvolved,
      third_party_deps: record.submission.thirdPartyDeps || null,
      existing_risk_assessment: record.submission.existingRiskAssessment || null,
      jurisdiction: record.submission.jurisdiction,
      compliance_targets: record.submission.complianceTargets || null,
    },
    agent_records: record.agentRecords.map((a) => ({
      agent_id: a.agentId,
      agent_name: a.name,
      agent_emoji: a.emoji,
      vote: a.vote,
      confidence: a.confidence,
      reasoning: a.reasoning,
      findings: a.findings.map((f) => ({
        id: f.id,
        domain: f.domain,
        severity: f.severity,
        title: f.title,
        detail: f.detail,
        recommendation: f.recommendation || null,
      })),
      completed_at: a.completedAt,
    })),
    cross_examination_log: record.crossExaminationLog.map((c) => ({
      timestamp: c.timestamp,
      from_agent: c.fromAgent,
      to_agent: c.toAgent,
      challenge: c.challenge,
      counter_position: c.counterPosition,
    })),
  }

  const res = await fetch(`${API_BASE_URL}/records`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(pythonRecord),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to save record to database")
  }
  return res.json()
}

export async function getHistoricalRecords(): Promise<GovernanceRecord[]> {
  const res = await fetch(`${API_BASE_URL}/records`, {
    method: "GET",
    headers: getHeaders(),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "Failed to load audit records")
  }
  interface PythonAgentRecord {
    agent_id: string
    agent_name: string
    agent_emoji: string
    vote: Vote
    confidence: Confidence
    reasoning: string
    findings?:
      | {
          id: string
          domain: string
          severity: Severity
          title: string
          detail: string
          recommendation?: string | null
        }[]
      | null
    completed_at: string
  }

  interface PythonCrossExaminationLog {
    timestamp: string
    from_agent: string
    to_agent: string
    challenge: string
    counter_position: string
  }

  interface PythonRecord {
    reference_id: string
    session_id: string
    feature_name: string
    created_at: string
    completed_at: string
    verdict: Verdict
    conditions: string[] | null
    submission: {
      feature_name: string
      description: string
      intended_use: string
      feature_type: SubmissionPayload["featureType"]
      affected_systems: string[]
      data_sources: string
      pii_involved: SubmissionPayload["piiInvolved"]
      third_party_deps?: string | null
      existing_risk_assessment?: string | null
      jurisdiction: string[]
      compliance_targets?: string[] | null
    }
    agent_records: PythonAgentRecord[]
    cross_examination_log?: PythonCrossExaminationLog[] | null
  }

  const pythonRecords: PythonRecord[] = await res.json()

  // Convert Python snake_case structures back to TS camelCase
  return pythonRecords.map((r: PythonRecord) => ({
    referenceId: r.reference_id,
    sessionId: r.session_id,
    featureName: r.feature_name,
    createdAt: r.created_at,
    completedAt: r.completed_at,
    verdict: r.verdict,
    conditions: r.conditions || [],
    submission: {
      featureName: r.submission.feature_name,
      description: r.submission.description,
      intendedUse: r.submission.intended_use,
      featureType: r.submission.feature_type,
      affectedSystems: r.submission.affected_systems,
      dataSources: r.submission.data_sources,
      piiInvolved: r.submission.pii_involved,
      thirdPartyDeps: r.submission.third_party_deps ?? undefined,
      existingRiskAssessment: r.submission.existing_risk_assessment ?? undefined,
      jurisdiction: r.submission.jurisdiction,
      complianceTargets: r.submission.compliance_targets ?? undefined,
    },
    agentRecords: r.agent_records.map((a: PythonAgentRecord) => ({
      agentId: a.agent_id,
      name: a.agent_name,
      emoji: a.agent_emoji,
      vote: a.vote,
      confidence: a.confidence,
      reasoning: a.reasoning,
      findings: (a.findings || []).map((f) => ({
        id: f.id,
        domain: f.domain,
        severity: f.severity,
        title: f.title,
        detail: f.detail,
        recommendation: f.recommendation ?? undefined,
      })),
      completedAt: a.completed_at,
    })),
    crossExaminationLog: (r.cross_examination_log || []).map((c: PythonCrossExaminationLog) => ({
      timestamp: c.timestamp,
      fromAgent: c.from_agent,
      toAgent: c.to_agent,
      challenge: c.challenge,
      counterPosition: c.counter_position,
    })),
  }))
}
