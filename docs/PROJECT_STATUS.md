# Project Status & Feature Backlog

This document outlines the current feature coverage, implementation status, and next steps for **The AI Charter**.

---

## Current Status

| Component | Status | Details |
|---|---|---|
| **Security Agent** | ✅ Implemented | 7 domains evaluated in parallel via LLM, deterministic voting |
| **Ethics Agent** | ✅ Implemented | Fairness, bias, misuse, principles alignment |
| **Legal Agent** | ✅ Implemented | Regulatory (GDPR/CCPA/SOC2), jurisdictional risk |
| **Product Agent** | ✅ Implemented | User UX impact, business rollout alignment |
| **Compliance Agent** | ✅ Implemented | Policy checklist, documentation completeness, audit evidence |
| **FastAPI Backend** | ✅ Implemented | Multi-agent orchestrator, SQLModel/PostgreSQL record caching |
| **Next.js Web UI** | ✅ Implemented | Submission form, live review dashboard, historical record ledger |
| **Band.ai SDK Integration** | ✅ Implemented | Collaborative rooms, mock room fallback for offline testing |

---

## Next Steps & Future Backlog

If you want to extend this project, here are some high-priority backlog features:

1. **Human-in-the-Loop Interactivity**
   * Allow the operator to post questions or reply directly to agents inside the live review dashboard.
2. **Dynamic Prompt Settings**
   * Build a settings page in the Web UI to edit the agent system prompts and domain criteria stored in the database.
3. **PowerShell MCP Bootstrap Script**
   * Add a `run_mcp.ps1` file for Windows users to bootstrap the Band.ai MCP server without requiring Git Bash or WSL.
4. **Rate Limit & Timeout Resilience**
   * Enhance the LLM Client retry/backoff mechanism when scaling concurrent API requests across standard LLM providers.
