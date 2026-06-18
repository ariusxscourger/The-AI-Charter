from unittest.mock import MagicMock

import pytest

from band import BandMessage, BandRooms, _ROOM_MESSAGE_CACHE


class BandApiError(Exception):
    def __init__(self, status_code):
        super().__init__(f"headers: {{}}, status_code: {status_code}, body: {{}}")


class InlineLoop:
    async def run_in_executor(self, executor, func):
        return func()


def test_participant_id_for_agent_uses_configured_agent_id(monkeypatch):
    monkeypatch.setenv("COMPLIANCE_AGENT_ID", "compliance-participant-id")

    client = MagicMock()
    rooms = BandRooms(client=client, api_key="band_a_test")

    assert rooms._participant_id_for_agent("compliance") == "compliance-participant-id"


@pytest.mark.asyncio
async def test_join_without_participant_id_does_not_call_band(monkeypatch):
    monkeypatch.delenv("COMPLIANCE_AGENT_ID", raising=False)
    monkeypatch.delenv("COMPLIANCE_AGENT_PARTICIPANT_ID", raising=False)
    monkeypatch.delenv("BAND_COMPLIANCE_AGENT_ID", raising=False)
    monkeypatch.delenv("BAND_COMPLIANCE_PARTICIPANT_ID", raising=False)

    client = MagicMock()
    rooms = BandRooms(client=client, api_key="band_a_test")

    await rooms.join("room-123", "compliance")

    client.agent_api_participants.add_agent_chat_participant.assert_not_called()


def test_human_key_adds_agent_with_human_participant_endpoint():
    class HumanParticipants:
        def __init__(self):
            self.calls = []

        def add_my_chat_participant(self, **kwargs):
            self.calls.append(kwargs)

    class AgentParticipants:
        def __init__(self):
            self.calls = []

        def add_agent_chat_participant(self, **kwargs):
            self.calls.append(kwargs)

    class Client:
        def __init__(self):
            self.human_api_participants = HumanParticipants()
            self.agent_api_participants = AgentParticipants()

    client = Client()
    rooms = BandRooms(client=client, api_key="band_u_test")
    participant = object()

    rooms._add_participant("room-123", participant)

    assert len(client.human_api_participants.calls) == 1
    assert client.human_api_participants.calls[0]["chat_id"] == "room-123"
    assert client.human_api_participants.calls[0]["participant"] is participant
    assert len(client.agent_api_participants.calls) == 0


def test_human_key_reads_all_room_messages_endpoint():
    class HumanMessages:
        def __init__(self):
            self.calls = []

        def list_my_chat_messages(self, **kwargs):
            self.calls.append(kwargs)
            return object()

    class AgentContext:
        def __init__(self):
            self.calls = []

        def get_agent_chat_context(self, **kwargs):
            self.calls.append(kwargs)
            return object()

    class Client:
        def __init__(self):
            self.human_api_messages = HumanMessages()
            self.agent_api_context = AgentContext()

    client = Client()
    rooms = BandRooms(client=client, api_key="band_u_test")

    response = rooms._read_all_room_messages("room-123")

    assert response is not None
    assert client.human_api_messages.calls == [{"chat_id": "room-123", "page_size": 100}]
    assert client.agent_api_context.calls == []


def test_participant_add_conflict_logs_already_joined(capsys):
    client = MagicMock()
    rooms = BandRooms(client=client, api_key="band_a_test")

    rooms._log_participant_add_failure("security", "room-123", BandApiError(409))

    output = capsys.readouterr().out
    assert "already a participant" in output
    assert "[WARN]" not in output


def test_participant_add_not_found_logs_config_issue(capsys):
    client = MagicMock()
    rooms = BandRooms(client=client, api_key="band_a_test")

    rooms._log_participant_add_failure("compliance", "room-123", BandApiError(404))

    output = capsys.readouterr().out
    assert "Band returned 404" in output
    assert "COMPLIANCE_AGENT_ID" in output


