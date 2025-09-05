// src/pages/ChatbotPage.jsx
import React, { useEffect, useRef, useState } from "react";
import chatService from "../services/chatService";
import "../styles/ChatbotPage.scss";

const getOrCreateSessionId = () => {
  let sid = localStorage.getItem("munima_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem("munima_session_id", sid);
  }
  return sid;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am Munima, your AI assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(getOrCreateSessionId());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // show user message immediately
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const { reply } = await chatService.sendMessage(text, sessionIdRef.current);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      console.error(err);
      const serverMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, { sender: "bot", text: serverMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  {loading && (
  <div className="chat-message bot-message typing">
    <span></span><span></span><span></span>
  </div>
)}


  return (
    <div className="chatbot-container">
      <div className="chatbot-header">Munima — AI Assistant</div>

      <div className="chatbot-messages">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-message ${m.sender === "user" ? "user-message" : "bot-message"}`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="chat-message bot-message">Typing…</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-area">
        <textarea
          placeholder="Type your message… (Shift+Enter for new line)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={2}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  );
}
