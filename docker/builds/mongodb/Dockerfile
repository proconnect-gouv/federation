FROM mongo:8.2.10

RUN openssl rand -base64 756 > /mongo-key-file
COPY ./volumes/ssl/docker-stack-ca.crt /usr/local/share/ca-certificates/
COPY ./volumes/ssl/mongo.pem /mongo.pem

RUN chmod 400 /mongo-key-file /mongo.pem && \
    chown mongodb:mongodb /mongo-key-file /mongo.pem && \
    update-ca-certificates

COPY ./builds/mongodb/healthcheck.sh /
HEALTHCHECK --interval=5s --timeout=10s --start-period=30s --retries=5 CMD [ "bash", "/healthcheck.sh" ]

CMD [ \
    "--keyFile", "/mongo-key-file", \
    "--replSet", "rs0",\
    "--tlsCAFile", "/usr/local/share/ca-certificates/docker-stack-ca.crt", \
    "--tlsCertificateKeyFile", "/mongo.pem", \
    "--tlsMode", "requireTLS", \
    "--tlsAllowConnectionsWithoutCertificates" \
]
