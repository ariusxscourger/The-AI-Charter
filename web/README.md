# The AI Charter — Frontend

Next.js 16 web application for proposal submission, live agent review, and governance record viewing.

**Full documentation:** [docs/architecture/FRONTEND.md](../docs/architecture/FRONTEND.md)

## Stack

Next.js 16 · React 19 · Tailwind CSS 4 · TypeScript · Bun

## Quick start

```bash
cd web
bun install
bun dev
```

Set `NEXT_PUBLIC_API_BASE_URL` in the root `.env`:

| Mode | Value |
|------|-------|
| Manual dev | `http://localhost:8000` |
| Docker | `http://localhost:8001` |

Open http://localhost:3000

> **Docker note:** The frontend container uses `pnpm` internally (`docker/Dockerfile.frontend`). Use **Bun** for local development.

## Commands

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun run build` | Production build |
| `bun lint` | Run ESLint |
| `bun run format` | Run Prettier |

## Key conventions

- Types: import from `src/types/charter.ts` — never inline API shapes
- API calls: all go through `src/lib/api.ts` (snake_case ↔ camelCase translation)
- UI design: see [docs/design/UI_SYSTEM.md](../docs/design/UI_SYSTEM.md)

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/dashboard` | Operator hub |
| `/dashboard/submit` | Proposal form |
| `/review/[sessionId]` | Live review |
| `/dashboard/record/[sessionId]` | Governance record |

Full route table: [docs/architecture/FRONTEND.md](../docs/architecture/FRONTEND.md#routes).
