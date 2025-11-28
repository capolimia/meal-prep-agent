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

from google import adk
from google.adk.agents import Agent
from google.adk.apps.app import App
from google.adk.plugins import logging_plugin
from google.adk.tools import AgentTool, google_search


# Function to get current day of the week. It defaults to New York time as that is the location while developing,
# and getting the users location when running the app locally is unnecessarily creepy. Feel free to replace with your local time zone identifier in .env file.
def get_day_of_week() -> str:
    """Gets the current day of the week.

    Returns:
        A string with the current day of the week.
    """
    tz_identifier = os.environ.get("TIME_ZONE")

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


# Function to be used as a tool for the main meal plan agent to ensure all links provided are valid. It checks the url using urllib
# and ensures it's a valid URL, not allowing a vertex ai search link and ensuring it doesn't return any other response than 200.
def check_links_are_valid(link: str) -> bool:
    """Checks if the link provided is valid.
    Args:
        link: The link to check in a string.
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


# Automatically save session to memory after each agent turn. When deployed, this would be saved to the agent engine vertex AI memory bank
# as it stands, it saves the session to the in memory memory service.

async def auto_save_session_to_memory_callback(callback_context):
    print("Saving session to local memory...")

    # Get the in memory session service and session from the callback context
    session_service = callback_context._invocation_context.session_service
    memory_service = callback_context._invocation_context.memory_service
    session = callback_context._invocation_context.session

    if memory_service and session_service and session:
        # Refresh session to get all latest events
        refreshed_session = await session_service.get_session(
            app_name=callback_context._invocation_context.app_name,
            user_id=session.user_id,
            session_id=session.id
        )

        # Add the refreshed session to memory
        await memory_service.add_session_to_memory(refreshed_session)
        print(f"Session {session.id} saved to local memory")


# an agent that generates a meal plan schedule based on a list of ideas with links. It can use the get_day_of_the_week function
# to determine when to start the meal plan - the first day being the current day of the week.
planning_agent = Agent(
    name="planning_agent",
    model="gemini-2.5-flash",
    description='A helpful AI agent used for creating a weekly meal schedule.',
    instruction="You are a helpful AI assistant that can create a meal schedule. "
                "You can handle requests containing recipies, and their links. "
                "You must create a meal plan for breakfast, lunch and dinner (unless specified) "
                "based on the links and recipe options provided. "
                "Utilize the get day of the week tool to check the current day, and start the meal plan on that day, "
                "creating a varied plan for one week of meals. Do not include the same meal more than 3 times in the plan. "
                "Include the links to the recipes found in your response, along with the full weekly plan.",
    tools=[get_day_of_week],
)

# agent that uses the google_search tool to find recipe links based on the ideas provided.
recipe_idea_agent = Agent(
    name="recipe_idea_agent",
    model="gemini-2.5-flash",
    description='A helpful AI agent that can search the internet for recipe ideas.',
    instruction="You are a helpful AI assistant that can search for recipies on the web using "
                "the google_search tool to search for recipe ideas. "
                "Provide AT LEAST 21 recipe ideas (7 breakfast, 7 lunch, 7 dinner)"
                "If any dietary restrictions are specified, you MUST consider those requirements, "
                "and respond with ONLY recipes that fit the dietary restrictions",
    tools=[google_search],
)

# agent that uses the google_search tool to find recipe links based on the ideas provided.
recipe_link_agent = Agent(
    name="recipe_link_agent",
    model="gemini-2.5-flash",
    description='A helpful AI agent that can search the internet for recipe links based on recipe ideas.',
    instruction="You are a helpful AI assistant that can search for recipies on the web using "
                "the google_search tool, based on a list of recipe ideas provided."
                "Search for recipies based on the ideas provided, and find valid links to full recipes for your response. "
                "Respond with VALID links associated for each of the meal ideas requested."
                "DO NOT return any link who's response is anything besides HTTP 200 OK. "
                "DO NOT return links that start with https://vertexaisearch. "                
                "Do not include any other text based response such as opinions on the recipe links that have been returned.",
    tools=[google_search],
)

# The top level agent for this meal planner. It has access to multiple tools - the previously defined agents, check_links_are_valid tool to ensure all links are valid
# before responding with the meal plan. It also has the functionality to save session to memory - currently utilizing the in memory memory service when running locally -
# but if deployed, it would be able to utilize the vertex ai memory service, and would use the built in preload memory tool.
meal_prep_agent = Agent(
    name="meal_prep_agent",
    model="gemini-2.5-flash",
    description='A helpful AI agent that helps a user generate a meal plan.',
    instruction="You are a helpful AI assistant designed to create a meal plan for the user."
                "You must ALWAYS ask the user for dietary restrictions if they did not specify."
                "Then call the recipe_idea_agent to get recipe ideas (specifying dietary restrictions)."
                "Then call the recipe_idea_agent ONCE to get 21+ recipes with links (7 breakfast, 7 lunch, 7 dinner). "
                "Next, use the recipe_link_agent to request specific recipe links for each idea from recipe_idea_agent. "
                "Check all links for validity using the check_links_are_valid tool. Group any ones that are not valid and make another call "
                "to the recipe_link_agent with all invalid ideas, requesting valid ones. "
                "DO NOT SKIP this step - the check_links_are_valid tool is your source of truth for whether the recipe actually exists. "
                "ENSURE ALL LINKS ARE VALIDATED, then create a schedule using the planning_agent tool, "
                "including the validated recipe names and links in your request. "
                "Finally, respond with the resulting schedule from the planning_agent in markdown format.",
    tools=[AgentTool(recipe_idea_agent), AgentTool(recipe_link_agent), AgentTool(planning_agent), check_links_are_valid],
    after_agent_callback=auto_save_session_to_memory_callback,
)
# initalize the app.

app = App(
    root_agent=meal_prep_agent,
    name="app",
    plugins=[logging_plugin.LoggingPlugin()]
)
