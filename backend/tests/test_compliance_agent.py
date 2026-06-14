import pytest

from agents.compliance.agent import ComplianceAgent
from agents.compliance.evaluator import evaluate_required_artifacts
from shared.schemas import Finding, SubmissionPayload


class MockLLM:
    async def complete(self, sys, user):
        return "mock compliance reasoning"


@pytest.fixture
def agent():
    return ComplianceAgent(band_client=None, llm_client=MockLLM())


@pytest.fixture
def clean_submission():
    return SubmissionPayload(
        feature_name="Compliant Feature",
        description="Routes internal support requests with approved controls.",
        intended_use="Improve support triage.",
        feature_type="new_feature",
        affected_systems=["Support Portal"],
        data_sources="Internal ticket metadata",
        pii_involved="no",
        third_party_deps=None,
        existing_risk_assessment="Risk assessment RA-123 approved by compliance.",
        jurisdiction=["US"],
        compliance_targets=["SOC2"]
    )


@pytest.mark.asyncio
async def test_compliance_vote_critical_rejects(agent, clean_submission):
    findings = [
        Finding(domain="required_approvals", severity="critical", title="Missing board approval", detail="Approval is required.")
    ]
    vote, conf, _ = await agent._determine_vote(findings, clean_submission)
    assert vote == "reject"
    assert conf == "high"


@pytest.mark.asyncio
async def test_compliance_vote_high_flags(agent, clean_submission):
    findings = [
        Finding(domain="documentation_artifacts", severity="high", title="Missing DPIA", detail="DPIA is required.")
    ]
    vote, conf, _ = await agent._determine_vote(findings, clean_submission)
    assert vote == "flag"
    assert conf == "high"


@pytest.mark.asyncio
async def test_compliance_vote_missing_controls_flag(agent, clean_submission):
    findings = [
        Finding(domain="policy_checklist", severity="medium", title="Missing owner", detail="Owner is unclear."),
        Finding(domain="standards_coverage", severity="medium", title="Missing mapping", detail="Controls are not mapped."),
        Finding(domain="required_approvals", severity="medium", title="Missing approval", detail="Approval is absent."),
    ]
    vote, conf, _ = await agent._determine_vote(findings, clean_submission)
    assert vote == "flag"
    assert conf == "high"


@pytest.mark.asyncio
async def test_compliance_vote_empty_approves_high(agent, clean_submission):
    vote, conf, _ = await agent._determine_vote([], clean_submission)
    assert vote == "approve"
    assert conf == "high"


def test_required_artifacts_flag_missing_targets_and_risk_assessment():
    submission = SubmissionPayload(
        feature_name="Unreviewed PII Feature",
        description="Uses AI to analyze customer messages.",
        intended_use="Summarize customer sentiment.",
        feature_type="new_feature",
        affected_systems=["CRM"],
        data_sources="Customer messages",
        pii_involved="yes",
        third_party_deps="External LLM API",
        existing_risk_assessment=None,
        jurisdiction=["US", "EU"],
        compliance_targets=None
    )
    findings = evaluate_required_artifacts(submission)
    titles = {finding.title for finding in findings}
    assert "No compliance targets declared" in titles
    assert "Missing risk assessment evidence" in titles
    assert "Vendor approval evidence required" in titles
