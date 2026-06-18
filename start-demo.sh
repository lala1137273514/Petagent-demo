#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required to start Kill The Time Demo from source."
  echo "Install Node.js from https://nodejs.org/ and run this script again."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to install and start Kill The Time Demo from source."
  echo "Install Node.js from https://nodejs.org/; npm is included with the installer."
  exit 1
fi

if [ ! -d "node_modules/electron" ]; then
  echo "Installing dependencies..."
  if [ -f "package-lock.json" ]; then
    npm ci || npm install
  else
    npm install
  fi
fi

if [ "$(uname -s)" = "Darwin" ]; then
  ELECTRON_APP="$ROOT_DIR/node_modules/electron/dist/Electron.app"
  if [ -d "$ELECTRON_APP" ]; then
    echo "Starting Petagent Demo..."
    open -n "$ELECTRON_APP" --args "$ROOT_DIR" "$@"
    exit 0
  fi
fi

echo "Starting Petagent Demo..."
npm start -- "$@"
