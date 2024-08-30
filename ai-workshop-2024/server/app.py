
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

# Import routes
import routes

if __name__ == "__main__":
    app.run(debug=True)
