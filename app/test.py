import asyncio
import uuid

from google.adk import Runner
from google.adk.plugins import logging_plugin
from google.adk.sessions import InMemorySessionService
from google.genai import types

from app.agent import app

def print_agent_response(events):
    """Print agent's text responses from events."""
    for event in events:
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    print(f"Agent > {part.text}")


session_service = InMemorySessionService()
session_id = f"{uuid.uuid4().hex[:8]}"


agent_runner = Runner(
    session_service=session_service,
    app=app,
)

session_service.create_session(
            app_name="app", user_id="test_user", session_id=session_id
        )




async def agent_runner_function():
    query_content = types.Content(role="user", parts=[types.Part(text="I am a vegetarian. Please create me a meal plan!")])
    events = []

    async for event in agent_runner.run_async(
        user_id="test_user", session_id=session_id, new_message=query_content
    ):
        events.append(event)
        print_agent_response(events)

asyncio.run(agent_runner_function())