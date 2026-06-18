# ADR-0006: Governance Record Storage Strategy

**Status:** Accepted
**Date:** 2026-06-12

## Context

Governance records are the final audit artifact. They can be compiled on demand from Band room transcripts, but repeated compilation is slow and Band availability is not guaranteed long-term. The dashboard needs a list of historical records without re-reading every Band room.

## Decision

**Two-tier storage with PostgreSQL cache and Band transcript fallback:**

1. `GET /record/{session_id}` checks PostgreSQL `governance_records` table first
2. On cache hit, return stored `record_json` (JSONB)
3. On cache miss, call `generate_record()` which reads the full Band transcript and compiles a `GovernanceRecord`
4. `POST /records` explicitly caches a record (upsert on `session_id`)
5. `GET /records` lists all cached records for the dashboard ledger

Live session status (`GET /status`) always reads Band directly — it is not cached.

## Consequences

**Positive:**

- Dashboard ledger works from DB without Band round-trips
- Records survive Band room lifecycle if cached
- Compilation logic is centralized in `record/generator.py`

**Negative:**

- Cache can be stale if Band transcript updates after caching (unlikely post-completion)
- Records only appear in ledger after explicit cache or first `/record` fetch
- Dual schema path: Alembic migrations + `create_all` on startup

**Related:** [ADR-0001](0001-band-as-collaboration-surface.md), [Backend Architecture](../architecture/BACKEND.md)
