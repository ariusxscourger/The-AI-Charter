# ADR-0003: Session ID Equals Band Room ID

**Status:** Accepted
**Date:** 2026-06-12

## Context

The system spans frontend URLs, API endpoints, Band.ai rooms, and PostgreSQL records. Using different identifiers for the same governance session would require mapping tables and increase bug surface.

## Decision

**`sessionId` in the API and frontend is identical to the Band.ai `room_id`.**

- `POST /submit` returns `{ "sessionId": room.id }` where `room.id` comes from `band_client.rooms.create()`
- `GET /status/{session_id}` and `GET /record/{session_id}` use the same ID to read the Band room
- Frontend routes use this ID: `/review/{sessionId}`, `/dashboard/record/{sessionId}`
- PostgreSQL `governance_records.session_id` is the same value

No separate session table or ID mapping layer.

## Consequences

**Positive:**

- Simple mental model: one ID everywhere
- URLs are directly traceable to Band rooms
- No sync issues between session store and Band

**Negative:**

- Session IDs are Band-generated UUIDs (not human-friendly reference codes — those are `reference_id` on the governance record)
- Tight coupling to Band room lifecycle

**Related:** [ADR-0001](0001-band-as-collaboration-surface.md), [API Contracts](../design/API_CONTRACTS.md)
