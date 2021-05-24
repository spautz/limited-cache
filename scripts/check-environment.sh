#!/usr/bin/env bash

# Fail if anything in here fails
set -e

# This script runs from the project root
cd "$(dirname "$0")/.."

source ./scripts/helpers/helpers.sh

###################################################################################################
# Check versions of Node, Yarn, and any other tools required

# If "engines" is set in package.json, validate against its values
HAS_ENGINES=$(get_json_value package.json "engines")
if [ $HAS_ENGINES ]; then
  run_npm_command check-node-version --package --print
fi

# If a "node" value is not set in package.json's "engines", validate against .nvmrc
HAS_ENGINES_NODE=$(get_json_value package.json "node")
if [ ! $HAS_ENGINES ] || [ ! $HAS_ENGINES_NODE ]; then
  NODE_ACTUAL=$(echo $(node --version) | tr -d '[v:space:]')
  NODE_DESIRED=$(cat .nvmrc)

  echo "Node version: $NODE_ACTUAL"
  if [ $NODE_DESIRED ] && [ $NODE_ACTUAL != $NODE_DESIRED ]; then
    echo "Node version desired: $NODE_DESIRED"
    exit 1
  fi
fi

###################################################################################################

echo "Environment checks completed"
