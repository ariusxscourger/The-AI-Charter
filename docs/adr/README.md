# Architecture Decision Records (ADRs)

This directory records significant architectural decisions for The AI Charter.

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [0001](0001-band-as-collaboration-surface.md) | Band.ai as collaboration surface | Accepted |
| [0002](0002-deterministic-voting-and-verdicts.md) | Deterministic voting and verdicts | Accepted |
| [0003](0003-session-id-equals-band-room-id.md) | Session ID equals Band room ID | Accepted |
| [0004](0004-snake-case-backend-camelcase-frontend.md) | snake_case backend, camelCase frontend | Accepted |
| [0005](0005-llm-provider-fallback-chain.md) | LLM provider selection | Accepted |
| [0006](0006-governance-record-storage-strategy.md) | Governance record storage strategy | Accepted |

---

## When to write an ADR

Create a new ADR when a decision:

- Affects multiple components or teams
- Is hard to reverse
- Has trade-offs worth documenting for future contributors

Do **not** write ADRs for routine implementation choices (variable names, component splits, etc.).

---

## Template

Copy this template for new ADRs. Number sequentially (`0007-short-title.md`).

```markdown
# ADR-NNNN: Title

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD

## Context

What is the issue or forcing function? What constraints exist?

## Decision

What did we decide? Be specific.

## Consequences

What becomes easier or harder? What are the trade-offs?
```

---

Return to [Documentation index](../../DOCS.md).
