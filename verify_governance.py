#!/usr/bin/env python3
import os
import sys
import json
import time
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

# Color constants for logging
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
MAGENTA = "\033[95m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

ROOT_DIR = Path(__file__).parent.resolve()
BACKEND_DIR = ROOT_DIR / "backend"
ENV_FILE = ROOT_DIR / ".env"
FIXTURE_FILE = BACKEND_DIR / "tests" / "fixtures" / "sample_submission.json"

def log_info(msg):
    print(f"{BLUE}[INFO]{RESET} {msg}")

def log_success(msg):
    print(f"{GREEN}[SUCCESS]{RESET} {msg}")

def log_warning(msg):
    print(f"{YELLOW}[WARN]{RESET} {msg}")

def log_error(msg):
    print(f"{RED}[ERROR]{RESET} {msg}")

def log_section(title):
    print(f"\n{BOLD}{MAGENTA}=== {title} ==={RESET}\n")

# Load environment variables manually
def load_env():
    if not ENV_FILE.exists():
        log_error(".env file not found in root. Please create one.")
        sys.exit(1)
    
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()
    log_success("Loaded environment variables from root .env")

def make_request(url, data=None):
    req = urllib.request.Request(url)
    if data:
        req.add_header("Content-Type", "application/json")
        json_data = json.dumps(data).encode("utf-8")
        req.data = json_data
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        log_error(f"Request failed: {e.code} - {e.read().decode('utf-8')}")
        raise
    except Exception as e:
        log_error(f"Network error: {e}")
        raise

def main():
    log_section("PRE-FLIGHT CHECKS")
    load_env()

    # Verify keys
    band_key = os.environ.get("BAND_API_KEY")
    featherless_key = os.environ.get("FEATHERLESS_API_KEY")
    if not band_key or "your_band_api_key" in band_key:
        log_error("BAND_API_KEY is not configured in .env")
        sys.exit(1)
    if not featherless_key or "your_featherless_key" in featherless_key:
        log_warning("FEATHERLESS_API_KEY is not configured. Falling back to dummy LLM.")

    log_success("Pre-flight checks passed!")

    # Start the backend server
    log_section("STARTING BACKEND SERVICE")
    python_exec = sys.executable
    venv_python = BACKEND_DIR / ".venv" / "bin" / "python"
    if venv_python.exists():
        python_exec = str(venv_python)
        log_info(f"Using virtualenv python: {python_exec}")

    server_cmd = [
        python_exec, "-m", "uvicorn", 
        "orchestrator.main:app", 
        "--host", "127.0.0.1", 
        "--port", "8000"
    ]
    
    log_info("Spawning FastAPI server...")
    env = os.environ.copy()
    env["PYTHONPATH"] = str(BACKEND_DIR)
    
    # Run uvicorn inside the backend directory, printing logs directly to the terminal
    server_process = subprocess.Popen(
        server_cmd,
        cwd=str(BACKEND_DIR),
        env=env
    )
    
    # Wait for server to start up
    log_info("Waiting for server startup on http://127.0.0.1:8000...")
    time.sleep(3)
    
    if server_process.poll() is not None:
        log_error("Failed to start backend server. Please check your virtualenv dependencies.")
        sys.exit(1)
    
    log_success("Backend server running!")

    try:
        log_section("SUBMITTING GOVERNANCE PROPOSAL")
        if not FIXTURE_FILE.exists():
            log_error(f"Sample fixture not found at {FIXTURE_FILE}")
            sys.exit(1)
            
        with open(FIXTURE_FILE) as f:
            submission_payload = json.load(f)
            
        log_info(f"Submitting feature: '{submission_payload['feature_name']}' for review...")
        response = make_request("http://127.0.0.1:8000/submit", submission_payload)
        
        session_id = response.get("sessionId")
        log_success(f"Governance session opened! Session ID: {BOLD}{session_id}{RESET}")

        log_section("POLLING AGENT PANEL EVALUATION")
        completed = False
        attempts = 0
        max_attempts = 60 # Up to 120s
        
        last_statuses = {}
        
        while not completed and attempts < max_attempts:
            attempts += 1
            status_data = make_request(f"http://127.0.0.1:8000/status/{session_id}")
            
            # Print state of each agent
            agents_info = []
            for agent in status_data.get("agents", []):
                agent_id = agent["id"]
                agent_status = agent["status"]
                vote = agent.get("vote") or "None"
                
                # Detect changes
                key = f"{agent_id}:{agent_status}:{vote}"
                if last_statuses.get(agent_id) != key:
                    last_statuses[agent_id] = key
                    vote_str = f"({BOLD}{vote.upper()}{RESET})" if vote != "None" else ""
                    log_info(f"Agent {agent['emoji']} {BOLD}{agent['name']}{RESET} state: {CYAN}{agent_status}{RESET} {vote_str}")
            
            if status_data.get("status") == "complete":
                completed = True
                log_success("All agents have voted!")
                break
                
            time.sleep(2)

        if not completed:
            log_error("Timeout waiting for agents to vote.")
            sys.exit(1)

        log_section("GOVERNANCE RECORD SUMMARY")
        record = make_request(f"http://127.0.0.1:8000/record/{session_id}")
        
        verdict_colors = {
            "approved": GREEN,
            "rejected": RED,
            "conditional_approval": YELLOW,
            "human_review_required": CYAN
        }
        
        verdict = record.get("verdict", "unknown")
        color = verdict_colors.get(verdict, RESET)
        
        print(f"{BOLD}REFERENCE ID:{RESET} {record.get('reference_id')}")
        print(f"{BOLD}FEATURE NAME:{RESET} {record.get('feature_name')}")
        print(f"{BOLD}VERDICT:     {color}{verdict.upper()}{RESET}")
        
        if record.get("conditions"):
            print(f"\n{BOLD}CONDITIONS / MITIGATIONS:{RESET}")
            for cond in record["conditions"]:
                print(f"  - {cond}")
                
        print(f"\n{BOLD}AGENT DECISIONS:{RESET}")
        for r in record.get("agent_records", []):
            vote = r["vote"]
            vote_color = GREEN if vote == "approve" else (RED if vote == "reject" else YELLOW)
            print(f"  {r['agent_emoji']} {BOLD}{r['agent_name']}{RESET:25} Verdict: {vote_color}{vote.upper()}{RESET:10} (Confidence: {r['confidence']})")
            print(f"     Reasoning: {r['reasoning']}\n")

        if record.get("cross_examination_log"):
            print(f"{BOLD}CROSS-EXAMINATION CHRONICLES:{RESET}")
            for entry in record["cross_examination_log"]:
                print(f"  {BOLD}{entry['from_agent']}{RESET} -> {BOLD}{entry['to_agent']}{RESET}")
                print(f"  Challenge: {entry['challenge']}")
                print(f"  Counter:   {entry['counter_position']}\n")

    finally:
        log_section("CLEANING UP SERVICES")
        log_info("Shutting down uvicorn server...")
        server_process.terminate()
        server_process.wait()
        log_success("Cleaned up background server process. Standalone test finished.")

if __name__ == "__main__":
    main()
