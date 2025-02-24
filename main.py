from openai import OpenAI
from flask import Flask, request, render_template, jsonify
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)

inputlist = []
responselist = []

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
    #print(perspectives)
    return perspectives

def chat(user_input, perspectives):
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

#@app.route('/')
#def index():
#    return render_template('index.html')

@app.route('/')
def welcome_page():
    return render_template('welcome.html')  # Render the HTML template

@app.route('/login')
def login_page():
    return render_template('login.html')  # Render the HTML template

@app.route('/google-login')
def index_page():
    return render_template('start.html')  # Render the HTML template


@app.route('/get_response', methods=['POST'])
def get_response():
    data = request.json
    user_input = data.get('user_input', "")

    perspectives = generatePerspectives(user_input)

    responses = chat(user_input, perspectives)
    #print("Sending JSON Response:", json.dumps({"perspectives": perspectives, "responses": responses}, indent=2))

    return jsonify({"perspectives": perspectives, "responses": responses})


if __name__ == '__main__':
    app.run(debug=True, port=8000)
