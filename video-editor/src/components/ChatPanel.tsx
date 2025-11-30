import { useEffect, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import './ChatPanel.css';

export default function ChatPanel() {
  const {
    messages,
    modelReady,
    modelLoading,
    modelError,
    modelLoadingProgress,
    modelLoadingMessage,
    initialize,
    sendMessage,
  } = useChatStore();
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (!modelReady && !modelLoading) {
      initialize();
    }
  }, [initialize, modelReady, modelLoading]);

  const handleSend = () => {
    if (prompt.trim()) {
      sendMessage(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>Chat</h3>
        <div className="status">
          {modelLoading && (
            <div className="loading-status">
              <span>{modelLoadingMessage}</span>
              <progress value={modelLoadingProgress} max="100" />
            </div>
          )}
          {modelReady && 'Ready'}
          {modelError && <span className="error">{modelError}</span>}
        </div>
      </div>
      <div className="chat-content">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {messages.length === 0 && !modelLoading && (
          <div className="empty-chat">
            <p>Ask me anything about the video! Try: <code>/find "some text"</code></p>
          </div>
        )}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          placeholder={modelReady ? 'Type your message...' : 'Model is loading...'}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={!modelReady || modelLoading}
        />
        <button onClick={handleSend} disabled={!modelReady || modelLoading}>
          Send
        </button>
      </div>
    </div>
  );
}
