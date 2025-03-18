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
    print(numbered_perspectives)
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



# Add these endpoints to your Flask application

# Add these endpoints to your Flask application
# Add these endpoints to your Flask application

# Add this dictionary at the top of your Flask application to store debate histories
# alongside your existing conversations dictionary

# Store debate histories per session
debate_histories = {}

@app.route('/get_debate_response', methods=['POST'])
def get_debate_response():
    """Generate a debate response from a perspective on a topic."""
    global debate_histories
    
    data = request.json
    
    perspective_key = data.get('perspective_key')
    perspective = data.get('perspective')
    topic = data.get('topic', '').strip()
    session_id = data.get('session_id', str(uuid.uuid4()))  # Use provided session ID or generate one
    
    # Check if this is the first or second perspective
    is_second = 'other_perspective' in data
    other_perspective_key = data.get('other_perspective_key', '')
    other_perspective = data.get('other_perspective', '')
    other_response = data.get('other_response', '')
    
    if not topic or not perspective:
        return jsonify({"error": "Missing required data"}), 400
    
    # Initialize debate history for this session if it doesn't exist
    if session_id not in debate_histories:
        debate_histories[session_id] = {
            "topic": topic,
            "messages": []
        }
    
    try:
        # Get the debate history
        debate_history = debate_histories[session_id]
        
        # Create messages array for the API call
        messages = [
            {"role": "system", "content": f"You are responding as: {perspective}"}
        ]
        
        # Add context about the debate
        debate_context = f"This is a debate about: {topic}"
        
        # If we have previous messages, add them to the context
        if debate_history["messages"]:
            debate_context += "\n\nPrevious messages in this debate:"
            for msg in debate_history["messages"]:
                perspective_name = msg["perspective_name"]
                content = msg["content"]
                debate_context += f"\n{perspective_name}: {content}"
        
        messages.append({"role": "user", "content": debate_context})
        
        # Different prompts for first and second perspective
        if is_second:
            instruction = f"""
            You are participating in a debate about this topic: {topic}
            
            The other participant ({other_perspective}) has already responded with:
            "{other_response}"
            
            Provide your perspective on the topic, addressing or responding to what the other participant said.
            Make your response thoughtful, substantive, and authentic to your perspective's viewpoint.
            Keep your response to 3-4 sentences for readability.
            """
        else:
            instruction = f"""
            You are starting a debate about this topic: {topic}
            
            Provide your initial perspective on this topic. You'll be the first to speak.
            Make your response thoughtful, substantive, and authentic to your perspective's viewpoint.
            Keep your response to 3-4 sentences for readability.
            """
        
        messages.append({"role": "user", "content": instruction})
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Store this message in the debate history
        debate_history["messages"].append({
            "perspective_key": perspective_key,
            "perspective_name": perspective,
            "content": response_text
        })
        
        return jsonify({
            "response": response_text,
            "perspective_key": perspective_key,
            "session_id": session_id
        })
        
    except Exception as e:
        print(f"Error generating debate response: {str(e)}")
        return jsonify({"error": "Failed to generate response"}), 500

@app.route('/get_debate_counterpoint', methods=['POST'])
def get_debate_counterpoint():
    """Generate a counterpoint in an ongoing debate with access to full history."""
    global debate_histories
    
    data = request.json
    
    perspective_key = data.get('perspective_key')
    perspective = data.get('perspective')
    other_perspective_key = data.get('other_perspective_key')
    other_perspective = data.get('other_perspective')
    other_response = data.get('other_response', '').strip()
    session_id = data.get('session_id')
    
    if not perspective or not other_perspective or not other_response or not session_id:
        return jsonify({"error": "Missing required data"}), 400
    
    # Check if we have a debate history for this session
    if session_id not in debate_histories:
        return jsonify({"error": "No debate history found for this session"}), 400
    
    try:
        # Get the debate history
        debate_history = debate_histories[session_id]
        topic = debate_history["topic"]
        
        # Create messages array for the API call
        messages = [
            {"role": "system", "content": f"You are responding as: {perspective}"}
        ]
        
        # Add context about the debate including full history
        debate_context = f"This is a debate about: {topic}\n\nFull debate history:"
        
        for msg in debate_history["messages"]:
            speaker_name = msg["perspective_name"]
            content = msg["content"]
            debate_context += f"\n{speaker_name}: {content}"
        
        # Add instruction
        debate_context += f"\n\nNow, respond to the most recent message from {other_perspective}. Maintain your perspective's viewpoint while addressing their points directly."
        
        messages.append({"role": "user", "content": debate_context})
        
        system_prompt = f"""
        You are continuing a debate with {other_perspective} about {topic}.
        
        Respond directly to their points from your perspective's viewpoint.
        Be thoughtful, persuasive, and authentic to your perspective's characteristics.
        
        Reference previous points made in the debate when relevant.
        Keep your response to 2-3 sentences for readability.
        """
        
        messages.append({"role": "user", "content": system_prompt})
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Store this message in the debate history
        debate_history["messages"].append({
            "perspective_key": perspective_key,
            "perspective_name": perspective,
            "content": response_text
        })
        
        return jsonify({
            "response": response_text,
            "perspective_key": perspective_key,
            "session_id": session_id
        })
        
    except Exception as e:
        print(f"Error generating debate counterpoint: {str(e)}")
        return jsonify({"error": "Failed to generate counterpoint"}), 500


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