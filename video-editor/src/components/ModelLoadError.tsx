import './ModelLoadError.css';

interface ModelLoadErrorProps {
  onRetry: () => void;
}

export default function ModelLoadError({ onRetry }: ModelLoadErrorProps) {
  return (
    <div className="model-load-error-overlay">
      <div className="error-card">
        <div className="error-icon">⚠️</div>
        <h2>AI Model Loading Failed</h2>
        <p className="error-message">
          The Whisper AI model failed to download or initialize.
        </p>

        <div className="error-details">
          <h3>Common Causes:</h3>
          <ul>
            <li>Slow or interrupted internet connection</li>
            <li>Browser compatibility issues</li>
            <li>CORS or security policy blocking the download</li>
          </ul>
        </div>

        <div className="error-actions">
          <button className="retry-btn" onClick={onRetry}>
            🔄 Retry Loading Model
          </button>
          <button className="continue-btn" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>

        <p className="error-note">
          Note: Video editing will still work, but transcription features will be unavailable until the model loads successfully.
        </p>
      </div>
    </div>
  );
}
