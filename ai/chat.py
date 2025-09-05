# pip install google-genai python-dotenv
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()  # loads GEMINI_API_KEY from .env

MODEL_NAME = "gemini-2.0-flash"

def main():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set. Put it in your .env or export it in your shell.")

    client = genai.Client(api_key=api_key)
    history: list[types.Content] = []

    print("Chatbot ready. Type 'exit' or 'quit' to leave.")

    while True:
        user_input = input("\nYou: ").strip()
        if user_input.lower() in {"exit", "quit"}:
            print("Bye! 👋")
            break
        if not user_input:
            continue

        # Add user message to the running history
        history.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=user_input)]
            )
        )

        print("Bot: ", end="", flush=True)
        reply_text = ""

        # Stream the model response
        for chunk in client.models.generate_content_stream(
            model=MODEL_NAME,
            contents=history,  # includes all prior turns ending with the latest user msg
            config=types.GenerateContentConfig(),  # keep defaults; add safety/params if you need
        ):
            if chunk.text:
                print(chunk.text, end="", flush=True)
                reply_text += chunk.text

        # Append model reply to history so the next turn has context
        history.append(
            types.Content(
                role="model",
                parts=[types.Part.from_text(text=reply_text)]
            )
        )

if __name__ == "__main__":
    main()
