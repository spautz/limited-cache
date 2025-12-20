#!/usr/bin/env bash

# This runs the full CI pipeline using act (GitHub Actions locally)

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

if command_exists act; then
  # act =  https://github.com/nektos/act
  act
else
  emit_warning "Could not find 'act': https://github.com/nektos/act"
  exit 1
fi

# @TODO: Detect actions-runner/Runner.Client
# https://github.com/ChristopherHX/runner.server

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
