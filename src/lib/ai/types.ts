export type AiRole = "mentor" | "opponent" | "examiner" | "research_assistant";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OpenAICompatibleConfig = {
  apiBaseUrl: string;
  apiKey: string;
  model: string;
  temperature?: number;
  allowInsecureTls?: boolean;
};
