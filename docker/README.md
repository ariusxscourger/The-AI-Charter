# Docker Configuration

Container orchestration for local development. For the full setup guide, see [docs/setup/LOCAL_DEVELOPMENT.md](../docs/setup/LOCAL_DEVELOPMENT.md).

## Quick start

```bash
# From project root — ensure .env is configured
cd docker
docker-compose up --build
```

## Services

| Container | Host URL | Internal port |
|-----------|----------|---------------|
| Frontend (Next.js) | http://localhost:3000 | 3000 |
| Backend (FastAPI) | http://localhost:8001 | 8000 |
| PostgreSQL | localhost:5433 | 5432 |
| API docs | http://localhost:8001/docs | — |

Docker Compose overrides `DATABASE_URL` to point at the `db` service and sets `NEXT_PUBLIC_API_BASE_URL=http://localhost:8001` for the frontend container.

## Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Dev stack with hot reload and volume mounts |
| `docker-compose.prod.yml` | Production build (no volume mounts, frontend on port 80) |
| `Dockerfile.backend` | Python 3.11-slim + Alembic + uvicorn |
| `Dockerfile.frontend` | Node 20 + pnpm + Next.js (container only; use **Bun** locally) |

## Stop and rebuild

```bash
docker-compose down
docker-compose up --build   # required after .env changes
```

## Troubleshooting

See [docs/setup/TROUBLESHOOTING.md](../docs/setup/TROUBLESHOOTING.md).
