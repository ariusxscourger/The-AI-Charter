import pytest
from agents.security.evaluator import parse_findings
from agents.compliance.evaluator import parse_findings as parse_compliance_findings

def test_parse_clean_json():
    raw = '''[
        {"severity": "high", "title": "Test", "detail": "Detail", "recommendation": "Fix"}
    ]'''
    findings = parse_findings(raw, "data_handling")
    assert len(findings) == 1
    assert findings[0].severity == "high"

def test_parse_markdown_json():
    raw = '''```json
[
    {"severity": "medium", "title": "Test", "detail": "Detail"}
]
```'''
    findings = parse_findings(raw, "data_handling")
    assert len(findings) == 1
    assert findings[0].severity == "medium"

def test_parse_broken_json():
    raw = '''[ {"severity": "high" '''
    findings = parse_findings(raw, "data_handling")
    assert findings == []

def test_parse_empty_array():
    raw = '''[]'''
    findings = parse_findings(raw, "data_handling")
    assert findings == []

def test_parse_invalid_severity_drops_item():
    # One valid, one invalid severity (not in Literal list)
    raw = '''[
        {"severity": "high", "title": "Test", "detail": "Detail"},
        {"severity": "SUPER_CRITICAL", "title": "Bad", "detail": "Detail"}
    ]'''
    findings = parse_findings(raw, "data_handling")
    # Should drop the invalid one and keep the valid one
    assert len(findings) == 1
    assert findings[0].severity == "high"

def test_parse_chatter_json():
    # Robust parsing of JSON wrapped in conversational chatter
    raw = '''Some introductory chatter here...
[
    {"severity": "low", "title": "Test", "detail": "Detail"}
]
and some trailing chatter too.'''
    findings = parse_findings(raw, "data_handling")
    assert len(findings) == 1
    assert findings[0].severity == "low"

def test_parse_compliance_findings():
    raw = '''[
        {
            "severity": "medium",
            "title": "Missing approval evidence",
            "detail": "Vendor approval is not referenced.",
            "recommendation": "Attach vendor review evidence."
        }
    ]'''
    findings = parse_compliance_findings(raw, "required_approvals")
    assert len(findings) == 1
    assert findings[0].domain == "required_approvals"
    assert findings[0].severity == "medium"
