import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateNarrative(gameState: any) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, evocative 1-sentence space exploration log entry for a game called Fractal Galaxy Generator. 
      The player has ${gameState.galaxies.length} galaxies and is focusing on ${gameState.activeTab}. 
      Make it poetic and sci-fi. Example: "The nebula whispers of ancient civilizations lost to the void."`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });

    return response.text?.trim() || "The stars remain silent for now.";
  } catch (error: any) {
    // Gracefully handle quota exhaustion without spamming console
    if (error?.status === 429 || error?.message?.includes('429')) {
       return "Communication array throttled by local star interference.";
    }
    console.error("Gemini Error:", error);
    return "A strange interference disrupts the communication logs.";
  }
}