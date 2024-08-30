# Description: This is the main file for the Flask server. It sets up the server and defines the routes.
import logging
from flask import Flask
from flask_cors import CORS
from substrate_llm import LLMClient

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

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



#####################
# MAIN
#####################
if __name__ == "__main__":
    app.run(debug=True)
