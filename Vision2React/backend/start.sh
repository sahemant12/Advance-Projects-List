#!/bin/bash
set -e

# Check which process type we should run based on DYNO environment variable
# DYNO is set by Heroku (e.g., "web.1", "worker.1")
if [[ $DYNO == worker.* ]]; then
    echo "Starting worker process..."
    exec python worker/main.py
else
    echo "Starting web process..."
    exec python main.py
fi
