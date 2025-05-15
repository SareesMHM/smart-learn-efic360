// services/aiService.js
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,  // Make sure to set this in your environment variables
});

const openai = new OpenAIApi(configuration);

/**
 * Sends the conversation history to OpenAI's GPT model and returns the generated response.
 * @param {Array} messages - Array of message objects with `role` ('user'|'assistant') and `content` (string)
 * @returns {Promise<string>} AI-generated reply text
 */
async function getResponse(messages) {
  try {
    // OpenAI Chat Completion API expects messages in format [{role, content}, ...]
    const response = await openai.createChatCompletion({
      model: 'gpt-4',       // or 'gpt-3.5-turbo' or whichever model you prefer
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    });

    const reply = response.data.choices[0].message.content.trim();
    return reply;
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    throw new Error('Failed to get AI response');
  }
}

module.exports = {
  getResponse,
};
