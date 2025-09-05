// services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function ensureKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Add it to your backend .env");
  }
}

async function getResponse(messages) {
  ensureKey();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  try {
    const result = await model.generateContent({ contents });
    const reply = result?.response?.text?.() ?? "…";
    return reply.trim();
  } catch (err) {
    // Log detailed error for server, send safe text to client
    console.error("Gemini error:", err?.response ?? err);
    throw new Error("Gemini request failed. Check GEMINI_API_KEY, model, or usage limits.");
  }
}

module.exports = { getResponse };
