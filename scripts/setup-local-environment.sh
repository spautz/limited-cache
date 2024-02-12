#!/usr/bin/env bash

THIS_SCRIPT_NAME=$(basename "$0")
echo "### Begin ${THIS_SCRIPT_NAME}"

# Fail if anything in here fails
set -e
# Run from the repo root
pushd "$(dirname -- "${BASH_SOURCE[0]:-$0}")/.."

source ./scripts/helpers/helpers.sh

###################################################################################################
# `setup-local-environment.sh` is for developers to use on their local machines.
# It's a quick way to run through the repo-setup steps in CONTRIBUTING.md
#
# NOTE: this script will mutate your environment to match the repo's needs.

if [[ ! "${BASH_SOURCE[0]}" != "${0}" ]]; then
  emit_warning "${THIS_SCRIPT_NAME} is NOT being sourced: you should run 'source $0' instead."
fi;

# on Windows `nvm` will be a real command; on other environments -- with "real" nvm -- it's just a function
if ! command_exists nvm; then
  NVM_INIT="$HOME/.nvm/nvm.sh"
  if [ -f $NVM_INIT ]; then
    source $NVM_INIT
  else
    emit_warning "Could not find nvm."
  fi
fi

# Must include .nvmrc content manually to support all platforms
run_command "nvm install $(cat .nvmrc)"
run_command "nvm use $(cat .nvmrc)"

run_command "corepack enable"

if ! command_exists pnpm; then
  echo "Could not find pnpm!"
  exit 1
fi

run_command "./scripts/check-environment.sh"

# Ensure any lingering artifacts from earlier work have been cleaned out
pnpm_or_bun install --frozen-lockfile --prefer-offline

###################################################################################################

popd
echo "### End ${THIS_SCRIPT_NAME}"
