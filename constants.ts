import { BotId, BotConfig } from './types';

export const BOTS: Record<BotId, BotConfig> = {
  [BotId.GEMINI]: {
    id: BotId.GEMINI,
    name: 'Gemini',
    avatar: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Google DeepMind',
    defaultModel: 'gemini-2.5-flash',
    fallbackModel: 'gemini-2.5-flash',
  },
  [BotId.OPENAI]: {
    id: BotId.OPENAI,
    name: 'ChatGPT',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'OpenAI',
    defaultModel: 'gpt-4o',
    fallbackModel: 'gemini-2.5-pro', // Simulation
  },
  [BotId.CLAUDE]: {
    id: BotId.CLAUDE,
    name: 'Claude',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Anthropic_logo.svg',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Anthropic',
    defaultModel: 'claude-3-5-sonnet-latest',
    fallbackModel: 'gemini-2.5-pro', // Simulation
  },
  [BotId.QWEN]: {
    id: BotId.QWEN,
    name: 'Qwen',
    avatar: 'https://img.alicdn.com/imgextra/i4/O1CN01d8N85B1lDwT9yQ28E_!!6000000004789-2-tps-200-200.png',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    description: 'Alibaba Cloud',
    defaultModel: 'qwen-max',
    fallbackModel: 'gemini-2.5-flash', // Simulation
  },
  [BotId.DEEPSEEK]: {
    id: BotId.DEEPSEEK,
    name: 'DeepSeek',
    avatar: 'https://chat.deepseek.com/favicon.ico',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    description: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    fallbackModel: 'gemini-2.5-pro', // Simulation
  },
};

export const AVAILABLE_MODELS: Record<BotId, string[]> = {
  [BotId.GEMINI]: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-3-pro'],
  [BotId.OPENAI]: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-preview', 'o1-mini'],
  [BotId.CLAUDE]: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
  [BotId.QWEN]: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-long'],
  [BotId.DEEPSEEK]: ['deepseek-chat', 'deepseek-reasoner'],
};
