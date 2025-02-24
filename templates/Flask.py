from flask import Flask, render_template

# Initialize the Flask app
app = Flask(__name__)

# Define the route for the welcome page
@app.route('/')
def welcome_page():
    return render_template('welcome.html')  # Render the HTML template

# Run the app
if __name__ == '__main__':
    app.run(debug=True)