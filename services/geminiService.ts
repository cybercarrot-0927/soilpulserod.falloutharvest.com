import { GoogleGenAI } from "@google/genai";
import { SoilStatus, SoilData } from "../types";

const getSystemPrompt = (status: SoilStatus) => {
  return `
    You are the AI interface for the "SoilPulse Rod", a futuristic agricultural tool in the "Fallout Harvest" timeline.
    The world is recovering from radioactive contamination. Fungi are used to detoxify soil.
    
    Your Role: Analyze the sensor data and provide a brief, professional, yet immersive status report to the farmer.
    
    Current Soil Status: ${status}
    
    Tone: Scientific, cautious, but hopeful (if recovering/ready). Industrial design aesthetic.
    Length: Maximum 2-3 sentences.
    
    Context per status:
    - UNSAFE: High radiation, low fungal activity. Do not plant.
    - RECOVERING: Active mycelium network detected. Detoxification in progress. Wait.
    - READY: Soil structure restored. Radiation negligible. Safe for planting.
  `;
};

export const generateSoilAnalysis = async (status: SoilStatus, data: SoilData): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "AI Interface Offline: API Key missing. Showing raw sensor data only.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Sensor Readings:
      - Radiation: ${data.radiationLevel} uSv/h
      - Mycelium Density: ${data.myceliumDensity}%
      - Soil Structure Integrity: ${data.soilStructure}%
      
      Provide the field analysis report.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getSystemPrompt(status),
        maxOutputTokens: 150,
      }
    });

    return response.text || "Analysis data corrupted.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection to Fallout Harvest Network failed. Local diagnostics only.";
  }
};