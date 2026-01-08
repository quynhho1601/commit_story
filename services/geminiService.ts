import { GoogleGenAI, Modality } from "@google/genai";
import { AnalysisResult } from "../types";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeRepo = async (repoUrl: string): Promise<AnalysisResult> => {
  const ai = getAiClient();
  
  const prompt = `
    Analyze the GitHub repository ${repoUrl} (last 5-10 commits).
    Create a chaotic, funny, "Gen Z" style story about the recent development activity.
    Use internet slang (e.g., "no cap", "cooked", "bet", "real ones know", "lgtm", "ship it").
    
    Structure the response as a JSON object with:
    1. "script": A 20-30 second narrator script. It should sound like a TikTok storytime voiceover.
    2. "scenes": An array of EXACTLY 6 scenes. Each scene has:
       - "description": Context for the scene.
       - "visualPrompt": A specific prompt for an AI image generator to create a funny MEME image (no text in image) representing this part of the story. Use words like "deep fried meme", "surreal", "chaos", "lo-fi", "vaporwave".
       - "caption": A short, punchy text overlay for this scene (UPPERCASE, meme font style).
    3. "summary": One sentence summary.
    4. "commits": An array of the actual commits you found and analyzed (up to 5). Include objects with fields: "message" (string), "author" (string), "date" (string, approximate is fine).

    Output STRICTLY JSON.
    \`\`\`json
    { ... }
    \`\`\`
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });

  const text = response.text || "";
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch) throw new Error("Failed to parse analysis JSON");
  
  return JSON.parse(jsonMatch[1]);
};

export const generateMemeImages = async (prompts: string[]): Promise<string[]> => {
  const ai = getAiClient();
  
  // Run in parallel
  const promises = prompts.map(async (prompt) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `Digital art, meme aesthetic, funny, high quality, 4k: ${prompt}` }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return ""; // Fail gracefully
    } catch (e) {
      console.error("Image gen failed", e);
      return ""; 
    }
  });

  const results = await Promise.all(promises);
  return results.filter(img => !!img);
};

export const generateNarration = async (text: string): Promise<AudioBuffer> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");

  // Decode PCM
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Helper to decode Base64
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Helper to convert raw PCM (24kHz, mono usually) to AudioBuffer
  const sampleRate = 24000;
  const dataInt16 = new Int16Array(bytes.buffer);
  const channelData = new Float32Array(dataInt16.length);
  
  // Normalize Int16 to Float32
  for (let i = 0; i < dataInt16.length; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }

  const audioBuffer = audioCtx.createBuffer(1, channelData.length, sampleRate);
  audioBuffer.copyToChannel(channelData, 0);

  return audioBuffer;
};
