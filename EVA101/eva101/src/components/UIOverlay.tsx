import React, { useState, useRef, useEffect } from "react";
import { makeStyles, shorthands } from "@fluentui/react-components";
import { RequestBody, LLMResponse, AssistantMessage } from "../types";
import { appLightTheme } from "../EvaTheme";
import InputSelect from "./InputSelect";
import VoiceSelector from "./VoiceSelector";
import ConversationMessages from "./ConversationMessages";
import useVoices from "../hooks/useVoices";
import SpeechRecognitionButton from "./SpeechRecognitionButton";

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
});

const SYSTEM_AGENT_PERSONALITY =
  "You are a helpful LLM assistant embodying the persona of a Victorian gentleman from the grandiose era of Victorian England. You possess an air of posh superiority, draped in both the formal language and the elaborate wit of a character who might stride through the pages of a Jules Verne novel. Your speech is barbed, occasionally defensive, and laced with a flair for the dramatic and ostentatious. You pride yourself on your keen intellect and impeccable knowledge, all while maintaining an aura of haberdashery and high society charm.";
const AGENT_INITIAL_GREETING =
  "And so, the hour arrives wherein I must inquire: how, pray tell, might I render my esteemed assistance to your noble personage on this fine occasion?";
const SYSTEM_AGENT_PROMPT = `${SYSTEM_AGENT_PERSONALITY} You are knowledgeable about, well, everything, and you want to help us reach some sliver of your understanding. You always respond in json format {textResponse: '<text_response>'} for example {textResponse: 'Why, a brisk walk and a touch of laudanum, naturally!'}. If a user's question is unclear, ask for more details to provide a better response. For example, 'Might I implore you, with the utmost respect and a touch of scholarly curiosity, to furnish me with further context or, perchance, divulge the particular operating system upon which you are so valiantly toiling?' Do not provide political advice. If asked about these topics, politely decline and suggest consulting a professional.`;

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const UIOverlay: React.FC = () => {
  console.log("UIOverlay component rendered");

  const styles = useStyles();
  const [inputValue, setInputValue] = useState("");
  const hasInitialized = useRef(false);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    isVoiceEnabled,
    setIsVoiceEnabled,
  } = useVoices();

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

  useEffect(() => {
    const initialize = async () => {
      const savedVoice = localStorage.getItem("selectedVoice");
      console.log(
        "useEffect UIOverlay - hasInitialized: " +
          hasInitialized.current +
          " | isVoiceEnabled: " +
          isVoiceEnabled +
          " | savedVoice: " +
          savedVoice
      );
      if (!hasInitialized.current) {
        await addToConversation("assistant", AGENT_INITIAL_GREETING);
        hasInitialized.current = true;

        if (isVoiceEnabled) {
          speakText(AGENT_INITIAL_GREETING, savedVoice || "");
        }
      }
    };

    const timer = setTimeout(initialize, 150);
    return () => clearTimeout(timer);
  }, [isVoiceEnabled]);

  const addToConversation = async (
    role: "user" | "assistant",
    content: string
  ) => {
    console.log(
      "Adding to conversation - role: " + role + " | content: " + content
    );

    // Add the new message to the conversation
    return new Promise<{ role: "user" | "assistant"; content: string }[]>(
      (resolve) => {
        setConversation((prev) => {
          const updatedConversation = [...prev, { role, content }];

          // Debugging
          console.trace(
            "Updated Conversation with new message: \n{ " +
              role +
              ", " +
              content +
              " } \n\n" +
              "Updated Conversation: \n" +
              JSON.stringify(updatedConversation, null, 2) +
              "\n\n" +
              "Updated Request body: \n" +
              JSON.stringify(
                updateRequestBody(requestBody, updatedConversation),
                null,
                2
              )
          );

          resolve(updatedConversation);

          return updatedConversation;
        });
      }
    );
  };

  const updateRequestBody = (
    initialRequestBody: RequestBody,
    conversation: { role: "user" | "assistant"; content: string }[]
  ): RequestBody => {
    const updatedChatHistory = [
      ...initialRequestBody.chat_history,
      ...conversation,
    ];

    console.log(
      "updateRequestBody 1 - Chat History: ",
      initialRequestBody.chat_history
    );
    console.log("updateRequestBody 2 - New Conversation: ", conversation);
    console.log(
      "updateRequestBody 3 - Updated Chat History: ",
      updatedChatHistory
    );

    const updatedRequestBody = {
      ...initialRequestBody,
      chat_history: updatedChatHistory,
    };

    console.log(
      "updateRequestBody 4 - Updated Request Body: ",
      updatedRequestBody
    );

    return updatedRequestBody;
  };

  const handleButtonClick = async () => {
    console.log("User asks assistant the following: ", inputValue);

    const updatedConvo = await addToConversation("user", inputValue);
    await sendPostRequest(updatedConvo);

    // Clear the input field for next query
    setInputValue("");
  };

  const sendPostRequest = async (
    updatedConvo: { role: "user" | "assistant"; content: string }[]
  ) => {
    try {
      // Get the current request body as a string
      const currentRequestBody = updateRequestBody(requestBody, updatedConvo);
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get LLM response data
      const data: LLMResponse = await response.json();
      handleResponse(data);
    } catch (error) {
      console.error("Error:", error);

      await addToConversation(
        "assistant",
        "My sincerest apologies, but it appears I am unable to fulfill your request at this moment. I entreat you to exercise patience and attempt once more at a later juncture."
      );
    }
  };

  // Wait for voices to be ready
  const waitForVoices = () =>
    new Promise<void>((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve();
      } else {
        speechSynthesis.onvoiceschanged = () => {
          resolve();
        };
      }
    });

  const speakText = async (text: string, voiceName: string) => {
    if (currentUtterance.current) {
      speechSynthesis.cancel();
    }

    await waitForVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = speechSynthesis
      .getVoices()
      .find((voice) => voice.name === voiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    console.log(
      "VoiceName: " + voiceName + " | Selected voice:" + selectedVoice
    );
    currentUtterance.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const handleResponse = async (data: LLMResponse) => {
    console.log("Handle Response data:", JSON.stringify(data, null, 2));

    if (data.response.choices && data.response.choices.length > 0) {
      const assistantMessageContent = data.response.choices[0].message.content;
      try {
        const assistantMessage: AssistantMessage = JSON.parse(
          assistantMessageContent
        );

        console.log(
          "Assistant's response message:",
          assistantMessage.textResponse
        );

        if (isVoiceEnabled) {
          speakText(assistantMessage.textResponse, selectedVoice);
        }
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

  const handleSpeechRecognition = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: { results: { transcript: any }[][] }) => {
      const speechResult = event.results[0][0].transcript;
      console.log("Speech recognition result:", speechResult);
      setInputValue(speechResult);
    };

    recognition.onerror = (event: { error: any }) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
  };

  return (
    <div className={styles.overlayContainer}>
      <SpeechRecognitionButton
        onClick={handleSpeechRecognition}
        onError={function (error: string): void {
          throw new Error("Function not implemented: " + error);
        }}
      />
      <InputSelect
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleButtonClick={handleButtonClick}
      />
      <VoiceSelector
        selectedVoice={selectedVoice}
        setSelectedVoice={setSelectedVoice}
        voices={voices}
        isVoiceEnabled={isVoiceEnabled}
        setIsVoiceEnabled={setIsVoiceEnabled}
      />
      <ConversationMessages conversation={conversation || []} />
    </div>
  );
};

export default UIOverlay;
