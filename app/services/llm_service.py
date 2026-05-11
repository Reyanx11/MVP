import os

from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL")

client = Groq(api_key=GROQ_API_KEY)


def generate_answer(question: str, context_chunks: list[str]):
    context = "\n\n".join(context_chunks)

    system_prompt = """
You are an internal enterprise knowledge assistant.
Answer only using the provided context.
If the answer is not present in the context, say:
"I don't know based on the uploaded documents."
"""

    user_prompt = f"""
Context:
{context}

Question:
{question}
"""

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
    )

    return response.choices[0].message.content