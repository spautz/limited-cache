#!/usr/bin/env bash

# Fail if anything in here fails
set -e

# This script runs from the project root
cd "$(dirname "$0")/.."

source scripts/helpers.sh

###################################################################################################
# Setup: Node should already have been set up in the environment init

run_command "./scripts/check-environment.sh"
run_command "yarn install --frozen-lockfile"

###################################################################################################
# Run whatever the script in package.json wants to run

run_command "yarn ci"
