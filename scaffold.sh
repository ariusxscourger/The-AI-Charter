#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Generating project directories..."

# Create backend directories
mkdir -p backend/orchestrator
mkdir -p backend/agents/security
mkdir -p backend/agents/ethics
mkdir -p backend/agents/legal
mkdir -p backend/agents/product
mkdir -p backend/agents/compliance
mkdir -p backend/shared
mkdir -p backend/record
mkdir -p backend/tests/fixtures

# Create frontend directories
mkdir -p web/src/app/submit
mkdir -p web/src/app/review/\[sessionId\]
mkdir -p web/src/app/record/\[sessionId\]
mkdir -p web/src/components/ui
mkdir -p web/src/components/submission
mkdir -p web/src/components/review
mkdir -p web/src/components/record
mkdir -p web/src/lib
mkdir -p web/src/types

# Create docker directory
mkdir -p docker

echo "📄 Creating placeholder files & templates..."

# Create root-level files
touch .env.example

# Create docker-level files
touch docker/docker-compose.yml
touch docker/Dockerfile.backend
touch docker/README.md

# Create backend root files
touch backend/requirements.txt
touch backend/README.md

# Initialize python packages
touch backend/orchestrator/__init__.py
touch backend/agents/__init__.py
touch backend/agents/security/__init__.py
touch backend/agents/ethics/__init__.py
touch backend/agents/legal/__init__.py
touch backend/agents/product/__init__.py
touch backend/agents/compliance/__init__.py
touch backend/shared/__init__.py
touch backend/record/__init__.py

# Create backend orchestration files
touch backend/orchestrator/main.py
touch backend/orchestrator/session.py

# Create base and specific agent files
touch backend/agents/base_agent.py
touch backend/agents/security/agent.py
touch backend/agents/security/evaluator.py
touch backend/agents/security/prompts.py
touch backend/agents/ethics/agent.py
touch backend/agents/legal/agent.py
touch backend/agents/product/agent.py
touch backend/agents/compliance/agent.py

# Create shared files
touch backend/shared/schemas.py
touch backend/shared/llm_client.py
touch backend/shared/cross_exam_prompts.py

# Create record generator files
touch backend/record/generator.py

# Create testing files
touch backend/tests/fixtures/sample_submission.json
touch backend/tests/test_vote_logic.py
touch backend/tests/test_parsers.py

# Create frontend files
touch web/src/app/submit/page.tsx
touch web/src/app/review/\[sessionId\]/page.tsx
touch web/src/app/record/\[sessionId\]/page.tsx
touch web/src/components/ui/Badge.tsx
touch web/src/components/ui/Card.tsx
touch web/src/components/ui/Collapsible.tsx
touch web/src/components/ui/ProgressSteps.tsx
touch web/src/components/submission/StepOverview.tsx
touch web/src/components/submission/StepRisk.tsx
touch web/src/components/submission/StepReview.tsx
touch web/src/components/review/AgentCard.tsx
touch web/src/components/review/ActivityFeed.tsx
touch web/src/components/record/AgentVoteCard.tsx
touch web/src/components/record/FindingsList.tsx
touch web/src/components/record/VerdictBlock.tsx
touch web/src/lib/api.ts
touch web/src/lib/poll.ts
touch web/src/types/charter.ts

echo "✅ Directories and placeholders created successfully."
