# ADR-0001: Band.ai as Collaboration Surface

**Status:** Accepted
**Date:** 2026-06-12

## Context

The AI Charter requires five independent agents to review a proposal, see each other's findings, challenge conclusions, and produce a shared audit trail. We needed a runtime where agents collaborate with shared context — not five isolated LLM API calls whose outputs are merged afterward.

Band.ai (Thenvoi) provides collaborative rooms with message transcripts, participant management, and agent identity.

## Decision

Band.ai rooms are the **primary collaboration surface and audit transcript source**:

- One room per governance session
- Submission context is the first room message
- Agents post findings, challenges, and votes as typed JSON messages
- Live status (`GET /status`) is derived by reading room messages — no separate status database
- The governance record is compiled from the full room transcript

Band is not a notification layer bolted on after independent evaluations.

## Consequences

**Positive:**

- Genuine multi-agent collaboration with visible cross-examination
- Single source of truth for session state and audit trail
- Demo-friendly: judges can inspect the Band room transcript

**Negative:**

- Hard dependency on Band.ai availability and API keys
- Mock fallback mode (`mock-room-*`) provides degraded local dev without keys
- Session status requires polling Band transcript on every status request

**Related:** [ADR-0003](0003-session-id-equals-band-room-id.md), [ADR-0006](0006-governance-record-storage-strategy.md)
