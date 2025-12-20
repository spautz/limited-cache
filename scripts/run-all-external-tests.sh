#!/usr/bin/env bash

# This updates and runs checks for every external test.
# Usage: ./scripts/run-all-external-tests.sh [target] [--parallel] [--filter <pattern>] [-h|--help]
# Example: ./scripts/run-all-external-tests.sh run-ci --parallel --filter node
#          ./scripts/run-all-external-tests.sh run-ci --parallel --filter=node

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

DOCKER_TARGET="default"
PARALLEL=false
FILTER=""

show_usage() {
  echo "Usage: $0 [target] [--parallel] [--filter <pattern>] [--filter=<pattern>] [-h|--help]"
  echo "  target             The target to run (default: default)."
  echo "  --parallel         Run external tests in parallel (faster but uses more resources)."
  echo "  --filter <pattern> Only run external tests containing <pattern>."
  echo "  --filter=<pattern> Same as --filter <pattern>."
  echo "  -h, --help         Display this help message."
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --parallel)
      PARALLEL=true
      shift
      ;;
    --filter=*)
      FILTER="${1#--filter=}"
      shift
      ;;
    --filter)
      if [[ $# -lt 2 ]]; then
        echo "Error: --filter requires a pattern"
        show_usage
        exit 1
      fi
      FILTER="$2"
      shift 2
      ;;
    -h|--help)
      show_usage
      exit 0
      ;;
    -*)
      echo "Unknown option: $1"
      show_usage
      exit 1
      ;;
    *)
      DOCKER_TARGET="$1"
      shift
      ;;
  esac
done

###################################################################################################
# Main body

# Ensure local packages are published & every external test dir is up-to-date
./scripts/update-all-external-tests.sh

# A safe way to get the list of external-test directories: this won't break if any have spaces in their names
mapfile -t EXTERNAL_TESTS < <(find external-tests -mindepth 1 -maxdepth 1 -type d -printf "%f\n" | sort)

# Apply filter if provided
if [[ -n "$FILTER" ]]; then
  echo "Filtering external tests by pattern: $FILTER"
  filtered=()
  for PROFILE in "${EXTERNAL_TESTS[@]}"; do
    if [[ "$PROFILE" == *"$FILTER"* ]]; then
      filtered+=("$PROFILE")
    fi
  done
  EXTERNAL_TESTS=("${filtered[@]}")
  if [[ ${#EXTERNAL_TESTS[@]} -eq 0 ]]; then
    echo "No external tests match filter: $FILTER"
    exit 1
  fi
fi

if [[ "$PARALLEL" == true ]]; then
  echo "Running external tests in parallel with target: $DOCKER_TARGET"
  printf "%s\n" "${EXTERNAL_TESTS[@]}" | xargs -P"$(nproc)" -I {} ./scripts/run-external-test.sh {} "$DOCKER_TARGET"
else
  echo "Running external tests sequentially with target: $DOCKER_TARGET"
  for PROFILE in "${EXTERNAL_TESTS[@]}"; do
    echo "Running external test: $PROFILE ($DOCKER_TARGET)"
    ./scripts/run-external-test.sh "$PROFILE" "$DOCKER_TARGET"
    echo
  done
fi

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
