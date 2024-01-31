#!/usr/bin/env bash

THIS_SCRIPT_NAME=$(basename "$0")
echo "### Begin ${THIS_SCRIPT_NAME}"

# Fail if anything in here fails
set -e
# Run from the repo root
pushd "$(dirname -- "${BASH_SOURCE[0]:-$0}")/.."

source ./scripts/helpers/helpers.sh

###################################################################################################
# Clean everything local first -- and again at the end

if [ -d "./node_modules/" ]; then
  for DIRECTORY in framework-tests/*/ ; do
    pushd $DIRECTORY

    if [[ `git status --porcelain package.json yalc.lock` ]]; then
      emit_warning "Not detaching $DIRECTORY because it has local changes."
    else
      # Detach the framework-test completely -- but leave the lockfile and package.json changes intact
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


./scripts/clean-everything.sh

###################################################################################################

popd
echo "### End ${THIS_SCRIPT_NAME}"
