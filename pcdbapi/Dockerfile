FROM python:3.14.6-slim

WORKDIR /app

# Install dependencies
COPY pyproject.toml .
RUN pip install .

# Copy source code
COPY . .

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/livez')"

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
