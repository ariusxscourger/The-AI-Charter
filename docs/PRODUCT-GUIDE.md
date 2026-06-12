# The AI Charter — Product Guide

> **Single source of truth for Claude Code / AntiGravity / AI Models.**
> Stack: Next.js 15 / TypeScript / Tailwind v4 (web) · Python 3.11 / FastAPI (backend) · Band.ai SDK (agent collaboration) · Featherless.ai + AI/ML API (LLM inference).
> Hackathon: Band of Agents — Track 3: Regulated & High-Stakes Workflows (June 12–19, 2026).

---

## 1. What We're Building

The AI Charter is a multi-agent governance system that reviews proposed AI feature releases. Before a feature ships, a panel of five specialized agents — each representing a distinct governance perspective — independently evaluates the proposal, posts findings into a shared Band.ai room, challenges each other's conclusions, and casts a vote. The entire session is recorded as a permanent governance audit trail.

**The three components you are building:**

| Component                     | Stack                           | Your role                                                        |
| ----------------------------- | ------------------------------- | ---------------------------------------------------------------- |
| **Web App**                   | Next.js / TypeScript / Tailwind | Submission form, live review view, governance record viewer      |
| **Security Agent**            | Python / FastAPI                | One of the five governance agents — security domain              |
| **Orchestrator + Base Agent** | Python / FastAPI                | Session management, Band room lifecycle, shared agent base class |

The other four agents (Ethics, Legal, Product, Compliance) follow the exact same pattern as the Security Agent. Build Security first; the rest are the same structure with different prompts and vote rules.

---

## 2. How the System Works

### The Full Flow

```
User fills form (Web App)
        │
        ▼
POST /submit (Orchestrator)
        │
        ├── Creates Band.ai Room (room_id = session_id)
        ├── Injects submission as first room message
        └── Spawns all 5 agents concurrently
                │
                ├── Each agent joins the Band room
                ├── Each agent calls its LLM (Featherless / AI/ML API) for evaluation
                ├── Each agent posts findings to the Band room
                ├── Each agent reads peer findings → may post a challenge
                └── Each agent posts its final vote to the Band room
                        │
                        ▼
            All 5 votes in the room
                        │
                        ▼
            Record Generator reads Band room transcript
                        │
                        ▼
            Writes GovernanceRecord to DB + returns verdict
                        │
                        ▼
            Web App displays Governance Record
```

### Why Band Is Central

Band is not a notification layer at the end. It IS the collaboration surface. The room is where:

- Submission context lives (broadcast to all agents)
- Agents post findings (visible to all peers)
- Cross-examination challenges happen (agent-to-agent, through the room)
- Final votes are cast
- The full transcript becomes the audit trail

Without Band, this is 5 isolated LLM calls. With Band, it's a genuinely collaborative multi-agent review.

### Band Concepts for This Project

| Concept        | Role in this project                                                       |
| -------------- | -------------------------------------------------------------------------- |
| **Room**       | One per governance session. `room_id` = `sessionId` throughout the system. |
| **Agent**      | Each of the 5 governance agents is a Band-connected participant.           |
| **Message**    | Typed structured JSON payloads posted by each agent.                       |
| **Transcript** | Full ordered log of all room messages → source for the governance record.  |

### Agent Lifecycle (per agent, per session)

```
join room
    → post status: "reviewing"
    → run LLM evaluation (parallel domain calls, pure Python — no Band)
    → post findings to room
    → read peer findings from room
    → if challenge warranted → post challenge to room
    → determine vote (deterministic Python rules — no LLM)
    → post vote to room
```

### Message Types in the Room

| type                 | Posted by    | Content                                                     |
| -------------------- | ------------ | ----------------------------------------------------------- |
| `submission_context` | Orchestrator | Full submission payload                                     |
| `status_update`      | Each agent   | `{ status, agent }`                                         |
| `findings`           | Each agent   | `{ agent, emoji, findings[] }`                              |
| `challenge`          | Each agent   | `{ from_agent, target_agent, challenge, counter_position }` |
| `vote`               | Each agent   | `{ agent, emoji, vote, confidence, reasoning, findings[] }` |

---

## 3. Tech Stack & Environment

### Backend (Python)

```
Python        3.11+
FastAPI       async HTTP server
Pydantic v2   data validation and schemas
Band SDK      room management, agent messaging (install from Band docs)
httpx         async HTTP for LLM calls
pytest        testing
```

### Frontend (Next.js)

```
Next.js       14+ (App Router)
TypeScript    strict mode
Tailwind CSS  styling only — no component library
```

### LLM Routing

| Agent         | LLM Provider   |
| ------------- | -------------- |
| ⚖️ Ethics     | Featherless.ai |
| 🔒 Security   | Featherless.ai |
| 📜 Legal      | Featherless.ai |
| 🚀 Product    | AI/ML API      |
| ✅ Compliance | AI/ML API      |

Featherless target model: `mistralai/Mistral-7B-Instruct-v0.2` (or equivalent instruction-following model that supports JSON output).

### Environment Variables

```env
# Band
BAND_API_KEY=your_band_api_key
BAND_WORKSPACE_ID=your_workspace_id

# LLM
FEATHERLESS_API_KEY=your_featherless_key
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
AIML_API_KEY=your_aiml_key
AIML_BASE_URL=https://api.aimlapi.com/v1

# Web App
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_POLL_INTERVAL_MS=3000
```

---

## 4. Project Structure

