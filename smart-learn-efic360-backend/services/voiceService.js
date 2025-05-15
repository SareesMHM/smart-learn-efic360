// services/voiceService.js

/**
 * Mock function to handle voice commands
 * In real use, connect to AI NLP or custom logic here
 */
async function handleCommand(command, sessionId) {
  // For demonstration, just echo the command back with a message
  return `Received your command: "${command}". (Session: ${sessionId || 'N/A'})`;
}

module.exports = {
  handleCommand,
};
