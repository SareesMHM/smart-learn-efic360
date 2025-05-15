// src/components/VoiceControlComponent.jsx
import React, { useState, useEffect } from 'react';
import voiceService from '../services/voiceService';
import '../styles/VoiceControlComponent.scss';

export default function VoiceControlComponent({ onCommand }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech Recognition API not supported in this browser.');
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTranscript(speechToText);
      onCommand && onCommand(speechToText);
      setListening(false);
    };

    recognition.onerror = (event) => {
      setError(`Error occurred in recognition: ${event.error}`);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div className="voice-control">
      <button onClick={startListening} disabled={listening}>
        {listening ? 'Listening...' : 'Start Voice Command'}
      </button>
      {transcript && <p className="transcript">You said: "{transcript}"</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
