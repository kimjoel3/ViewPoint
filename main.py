from openai import OpenAI
from flask import Flask, request, render_template, jsonify
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

# Unique session ID
session_id = str(uuid.uuid4())
print("Session ID:", session_id)

# Store user conversations per session
conversations = {}

# Load system prompt
with open("perspectivesPrompt.txt", "r") as file:
    prompt_context = file.read().strip()

def generate_perspectives(user_input):
    """Generate different perspectives based on user input."""
    print("generate perspectives", user_input)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt_context},
            {"role": "user", "content": user_input}
        ],
        temperature=0.5,
        max_tokens=150
    )
    
    perspectives_text = response.choices[0].message.content.strip()
    raw_perspectives = [p.strip() for p in perspectives_text.split("\n") if p.strip()]

    numbered_perspectives = {str(i+1): raw_perspectives[i] for i in range(min(8, len(raw_perspectives)))}

    return numbered_perspectives

def first_chat(user_input, perspectives):
    """Generate responses for the first chat from multiple perspectives."""
    responses = {}

    for num_key, perspective_text in perspectives.items():
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"Respond as {perspective_text}. Make it natural, brief, and realistic."},
                {"role": "user", "content": f"Given this situation:\n{user_input}"}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        ai_response = response.choices[0].message.content.strip()
        responses[num_key] = ai_response

    return responses


@app.route('/')
def login_page():
    return render_template('start.html')  # Render the HTML template

@app.route('/home')
def index_page():
    return render_template('home.html') # Render the HTML template




@app.route('/get_response', methods=['POST'])
def get_response():
    global conversations
    data = request.json
    user_input = data.get('user_input', "").strip()
    selected_tab = data.get('tab', "all") 
    selected_perspectives = data.get('selected_perspectives', [])  # Get selected perspectives if provided

    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    if session_id not in conversations:
        conversations[session_id] = {
            "all": [],
            "perspectives": {},
            "selected_perspectives": []
        }

    session_data = conversations[session_id]

    # Initial perspective generation
    if not session_data["perspectives"]:
        perspectives = generate_perspectives(user_input)
        print("PERSPECTIVES:", perspectives)
        session_data["perspectives"] = perspectives

        return jsonify({
            "perspectives": perspectives
        })
    
    # Handle perspective confirmation and first chat (detecting by selected_perspectives in request)
    elif selected_perspectives and not session_data["selected_perspectives"]:
        print("CONFIRMING PERSPECTIVES:", selected_perspectives)
        session_data["selected_perspectives"] = selected_perspectives
        
        # Now generate the first chat responses for selected perspectives
        perspectives = session_data["perspectives"]
        responses = first_chat(user_input, {k: perspectives[k] for k in selected_perspectives})
        
        # Store the initial conversations
        for num_key in selected_perspectives:
            if num_key not in session_data:
                session_data[num_key] = []
            session_data[num_key].append({"user": user_input, "ai": responses[num_key]})
            session_data["all"].append({"user": user_input, "ai": responses[num_key], "perspective": num_key})
        
        return jsonify({
            "responses": responses,
            "conversations": session_data,
            "perspectives": perspectives
        })
    
    # Handle follow-up conversations
    else:
        print("FOLLOW UP")
        perspectives = session_data["perspectives"]
        responses = {}

        if selected_tab == "all":
            active_perspectives = session_data["selected_perspectives"] or list(perspectives.keys())
        else:
            active_perspectives = [selected_tab]

        print("Active perspectives for response:", active_perspectives)

        for num_key in active_perspectives:
            print(f"Generating response for perspective {num_key}")
            chat_history = [
                {"role": "system", "content": f"Continue responding as {perspectives[num_key]}."}
            ]

            for message in session_data.get(num_key, []):
                chat_history.append({"role": "user", "content": message["user"]})
                chat_history.append({"role": "assistant", "content": message["ai"]})

            chat_history.append({"role": "user", "content": user_input})

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=chat_history,
                temperature=0.7,
                max_tokens=200
            )

            ai_response = response.choices[0].message.content.strip()
            responses[num_key] = ai_response

            if num_key not in session_data:
                session_data[num_key] = []
            session_data[num_key].append({"user": user_input, "ai": ai_response})
            session_data["all"].append({"user": user_input, "ai": ai_response, "perspective": num_key})
        
        return jsonify({
            "responses": responses,
            "conversations": session_data,
            "perspectives": perspectives
        })
    

if __name__ == '__main__':
    app.run(debug=True, port=8000)