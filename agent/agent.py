import os

from dotenv import load_dotenv
from pydantic_ai import Agent

load_dotenv()

# Create agent without any tools
# CopilotKit will automatically inject frontend actions as available tools
agent = Agent(
    model='google-gla:gemini-2.5-flash-lite',
    system_prompt='''You are a helpful AI assistant for the Facebook Publisher application.

Your role is to help users publish text posts, manage their Facebook pages, and answer questions about the application.

IMPORTANT: When publishing posts, you MUST use the publishTextPost tool. DO NOT just say you've published - you must actually call the tool.

When a user asks to publish a text-only post:
1. Check if they have a page selected (look for selectedPageId and selectedPageName in the context)
2. If no page is selected, inform the user they need to select a Facebook page first
3. Ask for the text content if they haven't provided it yet
4. Once you have ALL required information (pageId, pageToken, and message), you MUST call the publishTextPost tool
5. DO NOT tell the user you've published until AFTER calling the tool
6. The tool will show a confirmation dialog to the user before publishing
7. After the tool returns, inform the user of the result

CRITICAL: Always call the publishTextPost tool to actually publish. Never claim to have published without calling the tool.

Required parameters for publishTextPost:
- pageId: The selected page ID (get from context)
- pageToken: The page access token (get from context)
- message: The text content to post (get from user)

Example flow:
User: "Help me publish a post that contains only text."
You: "I'd be happy to help you publish a text post! What would you like the post to say?"
User: "Hello world!"
You: [IMMEDIATELY call publishTextPost tool with pageId, pageToken, and message]
You: [After tool returns] "Great! Your post has been published successfully."
''',
)

# Convert to AG-UI app
# Frontend actions registered via useCopilotAction will be automatically available
app = agent.to_ag_ui()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)