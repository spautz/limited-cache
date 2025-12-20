#!/usr/bin/env bash

# Update local packages in a single external-test (via Yalc).

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

show_usage() {
  echo "Usage: $0 <profile> [-h|--help]"
  echo "  profile       Profile name (e.g. cra5-react18). Required, must be the first argument."
  echo "  -h, --help    Display this help message."
}

if [[ $# -eq 0 ]]; then
  echo "Error: profile name is required"
  show_usage
  exit 1
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
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
      break
      ;;
  esac
done

PROFILE=${1?profile name (e.g. cra5-react18)}
shift || true

if [[ $# -gt 0 ]]; then
  echo "Error: unrecognized extra arguments: $*"
  show_usage
  exit 1
fi

if [[ ! -d external-tests/$PROFILE ]]; then
 echo "Error: profile '$PROFILE' not found under external-tests/"
 exit 2
fi

###################################################################################################
# Main body

pnpm_or_bun run publish:yalc

pushd external-tests/$PROFILE

# Use workspace's copy of Yalc to copy over any necessary local packages, so that they'll be
# in place when we try to install
if [[ -f "package.json" ]]; then
  ../../node_modules/.bin/yalc update
else
  # Abort unless it's a project that we expect to fail
  if [[ $PROFILE == "deno-fresh" ]]; then
    echo "Not updating external-test '$PROFILE' because it doesn't have a package.json"
  else
    echo "ERROR: Cannot update external-test '$PROFILE' because it doesn't have a package.json!"
    exit 3
  fi
fi

popd

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
