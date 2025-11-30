# Project Structure

## Root Directory Layout

```
meal-prep-agent/
├── .cloudbuild/              # CI/CD pipeline configurations
├── .idea/                    # PyCharm IDE configuration
├── .kiro/                    # Kiro IDE configuration
├── app/                      # Backend application code
├── deployment/               # Infrastructure and deployment configs
├── frontend/                 # Angular frontend application
├── tests/                    # Test suites
├── deploy-cloudrun.bat       # Cloud Run deployment script
├── Dockerfile                # Docker configuration for Cloud Run
├── Makefile                  # Build automation commands
├── pyproject.toml            # Python project configuration
├── uv.lock                   # Locked dependencies
├── README.md                 # Project documentation
└── test_endpoints.py         # API endpoint tests
```

## Backend (`app/`)

```
app/
├── agent.py                  # Main agent definitions (meal_prep_agent, recipe_search_agent)
├── agent_engine_app.py       # Agent Engine deployment wrapper
├── config.py                 # Configuration dataclasses
├── app_utils/                # Utilities and helpers
│   ├── deploy.py             # Deployment scripts
│   ├── tracing.py            # OpenTelemetry tracing
│   └── typing.py             # Type definitions
└── .env                      # Environment variables (not in git)
```

### Agent Architecture

- **`meal_prep_agent`** (root): Orchestrates meal planning, asks for dietary restrictions, delegates to specialized agents
  - Agent Tools: `recipe_idea_agent`, `recipe_link_agent`, `planning_agent`
  - Custom Tool: `check_links_are_valid`
- **`recipe_idea_agent`**: Generates meal ideas using Google Search
- **`recipe_link_agent`**: Finds recipe links using Google Search
- **`planning_agent`**: Organizes meal plan by day of week
  - Custom Tool: `get_day_of_week`

## Frontend (`frontend/meal-prep-agent/`)

```
frontend/meal-prep-agent/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   ├── chat-window/      # Chat interface component
│   │   │   │   ├── chat-window.ts
│   │   │   │   ├── chat-window.html
│   │   │   │   └── chat-window.css
│   │   │   ├── recipe-plan/      # Recipe plan display component
│   │   │   │   ├── recipe-plan.ts
│   │   │   │   ├── recipe-plan.html
│   │   │   │   ├── recipe-plan.css
│   │   │   │   ├── recipe-plan-test.ts  # Test component
│   │   │   │   ├── recipe-plan-test.html
│   │   │   │   └── recipe-plan-test.css
│   │   │   └── main-view/        # Main view container
│   │   │       └── main-view.ts
│   │   ├── services/             # Angular services
│   │   ├── app.ts                # Main app component
│   │   ├── app.config.ts         # App configuration
│   │   └── app.routes.ts         # Routing configuration
│   ├── environments/
│   │   ├── environment.ts        # Development config
│   │   └── environment.prod.ts   # Production config (Cloud Run URL)
│   ├── main.ts                   # Entry point
│   ├── main.server.ts            # Server-side rendering entry
│   ├── server.ts                 # SSR server
│   ├── index.html                # HTML template
│   └── styles.css                # Global styles
├── public/                       # Static assets
│   └── favicon.ico
├── package.json                  # Node dependencies
├── angular.json                  # Angular CLI configuration
├── firebase.json                 # Firebase Hosting config
├── deploy-firebase.bat           # Firebase deployment script (Windows)
├── deploy-firebase.sh            # Firebase deployment script (Unix)
├── Dockerfile                    # Docker configuration
└── DEPLOYMENT.md                 # Deployment instructions
```

## Tests (`tests/`)

```
tests/
├── unit/                     # Unit tests for business logic
└── integration/              # Integration tests for agents
    ├── test_agent.py         # Agent streaming tests
    └── test_agent_engine_app.py
```

### Testing Patterns

- Use `InMemorySessionService` for testing
- Test agent streaming with `RunConfig(streaming_mode=StreamingMode.SSE)`
- Integration tests verify end-to-end agent behavior
- Unit tests focus on individual functions and tools

## Deployment (`deployment/`)

```
deployment/
├── terraform/                # Infrastructure as Code
│   └── dev/                  # Dev environment configs
└── README.md                 # Deployment instructions
```

## Configuration Files

- **`pyproject.toml`**: Python dependencies, tool configs (ruff, mypy, pytest)
- **`Makefile`**: Common development commands
- **`uv.lock`**: Locked dependency versions
- **`.gitignore`**: Excludes `.env`, `.venv`, `node_modules`, etc.

## Key Conventions

1. **Agent definitions** go in `app/agent.py`
2. **Custom tools** should be defined as functions in `app/agent.py` or separate `app/tools.py`
3. **Environment variables** are loaded from `app/.env`
4. **Frontend communicates directly with Cloud Run backend** via `/run` endpoint
5. **Session IDs are generated client-side** using uuid, no separate session creation endpoint needed
6. **Memory service** requires Agent Engine ID for production deployment
7. **All Python code** must pass ruff, mypy, and codespell checks
8. **Copyright headers** required on all source files (Apache 2.0)
9. **Frontend is deployed to Firebase Hosting**, backend to Cloud Run
