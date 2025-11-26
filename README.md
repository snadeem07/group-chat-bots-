<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/15yzsvfIXHC_K3ykUAwzQouZcocp9fIWE

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`

4. Configure API Keys:
   - Click the **Settings & Keys** button (gear icon) in the sidebar
   - Enter your API keys for the bots you want to use:
     - **Gemini** - [Get key from Google AI Studio](https://aistudio.google.com/apikey)
     - **ChatGPT** - [Get key from OpenAI](https://platform.openai.com/api-keys)
     - **Claude** - [Get key from Anthropic](https://console.anthropic.com/)
     - **Qwen** - Get key from Alibaba Cloud
     - **DeepSeek** - Get key from DeepSeek
   - Bots without API keys will be disabled and show a lock icon
   - Your API keys are stored locally in your browser session
