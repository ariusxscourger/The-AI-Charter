import pytest
import json
import os
from pathlib import Path
from agents.security.agent import SecurityAgent
from shared.schemas import SubmissionPayload, Finding
from shared.llm_client import LLMClient

# Ensure test can find the fixture relative to this file
FIXTURE_PATH = Path(__file__).parent / "fixtures" / "sample_submission.json"

class MockBandClient:
    class Rooms:
        async def join(self, *args, **kwargs): pass
        async def post_message(self, *args, **kwargs): pass
        async def get_messages(self, *args, **kwargs): return []
    def __init__(self):
        self.rooms = self.Rooms()

@pytest.mark.integration
@pytest.mark.asyncio
async def test_security_agent_integration():
    api_key = os.environ.get("FEATHERLESS_API_KEY")
    if not api_key:
        pytest.skip("FEATHERLESS_API_KEY not set")

    llm = LLMClient(provider="featherless", api_key=api_key, model="mistralai/Mistral-7B-Instruct-v0.2")
    band = MockBandClient()
    agent = SecurityAgent(band_client=band, llm_client=llm)

    with open(FIXTURE_PATH) as f:
        data = json.load(f)
    submission = SubmissionPayload(**data)

    # We skip full run() because it posts to Band. We just want to test evaluate + vote determination.
    findings = await agent.evaluate(submission)
    
    # Assert findings were produced (this is a vulnerable submission)
    assert len(findings) > 0

    vote, confidence, reasoning = agent._determine_vote(findings, submission)
    
    # Assert that it didn't just blindly approve a vulnerable architecture
    assert vote != "approve"
    assert "flag" in vote or "reject" in vote
    assert len(reasoning) > 0


@pytest.mark.asyncio
async def test_security_agent_band_lifecycle(monkeypatch):
    """Verify the full run() lifecycle of SecurityAgent and its Band integration."""
    from unittest.mock import AsyncMock, MagicMock

    # Create Mock Band Client with spies
    join_mock = AsyncMock()
    post_message_mock = AsyncMock()
    get_messages_mock = AsyncMock(return_value=[])

    class SpyRooms:
        join = join_mock
        post_message = post_message_mock
        get_messages = get_messages_mock

    class SpyBandClient:
        def __init__(self):
            self.rooms = SpyRooms()

    band = SpyBandClient()
    llm = MagicMock()
    agent = SecurityAgent(band_client=band, llm_client=llm)

    # 1. Mock evaluate to avoid live Featherless LLM call
    mock_findings = [
        Finding(
            domain="data_handling",
            severity="high",
            title="PII Leak",
            detail=" PIIs are transmitted in plaintext.",
            recommendation="Encrypt PII"
        )
    ]
    agent.evaluate = AsyncMock(return_value=mock_findings)

    # 2. Mock _generate_reasoning_sync to avoid live LLM call
    monkeypatch.setattr(agent, "_generate_reasoning_sync", lambda f, v, s: "Mock reasoning narrative.")

    # Run the lifecycle
    submission = SubmissionPayload(
        feature_name="Test Band Integration",
        description="Test desc",
        intended_use="Test use",
        feature_type="other",
        affected_systems=["Test"],
        data_sources="Test",
        pii_involved="yes",
        jurisdiction=["US"]
    )
    
    await agent.run("room-999", submission)

    # Assert Band Room interactions happened in correct order and with correct payloads
    join_mock.assert_awaited_once_with("room-999", agent_id="security")

    # post_message should be called for status (reviewing), findings, and vote
    assert post_message_mock.call_count == 3
    
    # Check status message
    status_call = post_message_mock.call_args_list[0]
    assert status_call.kwargs["room_id"] == "room-999"
    assert status_call.kwargs["role"] == "security"
    assert status_call.kwargs["type"] == "status_update"
    assert status_call.kwargs["content"]["status"] == "reviewing"

    # Check findings message
    findings_call = post_message_mock.call_args_list[1]
    assert findings_call.kwargs["room_id"] == "room-999"
    assert findings_call.kwargs["type"] == "findings"
    assert len(findings_call.kwargs["content"]["findings"]) == 1
    assert findings_call.kwargs["content"]["findings"][0]["title"] == "PII Leak"

    # Check vote message
    vote_call = post_message_mock.call_args_list[2]
    assert vote_call.kwargs["room_id"] == "room-999"
    assert vote_call.kwargs["type"] == "vote"
    assert vote_call.kwargs["content"]["vote"] == "flag"
    assert vote_call.kwargs["content"]["confidence"] == "high"
    assert vote_call.kwargs["content"]["reasoning"] == "Mock reasoning narrative."

    # Verify cross_examine fetched peer findings
    get_messages_mock.assert_awaited_once_with(room_id="room-999", type_filter="findings")

