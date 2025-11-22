import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation } from "../types";
import { searchTMDB } from "./tmdbService";

const getClient = () => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Function to get AI-powered recommendations based on query
const getAIRecommendations = async (query: string, category: string): Promise<Recommendation[]> => {
  const ai = getClient();
  if (!ai) return [];

  const systemInstruction = `
    You are a movie and TV show recommendation engine for a streaming platform called "Slasshy".
    Your goal is to provide 3 distinct recommendations based on the user's query and the selected category (${category}).
    Return the data in a structured JSON format.
    For each recommendation, provide a title, a release year, a short description (max 20 words), and a playful "reason" why it matches the query.
    Also generate a random 5-digit number as a "fakeId" to simulate a database ID.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              year: { type: Type.STRING },
              description: { type: Type.STRING },
              reason: { type: Type.STRING },
              fakeId: { type: Type.INTEGER },
            },
            required: ["title", "year", "description", "reason", "fakeId"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as Recommendation[];
    }
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

// Main function that can use either AI or TMDB search depending on the needs
export const getRecommendations = async (query: string, category: string): Promise<Recommendation[]> => {
  // For now, we'll use TMDB search for real data, but we could blend with AI recommendations
  const tmdbResults = await searchTMDB(query, category as 'movies' | 'tv' | 'anime');

  // If TMDB doesn't return results, fall back to AI recommendations
  if (tmdbResults.length === 0) {
    return getAIRecommendations(query, category);
  }

  return tmdbResults;
};
