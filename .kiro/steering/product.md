# Product Overview

This is a meal prep agent application built with the Google Agent Development Kit (ADK). The agent helps users create personalized meal plans by:

- Asking about dietary restrictions if not specified
- Searching for recipes that match user requirements using Google Search
- Validating recipe links to ensure they're accessible
- Generating weekly meal plans starting from the current day of the week
- Storing conversation history in memory for context-aware interactions
- Providing downloadable PDF meal plans

The application demonstrates ADK's multi-agent architecture with a root meal prep agent that delegates to specialized agents for different tasks.

## Key Features

- **Multi-agent system with delegation**: `meal_prep_agent` orchestrates three specialized agents:
  - `recipe_idea_agent` - Generates meal ideas using Google Search
  - `recipe_link_agent` - Finds recipe links using Google Search
  - `planning_agent` - Organizes meals by day of week
- **Custom tools**: 
  - `check_links_are_valid` - Validates recipe URLs
  - `get_day_of_week` - Gets current day for meal planning
- **Google Search integration** - Built-in ADK tool for finding recipes
- **Memory persistence** - Uses ADK's InMemorySessionService and InMemoryMemoryService
- **Dietary restriction awareness** - Filters recipes based on user requirements
- **Day-of-week aware meal planning** - Starts from current day in America/New_York timezone
- **PDF export** - Frontend generates downloadable meal plans using jsPDF
- **Fullstack deployment** - Angular frontend on Firebase Hosting, FastAPI backend on Cloud Run
