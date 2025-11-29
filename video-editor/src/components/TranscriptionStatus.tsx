import { useProjectStore } from '../stores/projectStore';
import { useTranscriptionStore } from '../stores/transcriptionStore';
import './TranscriptionStatus.css';

export default function TranscriptionStatus() {
  const modelLoading = useTranscriptionStore((state) => state.modelLoading);
  const modelReady = useTranscriptionStore((state) => state.modelReady);
  const downloadProgress = useTranscriptionStore((state) => state.downloadProgress);
  const activeTranscriptions = useTranscriptionStore((state) => state.activeTranscriptions);
  const project = useProjectStore((state) => state.project);

  const getMediaName = (mediaId: string) => {
    return project?.media.find((m) => m.id === mediaId)?.name || 'Unknown';
  };

  const hasActiveTranscriptions = activeTranscriptions.size > 0;
  const activeItems = Array.from(activeTranscriptions.entries())
    .filter(([_, status]) => status.status !== 'idle' && status.status !== 'complete');

  return (
    <div className="transcription-status">
      {/* Model Loading Status */}
      {modelLoading && (
        <div className="status-overlay">
          <div className="status-card">
            <h3>Loading AI Model</h3>
            <p>Downloading Whisper Tiny for transcription...</p>
            {downloadProgress.map((item, index) => (
              <div key={index} className="download-item">
                <p className="download-file">{item.file}</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <p className="download-size">
                  {(item.loaded / 1024 / 1024).toFixed(1)} MB / {(item.total / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Ready Indicator */}
      <div className="status-bar">
        <div className="model-status">
          <span className={`status-indicator ${modelReady ? 'ready' : 'loading'}`} />
          <span className="status-text">
            {modelReady ? 'AI Model Ready' : 'Loading AI Model...'}
          </span>
        </div>

        {/* Active Transcriptions */}
        {activeItems.length > 0 && (
          <div className="active-transcriptions">
            <span className="transcription-count">
              {activeItems.length} transcription{activeItems.length !== 1 ? 's' : ''} in progress
            </span>
            {activeItems.map(([mediaId, status]) => (
              <div key={mediaId} className="transcription-item">
                <span className="transcription-name">{getMediaName(mediaId)}</span>
                <div className="transcription-progress">
                  <div className="mini-progress-bar">
                    <div
                      className="mini-progress-fill"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                  <span className="transcription-message">{status.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Count */}
        {hasActiveTranscriptions && (
          <div className="completed-count">
            {Array.from(activeTranscriptions.values()).filter((s) => s.status === 'complete').length} completed
          </div>
        )}
      </div>
    </div>
  );
}
