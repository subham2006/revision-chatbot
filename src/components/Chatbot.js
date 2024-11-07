import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css'; // Add this import

const API_BASE_URL = 'http://localhost:3001';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [csvData, setCsvData] = useState([]);

  useEffect(() => {
    // Load CSV data from server
    axios.get(`${API_BASE_URL}/api/csv-data`)
      .then(response => {
        console.log('CSV data loaded:', response.data);
        setCsvData(response.data);
      })
      .catch(error => console.error('Error loading CSV:', error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, user: true };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, { message: input });
      const botMessage = { text: response.data.message, user: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setInput('');
  };

  return (
    <div className="chatbot-container">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.user ? 'user' : 'bot'}`}>
            <div className="message-content">{message.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
