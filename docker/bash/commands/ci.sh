#!/usr/bin/env bash

# Dirty hack:
# This variable is used to discriminate successful output from error output
# Every lines begining with this value are considered as a path to a modified file
BACK_PREFIX="back/"
FRONT_PREFIX="front/"

_get_hardcoded_back_files() {
  echo "${BACK_PREFIX}yarn.lock"
}

_get_hardcoded_front_files() {
  echo "/${FRONT_PREFIX}yarn.lock"
}

_get_back_app_files() {
  local app="${1}"

  local hardCoded=$(_get_hardcoded_back_files)
  local appFiles=$(
    cat "${FC_ROOT}/fc/back/dist/instances/${app}/stats.json" |
      grep -Eo '"moduleName": "./([^"]+)' |
      sed "s#\"moduleName\": \"./#${BACK_PREFIX}#"
  )

  echo -e "${hardCoded}\n${appFiles}" | sort | uniq
}

_get_front_app_files() {
  local app="${1}"

  local appMapDir="${FC_ROOT}/fc/front/instances/${app}/build/assets"
  cd ${appMapDir}

  local relativeFiles=$(cat index-*.js.map | jq ".sources" | grep -Eo '(../[^"]+)')

  local absoluteFiles=$(
    for relativeFile in ${relativeFiles}; do
      # Perform some operation on each app
      _get_abs_path "${relativeFile}"
    done
  )

  local hardCoded=$(_get_hardcoded_front_files)
  echo -e "${hardCoded}\n${absoluteFiles}" | sort | uniq
}

_get_back_diff_files() {
  local refRevision="${1}"

  cd $FC_ROOT/fc
  git diff --name-only "${refRevision}" -- "./${BACK_PREFIX}" | sort
}

_get_front_diff_files() {
  local refRevision="${1}"

  cd $FC_ROOT/fc
  git diff --name-only "${refRevision}" -- "./${FRONT_PREFIX}" | sort
}

_get_abs_path() {
  local relativePath="${1}"

  local dir=$(dirname "${relativePath}")

  local file=$(basename "${relativePath}")

  cd "${dir}"
  local absDir=$(pwd)
  cd - >/dev/null

  local repoRelativDir=$(echo "${absDir}" | sed "s#${FC_ROOT}/fc/##")
  echo "${repoRelativDir}/${file}"
}

_get_modified_files_for_back_app() {
  local app="${1}"
  local refRevision=$(git ls-remote origin "${2}" | cut -d$'\t' -f1)
  local fetchResult=$(git fetch origin "${refRevision}" &>/dev/null)

  local appFiles=$(_get_back_app_files "${app}")
  local diffFiles=$(_get_back_diff_files "${refRevision}")

  comm -12 <(echo "${diffFiles}") <(echo "${appFiles}")
}

_get_modified_files_for_front_app() {
  local app="${1}"
  local refRevision=$(git ls-remote origin "${2}" | cut -d$'\t' -f1)
  local fetchResult=$(git fetch origin "${refRevision}" &>/dev/null)

  local appFiles=$(_get_front_app_files "${app}")
  local diffFiles=$(_get_front_diff_files "${refRevision}")

  comm -12 <(echo "${diffFiles}") <(echo "${appFiles}")
}

_get_modified_files_for_back_apps() {
  local refRevision="${!#}"
  local apps=()

  local i
  for ((i = 1; i < $#; i++)); do
    apps+=("${!i}")
  done

  local output=$(
    for app in "${apps[@]}"; do
      # Perform some operation on each app
      _get_modified_files_for_back_app "${app}" "${refRevision}"
    done
  )

  echo "${output}" | sort | uniq
}

_get_modified_files_for_front_apps() {
  local refRevision="${!#}"
  local apps=()

  local i
  for ((i = 1; i < $#; i++)); do
    apps+=("${!i}")
  done

  local output=$(
    for app in "${apps[@]}"; do
      # Perform some operation on each app
      _get_modified_files_for_front_app "${app}" "${refRevision}"
    done
  )

  echo "${output}" | sort | uniq
}
