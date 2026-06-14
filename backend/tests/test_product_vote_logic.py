import pytest

from agents.product.agent import ProductAgent
from shared.schemas import SubmissionPayload, Finding


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
        jurisdiction=["US"],
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
        jurisdiction=["US"],
    )


class MockLLM:
    async def complete(self, sys, user):
        return "mock reasoning"


@pytest.fixture
def agent():
    return ProductAgent(band_client=None, llm_client=MockLLM())


@pytest.mark.asyncio
async def test_product_vote_critical_rejects(agent, dummy_submission):
    findings = [Finding(domain="product", severity="critical", title="Bad", detail="Very bad")]
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "reject"
    assert conf == "high"


@pytest.mark.asyncio
async def test_product_vote_two_high_rejects(agent, dummy_submission):
    findings = [
        Finding(domain="product", severity="high", title="Bad 1", detail="Bad"),
        Finding(domain="product", severity="high", title="Bad 2", detail="Bad"),
    ]
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "reject"
    assert conf == "high"


@pytest.mark.asyncio
async def test_product_vote_one_high_flags(agent, dummy_submission):
    findings = [Finding(domain="product", severity="high", title="Bad 1", detail="Bad")]
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "flag"
    assert conf == "high"


@pytest.mark.asyncio
async def test_product_vote_medium_no_pii_approves(agent, dummy_submission):
    findings = [Finding(domain="product", severity="medium", title="Bad 1", detail="Bad")]
    vote, conf, _ = await agent._determine_vote(findings, dummy_submission)
    assert vote == "approve"
    assert conf == "medium"


@pytest.mark.asyncio
async def test_product_vote_empty_approves_low(agent, dummy_submission):
    vote, conf, _ = await agent._determine_vote([], dummy_submission)
    assert vote == "approve"
    assert conf == "low"
