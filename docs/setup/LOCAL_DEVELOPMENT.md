# Local Development

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.11+ | Backend runtime |
| [Pipenv](https://pipenv.pypa.io/) | Latest | Backend dependency management (recommended) |
| [Bun](https://bun.sh/) | Latest | Frontend package manager and scripts |
| Node.js | 20+ | Required for Bun / Next.js |
| Docker + Docker Compose | Latest | Recommended for full stack |
| PostgreSQL 15 | Optional | Only if not using Docker for DB |

External accounts (for live agent runs):

- [Band.ai](https://www.band.ai/) — room creation and agent collaboration
- At least one LLM provider: [OpenRouter](https://openrouter.ai/), [Featherless](https://featherless.ai/), or [AI/ML API](https://aimlapi.com/)

---

## Port matrix

Ports differ between Docker and manual development. Use the correct `NEXT_PUBLIC_API_BASE_URL` for your mode.

| Service | Docker (host) | Manual dev |
|---------|---------------|------------|
| Frontend | http://localhost:3000 | http://localhost:3000 |
| Backend API | http://localhost:8001 | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8001/docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5433 | localhost:5432 or 5433 |

---

## Option A: Docker Compose (recommended)

```bash
# From project root
cp .env.example .env
# Edit .env with your API keys

cd docker
docker-compose up --build
```

This starts three containers:

- `charter-postgres` — PostgreSQL 15
- `charter-backend` — FastAPI with hot reload
- `charter-frontend` — Next.js dev server

Docker Compose overrides `DATABASE_URL` and `NEXT_PUBLIC_API_BASE_URL` inside containers. The frontend container is configured to call the backend at `http://localhost:8001` (host-mapped port).

**Stop the stack:**

```bash
cd docker
docker-compose down
```

**Rebuild after `.env` changes:**

```bash
docker-compose down
docker-compose up --build
```

---

## Option B: Manual development

### 1. Environment

```bash
cp .env.example .env
```

Set for manual mode:

```env
DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/charter_db
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2. PostgreSQL

Run Postgres locally or via Docker:

```bash
docker run -d -p 5433:5432 \
  -e POSTGRES_PASSWORD=postgres_password \
  -e POSTGRES_DB=charter_db \
  postgres:15-alpine
```

If using port 5433, set `DATABASE_URL` accordingly.

### 3. Backend

```bash
cd backend
pipenv install
pipenv run alembic upgrade head
pipenv run uvicorn orchestrator.main:app --reload --port 8000
```

**Alternative (venv + pip):**

```bash
cd backend
python -m venv .venv
# macOS / Linux: source .venv/bin/activate
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn orchestrator.main:app --reload --port 8000
```

### 4. Frontend (separate terminal)

```bash
cd web
bun install
bun dev
```

---

## Windows notes

- Use PowerShell or Windows Terminal; paths may contain spaces — quote them: `"D:\Web Projects\...\The-AI-Charter"`
- Activate the virtualenv with `.venv\Scripts\activate` (not `source .venv/bin/activate`)
- `run_mcp.sh` requires Git Bash or WSL
- Docker Desktop must be running before `docker-compose up`

---

## Smoke test

After the stack is running:

1. Open http://localhost:3000 — landing page loads
2. Sign up at `/signup`
3. You should land on `/dashboard` (Operator Hub)
4. Click **Propose** → `/dashboard/submit`
5. Use **Prefill Example**, submit the form
6. Watch live review at `/review/{sessionId}`
7. When agents finish, open `/dashboard/record/{sessionId}`

If agents do not run, see [Troubleshooting](TROUBLESHOOTING.md). The UI works in degraded/mock mode without full API keys.

---

## Backend-only verification

From the project root, run the end-to-end governance script (starts backend on port 8000):

```bash
python verify_governance.py
```

This submits a test proposal, polls agent status, and prints the compiled governance record.

---

## Running tests

```bash
cd backend

# Fast unit tests (no LLM calls)
pipenv run pytest tests/test_vote_logic.py tests/test_parsers.py -v

# All unit tests
pipenv run pytest -v

# Integration test (requires live LLM API keys, ~60s)
pipenv run pytest tests/test_integration.py -v -m integration
```

---

## Related

- [Environment Variables](ENVIRONMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)
- [Docker README](../../docker/README.md)
