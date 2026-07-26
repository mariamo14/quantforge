#!/usr/bin/env bash
# Runs QuantForge locally: Spring Boot backend (:8080) + Vite frontend (:5173).
#
# Usage:
#   ./run.sh              start both, stream logs, Ctrl+C stops both
#   ./run.sh --backend    start only the backend
#   ./run.sh --frontend   start only the frontend
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

# --- Node via nvm, if npm isn't already on PATH -----------------------------
if ! command -v npm >/dev/null 2>&1; then
    NVM_NODE_BIN=$(ls -d "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1)
    if [ -n "$NVM_NODE_BIN" ]; then
        export PATH="$NVM_NODE_BIN:$PATH"
    fi
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "npm not found. Install Node (nvm install --lts) or add it to PATH." >&2
    exit 1
fi

RUN_BACKEND=1
RUN_FRONTEND=1
case "${1:-}" in
    --backend)  RUN_FRONTEND=0 ;;
    --frontend) RUN_BACKEND=0 ;;
esac

PIDS=()
cleanup() {
    echo
    echo "Stopping…"
    for pid in "${PIDS[@]:-}"; do
        kill "$pid" 2>/dev/null || true
    done
    wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if [ "$RUN_BACKEND" = "1" ]; then
    echo "Starting backend on :8080…"
    (cd backend && ./mvnw -q spring-boot:run) &
    PIDS+=($!)
fi

if [ "$RUN_FRONTEND" = "1" ]; then
    if [ ! -d frontend/node_modules ]; then
        echo "Installing frontend dependencies (first run only)…"
        (cd frontend && npm install)
    fi
    echo "Starting frontend on :5173…"
    (cd frontend && npm run dev) &
    PIDS+=($!)
fi

if [ "$RUN_BACKEND" = "1" ]; then
    echo -n "Waiting for the backend to seed content"
    for _ in $(seq 1 90); do
        code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/tracks 2>/dev/null || true)
        [ "$code" = "403" ] && break
        echo -n "."
        sleep 2
    done
    echo
fi

echo
echo "QuantForge is running:"
[ "$RUN_FRONTEND" = "1" ] && echo "  App:     http://localhost:5173"
[ "$RUN_BACKEND" = "1" ]  && echo "  API:     http://localhost:8080"
echo "  Ctrl+C to stop."
echo

wait
