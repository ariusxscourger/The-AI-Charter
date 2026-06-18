# Setup

Guides for running The AI Charter on your machine.

| Guide | Description |
|-------|-------------|
| [Local Development](LOCAL_DEVELOPMENT.md) | Docker (recommended) and manual setup |
| [Environment Variables](ENVIRONMENT.md) | All `.env` keys, required vs optional |
| [Troubleshooting](TROUBLESHOOTING.md) | Common errors and how to fix them |

**First-time setup:**

1. Copy `.env.example` to `.env` in the project root
2. Fill in Band.ai and LLM API keys (see [Environment](ENVIRONMENT.md))
3. Run `docker-compose up --build` from the `docker/` directory
4. Open http://localhost:3000

Return to [Documentation index](../../DOCS.md).
