# The AI Charter

> **A multi-agent governance system for responsible AI deployment.**

Before an AI feature ships, five specialized agents review the proposal, debate each other's findings in a shared Band.ai room, cast a vote, and produce a defensible audit trail. No ad-hoc sign-offs. No opaque decisions.

![Status](https://img.shields.io/badge/status-hackathon%20project-orange) ![Track](https://img.shields.io/badge/hackathon-Regulated%20Workflows-blueviolet) ![Stack](https://img.shields.io/badge/stack-Python%20%2B%20Next.js-blue)

---

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Building / Modifying Agents](#building--modifying-agents)
- [API Endpoints](#api-endpoints)
- [Frontend Pages](#frontend-pages)
- [Tests](#tests)
- [Hackathon Info](#hackathon-info)

---

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url> && cd The-AI-Charter

# 2. Copy and fill in your environment variables
cp .env.example .env
# Edit .env with your Band.ai, Featherless, and AI/ML API keys

# 3. Start everything with Docker
cd docker && docker-compose up --build
```

The stack is now running:

| Service    | URL                       |
| ---------- | ------------------------- |
| Frontend   | http://localhost:3000      |
| Backend    | http://localhost:8001      |
| PostgreSQL | localhost:5433            |
| API Docs   | http://localhost:8001/docs |

---

## Prerequisites

- **Python 3.11+**
- **Node.js 20+** and **pnpm**
- **PostgreSQL 15** (or use Docker)
- **Band.ai account** — [band.ai](https://www.band.ai/) (free tier works; use promo `BANDHACK26` for Pro)
- **Featherless.ai API key** — [featherless.ai](https://featherless.ai/) (promo `BOA26` for $25 credits)
- **AI/ML API key** — [aimlapi.com](https://aimlapi.com/) ($10 credits per participant)
- **Docker + Docker Compose** (recommended) or manage services manually

---

## Environment Setup

Copy `.env.example` to the project root and fill in your keys:

```bash
cp .env.example .env
```

### Required Keys

| Variable              | Purpose                                      | Where to get it               |
| --------------------- | -------------------------------------------- | ----------------------------- |
| `BAND_API_KEY`        | Band.ai room creation and messaging          | [band.ai](https://band.ai)    |
| `FEATHERLESS_API_KEY` | LLM inference for Ethics, Security, Legal    | [featherless.ai](https://featherless.ai) |
| `AIML_API_KEY`        | LLM inference for Product, Compliance        | [aimlapi.com](https://aimlapi.com) |

### Optional Keys

| Variable              | Purpose                                      | Default                       |
| --------------------- | -------------------------------------------- | ----------------------------- |
| `SECURITY_AGENT_API_KEY` | Per-agent Band key (fallback to BAND_API_KEY) | —                             |
| `ETHICS_AGENT_API_KEY`   | Per-agent Band key                            | —                             |
| `LEGAL_AGENT_API_KEY`    | Per-agent Band key                            | —                             |
| `PRODUCT_AGENT_API_KEY`  | Per-agent Band key                            | —                             |
| `COMPLIANCE_AGENT_API_KEY` | Per-agent Band key                          | —                             |
| `FEATHERLESS_MODEL`   | Model ID for Featherless                     | `google/gemma-4-31B-it`       |
| `AIML_MODEL`          | Model ID for AI/ML API                       | `google/gemma-4-31B-it`       |
| `DATABASE_URL`        | PostgreSQL connection string                 | `postgresql://postgres:postgres_password@localhost:5432/charter_db` |
| `JWT_SECRET`          | JWT signing secret                           | `fallback_jwt_secret_hackathon_2026` |

---

## Running Locally

### Option A: Docker Compose (recommended)

```bash
cd docker
docker-compose up --build
```

This starts PostgreSQL, the FastAPI backend (port 8001), and the Next.js frontend (port 3000) in containers.

### Option B: Manual local dev

**Backend:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start PostgreSQL (via Docker or local install)
# Then run migrations and start the server:
alembic upgrade head
uvicorn orchestrator.main:app --reload --port 8000
```

**Frontend:**

```bash
cd web
pnpm install
pnpm dev
```

Frontend runs on http://localhost:3000, backend on http://localhost:8000.

### Option C: End-to-end verification script

```bash
# From project root — starts backend, submits a test proposal, polls agents, prints the governance record
python verify_governance.py
```

---

## Project Structure

```
The-AI-Charter/
├── backend/                        # Python FastAPI backend
│   ├── orchestrator/
│   │   ├── main.py                 # FastAPI app — all HTTP endpoints
│   │   └── session.py              # Band.ai room creation per governance session
│   ├── agents/
│   │   ├── base_agent.py           # BaseGovernanceAgent — shared Band lifecycle
│   │   ├── security/               # Security Agent (reference implementation)
│   │   │   ├── agent.py            # Vote logic, LLM reasoning generation
│   │   │   ├── evaluator.py        # 7 domain evaluators, parallel execution
│   │   │   └── prompts.py          # System/user prompts, domain criteria
│   │   ├── ethics/agent.py         # Ethics Agent (stub — needs implementation)
│   │   ├── legal/agent.py          # Legal Agent (stub — needs implementation)
│   │   ├── product/agent.py        # Product Agent (stub — needs implementation)
│   │   └── compliance/agent.py     # Compliance Agent (stub — needs implementation)
│   ├── shared/
│   │   ├── schemas.py              # Pydantic models (SubmissionPayload, Finding, GovernanceRecord, etc.)
│   │   ├── llm_client.py           # LLM client (Featherless + AI/ML API, retry logic)
│   │   ├── cross_exam_prompts.py   # Cross-examination prompt builder and parser
│   │   ├── models.py               # SQLModel ORM (User, GovernanceRecordModel)
│   │   └── db.py                   # Async SQLAlchemy engine, init/close
│   ├── record/
│   │   └── generator.py            # Compiles Band transcript → GovernanceRecord
│   ├── tests/                      # pytest test suite
│   ├── alembic/                    # Database migrations
│   ├── band.py                     # Band.ai SDK wrapper (BandClient, BandRooms)
│   └── requirements.txt
│
├── web/                            # Next.js 16 frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Landing page + Dashboard
│       │   ├── login/page.tsx      # Login form
│       │   ├── signup/page.tsx     # Registration form
│       │   ├── submit/page.tsx     # Multi-step submission form
│       │   ├── review/[sessionId]/ # Live review with polling
│       │   └── record/[sessionId]/ # Governance record viewer
│       ├── components/
│       │   ├── ui/                 # Badge, Card, Button, Collapsible, ProgressSteps
│       │   ├── submission/         # StepOverview, StepRisk, StepReview (placeholders)
│       │   ├── review/             # AgentCard, ActivityFeed (placeholders)
│       │   └── record/             # AgentVoteCard, FindingsList, VerdictBlock (placeholders)
│       ├── lib/
│       │   ├── api.ts              # All API calls (snake_case ↔ camelCase translation)
│       │   ├── poll.ts             # usePolling hook
│       │   └── utils.ts            # cn() helper
│       ├── types/charter.ts        # All shared TypeScript types
│       └── context/AuthContext.tsx  # Auth state management
│
├── docker/
│   ├── docker-compose.yml          # Postgres + Backend + Frontend
│   ├── Dockerfile.backend          # Python 3.11-slim + uvicorn
│   └── Dockerfile.frontend         # Node 20 + pnpm + Next.js build
│
├── docs/
│   ├── PRODUCT-GUIDE.md            # Full product spec (schemas, API, build order)
│   ├── HACKATHON.md                # Hackathon details, prizes, submission guide
│   └── BRAND_IDENTITY_DESIGN_SYSTEM.md  # UI design system
│
├── thenvoi-mcp/                    # Band.ai MCP server (auto-cloned by run_mcp.sh)
├── .env.example                    # Environment variable template
├── verify_governance.py            # End-to-end verification script
├── run_mcp.sh                      # Band MCP server bootstrap script
└── lefthook.yml                    # Git hooks (currently commented out)
```

---

## How It Works

### The Agent Panel

| Agent               | Focus Area                                                           | LLM Provider    | Status         |
| ------------------- | -------------------------------------------------------------------- | --------------- | -------------- |
| 🔒 **Security**     | Attack surface, data handling, abuse risks, model output safety      | Featherless.ai  | **Implemented** |
| ⚖️ **Ethics**       | Fairness, bias, potential for harm, values alignment                 | Featherless.ai  | Stub           |
| 📜 **Legal**        | Regulatory exposure, IP concerns, jurisdictional requirements        | Featherless.ai  | Stub           |
| 🚀 **Product**      | User impact, UX implications, business rationale                     | AI/ML API       | Stub           |
| ✅ **Compliance**   | Alignment with internal policies and external standards (GDPR, SOC2) | AI/ML API       | Stub           |

### The Workflow

```
Submit → Band Room Created → Independent Review → Cross-Examination → Voting → Governance Record
```

1. **Submit** — A team submits a feature proposal via the web form (`POST /submit`).
2. **Band Room** — The orchestrator creates a Band.ai room and posts the submission as the first message. `room_id` = `sessionId` throughout the system.
3. **Independent Review** — All 5 agents fire concurrently. Each joins the room, runs its LLM evaluation, and posts findings as structured JSON messages.
4. **Cross-Examination** — Each agent reads peer findings from the room. If a peer made a claim in the agent's domain that is wrong or incomplete, it posts a `challenge` message.
5. **Voting** — Each agent casts a vote (`approve` / `reject` / `flag`) as a room message. Vote logic is deterministic Python — no LLM decides the vote.
6. **Governance Record** — The record generator reads the full Band room transcript and compiles it into a `GovernanceRecord` with verdict, conditions, agent records, and cross-examination log.

### Message Types in the Band Room

| Type                 | Posted by      | Content                                            |
| -------------------- | -------------- | -------------------------------------------------- |
| `submission_context` | Orchestrator   | Full submission payload                            |
| `status_update`      | Each agent     | `{ status, agent, emoji }`                         |
| `findings`           | Each agent     | `{ agent, emoji, findings[] }`                     |
| `challenge`          | Each agent     | `{ from_agent, to_agent, challenge, counter_position }` |
| `vote`               | Each agent     | `{ agent, emoji, vote, confidence, reasoning, findings[] }` |

### Verdict Logic

The final verdict is deterministic (no LLM):

| Condition                                       | Verdict                    |
| ----------------------------------------------- | -------------------------- |
| Any agent votes `reject`                        | `rejected`                 |
| All agents vote `approve`                       | `approved`                 |
| Half or more agents vote `flag`                 | `human_review_required`    |
| Otherwise                                       | `conditional_approval`     |

### Architecture

```mermaid
flowchart TD
    classDef app fill:#f0f7ff,stroke:#005ca9,stroke-width:2px,color:#00284d;
    classDef band fill:#fffbeb,stroke:#d97706,stroke-width:2px,color:#451a03;
    classDef compute fill:#faf5ff,stroke:#7e22ce,stroke-width:2px,color:#2e1065;
    classDef storage fill:#f0fdf4,stroke:#166534,stroke-width:2px,color:#14532d;

    subgraph AppLayer ["1. SUBMISSION LAYER"]
        Pipeline(["User / CI-CD Pipeline"]) -->|1. Submission| WebUI["Submission App<br>(Web UI / API)"]
        WebUI -->|2. Init Governance Session| Orchestrator["App Workflow Orchestrator"]
    end

    subgraph BandLayer ["2. BAND.AI RUNTIME COLLABORATION (Steps 2-4)"]
        Room["Band.ai Collaborative Room<br>(Shared Context & Shared State Grid)"]
        subgraph Panel ["Governance Agent Panel"]
            Eth["⚖️ Ethics Agent"]
            Sec["🔒 Security Agent"]
            Leg["📜 Legal Agent"]
            Prod["🚀 Product Agent"]
            Comp["✅ Compliance Agent"]
        end
    end

    Orchestrator -->|3. Inject Context & Open Room| Room
    Room -->|4. Independent Review: Pull Context| Panel

    subgraph ComputeLayer ["3. COMPUTE ENGINE"]
        Feather["Featherless.ai<br>(Specialized OS Models)"]
        AIML["AI/ML API<br>(Commercial Gateways)"]
    end

    Panel -.->|LLM Inference Queries| ComputeLayer

    Panel ==>|5. Adversarial Cross-Examination:<br>Challenge Peer Conclusions & Debates| Room
    Panel -->|6. Final Voting:<br>Approve / Reject / Flag| Room

    subgraph StorageLayer ["4. HARDENED AUDIT TRAIL (Steps 5-6)"]
        Ledger[("Immutable Governance Record DB")]
    end

    Room -->|7. Governance Record:<br>Compile Full Conversation & Voting Trails| RecordGen["Governance Record Generator"]
    RecordGen -->|8. Sign & Persist Trail| Ledger
    RecordGen -->|9. Decision Output Verdict| Pipeline

    class Pipeline,WebUI,Orchestrator,RecordGen app;
    class Room,Eth,Sec,Leg,Prod,Comp band;
    class Feather,AIML compute;
    class Ledger storage;
```

---

## Building / Modifying Agents

The **Security Agent** is the reference implementation. The other four agents (Ethics, Legal, Product, Compliance) follow the exact same pattern.

### Agent Anatomy

Every agent inherits from `BaseGovernanceAgent` (`backend/agents/base_agent.py`) and implements two methods:

```python
class SecurityAgent(BaseGovernanceAgent):
    AGENT_ID = "security"                    # Unique ID (matches env var naming)
    AGENT_NAME = "Security Agent"            # Display name
    AGENT_EMOJI = "🔒"                       # Emoji for UI
    DOMAIN_DESCRIPTION = "attack surface, data handling, ..."  # One-liner for cross-exam prompts

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        """Run LLM-powered domain evaluations. Returns a list of Finding objects."""
        ...

    async def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        """Deterministic vote logic. Returns (vote, confidence, reasoning).
        Vote must be 'approve', 'reject', or 'flag'.
        Confidence must be 'high', 'medium', or 'low'."""
        ...
```

The base class handles the entire Band lifecycle — joining the room, posting status/findings/votes, and running cross-examination. Your subclass only needs `evaluate()` and `_determine_vote()`.

### Step-by-step to add a new agent

1. **Create the agent directory:**

   ```
   backend/agents/<agent_name>/
   ├── __init__.py
   ├── agent.py        # Your agent class
   ├── evaluator.py    # Domain evaluations (LLM calls)
   └── prompts.py      # System/user prompts, domain criteria
   ```

2. **Implement `agent.py`:** Inherit from `BaseGovernanceAgent`. Set the 4 class attributes. Implement `evaluate()` (LLM calls) and `_determine_vote()` (deterministic rules).

3. **Implement `evaluator.py`:** Follow the Security Agent pattern — define domain criteria, make parallel LLM calls per domain, parse JSON responses into `Finding` objects.

4. **Implement `prompts.py`:** Define `SYSTEM_PROMPT`, `REASONING_PROMPT`, domain-specific criteria strings, and a `build_domain_user_prompt()` function.

5. **Register the agent** in `backend/orchestrator/main.py`:
   ```python
   from agents.youragent.agent import YourAgent
   agents = [SecurityAgent, EthicsAgent, LegalAgent, ProductAgent, ComplianceAgent, YourAgent]
   ```

6. **Add LLM routing** in `get_llm_for()` in `main.py` — the function returns an `LLMClient` based on available API keys.

### Key files to reference

| File | What to study |
|------|---------------|
| `backend/agents/base_agent.py` | Band lifecycle, message posting, cross-examination |
| `backend/agents/security/agent.py` | Complete agent implementation with vote logic |
| `backend/agents/security/evaluator.py` | Parallel domain evaluation with rate limiting |
| `backend/agents/security/prompts.py` | Prompt structure, domain criteria format |
| `backend/shared/schemas.py` | `Finding`, `SubmissionPayload`, `AgentRecord` schemas |
| `backend/shared/llm_client.py` | LLM client with retry logic |
| `backend/shared/cross_exam_prompts.py` | Cross-examination prompt builder |

---

## API Endpoints

All endpoints are defined in `backend/orchestrator/main.py`.

### Governance

| Method | Endpoint                | Description                                    |
| ------ | ----------------------- | ---------------------------------------------- |
| POST   | `/submit`               | Submit a proposal. Creates Band room, fires all 5 agents. Returns `{ sessionId }`. |
| GET    | `/status/{session_id}`  | Real-time session status derived from Band room messages. |
| GET    | `/record/{session_id}`  | Compiled governance record. Checks PostgreSQL cache first, falls back to Band transcript. |
| POST   | `/records`              | Cache a governance record to PostgreSQL.        |
| GET    | `/records`              | List all cached governance records (newest first). |

### Auth

| Method | Endpoint         | Description                          |
| ------ | ---------------- | ------------------------------------ |
| POST   | `/auth/register` | Register a new user. Returns JWT.    |
| POST   | `/auth/login`    | Login. Returns JWT.                  |

### Data contracts

The backend uses **snake_case** Python models. The frontend uses **camelCase** TypeScript types. The translation happens in `web/src/lib/api.ts` — never inline type definitions in components; always import from `web/src/types/charter.ts`.

---

## Frontend Pages

| Route                    | Page                         | Description                                          |
| ------------------------ | ---------------------------- | ---------------------------------------------------- |
| `/`                      | Landing / Dashboard          | Animated landing for guests; audit ledger dashboard for authenticated users |
| `/login`                 | Login                        | Email/password authentication                        |
| `/signup`                | Signup                       | Registration with password complexity validation     |
| `/submit`                | Submit Proposal              | 3-step form: Overview → Risk Profile → Compliance    |
| `/review/[sessionId]`    | Live Review                  | Real-time polling of agent statuses and activity feed |
| `/record/[sessionId]`    | Governance Record            | Full audit record: verdict, agent votes, findings, cross-examination log |

---

## Tests

```bash
cd backend

# Run unit tests (fast, no LLM calls)
pytest tests/test_vote_logic.py tests/test_parsers.py -v

# Run all tests
pytest -v

# Run integration test (requires live LLM API keys, takes ~60s)
pytest tests/test_integration.py -v -m integration
```

Tests cover:
- **Vote logic** (`test_vote_logic.py`) — every rule in the Security Agent's `_determine_vote()`
- **JSON parsing** (`test_parsers.py`) — `parse_findings` with clean JSON, fenced JSON, broken JSON, empty arrays
- **Integration** (`test_integration.py`) — full Security Agent against the sample fixture with real LLM calls

---

## Hackathon Info

**Band of Agents Hackathon** — Track 3: Regulated & High-Stakes Workflows

| Detail        | Value                                    |
| ------------- | ---------------------------------------- |
| Deadline      | June 19, 2026, 11:00 AM EDT             |
| Prize Pool    | $10,000+ (1st: $3,500, 2nd: $2,500, 3rd: $1,500) |
| Band Pro promo | `BANDHACK26` (100% off for 1 month)    |
| Featherless promo | `BOA26` ($25 credits)               |

**Submission requirements:** Public GitHub repo, demo video, slide deck, live demo URL, short + long description on lablab.ai.

See [`docs/HACKATHON.md`](./docs/HACKATHON.md) for full details, prizes, and judging criteria.

---

## Contributing

1. Create a feature branch from `main`
2. Follow the existing code patterns — study `backend/agents/security/` before writing new agents
3. Import types from `web/src/types/charter.ts` — never inline types in components
4. Run `pytest` before pushing
5. Open a PR with a clear description of what changed and why

---

## License

TBD.

---

> **Disclaimer:** The AI Charter is a decision-support and documentation tool. It does not replace human judgment, legal counsel, or formal compliance certification. Organizations remain responsible for their own AI governance and regulatory obligations.
