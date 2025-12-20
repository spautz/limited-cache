#!/usr/bin/env bash

# This updates external tests by publishing local packages and updating yalc dependencies

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

# This script assumes you've already run either `setup-local-environment.sh` or
# `setup-ci-environment.sh`

pnpm_or_bun run publish:yalc

for DIRECTORY in external-tests/*/ ; do
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
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
