from unittest.mock import MagicMock

import pytest

from band import BandRooms


class BandApiError(Exception):
    def __init__(self, status_code):
        super().__init__(f"headers: {{}}, status_code: {status_code}, body: {{}}")


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
