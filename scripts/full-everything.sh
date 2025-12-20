#!/usr/bin/env bash

# This does everything: clean, setup, run all commands, and build everything

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

echo "Going to doing everything: this will take a while..."
./scripts/clean-everything.sh
source ./scripts/setup-local-environment.sh
pnpm_or_bun run all:all
pnpm_or_bun run clean
./scripts/build-everything.sh

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
