# Technology Stack

## Backend

- **Framework**: Google Agent Development Kit (ADK) v1.8.0+
- **Language**: Python 3.10-3.12
- **Package Manager**: uv (preferred) or pip
- **API Framework**: FastAPI (via ADK)
- **LLM**: Gemini 2.5 Flash
- **Authentication**: Google Cloud (Vertex AI) or Google AI Studio API Key

### Key Libraries

- `google-adk` - Core agent framework
- `google.auth` - Google Cloud authentication
- `google.genai` - Gemini model integration
- `vertexai` - Vertex AI services integration

### Services

- **Vertex AI Memory Bank Service** - Long-term memory storage
- **Google Search** - Recipe search tool
- **Agent Engine** - Deployment target for production

## Frontend

- **Framework**: Angular 19
- **Language**: TypeScript 5.7
- **UI Components**: PrimeNG
- **Build Tool**: Angular CLI
- **Linting**: ESLint

### Key Dependencies

- `primeng` - UI component library
- `uuid` - Session ID generation
- Direct HTTP fetch for backend communication

## Development Tools

- **Testing**: pytest with pytest-asyncio
- **Linting**: ruff, mypy, codespell
- **Type Checking**: mypy with strict configuration
- **Notebooks**: Jupyter for prototyping

## Common Commands

```bash
# Install dependencies
make install

# Run development servers (backend + frontend)
make dev

# Run backend only
make dev-backend

# Run frontend only
make dev-frontend

# Launch ADK playground (Streamlit UI)
make playground

# Run tests
make test

# Run linting
make lint

# Deploy to Agent Engine
make deploy

# Setup dev environment infrastructure
make setup-dev-env
```

## Environment Configuration

Create `app/.env` file with:

```bash
# For Google AI Studio
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=your_api_key_here

# For Vertex AI (production)
GOOGLE_GENAI_USE_VERTEXAI=True
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLOUD_AGENT_ENGINE_ID=your_agent_engine_id
```

## Deployment Targets

- **Local Development**: `adk api_server` + Angular dev server
- **Cloud Run**: Primary production deployment (containerized FastAPI backend)
- **Firebase Hosting**: Frontend deployment target
- **Agent Engine**: Alternative Vertex AI managed service deployment (not currently used)
