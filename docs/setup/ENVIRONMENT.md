# Environment Variables

All configuration lives in a single `.env` file at the project root. Copy from [`.env.example`](../../.env.example).

```bash
cp .env.example .env
```

The backend loads this file from the repo root. Docker Compose also mounts it into containers via `env_file`.

---

## Band.ai

| Variable                   | Required                     | Purpose                                  |
| -------------------------- | ---------------------------- | ---------------------------------------- |
| `BAND_API_KEY`             | Yes (for real rooms)         | Orchestrator API key for room creation   |
| `BAND_USER_ID`             | Yes (for real rooms)         | Human participant ID (room owner)        |
| `SECURITY_AGENT_API_KEY`   | No                           | Falls back to `BAND_API_KEY`             |
| `ETHICS_AGENT_API_KEY`     | No                           | Falls back to `BAND_API_KEY`             |
| `LEGAL_AGENT_API_KEY`      | No                           | Falls back to `BAND_API_KEY`             |
| `PRODUCT_AGENT_API_KEY`    | No                           | Falls back to `BAND_API_KEY`             |
| `COMPLIANCE_AGENT_API_KEY` | No                           | Falls back to `BAND_API_KEY`             |
| `SECURITY_AGENT_ID`        | Yes (for real agent invites) | Band participant ID for Security agent   |
| `ETHICS_AGENT_ID`          | Yes                          | Band participant ID for Ethics agent     |
| `LEGAL_AGENT_ID`           | Yes                          | Band participant ID for Legal agent      |
| `PRODUCT_AGENT_ID`         | Yes                          | Band participant ID for Product agent    |
| `COMPLIANCE_AGENT_ID`      | Yes                          | Band participant ID for Compliance agent |

Values starting with `your_` are treated as unconfigured. See `_configured_env()` in [`backend/band.py`](../../backend/band.py).

**Also recognized in code** (not in `.env.example`): `{ROLE}_BAND_API_KEY`, `BAND_{ROLE}_AGENT_ID`, `ORCHESTRATOR_AGENT_API_KEY`, `BAND_BASE_URL`, `THENVOI_BASE_URL`.

Without valid Band keys, the system falls back to **mock rooms** (`mock-room-*`) with in-memory messages only.

---

## LLM providers

At least one provider is recommended for meaningful agent evaluations.

| Variable              | Default                 | Purpose                                                                                     |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------------- |
| `LLM_PROVIDER`        | —                       | Required when more than one provider key is set. One of `openrouter`, `featherless`, `aiml` |
| `OPENROUTER_API_KEY`  | —                       | OpenRouter API key                                                                          |
| `OPENROUTER_MODEL`    | `openrouter/auto`       | Model ID                                                                                    |
| `FEATHERLESS_API_KEY` | —                       | Featherless API key                                                                         |
| `FEATHERLESS_MODEL`   | `google/gemma-4-31B-it` | Model ID                                                                                    |
| `AIML_API_KEY`        | —                       | AI/ML API key                                                                               |
| `AIML_MODEL`          | `google/gemma-4-31B-it` | Model ID                                                                                    |

Provider selection in [`backend/orchestrator/main.py`](../../backend/orchestrator/main.py) (`get_llm_for()`):

```
single configured key → that provider
multiple configured keys + LLM_PROVIDER → selected provider
no configured keys → dummy fallback
```

When multiple keys are configured and `LLM_PROVIDER` is missing, startup evaluations fail fast instead of silently choosing one provider.

`FEATHERLESS_BASE_URL` and `AIML_BASE_URL` in `.env.example` are not read by `llm_client.py` (URLs are hardcoded there).

---

## Application

| Variable       | Default                                                             | Purpose               |
| -------------- | ------------------------------------------------------------------- | --------------------- |
| `DATABASE_URL` | `postgresql://postgres:postgres_password@localhost:5432/charter_db` | PostgreSQL connection |
| `JWT_SECRET`   | `fallback_jwt_secret_hackathon_2026`                                | JWT signing for auth  |

Docker Compose overrides `DATABASE_URL` to point at the `db` service internally.

---

## Frontend (Next.js)

| Variable                       | Default                 | Purpose                          |
| ------------------------------ | ----------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`     | `http://localhost:8000` | Backend URL for browser requests |
| `NEXT_PUBLIC_POLL_INTERVAL_MS` | `3000`                  | Review page polling interval     |

**Docker:** set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8001` (or rely on compose `environment` override).

Validated in [`web/src/env.ts`](../../web/src/env.ts). `DATABASE_URL` and `JWT_SECRET` are defined there but unused by frontend code.

---

## Docker Compose extras

Used by [`docker/docker-compose.yml`](../../docker/docker-compose.yml):

| Variable            | Default             |
| ------------------- | ------------------- |
| `POSTGRES_USER`     | `postgres`          |
| `POSTGRES_PASSWORD` | `postgres_password` |
| `POSTGRES_DB`       | `charter_db`        |

---

## Hackathon promos

| Service     | Promo        | Benefit                                    |
| ----------- | ------------ | ------------------------------------------ |
| Band.ai     | `BANDHACK26` | 100% off Band Pro for 1 month              |
| Featherless | `BOA26`      | $25 credits                                |
| AI/ML API   | —            | $10 credits per participant at aimlapi.com |

---

## Minimum viable keys

For a full live governance run:

1. `BAND_API_KEY` + `BAND_USER_ID`
2. All five `*_AGENT_ID` values
3. At least one LLM key (`OPENROUTER_API_KEY`, `FEATHERLESS_API_KEY`, or `AIML_API_KEY`)
4. Running PostgreSQL with matching `DATABASE_URL`

For UI-only development, Postgres + JWT defaults are sufficient; agents run in mock/degraded mode.

---

## Related

- [Local Development](LOCAL_DEVELOPMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)
