from agents.product.evaluator import parse_findings


def test_parse_clean_json():
    raw = '''[
        {"severity": "high", "title": "Test", "detail": "Detail", "recommendation": "Fix"}
    ]'''
    findings = parse_findings(raw)
    assert len(findings) == 1
    assert findings[0].severity == "high"


def test_parse_markdown_json():
    raw = '''```json
[
    {"severity": "medium", "title": "Test", "detail": "Detail"}
]
```'''
    findings = parse_findings(raw)
    assert len(findings) == 1
    assert findings[0].severity == "medium"


def test_parse_invalid_severity_drops_item():
    raw = '''[
        {"severity": "high", "title": "Test", "detail": "Detail"},
        {"severity": "SUPER_CRITICAL", "title": "Bad", "detail": "Detail"}
    ]'''
    findings = parse_findings(raw)
    assert len(findings) == 1
    assert findings[0].severity == "high"
