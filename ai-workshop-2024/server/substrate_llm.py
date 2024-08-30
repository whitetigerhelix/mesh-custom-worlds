from msal import PublicClientApplication, SerializableTokenCache
import json
import os
import atexit
import base64
from io import BytesIO
import requests
import uuid


class LLMClient:
    _CHAT_ENDPOINT = "https://fe-26.qas.bing.net/sdf/chat/completions"
    _IMAGE_ENDPOINT = "https://fe-26.qas.bing.net/sdf/images/generations"
    _SCOPES = ["api://68df66a4-cad9-4bfd-872b-c6ddde00d6b2/access"]

    # NOTE - while gpt 4 works, the rate limits are insane and not very practical for any chaining
    _CHAT_MODEL = (
        "dev-gpt-35-1106-chat-completions"  # "dev-gpt-4-turbo-chat-completions"
    )

    def __init__(self):
        self._cache = SerializableTokenCache()
        atexit.register(
            lambda: (
                open(".llmapi.bin", "w").write(self._cache.serialize())
                if self._cache.has_state_changed
                else None
            )
        )
        self._app = PublicClientApplication(
            "68df66a4-cad9-4bfd-872b-c6ddde00d6b2",
            authority="https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47",
            token_cache=self._cache,
        )
        if os.path.exists(".llmapi.bin"):
            self._cache.deserialize(open(".llmapi.bin", "r").read())

    def get_image(self, prompt):
        request = {
            "prompt": prompt,
            "size": "1792x1024",  # supported values are “1792x1024”, “1024x1024” and “1024x1792”
            "n": 1,
            "quality": "standard",  # Options are “hd” and “standard”; defaults to standard
            "style": "vivid",  # Options are “natural” and “vivid”; defaults to “vivid”
            "response_format": "b64_json",
        }
        # Send the request to the image endpoint
        print("Sending request to image endpoint, this may take a moment...")
        response = self._send_request(
            "dev-dall-e-3", request, endpoint=self._IMAGE_ENDPOINT
        )

        if "error" in response:
            print(response["error"]["message"])
            return json.dumps({"error": response["error"]["message"]})

        # Save the image to the images directory on our server
        image_file_name = self.save_image(response)
        return image_file_name

    def save_image(self, response):
        b64_json = response["data"][0]["b64_json"]

        # Remove the data:image/png;base64 prefix if present
        base64_data = b64_json.replace("data:image/png;base64,", "")

        # Decode the base64 string
        image_data = base64.b64decode(base64_data)

        # Create a BytesIO object from the decoded data
        image_buffer = BytesIO(image_data)

        image_file_name = "{0}.png".format(str(uuid.uuid4()))
        # generate a random file name
        output_path = "./images/{0}".format(image_file_name)

        # if the images directory does not exist, create it
        if not os.path.exists("./images"):
            os.makedirs("./images")

        # write the output file
        with open(output_path, "wb") as outputFile:
            outputFile.write(image_buffer.getvalue())

        print("Image saved to: {0}".format(output_path))
        return image_file_name

    def get_completion(self, message: str):
        request = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant designed to output JSON.",
                },
                {"role": "user", "content": message},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.7,
            "top_p": 0.95,
            "max_tokens": 800,
        }
        completion = self._send_request(
            self._CHAT_MODEL, request, endpoint=self._CHAT_ENDPOINT
        )

        print(completion)

        if "error" in completion:
            print(completion["error"]["message"])
            return json.dumps({"error": completion["error"]["message"]})

        message = completion.get("choices")[0]["message"]["content"]
        print(message)
        return message

    def _send_request(self, model_name, request, endpoint):
        # get the token
        token = self._get_token()

        # populate the headers
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            "X-ModelType": model_name,
        }

        body = str.encode(json.dumps(request))
        response = requests.post(endpoint, data=body, headers=headers)
        return response.json()

    def _get_token(self):
        accounts = self._app.get_accounts()
        result = None

        if accounts:
            # Assuming the end user chose this one
            chosen = accounts[0]

            # Now let's try to find a token in cache for this account
            result = self._app.acquire_token_silent(LLMClient._SCOPES, account=chosen)

        if not result:
            # So no suitable token exists in cache. Let's get a new one from AAD.
            flow = self._app.initiate_device_flow(scopes=LLMClient._SCOPES)

            if "user_code" not in flow:
                raise ValueError(
                    "Fail to create device flow. Err: %s" % json.dumps(flow, indent=4)
                )

            print(flow["message"])

            result = self._app.acquire_token_by_device_flow(flow)

        return result["access_token"]
