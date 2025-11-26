# AI Prompt: Build OmniChat - Multi-AI Group Chat Application

## Project Overview
Create a web application called "OmniChat" that allows users to chat with multiple AI models simultaneously in a group chat interface. Users can select which AI bots to include in the conversation, configure API keys through a settings UI, and send messages that all active bots will respond to concurrently.

---

## Tech Stack Requirements
- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (loaded via CDN)
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API (via @google/genai SDK)
- **Module Resolution**: ES Modules with importmaps (using aistudiocdn.com)

---

## Core Features

### 1. Multi-Bot Chat Interface
- Support for 5 AI bots:
  - **Gemini** (Google DeepMind) - Direct API integration
  - **ChatGPT** (OpenAI) - Simulated via Gemini
  - **Claude** (Anthropic) - Simulated via Gemini
  - **Qwen** (Alibaba Cloud) - Simulated via Gemini
  - **DeepSeek** - Simulated via Gemini
- Users can select multiple bots to participate in the conversation
- All active bots respond to user messages concurrently (in parallel)
- Each bot has unique visual styling (colors, avatars, message bubbles)

### 2. Bot Disabling & API Key Validation
- **CRITICAL**: Bots without API keys must be disabled and unselectable
- Show lock icon (🔒) on disabled bots
- Display "No API key" status text for disabled bots
- Clicking a disabled bot opens the Settings modal
- Only bots with configured API keys can be activated
- Grayed out appearance for disabled bots (50% opacity)

### 3. Settings Modal
- Modal overlay with backdrop blur effect
- Configure for each bot:
  - **API Key Input**: Password field to enter API key
  - **Model Selection**: Dropdown with available models
  - **System Instruction**: Textarea to customize bot behavior
- All bots including Gemini can have API keys entered in the UI
- API keys stored in React state (in-memory, lost on refresh)
- Changes saved instantly (no save button needed)
- Scrollable content for many bots

### 4. Image Upload Support
- Users can attach images to messages
- Image preview before sending
- Remove attached images with X button
- Convert images to base64 for API
- Send to Gemini's multimodal API
- Display images in message bubbles

### 5. Responsive Design
- Dark sidebar (bg-gray-900) with bot list
- Main chat area with light background
- Top bar showing active agents
- Input box at bottom with attachment and send buttons
- Mobile-friendly layout
- Smooth animations and transitions

---

## Detailed Implementation Requirements

### File Structure
```
/
├── index.html                  # Main HTML entry point
├── index.tsx                   # React app initialization
├── App.tsx                     # Main application component
├── types.ts                    # TypeScript type definitions
├── constants.ts                # Bot configurations and models
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies
├── components/
│   ├── Sidebar.tsx            # Left sidebar with bot selection
│   └── SettingsModal.tsx      # Settings configuration modal
└── services/
    └── geminiService.ts       # API integration service
```

---

## Component Specifications

### 1. App.tsx (Main Component)

**State Management**:
```typescript
- activeBots: BotId[]                    // Currently selected bots
- messages: Message[]                    // Chat history
- inputValue: string                     // Current input text
- attachments: Array<{file: File, preview: string}>
- isProcessing: boolean                  // Is sending message
- processingBots: BotId[]               // Bots currently thinking
- settingsOpen: boolean                 // Settings modal open/closed
- settings: AppSettings                 // API keys, models, system prompts
```

**Key Functions**:
- `handleSubmit()`: Send message to all active bots concurrently using Promise.all()
- `handleToggleBot()`: Toggle bot activation
- `handleFileSelect()`: Handle image uploads
- `fileToBase64()`: Convert File to base64 string
- Pass Gemini API key from settings.apiKeys[BotId.GEMINI] to geminiService

**Rendering**:
- Render Sidebar with settings prop
- Render message bubbles with avatars
- Show "thinking..." indicators for processing bots
- Render SettingsModal

---

### 2. Sidebar.tsx

**Props**:
```typescript
interface SidebarProps {
  activeBots: BotId[];
  onToggleBot: (botId: BotId) => void;
  onOpenSettings: () => void;
  settings: AppSettings;  // REQUIRED for API key validation
}
```

**Bot Disabling Logic** (CRITICAL):
```typescript
const hasApiKey = settings.apiKeys[bot.id] && settings.apiKeys[bot.id].trim() !== '';
const isDisabled = !hasApiKey;

// If disabled, show lock icon and "No API key" text
// Clicking disabled bot opens Settings modal
// Disabled bots have 50% opacity and cursor-not-allowed
```

**Visual Elements**:
- Logo at top: "O" in gradient circle (blue-500 to purple-600)
- "OmniChat" title
- List of bot buttons with:
  - Bot avatar image (w-8 h-8 rounded-full)
  - Bot name
  - Model name or "No API key" status
  - Green dot indicator for active bots
  - Lock icon overlay for disabled bots
  - Grayscale filter for inactive bots
