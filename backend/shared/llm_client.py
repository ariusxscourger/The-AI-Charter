import httpx
import asyncio
from typing import Literal

class LLMClient:
    def __init__(
        self,
        provider: Literal["featherless", "aiml", "openrouter"],
        api_key: str,
        model: str
    ):
        self.provider = provider
        self.api_key = api_key
        self.model = model
        if provider == "featherless":
            self.base_url = "https://api.featherless.ai/v1"
        elif provider == "aiml":
            self.base_url = "https://api.aimlapi.com/v1"
        else:
            self.base_url = "https://openrouter.ai/api/v1"

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
                sleep_time = 2 ** attempt
                if isinstance(e, httpx.HTTPStatusError) and e.response.status_code == 429:
                    retry_after = e.response.headers.get("Retry-After")
                    if retry_after and retry_after.isdigit():
                        sleep_time = int(retry_after)
                    else:
                        sleep_time = 4 * (attempt + 1)  # 4s, 8s
                await asyncio.sleep(sleep_time)

class LLMClientError(Exception):
    pass
