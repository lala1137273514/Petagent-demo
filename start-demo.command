#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
"$ROOT_DIR/start-demo.sh" "$@"
STATUS=$?

if [ "$STATUS" -ne 0 ]; then
  echo
  read -r -n 1 -s -p "Startup failed. Press any key to close this window..."
  echo
else
  echo "Petagent Demo started. You can close this window."
fi

exit "$STATUS"
