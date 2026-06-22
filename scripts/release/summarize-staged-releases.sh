#!/usr/bin/env bash

# Write the staged npm release IDs to the GitHub Actions step summary.

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

if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  exec 3>> "$GITHUB_STEP_SUMMARY"
else
  exec 3>&1
fi

{
  echo '## Staged releases'
  echo
  echo 'Approve these stages manually on npm, then run the Verify and Promote Release workflow.'
  echo
} >&3

while IFS= read -r STAGE_ID; do
  [[ -n "$STAGE_ID" ]] || continue
  echo "- \`$STAGE_ID\`" >&3
done <<< "${STAGE_IDS:-}"

###################################################################################################
# Standard teardown for all scripts

exec 3>&-
popd
echo "### End ${THIS_SCRIPT_NAME}"