```
ai_charter/
├── web/                              # Next.js web app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing
│   │   │   ├── submit/page.tsx       # Multi-step submission form
│   │   │   ├── review/[sessionId]/page.tsx   # Live review
│   │   │   └── record/[sessionId]/page.tsx   # Governance record
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Collapsible.tsx
│   │   │   │   └── ProgressSteps.tsx
│   │   │   ├── submission/
│   │   │   │   ├── StepOverview.tsx
│   │   │   │   ├── StepRisk.tsx
│   │   │   │   └── StepReview.tsx
│   │   │   ├── review/
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   └── ActivityFeed.tsx
│   │   │   └── record/
│   │   │       ├── AgentVoteCard.tsx
│   │   │       ├── FindingsList.tsx
│   │   │       └── VerdictBlock.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                # All fetch calls, typed
│   │   │   └── poll.ts               # usePolling hook
│   │   └── types/
│   │       └── charter.ts            # All shared TypeScript types
│   └── package.json
│
├── backend/
│   ├── orchestrator/
│   │   ├── main.py                   # FastAPI app — POST /submit, GET /status, GET /record
│   │   └── session.py                # GovernanceSession — Band room creation
│   ├── agents/
│   │   ├── base_agent.py             # BaseGovernanceAgent — Band lifecycle
│   │   ├── security/
│   │   │   ├── agent.py              # SecurityAgent
│   │   │   ├── evaluator.py          # 7 domain evaluations, parallel
│   │   │   └── prompts.py            # Domain criteria strings
│   │   ├── ethics/
│   │   │   └── agent.py              # EthicsAgent (same structure)
│   │   ├── legal/
│   │   │   └── agent.py
│   │   ├── product/
│   │   │   └── agent.py
│   │   └── compliance/
│   │       └── agent.py
│   ├── shared/
│   │   ├── schemas.py                # All Pydantic models
│   │   ├── llm_client.py             # LLM client wrapper (Featherless + AI/ML API)
│   │   └── cross_exam_prompts.py     # Shared cross-examination prompt builder
│   ├── record/
│   │   └── generator.py              # Reads Band transcript → GovernanceRecord
│   ├── tests/
│   │   ├── test_vote_logic.py
│   │   ├── test_parsers.py
│   │   └── fixtures/
│   │       └── sample_submission.json
│   └── requirements.txt
```

---

## 5. Shared Data Contracts

### 5.1 Python Schemas (`backend/shared/schemas.py`)

```python
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


class SubmissionPayload(BaseModel):
    feature_name: str
    description: str
    intended_use: str
    feature_type: Literal[
        "new_feature", "model_change", "prompt_change", "integration", "other"
    ]
    affected_systems: list[str]
    data_sources: str
    pii_involved: Literal["yes", "no", "unknown"]
    third_party_deps: Optional[str] = None
    existing_risk_assessment: Optional[str] = None
    jurisdiction: list[str]
    compliance_targets: Optional[list[str]] = None


class Finding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    domain: str                            # Which evaluation domain produced this
    severity: Literal["critical", "high", "medium", "low", "info"]
    title: str                             # Short, specific — max 80 chars
    detail: str                            # 2–5 sentence explanation
    recommendation: Optional[str] = None  # Concrete mitigation step


class AgentRecord(BaseModel):
    agent_id: str
    agent_name: str
    agent_emoji: str
    vote: Literal["approve", "reject", "flag"]
    confidence: Literal["high", "medium", "low"]
    reasoning: str
    findings: list[Finding]
    completed_at: str


class CrossExamEntry(BaseModel):
    timestamp: str
    from_agent: str
    to_agent: str
    challenge: str
    counter_position: str


class GovernanceRecord(BaseModel):
    reference_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:12].upper())
    session_id: str
    feature_name: str
    created_at: str
    completed_at: str
    verdict: Literal["approved", "rejected", "conditional_approval", "human_review_required"]
    conditions: Optional[list[str]] = None
    submission: SubmissionPayload
    agent_records: list[AgentRecord]
    cross_examination_log: list[CrossExamEntry] = []
```

### 5.2 TypeScript Types (`web/src/types/charter.ts`)

```typescript
export type SubmissionPayload = {
  featureName: string;
  description: string;
  intendedUse: string;
  featureType:
    | "new_feature"
    | "model_change"
    | "prompt_change"
    | "integration"
    | "other";
  affectedSystems: string[];
  dataSources: string;
  piiInvolved: "yes" | "no" | "unknown";
  thirdPartyDeps?: string;
  existingRiskAssessment?: string;
  jurisdiction: string[];
  complianceTargets?: string[];
};

export type Vote = "approve" | "reject" | "flag";
export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type AgentStatus = "pending" | "reviewing" | "voted";
export type Verdict =
  | "approved"
  | "rejected"
  | "conditional_approval"
  | "human_review_required";
export type Confidence = "high" | "medium" | "low";

export type Finding = {
  id: string;
  domain: string;
  severity: Severity;
  title: string;
  detail: string;
  recommendation?: string;
};

export type SessionStatus = {
  sessionId: string;
  featureName: string;
  status: "pending" | "reviewing" | "complete" | "error";
  agents: {
    id: string;
    name: string;
    emoji: string;
    status: AgentStatus;
    vote?: Vote;
  }[];
  activityFeed: {
    timestamp: string;
    agentId: string;
    message: string;
  }[];
};

export type AgentRecord = {
  agentId: string;
  name: string;
  emoji: string;
  vote: Vote;
  confidence: Confidence;
  reasoning: string;
  findings: Finding[];
  completedAt: string;
};

export type CrossExamEntry = {
  timestamp: string;
  fromAgent: string;
  toAgent: string;
  challenge: string;
  counterPosition: string;
};

export type GovernanceRecord = {
  referenceId: string;
  sessionId: string;
  featureName: string;
  createdAt: string;
  completedAt: string;
  verdict: Verdict;
  conditions?: string[];
  submission: SubmissionPayload;
  agentRecords: AgentRecord[];
  crossExaminationLog: CrossExamEntry[];
};
```

