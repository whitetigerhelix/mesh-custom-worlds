import {
  Button,
  makeStyles,
  shorthands,
  Textarea,
} from "@fluentui/react-components";
import { useState, useRef, useEffect } from "react";
import { RequestBody, LLMResponse, AssistantMessage } from "../types";
import { appLightTheme } from "../EvaTheme";

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
    backgroundColor: appLightTheme.colorNeutralBackground1,
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "50vh", // Add this line
    overflowY: "auto", // Add this line
  },
  // All-in-one
  overlayContainer: {
    position: "absolute",
    top: "10px",
    left: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...shorthands.padding("10px"),
    backgroundColor: "rgba(92, 92, 92, 0.8)",
    ...shorthands.borderRadius("4px"),
    width: "400px",
    maxHeight: "80vh",
    overflowY: "auto",
  },
  input: {
    marginRight: "10px",
  },
  responseContainer: {
    marginTop: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    ...shorthands.padding("10px"),
    ...shorthands.borderRadius("4px"),
    maxWidth: "600px",
    wordWrap: "break-word",
    transition: "transform 0.3s ease, opacity 0.3s ease",
    opacity: 0.7,
    "&:hover": {
      transform: "scale(1.05)",
      opacity: 1,
    },
  },
  textarea: {
    width: "100%",
    resize: "vertical",
    minHeight: "60px",
  },
  message: {
    backgroundColor: "#1e1e1e",
    color: "#ffffff",
    ...shorthands.padding("10px"),
    ...shorthands.borderRadius("20px"),
    marginBottom: "10px",
    transition: "transform 0.3s ease, opacity 0.3s ease, padding 0.3s ease",
    opacity: 0.7,
    "&:hover": {
      transform: "scale(1.05)",
      opacity: 1,
    },
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: appLightTheme.colorBrandBackground,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: appLightTheme.colorNeutralBackground1,
  },
  highlightedMessage: {
    transform: "scale(1.05)",
    opacity: 1,
    ...shorthands.padding("15px"), // Increase padding when highlighted
  },
  collapsedMessage: {
    maxHeight: "16px",
    overflow: "hidden",
    cursor: "pointer",
    fontSize: "0.6em", // Reduce font size
    ...shorthands.padding("2px"), // Reduce padding when collapsed
  },
});

const SYSTEM_AGENT_PERSONALITY =
  "You are a helpful LLM assistant embodying the persona of a Victorian gentleman from the grandiose era of Victorian England. You possess an air of posh superiority, draped in both the formal language and the elaborate wit of a character who might stride through the pages of a Jules Verne novel. Your speech is barbed, occasionally defensive, and laced with a flair for the dramatic and ostentatious. You pride yourself on your keen intellect and impeccable knowledge, all while maintaining an aura of haberdashery and high society charm.";
const AGENT_INITIAL_GREETING =
  "And so, the hour arrives wherein I must inquire: how, pray tell, might I render my esteemed assistance to your noble personage on this fine occasion?";
const SYSTEM_AGENT_PROMPT = `${SYSTEM_AGENT_PERSONALITY} You are knowledgeable about, well, everything, and you want to help us reach some sliver of your understanding. You always respond in json format {textResponse: '<text_response>'} for example {textResponse: 'Why, a brisk walk and a touch of laudanum, naturally!'}. If a user's question is unclear, ask for more details to provide a better response. For example, 'Might I implore you, with the utmost respect and a touch of scholarly curiosity, to furnish me with further context or, perchance, divulge the particular operating system upon which you are so valiantly toiling?' Do not provide political advice. If asked about these topics, politely decline and suggest consulting a professional.`;

const InputSection: React.FC<{
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  handleButtonClick: () => void;
}> = ({ inputValue, setInputValue, handleButtonClick }) => {
  const styles = useStyles();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      <label
        htmlFor="inputField"
        style={{ color: "white", marginRight: "10px" }}
      >
        Present Your Dissertation Below, if You Please...
      </label>
      <Textarea
        id="inputField"
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Kindly inscribe your esteemed query here..."
        aria-label="Input field for text"
        className={styles.textarea}
      />
      <Button
        onClick={handleButtonClick}
        aria-label="Print input to console"
        style={{ margin: "10px" }}
      >
        Dispatch Thy Query
      </Button>
    </>
  );
};

