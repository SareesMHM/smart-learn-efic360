// src/services/voiceService.js

// This is a placeholder if you want to extend with backend processing,
// e.g., sending voice commands to a server for advanced processing

/**
 * Process voice command on backend (optional)
 * @param {string} command
 * @returns {Promise<Object>} response from backend AI
 */
const processVoiceCommand = async (command) => {
  // Example API call, adjust URL as needed
  // return axios.post('/voice/command', { command }).then(res => res.data);

  // For now, just mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ response: `You said: ${command}` });
    }, 1000);
  });
};

export default {
  processVoiceCommand,
};