- "Select All" / "Deselect All" button
- "Settings & Keys" button with gear icon

**Styling**:
- Dark theme (bg-gray-900, border-gray-800)
- Width: w-16 on mobile, w-64 on desktop
- Smooth hover effects (hover:bg-gray-800/50)

---

### 3. SettingsModal.tsx

**Props**:
```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}
```

**Layout**:
- Fixed overlay covering screen
- Modal centered with max-width-3xl
- Header with "Bot Configuration" title and close button
- Scrollable content area
- Warning box about API key storage

**For Each Bot**:
- Bot avatar and name
- **Model Dropdown**: Select from AVAILABLE_MODELS array
- **API Key Input**:
  - Password type input
  - Placeholder: "Enter your Gemini API key" for Gemini, "sk-..." for others
  - ALL bots including Gemini should have editable input field (no disabled field)
- **System Instruction**: Textarea (2 rows)
- All changes update settings state immediately via onChange handlers

**Styling**:
- White background with rounded-2xl
- Blue accents (border-blue-500, focus:ring-blue-500)
- Hover effects (hover:border-blue-300)

---

### 4. types.ts

Define these TypeScript types:

```typescript
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
  fallbackModel: string;
}

export interface Message {
  id: string;
  senderId: BotId | 'user';
  text: string;
  timestamp: number;
  attachments?: {
    type: 'image';
    data: string;
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
```

---

### 5. constants.ts

**BOTS Configuration**:
```typescript
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
    fallbackModel: 'gemini-2.5-pro',
  },
  [BotId.CLAUDE]: {
    id: BotId.CLAUDE,
    name: 'Claude',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Anthropic_logo.svg',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Anthropic',
    defaultModel: 'claude-sonnet-4-5-latest',
    fallbackModel: 'gemini-2.5-pro',
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
    fallbackModel: 'gemini-2.5-flash',
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
    fallbackModel: 'gemini-2.5-pro',
  },
};
```

**Available Models**:
```typescript
export const AVAILABLE_MODELS: Record<BotId, string[]> = {
  [BotId.GEMINI]: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-3-pro'],
  [BotId.OPENAI]: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-preview', 'o1-mini'],
  [BotId.CLAUDE]: ['claude-sonnet-4-5-latest', 'claude-haiku-4-5-latest', 'claude-opus-4-5-latest', 'claude-opus-4-1-latest'],
  [BotId.QWEN]: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-long'],
  [BotId.DEEPSEEK]: ['deepseek-chat', 'deepseek-reasoner'],
};
```

---

### 6. services/geminiService.ts

**Function Signature**:
```typescript
export const generateBotResponse = async (
  botId: BotId,
  userMessage: string,
  history: Message[],
  model: string,
  systemInstruction: string,
  attachments?: { data: string; mimeType: string }[],
  apiKey?: string
): Promise<string>
```

**Implementation Logic**:
1. **API Key Validation** (CRITICAL):
   ```typescript
   if (!apiKey) {
     return `Error: No API key provided for Gemini. Please add your API key in Settings.`;
   }
   const ai = new GoogleGenAI({ apiKey: apiKey });
   ```
   - NO fallback to process.env or .env.local
   - ONLY use apiKey parameter from settings

2. **Bot Simulation**:
   ```typescript
   const isSimulation = botId !== BotId.GEMINI;

   if (isSimulation) {
     activeModel = BOTS[botId].fallbackModel;
     finalSystemInstruction = `[IMPORTANT: You are roleplaying as ${BOTS[botId].name}.
       Adopt their specific tone, style, and known capabilities. Do not reveal you are Gemini.]

       ${systemInstruction}`;
   }
   ```
   - Use Gemini to simulate other bots (for CORS workaround)
   - Inject roleplay instruction into system prompt

3. **Image Handling**:
   ```typescript
   const parts: any[] = [];
   if (attachments && attachments.length > 0) {
     attachments.forEach(att => {
       parts.push({
         inlineData: {
           data: att.data,
           mimeType: att.mimeType
         }
       });
     });
   }
   parts.push({ text: userMessage });
   ```

4. **API Call**:
   ```typescript
   const response = await ai.models.generateContent({
     model: activeModel,
     contents: {
       role: 'user',
       parts: parts
     },
     config: {
       systemInstruction: finalSystemInstruction,
     }
   });
   return response.text || "No response text generated.";
   ```

5. **Error Handling**:
   - Catch all errors
   - Return user-friendly error messages
   - Log detailed errors to console

---

