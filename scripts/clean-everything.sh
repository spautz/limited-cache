#!/usr/bin/env bash

# Fail if anything in here fails
set -e

# This script runs from the project root
cd "$(dirname "$0")/.."

source scripts/helpers.sh

###################################################################################################
# Halt running processes and local servers

if command_exists killall; then
  run_command killall node
fi

if command_exists xcrun; then
  run_command xcrun simctl shutdown all
fi

##################################################################################################
# Clear caches

run_npm_command jest --clearCache --config={}

run_command npm cache clean --force
run_command yarn cache clean

if command_exists watchman; then
  run_command watchman watch-del-all
fi

run_command "rm -rf
  $TMPDIR/react-*
  "

##################################################################################################
# Remove generated files

run_command "rm -rf
  .yarn
  coverage/
  dist/
  node_modules/
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*
  "
