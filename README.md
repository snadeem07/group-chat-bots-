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

2. Configure API Keys:
   - Open [.env.local](.env.local) file
   - **Required:** Set your `GEMINI_API_KEY` (get one from [Google AI Studio](https://aistudio.google.com/apikey))
   - **Optional:** Add other API keys to enable direct API calls:
     - `OPENAI_API_KEY` - for ChatGPT models
     - `CLAUDE_API_KEY` - for Anthropic Claude models
     - `QWEN_API_KEY` - for Alibaba Qwen models
     - `DEEPSEEK_API_KEY` - for DeepSeek models
   - *Note:* If optional keys are not provided, those bots will be simulated using Gemini

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000`
