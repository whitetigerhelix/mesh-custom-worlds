from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from substrate_llm import LLMClient

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes


@app.route("/")
def hello():
    return "Hello, World!"


# create the LLMClient
llm_client = LLMClient()


# Helper route to serve images from the images directory
@app.route("/images/<path:filename>", methods=["GET"])
def serve_image(filename):
    return send_from_directory("images", filename)


# !Important - The first time this is called the command line will try to authenticate.
# This will require you to go to the URL provided and authenticate with your Microsoft Account
# If the request hangs - it probably means you need to authenticate
@app.route("/test", methods=["GET"])
def test_prompt():
    # a compelling, but short prompt to test the model that asks a question
    user_input = "What is the capital of France?"
    response = llm_client.get_completion(user_input)
    return jsonify(response)


# Test generate an image
@app.route("/generate_image", methods=["GET"])
def generate_image():
    user_input = "Generate an image of a cat."
    response = llm_client.get_image(user_input)
    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
