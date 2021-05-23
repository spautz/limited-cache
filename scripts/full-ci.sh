#!/usr/bin/env bash

# Fail if anything in here fails
set -e

# This script runs from the project root
cd "$(dirname "$0")/.."

source ./scripts/helpers/helpers.sh


if [[ $* == *--local* ]]; then

  if command_exists act; then
    # act =  https://github.com/nektos/act
    act
  else
    echo "Could not find act"
    exit 1
  fi

  # @TODO: Detect actions-runner/Runner.Client
  # https://github.com/ChristopherHX/runner.server

else
  # This is a manually-synced copy of what's in .github/worksflows/ci.yml

  run_command "./scripts/check-environment.sh"
  run_command "yarn install --ignore-scripts --prefer-offline"
  run_command "yarn clean"
  run_command "yarn all:readonly"
  run_command "yarn build"

fi

###################################################################################################

echo "Local CI completed"
