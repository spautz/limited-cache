#!/usr/bin/env bash

# Fail if anything in here fails
set -e

# This script runs from the project root
cd "$(dirname "$0")/.."

source ./scripts/helpers/helpers.sh

###################################################################################################
# NVM and Node

# on Windows `nvm` will be a real command; on other environments -- with "real" nvm -- it's just a function
if ! command_exists nvm; then
  NVM_INIT="$HOME/.nvm/nvm.sh"
  if [ -f $NVM_INIT ]; then
    source $NVM_INIT
  else
    echo "Could not find nvm!"
  fi
fi

# Must include .nvmrc content manually to support all platforms
run_command "nvm install $(cat .nvmrc)"
run_command "nvm use $(cat .nvmrc)"

if ! command_exists yarn; then
  echo "Could not find yarn!"
fi

run_command "./scripts/check-environment.sh"
run_command "yarn install --frozen-lockfile --prefer-offline --network-timeout=60000"
run_command "yarn clean"

###################################################################################################

echo "Environment setup complete"
