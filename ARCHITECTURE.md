# OmniChat - Architecture & Code Documentation

## 🎯 Project Overview

**OmniChat** is a multi-AI chat application that allows users to interact with multiple AI models simultaneously in a group chat interface. Users can add their API keys and chat with Gemini, ChatGPT, Claude, Qwen, and DeepSeek all at once.

### Key Features:
- 🤖 Multiple AI bots in one interface
- 🔑 User-configurable API keys via Settings UI
- 🎨 Beautiful, responsive design with dark sidebar
- 📷 Image upload support
- ⚙️ Customizable models and system prompts per bot
- 🔒 Bots without API keys are automatically disabled

---

## 📁 File Structure & Purpose

### **Root Files**

#### `index.html`
- **Purpose**: Main HTML entry point for the application
- **Key Features**:
  - Loads Tailwind CSS from CDN for styling
  - Defines import maps for React and libraries (using aistudiocdn.com)
  - Contains the root div where React app mounts
  - Loads `index.tsx` as the main script
- **Why it exists**: Every web app needs an HTML file to bootstrap the application

#### `index.tsx`
- **Purpose**: React application entry point
- **What it does**:
  - Creates React root and mounts the App component
  - Wraps app in StrictMode for development checks
- **Why it exists**: Initializes and renders the React application

#### `App.tsx` (Main Application Component)
- **Purpose**: Core application logic and state management
- **Key Responsibilities**:
  1. **State Management**:
     - `activeBots`: Which bots are currently selected
     - `messages`: Chat message history
     - `settings`: API keys, models, and system prompts
     - `processingBots`: Which bots are currently thinking
     - `attachments`: Image uploads

  2. **Message Handling**:
     - `handleSubmit`: Sends messages to all active bots
     - Processes bot responses concurrently (all bots respond simultaneously)
     - Handles errors gracefully

  3. **UI Rendering**:
     - Renders Sidebar, chat area, and SettingsModal
     - Shows message bubbles with bot avatars
     - Displays "thinking" indicators

- **Why it exists**: Central orchestrator that connects all components and manages app state

---

### **Component Files** (`/components/`)

#### `Sidebar.tsx`
- **Purpose**: Left sidebar for bot selection and navigation
- **Key Features**:
  - Lists all available AI bots with avatars
  - Shows active/inactive state with green dot
  - Displays lock icon 🔒 for bots without API keys
  - Shows "No API key" status text
  - Provides "Settings & Keys" button
  - "Select All" / "Deselect All" button

- **Bot Disabling Logic**:
  ```typescript
  const hasApiKey = settings.apiKeys[bot.id] && settings.apiKeys[bot.id].trim() !== '';
  const isDisabled = !hasApiKey;
  ```
  - Checks if bot has configured API key
  - Disables selection if no key
  - Clicking disabled bot opens Settings

- **Why it exists**: User needs easy access to toggle bots and configure settings

#### `SettingsModal.tsx`
- **Purpose**: Configuration modal for API keys, models, and system prompts
- **Sections for Each Bot**:
  1. **Model Selection**: Dropdown to choose AI model variant
  2. **API Key Input**: Password field to enter API key
  3. **System Instruction**: Textarea to customize bot behavior

- **Key Features**:
  - Modal overlay with backdrop blur
  - Scrollable content for many bots
  - Real-time updates (changes saved instantly)
  - Warning about API keys stored in browser session

- **Why it exists**: Users need a friendly UI to configure bots without editing code

---

### **Type Definitions** (`types.ts`)

#### `BotId` enum
```typescript
enum BotId {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  CLAUDE = 'claude',
  QWEN = 'qwen',
  DEEPSEEK = 'deepseek',
}
```
- **Purpose**: Type-safe bot identifiers
- **Why**: Prevents typos and provides autocomplete

#### `BotConfig` interface
```typescript
interface BotConfig {
  id: BotId;
  name: string;           // Display name (e.g., "ChatGPT")
  avatar: string;         // URL to bot logo
  color: string;          // Tailwind color class
  bgColor: string;        // Background color for messages
  borderColor: string;    // Border color for messages
  description: string;    // Company/provider name
  defaultModel: string;   // Default model selection
  fallbackModel: string;  // Model used for simulation via Gemini
}
```
- **Purpose**: Defines bot appearance and configuration
- **Why**: Centralizes bot metadata

