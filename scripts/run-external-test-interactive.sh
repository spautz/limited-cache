#!/usr/bin/env bash

# Interactive variant – drops you into a shell inside the requested external test
# container with all service ports forwarded.
# Usage: run-external-test-interactive.sh <profile> [extra docker compose args]

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
# Usage and arguments

show_usage() {
  echo "Usage: $0 <profile> [extra docker compose args] [-h|--help]"
  echo "  profile       Profile name (e.g. cra5-react18). Required, must be the first argument."
  echo "  extra args    Extra arguments to pass to docker compose."
  echo "  -h, --help    Display this help message."
}

if [[ $# -eq 0 ]]; then
  echo "Error: profile name is required"
  show_usage
  exit 1
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_usage
      exit 0
      ;;
    -*)
      echo "Unknown option: $1"
      show_usage
      exit 1
      ;;
    *)
      break
      ;;
  esac
done

PROFILE=${1?profile name (e.g. cra5-react18)}
shift || true

EXTRA_ARGS=("$@")

###################################################################################################
# Main body

COMPOSE_FILE="$REPO_ROOT/docker-compose.external-tests.yaml"
INTERACTIVE_NAME="${PROFILE}-interactive"

# Cleanup function to be called on script exit
cleanup() {
  echo "--- Cleaning up services for profile '$PROFILE' ---"
  # Stops and removes containers, networks, and volumes.
  # Using --profile ensures we only affect the relevant service.
  run_command docker compose -f "$COMPOSE_FILE" --profile "$PROFILE" down --remove-orphans -v
}

# Trap EXIT signal to ensure cleanup happens regardless of script outcome
trap 'cleanup || true' EXIT INT TERM


run_command docker compose -f "$COMPOSE_FILE" \
  --profile "$PROFILE" \
  run --build --service-ports  \
    --name "$INTERACTIVE_NAME" \
  "${EXTRA_ARGS[@]}" \
  "$PROFILE"  bash                                                        \
  || true;  # We continue even if the last command failed


CONTAINER_ID=$(docker ps -a --filter="name=${INTERACTIVE_NAME}" --format "{{.ID}}" --last 1)
echo "CONTAINER_ID=$CONTAINER_ID"
IMAGE_ID=$(docker inspect --format='{{.Image}}' "$CONTAINER_ID")
echo "IMAGE_ID=$IMAGE_ID"
EXIT_CODE=$(docker inspect --format='{{.State.ExitCode}}' "$CONTAINER_ID")
echo "EXIT_CODE=$EXIT_CODE"


# gather all label keys matching external-test.artifact.*
mapfile -t LABEL_KEYS < <(
  docker inspect --format '{{range $k,$v := .Config.Labels}}{{println $k}}{{end}}' "$CONTAINER_ID" \
    | grep '^external-test\.artifact\.' || true
)

# pull out each label's value (which is formatted as either "path" or "sourcePath::destinationPath")
ARTIFACTS=()
for key in "${LABEL_KEYS[@]}"; do
  ARTIFACTS+=("$(
    docker inspect \
      --format "{{ index .Config.Labels \"$key\" }}" \
      "$CONTAINER_ID"
  )")
done

if (( ${#ARTIFACTS[@]} == 0 )); then
  echo "No artifacts to copy."
else
  for entry in "${ARTIFACTS[@]}"; do
    SOURCE_PATH="${entry%%::*}"
    DESTINATION_PATH="${entry#*::}"
    if [[ "$DESTINATION_PATH" == "$entry" ]]; then
      # We just had "path", instead of "sourcePath::destinationPath"
      DESTINATION_PATH="$(basename "$SOURCE_PATH")"
    fi
    HOST_PATH="$REPO_ROOT/external-tests/$PROFILE/$DESTINATION_PATH"

    mkdir -p "$(dirname "$HOST_PATH")"
    echo "Copying '$SOURCE_PATH' → '$HOST_PATH'"
    if ! docker cp "$CONTAINER_ID:$SOURCE_PATH" "$HOST_PATH" 2>/dev/null; then
      echo "Warning: failed to copy '$SOURCE_PATH'. It may not exist."
    fi
  done
fi


# The 'trap cleanup EXIT' will be executed automatically when the script exits.

###################################################################################################
# Standard teardown for all scripts

popd
echo "### End ${THIS_SCRIPT_NAME}"
