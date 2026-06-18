# Governance Agents

Five specialized agents form the governance panel. Each inherits from [`BaseGovernanceAgent`](../../backend/agents/base_agent.py) and implements domain-specific evaluation and vote logic.

---

## Agent panel

| Agent | `AGENT_ID` | Emoji | Implementation |
|-------|------------|-------|----------------|
| Security | `security` | 🔒 | Reference implementation — full evaluator + vote rules |
| Ethics | `ethics` | ⚖️ | Full implementation |
| Legal | `legal` | 📜 | Full implementation |
| Product | `product` | 🚀 | Full implementation |
| Compliance | `compliance` | ✅ | Full implementation |

All agents are registered in [`orchestrator/main.py`](../../backend/orchestrator/main.py):

```python
agents = [SecurityAgent, EthicsAgent, LegalAgent, ProductAgent, ComplianceAgent]
```

---

## Lifecycle

Each agent follows this sequence via `BaseGovernanceAgent.run()`:

```
join room → post status (reviewing) → evaluate (LLM) → post findings
    → cross-examine peers → determine vote (Python) → post vote
```

### Methods subclasses must implement

| Method | Purpose |
|--------|---------|
| `evaluate(submission)` | Run LLM-powered domain evaluations; return `list[Finding]` |
| `_determine_vote(findings, submission)` | Deterministic vote logic; return `(vote, confidence, reasoning)` |

Vote must be `approve`, `reject`, or `flag`. Confidence must be `high`, `medium`, or `low`.

### What the base class handles

- Joining the Band room
- Posting `status_update`, `findings`, `challenge`, and `vote` messages
- Cross-examination: reading peer findings, calling LLM to decide challenges
- Error fallbacks: empty findings on eval failure, `flag` vote on vote failure

---

## Band message types

| Type | Posted by | Content |
|------|-----------|---------|
| `submission_context` | Orchestrator | Full submission payload |
| `status_update` | Each agent | `{ status, agent, emoji }` |
| `findings` | Each agent | `{ agent, emoji, findings[] }` |
| `challenge` | Each agent | `{ from_agent, to_agent, challenge, counter_position }` |
| `vote` | Each agent | `{ agent, emoji, vote, confidence, reasoning, findings[] }` |

---

## Agent anatomy

Each agent directory follows this structure:

```
backend/agents/{name}/
├── __init__.py
├── agent.py        # Agent class (evaluate + _determine_vote)
├── evaluator.py    # Parallel domain evaluations (LLM calls)
└── prompts.py      # System/user prompts, domain criteria
```

**Start here when building a new agent:** [`backend/agents/security/`](../../backend/agents/security/)

---

## Cross-examination

After posting findings, each agent:

1. Reads all peer messages from the Band room
2. Filters to findings in its domain that may be wrong or incomplete
3. Uses LLM (via `cross_exam_prompts.py`) to generate challenges
4. Posts `challenge` messages to the room

---

## Verdict logic

Final verdict is computed in [`record/generator.py`](../../backend/record/generator.py) — **deterministic, no LLM**:

| Condition | Verdict |
|-----------|---------|
| Any agent votes `reject` | `rejected` |
| All agents vote `approve` | `approved` |
| Half or more vote `flag` | `human_review_required` |
| Otherwise | `conditional_approval` |

Individual agent votes are also deterministic Python in each agent's `_determine_vote()`. See [ADR 0002](../adr/0002-deterministic-voting-and-verdicts.md).

---

## LLM usage

- **LLM is used for:** domain evaluations, cross-examination reasoning, vote *reasoning text*
- **LLM is NOT used for:** final vote decision, final verdict

All agents currently share the same LLM provider (global key priority). Per-agent routing is not implemented.

---

## Adding a new agent

1. Create `backend/agents/{name}/` with `agent.py`, `evaluator.py`, `prompts.py`
2. Inherit from `BaseGovernanceAgent`; set `AGENT_ID`, `AGENT_NAME`, `AGENT_EMOJI`, `DOMAIN_DESCRIPTION`
3. Register in `orchestrator/main.py` `agents` list
4. Add `{NAME}_AGENT_ID` to `.env` for Band room invites
5. Add tests following `test_vote_logic.py` / `test_compliance_agent.py` patterns

---

## Related

- [Backend Architecture](BACKEND.md)
- [ADR 0001 — Band as collaboration surface](../adr/0001-band-as-collaboration-surface.md)
- [ADR 0002 — Deterministic voting](../adr/0002-deterministic-voting-and-verdicts.md)
- [Product Guide — Agent section](../PRODUCT-GUIDE.md)
