#!/usr/bin/env bash
# Wrapper build script at repository root for Render.
# It delegates to backend/render_build.sh which contains the actual build steps.
set -euo pipefail

if [ -x ./backend/render_build.sh ]; then
  echo "Running backend/render_build.sh"
  bash ./backend/render_build.sh
elif [ -f ./backend/render_build.sh ]; then
  echo "Running backend/render_build.sh"
  bash ./backend/render_build.sh
else
  echo "Error: backend/render_build.sh not found"
  exit 1
fi