#### `Message` interface
```typescript
interface Message {
  id: string;
  senderId: BotId | 'user';  // Who sent the message
  text: string;              // Message content
  timestamp: number;         // When it was sent
  attachments?: {            // Optional images
    type: 'image';
    data: string;            // base64 encoded
    mimeType: string;
  }[];
  isError?: boolean;         // If message is an error
}
```
- **Purpose**: Standard message structure
- **Why**: Consistent data format for rendering

#### `AppSettings` interface
```typescript
interface AppSettings {
  apiKeys: Record<BotId, string>;           // API keys per bot
  models: Record<BotId, string>;            // Selected model per bot
  systemPrompts: Record<BotId, string>;     // Custom instructions per bot
  activeBots: BotId[];                      // Currently active bots
}
```
- **Purpose**: User configuration structure
- **Why**: Type-safe settings management

---

### **Constants** (`constants.ts`)

#### `BOTS` object
```typescript
export const BOTS: Record<BotId, BotConfig> = {
  [BotId.GEMINI]: { /* config */ },
  [BotId.OPENAI]: { /* config */ },
  // ... etc
}
```
- **Purpose**: Configuration for all supported bots
- **Contains**: Names, avatars, colors, default models
- **Why**: Single source of truth for bot metadata

#### `AVAILABLE_MODELS` object
```typescript
export const AVAILABLE_MODELS: Record<BotId, string[]> = {
  [BotId.GEMINI]: ['gemini-2.5-flash', 'gemini-2.5-pro', ...],
  [BotId.CLAUDE]: ['claude-sonnet-4-5-latest', 'claude-haiku-4-5-latest', ...],
  // ... etc
}
```
- **Purpose**: List of available models per bot
- **Used by**: Settings modal dropdown
- **Why**: Users can select different model variants

---

### **Services** (`/services/`)

#### `geminiService.ts`
- **Purpose**: Handles all AI API calls
- **Main Function**: `generateBotResponse()`

**How it works**:

1. **API Key Validation**:
   ```typescript
   if (!apiKey) {
     return `Error: No API key provided for Gemini...`;
   }
   ```
   - Requires API key from settings (no env fallback)
   - Returns error if missing

2. **Bot Simulation**:
   ```typescript
   const isSimulation = botId !== BotId.GEMINI;

   if (isSimulation) {
     activeModel = BOTS[botId].fallbackModel;
     finalSystemInstruction = `[You are roleplaying as ${BOTS[botId].name}...]`;
   }
   ```
   - All non-Gemini bots are simulated using Gemini API
   - Uses system prompt to adopt bot persona
   - **Why**: Browser CORS restrictions prevent direct OpenAI/Anthropic calls

3. **Image Handling**:
   ```typescript
   if (attachments && attachments.length > 0) {
     attachments.forEach(att => {
       parts.push({
         inlineData: { data: att.data, mimeType: att.mimeType }
       });
     });
   }
   ```
   - Converts uploaded images to base64
   - Sends to Gemini's multimodal API

4. **Error Handling**:
   - Catches API errors
   - Returns user-friendly error messages
   - Logs detailed errors to console

- **Why it exists**: Centralized API communication logic

---

### **Configuration Files**

#### `package.json`
- **Purpose**: Node.js project configuration
- **Contains**:
  - Project metadata (name, version)
  - Dependencies (React, Vite, Gemini SDK, Lucide icons)
  - Scripts (`npm run dev`, `npm run build`)
- **Why**: Required for npm package management

#### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Key Settings**:
  - Target: ES2020
  - Module: ESNext
  - JSX: React
  - Strict mode enabled
- **Why**: Ensures proper TypeScript compilation

#### `vite.config.ts`
- **Purpose**: Vite bundler configuration
- **Key Settings**:
  - React plugin
  - Dev server on port 3000
  - Environment variable loading (`GEMINI_API_KEY`)
  - Defines `process.env.API_KEY` for browser
- **Why**: Configures development and build process

#### `.env.local` (Optional)
- **Purpose**: Environment variables (mostly deprecated now)
- **Contains**: API keys (though UI-based config is preferred)
- **Why**: Was for API key storage, now replaced by Settings UI

#### `.gitignore`
- **Purpose**: Tells Git which files to ignore
- **Ignores**:
  - `node_modules/`
  - `dist/`
  - `*.local` (including `.env.local`)
- **Why**: Prevents committing sensitive data and build artifacts

---

## 🔄 Data Flow

### **1. User Sends Message**

