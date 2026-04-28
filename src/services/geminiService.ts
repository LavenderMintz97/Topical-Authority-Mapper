import { GoogleGenAI, Type } from "@google/genai";
import { TopicalMap } from "../types";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please configure it in the Secrets panel.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function generateTopicalMap(seed: string): Promise<TopicalMap> {
  const ai = getGenAI();
  
  const prompt = `
    Build a comprehensive Topical Map based on Semantic SEO and Entity-Based SEO principles for the seed topic: "${seed}".
    
    Adhere to Koray Tugberk's style of topical authority. 
    Identify the Knowledge Graph connections.
    Generate a hierarchical structure: Macro-category > Pillar Page > Cluster Content > Supporting Entities.
    
    For every node, provide:
    - Search Intent (Informational, Transactional, Navigational).
    - Entity Connections (What other entities must be mentioned?).
    - Internal Linking Logic (Source -> Target).
    
    Exhaust sub-topics until topical saturation is reached.
    Prioritize semantic relevance over keyword volume.
    
    Return the data in the specified JSON schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          seed: { type: Type.STRING },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                type: { 
                  type: Type.STRING,
                  enum: ["pillar", "cluster", "supporting"]
                },
                intent: { 
                  type: Type.STRING,
                  enum: ["Informational", "Transactional", "Navigational", "Commercial"]
                },
                description: { type: Type.STRING },
                entities: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                linkingLogic: { type: Type.STRING }
              },
              required: ["id", "label", "type", "intent", "description", "entities", "linkingLogic"]
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                relationship: { type: Type.STRING }
              },
              required: ["source", "target", "relationship"]
            }
          }
        },
        required: ["seed", "nodes", "links"]
      }
    }
  });

  const text = response.text;
  
  if (!text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(text) as TopicalMap;
}
