#!/usr/bin/env bash

# This wipes all caches and resets everything that it can

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

if [ -d "./node_modules/" ]; then
  for DIRECTORY in external-tests/*/ ; do
    pushd $DIRECTORY

    if [[ `git status --porcelain package.json yalc.lock` ]]; then
      emit_warning "Not detaching $DIRECTORY because it has local changes."
    else
      # Detach the external-test completely -- but leave the lockfile and package.json changes intact
      # so that we can restore it later
      ../../node_modules/.bin/yalc remove --all
      git checkout package.json yalc.lock
    fi

    popd
  done
fi

./scripts/clean-everything.sh


if command_exists jest; then
  run_command "jest --clearCache"
else
  run_command "npx jest --clearCache"
fi

if command_exists pnpm; then
  run_command "rm -rf $(pnpm store path)"
fi

if command_exists yarn; then
  run_command "yarn cache clean --all"
fi

run_command "npm cache clean --force"

# We repeat the standard clean again at the end, because it's quick and to ensure nothing new was
# added while running the other commands.
./scripts/clean-everything.sh

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
