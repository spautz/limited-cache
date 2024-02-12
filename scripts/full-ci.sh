#!/usr/bin/env bash

THIS_SCRIPT_NAME=$(basename "$0")
echo "### Begin ${THIS_SCRIPT_NAME}"

# Fail if anything in here fails
set -e
# Run from the repo root
pushd "$(dirname -- "${BASH_SOURCE[0]:-$0}")/.."

source ./scripts/helpers/helpers.sh

###################################################################################################

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

popd
echo "### End ${THIS_SCRIPT_NAME}"
