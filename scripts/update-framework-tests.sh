#!/usr/bin/env bash

THIS_SCRIPT_NAME=$(basename "$0")
echo "### Begin ${THIS_SCRIPT_NAME}"

# Fail if anything in here fails
set -e
# Run from the repo root
pushd "$(dirname -- "${BASH_SOURCE[0]:-$0}")/.."

source ./scripts/helpers/helpers.sh

###################################################################################################

# This script assumes you've already run either `setup-local-environment.sh` or
# `setup-ci-environment.sh`

for DIRECTORY in framework-tests/*/ ; do
  pushd $DIRECTORY

  # Use workspace's copy of Yalc to copy over any necessary local packages, so that they'll be
  # in place when we try to install
  if [ -f "./package.json" ]; then
    ../../node_modules/.bin/yalc update
  fi
  # TODO: else = Deno or other alternative

  popd
done

###################################################################################################

popd
echo "### End ${THIS_SCRIPT_NAME}"
