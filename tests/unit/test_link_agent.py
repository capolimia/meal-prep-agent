
from google.adk import Runner
from google.adk.agents import RunConfig
from google.adk.agents.run_config import StreamingMode
from google.adk.sessions import InMemorySessionService
from google.genai import types

from app.agent import recipe_link_agent


#unit test to test the link agent's functionality.

def test_link_agent() -> None:
    """
    Test
    Tests that the agent returns valid streaming responses and .com links for recipes.
    """

    session_service = InMemorySessionService()

    session = session_service.create_session_sync(user_id="test_user", app_name="test")
    runner = Runner(agent=recipe_link_agent, session_service=session_service, app_name="test")
    message = types.Content(
        role="user", parts=[types.Part.from_text(text="Teriyaki Salmon")]
    )

    events = list(
        runner.run(
            new_message=message,
            user_id="test_user",
            session_id=session.id,
            run_config=RunConfig(streaming_mode=StreamingMode.SSE),
        )
    )
    assert len(events) > 0, "Expected at least one message"
    contains_link = False
    for event in events:
        if (
            event.content
            and event.content.parts
            and any(part.text for part in event.content.parts)
        ):
            for part in event.content.parts:
                if ".com" in part.text:
                    contains_link = True
                    break
    assert contains_link, "Expected at least one message with a link"

