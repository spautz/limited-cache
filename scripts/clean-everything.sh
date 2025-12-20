#!/usr/bin/env bash

# This script cleans everything in the repo: packages, demos, and external tests
# It is the inverse of `build-everything.sh`

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

if command_exists killall; then
  run_command killall -v node || true
fi

if command_exists watchman; then
  run_command watchman watch-del-all
fi

# Remove any and all generated files

if [ -d "./node_modules/" ]; then
  pnpm_or_bun run clean
fi

run_command "rm -rf
  ${TMPDIR:-/tmp}/react-*
  "

for DIRECTORY in '.' 'docs-website' 'demos/*' 'external-tests/*' 'packages/*' ; do
  run_command "rm -rf
    $DIRECTORY/.turbo/
    $DIRECTORY/.yalc/
    $DIRECTORY/build/
    $DIRECTORY/coverage/
    $DIRECTORY/dist/
    $DIRECTORY/e2e-test-output/
    $DIRECTORY/legacy-types/
    $DIRECTORY/node_modules/
    $DIRECTORY/playwright-report/
    $DIRECTORY/public/build/
    $DIRECTORY/storybook-static/
    $DIRECTORY/*.log*
    "
done

REMAINING_FILES=$(git clean -xdn | sed 's/Would remove /    /')
if [[ $REMAINING_FILES ]]; then
  echo "Ignored files left:"
  echo "$REMAINING_FILES"
fi;

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
