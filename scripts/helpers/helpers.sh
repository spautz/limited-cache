#!/usr/bin/env bash

###############################################################################

# Helpful functions for the other bash scripts in this directory.
# Note that this is not a runnable script itself.

command_exists() {
  # This check is based on https://unix.stackexchange.com/questions/85249/why-not-use-which-what-to-use-then
  command -v "$1" >/dev/null 2>&1
}

emit_warning() {
  local MESSAGE="$*"

  echo "###"
  echo "###"
  echo "WARNING: ${MESSAGE}"
  echo "###"
  echo "###"
}

read_package_json_field() {
  local PACKAGE_DIR="$1"
  local FIELD_NAME="$2"

  # Read a single field from a package.json without repeating inline Node code.
  node -e '
    const fs = require("node:fs");
    const packageJsonPath = process.argv[1];
    const fieldName = process.argv[2];
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const value = packageJson[fieldName];

    if (value === undefined) {
      process.exit(1);
    }

    process.stdout.write(String(value));
  ' "$PACKAGE_DIR/package.json" "$FIELD_NAME"
}

is_public_package_dir() {
  [[ "$(read_package_json_field "$1" private)" != "true" ]]
}

# Iterate over every non-private package directory under packages/.
for_each_public_package() {
  local PACKAGE_DIR

  for PACKAGE_DIR in packages/*; do
    [[ -d "$PACKAGE_DIR" ]] || continue
    if is_public_package_dir "$PACKAGE_DIR"; then
      "$@" "$PACKAGE_DIR"
    fi
  done
}

enable_trace() {
  export PS4='+ ${BASH_SOURCE##*/}:${LINENO}: '
  set -x
}

# This simply echoes and then runs a command. It's just an alternative to turning on echo globally (set -x)
# so that we get cleaner output.
run_command() {
  if [[ ${1:-} == "pnpm" && ${2:-} == "dlx" ]]; then
    echo "Use run_command_pnpm_dlx instead of run_command for pnpm dlx invocations." >&2
    return 1
  fi

  printf '+ '
  printf '%q ' "$@"
  printf '\n'

  "$@"
}

# `pnpm dlx` will create a lockfile if it doesn't exist yet, and there's no good way to prevent this
# (as of pnpm 11.5.0) -- so we'll manually restore the prior lockfile state after it runs.
run_command_pnpm_dlx() {
  (
    if [ ! -f "./pnpm-lock.yaml" ]; then
      trap 'rm -f ./pnpm-lock.yaml' EXIT
    fi

    printf '+ '
    printf '%q ' pnpm dlx "$@"
    printf '\n'

    pnpm dlx "$@"
  )
}

read_package_version_with_retry() {
  local PACKAGE_SPEC="$1"
  local EXPECTED_VERSION="$2"
  local DEADLINE_SECONDS=30
  local DEADLINE
  local ACTUAL_VERSION

  DEADLINE=$(( $(date +%s) + DEADLINE_SECONDS ))

  while true; do
    ACTUAL_VERSION="$(pnpm view "${PACKAGE_SPEC}" version)"
    if [[ "$ACTUAL_VERSION" == "$EXPECTED_VERSION" ]]; then
      printf '%s\n' "$ACTUAL_VERSION"
      return 0
    fi

    if (( $(date +%s) >= DEADLINE )); then
      printf '%s\n' "$ACTUAL_VERSION"
      return 1
    fi

    sleep 2
  done
}

###############################################################################

# Automatically enable global tracing if `TRACE` is enabled
if [[ ${TRACE:-0} == 1 ]]; then
  enable_trace
fi
