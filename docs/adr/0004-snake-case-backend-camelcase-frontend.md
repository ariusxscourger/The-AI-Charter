# ADR-0004: snake_case Backend, camelCase Frontend

**Status:** Accepted
**Date:** 2026-06-12

## Context

The backend is Python (Pydantic conventions favor snake_case). The frontend is TypeScript (JavaScript conventions favor camelCase). Both layers need strongly typed contracts for the same data shapes.

## Decision

- **Backend:** All Pydantic models and JSON API responses use `snake_case` ([`shared/schemas.py`](../../backend/shared/schemas.py))
- **Frontend:** All TypeScript types use `camelCase` ([`types/charter.ts`](../../web/src/types/charter.ts))
- **Translation:** A single module [`web/src/lib/api.ts`](../../web/src/lib/api.ts) converts between conventions on every request/response

Components must import types from `charter.ts` — never define inline API shapes.

## Consequences

**Positive:**

- Each layer follows idiomatic naming
- Single translation boundary is easy to audit and test
- Type safety on both sides

**Negative:**

- Every new API field requires updates in three places: schema, type, api.ts mapper
- Easy to miss a field if mapper is not updated

**Related:** [API Contracts](../design/API_CONTRACTS.md), [Frontend Architecture](../architecture/FRONTEND.md)
