# AI Charter Backend

FastAPI application that orchestrates the governance agents, handles Band.ai room lifecycles, and compiles governance records.

## Requirements

- Python 3.11+
- [Pipenv](https://pipenv.pypa.io/) or virtualenv

## Getting Started

1. Navigate to the `backend` directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Configure environment variables in `.env` (refer to `.env.example` in the root folder):

   ```env
   BAND_API_KEY=your_key
   SECURITY_AGENT_API_KEY=your_security_agent_key
   SECURITY_AGENT_ID=your_security_agent_participant_id
   COMPLIANCE_AGENT_API_KEY=your_compliance_agent_key
   COMPLIANCE_AGENT_ID=your_compliance_agent_participant_id
   FEATHERLESS_API_KEY=your_key
   AIML_API_KEY=your_key
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn orchestrator.main:app --reload --port 8000
   ```

## Folder Structure

- `orchestrator/`: Endpoint routing and Band room orchestration.
- `agents/`: Core governance agent classes (Security, Ethics, Legal, Product, Compliance) inheriting from `BaseGovernanceAgent`.
- `shared/`: Pydantic validation schemas, LLM integration client, and shared prompt assets.
- `record/`: Compiles governance reports from the Band.ai transcript history.
- `tests/`: Unit and integration test suite.
