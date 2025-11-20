# Product Overview

This is a meal prep agent application built with the Google Agent Development Kit (ADK). The agent helps users create personalized meal plans by:

- Asking about dietary restrictions if not specified
- Searching for recipes that match user requirements using Google Search
- Generating weekly meal plans starting from the current day of the week
- Storing conversation history in memory for context-aware interactions

The application demonstrates ADK's multi-agent architecture with a root meal prep agent that delegates recipe searches to a specialized recipe search agent.

## Key Features

- Multi-agent system with delegation (meal_prep_agent → recipe_search_agent)
- Google Search integration for finding recipes
- Memory persistence using Vertex AI Memory Bank Service
- Dietary restriction awareness
- Day-of-week aware meal planning
