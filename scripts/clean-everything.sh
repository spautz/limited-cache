#!/usr/bin/env bash

THIS_SCRIPT_NAME=$(basename "$0")
echo "### Begin ${THIS_SCRIPT_NAME}"

# Fail if anything in here fails
set -e
# Run from the repo root
pushd "$(dirname -- "${BASH_SOURCE[0]:-$0}")/.."

source ./scripts/helpers/helpers.sh

###################################################################################################
# Halt running processes and local servers

if command_exists killall; then
  run_command killall -v node || true
fi

if command_exists watchman; then
  run_command watchman watch-del-all
fi

##################################################################################################
# Remove any and all generated files

if [ -d "./node_modules/" ]; then
  pnpm_or_bun run clean
fi

for DIRECTORY in framework-tests/*/ ; do
  pushd $DIRECTORY
  if [ -d "./node_modules/" ]; then
    pnpm_or_bun run clean
  fi
  rm -f bun.lockb package-lock.json pnpm-lock.yaml yarn.lock
  popd
done

run_command "rm -rf
  $TMPDIR/react-*
  "

for DIRECTORY in '.' 'demos/*' 'framework-tests/*' 'packages/*' ; do
  run_command "rm -rf
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

popd
echo "### End ${THIS_SCRIPT_NAME}"
