from openai import OpenAI
from flask import Flask, request, render_template, jsonify
import os
from dotenv import load_dotenv
import json
import uuid


load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

inputlist = []
responselist = []

conversations = {}

session_id = str(uuid.uuid4())

print(session_id)

with open("perspectivesPrompt.txt", "r") as file:
    prompt_context = file.read().strip()

def generatePerspectives(user_input): 
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt_context},
            {"role": "user", "content": f"{user_input}"}
        ],
        temperature=0.5,
        max_tokens=100
    )
    perspectives_text = response.choices[0].message.content.strip()
    
    perspectives = [p.strip() for p in perspectives_text.split("\n") if p.strip()]
    print(perspectives)
    return perspectives

def first_chat(user_input, perspectives):
    responses = {}
    for perspective in perspectives:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"Respond in the perspective of {perspective}. Make it natural, brief, and realistic."},
                {"role": "user", "content": f"Given the following situation:\n{user_input}"}
            ],
            temperature=0.7,
            max_tokens=200
        )

        responses[perspective] = response.choices[0].message.content.strip()
    
    return responses

def follow_up(user_input, sessionid):
    #responses = {}
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": f"Given this context of the conversation between the user and the ai so far {conversations[sessionid]}, respond to the user accordingly"},
            {"role": "user", "content": f"Given this user input, {user_input}, respond accordingly"}
        ],
        temperature=0.7,
        max_tokens=200
    )

        #responses[perspective] = response.choices[0].message.content.strip()
    follow_up_text = response.choices[0].message.content.strip()

    
    return follow_up_text

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def get_response():
    global conversations
    global responses
    data = request.json
    user_input = data.get('user_input', "")

    perspectives = generatePerspectives(user_input)
    
    if session_id not in conversations: 
        responses = first_chat(user_input, perspectives)
        print("Sending JSON Response:", json.dumps({"perspectives": perspectives, "responses": responses}, indent=2))

        conversations[session_id] = {
            "perspectives": perspectives,
            "responses": responses
        }
        return jsonify({"perspectives": perspectives, "responses": responses})
    else:
        print("follow up")
        follow_up_response = follow_up(user_input, session_id)  

        return jsonify({ "responses": [follow_up_response] })




if __name__ == '__main__':
    app.run(debug=True, port=8000)
