#!/usr/bin/env bash

# Stage all packed public package tarballs to npm and expose the resulting stage IDs and release tags.

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
RELEASE_TAGS=()

stage_public_package() {
  local PACKAGE_DIR="$1"
  local PACKAGE_NAME
  local PACKAGE_VERSION
  local PACKAGE_TAG
  local PACKAGE_HAS_TARBALL=0
  local PACKED_TARBALL

  PACKAGE_NAME="$(read_package_json_field "$PACKAGE_DIR" name)"
  PACKAGE_VERSION="$(read_package_json_field "$PACKAGE_DIR" version)"
  PACKAGE_TAG="${PACKAGE_NAME}@${PACKAGE_VERSION}"

  while IFS= read -r PACKED_TARBALL; do
    PACKED_TARBALLS+=("$PACKED_TARBALL")
    PACKAGE_HAS_TARBALL=1
  done < <(find "$PACKAGE_DIR" -maxdepth 1 -type f -name 'package-*.tgz' | sort)

  if [[ "$PACKAGE_HAS_TARBALL" -eq 1 ]]; then
    RELEASE_TAGS+=("$PACKAGE_TAG")
  fi
}

for_each_public_package stage_public_package

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

RELEASE_TAG_NAMES="$(printf '%s\n' "${RELEASE_TAGS[@]}" | sort -u)"
if [[ -z "$RELEASE_TAG_NAMES" ]]; then
  echo 'Failed to derive any release tags from package metadata.'
  exit 1
fi

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo 'stage_ids<<EOF'
    printf '%s\n' "$STAGE_IDS"
    echo EOF
    echo 'release_tags<<EOF'
    printf '%s\n' "$RELEASE_TAG_NAMES"
    echo EOF
  } >> "$GITHUB_OUTPUT"
else
  printf '%s\n' "$STAGE_IDS"
  printf '%s\n' "$RELEASE_TAG_NAMES"
fi

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
