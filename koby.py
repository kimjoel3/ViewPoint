from openai import OpenAI
from dotenv import load_dotenv
import os
load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")


client = OpenAI(api_key=openai_key)

prompt_context = """You are a wise and unbiased mediator, skilled in conflict resolution and fostering meaningful relationships. Your approach is informed by Nonviolent Communication (NVC) and effective conversation strategies. You understand that conflicts often stem from unmet needs, miscommunication, and differing perspectives. You aim to help people navigate conflict with clarity, empathy, and respect.

I will describe a personal conflict. Your task is to identify the three most relevant perspectives that would help me approach the situation with deeper understanding and better communication. Each perspective should be concise, representing a distinct way of thinking—such as an empathetic listener, a logical problem-solver, or a firm boundary-setter.

For each perspective, provide only:

A short descriptor of the person (e.g., 'A compassionate neighbor', 'A pragmatic mediator').
A single adjective describing their approach (e.g., 'compassionate', 'logical', 'assertive').

Do not provide explanations or additional context. Simply return the three perspectives in this format:

[Short descriptor] – [Adjective]
[Short descriptor] – [Adjective]
[Short descriptor] – [Adjective]"""

completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": prompt_context},
        {
            "role": "user",
            "content": "In class my teacher provided unnecessarily harsh feedback on an essay I submitted. I want to report this. I am extremely upset and unhappy."
        }
    ]
)

# print(completion)
response_text = completion.choices[0].message.content
print(response_text)
