#!/usr/bin/env bash

DKS_SSL_DIR="${WORKING_DIR}/volumes/ssl"
DKS_APP_DOMAIN="proconnect.127.0.0.1.nip.io"

function _ssl_generate() {
  if [ -f "${DKS_SSL_DIR}/app.crt" ] && openssl x509 -checkend 86400 -noout -in "${DKS_SSL_DIR}/app.crt" &>/dev/null; then
    return 0
  fi
  if ! command -v mkcert &>/dev/null; then
    echo "mkcert not installed. See https://github.com/FiloSottile/mkcert#installation"
    exit 1
  fi
  mkdir -p "${DKS_SSL_DIR}"
  mkcert -install
  cd "${DKS_SSL_DIR}"
  mkcert -cert-file app.crt -key-file app.key \
    "${DKS_APP_DOMAIN}" "*.${DKS_APP_DOMAIN}" "*.llng-local.${DKS_APP_DOMAIN}" "localhost" "127.0.0.1"
  cp "$(mkcert -CAROOT)/rootCA.pem" docker-stack-ca.crt
}
