import json

def build_cross_exam_prompt(
    this_agent: str,
    this_domain: str,
    peer_messages: list
) -> tuple[str, str]:
    peer_text = "\n\n".join([
        f"--- {m.content['agent']} ---\n" + "\n".join([
            f"[{f['severity'].upper()}] {f['title']}: {f['detail']}"
            for f in m.content.get("findings", [])
        ])
        for m in peer_messages
    ])

    system = f"""You are the {this_agent} on an AI governance review panel.
Your domain is: {this_domain}.
You have completed your own evaluation and are now reviewing peer findings.
Respond ONLY in valid JSON. No preamble, no markdown fences."""

    user = f"""Peer findings so far:

{peer_text}

Should you raise a formal challenge based on your expertise in {this_domain}?
Challenge when: a peer made a claim in your domain that is wrong or incomplete,
or there is a genuine conflict between your finding and a peer's finding.

If yes:
{{
  "should_challenge": true,
  "target_agent": "<agent name>",
  "finding_title": "<specific finding being challenged>",
  "challenge": "<2-4 sentence challenge>",
  "your_counter_position": "<what you believe is correct>"
}}

If no:
{{"should_challenge": false}}"""

    return system, user


def parse_challenge(raw: str) -> dict | None:
    """Strip fences, parse JSON, return dict or None on failure."""
    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(clean)
    except Exception:
        return None
