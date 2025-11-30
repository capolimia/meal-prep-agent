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

- **In-Memory Session Service** - ADK's default session storage
- **In-Memory Memory Service** - ADK's default memory service for storing conversation history (used by `auto_save_session_to_memory_callback`)
- **Google Search** - Built-in ADK tool for recipe search
- **Cloud Logging** - Google Cloud logging (configured in agent_engine_app.py but only used if deployed to Agent Engine)
- **Cloud Trace** - OpenTelemetry tracing (configured in agent_engine_app.py but only used if deployed to Agent Engine)

## Frontend

- **Framework**: Angular 20.3
- **Language**: TypeScript 5.9
- **UI Components**: PrimeNG 20.3
- **Styling**: Tailwind CSS 4.1 with PrimeUI plugin
- **Build Tool**: Angular CLI 20.3
- **SSR**: Angular SSR with Express 5.1

### Key Dependencies

- `primeng` - UI component library (20.3.0)
- `@primeuix/themes` - PrimeNG theming system
- `tailwindcss` & `tailwindcss-primeui` - Utility-first CSS framework with PrimeUI integration
- `uuid` - Session ID generation
- `jspdf` - PDF generation for meal plans
- `html2canvas` - HTML to canvas conversion for PDF export
- `marked` - Markdown parsing
- `rxjs` - Reactive programming
- Direct HTTP fetch for backend communication

## Development Tools

- **Testing**: pytest 8.4.2 with pytest-asyncio 1.2.0
- **Linting**: ruff 0.4.6+, mypy 1.18.2, codespell 2.4.1
- **Type Checking**: mypy with strict configuration
- **Package Management**: uv 0.6.12 (preferred) or pip
- **Frontend Testing**: Karma with Jasmine

## Common Commands

```bash
# Install dependencies (installs uv if not present, then syncs Python and npm packages)
make install

# Run development servers (backend + frontend) - Windows only
make dev

# Run backend only
make dev-backend

# Run frontend only
make dev-frontend

# Launch ADK playground (Streamlit UI)
make playground

# Run tests (unit and integration)
make test

# Run linting (codespell, ruff, mypy)
make lint

# Deploy backend to Agent Engine
make deploy

# Setup dev environment infrastructure (Terraform)
make setup-dev-env

# Register Gemini Enterprise
make register-gemini-enterprise
```

### Frontend-Specific Commands

```bash
# Navigate to frontend directory
cd frontend/meal-prep-agent

# Start development server
ng serve

# Build for production
ng build

# Run tests
ng test

# Deploy to Firebase (Windows)
deploy-firebase.bat

# Deploy to Firebase (Unix)
./deploy-firebase.sh
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
- **Cloud Run**: Primary production deployment (containerized FastAPI backend via Docker)
- **Firebase Hosting**: Frontend deployment target
- **Agent Engine**: Code includes Agent Engine wrapper (`agent_engine_app.py`) but not currently deployed to Agent Engine
