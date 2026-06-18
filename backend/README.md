# AI Charter Backend

FastAPI application that orchestrates governance agents, handles Band.ai room lifecycles, and compiles governance records.

**Full documentation:** [docs/architecture/BACKEND.md](../docs/architecture/BACKEND.md)

## Requirements

- Python 3.11+
- [Pipenv](https://pipenv.pypa.io/) (recommended) or virtualenv

## Quick start

```bash
cd backend
pipenv install
pipenv run alembic upgrade head
pipenv run uvicorn orchestrator.main:app --reload --port 8000
```

Configure environment variables in the root `.env` file. See [docs/setup/ENVIRONMENT.md](../docs/setup/ENVIRONMENT.md).

## Folder structure

| Path | Purpose |
|------|---------|
| `orchestrator/` | API endpoints and Band room orchestration |
| `agents/` | Five governance agents + `BaseGovernanceAgent` |
| `shared/` | Pydantic schemas, LLM client, DB models |
| `record/` | Transcript → GovernanceRecord compiler |
| `band.py` | Band.ai SDK wrapper |
| `tests/` | pytest suite |
| `alembic/` | Database migrations |

## Tests

```bash
pipenv run pytest tests/test_vote_logic.py tests/test_parsers.py -v   # fast
pipenv run pytest -v                                                   # all unit
pipenv run pytest tests/test_integration.py -v -m integration          # needs LLM keys
```

## API docs

When running: http://localhost:8000/docs (manual) or http://localhost:8001/docs (Docker).
