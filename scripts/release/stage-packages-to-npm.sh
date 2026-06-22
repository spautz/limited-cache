#!/usr/bin/env bash

# Stage all packed public package tarballs to npm and expose the resulting stage IDs.

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

TEMP_PARENT="${RUNNER_TEMP:-${TMPDIR:-/tmp}}"
STAGED_RELEASE_JSON="$(mktemp "$TEMP_PARENT/staged-release.XXXXXX.json")"
: > "$STAGED_RELEASE_JSON"
trap 'rm -f "$STAGED_RELEASE_JSON"' EXIT

PACKED_TARBALLS=()
for PACKAGE_DIR in packages/*; do
  [[ -d "$PACKAGE_DIR" ]] || continue

  IS_PRIVATE="$(node -p "require('./$PACKAGE_DIR/package.json').private === true ? 'true' : 'false'")"
  [[ "$IS_PRIVATE" != "true" ]] || continue

  while IFS= read -r PACKED_TARBALL; do
    PACKED_TARBALLS+=("$PACKED_TARBALL")
  done < <(find "$PACKAGE_DIR" -maxdepth 1 -type f -name 'package-*.tgz' | sort)
done

if [[ "${#PACKED_TARBALLS[@]}" -eq 0 ]]; then
  echo 'No packed tarballs were found.'
  exit 1
fi

for PACKED_TARBALL in "${PACKED_TARBALLS[@]}"; do
  echo "Staging $PACKED_TARBALL"
  pnpm run --silent release:stage -- "$PACKED_TARBALL" | tee -a "$STAGED_RELEASE_JSON"
  printf '\n' >> "$STAGED_RELEASE_JSON"
done

STAGE_IDS="$(jq -r '.. | .stageId? // .stageID? // .stage_id? // empty' "$STAGED_RELEASE_JSON" | sort -u)"
if [[ -z "$STAGE_IDS" ]]; then
  echo 'Failed to extract any stage IDs from pnpm output.'
  exit 1
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo 'stage_ids<<EOF'
    printf '%s\n' "$STAGE_IDS"
    echo EOF
  } >> "$GITHUB_OUTPUT"
else
  printf '%s\n' "$STAGE_IDS"
fi

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
