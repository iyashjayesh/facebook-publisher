import os

from dotenv import load_dotenv
from pydantic_ai import Agent

load_dotenv()

agent = Agent(
    model='google-gla:gemini-2.5-flash-lite',
    instructions='You are a helpful assistant that helps users with their queries on the facebook-publisher project.',
)
app = agent.to_ag_ui()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)