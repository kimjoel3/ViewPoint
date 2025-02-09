from openai import OpenAI

import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key = os.getenv("OPENAI_API_KEY"))

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": " **insert role** "},
        {
            "role": "user",
            "content": "**insert situation**"
        }
    ]
)



print(response.choices[0].message.content)