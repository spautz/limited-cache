#!/usr/bin/env bash

THIS_SCRIPT_NAME=$(basename "$0")
echo "### Begin ${THIS_SCRIPT_NAME}"

# Fail if anything in here fails
set -e
# Run from the repo root
pushd "$(dirname -- "${BASH_SOURCE[0]:-$0}")/.."

source ./scripts/helpers/helpers.sh

###################################################################################################
# `setup-ci-environment.sh` is for CI runs where system-level dependencies are already met.
# We don't want to clobber that setup with NVM.

run_command "./scripts/check-environment.sh"

# Only use the lockfile if it exists: for many demos and framework-tests it's better to ignore the
# lockfile, to catch issues that package consumers might encounter when upgrading.
if [ -f "./pnpm-lock.yaml" ]; then
  pnpm_or_bun install --frozen-lockfile --prefer-offline
else
  pnpm_or_bun install
fi;

###################################################################################################

popd
echo "### End ${THIS_SCRIPT_NAME}"
