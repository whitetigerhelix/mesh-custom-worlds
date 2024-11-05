# Description: This is the main file for the Flask server. It sets up the server and defines the routes.
import logging
import json
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from substrate_llm import LLMClient
from flask import request

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})  # This will enable CORS for all routes and allow requests from frontend's origin

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# create the LLMClient
llm_client = LLMClient()


#####################
# ROUTES
#####################

# Default route - hello world
@app.route("/")
def hello():
    app.logger.debug("Default route accessed")
    return "Hello, World!"


# !Important - The first time this is called the command line will try to authenticate.
# This will require you to go to the URL provided and authenticate with your Microsoft Account
# If the request hangs - it probably means you need to authenticate
@app.route("/test", methods=["GET"])
def test_prompt():
    app.logger.debug("test route accessed")
    # a compelling, but short prompt to test the model that asks a question
    user_input = "What is the capital of France?"
    response = llm_client.get_completion(user_input)
    return jsonify(response)


# Test generate an image
@app.route("/generate_image", methods=["GET"])
def generate_image():
    app.logger.debug("generate_image route accessed")
    user_input = "Generate an image of a cat."
    response = llm_client.get_image(user_input)
    return jsonify(response)


# Helper route to serve images from the images directory
@app.route("/images/<path:filename>", methods=["GET"])
def serve_image(filename):
    app.logger.debug("serve image route accessed")
    return send_from_directory("images", filename)


# Generate a playlist for a given mood
@app.route("/api/generate_playlist_for_mood", methods=["POST"])
def generate_playlist_for_mood():
    app.logger.debug("generate playlist for mood route accessed")

    # Get the mood from the request
    data = request.json
    mood = data.get("mood")
    if not mood:
        app.logger.error(f"Mood is invalid!")
        return jsonify({"error": "Mood is required"}), 400
    app.logger.debug(f"Mood: {mood}")

    # Generate a prompt for the LLM
    prompt = f"Generate a playlist of 10 songs that match the mood '{mood}'. Also, provide a description for a visual mood board that represents this mood."

    # Get the response from the LLM
    response = llm_client.get_completion(prompt)
    
    # Parse the response string into a dictionary and get the "playlist" key from the response dictionary
    response_dict = json.loads(response)
    playlist = response_dict.get("playlist", [])
    mood_board_description = response_dict.get("mood_board_description", "")

    # DEBUG
    app.logger.debug(f"Mood: {mood} ---->")
    app.logger.debug(f"Playlist: {playlist}")
    app.logger.debug(f"Generating image for MoodBoardDesc: {mood_board_description}")

    # Generate an image for the mood board description
    mood_board_image = llm_client.get_image(mood_board_description)
    app.logger.debug(f"Done generating image for MoodBoardDesc")

    return jsonify({
        "playlist": playlist,
        "moodBoard": mood_board_image
    })



#####################
# MAIN
#####################
if __name__ == "__main__":
    app.run(debug=True)
