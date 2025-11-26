export enum BotId {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  CLAUDE = 'claude',
  QWEN = 'qwen',
  DEEPSEEK = 'deepseek',
}

export interface BotConfig {
  id: BotId;
  name: string;
  avatar: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  defaultModel: string;
  fallbackModel: string; // Used if API key is missing (simulated via Gemini)
}

export interface Message {
  id: string;
  senderId: BotId | 'user';
  text: string;
  timestamp: number;
  attachments?: {
    type: 'image';
    data: string; // base64
    mimeType: string;
  }[];
  isError?: boolean;
}

export interface AppSettings {
  apiKeys: Record<BotId, string>;
  models: Record<BotId, string>;
  systemPrompts: Record<BotId, string>;
  activeBots: BotId[];
}

export const DEFAULT_SYSTEM_PROMPT = "You are a helpful, expert AI assistant.";
