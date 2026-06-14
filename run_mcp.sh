#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_DIR="${PROJECT_ROOT}/thenvoi-mcp"
REPO_URL="https://github.com/thenvoi/thenvoi-mcp.git"

echo "⚙️ Initializing thenvoi-mcp server..."

# 1. Clone repository if empty or not a git repo
if [ ! -d "$MCP_DIR" ]; then
    echo "Creating directory: $MCP_DIR"
    mkdir -p "$MCP_DIR"
fi

cd "$MCP_DIR"

if [ ! -d ".git" ]; then
    echo "Cloning thenvoi-mcp repository..."
    git clone --recurse-submodules "$REPO_URL" .
else
    echo "thenvoi-mcp repository already cloned."
fi

# 2. Configure environment variables
echo "Configuring environment variables..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "Created .env from .env.example"
    else
        touch .env
        echo "Created empty .env file"
    fi
fi

# Try to extract keys from root .env if present
ROOT_ENV="${PROJECT_ROOT}/.env"
if [ -f "$ROOT_ENV" ]; then
    echo "Attempting to import API keys from root .env..."
    # Read BAND_API_KEY
    BAND_KEY=$(grep -E "^BAND_API_KEY=" "$ROOT_ENV" | cut -d'=' -f2- | tr -d '\r\n')
    if [ -n "$BAND_KEY" ]; then
        # Check if already in .env
        if ! grep -q "^BAND_API_KEY=" .env; then
            echo "Setting BAND_API_KEY in .env"
            echo "BAND_API_KEY=$BAND_KEY" >> .env
        fi
        
        # Check prefix to determine scope and specific key
        if [[ "$BAND_KEY" == band_u_* ]] || [[ "$BAND_KEY" == thnv_u_* ]]; then
            if ! grep -q "^THENVOI_USER_KEY=" .env; then
                echo "Setting THENVOI_USER_KEY in .env"
                echo "THENVOI_USER_KEY=$BAND_KEY" >> .env
            fi
            if ! grep -q "^THENVOI_MCP_SCOPE=" .env; then
                echo "Setting THENVOI_MCP_SCOPE=human in .env"
                echo "THENVOI_MCP_SCOPE=human" >> .env
            fi
        elif [[ "$BAND_KEY" == band_a_* ]] || [[ "$BAND_KEY" == thnv_a_* ]]; then
            if ! grep -q "^THENVOI_AGENT_KEY=" .env; then
                echo "Setting THENVOI_AGENT_KEY in .env"
                echo "THENVOI_AGENT_KEY=$BAND_KEY" >> .env
            fi
            if ! grep -q "^THENVOI_MCP_SCOPE=" .env; then
                echo "Setting THENVOI_MCP_SCOPE=agent in .env"
                echo "THENVOI_MCP_SCOPE=agent" >> .env
            fi
        else
            if ! grep -q "^THENVOI_API_KEY=" .env; then
                echo "Setting THENVOI_API_KEY in .env"
                echo "THENVOI_API_KEY=$BAND_KEY" >> .env
            fi
        fi
    fi
fi

# Load variables from local .env
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# 3. Setup Python environment and dependencies
if command -v uv &> /dev/null; then
    echo "✨ Found 'uv' manager. Syncing dependencies using uv..."
    uv sync --extra dev
    echo "📦 Installing thenvoi-sdk..."
    uv pip install thenvoi-sdk
    
    echo "🚀 Running thenvoi-mcp server using uv..."
    uv run thenvoi-mcp
else
    echo "⚠️ 'uv' not found. Setting up standard Python virtual environment..."
    if [ ! -d ".venv" ]; then
        python3 -m venv .venv
    fi
    
    # Activate virtual environment
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    elif [ -f ".venv/Scripts/activate" ]; then
        source .venv/Scripts/activate
    fi
    
    echo "Installing dependencies..."
    pip install --upgrade pip
    pip install -e .
    echo "📦 Installing thenvoi-sdk..."
    pip install thenvoi-sdk
    
    echo "🚀 Running thenvoi-mcp server..."
    thenvoi-mcp
fi
