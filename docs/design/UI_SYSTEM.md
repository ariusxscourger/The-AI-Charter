# UI System

Frontend design conventions for the Next.js web application. For the complete visual identity specification, see [Brand & Design System](../BRAND_IDENTITY_DESIGN_SYSTEM.md).

---

## Visual identity (summary)

**Aesthetic:** Retro-futuristic computing — warm cream canvas, high-contrast technical typography, robot-green accents.

### Core colors

| Token | Hex | Usage |
|-------|-----|-------|
| Cream Base | `#FAF8F5` | Page background, cards |
| Band Black | `#1F2937` | Primary text, dark panels |
| Grid Gray | `#C7C7C7` | Borders, decorative grid lines |
| Robot Green | `#76E1A7` | Primary buttons, active states, terminal glow |
| Accent Blue | `#A1DFF5` | Secondary metrics, agent attributes |
| Primary Code | `#38B0E8` | Links, API highlights, hover states |

Colors are currently applied as Tailwind arbitrary values (e.g. `bg-[#FAF8F5]`) across components. shadcn CSS variables exist in [`web/src/index.css`](../../web/src/index.css) but are underused.

### Typography

| Role | Font | Usage |
|------|------|-------|
| Sans | Inter | Headings, body text |
| Mono | Fira Code | Terminal output, metrics, labels |

Loaded via `next/font` in [`web/src/app/layout.tsx`](../../web/src/app/layout.tsx).

---

## Layout patterns

- **Crosshair grid** — decorative `+` corner markers and subtle grid overlay on landing and dashboard
- **Terminal chrome** — red/yellow/green dots + monospace header on card components
- **Pill buttons** — `rounded-[20px]` with robot green (`#76E1A7`) for primary actions
- **Uppercase labels** — `font-mono text-xs uppercase tracking-wider` for section headers

---

## Component organization

| Directory | Purpose |
|-----------|---------|
| `components/ui/` | Primitives: Card, Badge, Button, Collapsible, ProgressSteps, Skeleton, Logo |
| `components/landing/` | Marketing page: Hero, Team, Partners, CTA, Header, Footer |
| `components/auth/` | LoginForm, SignupForm |
| `components/dashboard/` | Hub widgets: MetricsPanel, AgentOverview, AuditLedgerList, GovernanceProcess |
| `components/submit/` | Multi-step proposal form |
| `components/review/` | Live session review with polling |
| `components/record/` | Governance record viewer |
| `components/layout/` | DashboardLayout (sidebar), PageTransition |

### shadcn/ui

[`web/components.json`](../../web/components.json) configures shadcn. Only a subset of primitives is used; most components are custom brand-styled rather than stock shadcn.

---

## Page shells

| Context | Shell |
|---------|-------|
| Landing (`/`) | Full-width marketing layout, no sidebar |
| Auth (`/login`, `/signup`) | Centered form on grid background |
| Dashboard routes | `DashboardLayout` with sidebar + header |
| Review (`/review/[id]`) | Dashboard shell with live polling content |

---

## Responsive behavior

- Landing: responsive grids (`md:grid-cols-2`, `lg:grid-cols-3`)
- Dashboard sidebar: collapsible on desktop, hamburger drawer on mobile (`md` breakpoint)
- Metrics panel: 3-column grid (may need mobile breakpoint polish)

---

## Animation

- **Framer Motion** — page transitions, card hover, agent pipeline demo
- Landing `AgentOverview` includes a **demo simulation** badge (`isDemo` prop) to distinguish decorative animation from live agent activity

Consider `prefers-reduced-motion` for accessibility in future work.

---

## Type conventions

All shared types live in [`web/src/types/charter.ts`](../../web/src/types/charter.ts). Components import types from there — never define inline API shapes.

---

## Related

- [Brand & Design System](../BRAND_IDENTITY_DESIGN_SYSTEM.md) — full color, typography, and component specs
- [Frontend Architecture](../architecture/FRONTEND.md)
- [API Contracts](API_CONTRACTS.md)