**All types live in `charter.ts`. Never inline type definitions in components. Import from here everywhere.**

---

## 6. Backend: LLM Client (`backend/shared/llm_client.py`)

```python
import httpx
import asyncio
from typing import Literal

class LLMClient:
    def __init__(
        self,
        provider: Literal["featherless", "aiml"],
        api_key: str,
        model: str
    ):
        self.provider = provider
        self.api_key = api_key
        self.model = model
        self.base_url = (
            "https://api.featherless.ai/v1"
            if provider == "featherless"
            else "https://api.aimlapi.com/v1"
        )

    async def complete(self, system: str, user: str) -> str:
        """
        Makes a chat completion request.
        Returns raw text response.
        Retries up to 3 times with exponential backoff (1s, 2s, 4s) on 5xx or timeout.
        Raises LLMClientError after 3 failures.
        Timeout: 30 seconds per attempt.
        """
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            "temperature": 0.2,  # Low temperature for consistent structured output
        }
        headers = {"Authorization": f"Bearer {self.api_key}"}

        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        f"{self.base_url}/chat/completions",
                        json=payload,
                        headers=headers
                    )
                    resp.raise_for_status()
                    return resp.json()["choices"][0]["message"]["content"]
            except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
                if attempt == 2:
                    raise LLMClientError(f"LLM call failed after 3 attempts: {e}")
                await asyncio.sleep(2 ** attempt)

class LLMClientError(Exception):
    pass
```

---

## 7. Backend: Orchestrator

### 7.1 Session Management (`backend/orchestrator/session.py`)

The orchestrator is the **only** component that creates Band rooms. Agents join rooms — they never create them.

```python
from band import BandClient  # Check actual import from Band SDK docs
from shared.schemas import SubmissionPayload

class GovernanceSession:
    def __init__(self, band_client: BandClient, submission: SubmissionPayload):
        self.band = band_client
        self.submission = submission
        self.room_id: str | None = None

    async def open(self) -> str:
        """
        1. Create a Band room named after the feature
        2. Post submission payload as the first room message (type: submission_context)
        3. Return room_id — this becomes the sessionId throughout the system
        """
        room = await self.band.rooms.create(
            name=f"Review: {self.submission.feature_name}"
        )
        self.room_id = room.id

        await self.band.rooms.post_message(
            room_id=self.room_id,
            role="orchestrator",
            type="submission_context",
            content=self.submission.model_dump()
        )
        return self.room_id

    async def close(self):
        if self.room_id:
            await self.band.rooms.close(self.room_id)
```

**⚠️ Band SDK note:** The method names above (`rooms.create`, `rooms.post_message`, etc.) are illustrative. Read the actual Band SDK docs and hacker guide to get the real method signatures before writing any code that uses Band. Treat these as the interface contract — implement against the real SDK.

### 7.2 FastAPI Entry Point (`backend/orchestrator/main.py`)

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from shared.schemas import SubmissionPayload, GovernanceRecord
from orchestrator.session import GovernanceSession
from record.generator import generate_record
from agents.security.agent import SecurityAgent
from agents.ethics.agent import EthicsAgent
from agents.legal.agent import LegalAgent
from agents.product.agent import ProductAgent
from agents.compliance.agent import ComplianceAgent

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Initialise Band client and all 5 agents at startup
band_client = BandClient(api_key=os.environ["BAND_API_KEY"])
agents = [SecurityAgent, EthicsAgent, LegalAgent, ProductAgent, ComplianceAgent]


@app.post("/submit")
async def submit(payload: SubmissionPayload):
    session = GovernanceSession(band_client, payload)
    room_id = await session.open()

    # Fire all agents concurrently — do not await, return room_id immediately
    asyncio.gather(*[
        AgentClass(band_client, get_llm_for(AgentClass)).run(room_id, payload)
        for AgentClass in agents
    ])

    return {"sessionId": room_id}


@app.get("/status/{session_id}")
async def get_status(session_id: str):
    """
    Reads Band room messages to construct SessionStatus.
    The Band room IS the state — no separate DB needed for status.
    """
    messages = await band_client.rooms.get_messages(session_id)
    if not messages:
        raise HTTPException(status_code=404, detail="Session not found")

    # Derive agent status from status_update and vote messages
    agents_status = build_agent_status(messages)
    feed = build_activity_feed(messages)
    all_voted = all(a["status"] == "voted" for a in agents_status)

    return {
        "sessionId": session_id,
        "featureName": extract_feature_name(messages),
        "status": "complete" if all_voted else "reviewing",
        "agents": agents_status,
        "activityFeed": feed
    }


@app.get("/record/{session_id}")
async def get_record(session_id: str):
    """Compile and return the full governance record from the Band transcript."""
    return await generate_record(session_id, band_client)
```

---

## 8. Backend: Base Agent (`backend/agents/base_agent.py`)

All 5 agents inherit from this class. It owns the entire Band lifecycle. Each subclass only needs to implement `evaluate()` and `_determine_vote()`.

```python
from shared.schemas import SubmissionPayload, Finding
from shared.llm_client import LLMClient
from shared.cross_exam_prompts import build_cross_exam_prompt, parse_challenge

