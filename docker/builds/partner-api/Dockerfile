FROM python:3.13.2-slim

# Install MongoDB Shell (mongosh)
# RUN apt-get update && apt-get install -y wget gnupg && \
#     wget -qO - https://pgp.mongodb.com/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-keyring.gpg && \
#     echo "deb [signed-by=/usr/share/keyrings/mongodb-server-keyring.gpg] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
#     apt-get update && apt-get install -y mongodb-mongosh && \
#     rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/app

# Get prypject.toml from context
COPY partner-api/pyproject.toml .

# Install dependencies
RUN pip install .

# Installing ping
# RUN apt-get update
# RUN apt-get install -y iputils-ping

# Copy source code
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]