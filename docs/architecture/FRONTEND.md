# Frontend Architecture

The frontend is a **Next.js 16** application using the App Router, in [`web/`](../../web/).

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Icons | lucide-react |
| Env validation | Zod + `@t3-oss/env-nextjs` |
| Package manager | Bun (local dev); pnpm inside Docker frontend container |

---

## Directory structure

```
web/src/
├── app/                    # Routes (App Router)
│   ├── page.tsx            # Landing page
│   ├── login/              # Login
│   ├── signup/             # Registration
│   ├── dashboard/          # Authenticated operator hub
│   │   ├── page.tsx        # Hub (metrics, ledgers, agent overview)
│   │   ├── submit/         # Proposal form
│   │   ├── record/[sessionId]/  # Governance record viewer
│   │   ├── ledgers/        # Full ledger list
│   │   └── settings/       # Operator settings
│   └── review/[sessionId]/ # Live agent review (polling)
├── components/
│   ├── ui/                 # Badge, Card, Button, ProgressSteps, etc.
│   ├── landing/            # Marketing page sections
│   ├── auth/               # LoginForm, SignupForm
│   ├── dashboard/          # Hub widgets, ledger list, metrics
│   ├── submit/             # Multi-step submission form
│   ├── review/             # Live session review
│   ├── record/             # Governance record viewer
│   └── layout/             # DashboardLayout, PageTransition
├── context/
│   └── AuthContext.tsx     # JWT auth state (localStorage)
├── lib/
│   ├── api.ts              # All backend API calls + case translation
│   ├── poll.ts             # usePolling hook for review page
│   └── utils.ts            # cn() helper
└── types/
    └── charter.ts          # Shared TypeScript types
```

---

## Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Landing page with team, partners, demo pipeline |
| `/login` | Public | Email/password login |
| `/signup` | Public | Registration with password rules |
| `/dashboard` | Required | Operator hub — metrics, ledgers, agent overview |
| `/dashboard/submit` | Required | 3-step proposal form |
| `/review/[sessionId]` | Required | Live polling of agent status and activity feed |
| `/dashboard/record/[sessionId]` | Required | Full governance record viewer |
| `/dashboard/ledgers` | Required | Full-page audit ledger list |
| `/dashboard/settings` | Required | Operator profile and API connection info |
| `/settings` | Redirect | Redirects to `/dashboard/settings` |

---

## Authentication

[`AuthContext.tsx`](../../web/src/context/AuthContext.tsx):

- Stores JWT + user in `localStorage`
- Redirects unauthenticated users to `/login` for protected routes
- After login/signup, redirects to `/dashboard`
- `DashboardLayout` wraps authenticated pages with sidebar navigation

**Known gap:** Backend does not validate JWT on governance endpoints. Auth is client-side gating only.

---

## API layer

[`lib/api.ts`](../../web/src/lib/api.ts) is the **only** place for backend communication:

- Translates snake_case API responses → camelCase TypeScript types
- Translates camelCase form data → snake_case for `POST /submit`
- Attaches `Authorization: Bearer` header when token exists

**Rule:** Never define inline types in components. Import from [`types/charter.ts`](../../web/src/types/charter.ts).

See [ADR 0004](../adr/0004-snake-case-backend-camelcase-frontend.md).

---

## Key user flows

### Submit proposal

`SubmitProposalClient.tsx` — 3 steps (Overview → Risk Profile → Compliance) → `POST /submit` → redirect to `/review/{sessionId}`.

### Live review

`SessionReviewClient.tsx` — uses `usePolling` from `lib/poll.ts` to call `GET /status/{sessionId}` every `NEXT_PUBLIC_POLL_INTERVAL_MS` (default 3s). Redirects to record page when complete.

### Record viewer

`RecordViewerClient.tsx` — fetches `GET /record/{sessionId}`, displays verdict, agent votes, findings, cross-examination log.

### Dashboard hub

`DashboardClient.tsx` — loads `GET /records` for historical ledger list, renders metrics and agent pipeline overview.

---

## Layout shell

[`DashboardLayout.tsx`](../../web/src/components/layout/DashboardLayout.tsx):

- Sidebar navigation (Hub, Propose, Ledgers, Settings)
- Collapsible on desktop, hamburger drawer on mobile
- Operator email in header
- Logout button

Public routes (`/`, `/login`, `/signup`) render without the dashboard shell.

---

## Environment

Validated in [`env.ts`](../../web/src/env.ts):

- `NEXT_PUBLIC_API_BASE_URL` — backend URL (see [port matrix](../setup/LOCAL_DEVELOPMENT.md#port-matrix))
- `NEXT_PUBLIC_POLL_INTERVAL_MS` — review polling interval

---

## Commands

```bash
cd web
bun install
bun dev      # http://localhost:3000
bun run build    # production build
bun lint     # ESLint
bun run format   # Prettier
```

> **Docker note:** The frontend container uses `pnpm` (see `docker/Dockerfile.frontend`). For local development outside Docker, use **Bun** as above.

---

## Related

- [UI System](../design/UI_SYSTEM.md)
- [API Contracts](../design/API_CONTRACTS.md)
- [Frontend README](../../web/README.md)
