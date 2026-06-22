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

###############################################################################

# Automatically enable global tracing if `TRACE` is enabled
if [[ ${TRACE:-0} == 1 ]]; then
  enable_trace
fi
