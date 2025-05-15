
// services/chatService.js
const axios = require('axios');

async function getChatResponse(message, sessionId) {
  const response = await axios.post('/ai/chat', { message, sessionId });
  return response.data.reply;
}

module.exports = {
  getChatResponse,
};
