# Backend Architecture

The backend is a **Python 3.11 FastAPI** application in [`backend/`](../../backend/).

---

## Entry point

[`backend/orchestrator/main.py`](../../backend/orchestrator/main.py) — FastAPI app with:

- CORS middleware (allows all origins in dev)
- Custom Swagger UI at `/docs`
- Startup/shutdown hooks for database init
- Agent registration and orchestration
- Auth endpoints (register/login)

Run locally:

```bash
cd backend
pipenv install
pipenv run alembic upgrade head
pipenv run uvicorn orchestrator.main:app --reload --port 8000
```

---

## Directory structure

| Path | Purpose |
|------|---------|
| `orchestrator/main.py` | HTTP endpoints, status builders, auth |
| `band.py` | `BandClient` wrapper around Thenvoi REST SDK; mock fallback |
| `agents/base_agent.py` | `BaseGovernanceAgent` — shared Band lifecycle |
| `agents/{security,ethics,legal,product,compliance}/` | Per-agent `agent.py`, `evaluator.py`, `prompts.py` |
| `shared/schemas.py` | Pydantic models (SubmissionPayload, Finding, GovernanceRecord) |
| `shared/llm_client.py` | HTTP client for OpenRouter, Featherless, AI/ML API |
| `shared/cross_exam_prompts.py` | Cross-examination prompt builder and parser |
| `shared/models.py` | SQLModel ORM: `User`, `GovernanceRecordModel` |
| `shared/db.py` | Async SQLAlchemy engine, session dependency |
| `record/generator.py` | Compiles Band transcript → `GovernanceRecord` |
| `alembic/` | Database migrations |
| `tests/` | pytest unit and integration tests |

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/submit` | Create Band room, fire all agents, return `sessionId` |
| GET | `/status/{session_id}` | Live status from Band transcript |
| GET | `/record/{session_id}` | Governance record (DB cache → Band fallback) |
| POST | `/records` | Cache record to PostgreSQL |
| GET | `/records` | List cached records (newest first) |
| POST | `/auth/register` | Register user, return JWT |
| POST | `/auth/login` | Login, return JWT |
| GET | `/docs` | Swagger UI |

Full contract detail: [API Contracts](../design/API_CONTRACTS.md).

---

## Submission flow (`POST /submit`)

1. Create Band room named `Review: {feature_name}`
2. Join orchestrator and all five agent roles to the room
3. Post `submission_context` message with full payload
4. Fire `asyncio.create_task(run_agents())` — non-blocking
5. Return `{ "sessionId": room_id }` immediately

Each agent runs `BaseGovernanceAgent.run(room_id, payload)` concurrently.

---

## Status derivation (`GET /status/{session_id}`)

No separate status database. Status is **derived from Band room messages**:

- `status_update` → agent state (`reviewing`)
- `vote` → agent state (`voted`) + vote value
- Activity feed built from status, findings, challenge, and vote messages

---

## Record retrieval (`GET /record/{session_id}`)

1. Query PostgreSQL `governance_records` by `session_id`
2. If found, return cached `record_json`
3. Else call `generate_record()` which reads full Band transcript

See [ADR 0006](../adr/0006-governance-record-storage-strategy.md).

---

## Band client (`band.py`)

- Wraps `thenvoi-client-rest` SDK
- Per-role API key resolution via `_api_key_for_role()`
- Participant ID resolution for agent invites
- **Mock mode:** when no valid `BAND_API_KEY`, creates in-memory mock rooms

---

## LLM routing

`get_llm_for()` in `main.py` assigns the same provider to all agents based on configured keys:

```
one configured provider key → that provider
multiple configured keys → LLM_PROVIDER
no configured provider keys → dummy
```

See [ADR 0005](../adr/0005-llm-provider-fallback-chain.md).

---

## Database

**Tables** (Alembic migration `9eacb6610373_initial.py`):

- `users` — `email`, `password_hash`, `created_at`
- `governance_records` — `session_id` (unique), `feature_name`, `verdict`, `record_json` (JSONB)

`init_db()` also runs `SQLModel.metadata.create_all` on startup in addition to Alembic.

---

## Tests

```bash
cd backend
pipenv run pytest tests/test_vote_logic.py tests/test_parsers.py -v   # fast
pipenv run pytest -v                                                   # all unit
pipenv run pytest tests/test_integration.py -v -m integration          # needs LLM keys
```

Key test files:

- `test_vote_logic.py` — Security Agent vote rules
- `test_parsers.py` — JSON finding parsers
- `test_{ethics,legal,compliance,product}_*.py` — per-agent tests
- `test_band.py` — Band client configuration
- `test_integration.py` — full agent run against fixture

---

## Related

- [Agents](AGENTS.md)
- [Environment Variables](../setup/ENVIRONMENT.md)
- [Backend README](../../backend/README.md)