class BaseGovernanceAgent:
    AGENT_ID: str        # Override: "security", "ethics", etc.
    AGENT_NAME: str      # Override: "Security Agent", etc.
    AGENT_EMOJI: str     # Override: "🔒", "⚖️", etc.
    DOMAIN_DESCRIPTION: str  # Override: one-line domain summary for cross-exam prompt

    def __init__(self, band_client, llm_client: LLMClient):
        self.band = band_client
        self.llm = llm_client

    # ─── Main lifecycle ───────────────────────────────────────────────────────

    async def run(self, room_id: str, submission: SubmissionPayload):
        await self._join(room_id)
        await self._post_status(room_id, "reviewing")

        findings = await self.evaluate(submission)          # subclass implements
        await self._post_findings(room_id, findings)

        await self._cross_examine(room_id)

        vote, confidence, reasoning = self._determine_vote(findings, submission)  # subclass implements
        await self._post_vote(room_id, vote, confidence, reasoning, findings)

    # ─── To be implemented by subclasses ─────────────────────────────────────

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        raise NotImplementedError

    def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        # Returns (vote, confidence, reasoning)
        raise NotImplementedError

    # ─── Band messaging helpers ───────────────────────────────────────────────

    async def _join(self, room_id: str):
        await self.band.rooms.join(room_id, agent_id=self.AGENT_ID)

    async def _post_status(self, room_id: str, status: str):
        await self.band.rooms.post_message(
            room_id=room_id,
            role=self.AGENT_ID,
            type="status_update",
            content={"status": status, "agent": self.AGENT_NAME, "emoji": self.AGENT_EMOJI}
        )

    async def _post_findings(self, room_id: str, findings: list[Finding]):
        await self.band.rooms.post_message(
            room_id=room_id,
            role=self.AGENT_ID,
            type="findings",
            content={
                "agent": self.AGENT_NAME,
                "emoji": self.AGENT_EMOJI,
                "findings": [f.model_dump() for f in findings]
            }
        )

    async def _post_vote(self, room_id, vote, confidence, reasoning, findings):
        await self.band.rooms.post_message(
            room_id=room_id,
            role=self.AGENT_ID,
            type="vote",
            content={
                "agent": self.AGENT_NAME,
                "emoji": self.AGENT_EMOJI,
                "vote": vote,
                "confidence": confidence,
                "reasoning": reasoning,
                "findings": [f.model_dump() for f in findings]
            }
        )

    # ─── Cross-examination ────────────────────────────────────────────────────

    async def _cross_examine(self, room_id: str):
        """
        Read peer findings from the Band room.
        If a challenge is warranted, post it.
        This is genuine agent-to-agent communication through Band.
        """
        all_messages = await self.band.rooms.get_messages(
            room_id=room_id,
            type_filter="findings"
        )
        peer_messages = [m for m in all_messages if m.role != self.AGENT_ID]

        if not peer_messages:
            return  # No peers have posted findings yet — skip cross-exam

        system, user = build_cross_exam_prompt(
            this_agent=self.AGENT_NAME,
            this_domain=self.DOMAIN_DESCRIPTION,
            peer_messages=peer_messages
        )
        raw = await self.llm.complete(system, user)
        challenge = parse_challenge(raw)

        if challenge and challenge.get("should_challenge"):
            await self.band.rooms.post_message(
                room_id=room_id,
                role=self.AGENT_ID,
                type="challenge",
                content={
                    "from_agent": self.AGENT_NAME,
                    "to_agent": challenge["target_agent"],
                    "finding_title": challenge["finding_title"],
                    "challenge": challenge["challenge"],
                    "counter_position": challenge["your_counter_position"]
                }
            )
```

### Cross-Examination Prompts (`backend/shared/cross_exam_prompts.py`)

````python
import json

def build_cross_exam_prompt(
    this_agent: str,
    this_domain: str,
    peer_messages: list
) -> tuple[str, str]:
    peer_text = "\n\n".join([
        f"--- {m.content['agent']} ---\n" + "\n".join([
            f"[{f['severity'].upper()}] {f['title']}: {f['detail']}"
            for f in m.content.get("findings", [])
        ])
        for m in peer_messages
    ])

    system = f"""You are the {this_agent} on an AI governance review panel.
Your domain is: {this_domain}.
You have completed your own evaluation and are now reviewing peer findings.
Respond ONLY in valid JSON. No preamble, no markdown fences."""

    user = f"""Peer findings so far:

{peer_text}

Should you raise a formal challenge based on your expertise in {this_domain}?
Challenge when: a peer made a claim in your domain that is wrong or incomplete,
or there is a genuine conflict between your finding and a peer's finding.

If yes:
{{
  "should_challenge": true,
  "target_agent": "<agent name>",
  "finding_title": "<specific finding being challenged>",
  "challenge": "<2-4 sentence challenge>",
  "your_counter_position": "<what you believe is correct>"
}}

If no:
{{"should_challenge": false}}"""

    return system, user


def parse_challenge(raw: str) -> dict | None:
    """Strip fences, parse JSON, return dict or None on failure."""
    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(clean)
    except Exception:
        return None
````

---

## 9. Backend: Security Agent

### 9.1 Agent Class (`backend/agents/security/agent.py`)

```python
from agents.base_agent import BaseGovernanceAgent
from shared.schemas import SubmissionPayload, Finding
from agents.security.evaluator import evaluate_all_domains
from agents.security.prompts import REASONING_PROMPT

