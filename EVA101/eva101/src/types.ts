export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMParams {
  model: string;
  temp: number;
  top_p: number;
  max_tokens: number;
}

export interface RequestBody {
  chat_history: ChatMessage[];
  user_message: string;
  llm_params: LLMParams;
}

export interface AssistantMessage {
  textResponse: string;
}

export interface LLMResponse {
  response: {
    choices: {
      message: {
        content: string;
      };
    }[];
  };
}
