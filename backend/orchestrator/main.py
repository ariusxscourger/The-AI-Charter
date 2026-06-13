import os
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables from root .env if it exists
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "../.env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

from shared.schemas import SubmissionPayload
from shared.llm_client import LLMClient
from orchestrator.session import GovernanceSession
from record.generator import generate_record
from band import BandClient

from agents.security.agent import SecurityAgent
from agents.ethics.agent import EthicsAgent
from agents.legal.agent import LegalAgent
from agents.product.agent import ProductAgent
from agents.compliance.agent import ComplianceAgent

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialise Band client and all 5 agents at startup
# Prefer the Security Agent key to avoid Human API 403 errors on room creation
orchestrator_key = os.environ.get("SECURITY_AGENT_API_KEY") or os.environ.get("BAND_API_KEY", "dummy")
band_client = BandClient(api_key=orchestrator_key)
agents = [SecurityAgent, EthicsAgent, LegalAgent, ProductAgent, ComplianceAgent]

def get_band_client_for(AgentClass) -> BandClient:
    key_name = f"{AgentClass.AGENT_ID.upper()}_AGENT_API_KEY"
    agent_key = os.environ.get(key_name)
    if agent_key and not agent_key.startswith("your_"):
        return BandClient(api_key=agent_key)
    return band_client

def get_llm_for(AgentClass):
    featherless_key = os.environ.get("FEATHERLESS_API_KEY")
    aiml_key = os.environ.get("AIML_API_KEY")
    
    featherless_model = os.environ.get("FEATHERLESS_MODEL") or "google/gemma-4-31B-it"
    aiml_model = os.environ.get("AIML_MODEL") or "google/gemma-4-31B-it"
    
    if featherless_key:
        return LLMClient(provider="featherless", api_key=featherless_key, model=featherless_model)
    elif aiml_key:
        return LLMClient(provider="aiml", api_key=aiml_key, model=aiml_model)
    else:
        # Fallback dummy LLM client so it doesn't crash if no keys are provided
        return LLMClient(provider="featherless", api_key="dummy", model="dummy")

@app.post("/submit")
async def submit(payload: SubmissionPayload):
    print(f"[DEBUG submit] Received proposal for {payload.feature_name}", flush=True)
    session = GovernanceSession(band_client, payload)
    room_id = await session.open()

    # Fire all agents concurrently — do not await, return room_id immediately
    async def run_agents():
        print(f"[DEBUG run_agents] Starting agents for room {room_id}", flush=True)
        tasks = []
        for AgentClass in agents:
            llm = get_llm_for(AgentClass)
            print(f"[DEBUG run_agents] Agent {AgentClass.AGENT_NAME} using LLM provider {llm.provider} with model {llm.model}", flush=True)
            tasks.append(AgentClass(get_band_client_for(AgentClass), llm).run(room_id, payload))
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for r, AgentClass in zip(results, agents):
            if isinstance(r, Exception):
                print(f"\n[ERROR] Agent {AgentClass.AGENT_NAME} failed: {r}\n", flush=True)
                import traceback
                traceback.print_exception(type(r), r, r.__traceback__)
            else:
                print(f"[DEBUG run_agents] Agent {AgentClass.AGENT_NAME} completed successfully", flush=True)

    asyncio.create_task(run_agents())

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
    try:
        return await generate_record(session_id, band_client)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper Functions
def extract_feature_name(messages) -> str:
    sub_msg = next((m for m in messages if m.type == "submission_context"), None)
    if sub_msg and isinstance(sub_msg.content, dict):
        return sub_msg.content.get("feature_name", "Unknown Feature")
    return "Unknown Feature"

def build_agent_status(messages) -> list:
    status_by_agent = {}
    for m in messages:
        if m.type == "status_update":
            status_by_agent[m.role] = {"status": m.content.get("status"), "vote": None}
        elif m.type == "vote":
            status_by_agent[m.role] = {"status": "voted", "vote": m.content.get("vote")}
            
    agent_info = [
        {"id": "security", "name": "Security Agent", "emoji": "🔒"},
        {"id": "ethics", "name": "Ethics Agent", "emoji": "⚖️"},
        {"id": "legal", "name": "Legal Agent", "emoji": "📜"},
        {"id": "product", "name": "Product Agent", "emoji": "🚀"},
        {"id": "compliance", "name": "Compliance Agent", "emoji": "✅"},
    ]
    
    result = []
    for info in agent_info:
        state = status_by_agent.get(info["id"], {"status": "pending", "vote": None})
        result.append({
            "id": info["id"],
            "name": info["name"],
            "emoji": info["emoji"],
            "status": state["status"],
            "vote": state["vote"]
        })
    return result

def build_activity_feed(messages) -> list:
    feed = []
    for m in messages:
        if m.type == "status_update":
            feed.append({
                "timestamp": m.timestamp,
                "agentId": m.role,
                "message": f"started evaluation ({m.content.get('status')})"
            })
        elif m.type == "findings":
            findings = m.content.get("findings", [])
            feed.append({
                "timestamp": m.timestamp,
                "agentId": m.role,
                "message": f"identified {len(findings)} findings"
            })
        elif m.type == "challenge":
            feed.append({
                "timestamp": m.timestamp,
                "agentId": m.role,
                "message": f"challenged {m.content.get('to_agent')} on '{m.content.get('finding_title')}'"
            })
        elif m.type == "vote":
            feed.append({
                "timestamp": m.timestamp,
                "agentId": m.role,
                "message": f"voted {m.content.get('vote').upper()} with {m.content.get('confidence')} confidence"
            })
    return feed
