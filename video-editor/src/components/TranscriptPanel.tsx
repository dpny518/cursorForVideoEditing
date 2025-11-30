import { useState } from 'react';
import { useTranscriptionStore } from '../stores/transcriptionStore';
import { useUIStore } from '../stores/uiStore';
import { useTimelineStore } from '../stores/timelineStore';
import { useProjectStore } from '../stores/projectStore';
import './TranscriptPanel.css';

export default function TranscriptPanel() {
  const selectedMediaId = useUIStore((state) => state.selectedMediaId);
  const transcript = useTranscriptionStore((state) =>
    selectedMediaId ? state.getTranscript(selectedMediaId) : undefined
  );
  const activeTranscription = useTranscriptionStore((state) =>
    selectedMediaId ? state.activeTranscriptions.get(selectedMediaId) : undefined
  );
  const addClipToTimeline = useTimelineStore((state) => state.addClipToTimeline);
  const getMediaItem = useProjectStore((state) => state.getMediaItem);

  const [selection, setSelection] = useState<{ startWordId: string | null; endWordId: string | null }>({ startWordId: null, endWordId: null });
  const [isSelecting, setIsSelecting] = useState(false);

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

  const allWords = transcript.segments.flatMap(s => s.words);

  const handleMouseDown = (wordId: string) => {
    setIsSelecting(true);
    setSelection({ startWordId: wordId, endWordId: wordId });
  };

  const handleMouseEnter = (wordId: string) => {
    if (isSelecting) {
      setSelection(prev => ({ ...prev, endWordId: wordId }));
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const getWordById = (wordId: string) => {
    return allWords.find(w => w.id === wordId);
  }

  const isWordSelected = (wordId: string) => {
    if (!selection.startWordId || !selection.endWordId) return false;

    const startIndex = allWords.findIndex(w => w.id === selection.startWordId);
    const endIndex = allWords.findIndex(w => w.id === selection.endWordId);
    const currentIndex = allWords.findIndex(w => w.id === wordId);

    if (startIndex === -1 || endIndex === -1 || currentIndex === -1) return false;

    const [start, end] = [startIndex, endIndex].sort((a, b) => a - b);
    return currentIndex >= start && currentIndex <= end;
  };

  const handleAddToTimeline = () => {
    if (!selection.startWordId || !selection.endWordId || !selectedMediaId) return;
  
    const startIndex = allWords.findIndex(w => w.id === selection.startWordId);
    const endIndex = allWords.findIndex(w => w.id === selection.endWordId);
  
    if (startIndex === -1 || endIndex === -1) return;
  
    const [start, end] = [startIndex, endIndex].sort((a, b) => a - b);
    const startWord = allWords[start];
    const endWord = allWords[end];
  
    const mediaItem = getMediaItem(selectedMediaId);
    if (!mediaItem) return;
  
    addClipToTimeline(
      selectedMediaId,
      mediaItem.name,
      mediaItem.duration,
      startWord.start,
      endWord.end
    );
  
    // Reset selection
    setSelection({ startWordId: null, endWordId: null });
  };

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
          <button 
            className="add-to-timeline-btn"
            disabled={!selection.startWordId}
            onClick={handleAddToTimeline}
          >
            Add to Timeline
          </button>
          <button className="export-btn" title="Export Transcript">
            Export
          </button>
        </div>
      </div>

      <div className="transcript-content" onMouseUp={handleMouseUp}>
        {transcript.segments.map((segment) => (
          <div key={segment.id} className="transcript-segment">
            <div className="segment-header">
              <span className="timestamp">
                {formatTimestamp(segment.start)}
              </span>
              <span className="speaker-label">
                {transcript.speakers.find(s => s.id === segment.speakerId)?.displayName || 'Speaker'}
              </span>
            </div>
            <p className="segment-text">
              {segment.words.map(word => (
                <span
                  key={word.id}
                  className={`word ${isWordSelected(word.id) ? 'selected' : ''}`}
                  onMouseDown={() => handleMouseDown(word.id)}
                  onMouseEnter={() => handleMouseEnter(word.id)}
                >
                  {word.text}{' '}
                </span>
              ))}
            </p>
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
