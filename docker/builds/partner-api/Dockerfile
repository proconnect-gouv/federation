ARG PYTHON_VERSION=3.7
FROM python:${PYTHON_VERSION}-alpine

# WORKDIR /app

# Install dependencies
# COPY pyproject.toml .
# RUN pip install .
RUN pip install "fastapi[standard]"
RUN pip install uvicorn

# Copy source code
COPY . .

# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]