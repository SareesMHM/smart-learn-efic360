// src/services/chatService.js
import axios from './api'; // axios instance configured with baseURL, headers, etc.

const sendMessage = async (message, userId = null) => {
  try {
    const payload = { message };
    if (userId) {
      payload.userId = userId; // optional: track user/session
    }
    const response = await axios.post('/chat/send-message', payload);
    return response.data; // expected { reply: '...' }
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export default {
  sendMessage,
};
