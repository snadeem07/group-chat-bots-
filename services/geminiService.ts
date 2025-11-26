import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { BotId, Message } from "../types";
import { BOTS } from "../constants";

export const generateBotResponse = async (
  botId: BotId,
  userMessage: string,
  history: Message[],
  model: string,
  systemInstruction: string,
  attachments?: { data: string; mimeType: string }[],
  apiKey?: string
): Promise<string> => {

  // REAL IMPLEMENTATION NOTE:
  // In a production app, we would use the official SDKs for OpenAI, Anthropic, etc.
  // OR a proxy backend to avoid CORS issues.
  //
  // FOR THIS DEMO:
  // We utilize the Gemini API to *simulate* the other bots if no specific API key is provided for them,
  // or if we are in a browser environment where direct calls to other APIs might be blocked by CORS.
  // We use the `systemInstruction` to align the persona.

  // Use API key from settings only (no fallback to environment)
  if (!apiKey) {
    return `Error: No API key provided for Gemini. Please add your API key in Settings.`;
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  const isSimulation = botId !== BotId.GEMINI;

  try {
    
    // If we are simulating another bot using Gemini
    let activeModel = model;
    let finalSystemInstruction = systemInstruction;

    if (isSimulation) {
      activeModel = BOTS[botId].fallbackModel;
      finalSystemInstruction = `[IMPORTANT: You are roleplaying as ${BOTS[botId].name}. 
      Adopt their specific tone, style, and known capabilities. Do not reveal you are Gemini.]\n\n${systemInstruction}`;
    }

    // Construct request parts
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

    // Prepare previous history (simplified for this demo to last few turns to save context)
    // In a real app, map 'user' -> 'user', 'bot' -> 'model'
    // We'll just skip history for the strictly functional request to keep it simple and robust
    // or add it if needed. For now, single turn + system instruction is very effective.

    const response: GenerateContentResponse = await ai.models.generateContent({
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

  } catch (error: any) {
    console.error(`Error generating response for ${botId}:`, error);
    if (error.message?.includes("API key")) {
        return `Error: Missing or invalid API Key for ${BOTS[botId].name}. Please check Settings.`;
    }
    return `Error: ${error.message || "Unknown error occurred"}`;
  }
};