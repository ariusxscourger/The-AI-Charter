# ADR-0005: LLM Provider Fallback Chain

**Status:** Accepted
**Date:** 2026-06-12

## Context

Hackathon participants have access to multiple LLM providers (OpenRouter, Featherless, AI/ML API) with different promo credits. The system must work during local development even when no keys are configured, and should prefer the best available provider without per-agent configuration complexity.

## Decision

A **global provider priority chain** in `get_llm_for()` ([`orchestrator/main.py`](../../backend/orchestrator/main.py)):

```
1. OPENROUTER_API_KEY  → OpenRouter client
2. FEATHERLESS_API_KEY → Featherless client
3. AIML_API_KEY        → AI/ML API client
4. (none)              → dummy client (api_key="dummy")
```

All five agents share the same provider instance for a given request. Per-agent LLM routing (e.g. Product → AI/ML API only) is **not** implemented.

Agent evaluation failures are caught gracefully: empty findings, fallback `flag` vote.

## Consequences

**Positive:**

- Works out of the box for UI development without LLM keys
- Simple configuration: set any one key
- Hackathon-friendly: participants use whichever provider they have credits for

**Negative:**

- Cannot mix providers per agent without code changes
- Dummy fallback produces empty evaluations (agents still run but findings are vacuous)
- `FEATHERLESS_BASE_URL` / `AIML_BASE_URL` env vars are ignored (URLs hardcoded in `llm_client.py`)

**Related:** [Environment Variables](../setup/ENVIRONMENT.md)
