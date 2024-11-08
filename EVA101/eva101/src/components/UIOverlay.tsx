import React, { useState, useRef, useEffect } from "react";
import { makeStyles, shorthands } from "@fluentui/react-components";
import { RequestBody } from "../types";
import { appDarkTheme } from "../EvaTheme";
import InputSelect from "./InputSelect";
import VoiceSelector from "./VoiceSelector";
import ConversationMessages from "./ConversationMessages";
import useVoices from "../hooks/useVoices";
import SpeechRecognitionButton from "./SpeechRecognitionButton";
import {
  initialChatHistory,
  updateRequestBody,
  getRandomGreeting,
} from "../utils/agent";
import { sendPostRequest } from "../utils/api";

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
    backgroundColor: appDarkTheme.colorBrandBackground,
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "50vh",
    overflowY: "auto",
  },
  // All-in-one
  overlayContainer: {
    position: "absolute",
    top: "10px",
    left: "0px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...shorthands.padding("10px"),
    //backgroundColor: "rgba(92, 92, 92, 0.8)",
    backgroundImage: "url('/textures/ui_background.jpg')",
    backgroundSize: "cover",
    ...shorthands.borderRadius("4px"),
    width: "800px", // Full width of texture
    maxHeight: "70vh",
    overflowY: "auto",
    ...shorthands.border("3px", "solid", "brown"), // Add this line for border
  },
  conversationContainer: {
    display: "flex",
    flexDirection: "column-reverse", // Anchor to bottom
    overflowY: "auto",
    maxHeight: "100%",
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "3rem",
    color: "#FFD700",
    textShadow: "2px 2px 4px #000000",
    marginBottom: "20px",
  },
  buttonText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1.2rem",
    color: "#FFD700",
    textShadow: "1px 1px 2px #000000",
  },
  labelText: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "1rem",
    color: "#FFD700",
    textShadow: "1px 1px 2px #000000",
  },
});

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const UIOverlay: React.FC = () => {
  console.log("UIOverlay component rendered");

  const startVoiceEffect = (mood: string) => {
    console.log("UIOverlay.startVoiceEffect - mood: " + mood);
  };

  const stopVoiceEffect = () => {
    console.log("UIOverlay.stopVoiceEffect");
  };

  const styles = useStyles();
  const [inputValue, setInputValue] = useState("");
  const hasInitialized = useRef(false);
  const {
    voices,
    selectedVoice,
    setSelectedVoice,
    isVoiceEnabled,
    setIsVoiceEnabled,
    speakText,
    stopTalking,
  } = useVoices(startVoiceEffect, stopVoiceEffect);

  const [mood, setMood] = useState("neutral");

  // Conversation is used to manage the conversation history displayed in the UI
  const [conversation, setConversation] = useState<
    {
      role: "user" | "assistant";
      content: string;
      mood: string;
    }[]
  >([]);

  const [requestBody] = useState<RequestBody>({
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
      const savedIsVoiceEnabled = JSON.parse(
        localStorage.getItem("isVoiceEnabled") || "false"
      );

      console.log(
        "useEffect UIOverlay - hasInitialized: " +
          hasInitialized.current +
          " | isVoiceEnabled: " +
          isVoiceEnabled +
          " | savedVoice: " +
          savedVoice +
          " | savedIsVoiceEnabled: " +
          savedIsVoiceEnabled
      );

      if (!hasInitialized.current) {
        const initialGreeting = getRandomGreeting();
        await addToConversation(
          "assistant",
          initialGreeting.text,
          initialGreeting.mood
        );
        hasInitialized.current = true;

        setIsVoiceEnabled(savedIsVoiceEnabled);

        if (savedIsVoiceEnabled) {
          speakText(
            initialGreeting.text,
            savedVoice || "",
            initialGreeting.mood
          );
        }
      }
    };

    const timer = setTimeout(initialize, 150);
    return () => {
      clearTimeout(timer);
      stopTalking();
    };
  }, [isVoiceEnabled]);

  const addToConversation = async (
    role: "user" | "assistant",
    content: string,
    mood: string //= "neutral"
  ) => {
    console.log(
      "Adding to conversation - role: " +
        role +
        " | content: " +
        content +
        " | mood: " +
        mood
    );

    // Add the new message to the conversation
    return new Promise<
      { role: "user" | "assistant"; content: string; mood: string }[]
    >((resolve) => {
      setConversation((prev) => {
        const updatedConversation = [...prev, { role, content, mood }];

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
    });
  };

  const handleButtonClick = async () => {
    const userQuery = inputValue || "...";
    console.log("User asks assistant the following: ", userQuery);

    stopTalking();

    const updatedConvo = await addToConversation("user", userQuery, mood);

    await sendPostRequest(
      updatedConvo,
      requestBody,
      speakText,
      selectedVoice,
      isVoiceEnabled,
      addToConversation
    );

    // Clear the input field for next query
    setInputValue("");
  };

  const handleSpeechRecognition = () => {
    stopTalking();

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
    <>
      <div className={styles.overlayContainer}>
        <h1 className={styles.title}>Gentleman's Inquiry Desk</h1>
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
          mood={mood}
          setMood={setMood}
        />
        <VoiceSelector
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          voices={voices}
          isVoiceEnabled={isVoiceEnabled}
          setIsVoiceEnabled={setIsVoiceEnabled}
        />
        <div className={styles.conversationContainer}>
          <ConversationMessages conversation={conversation || []} />
        </div>
      </div>
    </>
  );
};

export default UIOverlay;