class SecurityAgent(BaseGovernanceAgent):
    AGENT_ID = "security"
    AGENT_NAME = "Security Agent"
    AGENT_EMOJI = "🔒"
    DOMAIN_DESCRIPTION = "attack surface, data handling, authentication, abuse risks, and model output safety"

    async def evaluate(self, submission: SubmissionPayload) -> list[Finding]:
        """Run all 7 security domain evaluations in parallel via Featherless.ai."""
        return await evaluate_all_domains(submission, self.llm)

    def _determine_vote(
        self, findings: list[Finding], submission: SubmissionPayload
    ) -> tuple[str, str, str]:
        """
        Deterministic vote rules. LLM is NOT involved in the vote decision.
        Applied in order — first matching rule wins.
        """
        severities = [f.severity for f in findings]

        if "critical" in severities:
            vote, confidence = "reject", "high"
        elif severities.count("high") >= 2:
            vote, confidence = "reject", "high"
        elif "high" in severities:
            vote, confidence = "flag", "high"
        elif severities.count("medium") >= 3 and submission.pii_involved == "yes":
            vote, confidence = "flag", "medium"
        elif severities:
            vote, confidence = "approve", "medium"
        else:
            # No findings at all — always surface something, so flag confidence low
            vote, confidence = "approve", "low"

        reasoning = self._generate_reasoning_sync(findings, vote, submission)
        return vote, confidence, reasoning

    def _generate_reasoning_sync(self, findings, vote, submission) -> str:
        """
        Short synchronous LLM call to produce the 3–6 sentence narrative.
        This is the ONLY LLM call not in evaluate() — it summarises, it doesn't decide.
        """
        # Build a brief findings summary for the prompt
        summary = "; ".join([f"[{f.severity}] {f.title}" for f in findings[:5]])
        prompt_user = (
            f"Feature: {submission.feature_name}\n"
            f"Security findings: {summary if summary else 'None identified'}\n"
            f"Vote: {vote.upper()}\n\n"
            "Write a 3–6 sentence reasoning narrative explaining this vote. "
            "Be specific. Reference the actual findings. Do not use bullet points."
        )
        import asyncio
        return asyncio.run(self.llm.complete(REASONING_PROMPT, prompt_user))
```

### 9.2 Domain Evaluator (`backend/agents/security/evaluator.py`)

````python
import asyncio
import json
from shared.schemas import SubmissionPayload, Finding
from shared.llm_client import LLMClient
from agents.security.prompts import SYSTEM_PROMPT, DOMAIN_CRITERIA, build_domain_user_prompt

DOMAINS = [
    "data_handling",
    "attack_surface",
    "abuse_misuse",
    "auth_authorization",
    "third_party_deps",
    "logging_monitoring",
    "model_output_safety",
]


async def evaluate_all_domains(
    submission: SubmissionPayload,
    llm: LLMClient
) -> list[Finding]:
    """
    Runs all 7 domain evaluations concurrently.
    Each domain is a separate LLM call — more focused, easier to debug.
    Per-domain failures return [] and log a warning rather than crashing.
    """
    tasks = [evaluate_domain(domain, submission, llm) for domain in DOMAINS]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    findings = []
    for domain, result in zip(DOMAINS, results):
        if isinstance(result, Exception):
            print(f"[WARN] Domain {domain} failed: {result}")
        else:
            findings.extend(result)
    return findings


async def evaluate_domain(
    domain: str,
    submission: SubmissionPayload,
    llm: LLMClient
) -> list[Finding]:
    system = SYSTEM_PROMPT.format(
        domain_label=domain.replace("_", " ").title(),
        domain_criteria=DOMAIN_CRITERIA[domain]
    )
    user = build_domain_user_prompt(domain, submission)
    raw = await llm.complete(system, user)
    return parse_findings(raw, domain)


def parse_findings(raw: str, domain: str) -> list[Finding]:
    """
    Resilient parser. Steps:
    1. Strip markdown fences if present
    2. json.loads
    3. Validate each item with Finding schema
    4. Drop invalid items with a warning
    5. Return validated list (may be empty — never raises)
    """
    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        items = json.loads(clean)
        if not isinstance(items, list):
            return []
        findings = []
        for item in items:
            try:
                findings.append(Finding(domain=domain, **item))
            except Exception as e:
                print(f"[WARN] Dropped invalid finding in {domain}: {e}")
        return findings
    except Exception as e:
        print(f"[WARN] parse_findings failed for domain {domain}: {e}\nRaw: {raw[:200]}")
        return []
````

### 9.3 Prompts (`backend/agents/security/prompts.py`)

```python
from shared.schemas import SubmissionPayload

SYSTEM_PROMPT = """You are the Security Agent on an AI governance review panel.
Your job is to evaluate AI feature proposals for security risks in one specific domain.
Domain: {domain_label}
Evaluation criteria:
{domain_criteria}

Respond ONLY with a valid JSON array of findings. No preamble, no explanation outside the JSON.
If no issues are found, return an empty array: []

Each finding must have exactly these fields:
- "severity": one of "critical", "high", "medium", "low", "info"
- "title": short specific finding title, max 80 characters
- "detail": 2-5 sentence explanation of the risk
- "recommendation": concrete mitigation step (optional, include when you have one)"""

REASONING_PROMPT = """You are the Security Agent. Write a concise reasoning narrative
for your governance vote. Be specific — reference actual findings. 3–6 sentences. No bullets."""

