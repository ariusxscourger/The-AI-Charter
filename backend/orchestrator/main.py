import os
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from dotenv import load_dotenv

# Load env variables from root .env if it exists
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "../.env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

from shared.schemas import (
    SubmissionPayload, SubmitResponse, StatusResponse, GovernanceRecord,
    UserRegister, UserLogin, TokenResponse, UserResponse
)
from shared.llm_client import LLMClient
from record.generator import generate_record
from band import BandClient

from agents.security.agent import SecurityAgent
from agents.ethics.agent import EthicsAgent
from agents.legal.agent import LegalAgent
from agents.product.agent import ProductAgent
from agents.compliance.agent import ComplianceAgent

from shared.db import init_db, close_db, get_session
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from shared.models import User, GovernanceRecordModel
from fastapi import Depends
import bcrypt as bcrypt_lib
import jwt
import json

app = FastAPI(docs_url=None, redoc_url=None)

@app.on_event("startup")
async def startup_event():
    await init_db()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Mount local static files directory
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="/static/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger-ui.css",
        swagger_favicon_url="/static/favicon.png",
    )

agents = [SecurityAgent, EthicsAgent, LegalAgent, ProductAgent, ComplianceAgent]
agent_roles = [AgentClass.AGENT_ID for AgentClass in agents]

# Initialise Band client and all 5 agents at startup.
band_client = BandClient()

def get_band_client_for(AgentClass) -> BandClient:
    return band_client.for_role(AgentClass.AGENT_ID)

def get_llm_for(AgentClass):
    openrouter_key = os.environ.get("OPENROUTER_API_KEY")
    featherless_key = os.environ.get("FEATHERLESS_API_KEY")
    aiml_key = os.environ.get("AIML_API_KEY")
    
    openrouter_model = os.environ.get("OPENROUTER_MODEL") or "openrouter/auto"
    featherless_model = os.environ.get("FEATHERLESS_MODEL") or "google/gemma-4-31B-it"
    aiml_model = os.environ.get("AIML_MODEL") or "google/gemma-4-31B-it"
    
    if openrouter_key:
        return LLMClient(provider="openrouter", api_key=openrouter_key, model=openrouter_model)
    elif featherless_key:
        return LLMClient(provider="featherless", api_key=featherless_key, model=featherless_model)
    elif aiml_key:
        return LLMClient(provider="aiml", api_key=aiml_key, model=aiml_model)
    else:
        # Fallback dummy LLM client so it doesn't crash if no keys are provided
        return LLMClient(provider="featherless", api_key="dummy", model="dummy")

@app.post(
    "/submit",
    response_model=SubmitResponse,
    summary="Submit Governance Proposal",
    description="Initiates an AI governance evaluation session. Opens a session in Band, fires all five evaluator agents concurrently, and returns the session ID immediately.",
    response_description="The unique session ID generated for the evaluation room."
)
async def submit(payload: SubmissionPayload):
    print(f"[DEBUG submit] Received proposal for {payload.feature_name}", flush=True)
    room = await band_client.rooms.create(name=f"Review: {payload.feature_name}")
    room_id = room.id

    for role in agent_roles:
        await band_client.rooms.join(room_id, role)

    await band_client.rooms.post_message(
        room_id=room_id,
        role="orchestrator",
        type="submission_context",
        content=payload.model_dump(),
    )

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

@app.get(
    "/status/{session_id}",
    response_model=StatusResponse,
    summary="Get Session Status",
    description="Reads the transcript from the Band.ai evaluation room to dynamically construct the current status. The evaluation status, individual agent votes/confidence, and full activity feed are derived in real-time.",
    response_description="The current evaluation state of the governance session."
)
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

@app.get(
    "/record/{session_id}",
    response_model=GovernanceRecord,
    summary="Get Governance Record",
    description="Compiles the finalized governance verdict, agent records, and cross-examination log. It attempts to fetch a cached record from the PostgreSQL database first; if not found, it falls back to parsing the live Band transcript and compiling the record.",
    response_description="The compiled and final governance evaluation report."
)
async def get_record(session_id: str, session: AsyncSession = Depends(get_session)):
    """Compile and return the full governance record from the Band transcript."""
    # Check PostgreSQL database first
    try:
        result = await session.execute(
            select(GovernanceRecordModel).where(GovernanceRecordModel.session_id == session_id)
        )
        record = result.scalars().first()
        if record:
            print(f"[DB] Found cached record for session {session_id}", flush=True)
            return record.record_json
    except Exception as db_err:
        print(f"[DB WARN] Failed to fetch record from DB: {db_err}. Falling back to Band.", flush=True)

    # Fallback to compiling from Band.ai
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

@app.post(
    "/auth/register",
    response_model=TokenResponse,
    summary="Register User",
    description="Registers a new user account with an email and password. Generates a secure password hash and returns an authentication JWT.",
    response_description="Successfully registered user details and JWT auth token."
)
async def register(payload: UserRegister, session: AsyncSession = Depends(get_session)):
    email = payload.email.strip()
    password = payload.password
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    existing_result = await session.execute(select(User).where(User.email == email))
    existing = existing_result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists with this email")
    
    password_bytes = password.encode('utf-8')
    password_hash = bcrypt_lib.hashpw(password_bytes, bcrypt_lib.gensalt()).decode('utf-8')
    new_user = User(email=email, password_hash=password_hash)
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    jwt_secret = os.environ.get("JWT_SECRET", "fallback_jwt_secret_hackathon_2026")
    token = jwt.encode({"userId": new_user.id, "email": new_user.email}, jwt_secret, algorithm="HS256")
    
    return {
        "message": "Registration successful",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "created_at": new_user.created_at
        },
        "token": token
    }

@app.post(
    "/auth/login",
    response_model=TokenResponse,
    summary="User Login",
    description="Authenticates user credentials against database records and issues a new JWT authentication token.",
    response_description="Login status, user details, and JWT auth token."
)
async def login(payload: UserLogin, session: AsyncSession = Depends(get_session)):
    email = payload.email.strip()
    password = payload.password
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not bcrypt_lib.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    jwt_secret = os.environ.get("JWT_SECRET", "fallback_jwt_secret_hackathon_2026")
    token = jwt.encode({"userId": user.id, "email": user.email}, jwt_secret, algorithm="HS256")
    
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at
        },
        "token": token
    }

@app.post(
    "/records",
    summary="Cache Governance Record",
    description="Caches or updates a finalized governance record into the local PostgreSQL database, using session_id as a unique index.",
    response_description="Success message confirmation."
)
async def create_record(record: GovernanceRecord, session: AsyncSession = Depends(get_session)):
    record_json = record.model_dump()
    try:
        from sqlalchemy.dialects.postgresql import insert
        stmt = insert(GovernanceRecordModel).values(
            session_id=record.session_id,
            feature_name=record.feature_name,
            verdict=record.verdict,
            record_json=record_json
        )
        stmt = stmt.on_conflict_do_update(
            index_elements=["session_id"],
            set_={
                "verdict": stmt.excluded.verdict,
                "record_json": stmt.excluded.record_json
            }
        )
        await session.execute(stmt)
        await session.commit()
        return {"message": "Governance record saved successfully"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save record: {e}")

@app.get(
    "/records",
    response_model=list[GovernanceRecord],
    summary="List Cached Records",
    description="Retrieves all cached governance records from the local PostgreSQL database ordered by creation date (newest first).",
    response_description="A list of stored governance records."
)
async def list_records(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(GovernanceRecordModel).order_by(GovernanceRecordModel.created_at.desc()))
    records = result.scalars().all()
    return [r.record_json for r in records]
