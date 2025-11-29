import { useTranscriptionStore } from '../stores/transcriptionStore';
import { useUIStore } from '../stores/uiStore';
import './TranscriptPanel.css';

export default function TranscriptPanel() {
  const selectedMediaId = useUIStore((state) => state.selectedMediaId);
  const transcript = useTranscriptionStore((state) =>
    selectedMediaId ? state.getTranscript(selectedMediaId) : undefined
  );
  const activeTranscription = useTranscriptionStore((state) =>
    selectedMediaId ? state.activeTranscriptions.get(selectedMediaId) : undefined
  );

  if (!selectedMediaId) {
    return (
      <div className="transcript-panel empty">
        <p>Select a video to view transcript</p>
      </div>
    );
  }

  if (activeTranscription && activeTranscription.status !== 'complete') {
    return (
      <div className="transcript-panel processing">
        <div className="processing-status">
          <div className="spinner"></div>
          <h3>Processing Transcript...</h3>
          <p>{activeTranscription.message}</p>
          {activeTranscription.progress > 0 && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${activeTranscription.progress}%` }}
                />
              </div>
              <span>{Math.round(activeTranscription.progress)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="transcript-panel empty">
        <p>No transcript available</p>
        <p className="hint">Transcription will start automatically</p>
      </div>
    );
  }

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="transcript-panel">
      <div className="transcript-header">
        <h3>Transcript</h3>
        <div className="transcript-actions">
          <button className="export-btn" title="Export Transcript">
            Export
          </button>
        </div>
      </div>

      <div className="transcript-content">
        {transcript.segments.map((segment) => (
          <div key={segment.id} className="transcript-segment">
            <div className="segment-header">
              <span className="timestamp">
                {formatTimestamp(segment.start)}
              </span>
              <span className="speaker-label">
                {transcript.speakers.find(s => s.id === segment.speakerId)?.displayName || 'Speaker'}
              </span>
              <span className="confidence-badge" style={{
                backgroundColor: segment.confidence > 0.8 ? '#10b981' : segment.confidence > 0.6 ? '#f59e0b' : '#ef4444'
              }}>
                {Math.round(segment.confidence * 100)}%
              </span>
            </div>
            <p className="segment-text">{segment.text}</p>
          </div>
        ))}

        {transcript.segments.length === 0 && (
          <div className="empty-transcript">
            <p>No speech detected in this video</p>
          </div>
        )}
      </div>

      <div className="transcript-footer">
        <p className="transcript-info">
          Generated with {transcript.modelVersion} · {transcript.segments.length} segments
        </p>
      </div>
    </div>
  );
}
