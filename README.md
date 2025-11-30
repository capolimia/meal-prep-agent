# Meal Prep Agent

This **Meal Prep Agent** is a Proof of Concept for an agentic workflow that can easily create a meal plan for the week after specifying your dietary restrictions. It is based on the Google ADK Agent Starter pack.


## Key Features:

**Fullstack & Deployed to the Cloud:** An Angular Frontend and ADK-powered FastAPI backend, deployed to Google Cloud Run.

**Agentic Workflow:** Gemini is used to come up with recipe ideas based on user specifications and dietary restrictions, using multiple tool types: agent-as-a-tool, built in tools, and custom tools

Access the deployed agent here:

[**Meal Prep Agent**](https://capstone-478122.web.app/)

This project was developed with the assistance of the Kiro AI IDE. 

Local setup instructions are not included to protect private API keys and credentials. This repository is for reference purposes only.


## Backend 

### File structure: (`app/`)

```
app/
├── agent.py                  # Main agent and tool definitions (meal_prep_agent, recipe_idea_agent, recipe_link_agent, planning_agent, get_day_of_week, check_links_are_valid)

└── .env                      # Environment variables (not in git)
```

## Agent Workflow:

The backend agent/agents, defined in `app/agent.py`, follows a workflow as described below:

### Step 1: meal_prep_agent 

***meal_prep_agent's Tools:***

    Agent Tools:
      * recipe_idea_agent
      * recipe_link_agent
      * planning_agent
    Custom Tool:
      check_links_are_valid

When the main agent receives a request from the user, it will start the process of generating a meal plan. If the agent hasn't received dietary restrictions, it will ask the user. Sessions and conversation history are stored using ADK's InMemorySessionService and InMemoryMemoryService, allowing the agent to retain context across the conversation and utilize the tools at its disposal to create a meal plan.

The first Agent Tool called is the next step in the flow:

### 2: recipe_idea_agent

***recipe_idea_agent's Tools:***

    ADK Built-in Tool:
      google_search

The meal_prep_agent calls the recipe_idea_agent first. ADK provides a built in google_search tool to perform an internet search and report back on its findings. This tool is currently incompatible with other tool implementations, so a separate agent is used. The recipe_idea_agent finds inspiration for breakfast, lunch, and dinner ideas, then replies to the meal_prep_agent with its findings. 

The next step is the second tool in the meal_prep_agent's tool list:

### 3: recipe_link_agent

***recipe_link_agent's Tools:***

    ADK Built-in Tool:
      google_search

The meal_prep_agent gathers the meal ideas from the recipe_idea_agent and requests links from the recipe_link_agent using the same google_search built-in adk tool. This agent finds recipes from various sites across the web to provide the user with recipes they can make as part of their weekly meal plan. 

Then, the meal_prep_agent checks this agent's work in the next step of the flow:

### 4: check_links_are_valid

***Custom Function***

The links provided by the recipe_link_agent are sometimes broken. To ensure the plan contains real recipes with valid sources, a custom python function is called by the meal_plan_agent to validate the recipe links provided.

The function uses urllib to validate the url format, whether it's a "vertexaisearch" URL (which isn't accessible to the user), or that the link returns a 404 HTTP error code. If none of these are true, it passes the tool check and the agent will note that it is a valid recipe & idea to add to the plan. If the link fails the check, the agent notes that and continues checking the links from the recipe_link_agent.

Once all links have been validated, the meal_prep_agent circles back to the recipe_link_agent to request more recipes based on the ideas from the recipe_idea_agent. It then validates the new links, working in this pattern until all links are valid.

Finally, the meal_prep_agent calls a final tool:

### 5: planning_agent

***planning_agent's Tools:***

    Custom Tool:
      get_day_of_week

The meal_prep_agent uses the planning_agent Agent tool to generate an organized plan for breakfast, lunch, and dinner (unless specified) based on the day of the week in the timezone specified in the application's environment variables. It uses the get_day_of_the_week function to achieve this, getting the current date time in the default time zone (in the deployed application, this is America/New_York) and returning the string of the current day of the week. 

The planning_agent then organizes the ideas and their respective links in a schedule format, specifying the day of the week, the meal, and the recipe. The result is provided back to the meal_prep_agent.

### 6: meal_prep_agent

The meal_prep_agent then provides the result from the planning agent (in markdown format) to the user. This concludes the agent flow!


## Frontend

To provide a useful plan, the agent is hosted on Firebase with an Angular based frontend.

Below is the file structure:

```
frontend/meal-prep-agent/
├── src/
│   ├── app/
│   │   ├── features/
│   │   │   ├── chat-window/      # Chat interface component
│   │   │   ├── recipe-plan/      # Recipe plan display & PDF export
│   │   │   │   └── recipe-plan-test/  # Test component for PDF generation
│   │   │   └── main-view/        # Main view container
│   │   ├── app.ts                # Main app component
│   │   ├── app.config.ts         # App configuration
│   │   └── app.routes.ts         # Routing configuration
│   ├── environments/
│   │   ├── environment.ts        # Development config
│   │   └── environment.prod.ts   # Production config (Cloud Run URL)
│   ├── main.ts                   # Entry point
│   ├── main.server.ts            # SSR entry point
│   └── styles.css                # Global styles
├── public/                       # Static assets
├── package.json                  # Node dependencies
├── angular.json                  # Angular CLI configuration
├── firebase.json                 # Firebase Hosting config
├── deploy-firebase.bat/.sh       # Firebase deployment scripts
└── DEPLOYMENT.md                 # Deployment instructions
```

### Chat window component

The chat window component is where the frontend interacts with the adk api server (hosted on Cloud Run). When the user sends a message in the chat window, it checks if a session exists (and if not, creates one). Then it runs the agent with the user's message, and awaits the response from the agent. A loading message appears while the agent is thinking to provide visual feedback to the user, as in the current implementation the plan generation can take up to 10 minutes.

### Recipe plan component

The recipe plan component is where the final meal plan is displayed once the agent returns it. The component only displays responses with links included, as that is always the final response given by the backend / agent. The frontend also has a button to download the plan as a pdf. The component generates a pdf using jsPDF to compile the plan into a pdf file format, for easy saving and future reference for the plan the agent generates.

This component also has a test component, accessible at the /test endpoint, to test how the pdf generation works without calling the backend agent.

### Main view component

The main view component simply displays both the chat window component and the recipe plan component on a main page.


## Technologies Used

### Backend
*   [**Agent Development Kit (ADK)**](https://github.com/google/adk-python): The core framework for building the stateful, multi-turn agent (includes FastAPI).
*   [**Google Gemini 2.5 Flash**](https://cloud.google.com/vertex-ai/generative-ai/docs): LLM used for all agents - planning, reasoning, search query generation, and synthesis.
*   [**Vertex AI**](https://cloud.google.com/vertex-ai): Google Cloud's AI platform for accessing Gemini models.
*   [**Google Cloud Run**](https://cloud.google.com/run): For hosting the backend in a containerized app.
*   [**Docker**](https://www.docker.com/): For containerizing the application for deployment.
*   [**Python 3.11**](https://www.python.org/): Backend programming language.

### Frontend
*   [**Angular 20**](https://angular.dev/): For building the interactive user interface.
*   [**PrimeNG**](https://primeng.org/): UI component library for Angular.
*   [**Tailwind CSS**](https://tailwindcss.com/): For utility-first styling with PrimeUI integration.
*   [**jsPDF**](https://github.com/parallax/jsPDF): For generating downloadable PDF meal plans.
*   [**Firebase Hosting**](https://firebase.google.com/): For hosting the frontend application.
