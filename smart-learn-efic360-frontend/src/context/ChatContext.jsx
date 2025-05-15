// src/context/ChatContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am Muṉimā, your AI assistant. How can I help you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add a new message (from user or bot)
  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  // Reset chat conversation to initial state
  const resetChat = () => {
    setMessages([
      { sender: 'bot', text: 'Hi! I am Muṉimā, your AI assistant. How can I help you today?' }
    ]);
    setError(null);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        error,
        setLoading,
        setError,
        addMessage,
        resetChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use ChatContext easily
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
