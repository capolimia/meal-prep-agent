# Dockerfile for Cloud Run deployment with CORS support

FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --no-dev

# Copy application code
COPY app ./app

# Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8080

# Run ADK API server with CORS
CMD ["uv", "run", "adk", "api_server", "app", "--host", "0.0.0.0", "--port", "8080", "--allow_origins=*"]
