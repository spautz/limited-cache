# These are helpful functions for the other bash scripts in this directory.
# Note that this is not a runnable script itself.

command_exists() {
  # This check is based on https://unix.stackexchange.com/questions/85249/why-not-use-which-what-to-use-then
  command -v "$1" > /dev/null 2>&1
}

get_json_value() {
  local FILE=$1
  local PROPERTY=$2

  echo $(cat $FILE \
    | grep "\"$PROPERTY\":" \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g' \
    | tr -d '[[:space:]]'
  )
}

# This simply echoes and then runs a command. It's just an alternative to turning on echo (set -x)
run_command() {
  local FULL_COMMAND=$*

  echo "$FULL_COMMAND"
  $FULL_COMMAND
}

# Given a command like `run_npm_command("jest" "--version")`, this will look for a directly-runnable command
# (i.e., "jest" if you have jest-cli installed) but also fall back to using npx to run the desired command if you don't.
run_npm_command() {
  local EXEC=$1
  local FULL_COMMAND=$*

  if command_exists "$EXEC"; then
    run_command $FULL_COMMAND
  else
    run_command npx $FULL_COMMAND
  fi
}
