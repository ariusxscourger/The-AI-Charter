import httpx
import asyncio
from typing import Literal

class LLMClient:
    def __init__(
        self,
        provider: Literal["featherless", "aiml"],
        api_key: str,
        model: str
    ):
        self.provider = provider
        self.api_key = api_key
        self.model = model
        self.base_url = (
            "https://api.featherless.ai/v1"
            if provider == "featherless"
            else "https://api.aimlapi.com/v1"
        )

    async def complete(self, system: str, user: str) -> str:
        """
        Makes a chat completion request.
        Returns raw text response.
        Retries up to 3 times with exponential backoff (1s, 2s, 4s) on 5xx or timeout.
        Raises LLMClientError after 3 failures.
        Timeout: 30 seconds per attempt.
        """
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            "temperature": 0.2,  # Low temperature for consistent structured output
        }
        headers = {"Authorization": f"Bearer {self.api_key}"}

        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        f"{self.base_url}/chat/completions",
                        json=payload,
                        headers=headers
                    )
                    resp.raise_for_status()
                    return resp.json()["choices"][0]["message"]["content"]
            except (httpx.TimeoutException, httpx.HTTPStatusError) as e:
                if attempt == 2:
                    raise LLMClientError(f"LLM call failed after 3 attempts: {e}")
                await asyncio.sleep(2 ** attempt)

class LLMClientError(Exception):
    pass
