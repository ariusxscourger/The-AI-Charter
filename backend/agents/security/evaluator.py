import asyncio
import json
from shared.schemas import SubmissionPayload, Finding
from shared.llm_client import LLMClient
from agents.security.prompts import SYSTEM_PROMPT, DOMAIN_CRITERIA, build_domain_user_prompt

DOMAINS = [
    "data_handling",
    "attack_surface",
    "abuse_misuse",
    "auth_authorization",
    "third_party_deps",
    "logging_monitoring",
    "model_output_safety",
]


async def evaluate_all_domains(
    submission: SubmissionPayload,
    llm: LLMClient
) -> list[Finding]:
    """
    Runs all 7 domain evaluations concurrently with a Semaphore of 7
    to avoid triggering API rate limits while maximizing parallel speed.
    """
    sem = asyncio.Semaphore(7)

    async def evaluate_with_sem(domain: str):
        async with sem:
            res = await evaluate_domain(domain, submission, llm)
            # Short rest between requests to be gentle on the API rate limits
            await asyncio.sleep(0.5)
            return res

    tasks = [evaluate_with_sem(domain) for domain in DOMAINS]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    findings = []
    for domain, result in zip(DOMAINS, results):
        if isinstance(result, Exception):
            print(f"[WARN] Domain {domain} failed: {result}")
        else:
            findings.extend(result)
    return findings


async def evaluate_domain(
    domain: str,
    submission: SubmissionPayload,
    llm: LLMClient
) -> list[Finding]:
    system = SYSTEM_PROMPT.format(
        domain_label=domain.replace("_", " ").title(),
        domain_criteria=DOMAIN_CRITERIA[domain]
    )
    user = build_domain_user_prompt(domain, submission)
    raw = await llm.complete(system, user)
    return parse_findings(raw, domain)


def parse_findings(raw: str, domain: str) -> list[Finding]:
    """
    Resilient parser. Steps:
    1. Strip markdown fences if present
    2. json.loads
    3. Validate each item with Finding schema
    4. Drop invalid items with a warning
    5. Return validated list (may be empty — never raises)
    """
    try:
        clean = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        items = json.loads(clean)
        if not isinstance(items, list):
            return []
        findings = []
        for item in items:
            try:
                findings.append(Finding(domain=domain, **item))
            except Exception as e:
                print(f"[WARN] Dropped invalid finding in {domain}: {e}")
        return findings
    except Exception as e:
        print(f"[WARN] parse_findings failed for domain {domain}: {e}\nRaw: {raw[:200]}")
        return []
