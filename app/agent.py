# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import datetime
import os
from zoneinfo import ZoneInfo

import google.auth
from google import adk
from google.adk import Runner
from google.adk.agents import Agent
from google.adk.apps.app import App
from google.adk.memory import VertexAiMemoryBankService
from google.adk.plugins import logging_plugin
from google.adk.sessions import VertexAiSessionService, InMemorySessionService
from google.adk.tools import AgentTool, google_search

from app.logging_plugin import LoggingPlugin

_, project_id = google.auth.default()
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")
os.environ.setdefault("GOOGLE_GENAI_USE_VERTEXAI", "True")
agent_engine_id = os.environ.get("GOOGLE_CLOUD_AGENT_ENGINE_ID")

def find_recipies(query: str) -> str:
    """Searches the web for recipes.

    Args:
        query: A string containing the location to get weather information for.

    Returns:
        A string with the simulated weather information for the queried location.
    """
    if "sf" in query.lower() or "san francisco" in query.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."


def get_day_of_week() -> str:
    """Simulates getting the current time for a city.

    Args:
        city: The name of the city to get the current time for.

    Returns:
        A string with the current day of the week.
    """
    tz_identifier = "America/Los_Angeles"


    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    print(now.isoweekday())
    return f"The current day of the week is {now.isoweekday()}"

async def auto_save_session_to_memory_callback(callback_context):
    print("saving....")
    await callback_context._invocation_context.memory_service.add_session_to_memory(
        callback_context._invocation_context.session)

recipe_search_agent = Agent(
    name="recipe_search_agent",
    model="gemini-2.5-flash",
    instruction="You are a helpful AI assistant designed to use the google_search tool to find "
                "recipies for breakfast, lunch, and dinner on the web."
                "If any dietary restrictions are specified, you MUST consider those requirements, "
                "and return ONLY recipies that fit the dietary restrictions. "
                "ONLY Return recipes that are sourced from websites that contain a full recipe. "
                "Include the links to the recipes found in your response.",
    tools=[google_search],
)


meal_prep_agent = Agent(
    name="meal_prep_agent",
    model="gemini-2.5-flash",
    instruction="You are a helpful AI assistant designed to create a meal plan for the user."
                "You must ALWAYS ask the user for dietary restrictions if they did not specify."
                "Then call the recipe_search_agent to get recipes with those specifications."
                "Then, generate a meal plan for each meal (breakfast, lunch, and dinner unless specified by user)"
                " based on the day of the week, starting with the current weekday."
                "You can find the current day of the week using the get_day_of_week tool."
                "Share your findings with the user, including the links provided from the recipe_search_agent, "
                "with the response in markdown format."
                "DO NOT provide recipes without internet links included.",
    tools=[AgentTool(recipe_search_agent), get_day_of_week, adk.tools.preload_memory_tool.PreloadMemoryTool(),],
    after_agent_callback=auto_save_session_to_memory_callback,
)



# need to deploy service first
memory_service = VertexAiMemoryBankService(
    project=os.getenv("GOOGLE_CLOUD_PROJECT"),
    location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
    agent_engine_id=agent_engine_id, # Replace with your Agent Engine ID
)

app = App(root_agent=meal_prep_agent, name="app", plugins=[LoggingPlugin()])
