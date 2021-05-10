FROM gitlab.dev-franceconnect.fr:5005/france-connect/infra/eidas-mock:2.4

COPY ./volumes/ssl/docker-stack-ca.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates
