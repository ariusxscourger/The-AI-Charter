# ADR-0005: LLM Provider Selection

**Status:** Accepted
**Date:** 2026-06-12

## Context

Hackathon participants have access to multiple LLM providers (OpenRouter, Featherless, AI/ML API) with different promo credits. The system must work during local development even when no keys are configured, and should use the provider implied by the configured key without per-agent configuration complexity.

## Decision

A **global provider selection** in `get_llm_for()` ([`orchestrator/main.py`](../../backend/orchestrator/main.py)):

```
1. Exactly one configured provider key → that provider
2. Multiple configured provider keys + LLM_PROVIDER → selected provider
3. Multiple configured provider keys without LLM_PROVIDER → configuration error
4. No configured provider keys → dummy client (api_key="dummy")
```

`LLM_PROVIDER` accepts `openrouter`, `featherless`, or `aiml`.

All five agents share the same provider instance for a given request. Per-agent LLM routing (e.g. Product → AI/ML API only) is **not** implemented.

Agent evaluation failures are caught gracefully: empty findings, fallback `flag` vote.

## Consequences

**Positive:**

- Works out of the box for UI development without LLM keys
- Simple configuration: set any one key, or set `LLM_PROVIDER` when multiple keys exist
- Hackathon-friendly: participants use whichever provider they have credits for

**Negative:**

- Cannot mix providers per agent without code changes
- Multiple configured keys require one explicit selector
- Dummy fallback produces empty evaluations (agents still run but findings are vacuous)
- `FEATHERLESS_BASE_URL` / `AIML_BASE_URL` env vars are ignored (URLs hardcoded in `llm_client.py`)

**Related:** [Environment Variables](../setup/ENVIRONMENT.md)
