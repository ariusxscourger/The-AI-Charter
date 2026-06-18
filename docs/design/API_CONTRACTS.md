# API Contracts

HTTP API contract between the Next.js frontend and FastAPI backend.

**Backend schemas:** [`backend/shared/schemas.py`](../../backend/shared/schemas.py) (snake_case Pydantic)
**Frontend types:** [`web/src/types/charter.ts`](../../web/src/types/charter.ts) (camelCase TypeScript)
**Translation layer:** [`web/src/lib/api.ts`](../../web/src/lib/api.ts)

See [ADR 0004](../adr/0004-snake-case-backend-camelcase-frontend.md).

---

## Base URL

| Mode | URL |
|------|-----|
| Docker | `http://localhost:8001` |
| Manual | `http://localhost:8000` |

Interactive docs: `{BASE_URL}/docs`

---

## Authentication

### POST `/auth/register`

**Request:**
```json
{ "email": "user@example.com", "password": "min8chars" }
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": { "id": 1, "email": "...", "created_at": "..." },
  "token": "<JWT>"
}
```

### POST `/auth/login`

Same request/response shape as register.

**Known gap:** JWT is issued but **not validated** on governance endpoints (`/submit`, `/status`, `/record`, `/records`). The frontend sends `Authorization: Bearer` headers; the backend currently ignores them.

---

## Governance

### POST `/submit`

**Request body** (`SubmissionPayload`):

| Field | Type | Required |
|-------|------|----------|
| `feature_name` | string | Yes |
| `description` | string | Yes |
| `intended_use` | string | Yes |
| `feature_type` | `new_feature` \| `model_change` \| `prompt_change` \| `integration` \| `other` | Yes |
| `affected_systems` | string[] | Yes |
| `data_sources` | string | Yes |
| `pii_involved` | `yes` \| `no` \| `unknown` | Yes |
| `third_party_deps` | string | No |
| `existing_risk_assessment` | string | No |
| `jurisdiction` | string[] | Yes |
| `compliance_targets` | string[] | No |

**Response:**
```json
{ "sessionId": "<band_room_id>" }
```

Agents run asynchronously after response.

### GET `/status/{session_id}`

**Response** (`SessionStatus`):

| Field | Type |
|-------|------|
| `sessionId` | string |
| `featureName` | string |
| `status` | `pending` \| `reviewing` \| `complete` \| `error` |
| `agents` | Array of `{ id, name, emoji, status, vote? }` |
| `activityFeed` | Array of `{ timestamp, agentId, message }` |

Status is derived from Band room messages in real time — no separate status DB.

### GET `/record/{session_id}`

**Response** (`GovernanceRecord`):

| Field | Type |
|-------|------|
| `reference_id` | string |
| `session_id` | string |
| `feature_name` | string |
| `created_at` | ISO timestamp |
| `completed_at` | ISO timestamp |
| `verdict` | See verdict enum below |
| `conditions` | string[] (optional) |
| `submission` | SubmissionPayload |
| `agent_records` | AgentRecord[] |
| `cross_examination_log` | CrossExamEntry[] |

### POST `/records`

Caches a `GovernanceRecord` to PostgreSQL. Upserts on `session_id` conflict.

### GET `/records`

Returns all cached records, newest first.

---

## Shared types

### Finding

| Field | Type |
|-------|------|
| `id` | string (8-char UUID prefix) |
| `domain` | string |
| `severity` | `critical` \| `high` \| `medium` \| `low` \| `info` |
| `title` | string (max ~80 chars) |
| `detail` | string |
| `recommendation` | string (optional) |

### AgentRecord

| Field | Type |
|-------|------|
| `agent_id` | string |
| `agent_name` | string |
| `agent_emoji` | string |
| `vote` | `approve` \| `reject` \| `flag` |
| `confidence` | `high` \| `medium` \| `low` |
| `reasoning` | string |
| `findings` | Finding[] |
| `completed_at` | ISO timestamp |

### CrossExamEntry

| Field | Type |
|-------|------|
| `timestamp` | ISO timestamp |
| `from_agent` | string |
| `to_agent` | string |
| `challenge` | string |
| `counter_position` | string |

---

## Verdict enum

| Value | Meaning |
|-------|---------|
| `approved` | All agents voted approve |
| `rejected` | At least one agent voted reject |
| `conditional_approval` | Mixed votes, no majority flag |
| `human_review_required` | Half or more agents voted flag |

Verdict logic is deterministic Python in [`record/generator.py`](../../backend/record/generator.py).

---

## Case translation (frontend)

`api.ts` maps between conventions:

| Backend (snake_case) | Frontend (camelCase) |
|----------------------|----------------------|
| `feature_name` | `featureName` |
| `session_id` | `sessionId` |
| `agent_id` | `agentId` |
| `reference_id` | `referenceId` |
| `created_at` | `createdAt` |
| `cross_examination_log` | `crossExaminationLog` |
| `from_agent` | `fromAgent` |
| `counter_position` | `counterPosition` |

---

## Band room message types

Not HTTP endpoints — internal to Band.ai rooms. Documented here for contract completeness.

| `type` | Role | Purpose |
|--------|------|---------|
| `submission_context` | orchestrator | Original proposal |
| `status_update` | agent | Lifecycle status |
| `findings` | agent | Evaluation results |
| `challenge` | agent | Cross-examination |
| `vote` | agent | Final vote + reasoning |

---

## Related

- [Backend Architecture](../architecture/BACKEND.md)
- [Product Guide](../PRODUCT-GUIDE.md) — extended API and schema detail
- [ADR 0003 — Session ID equals room ID](../adr/0003-session-id-equals-band-room-id.md)
