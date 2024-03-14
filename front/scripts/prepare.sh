#!/bin/bash

source "./scripts/utils.sh"

# ---------------------------------------
#
# React Apps prepare script
#
# ---------------------------------------
check_app_argument_exists() {
  [ -z "$1" ] && print_error "L'argument app_name est manquant" && exit 1
}

copy_dsfr_files() {
  DEST_FOLDER="./instances/$1/public"
  DSFR_FOLDER="./node_modules/@gouvfr/dsfr/dist"

  check_source_and_files "$DSFR_FOLDER"
  check_source_and_files "$DEST_FOLDER"

  copy_folder "$DSFR_FOLDER/fonts" "$DEST_FOLDER/dsfr/fonts"
  copy_folder "$DSFR_FOLDER/icons" "$DEST_FOLDER/dsfr/icons"

  copy_file "$DSFR_FOLDER/dsfr.min.css" "$DEST_FOLDER/dsfr/dsfr.min.css"
  create_folder_path "$DEST_FOLDER/dsfr/utility"
  copy_file "$DSFR_FOLDER/utility/utility.min.css" "$DEST_FOLDER/dsfr/utility/utility.min.css"
}
