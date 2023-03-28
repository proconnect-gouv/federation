
declare -A __CMD_COMMANDS
declare -A __CMD_USAGES


function _command_register() {
  local KEY=$1
  local COMMAND=$2
  local USAGE=$3

  __CMD_COMMANDS[$KEY]+=$COMMAND
  __CMD_USAGES[$KEY]+=$USAGE
}

function _command_run() {
  local KEY=$1

  if [ -v $KEY ]; then
    echo "No command found"
    echo "Use help to see all avilable commands:"
    echo " > ./docker-stack help" 
    exit 1;
  fi

  local CMD=${__CMD_COMMANDS[$KEY]}

  if [ -v $CMD ]; then
    echo "Command not found: <$KEY>"
    echo "Use help to see all avilable commands:"
    echo " > ./docker-stack help" 
    exit 1;
  fi

  $CMD ${@:2}
}

function _command_list() {

  echo ""
  echo "Available commands:"

  for i in "${!__CMD_USAGES[@]}"
  do
    echo -e " * \e[1;36m${i}\e[0;0m: ${__CMD_USAGES[$i]}"
  done

  echo "---------------------------"
  echo "Use env variable 'VERBOSE' to get verbose output"
  echo "ex."
  echo "> VERBOSE=1 docker-stack up min-core-legacy"  
}