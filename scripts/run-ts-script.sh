#!/usr/bin/env bash

# This runs a TypeScript script directly with `node --experimental-strip-types` --
# but only if we're on a vers.

###################################################################################################
# Standard setup for all scripts

THIS_SCRIPT_NAME=$(basename "$0")
echo "### Begin ${THIS_SCRIPT_NAME}"

# Fail if anything in here fails
set -euo pipefail

# Always run from the repo root
REPO_ROOT=$(git -C "$(dirname "${BASH_SOURCE[0]:-$0}")" rev-parse --show-toplevel)
pushd "$REPO_ROOT"

# shellcheck source=scripts/helpers/helpers.sh
source ./scripts/helpers/helpers.sh

###################################################################################################
# Main body

if ! command_exists node; then
  echo "Could not find node!"
  exit 1
fi

if [ "$#" -lt 1 ]; then
  echo "Usage: ./scripts/run-ts-script.sh <script.ts> [args...]"
  exit 1
fi

SCRIPT_ARG="$1"
shift

TARGET_SCRIPT="$SCRIPT_ARG"
if [ ! -f "$TARGET_SCRIPT" ] && [ -f "./scripts/$SCRIPT_ARG" ]; then
  TARGET_SCRIPT="./scripts/$SCRIPT_ARG"
fi

if [ ! -f "$TARGET_SCRIPT" ]; then
  echo "Could not find TypeScript script: $SCRIPT_ARG"
  exit 1
fi

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
NODE_VERSION="$(node -p "process.version")"

if [ "$NODE_MAJOR" -le 20 ]; then
  echo "Skipping TypeScript script on ${NODE_VERSION} (requires Node > 20): ${TARGET_SCRIPT}"
else
  node --experimental-strip-types "$TARGET_SCRIPT" "$@"
fi

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
