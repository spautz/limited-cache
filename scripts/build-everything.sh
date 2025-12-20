#!/usr/bin/env bash

# This runs every check for everything in the repo: packages, demos, and external tests
# Usage: ./scripts/build-everything.sh [--parallel]
# This will take a while to run.

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
# Usage and arguments

PARALLEL=false

show_usage() {
  echo "Usage: $0 [--parallel] [-h|--help]"
  echo "  --parallel    Run external tests in parallel (faster but uses more resources)."
  echo "  -h, --help    Display this help message."
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --parallel)
      PARALLEL=true
      shift # past argument
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
done

###################################################################################################
# Main body

run_command ./scripts/build-workspace.sh

if [ "$PARALLEL" = true ]; then
  run_command ./scripts/run-all-external-tests.sh default --parallel
else
  run_command ./scripts/run-all-external-tests.sh
fi

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
