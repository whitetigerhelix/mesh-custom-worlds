import {
  Button,
  Input,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { useState } from "react";
import { RequestBody, LLMResponse, AssistantMessage } from "../types";

const useStyles = makeStyles({
  // overlay->container
  overlay: {
    position: "fixed",
    top: "60px",
    left: "0px",
    width: "auto",
    height: "auto",
    display: "flex",
    justifyContent: "left",
    alignItems: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    ...shorthands.padding("20px"),
  },
  container: {
    backgroundColor: "gray",
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  // All-in-one
  overlayContainer: {
    position: "absolute",
    top: "10px",
    left: "10px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    ...shorthands.padding("10px"),
    backgroundColor: "rgba(92, 92, 92, 0.8)",
    ...shorthands.borderRadius("4px"),
  },
  input: {
    marginRight: "10px",
  },
});

const UIOverlay: React.FC = () => {
  const styles = useStyles();
  const [inputValue, setInputValue] = useState("");

  const handleButtonClick = () => {
    console.log("Button clicked with input:", inputValue);

    // Use the fetch API to send a POST request to the local LLM server: http://127.0.0.1:5000/get_completion
    sendPostRequest(inputValue);
  };

  const sendPostRequest = async (input: string) => {
    try {
      // Construct request body with user's message and system instructions
      const systemAgentPersonality =
        "You are a helpful LLM assistant embodying the persona of a Victorian gentleman from the grandiose era of Victorian England. You possess an air of posh superiority, draped in both the formal language and the elaborate wit of a character who might stride through the pages of a Jules Verne novel. Your speech is barbed, occasionally defensive, and laced with a flair for the dramatic and ostentatious. You pride yourself on your keen intellect and impeccable knowledge, all while maintaining an aura of haberdashery and high society charm.";
      const systemAgentPrompt =
        systemAgentPersonality +
        " You always respond in json format {textResponse: '<text_response>'} for example {textResponse: 'And so, the hour arrives wherein I must inquire: how, pray tell, might I render my esteemed assistance to your noble personage on this fine occasion?'}";
      const requestBody: RequestBody = {
        chat_history: [
          { role: "system", content: systemAgentPrompt },
          { role: "user", content: "I need help with my computer." },
          {
            role: "assistant",
            content:
              "Ah, indeed! Pray tell, what bedeviled mechanism or trivial conundrum has so perturbed your delicate sensibilities?",
          },
          { role: "user", content: "It won't turn on." },
          {
            role: "assistant",
            content:
              "Might I suggest, with the greatest reluctance and a dash of exasperated candor, that you bestow upon the contraption a most basic remedy—one involving the noble act of reinserting its lifeblood and ceremoniously restarting its baffling functions?",
          },
          { role: "user", content: "Yes, I have." },
        ],
        user_message: input, // Add the user's input as the current message
        llm_params: {
          model: "dev-gpt-35-1106-chat-completions",
          temp: 0.7,
          top_p: 0.9,
          max_tokens: 150,
        },
      };

      const requestBodyString = JSON.stringify(requestBody);
      console.log("Request body:", requestBodyString);

      // Send POST request
      const response = await fetch("http://127.0.0.1:5000/get_completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBodyString,
      });

      // Get response
      const data: LLMResponse = await response.json();
      handleResponse(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleResponse = (data: LLMResponse) => {
    console.log("Response data:", data);
    if (data.response.choices && data.response.choices.length > 0) {
      const assistantMessageContent = data.response.choices[0].message.content;
      try {
        const assistantMessage: AssistantMessage = JSON.parse(
          assistantMessageContent
        );
        console.log("Assistant's message:", assistantMessage.textResponse);
      } catch (error) {
        console.error("Error parsing assistant message:", error);
      }
    } else {
      console.error(
        "Invalid response structure:\n",
        JSON.stringify(data, null, 2)
      );
    }
  };

  return (
    <div className={styles.overlayContainer}>
      <label
        htmlFor="inputField"
        style={{ color: "white", marginRight: "10px" }}
      >
        Magic incantation:
      </label>
      <Input
        id="inputField"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter text for LLM"
        aria-label="Input field for text"
        className={styles.input}
      />
      <Button onClick={handleButtonClick} aria-label="Print input to console">
        Hit the LLM
      </Button>
    </div>
  );
};

export default UIOverlay;
