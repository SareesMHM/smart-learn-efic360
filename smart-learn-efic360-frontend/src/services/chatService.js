// src/services/chatService.js
import axios from './api'; // Axios instance configured with baseURL

/**
 * Send a chat message to the backend and receive a reply
 * @param {string} message - The user's chat message
 * @param {string} [sessionId] - Optional session identifier to maintain context
 * @returns {Promise<{ reply: string }>} The chatbot's reply
 */
const sendMessage = async (message, sessionId = null) => {
  const payload = { message };
  if (sessionId) {
    payload.sessionId = sessionId;
  }
  
  const response = await axios.post('/chat/send-message', payload);
  return response.data; // expected: { reply: 'AI response text' }
};

export default {
  sendMessage,
};