### 7. index.html

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OmniChat</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Tailwind Config -->
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              gray: {
                750: '#2d3748',
                850: '#1a202c',
                950: '#0d1117',
              }
            },
            animation: {
              'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
          }
        }
      }
    </script>

    <!-- Custom Scrollbar Styles -->
    <style>
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    </style>

    <!-- Import Maps for React & Dependencies -->
    <script type="importmap">
    {
      "imports": {
        "lucide-react": "https://aistudiocdn.com/lucide-react@^0.555.0",
        "@google/genai": "https://aistudiocdn.com/@google/genai@^1.30.0",
        "react/": "https://aistudiocdn.com/react@^19.2.0/",
        "react": "https://aistudiocdn.com/react@^19.2.0",
        "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/"
      }
    }
    </script>
  </head>
  <body class="bg-gray-50 text-gray-900 antialiased h-screen overflow-hidden">
    <div id="root" class="h-full w-full"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

---

### 8. vite.config.ts

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
```

---

### 9. package.json

```json
{
  "name": "omnichat-ai-group-chat",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.555.0",
    "@google/genai": "^1.30.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
```

---

## UI/UX Requirements

### Message Rendering
- **User messages**:
  - Blue background (bg-blue-600)
  - White text
  - Aligned to right
  - Rounded corners with sharp top-right corner
  - "YOU" avatar in gray circle

- **Bot messages**:
  - Bot-specific background color (from BOTS config)
  - Bot-specific border color
  - Aligned to left
  - Rounded corners with sharp top-left corner
  - Bot avatar image
  - Show model name as small badge
  - Clickable avatar opens Settings

- **Error messages**:
  - Red background (bg-red-50)
  - Red border (border-red-200)
  - Red text (text-red-800)

### Thinking Indicators
- Show for each bot in processingBots array
- Bot avatar with 80% opacity
- Spinning loader icon (Loader2 from lucide-react)
- "Thinking..." text in italic gray

### Input Area
- Gray background (bg-gray-100)
- Rounded-2xl
- Focus ring (focus-within:ring-2 ring-blue-100)
- Image attachment button with ImageIcon
- Textarea that expands with content (max-height: 32)
- Send button:
  - Blue when enabled (bg-blue-600)
  - Gray when disabled (bg-gray-200)
  - Hover scale effect (hover:scale-105)
  - Active scale effect (active:scale-95)

### Attachment Preview
- Display above input box
- Small thumbnail images (h-16 w-16)
- X button to remove (appears on hover)
- Red close button

---

## Critical Implementation Notes

### 1. Bot Disabling (MANDATORY)
```typescript
// In Sidebar.tsx
const hasApiKey = settings.apiKeys[bot.id] && settings.apiKeys[bot.id].trim() !== '';
const isDisabled = !hasApiKey;

// Clicking disabled bot opens settings
onClick={() => {
  if (!isDisabled) {
    onToggleBot(bot.id);
  } else {
    onOpenSettings();
  }
}}
```

### 2. API Key-Only Mode (MANDATORY)
```typescript
// In geminiService.ts
// NO fallback to process.env!
if (!apiKey) {
  return `Error: No API key provided for Gemini...`;
}
const ai = new GoogleGenAI({ apiKey: apiKey }); // Use ONLY apiKey parameter
```

### 3. Parallel Bot Processing (MANDATORY)
```typescript
// In App.tsx handleSubmit
await Promise.all(activeBots.map(async (botId) => {
  const responseText = await generateBotResponse(
    botId,
    currentText,
    messages,
    settings.models[botId],
    settings.systemPrompts[botId],
    apiAttachments,
    settings.apiKeys[BotId.GEMINI] // Pass Gemini API key
  );
  // Add response to messages
}));
```

### 4. Image Conversion
```typescript
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1]; // Remove data URL prefix
        resolve(base64);
      }
    };
    reader.onerror = error => reject(error);
  });
};
```

---

## Testing Checklist

After implementation, verify:
- ✅ Bots without API keys show lock icon and "No API key" text
- ✅ Clicking locked bot opens Settings modal
- ✅ Entering API key unlocks bot
- ✅ Only Gemini API key is required (others simulated)
- ✅ All active bots respond simultaneously
- ✅ Images can be uploaded and sent
- ✅ Messages display with correct colors per bot
- ✅ Settings modal updates work instantly
- ✅ Responsive design works on mobile
- ✅ Error handling shows user-friendly messages

---

## Additional Requirements

### Accessibility
- All buttons have hover states
- Disabled state clearly visible
- Tooltips show on bot hover
- Keyboard navigation support

### Performance
- Concurrent API calls using Promise.all()
- Smooth animations (transition-all duration-200)
- Auto-scroll to latest message
- Efficient re-rendering

### Error Handling
- API key validation errors
- Network errors
- Invalid image formats
- Display errors in chat as error messages

---

## Success Criteria

The application should:
1. Allow users to chat with multiple AI bots simultaneously
2. Require API keys to be entered via Settings UI (no .env.local)
3. Disable bots without API keys with clear visual indicators
4. Display beautiful, color-coded messages per bot
5. Support image uploads to Gemini
6. Provide instant settings updates
7. Work responsively on all screen sizes
8. Handle errors gracefully

---

This prompt provides complete specifications to recreate OmniChat. Follow all implementation details carefully, especially the bot disabling logic and API key-only authentication.