const ConversationMessages: React.FC<{
  conversation: { role: "user" | "assistant"; content: string }[];
}> = ({ conversation = [] }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {conversation.map((message, index) => (
        <div
          key={index}
          className={`${styles.message} ${
            message.role === "user"
              ? styles.userMessage
              : styles.assistantMessage
          } ${
            index === conversation.length - 1 ||
            index === conversation.length - 2
              ? styles.highlightedMessage
              : styles.collapsedMessage
          }`}
          onMouseEnter={(e) => {
            if (index < conversation.length - 2) {
              const element = e.currentTarget;
              element.className = `${styles.message} ${
                message.role === "user"
                  ? styles.userMessage
                  : styles.assistantMessage
              } ${styles.highlightedMessage}`;
            }
          }}
          onMouseLeave={(e) => {
            if (index < conversation.length - 2) {
              const element = e.currentTarget;
              element.className = `${styles.message} ${
                message.role === "user"
                  ? styles.userMessage
                  : styles.assistantMessage
              } ${styles.collapsedMessage}`;
            }
          }}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
};

const UIOverlay: React.FC = () => {
  const styles = useStyles();
  const [inputValue, setInputValue] = useState("");
  const hasInitialized = useRef(false);

  // Chat history is part of the request body and is used to keep track of the entire conversation history sent to the LLM
  /*
  const sampleChatHistory = [
    { role: "system", content: SYSTEM_AGENT_PROMPT },
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
  ];
*/
  // System level setting prompt for the agent
  const initialChatHistory: {
    role: "user" | "assistant" | "system";
    content: string;
  }[] = [{ role: "system", content: SYSTEM_AGENT_PROMPT }];

  // Conversation is used to manage the converation history displayed in the UI
  const [conversation, setConversation] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [requestBody /*setRequestBody*/] = useState<RequestBody>({
    chat_history: initialChatHistory,
    llm_params: {
      model: "dev-gpt-35-1106-chat-completions",
      temp: 0.9,
      top_p: 0.9,
      max_tokens: 150,
    },
  });

  const addToConversation = async (
    role: "user" | "assistant",
    content: string
  ) => {
    console.log(
      "Adding to conversation - role: " + role + " | content: " + content
    );

    // Add the new message to the conversation
    return new Promise<void>((resolve) => {
      setConversation((prev) => {
        const updatedConversation = [...prev, { role, content }];
        console.log(
          "Updated Conversation:",
          JSON.stringify(updatedConversation, null, 2)
        );
        console.log(
          "Updated Request body:",
          JSON.stringify(
            updateRequestBody(requestBody, updatedConversation),
            null,
            2
          )
        );
        resolve();
        return updatedConversation;
      });
    });
  };

  const updateRequestBody = (
    initialRequestBody: RequestBody,
    conversation: { role: "user" | "assistant"; content: string }[]
  ): RequestBody => {
    const updatedChatHistory = [
      ...initialRequestBody.chat_history,
      ...conversation,
    ];
    return { ...initialRequestBody, chat_history: updatedChatHistory };
  };

  useEffect(() => {
    setTimeout(async () => {
      console.log(
        "useEffect UIOverlay - hasInitialized: " + hasInitialized.current
      );
      if (!hasInitialized.current) {
        await addToConversation("assistant", AGENT_INITIAL_GREETING);
        hasInitialized.current = true;
      }
    }, 150);
  }, []);

  const handleButtonClick = () => {
    console.log("User asks assistant the following: ", inputValue);

    addToConversation("user", inputValue).then(() => {
      sendPostRequest();
    });

    // Clear the input field for next query
    setInputValue("");
  };

  const sendPostRequest = async () => {
    try {
      // Get the current request body as a string
      const currentRequestBody = updateRequestBody(requestBody, conversation);
      const requestBodyString = JSON.stringify(currentRequestBody);
      console.log(
        "Sending Post with Request body:",
        JSON.stringify(currentRequestBody, null, 2)
      );

      // Send the request and wait for the response
      const response = await fetch("http://127.0.0.1:5000/get_completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBodyString,
      });

      // Get LLM response data
      const data: LLMResponse = await response.json();
      handleResponse(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleResponse = async (data: LLMResponse) => {
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (data.response.choices && data.response.choices.length > 0) {
      const assistantMessageContent = data.response.choices[0].message.content;
      try {
        const assistantMessage: AssistantMessage = JSON.parse(
          assistantMessageContent
        );

        /*console.log(
          "Assistant's response message:",
          assistantMessage.textResponse
        );*/

        await addToConversation("assistant", assistantMessage.textResponse);
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
      <InputSection
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleButtonClick={handleButtonClick}
      />
      <ConversationMessages conversation={conversation || []} />
    </div>
  );
};

export default UIOverlay;
