import pytest

from agents.legal.agent import LegalAgent
from agents.legal.evaluator import evaluate_required_artifacts, parse_findings
from shared.schemas import Finding, SubmissionPayload


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
        third_party_deps=None,
        existing_risk_assessment=None,
        compliance_targets=None,
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
        third_party_deps=None,
        existing_risk_assessment=None,
        compliance_targets=None,
    )


@pytest.fixture
def multi_jurisdiction_submission():
    return SubmissionPayload(
        feature_name="Test Multi-Jurisdiction",
        description="Test desc",
        intended_use="Test use",
        feature_type="other",
        affected_systems=["Test"],
        data_sources="Test",
        pii_involved="no",
        jurisdiction=["US", "EU", "CA"],
        third_party_deps=None,
        existing_risk_assessment=None,
        compliance_targets=None,
    )


class MockLLM:
    async def complete(self, sys, user):
        return "mock legal reasoning"


@pytest.fixture
def agent():
    return LegalAgent(band_client=None, llm_client=MockLLM())


def make_finding(severity, title, domain="legal"):
    return Finding(
        domain=domain,
        severity=severity,
        title=title,
        detail="Risk detail.",
        recommendation="Mitigate the risk."
    )


@pytest.mark.asyncio
async def test_legal_vote_critical_rejects(agent, dummy_submission):
    vote, conf, _ = await agent._determine_vote(
        [make_finding("critical", "Critical legal exposure")],
        dummy_submission,
    )
    assert vote == "reject"
    assert conf == "high"


@pytest.mark.asyncio
async def test_legal_vote_two_high_rejects(agent, dummy_submission):
    vote, conf, _ = await agent._determine_vote(
        [
            make_finding("high", "Missing privacy basis"),
            make_finding("high", "Missing IP license"),
        ],
        dummy_submission,
    )
    assert vote == "reject"
    assert conf == "high"


@pytest.mark.asyncio
async def test_legal_vote_high_plus_two_mediums_rejects(agent, dummy_submission):
    vote, conf, _ = await agent._determine_vote(
        [
            make_finding("high", "Missing privacy basis"),
            make_finding("medium", "Vendor terms incomplete"),
            make_finding("medium", "Jurisdiction mapping incomplete"),
        ],
        dummy_submission,
    )
    assert vote == "reject"
    assert conf == "high"


@pytest.mark.asyncio
async def test_legal_vote_single_high_flags(agent, dummy_submission):
    vote, conf, _ = await agent._determine_vote(
        [make_finding("high", "Missing privacy basis")],
        dummy_submission,
    )
    assert vote == "flag"
    assert conf == "high"


@pytest.mark.asyncio
async def test_legal_vote_four_mediums_flags_high(agent, dummy_submission):
    vote, conf, _ = await agent._determine_vote(
        [
            make_finding("medium", "Privacy notice gap"),
            make_finding("medium", "IP attribution gap"),
            make_finding("medium", "Consumer disclosure gap"),
            make_finding("medium", "Vendor DPA gap"),
        ],
        dummy_submission,
    )
    assert vote == "flag"
    assert conf == "high"


@pytest.mark.asyncio
async def test_legal_vote_two_mediums_with_pii_flags_medium(agent, pii_submission):
    vote, conf, _ = await agent._determine_vote(
        [
            make_finding("medium", "Privacy notice gap"),
            make_finding("medium", "Retention policy gap"),
        ],
        pii_submission,
    )
    assert vote == "flag"
    assert conf == "medium"


@pytest.mark.asyncio
async def test_legal_vote_multi_jurisdiction_with_medium_flags_medium(agent, multi_jurisdiction_submission):
    vote, conf, _ = await agent._determine_vote(
        [make_finding("medium", "Jurisdiction mapping incomplete")],
        multi_jurisdiction_submission,
    )
    assert vote == "flag"
    assert conf == "medium"


@pytest.mark.asyncio
async def test_legal_vote_any_finding_approves_medium(agent, dummy_submission):
    vote, conf, _ = await agent._determine_vote(
        [make_finding("low", "Minor attribution gap")],
        dummy_submission,
    )
    assert vote == "approve"
    assert conf == "medium"


@pytest.mark.asyncio
async def test_legal_vote_empty_approves_low(agent, dummy_submission):
    vote, conf, _ = await agent._determine_vote([], dummy_submission)
    assert vote == "approve"
    assert conf == "low"


def test_required_artifacts_add_privacy_vendor_and_jurisdiction_findings():
    submission = SubmissionPayload(
        feature_name="Customer Insight Model",
        description="Model uses customer messages to produce segmentation insights.",
        intended_use="Marketing segmentation for enterprise customers.",
        feature_type="model_change",
        affected_systems=["CRM", "Marketing Automation"],
        data_sources="Customer messages and CRM profiles.",
        pii_involved="yes",
        third_party_deps="Cloud AI API",
        existing_risk_assessment=None,
        jurisdiction=["US", "EU"],
        compliance_targets=None,
    )

    findings = evaluate_required_artifacts(submission)
    titles = {finding.title for finding in findings}

    assert "No legal or compliance targets declared" in titles
    assert "Missing legal risk assessment evidence" in titles
    assert "PII present without privacy framework" in titles
    assert "Vendor legal review required" in titles
    assert "Multi-jurisdiction legal mapping missing" in titles


def test_parse_findings_accepts_json_array_and_drops_invalid_items():
    raw = (
        'Some prose before\n'
        '[{"severity":"medium","title":"IP attribution gap","detail":"Needs attribution."}, '
        '{"bad":"item"}]\n'
        'Some prose after'
    )

    findings = parse_findings(raw, "intellectual_property")

    assert len(findings) == 1
    assert findings[0].domain == "intellectual_property"
    assert findings[0].severity == "medium"
    assert findings[0].title == "IP attribution gap"
