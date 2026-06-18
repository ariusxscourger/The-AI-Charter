# Contributing

Thank you for contributing to The AI Charter. This guide covers workflow, conventions, and quality checks.

---

## Getting started

1. Read [Local Development](setup/LOCAL_DEVELOPMENT.md) to run the project
2. Skim [Architecture Overview](architecture/OVERVIEW.md) to understand the system
3. For agent work, study [`backend/agents/security/`](../../backend/agents/security/) first

---

## Branch workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b feat/your-feature-name
   ```
2. Make focused changes — one concern per PR
3. Run tests and lint before pushing
4. Open a PR with a clear description of what changed and why

### Branch naming

| Prefix | Use for |
|--------|---------|
| `feat/` | New features or UI improvements |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code restructuring without behavior change |
| `test/` | Test additions or fixes |

---

## Code conventions

### Backend (Python)

- Use **Pipenv** for local development (`pipenv install`, `pipenv run pytest`)
- Follow patterns in `backend/agents/security/` for new agents
- Pydantic models in `shared/schemas.py` — snake_case fields
- Deterministic vote logic in `_determine_vote()` — no LLM for vote decisions
- Register new agents in `orchestrator/main.py`

### Frontend (TypeScript)

- Import types from `web/src/types/charter.ts` — never inline API types
- All API calls go through `web/src/lib/api.ts`
- Match existing Tailwind patterns and brand colors (see [UI System](design/UI_SYSTEM.md))
- Use **Bun** for local scripts (`bun install`, `bun dev`, `bun lint`)

### Architectural changes

If your change affects system boundaries, data flow, or external integrations, write an [ADR](adr/README.md) before or alongside the implementation.

---

## Quality checks

### Backend tests

```bash
cd backend
pipenv run pytest tests/test_vote_logic.py tests/test_parsers.py -v   # fast, no LLM
pipenv run pytest -v                                                   # all unit tests
```

### Frontend lint

```bash
cd web
bun lint
```

### Manual smoke test

1. Sign up → lands on `/dashboard`
2. Submit a proposal (use Prefill Example)
3. Watch live review complete
4. View governance record

---

## PR checklist

- [ ] Changes are scoped to the stated purpose
- [ ] Backend tests pass (`pipenv run pytest`)
- [ ] Frontend lint passes (`bun lint`)
- [ ] No secrets committed (`.env` is gitignored)
- [ ] Types updated in both `schemas.py` and `charter.ts` if API shapes changed
- [ ] `api.ts` mappers updated if new fields added
- [ ] Documentation updated if behavior or setup changed

---

## What not to commit

- `.env` files or API keys
- `node_modules/`, `.venv/`, `.next/`
- Unrelated formatting changes across the codebase

---

## Related

- [Documentation index](../DOCS.md)
- [ADRs](adr/README.md)
- [Product Guide](PRODUCT-GUIDE.md)
