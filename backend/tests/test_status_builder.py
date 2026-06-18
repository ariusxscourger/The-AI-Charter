from band import BandMessage
from orchestrator.main import build_activity_feed, build_agent_status


def test_build_agent_status_accepts_agent_name_and_role_aliases():
    messages = [
        BandMessage("security", "vote", {"vote": "reject"}),
        BandMessage("Ethics Agent", "vote", {"vote": "flag"}),
        BandMessage("legal_agent", "vote", {"vote": "approve"}),
        BandMessage("participant-product", "vote", {"agent": "Product Agent", "vote": "approve"}),
        BandMessage("participant-compliance", "vote", {"agent_id": "compliance", "vote": "flag"}),
    ]

    statuses = build_agent_status(messages)

    assert [agent["status"] for agent in statuses] == ["voted"] * 5
    assert [agent["vote"] for agent in statuses] == [
        "reject",
        "flag",
        "approve",
        "approve",
        "flag",
    ]


def test_build_agent_status_leaves_unknown_agents_pending():
    messages = [
        BandMessage("security", "vote", {"vote": "reject"}),
        BandMessage("unrelated-participant", "vote", {"vote": "approve"}),
    ]

    statuses = build_agent_status(messages)

    assert statuses[0]["id"] == "security"
    assert statuses[0]["status"] == "voted"
    assert statuses[1]["id"] == "ethics"
    assert statuses[1]["status"] == "pending"


def test_build_agent_status_keeps_vote_when_messages_are_newest_first():
    messages = [
        BandMessage("security", "vote", {"vote": "reject"}),
        BandMessage("security", "status_update", {"status": "reviewing"}),
    ]

    statuses = build_agent_status(messages)

    assert statuses[0]["status"] == "voted"
    assert statuses[0]["vote"] == "reject"


def test_build_activity_feed_uses_canonical_agent_ids():
    messages = [
        BandMessage("Ethics Agent", "status_update", {"status": "reviewing"}),
        BandMessage(
            "participant-product",
            "findings",
            {"agent": "Product Agent", "findings": [{"id": "P-1"}]},
        ),
        BandMessage(
            "participant-compliance",
            "vote",
            {"agent_id": "compliance", "vote": "flag", "confidence": "medium"},
        ),
    ]

    feed = build_activity_feed(messages)

    assert [entry["agentId"] for entry in feed] == ["ethics", "product", "compliance"]
    assert feed[2]["message"] == "voted FLAG with medium confidence"