@pytest.mark.asyncio
async def test_get_messages_falls_back_to_local_cache_after_band_read_failure(monkeypatch):
    _ROOM_MESSAGE_CACHE.clear()
    monkeypatch.setattr("band.asyncio.get_running_loop", lambda: InlineLoop())

    class AgentApiContext:
        def get_agent_chat_context(self, **kwargs):
            raise BandApiError(500)

    class Client:
        agent_api_context = AgentApiContext()

    client = Client()
    rooms = BandRooms(client=client, api_key="band_a_test")

    _ROOM_MESSAGE_CACHE["room-123"] = [
        BandMessage("orchestrator", "submission_context", {"feature_name": "Cached"})
    ]

    messages = await rooms.get_messages("room-123")

    assert len(messages) == 1
    assert messages[0].type == "submission_context"
    assert messages[0].content["feature_name"] == "Cached"


@pytest.mark.asyncio
async def test_get_messages_uses_local_cache_when_band_returns_empty_context(monkeypatch):
    _ROOM_MESSAGE_CACHE.clear()
    monkeypatch.setattr("band.asyncio.get_running_loop", lambda: InlineLoop())

    class AgentApiContext:
        def get_agent_chat_context(self, **kwargs):
            return type("Response", (), {"data": []})()

    class Client:
        agent_api_context = AgentApiContext()

    client = Client()
    rooms = BandRooms(client=client, api_key="band_a_test")

    _ROOM_MESSAGE_CACHE["room-123"] = [
        BandMessage("security", "status_update", {"status": "reviewing"})
    ]

    messages = await rooms.get_messages("room-123")

    assert len(messages) == 1
    assert messages[0].role == "security"


@pytest.mark.asyncio
async def test_get_messages_prefers_local_cache_over_scoped_agent_context(monkeypatch):
    _ROOM_MESSAGE_CACHE.clear()
    monkeypatch.setattr("band.asyncio.get_running_loop", lambda: InlineLoop())

    class AgentApiContext:
        def get_agent_chat_context(self, **kwargs):
            return type(
                "Response",
                (),
                {
                    "data": [
                        type(
                            "SdkMessage",
                            (),
                            {
                                "inserted_at": None,
                                "content": '{"role": "security", "type": "vote", "content": {"vote": "reject"}}',
                                "sender_name": "Security Agent",
                                "sender_id": "security-id",
                            },
                        )()
                    ]
                },
            )()

    class Client:
        agent_api_context = AgentApiContext()

    client = Client()
    rooms = BandRooms(client=client, api_key="band_a_test")

    _ROOM_MESSAGE_CACHE["room-123"] = [
        BandMessage("security", "vote", {"vote": "reject"}),
        BandMessage("ethics", "vote", {"vote": "flag"}),
        BandMessage("legal", "vote", {"vote": "approve"}),
    ]

    messages = await rooms.get_messages("room-123")

    assert [message.role for message in messages] == ["security", "ethics", "legal"]


@pytest.mark.asyncio
async def test_successful_real_post_updates_local_cache(monkeypatch):
    _ROOM_MESSAGE_CACHE.clear()
    monkeypatch.setattr("band.asyncio.get_running_loop", lambda: InlineLoop())

    class AgentApiMessages:
        def __init__(self):
            self.calls = []

        def create_agent_chat_message(self, **kwargs):
            self.calls.append(kwargs)

    class Client:
        def __init__(self):
            self.agent_api_messages = AgentApiMessages()

    client = Client()
    rooms = BandRooms(client=client, api_key="band_a_test")

    await rooms.post_message(
        room_id="room-123",
        role="security",
        type="status_update",
        content={"status": "reviewing"},
    )

    assert len(client.agent_api_messages.calls) == 1
    assert len(_ROOM_MESSAGE_CACHE["room-123"]) == 1
    assert _ROOM_MESSAGE_CACHE["room-123"][0].role == "security"
    assert _ROOM_MESSAGE_CACHE["room-123"][0].content["status"] == "reviewing"