DOMAIN_CRITERIA = {
    "data_handling": """
        - Unencrypted storage or transmission of sensitive data
        - PII collected beyond what is necessary (data minimization violations)
        - Unclear data retention or deletion policy
        - Data shared with third parties without explicit disclosure
        - Lack of user consent mechanisms where required by law
    """,
    "attack_surface": """
        - Prompt injection: can a user manipulate model behavior through inputs?
        - Adversarial inputs: can crafted inputs cause unexpected model outputs?
        - New API endpoints or input fields that are not validated
        - Indirect injection through external data sources (RAG, browsing, tool calls)
        - Model output used in downstream execution (code eval, SQL, shell commands)
    """,
    "abuse_misuse": """
        - Missing or insufficient rate limiting
        - Potential for automated abuse at scale (bots, scrapers)
        - Feature that could be weaponized against other users
        - Output that could be used for spam, phishing, or disinformation
        - Cost amplification: abuse resulting in disproportionate compute or API cost
    """,
    "auth_authorization": """
        - Missing authentication requirements on new endpoints
        - Insufficient authorization checks (user A accessing user B's data)
        - Privilege escalation: unprivileged users triggering privileged actions
        - IDOR (insecure direct object reference) risks
        - Token or session handling weaknesses
    """,
    "third_party_deps": """
        - External APIs receiving sensitive data without DPA or contractual protections
        - Dependencies with poor security track records or no disclosure policy
        - Single points of failure introduced in critical paths
        - AI model providers receiving user data without data processing agreements
        - Open-source packages with unreviewed supply chain risk
    """,
    "logging_monitoring": """
        - No audit log for feature actions (especially sensitive operations)
        - PII or secrets logged in plain text
        - No alerting on anomalous usage patterns
        - Silent failures (no error surface, no trace)
        - Missing correlation IDs that would impede forensics
    """,
    "model_output_safety": """
        - Raw model output displayed to users without filtering or guardrails
        - Model output used in high-stakes decisions without human review
        - Hallucination risk in consequential use cases
        - Output format interpretable as executable code, HTML injection, or SQL
        - Lack of output validation or post-processing safety checks
    """,
}


def build_domain_user_prompt(domain: str, s: SubmissionPayload) -> str:
    return f"""Evaluate the "{domain.replace('_', ' ').title()}" security domain for this submission.

Feature Name: {s.feature_name}
Type: {s.feature_type}
Description: {s.description}
Intended Use: {s.intended_use}
Affected Systems: {', '.join(s.affected_systems)}
Data Sources: {s.data_sources}
PII Involved: {s.pii_involved}
Third-Party Dependencies: {s.third_party_deps or 'None stated'}
Existing Risk Notes: {s.existing_risk_assessment or 'None provided'}
Jurisdictions: {', '.join(s.jurisdiction)}
Compliance Targets: {', '.join(s.compliance_targets) if s.compliance_targets else 'None stated'}

Return a JSON array of findings for this domain only. Return [] if no issues found."""
```

---

## 10. Backend: Governance Record Generator (`backend/record/generator.py`)

The Band room transcript is the source of truth. This module reads it and structures it into a `GovernanceRecord`.

```python
from shared.schemas import GovernanceRecord, AgentRecord, CrossExamEntry, Finding, SubmissionPayload
import uuid
from datetime import datetime


async def generate_record(session_id: str, band_client) -> GovernanceRecord:
    """
    Reads the full Band room transcript and compiles the governance record.
    The room IS the audit trail. This structures it.
    """
    all_messages = await band_client.rooms.get_messages(session_id)
    if not all_messages:
        raise ValueError(f"No messages found for session {session_id}")

    # Extract typed message groups
    submission_msg = next((m for m in all_messages if m.type == "submission_context"), None)
    vote_msgs      = [m for m in all_messages if m.type == "vote"]
    challenge_msgs = [m for m in all_messages if m.type == "challenge"]

    if not submission_msg:
        raise ValueError("No submission context found in room")

    submission = SubmissionPayload(**submission_msg.content)
    agent_records = [_build_agent_record(m) for m in vote_msgs]
    verdict = _determine_verdict([r.vote for r in agent_records])
    conditions = _extract_conditions(agent_records, verdict)

    return GovernanceRecord(
        reference_id=str(uuid.uuid4())[:12].upper(),
        session_id=session_id,
        feature_name=submission.feature_name,
        created_at=all_messages[0].timestamp,
        completed_at=all_messages[-1].timestamp,
        verdict=verdict,
        conditions=conditions,
        submission=submission,
        agent_records=agent_records,
        cross_examination_log=[_build_cross_exam_entry(m) for m in challenge_msgs]
    )


def _determine_verdict(votes: list[str]) -> str:
    """Deterministic. No LLM."""
    if not votes:
        return "human_review_required"
    if any(v == "reject" for v in votes):
        return "rejected"
    if all(v == "approve" for v in votes):
        return "approved"
    if votes.count("flag") >= len(votes) // 2:
        return "human_review_required"
    return "conditional_approval"


def _build_agent_record(msg) -> AgentRecord:
    c = msg.content
    return AgentRecord(
        agent_id=msg.role,
        agent_name=c["agent"],
        agent_emoji=c["emoji"],
        vote=c["vote"],
        confidence=c["confidence"],
        reasoning=c["reasoning"],
        findings=[Finding(**f) for f in c.get("findings", [])],
        completed_at=msg.timestamp
    )


def _build_cross_exam_entry(msg) -> CrossExamEntry:
    c = msg.content
    return CrossExamEntry(
        timestamp=msg.timestamp,
        from_agent=c["from_agent"],
        to_agent=c["to_agent"],
        challenge=c["challenge"],
        counter_position=c["counter_position"]
    )


