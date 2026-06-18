from types import SimpleNamespace

import pytest

from orchestrator import main
from shared.schemas import SubmissionPayload


class SpyRooms:
    def __init__(self):
        self.joins = []
        self.messages = []

    async def create(self, name: str):
        self.created_name = name
        return SimpleNamespace(id="room-submit-test")

    async def join(self, room_id: str, agent_id: str):
        self.joins.append((room_id, agent_id))

    async def post_message(self, room_id: str, role: str, type: str, content):
        self.messages.append(
            {
                "room_id": room_id,
                "role": role,
                "type": type,
                "content": content,
            }
        )


class SpyBandClient:
    def __init__(self):
        self.rooms = SpyRooms()


class DummyLLM:
    provider = "dummy"
    model = "dummy"


LLM_ENV_VARS = [
    "LLM_PROVIDER",
    "OPENROUTER_API_KEY",
    "OPENROUTER_MODEL",
    "FEATHERLESS_API_KEY",
    "FEATHERLESS_MODEL",
    "AIML_API_KEY",
    "AIML_MODEL",
]


def clear_llm_env(monkeypatch):
    for env_var in LLM_ENV_VARS:
        monkeypatch.delenv(env_var, raising=False)


def test_get_llm_for_infers_single_configured_provider(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("FEATHERLESS_API_KEY", "featherless-test-key")

    llm = main.get_llm_for(object)

    assert llm.provider == "featherless"
    assert llm.api_key == "featherless-test-key"
    assert llm.model == "google/gemma-4-31B-it"


def test_get_llm_for_uses_explicit_provider_when_multiple_keys_exist(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("OPENROUTER_API_KEY", "openrouter-test-key")
    monkeypatch.setenv("FEATHERLESS_API_KEY", "featherless-test-key")
    monkeypatch.setenv("AIML_API_KEY", "aiml-test-key")
    monkeypatch.setenv("LLM_PROVIDER", "featherless")

    llm = main.get_llm_for(object)

    assert llm.provider == "featherless"
    assert llm.api_key == "featherless-test-key"


def test_get_llm_for_requires_provider_when_multiple_keys_exist(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("OPENROUTER_API_KEY", "openrouter-test-key")
    monkeypatch.setenv("FEATHERLESS_API_KEY", "featherless-test-key")
    monkeypatch.setenv("AIML_API_KEY", "aiml-test-key")

    with pytest.raises(ValueError, match="Set LLM_PROVIDER"):
        main.get_llm_for(object)


def test_get_llm_for_rejects_unconfigured_requested_provider(monkeypatch):
    clear_llm_env(monkeypatch)
    monkeypatch.setenv("FEATHERLESS_API_KEY", "featherless-test-key")
    monkeypatch.setenv("LLM_PROVIDER", "openrouter")

    with pytest.raises(ValueError, match="OPENROUTER_API_KEY is not configured"):
        main.get_llm_for(object)


def test_get_llm_for_uses_dummy_when_no_keys_exist(monkeypatch):
    clear_llm_env(monkeypatch)

    llm = main.get_llm_for(object)

    assert llm.provider == "featherless"
    assert llm.api_key == "dummy"
    assert llm.model == "dummy"


@pytest.mark.asyncio
async def test_submit_launches_all_registered_agents(monkeypatch):
    band = SpyBandClient()
    captured_background = []
    started_agents = []

    def capture_task(coro):
        captured_background.append(coro)
        return SimpleNamespace(cancel=lambda: None)

    async def fake_run(self, room_id, payload):
        started_agents.append((self.AGENT_ID, room_id, payload.feature_name))

    for AgentClass in main.agents:
        monkeypatch.setattr(AgentClass, "run", fake_run)

    monkeypatch.setattr(main, "band_client", band)
    monkeypatch.setattr(main, "get_band_client_for", lambda AgentClass: band)
    monkeypatch.setattr(main, "get_llm_for", lambda AgentClass: DummyLLM())
    monkeypatch.setattr(main.asyncio, "create_task", capture_task)

    payload = SubmissionPayload(
        feature_name="Frontend Submit Check",
        description="A proposal submitted from the frontend.",
        intended_use="Verify frontend to backend submission flow.",
        feature_type="new_feature",
        affected_systems=["web", "api"],
        data_sources="User-entered proposal form",
        pii_involved="unknown",
        jurisdiction=["US"],
    )

    response = await main.submit(payload)
    assert response == {"sessionId": "room-submit-test"}

    assert band.rooms.joins == [
        ("room-submit-test", "security"),
        ("room-submit-test", "ethics"),
        ("room-submit-test", "legal"),
        ("room-submit-test", "product"),
        ("room-submit-test", "compliance"),
    ]
    assert band.rooms.messages[0]["type"] == "submission_context"
    assert band.rooms.messages[0]["content"]["feature_name"] == "Frontend Submit Check"

    assert len(captured_background) == 1
    await captured_background[0]

    assert started_agents == [
        ("security", "room-submit-test", "Frontend Submit Check"),
        ("ethics", "room-submit-test", "Frontend Submit Check"),
        ("legal", "room-submit-test", "Frontend Submit Check"),
        ("product", "room-submit-test", "Frontend Submit Check"),
        ("compliance", "room-submit-test", "Frontend Submit Check"),
    ]
