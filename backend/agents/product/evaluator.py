import json
import logging

from agents.product.prompts import SYSTEM_PROMPT, DOMAIN_CRITERIA, build_product_user_prompt
from shared.llm_client import LLMClient
from shared.schemas import SubmissionPayload, Finding

logger = logging.getLogger(__name__)


async def evaluate_product_risks(submission: SubmissionPayload, llm: LLMClient) -> list[Finding]:
    system = SYSTEM_PROMPT.format(
        domain_label="Product",
        domain_criteria="\n".join(f"{name}: {criteria}" for name, criteria in DOMAIN_CRITERIA.items()),
    )
    user = build_product_user_prompt(submission)
    raw = await llm.complete(system, user)
    return parse_findings(raw)


def parse_findings(raw: str) -> list[Finding]:
    """Parse a JSON array of product findings and drop invalid items."""
    try:
        start = raw.find("[")
        end = raw.rfind("]")
        if start == -1 or end == -1:
            logger.warning("Could not find JSON array bounds in Product LLM output.")
            return []
        clean = raw[start : end + 1]
        items = json.loads(clean)
        if not isinstance(items, list):
            return []

        findings = []
        for item in items:
            try:
                findings.append(Finding(domain="product", **item))
            except Exception as exc:
                logger.warning("Dropped invalid product finding: %s", exc)
        return findings
    except Exception as exc:
        logger.error("parse_findings failed for Product Agent: %s. Raw: %s", exc, raw[:200])
        return []
