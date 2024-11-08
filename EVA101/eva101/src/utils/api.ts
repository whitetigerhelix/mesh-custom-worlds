import { RequestBody, LLMResponse, AssistantMessage } from "../types";
import { updateRequestBody } from "./agent";

export const sendPostRequest = async (
  updatedConvo: { role: "user" | "assistant"; content: string }[],
  requestBody: RequestBody,
  speakText: (text: string, voiceName: string, mood: string) => void,
  selectedVoice: string,
  isVoiceEnabled: boolean,
  addToConversation: (
    role: "user" | "assistant",
    content: string,
    mood: string
  ) => Promise<{ role: "user" | "assistant"; content: string }[]>
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
    handleResponse(
      data,
      speakText,
      selectedVoice,
      isVoiceEnabled,
      addToConversation
    );
  } catch (error) {
    console.error("Error:", error);

    await addToConversation(
      "assistant",
      "My sincerest apologies, but it appears I am unable to fulfill your request at this moment. I entreat you to exercise patience and attempt once more at a later juncture.",
      "sad"
    );
  }
};

const handleResponse = async (
  data: LLMResponse,
  speakText: (text: string, voiceName: string, mood: string) => void,
  selectedVoice: string,
  isVoiceEnabled: boolean,
  addToConversation: (
    role: "user" | "assistant",
    content: string,
    mood: string
  ) => Promise<{ role: "user" | "assistant"; content: string }[]>
) => {
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

      //TODO: This should come from the response itself
      const assistantMood = assistantMessage.mood || "neutral"; // Assuming the mood is part of the response

      if (isVoiceEnabled) {
        speakText(assistantMessage.textResponse, selectedVoice, assistantMood);
      }
      await addToConversation(
        "assistant",
        assistantMessage.textResponse,
        assistantMood
      );
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
