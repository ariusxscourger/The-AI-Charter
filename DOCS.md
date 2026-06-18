# The AI Charter — Documentation

> Multi-agent governance system for responsible AI deployment. Five specialized agents review proposals in a shared Band.ai room, debate findings, vote, and produce a defensible audit trail.

**New here?** Start with [Local Development](docs/setup/LOCAL_DEVELOPMENT.md), then skim [Architecture Overview](docs/architecture/OVERVIEW.md).

---

## Quick links

| I want to… | Go to |
|------------|-------|
| Run the project locally | [Setup → Local Development](docs/setup/LOCAL_DEVELOPMENT.md) |
| See what's built vs open issues | [Project Status](docs/PROJECT_STATUS.md) |
| Configure API keys and env vars | [Setup → Environment](docs/setup/ENVIRONMENT.md) |
| Fix a local dev issue | [Setup → Troubleshooting](docs/setup/TROUBLESHOOTING.md) |
| Understand how the system fits together | [Architecture → Overview](docs/architecture/OVERVIEW.md) |
| Work on the Python backend | [Architecture → Backend](docs/architecture/BACKEND.md) |
| Work on the Next.js frontend | [Architecture → Frontend](docs/architecture/FRONTEND.md) |
| Build or modify governance agents | [Architecture → Agents](docs/architecture/AGENTS.md) |
| Understand UI conventions | [Design → UI System](docs/design/UI_SYSTEM.md) |
| See API shapes and endpoints | [Design → API Contracts](docs/design/API_CONTRACTS.md) |
| Read why we made a design choice | [ADRs](docs/adr/README.md) |
| Contribute a PR | [Contributing](docs/CONTRIBUTING.md) |

---

## Documentation map

### Setup

- [Setup hub](docs/setup/README.md)
- [Local Development](docs/setup/LOCAL_DEVELOPMENT.md) — Docker, manual install, Windows notes
- [Environment Variables](docs/setup/ENVIRONMENT.md) — keys, fallbacks, promos
- [Troubleshooting](docs/setup/TROUBLESHOOTING.md) — common errors and fixes

### Architecture

- [Architecture hub](docs/architecture/README.md)
- [Overview](docs/architecture/OVERVIEW.md) — system diagram and component map
- [Backend](docs/architecture/BACKEND.md) — FastAPI, Band SDK, database
- [Frontend](docs/architecture/FRONTEND.md) — Next.js routes, auth, polling
- [Agents](docs/architecture/AGENTS.md) — agent lifecycle and panel

### Design

- [Design hub](docs/design/README.md)
- [UI System](docs/design/UI_SYSTEM.md) — frontend conventions and tokens
- [API Contracts](docs/design/API_CONTRACTS.md) — endpoints, types, verdict rules

### Architecture Decision Records (ADRs)

- [ADR index and template](docs/adr/README.md)
- [0001 — Band as collaboration surface](docs/adr/0001-band-as-collaboration-surface.md)
- [0002 — Deterministic voting and verdicts](docs/adr/0002-deterministic-voting-and-verdicts.md)
- [0003 — Session ID equals Band room ID](docs/adr/0003-session-id-equals-band-room-id.md)
- [0004 — snake_case backend, camelCase frontend](docs/adr/0004-snake-case-backend-camelcase-frontend.md)
- [0005 — LLM provider fallback chain](docs/adr/0005-llm-provider-fallback-chain.md)
- [0006 — Governance record storage strategy](docs/adr/0006-governance-record-storage-strategy.md)

### Contributing

- [Contributing guide](docs/CONTRIBUTING.md)
- [Project status](docs/PROJECT_STATUS.md) — issues and merged PRs

---

## Existing reference docs

These predate the structured docs suite and remain authoritative for their domains:

| Document | Purpose |
|----------|---------|
| [Product Guide](docs/PRODUCT-GUIDE.md) | Full product spec, schemas, API detail, build order |
| [Brand & Design System](docs/BRAND_IDENTITY_DESIGN_SYSTEM.md) | Colors, typography, visual identity |
| [Hackathon Info](docs/HACKATHON.md) | Prizes, submission requirements, judging |
| [README](README.md) | Project landing page and quick start summary |

### Package-level READMEs

- [Backend README](backend/README.md)
- [Frontend README](web/README.md)
- [Docker README](docker/README.md)
