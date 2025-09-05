// src/services/chatService.js
import axios from "axios";

const root = axios.create({
  baseURL: import.meta.env.VITE_ROOT_API_BASE_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

export async function sendMessage(message, sessionId) {
  const res = await root.post("/chat/send-message", { message, sessionId });
  return res.data; // { reply }
}
export default { sendMessage };
