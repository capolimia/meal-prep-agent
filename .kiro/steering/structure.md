# Project Structure

## Root Directory Layout

```
meal-prep-agent/
├── app/                      # Backend application code
├── frontend/                 # React frontend application
├── deployment/               # Infrastructure and deployment configs
├── notebooks/                # Jupyter notebooks for prototyping
├── tests/                    # Test suites
├── .cloudbuild/              # CI/CD pipeline configurations
├── .kiro/                    # Kiro IDE configuration
├── Makefile                  # Build automation commands
├── pyproject.toml            # Python project configuration
└── uv.lock                   # Locked dependencies
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

- **`meal_prep_agent`** (root): Orchestrates meal planning, asks for dietary restrictions, delegates recipe search
- **`recipe_search_agent`**: Specialized agent for finding recipes via Google Search
- **Tools**: `google_search`, `get_day_of_week`, `PreloadMemoryTool`
- **Memory**: Auto-saves sessions via `after_agent_callback`

## Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── components/           # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── ActivityTimeline.tsx
│   │   ├── ChatMessagesView.tsx
│   │   ├── InputForm.tsx
│   │   └── WelcomeScreen.tsx
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── global.css            # Global styles
├── package.json              # Node dependencies
└── vite.config.ts            # Vite configuration
```

## Tests (`tests/`)

```
tests/
├── unit/                     # Unit tests for business logic
│   └── test_dummy.py
├── integration/              # Integration tests for agents
│   ├── test_agent.py         # Agent streaming tests
│   └── test_agent_engine_app.py
└── load_test/                # Performance/load tests
    └── load_test.py
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

## Notebooks (`notebooks/`)

- `intro_agent_engine.ipynb` - Getting started with ADK
- `adk_app_testing.ipynb` - Testing agent applications
- `evaluating_adk_agent.ipynb` - Agent evaluation workflows

## Configuration Files

- **`pyproject.toml`**: Python dependencies, tool configs (ruff, mypy, pytest)
- **`Makefile`**: Common development commands
- **`uv.lock`**: Locked dependency versions
- **`.gitignore`**: Excludes `.env`, `.venv`, `node_modules`, etc.

## Key Conventions

1. **Agent definitions** go in `app/agent.py`
2. **Custom tools** should be defined as functions in `app/agent.py` or separate `app/tools.py`
3. **Environment variables** are loaded from `app/.env`
4. **Frontend agent names** must match backend agent names for proper UI integration
5. **Memory service** requires Agent Engine ID for production deployment
6. **All Python code** must pass ruff, mypy, and codespell checks
7. **Copyright headers** required on all source files (Apache 2.0)
