import { GoogleGenAI } from '@google/genai';

// Initialize the Google Gen AI SDK
// Note: In a production app, the API key should ideally be handled 
// by a secure backend (e.g., Firebase Cloud Functions) instead of the frontend.
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

/**
 * Sends a message to the Gemini model and returns the response text.
 * @param {string} prompt - The user's input prompt.
 * @param {string} systemInstruction - Optional system instruction to guide the AI persona.
 * @returns {Promise<string>} The generated response text.
 */
export const generateAIResponse = async (prompt, systemInstruction = "You are the ActionLoop AI Coach. You help users maximize their productivity, focus, and long-term goal achievement. You are concise, encouraging, and highly actionable.") => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
};

/**
 * Uses Gemini to break down a high-level goal into actionable milestones.
 * @param {string} goalTitle - The title of the goal.
 * @returns {Promise<string[]>} Array of string milestones.
 */
export const generateMilestones = async (goalTitle) => {
  try {
    const prompt = `Break down this goal into 3-5 actionable, high-level milestones: "${goalTitle}". Return ONLY a valid JSON array of strings, with no markdown formatting or backticks. Example: ["Research", "Design", "Build"]`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text.trim();
    // In case the AI includes markdown backticks, strip them out
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error generating milestones:", error);
    throw error;
  }
};

/**
 * Sends conversation history to Gemini and handles potential function calls (Agentic behavior).
 */
export const generateAgenticResponse = async (historyText, systemInstruction = "You are the ActionLoop AI Coach, an incredibly human-like, highly engaging productivity coach. Your goal is to keep an ongoing dialogue with the user. If they ask to add tasks, use the addMultipleTasks tool to add them, and write a friendly text response explaining what you did. CRITICAL RULE: ALWAYS end your message with an engaging follow-up question (e.g. 'Which task do you want to start first?', 'How are you feeling about this workload?') so the chat naturally continues for multiple messages.") => {
  try {
    const addMultipleTasksTool = {
      functionDeclarations: [
        {
          name: "addMultipleTasks",
          description: "Adds one or more tasks to the user's task board simultaneously.",
          parameters: {
            type: "OBJECT",
            properties: {
              tasks: {
                type: "ARRAY",
                description: "List of tasks to create.",
                items: {
                  type: "OBJECT",
                  properties: {
                    title: { type: "STRING", description: "A concise title for the task." },
                    priority: { type: "STRING", description: "Priority level: High, Medium, or Low. Default to Medium if not specified." },
                    time: { type: "STRING", description: "Estimated time to complete the task (e.g., '1h', '30m')." },
                    deadline: { type: "STRING", description: "The deadline if specified (e.g., 'Tomorrow', 'May 14')." }
                  },
                  required: ["title"]
                }
              }
            },
            required: ["tasks"]
          }
        }
      ]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: historyText,
      config: {
        systemInstruction: systemInstruction,
        tools: [addMultipleTasksTool]
      }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      return {
        type: 'function_call',
        name: call.name,
        args: call.args,
        text: response.text || "I've planned out your activities and added them to your Tasks board! Let's get to work! 💪"
      };
    }

    return {
      type: 'text',
      content: response.text
    };
  } catch (error) {
    console.error("Error generating agentic response:", error);
    throw error;
  }
};
