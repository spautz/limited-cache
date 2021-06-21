#!/usr/bin/env bash

# Fail if anything in here fails
set -e

# This script runs from the project root
cd "$(dirname "$0")/.."

source ./scripts/helpers/helpers.sh

###################################################################################################
# Halt running processes and local servers

if command_exists killall; then
  run_command killall -v node || true
fi

if command_exists xcrun; then
  run_command xcrun simctl shutdown all || true
fi

##################################################################################################
# Clear caches

if [ -d "./node_modules/" ]; then
  run_command yarn clean
  run_npm_command jest --clearCache
else
  run_npm_command jest --clearCache --config={}
fi

if command_exists yarn; then
  run_command yarn cache clean
fi

run_command npm cache clean --force

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
  build/
  coverage/
  dist/
  legacy-types/
  lib-dist/
  node_modules/
  storybook-static/
  lerna-debug.log*
  npm-debug.log*
  yarn-debug.log*
  yarn-error.log*
  "

REMAINING_FILES=$(git clean -xdn)
if [[ $REMAINING_FILES ]]; then
  echo "Ignored files left:"
  echo "$REMAINING_FILES"
fi;

###################################################################################################

echo "Environment reset completed"
