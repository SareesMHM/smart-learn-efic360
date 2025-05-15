// utils/sessionManager.js
const ChatSession = require('../models/chatSessionModel');

const SESSION_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7; // 7 days expiry

/**
 * Find or create a chat session for a user.
 * @param {string} userId
 * @returns {Promise<ChatSession>}
 */
async function getOrCreateSession(userId) {
  let session = await ChatSession.findOne({ userId });

  if (!session) {
    session = new ChatSession({ userId, messages: [] });
    await session.save();
  } else {
    // Optional: clear messages if session expired
    if (Date.now() - session.updatedAt.getTime() > SESSION_EXPIRY_MS) {
      session.messages = [];
      await session.save();
    }
  }
  return session;
}

/**
 * Append a message to the user's chat session.
 * @param {ChatSession} session
 * @param {{sender: string, text: string}} message
 * @returns {Promise<void>}
 */
async function addMessageToSession(session, message) {
  session.messages.push(message);
  await session.save();
}

/**
 * Clear a user's chat session messages (reset conversation).
 * @param {ChatSession} session
 * @returns {Promise<void>}
 */
async function clearSession(session) {
  session.messages = [];
  await session.save();
}

module.exports = {
  getOrCreateSession,
  addMessageToSession,
  clearSession,
};
