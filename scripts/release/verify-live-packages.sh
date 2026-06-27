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

verify_public_package() {
  local PACKAGE_DIR="$1"
  local PACKAGE_NAME
  local EXPECTED_VERSION
  local ACTUAL_VERSION

  PACKAGE_NAME="$(read_package_json_field "$PACKAGE_DIR" name)"
  EXPECTED_VERSION="$(read_package_json_field "$PACKAGE_DIR" version)"
  ACTUAL_VERSION="$(read_package_version_with_retry "${PACKAGE_NAME}@${NPM_TAG}" "$EXPECTED_VERSION")"

  if [[ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]]; then
    echo "Expected ${PACKAGE_NAME}@${NPM_TAG} to resolve to ${EXPECTED_VERSION}, but got ${ACTUAL_VERSION}."
    exit 1
  fi

  verify_package_installation "$PACKAGE_NAME"
}

for_each_public_package verify_public_package

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
