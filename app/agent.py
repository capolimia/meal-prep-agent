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

recipe_idea_list = [""]
recipe_link_list = dict()

def get_day_of_week() -> str:
    """Gets the current day of the week.

    Returns:
        A string with the current day of the week.
    """
    tz_identifier = "America/Los_Angeles"


    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    weekdays = {1: "Monday",
                2: "Tuesday",
                3: "Wednesday",
                4: "Thursday",
                5: "Friday",
                6: "Saturday",
                7: "Sunday"}
    return f"The current day of the week is {weekdays[now.isoweekday()]}"

def check_links_are_valid(link: str) -> bool:
    """Checks if the link provided is valid.

    Returns:
        Boolean, with true meaning the link is valid and false meaning the link is invalid.
    """
    import urllib.request
    from urllib.parse import urlparse

    # Check if the link is a valid URL format
    try:
        parsed = urlparse(link)
        if not all([parsed.scheme, parsed.netloc]):
            return False

        # Check if it's a vertexaisearch link (should be rejected)
        if "vertexaisearch" in link.lower():
            return False

        # Try to access the URL to verify it's not a 404
        req = urllib.request.Request(link, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                return True
            else:
                return False
    except Exception:
        return False

async def auto_save_session_to_memory_callback(callback_context):
    print("saving....")
    memory_service = callback_context._invocation_context.memory_service
    if memory_service:
        await memory_service.add_session_to_memory(
            callback_context._invocation_context.session)

planning_agent = Agent(
    name="planning_agent",
    model="gemini-3-pro-preview",
    description='A helpful AI agent used for creating a weekly meal schedule.',
    instruction="You are a helpful AI assistant that can create a meal schedule."
                "You can handle requests containing recipies, and their links."
                "You must create a meal plan for breakfast, lunch and dinner (unless specified) "
                "based on the links and recipe options provided."
                "Utilize the get day of the week tool to check the current day, and start the meal plan on that day, "
                "creating a plan for one week of meals."
                "ONLY add recipes to the plan that have valid links with a full recipe breakdown."
                "Include the links to the recipes found in your response, along with the full weekly plan.",
    tools=[get_day_of_week],
)

recipe_idea_agent = Agent(
    name="recipe_idea_agent",
    model="gemini-3-pro-preview",
    description='A helpful AI agent that can search the internet for recipe ideas.',
    instruction="You are a helpful AI assistant that can search for recipies on the web using "
                "the google_search tool to search for recipe ideas. "
                "Provide AT LEAST 7 options for each search."
                "If any dietary restrictions are specified, you MUST consider those requirements, "
                "and respond with ONLY recipes that fit the dietary restrictions",
    tools=[google_search],
)

recipe_link_agent = Agent(
    name="recipe_link_agent",
    model="gemini-3-pro-preview",
    description='A helpful AI agent that can search the internet for recipe links based on recipe ideas.',
    instruction="You are a helpful AI assistant that can search for recipies on the web using "
                "the google_search tool, based on a list of recipe ideas provided."
                "Search for recipies based on the ideas provided, and find valid links to full recipes for your response. "
                "Check that the recipes you provide have VALID LINKS and do not lead to a 404 page, and are not vertexaisearch links."
                "Respond with a dict with links associated for each of the meal ideas requested.",
    tools=[google_search],
)


meal_prep_agent = Agent(
    name="meal_prep_agent",
    model="gemini-3-pro-preview",
    description='A helpful AI agent that helps a user generate a meal plan.',
    instruction="You are a helpful AI assistant designed to create a meal plan for the user."
                "You must ALWAYS ask the user for dietary restrictions if they did not specify."
                "Then call the recipe_idea_agent to get recipe ideas with those specifications for breakfast, lunch, and dinner."
                "Store the result from the recipe_idea_agent in the recipe_idea_list variable."
                "Next, use the recipe_link_agent to request specific recipe links for each item in the recipe_idea_list."
                "Store the response in recipe_link_list, with the recipe name as the key, and the value as the link."
                "Check each value's recipe link in the list using the check_links_are_valid tool. "
                "If false is returned, call the recipe_idea_agent again with the key to find a valid link."
                "Once all links are valid in recipe_link_list, create a schedule using the planning_agent tool, "
                "including the recipe_link_list in your request."
                "Finally, respond with the resulting schedule from the planning_agent in markdown format.",
    tools=[AgentTool(recipe_idea_agent), AgentTool(recipe_link_agent), AgentTool(planning_agent), check_links_are_valid, adk.tools.preload_memory_tool.PreloadMemoryTool()],
    after_agent_callback=auto_save_session_to_memory_callback,
)

# need to deploy service first
memory_service = VertexAiMemoryBankService(
    project=os.getenv("GOOGLE_CLOUD_PROJECT"),
    location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
    agent_engine_id=agent_engine_id, # Replace with your Agent Engine ID
)

app = App(root_agent=meal_prep_agent, name="app", plugins=[LoggingPlugin()])
