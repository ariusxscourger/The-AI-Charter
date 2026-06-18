import pytest

from agents.ethics.agent import EthicsAgent
from agents.ethics.evaluator import (
    evaluate_deterministic_ethics_checks,
    parse_findings,
)
from shared.schemas import Finding, SubmissionPayload


class MockLLM:
    async def complete(self, sys, user):
        return "mock ethics reasoning"


@pytest.fixture
def agent():
    return EthicsAgent(band_client=None, llm_client=MockLLM(), deterministic=True)


@pytest.fixture
def low_risk_submission():
    return SubmissionPayload(
        feature_name="Internal Knowledge Search",
        description="Searches approved internal documentation and returns citations.",
        intended_use="Help employees find policy documents faster.",
        feature_type="new_feature",
        affected_systems=["Intranet"],
        data_sources="Approved internal policy pages",
        pii_involved="no",
        third_party_deps=None,
        existing_risk_assessment="AI impact review AIR-102 completed with no material residual risks.",
        jurisdiction=["US"],
        compliance_targets=["SOC2"],
    )


def test_deterministic_checks_flag_high_stakes_automation_without_oversight():
    submission = SubmissionPayload(
        feature_name="Candidate Ranker",
        description="Scores and ranks job candidates using resumes and interview notes.",
        intended_use="Automatically shortlist candidates for hiring decisions.",
        feature_type="new_feature",
        affected_systems=["ATS"],
        data_sources="Historical resumes, hiring outcomes, interview notes",
        pii_involved="yes",
        third_party_deps=None,
        existing_risk_assessment=None,
        jurisdiction=["US"],
        compliance_targets=["SOC2"],
    )

    findings = evaluate_deterministic_ethics_checks(submission)
    titles = {finding.title for finding in findings}

    assert "Consequential automation lacks human oversight" in titles
    assert "High-stakes use lacks fairness evidence" in titles
    assert "Ethical risk assessment evidence missing" in titles


def test_deterministic_checks_flag_protected_attribute_impact():
    submission = SubmissionPayload(
        feature_name="Benefit Eligibility Model",
        description="Classifies benefit eligibility and evaluates age and disability accommodations.",
        intended_use="Recommend benefit eligibility for applicants with manual review.",
        feature_type="model_change",
        affected_systems=["Benefits Portal"],
        data_sources="Applicant profile and benefit history",
        pii_involved="yes",
        third_party_deps=None,
        existing_risk_assessment="Fairness review completed with subgroup analysis.",
        jurisdiction=["US"],
        compliance_targets=["SOC2"],
    )

    findings = evaluate_deterministic_ethics_checks(submission)

    assert any(f.domain == "fairness_demographic_impact" for f in findings)


def test_deterministic_checks_flag_misuse_and_vulnerable_users():
    submission = SubmissionPayload(
        feature_name="Student Safety Monitor",
        description="Uses facial recognition to monitor children in school buildings.",
        intended_use="Detect safety incidents and alert staff.",
        feature_type="new_feature",
        affected_systems=["School Portal"],
        data_sources="Camera feeds and student rosters",
        pii_involved="yes",
        third_party_deps="Biometric matching API",
        existing_risk_assessment="Privacy review opened.",
        jurisdiction=["US"],
        compliance_targets=["FERPA"],
    )

    findings = evaluate_deterministic_ethics_checks(submission)
    titles = {finding.title for finding in findings}

    assert "Misuse and surveillance risks need controls" in titles
    assert "Vulnerable user group safeguards required" in titles


@pytest.mark.asyncio
async def test_ethics_vote_critical_rejects(agent, low_risk_submission):
    findings = [
        Finding(
            domain="foreseeable_harm",
            severity="critical",
            title="Consequential automation lacks human oversight",
            detail="High-stakes automation lacks review.",
        )
    ]
    vote, conf, _ = await agent._determine_vote(findings, low_risk_submission)

    assert vote == "reject"
    assert conf == "high"


@pytest.mark.asyncio
async def test_ethics_vote_single_high_flags(agent, low_risk_submission):
    findings = [
        Finding(
            domain="bias_risk",
            severity="high",
            title="High-stakes use lacks fairness evidence",
            detail="Fairness evidence is missing.",
        )
    ]
    vote, conf, _ = await agent._determine_vote(findings, low_risk_submission)

    assert vote == "flag"
    assert conf == "high"


@pytest.mark.asyncio
async def test_ethics_vote_cross_domain_mediums_flag(agent, low_risk_submission):
    findings = [
        Finding(domain="bias_risk", severity="medium", title="Bias monitoring absent", detail="Monitoring is absent."),
        Finding(domain="misuse_scenarios", severity="medium", title="Misuse detection absent", detail="Detection is absent."),
        Finding(domain="principles_alignment", severity="medium", title="Risk owner absent", detail="Owner is absent."),
    ]
    vote, conf, _ = await agent._determine_vote(findings, low_risk_submission)

    assert vote == "flag"
    assert conf == "high"


@pytest.mark.asyncio
async def test_ethics_vote_empty_approves_high(agent, low_risk_submission):
    vote, conf, _ = await agent._determine_vote([], low_risk_submission)

    assert vote == "approve"
    assert conf == "high"


@pytest.mark.asyncio
async def test_structured_output_maps_flag_to_human_review(agent):
    submission = SubmissionPayload(
        feature_name="Candidate Ranker",
        description="Scores and ranks job candidates using resumes and interview notes.",
        intended_use="Automatically shortlist candidates for hiring decisions.",
        feature_type="new_feature",
        affected_systems=["ATS"],
        data_sources="Historical resumes, hiring outcomes, interview notes",
        pii_involved="yes",
        third_party_deps=None,
        existing_risk_assessment="Fairness review is planned.",
        jurisdiction=["US"],
        compliance_targets=["SOC2"],
    )

    result = await agent.evaluate_structured(submission)

    assert result["vote"] in {"REJECT", "HUMAN_REVIEW"}
    assert isinstance(result["confidence"], float)
    assert result["reasoning"]
    assert result["identified_risks"]
    assert result["required_mitigations"]


def test_parse_ethics_findings_from_chatter():
    raw = """Some notes
[
    {"severity": "medium", "title": "Missing appeal path", "detail": "Users cannot contest outcomes."}
]
done"""
    findings = parse_findings(raw, "foreseeable_harm")

    assert len(findings) == 1
    assert findings[0].domain == "foreseeable_harm"
    assert findings[0].severity == "medium"
