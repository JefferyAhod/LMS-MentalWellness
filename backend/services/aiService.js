// backend/services/aiService.js

// --- AI Service Configuration for Gemini API ---
// Make sure GOOGLE_API_KEY is loaded from your .env file
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // This should be your Gemini API key
const GEMINI_API_TEXT_MODEL = "gemini-2.5-flash-preview-05-20";
const IMAGEN_API_IMAGE_MODEL = "imagen-3.0-generate-002";

// Common function for calling an API with exponential backoff
const callApiWithBackoff = async (url, options, retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return await response.json();
            } else if (response.status === 429 || response.status >= 500) { // Retry on Too Many Requests or Server Errors
                console.warn(`API call failed with status ${response.status}. Retrying... (Attempt ${i + 1}/${retries})`);
            } else {
                // Attempt to parse error message from response body
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error(`Network or unexpected error on attempt ${i + 1}: ${error.message}`);
        }
        if (i < retries - 1) {
            await new Promise(res => setTimeout(res, delay));
            delay *= 2; // Exponential backoff
        }
    }
    throw new Error(`Max retries (${retries}) exceeded for API call to ${url}.`);
};

// @desc Get chat completion from Gemini AI model
// @param {Array} messages - Array of message objects { role: string, content: string }
// @param {number} temperature - Controls randomness. Lower is more deterministic.
// @param {number} top_p - Controls diversity.
// @param {Object} responseFormat - Optional, e.g., { type: "json_object" } for structured responses
export const getChatCompletion = async (
  messages,
  temperature = 0.7,
  top_p = 1,
  model = GEMINI_API_TEXT_MODEL, // Default to flash model for chat completions
  responseFormat = undefined
) => {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY environment variable is not set for Gemini AI service.");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;

  const payload = {
    contents: messages.map(msg => {
      // Gemini API expects 'user' or 'model' roles.
      // If a 'system' role is used, it should generally be mapped to 'user' with proper context,
      // or handled as part of the initial user prompt. For simplicity,
      // this maps 'system' to 'user' for current chat models.
      const role = msg.role === 'system' ? 'user' : (msg.role === 'assistant' ? 'model' : 'user');
      return {
        role: role,
        parts: [{ text: msg.content }]
      };
    }),
    generationConfig: {
      temperature: temperature,
      topP: top_p,
      // responseMimeType is used for structured outputs like JSON
      responseMimeType: responseFormat && responseFormat.type === 'json_object' ? 'application/json' : undefined,
    },
  };

  try {
    const result = await callApiWithBackoff(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const text = result.candidates[0].content.parts[0].text;
      return text;
    } else {
      console.error('Gemini API returned no content or unexpected format:', result);
      throw new Error('No content received from Gemini API or unexpected response structure.');
    }
  } catch (error) {
    console.error('Error getting chat completion from Gemini:', error);
    throw error;
  }
};

// @desc Generate image using Imagen 3.0 via Google Generative Language API
// @param {string} prompt - The text prompt for image generation.
export const generateImageWithImagen = async (prompt) => {
    if (!GOOGLE_API_KEY) {
        throw new Error("GOOGLE_API_KEY environment variable is not set for Imagen image generation.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_API_IMAGE_MODEL}:predict?key=${GOOGLE_API_KEY}`;

    const payload = {
        instances: {
            prompt: prompt
        },
        parameters: {
            sampleCount: 1
        }
    };

    try {
        const result = await callApiWithBackoff(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            const base64Data = result.predictions[0].bytesBase64Encoded;
            return `data:image/png;base64,${base64Data}`;
        } else {
            console.error('Imagen 3.0 API returned no image data or unexpected format:', result);
            throw new Error('No image data received from Imagen API or unexpected response structure.');
        }
    } catch (error) {
        console.error('Error generating image with Imagen:', error);
        throw error;
    }
};
