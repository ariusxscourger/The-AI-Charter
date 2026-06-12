# Docker Configuration

This directory contains container configurations for local development orchestration.

## Docker Compose

To spin up the entire stack (FastAPI Backend + Next.js Frontend) locally:

1. Ensure your `.env` is configured in the root directory.
2. Build and run the containers:
   ```bash
   docker-compose up --build
   ```

## Services

- **Backend**: Python FastAPI service running on port `8000`.
- **Frontend**: Next.js Node app running on port `3000`.
