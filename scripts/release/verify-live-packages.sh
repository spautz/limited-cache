#!/usr/bin/env bash

# Verify that every public package resolves to the expected version for a given npm dist-tag.

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

NPM_TAG="${NPM_TAG:?NPM_TAG is required.}"

verify_package_installation() {
  local PACKAGE_NAME=$1
  local TEMP_DIR

  TEMP_DIR="$(mktemp -d)"

  (
    trap 'rm -rf "$TEMP_DIR"' EXIT
    cd "$TEMP_DIR"
    # npm is required here for --include-attestations; pnpm audit signatures verifies signatures only.
    npm init -y >/dev/null 2>&1
    npm install "${PACKAGE_NAME}@${NPM_TAG}" --ignore-scripts
    npm audit signatures --json --include-attestations
  )
}

for PACKAGE_DIR in packages/*; do
  [[ -d "$PACKAGE_DIR" ]] || continue

  IS_PRIVATE="$(node -p "require('./$PACKAGE_DIR/package.json').private === true ? 'true' : 'false'")"
  [[ "$IS_PRIVATE" != "true" ]] || continue

  PACKAGE_NAME="$(node -p "require('./$PACKAGE_DIR/package.json').name")"
  EXPECTED_VERSION="$(node -p "require('./$PACKAGE_DIR/package.json').version")"
  ACTUAL_VERSION="$(pnpm view "${PACKAGE_NAME}@${NPM_TAG}" version)"

  if [[ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]]; then
    echo "Expected ${PACKAGE_NAME}@${NPM_TAG} to resolve to ${EXPECTED_VERSION}, but got ${ACTUAL_VERSION}."
    exit 1
  fi

  verify_package_installation "$PACKAGE_NAME"
done

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