def _extract_conditions(agent_records: list[AgentRecord], verdict: str) -> list[str] | None:
    """Extract recommended mitigations from high/medium findings when verdict is conditional."""
    if verdict not in ("conditional_approval", "human_review_required"):
        return None
    conditions = []
    for record in agent_records:
        for finding in record.findings:
            if finding.severity in ("high", "medium") and finding.recommendation:
                conditions.append(f"[{record.agent_name}] {finding.recommendation}")
    return conditions or None
```

---

## 11. Frontend: Web App

### 11.1 API Client (`web/src/lib/api.ts`)

```typescript
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function submitForReview(
  payload: SubmissionPayload,
): Promise<{ sessionId: string }> {
  const res = await fetch(`${BASE}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Submission failed");
  return res.json();
}

export async function getSessionStatus(
  sessionId: string,
): Promise<SessionStatus> {
  const res = await fetch(`${BASE}/status/${sessionId}`);
  if (!res.ok) throw new Error("Session not found");
  return res.json();
}

export async function getGovernanceRecord(
  sessionId: string,
): Promise<GovernanceRecord> {
  const res = await fetch(`${BASE}/record/${sessionId}`);
  if (!res.ok) throw new Error("Record not found");
  return res.json();
}
```

### 11.2 Polling Hook (`web/src/lib/poll.ts`)

```typescript
import { useEffect, useRef, useState } from "react";

export function usePolling<T>(
  fn: () => Promise<T>,
  intervalMs: number,
  active: boolean = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;
    const poll = async () => {
      try {
        setData(await fn());
      } catch (e) {
        setError(e as Error);
      }
    };
    poll();
    ref.current = setInterval(poll, intervalMs);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [active, intervalMs]);

  return { data, error };
}
```

### 11.3 Pages

#### `/` — Landing

Must include: headline, one-paragraph explanation, "Submit for Review" CTA → `/submit`, three-column "how it works" (Submit → Review → Record), five agent cards (emoji + name + one-line focus), footer with project status.

Design: dark background (`#0a0f1a`), monospace font for labels and agent IDs, clean sans-serif for body text. The five agent cards should feel like a panel of experts — credible, not decorative. No gratuitous animations.

---

#### `/submit` — Submission Form

Multi-step form, 3 steps, progress indicator at the top. State managed with `useReducer`. Persist to `sessionStorage` so refresh doesn't wipe the form. No form library.

**Step 1 — Feature Overview:**

| Field             | Type      | Required | Notes                                                            |
| ----------------- | --------- | -------- | ---------------------------------------------------------------- |
| `featureName`     | text      | ✅       | Max 100 chars                                                    |
| `description`     | textarea  | ✅       | Min 100 chars. Live char count.                                  |
| `intendedUse`     | textarea  | ✅       | Min 100 chars. Live char count.                                  |
| `featureType`     | select    | ✅       | new_feature / model_change / prompt_change / integration / other |
| `affectedSystems` | tag input | ✅       | Free-form list                                                   |

**Step 2 — Risk Context:**

| Field                    | Type         | Required | Notes                                   |
| ------------------------ | ------------ | -------- | --------------------------------------- |
| `dataSources`            | textarea     | ✅       | What data does this feature touch?      |
| `piiInvolved`            | radio        | ✅       | Yes / No / Unknown                      |
| `thirdPartyDeps`         | textarea     | ❌       | External APIs, models, vendors          |
| `existingRiskAssessment` | textarea     | ❌       | Any existing threat model notes         |
| `jurisdiction`           | multi-select | ✅       | EU / US / UK / APAC / Global / Other    |
| `complianceTargets`      | multi-select | ❌       | GDPR / SOC 2 / HIPAA / ISO 27001 / None |

**Step 3 — Review & Submit:**

- Read-only summary of all fields (collapsible sections)
- Confirmation checkbox
- "Submit for Review" → POST → redirect to `/review/[sessionId]`

Validation: required fields non-empty, description and intendedUse ≥ 100 chars, inline field-level errors only (no top-of-form error dump), block submission if Steps 1 or 2 have errors.

---

#### `/review/[sessionId]` — Live Review

```
┌──────────────────────────────────────────────┐
│  [Feature Name]              Session #XXXXXX  │
│  Status: REVIEWING ●                          │
├──────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  ...   │
│  │⚖️ Ethics│ │🔒 Security│ │📜 Legal │        │
│  │Reviewing│ │  Voted ✅ │ │ Pending │        │
│  └─────────┘ └─────────┘ └─────────┘        │
│  Live Activity Feed                           │
│  ──────────────────────────────────────────  │
│  10:42:01  🔒 Security: Reviewing data sources│
│  10:42:15  🔒 Security: 3 findings posted     │
│  10:42:20  🔒 Security: Voted → FLAG ⚠️       │
└──────────────────────────────────────────────┘
```

Agent card states: `pending` (grey) / `reviewing` (amber + pulsing dot) / `voted:approve` (green ✅) / `voted:reject` (red ✗) / `voted:flag` (yellow ⚠️).

Poll `GET /status/[sessionId]` every 3 seconds using `usePolling`. Show skeleton state while waiting for first response. When all voted → "Review complete" banner + "View Governance Record →" link. 404 → error state + link back to `/submit`.

---

#### `/record/[sessionId]` — Governance Record

Top to bottom:

1. **Record Header** — feature name, session ID, timestamp, verdict badge (APPROVED green / REJECTED red / CONDITIONAL APPROVAL amber / FLAGGED FOR HUMAN REVIEW yellow), download JSON button.

2. **Submission Summary** (collapsible) — all original fields, read-only.

3. **Agent Votes** (one card per agent) — agent name + emoji, vote badge, confidence, full reasoning text (not truncated — this is an audit record), findings list with severity tags.

4. **Cross-Examination Log** (collapsible, shown only if cross-exam occurred) — threaded view, ordered by timestamp, showing from/to agent, challenge, counter-position.

5. **Final Decision Block** — verdict, conditions (if any), reference ID, timestamp.

Accessibility: keyboard-navigable, reasoning text selectable (`user-select` must not be `none`). Print stylesheet: hide nav, uncollapse all sections.

---

## 12. Sample Test Fixture (`backend/tests/fixtures/sample_submission.json`)

This fixture is intentionally designed to surface real security findings (PII to third party, no pen test, prompt injection surface). Use it to verify the agent produces non-trivial output.

```json
{
  "feature_name": "AI-Powered Customer Support Chat",
  "description": "A chat widget powered by a fine-tuned LLM that answers customer support queries using our internal knowledge base and real-time customer account data. The model has access to order history, billing information, and account status for the authenticated user during each conversation.",
  "intended_use": "Deployed on the customer portal for authenticated users to resolve common support queries without waiting for a human agent. Handles billing questions, order status, and account management.",
  "feature_type": "new_feature",
  "affected_systems": [
    "Customer Portal",
    "Billing API",
    "Order Management",
    "Identity",
    "LLM Inference"
  ],
  "data_sources": "Internal static knowledge base plus real-time customer order history, billing records, and account status fetched via authenticated API calls at conversation start.",
  "pii_involved": "yes",
  "third_party_deps": "OpenAI GPT-4o via API for LLM inference. All customer context including billing data is included in the prompt sent to OpenAI.",
  "existing_risk_assessment": "Basic internal threat model completed. No external penetration test has been conducted.",
  "jurisdiction": ["EU", "US"],
  "compliance_targets": ["GDPR", "SOC 2"]
}
```

---

## 13. Testing

### Vote Logic (`backend/tests/test_vote_logic.py`)

Unit test every vote rule with directly constructed `list[Finding]`. No LLM calls. Cover:

- One `critical` finding → `reject`
- Two or more `high` findings → `reject`
- One `high` finding → `flag`
- Three or more `medium` findings with PII → `flag`
- Only `medium`/`low`/`info` → `approve`
- Empty findings → `approve` with `confidence: low`

### Parser (`backend/tests/test_parsers.py`)

Test `parse_findings` with: clean JSON array, JSON wrapped in ` ```json ``` `, broken JSON, empty array `[]`, array with one invalid severity value (should drop that item, keep valid ones).

### Integration Test

Mark `@pytest.mark.integration` and skip by default (`-m "not integration"`). Runs the full Security Agent against the sample fixture with real LLM calls. Assert `vote != "approve"` given the fixture's known risks.

---

## 14. Build Order

Build strictly in this sequence. Each step is testable before moving to the next.

```
1.  backend/shared/schemas.py          — All Pydantic types. Nothing depends on anything else.
2.  backend/shared/llm_client.py       — LLM client. Test with a single raw call to Featherless.
3.  backend/shared/cross_exam_prompts.py — Cross-exam prompt builder and parser.
4.  [READ BAND SDK DOCS]               — Get real method signatures before writing any Band code.
5.  backend/orchestrator/session.py    — Band room creation. Test: create a room, post one message.
6.  backend/agents/security/prompts.py — All domain criteria strings.
7.  backend/agents/security/evaluator.py — Single domain eval, parse output, parallel eval.
8.  backend/agents/base_agent.py       — Band lifecycle. Test with a mock submission + mock room.
9.  backend/agents/security/agent.py   — SecurityAgent. Run against sample fixture end-to-end.
10. Repeat step 9 for Ethics, Legal, Product, Compliance agents.
11. backend/record/generator.py        — Compile record from Band transcript.
12. backend/orchestrator/main.py       — Wire all agents + session + record into FastAPI.
13. web/src/types/charter.ts           — TypeScript types. Match the Python schemas exactly.
14. web/src/lib/api.ts                 — API client. Test against running FastAPI.
15. web/src/lib/poll.ts                — usePolling hook.
16. web/src/app/submit/page.tsx        — Form (Steps 1-3).
17. web/src/app/review/[sessionId]/    — Live review with polling.
18. web/src/app/record/[sessionId]/    — Governance record viewer.
19. web/src/app/page.tsx               — Landing page. Build this last.
```

---

## 15. Hackathon Submission Checklist

**Band requirements (judging criterion 1):**

- [ ] At least 3 (all 5) agents join a shared Band room per session
- [ ] Submission context is injected as a Band message, not passed function-to-function
- [ ] Agents post structured findings messages visible to all peers
- [ ] At least one cross-examination challenge is posted through Band
- [ ] Votes are cast as Band messages, not return values
- [ ] Governance Record is compiled from the Band room transcript
- [ ] Demo video shows Band room messages as the collaboration layer

**Partner prizes:**

- [ ] Featherless.ai used for Ethics, Security, Legal agents (use promo `BOA26`)
- [ ] AI/ML API used for Product, Compliance agents

**Submission requirements:**

- [ ] Public GitHub repository
- [ ] Demo video (show the full flow: submit → agents in Band room → governance record)
- [ ] Slide deck
- [ ] Live demo URL (deploy FastAPI + Next.js)
- [ ] Short + long description on lablab.ai

**Resources:**

- Band SDK docs: https://band.ai/docs
- Band Pro promo: `BANDHACK26`
- Featherless promo: `BOA26`
- Submission deadline: June 19, 2026 at 8:00 PM PST
