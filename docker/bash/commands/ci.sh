#!/usr/bin/env bash

# Dirty hack:
# This variable is used to discriminate successful output from error output
# Every lines begining with this value are considered as a path to a modified file
BACK_PREFIX="back/"

_get_app_files() {
  local app="${1}"

  cat "${FC_ROOT}/fc/back/dist/instances/${app}/stats.json" |
    grep -Eo '"moduleName": "./([^"]+)' |
    sed "s#\"moduleName\": \"./#${BACK_PREFIX}#" |
    sort |
    uniq
}

_get_back_diff_files() {
  local refRevision="${1}"

  cd $FC_ROOT/fc
  git diff --name-only "${refRevision}" "./${BACK_PREFIX}" | sort
}

_get_modified_files_for_app() {
  local app="${1}"
  local refRevision="${2}"

  local appFiles=$(_get_app_files "${app}")
  local diffFiles=$(_get_back_diff_files "${refRevision}")

  comm -12 <(echo "${diffFiles}") <(echo "${appFiles}")
}

_get_modified_files_for_apps() {
  local refRevision="${!#}"
  local apps=()

  local i
  for ((i = 1; i < $#; i++)); do
    apps+=("${!i}")
  done

  local output=$(
    for app in "${apps[@]}"; do
      # Perform some operation on each app
      _get_modified_files_for_app "${app}" "${refRevision}"
    done
  )

  echo "${output}" | sort | uniq
}

_ci_job_relevant_for_apps() {
  if [ "${CI_MERGE_REQUEST_SOURCE_BRANCH_NAME}" == "staging" ] || [ "${CI_COMMIT_BRANCH}" == "staging" ]; then
    echo "STATUS=SKIP"
    exit 0
  fi

  # Build the apps to obtain the stats file
  cd "${CI_PROJECT_DIR}/back"
  yarn install

  local i
  for ((i = 1; i <= $#; i++)); do
    local app="${!i}"
    echo "buiding ${app}"
    yarn "build:${app}"
  done

  # Auto fetch ci MR target revision
  git fetch origin "${CI_MERGE_REQUEST_TARGET_BRANCH_NAME}"

  # Search for updated files
  local files=$(_get_modified_files_for_apps "${@}" "origin/${CI_MERGE_REQUEST_TARGET_BRANCH_NAME}" 2>&1)

  local errors=$(echo "${files}" | grep -Ev "^${BACK_PREFIX}.+$")

  if [ "${errors}" != "" ]; then
    echo "STATUS=ERRORS"
    echo "❌ An error occured in file changes detection:"
    echo "${errors}"
    echo "Exiting job with failure"

  elif [ -z "${files}" ]; then
    echo "STATUS=NO_CHANGES"
    echo "✅ No file were updated in relevant applications"
    echo "Exiting job with success"

  else
    echo "STATUS=CHANGES_FOUND"
    echo "🔍 Some files in relevant apps where updated in current revision"
    echo "Pursuing the job..."
    echo "List of updated files:"
    echo "${files}" | sed "s#${BACK_PREFIX}# - ${BACK_PREFIX}#"

  fi
}
