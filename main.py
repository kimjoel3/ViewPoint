from openai import OpenAI
from flask import Flask, request, render_template, jsonify
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

session_id = str(uuid.uuid4())  # Unique session ID
print("Session ID:", session_id)

conversations = {}  # Stores messages per perspective

with open("perspectivesPrompt.txt", "r") as file:
    prompt_context = file.read().strip()

def generatePerspectives(user_input):
    response = client.chat.completions.create(
        model="gpt-4",  # Updated model name
        messages=[
            {"role": "system", "content": prompt_context},
            {"role": "user", "content": user_input}
        ],
        temperature=0.5,
        max_tokens=100
    )
    
    perspectives_text = response.choices[0].message.content.strip()
    raw_perspectives = [p.strip() for p in perspectives_text.split("\n") if p.strip()]

    # Assign perspective names to numbers
    numbered_perspectives = {str(i+1): raw_perspectives[i] for i in range(min(3, len(raw_perspectives)))}

    return numbered_perspectives

def first_chat(user_input, perspectives):
    responses = {}

    for num_key, perspective_text in perspectives.items():
        # Extract the descriptor and adjective from the perspective text
        if " – " in perspective_text:
            descriptor, adjective = perspective_text.split(" – ", 1)
        else:
            descriptor, adjective = perspective_text, ""  # Handle cases where there's no " – "

        
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Respond as {descriptor}. Make it natural, brief, and realistic. Start your response by stating your perspective descriptor (e.g., 'As an empathetic listener...')."},
                {"role": "user", "content": f"Given the following situation:\n{user_input}"}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        # Prepend the descriptor to the AI's response
        ai_response = f"As {descriptor.lower()}... {response.choices[0].message.content.strip()}"
        responses[num_key] = ai_response

    return responses

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def get_response():
    global conversations
    data = request.json
    user_input = data.get('user_input', "").strip()
    selected_tab = data.get('tab', "all")  # Get the selected tab (e.g., "1", "2", "3", or "all")

    if session_id not in conversations:
        conversations[session_id] = {str(i): [] for i in range(1, 4)}
        conversations[session_id]["all"] = []
        conversations[session_id]["last_input"] = ""
        conversations[session_id]["perspectives"] = {}

    # **First Message Handling (Only Use first_chat() Once)**
    if not conversations[session_id]["perspectives"]:
        perspectives = generatePerspectives(user_input)
        conversations[session_id]["perspectives"] = perspectives
        responses = first_chat(user_input, perspectives)  # Generate first responses

        # Store the first user message and AI responses
        for num_key in perspectives.keys():
            conversations[session_id][num_key].append({"user": user_input, "ai": responses[num_key]})
            conversations[session_id]["all"].append({"user": user_input, "ai": responses[num_key], "perspective": num_key})
    else:
        # **Follow-Up Messages: Continue the chat only for the selected tab**
        perspectives = conversations[session_id]["perspectives"]
        responses = {}

        # **If "all" is selected, respond in all perspectives**
        if selected_tab == "all":
            selected_perspectives = perspectives.keys()
        else:
            selected_perspectives = [selected_tab]  # Respond only in the chosen tab

        for num_key in selected_perspectives:
            perspective_text = perspectives[num_key]

            # Get full chat history for this perspective
            chat_history = [{"role": "system", "content": f"Continue responding as {perspective_text}."}]

            for message in conversations[session_id][num_key]:
                chat_history.append({"role": "user", "content": message["user"]})
                chat_history.append({"role": "assistant", "content": message["ai"]})

            # Add the new user input
            chat_history.append({"role": "user", "content": user_input})

            # Generate AI response **only for the selected perspective(s)**
            response = client.chat.completions.create(
                model="gpt-4",
                messages=chat_history,
                temperature=0.7,
                max_tokens=200
            )

            ai_response = response.choices[0].message.content.strip()
            responses[num_key] = ai_response

            # Store response in conversation history
            conversations[session_id][num_key].append({"user": user_input, "ai": ai_response})
            conversations[session_id]["all"].append({"user": user_input, "ai": ai_response, "perspective": num_key})

    return jsonify({
        "responses": responses,
        "conversations": conversations[session_id],
        "perspectives": conversations[session_id]["perspectives"]
    })


if __name__ == '__main__':
    app.run(debug=True, port=8000)