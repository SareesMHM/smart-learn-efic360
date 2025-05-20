// src/components/MunimaChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import chatService from '../services/chatService';

export default function MunimaChat() {
  const { messages, addMessage, loading, setLoading, error, setError } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll chat to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input.trim() };
    addMessage(userMessage);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(input.trim());
      const botMessage = { sender: 'bot', text: response.reply || 'Sorry, I did not understand that.' };
      addMessage(botMessage);
    } catch (err) {
      setError('Failed to get response from Muṉimā. Please try again.');
      addMessage({ sender: 'bot', text: 'Sorry, something went wrong. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  // Send on Enter key (without Shift)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#DCF8C6' : '#EAEAEA',
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={2}
          style={styles.textarea}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={loading ? styles.sendButtonDisabled : styles.sendButton}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {error && <div style={styles.errorText}>{error}</div>}
    </div>
  );
}

const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '450px',
    width: '400px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif',
  },
  messagesContainer: {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  message: {
    maxWidth: '75%',
    padding: '10px 14px',
    borderRadius: '18px',
    marginBottom: '8px',
    fontSize: '14px',
    lineHeight: '1.4',
    boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
  },
  inputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#f9f9f9',
  },
  textarea: {
    flex: 1,
    resize: 'none',
    borderRadius: '20px',
    border: '1px solid #ccc',
    padding: '8px 14px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendButton: {
    marginLeft: '10px',
    padding: '0 20px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  sendButtonDisabled: {
    marginLeft: '10px',
    padding: '0 20px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#a5d6a7',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'not-allowed',
  },
  errorText: {
    color: 'red',
    padding: '5px 10px',
    fontSize: '12px',
    textAlign: 'center',
  },
};
