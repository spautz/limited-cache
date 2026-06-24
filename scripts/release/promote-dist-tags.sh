#!/usr/bin/env bash

# Promote every public package from the verified npm dist-tag to another dist-tag.

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
PROMOTE_TO_TAG="${PROMOTE_TO_TAG:?PROMOTE_TO_TAG is required.}"

if [[ -z "${NODE_AUTH_TOKEN:-}" ]]; then
  echo 'NODE_AUTH_TOKEN is required.'
  exit 1
fi

promote_public_package() {
  local PACKAGE_DIR="$1"
  local PACKAGE_NAME
  local EXPECTED_VERSION
  local PACKAGE_SPEC
  local ACTUAL_VERSION

  PACKAGE_NAME="$(read_package_json_field "$PACKAGE_DIR" name)"
  EXPECTED_VERSION="$(read_package_json_field "$PACKAGE_DIR" version)"
  PACKAGE_SPEC="${PACKAGE_NAME}@${EXPECTED_VERSION}"

  pnpm dist-tag add "$PACKAGE_SPEC" "$PROMOTE_TO_TAG"
  ACTUAL_VERSION="$(read_package_version_with_retry "${PACKAGE_NAME}@${PROMOTE_TO_TAG}" "$EXPECTED_VERSION")"

  if [[ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]]; then
    echo "Expected ${PACKAGE_NAME}@${PROMOTE_TO_TAG} to resolve to ${EXPECTED_VERSION}, but got ${ACTUAL_VERSION}."
    exit 1
  fi
}

for_each_public_package promote_public_package

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
