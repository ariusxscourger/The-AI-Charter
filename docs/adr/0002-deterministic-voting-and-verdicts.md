# ADR-0002: Deterministic Voting and Verdicts

**Status:** Accepted
**Date:** 2026-06-12

## Context

Governance decisions for regulated AI workflows must be explainable, reproducible, and defensible. If both findings and final votes are LLM-generated, the same submission could produce different outcomes on re-run, undermining audit credibility.

## Decision

**LLM generates findings and reasoning text. Python code determines votes and final verdicts.**

- Each agent's `_determine_vote()` is deterministic Python based on findings severity and domain rules
- Final verdict in `record/generator.py` `_determine_verdict()` applies fixed rules:

| Condition | Verdict |
|-----------|---------|
| Any `reject` vote | `rejected` |
| All `approve` votes | `approved` |
| ≥ half vote `flag` | `human_review_required` |
| Otherwise | `conditional_approval` |

LLM may generate the *reasoning string* attached to a vote, but the vote value itself comes from code.

## Consequences

**Positive:**

- Reproducible outcomes given the same findings
- Testable vote logic (`test_vote_logic.py`, per-agent vote tests)
- Clear separation: LLM advises, code decides

**Negative:**

- Vote rules must be maintained manually per agent domain
- Nuanced edge cases may require rule updates rather than prompt tuning

**Related:** [Agents](../architecture/AGENTS.md), [`record/generator.py`](../../backend/record/generator.py)
