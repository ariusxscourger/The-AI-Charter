import pytest
from shared.schemas import SubmissionPayload, Finding
from agents.security.agent import SecurityAgent

@pytest.fixture
def dummy_submission():
    return SubmissionPayload(
        feature_name="Test",
        description="Test desc",
        intended_use="Test use",
        feature_type="other",
        affected_systems=["Test"],
        data_sources="Test",
        pii_involved="no",
        jurisdiction=["US"]
    )

@pytest.fixture
def pii_submission():
    return SubmissionPayload(
        feature_name="Test PII",
        description="Test desc",
        intended_use="Test use",
        feature_type="other",
        affected_systems=["Test"],
        data_sources="Test",
        pii_involved="yes",
        jurisdiction=["US"]
    )

class MockLLM:
    async def complete(self, sys, user):
        return "mock reasoning"

@pytest.fixture
def agent():
    return SecurityAgent(band_client=None, llm_client=MockLLM())


@pytest.mark.asyncio
async def test_vote_critical_rejects(agent, dummy_submission):
    findings = [
        Finding(domain="attack_surface", severity="critical", title="Bad", detail="Very bad")
    ]
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "reject"
    assert conf == "high"

@pytest.mark.asyncio
async def test_vote_two_high_rejects(agent, dummy_submission):
    findings = [
        Finding(domain="attack_surface", severity="high", title="Bad 1", detail="Bad"),
        Finding(domain="data_handling", severity="high", title="Bad 2", detail="Bad")
    ]
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "reject"
    assert conf == "high"

@pytest.mark.asyncio
async def test_vote_one_high_flags(agent, dummy_submission):
    findings = [
        Finding(domain="attack_surface", severity="high", title="Bad 1", detail="Bad"),
    ]
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "flag"
    assert conf == "high"

@pytest.mark.asyncio
async def test_vote_three_medium_pii_flags(agent, pii_submission):
    findings = [
        Finding(domain="attack_surface", severity="medium", title="Bad 1", detail="Bad"),
        Finding(domain="data_handling", severity="medium", title="Bad 2", detail="Bad"),
        Finding(domain="abuse_misuse", severity="medium", title="Bad 3", detail="Bad")
    ]
    vote, conf, _ = await agent._determine_vote(findings, pii_submission)
    assert vote == "flag"
    assert conf == "medium"

@pytest.mark.asyncio
async def test_vote_two_medium_pii_flags(agent, pii_submission):
    findings = [
        Finding(domain="attack_surface", severity="medium", title="Bad 1", detail="Bad"),
        Finding(domain="data_handling", severity="medium", title="Bad 2", detail="Bad")
    ]
    vote, conf, _ = await agent._determine_vote(findings, pii_submission)
    assert vote == "flag"
    assert conf == "medium"

@pytest.mark.asyncio
async def test_vote_four_medium_no_pii_flags(agent, dummy_submission):
    findings = [
        Finding(domain="attack_surface", severity="medium", title="Bad 1", detail="Bad"),
        Finding(domain="data_handling", severity="medium", title="Bad 2", detail="Bad"),
        Finding(domain="abuse_misuse", severity="medium", title="Bad 3", detail="Bad"),
        Finding(domain="logging_monitoring", severity="medium", title="Bad 4", detail="Bad")
    ]
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "flag"
    assert conf == "high"

@pytest.mark.asyncio
async def test_vote_high_two_medium_rejects(agent, dummy_submission):
    findings = [
        Finding(domain="attack_surface", severity="high", title="Bad 1", detail="Bad"),
        Finding(domain="data_handling", severity="medium", title="Bad 2", detail="Bad"),
        Finding(domain="abuse_misuse", severity="medium", title="Bad 3", detail="Bad")
    ]
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "reject"
    assert conf == "high"

@pytest.mark.asyncio
async def test_vote_medium_no_pii_approves(agent, dummy_submission):
    findings = [
        Finding(domain="attack_surface", severity="medium", title="Bad 1", detail="Bad"),
        Finding(domain="data_handling", severity="medium", title="Bad 2", detail="Bad"),
        Finding(domain="abuse_misuse", severity="medium", title="Bad 3", detail="Bad")
    ]
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "approve"
    assert conf == "medium"

@pytest.mark.asyncio
async def test_vote_empty_approves_low(agent, dummy_submission):
    findings = []
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "approve"
    assert conf == "low"

