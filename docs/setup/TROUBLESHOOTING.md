# Troubleshooting

Common issues when running The AI Charter locally.

---

## Port already in use

**Symptom:** `docker-compose up` fails or services cannot bind ports 3000, 8001, or 5433.

**Fix:**

- Stop conflicting processes (other Next.js apps, local Postgres, etc.)
- Or change port mappings in [`docker/docker-compose.yml`](../../docker/docker-compose.yml)

---

## Frontend cannot reach backend

**Symptom:** Login/signup fails, network errors in browser console, API calls to wrong port.

**Fix:**

| Mode | `NEXT_PUBLIC_API_BASE_URL` must be |
|------|-------------------------------------|
| Docker | `http://localhost:8001` |
| Manual | `http://localhost:8000` |

After changing `.env`, restart the frontend container or dev server. For Docker:

```bash
cd docker
docker-compose down
docker-compose up --build
```

---

## Agents do not run / mock rooms

**Symptom:** Sessions get IDs like `mock-room-*`, backend logs warn about missing keys, no real Band activity.

**Causes:**

- Missing or placeholder `BAND_API_KEY`
- Missing `BAND_USER_ID`
- Missing one or more `*_AGENT_ID` values (still set to `your_*` in `.env`)

**Fix:** Get real values from your Band.ai dashboard or team lead. Placeholder values starting with `your_` are ignored by [`backend/band.py`](../../backend/band.py).

---

## Agent evaluation returns empty findings

**Symptom:** Agents join but produce no findings, or errors in backend logs about LLM calls.

**Causes:**

- No LLM API keys configured
- Invalid or expired API key
- Rate limiting from provider

**Fix:** Set at least one of `OPENROUTER_API_KEY`, `FEATHERLESS_API_KEY`, or `AIML_API_KEY`. Check backend logs:

```bash
docker logs charter-backend
```

---

## Database connection errors

**Symptom:** `connection refused` to Postgres, migration failures.

**Fix:**

- Ensure Postgres container is running: `docker ps`
- Match `DATABASE_URL` port to your setup (5433 for Docker host mapping, 5432 for local install)
- Run migrations: `alembic upgrade head` (inside backend container or venv)

---

## `.env` changes not applied

**Symptom:** Updated keys but behavior unchanged.

**Fix:**

```bash
cd docker
docker-compose down
docker-compose up --build
```

Environment variables are loaded at container start, not on every request.

---

## Slow hot reload on Windows

**Symptom:** Frontend or backend file changes take several seconds to reflect.

**Cause:** Docker volume mounts on Windows can be slow.

**Workaround:** Run frontend manually outside Docker (`cd web && bun dev`) while keeping backend/db in Docker.

---

## Review page stuck on "reviewing"

**Symptom:** `/review/{sessionId}` never shows completion.

**Causes:**

- Agents still running (LLM calls can take minutes)
- Agent crashed mid-session (check `docker logs charter-backend`)
- Polling interval too slow — adjust `NEXT_PUBLIC_POLL_INTERVAL_MS`

**Fix:** Wait for all five agents to vote. Check `/status/{sessionId}` directly at the API docs.

---

## Auth works but governance endpoints are open

**Note:** JWT tokens are issued on login/register but **not validated** on `/submit`, `/records`, etc. This is a known gap documented in [API Contracts](../design/API_CONTRACTS.md). Not a local setup bug.

---

## Getting more help

1. Check API docs: http://localhost:8001/docs (Docker) or :8000 (manual)
2. Read backend logs: `docker logs charter-backend -f`
3. Run fast tests: `pytest tests/test_vote_logic.py -v` in `backend/`
4. Ask your team for shared `.env` values (especially `*_AGENT_ID`)

---

## Related

- [Local Development](LOCAL_DEVELOPMENT.md)
- [Environment Variables](ENVIRONMENT.md)
