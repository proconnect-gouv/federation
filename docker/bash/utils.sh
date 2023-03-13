#!/usr/bin/env bash

#### Global Functions:

function join_by { local IFS="$1"; shift; echo "$*"; }
