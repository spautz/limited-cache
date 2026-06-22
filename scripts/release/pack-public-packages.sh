#!/usr/bin/env bash

# Pack every public package tarball for release.

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

for PACKAGE_DIR in packages/*; do
  [[ -d "$PACKAGE_DIR" ]] || continue

  IS_PRIVATE="$(node -p "require('./$PACKAGE_DIR/package.json').private === true ? 'true' : 'false'")"
  [[ "$IS_PRIVATE" != "true" ]] || continue

  (
    cd "$PACKAGE_DIR"
    run_command pnpm pack --out package-%v.tgz
  )
done

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
