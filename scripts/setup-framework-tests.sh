#!/usr/bin/env bash

THIS_SCRIPT_NAME=$(basename "$0")
echo "### Begin ${THIS_SCRIPT_NAME}"

# Fail if anything in here fails
set -e
# Run from the repo root
pushd "$(dirname -- "${BASH_SOURCE[0]:-$0}")/.."

source ./scripts/helpers/helpers.sh

###################################################################################################

# Setup workspace and Yalc
run_command "./scripts/check-environment.sh"
pnpm_or_bun install --ignore-scripts
pnpm_or_bun run packages:yalc-publish

# Setup each framework-test
for DIRECTORY in framework-tests/*/ ; do
  pushd $DIRECTORY

  # Use workspace's copy of Yalc to copy over any necessary local packages, so that they'll be
  # in place when we try to install
  ../../node_modules/.bin/yalc update

  popd
done

###################################################################################################

popd
echo "### End ${THIS_SCRIPT_NAME}"