```
User types message + uploads images
          ↓
    handleSubmit()
          ↓
Creates user message object
          ↓
Adds to messages state
          ↓
Loops through activeBots
          ↓
Calls generateBotResponse() for each bot (parallel)
          ↓
Each bot's response added to messages
```

### **2. Bot Selection Flow**

```
User clicks bot in Sidebar
          ↓
  Checks hasApiKey
          ↓
If NO KEY: Opens Settings Modal
If HAS KEY: Toggles bot on/off
          ↓
Updates activeBots state
```

### **3. Settings Update Flow**

```
User opens Settings Modal
          ↓
Enters API key / selects model
          ↓
onChange handler fires
          ↓
Updates settings state
          ↓
Settings persisted in component state
          ↓
Sidebar re-renders (bots unlock)
```

---

## 🎨 UI Architecture

### **Layout Structure**
```
┌─────────────────────────────────────────────┐
│  App.tsx (Root Container)                   │
│  ┌──────────┬──────────────────────────┐   │
│  │ Sidebar  │  Main Chat Area          │   │
│  │          │  ┌────────────────────┐  │   │
│  │ Gemini ✓ │  │ Top Bar            │  │   │
│  │ ChatGPT  │  │ Active: Gemini...  │  │   │
│  │ Claude   │  └────────────────────┘  │   │
│  │ Qwen 🔒  │  ┌────────────────────┐  │   │
│  │ DeepSeek │  │ Messages           │  │   │
│  │          │  │ [User bubble]      │  │   │
│  │ Settings │  │ [Bot bubble]       │  │   │
│  └──────────┘  │ [Bot thinking...]  │  │   │
│                │                    │  │   │
│                └────────────────────┘  │   │
│                ┌────────────────────┐  │   │
│                │ Input Box          │  │   │
│                │ [Attach] [Send]    │  │   │
│                └────────────────────┘  │   │
│  ┌──────────────────────────────────┐  │   │
│  │ SettingsModal (when open)        │  │   │
│  └──────────────────────────────────┘  │   │
└─────────────────────────────────────────────┘
```

---

## 🔐 Security Considerations

### **API Key Storage**
- ✅ Stored in React component state (in-memory)
- ✅ Not sent anywhere except to respective AI APIs
- ❌ Lost when page refreshes (user must re-enter)
- 💡 Future: Could use `localStorage` for persistence

### **CORS Limitations**
- Browser blocks direct calls to OpenAI/Anthropic APIs
- Solution: Use Gemini to simulate other bots
- Production: Would use backend proxy server

---

## 🚀 How to Extend

### **Add a New Bot**

1. **Add to `BotId` enum** (types.ts):
   ```typescript
   NEWBOT = 'newbot'
   ```

2. **Add to `BOTS` config** (constants.ts):
   ```typescript
   [BotId.NEWBOT]: {
     id: BotId.NEWBOT,
     name: 'NewBot',
     avatar: 'https://...',
     // ... other config
   }
   ```

3. **Add to `AVAILABLE_MODELS`** (constants.ts):
   ```typescript
   [BotId.NEWBOT]: ['model-1', 'model-2']
   ```

4. Done! Sidebar and Settings will automatically include it.

### **Add Real API Integration**

Modify `geminiService.ts` to check bot type:
```typescript
if (botId === BotId.OPENAI && apiKey) {
  // Call real OpenAI API
  const openai = new OpenAI({ apiKey });
  // ...
}
```

---

## 📊 Component Hierarchy

```
App.tsx
├── Sidebar.tsx (settings prop passed)
│   └── Bot buttons (with lock icons if no API key)
│
├── Main Chat Area
│   ├── Top Bar (active agents display)
│   ├── Messages
│   │   ├── User messages
│   │   ├── Bot messages
│   │   └── Thinking indicators
│   └── Input Box
│       ├── Attachment button
│       ├── Textarea
│       └── Send button
│
└── SettingsModal.tsx
    └── Bot configurations (loop through BOTS)
        ├── Model dropdown
        ├── API key input
        └── System prompt textarea
```

---

## 🎯 Summary

This architecture provides:
- ✅ **Modularity**: Each component has a single responsibility
- ✅ **Type Safety**: TypeScript ensures correctness
- ✅ **Scalability**: Easy to add new bots
- ✅ **User-Friendly**: No code editing required
- ✅ **Security**: API keys only in user's browser
- ✅ **Modern Stack**: React + Vite + TypeScript

The code is organized to be maintainable, extensible, and user-friendly!
