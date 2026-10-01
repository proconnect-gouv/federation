FROM alpine:3.22.4

WORKDIR /app

# Install curl, jq, AWS CLI, and Python3
RUN apk add --no-cache \
    curl \
    jq \
    aws-cli \
    python3 \
    py3-pip

# Install logcli (Grafana Loki) from precompiled binary
RUN curl -L https://github.com/grafana/loki/releases/download/v3.0.0/logcli-linux-amd64.zip -o /tmp/logcli.zip && \
    unzip /tmp/logcli.zip -d /usr/local/bin && \
    chmod +x /usr/local/bin/logcli-linux-amd64 && \
    ln -s /usr/local/bin/logcli-linux-amd64 /usr/local/bin/logcli && \
    rm /tmp/logcli.zip
