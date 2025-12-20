#!/usr/bin/env bash

# `setup-ci-environment.sh` is for CI runs where system-level dependencies are already met.
# We don't want to clobber that setup with NVM.

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

run_command "./scripts/check-environment.sh"

# Only use the lockfile if it exists: for many demos and external-tests it's better to ignore the
# lockfile, to catch issues that package consumers might encounter when upgrading.
if [ -f "./pnpm-lock.yaml" ]; then
  pnpm_or_bun install --frozen-lockfile --prefer-offline
else
  pnpm_or_bun install
fi;

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
