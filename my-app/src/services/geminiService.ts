
import { GoogleGenAI, Type } from "@google/genai";
import { AIScenarioResponse } from "../types";

// Removed redundant API key check and local variable to comply with strict process.env.API_KEY usage.
export const generateScenarioDraft = async (topic: string): Promise<AIScenarioResponse | null> => {
  try {
    // Initialization must use the named parameter and process.env.API_KEY directly.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-pro-preview for complex reasoning and content generation tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create a medical simulation scenario about: ${topic}. 
      Include 3-4 distinct phases (states).
      Define 2-3 key roles.
      For each state, provide 1-2 clinical events attached to specific roles.
      For each event, list a mix of tasks:
      - "todo": Standard actions (e.g. "Check Pulse").
      - "decision": Critical choices (e.g. "Administer Adenosine").
      - "must-not": Contraindicated actions (e.g. "Shock Asystole").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            handover: { type: Type.STRING },
            mission: { type: Type.STRING },
            roles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING }
                }
              }
            },
            states: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  events: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        roleName: { type: Type.STRING, description: "Name of the role performing this event" },
                        todos: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              content: { type: Type.STRING },
                              type: { type: Type.STRING, enum: ["todo", "decision", "must-not"] }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Access the text property directly instead of calling it as a function.
    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as AIScenarioResponse;

  } catch (error) {
    console.error("Failed to generate scenario:", error);
    return null;
  }
};
