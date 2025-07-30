// backend/services/aiService.js
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// --- AI Service Configuration ---
const GITHUB_AI_TOKEN = process.env.GITHUB_OPENAI_API_KEY 
const GITHUB_AI_ENDPOINT = "https://models.github.ai/inference";
const GITHUB_AI_MODEL = "openai/gpt-4.1"; 

// Initialize the AI client once
const aiClient = ModelClient(
  GITHUB_AI_ENDPOINT,
  new AzureKeyCredential(GITHUB_AI_TOKEN),
);


export const getChatCompletion = async (
  messages,
  temperature = 0.7,
  top_p = 1,
  model = GITHUB_AI_MODEL
) => {
  if (!GITHUB_AI_TOKEN) {
    throw new Error("GITHUB_TOKEN environment variable is not set. Cannot connect to AI service.");
  }

  const response = await aiClient.path("/chat/completions").post({
    body: {
      messages: messages,
      temperature: temperature,
      top_p: top_p,
      model: model
    }
  });

  if (isUnexpected(response)) {
    console.error("GitHub AI API Error Response:", response.body.error);
    throw new Error(`AI API Error: ${response.body.error.message || 'Unknown error occurred while calling AI service.'}`);
  }

  // Ensure response structure is as expected before accessing content
  if (!response.body || !response.body.choices || response.body.choices.length === 0 || !response.body.choices[0].message) {
    console.error("Unexpected AI API Response Structure:", response.body);
    throw new Error("AI API returned an unexpected response structure.");
  }

  return response.body.choices[0].message.content;
};

// You can add other specific AI interactions here if needed in the future,
// for example, image generation or embedding if your model supports them.