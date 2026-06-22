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

for PACKAGE_DIR in packages/*; do
  [[ -d "$PACKAGE_DIR" ]] || continue

  IS_PRIVATE="$(node -p "require('./$PACKAGE_DIR/package.json').private === true ? 'true' : 'false'")"
  [[ "$IS_PRIVATE" != "true" ]] || continue

  PACKAGE_NAME="$(node -p "require('./$PACKAGE_DIR/package.json').name")"
  EXPECTED_VERSION="$(node -p "require('./$PACKAGE_DIR/package.json').version")"
  PACKAGE_SPEC="${PACKAGE_NAME}@${EXPECTED_VERSION}"

  pnpm dist-tag add "$PACKAGE_SPEC" "$PROMOTE_TO_TAG"
  ACTUAL_VERSION="$(pnpm view "${PACKAGE_NAME}@${PROMOTE_TO_TAG}" version)"

  if [[ "$ACTUAL_VERSION" != "$EXPECTED_VERSION" ]]; then
    echo "Expected ${PACKAGE_NAME}@${PROMOTE_TO_TAG} to resolve to ${EXPECTED_VERSION}, but got ${ACTUAL_VERSION}."
    exit 1
  fi
done

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
