import { useRef, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useTranscriptionStore } from '../stores/transcriptionStore';
import { useUIStore } from '../stores/uiStore';
import './MediaBin.css';

export default function MediaBin() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const project = useProjectStore((state) => state.project);
  const addMediaItem = useProjectStore((state) => state.addMediaItem);
  const transcribeAudio = useTranscriptionStore((state) => state.transcribeAudio);
  const activeTranscriptions = useTranscriptionStore((state) => state.activeTranscriptions);
  const selectedMediaId = useUIStore((state) => state.selectedMediaId);
  const setSelectedMediaId = useUIStore((state) => state.setSelectedMediaId);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Only accept video/audio files
      if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
        alert(`${file.name} is not a video or audio file`);
        continue;
      }

      try {
        // Add media to project
        const mediaItem = await addMediaItem(file);
        console.log('Media added:', mediaItem);

        // Extract audio and transcribe in background
        extractAndTranscribe(file, mediaItem.id);
      } catch (error) {
        console.error('Error adding media:', error);
        alert(`Failed to load ${file.name}`);
      }
    }
  };

  const extractAndTranscribe = async (file: File, mediaId: string) => {
    try {
      // Create audio context to extract audio data
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Convert to mono Float32Array for Whisper
      let audio: Float32Array;
      if (audioBuffer.numberOfChannels === 1) {
        audio = audioBuffer.getChannelData(0);
      } else {
        // Mix down to mono
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = audioBuffer.getChannelData(1);
        audio = new Float32Array(leftChannel.length);
        for (let i = 0; i < leftChannel.length; i++) {
          audio[i] = (leftChannel[i] + rightChannel[i]) / 2;
        }
      }

      // Trigger background transcription
      transcribeAudio(mediaId, audio);
    } catch (error) {
      console.error('Error extracting audio:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getTranscriptionStatus = (mediaId: string) => {
    const status = activeTranscriptions.get(mediaId);
    if (!status) return null;

    const statusColors = {
      idle: '#6b7280',
      loading: '#3b82f6',
      transcribing: '#10b981',
      complete: '#22c55e',
      error: '#ef4444',
    };

    return (
      <div className="transcription-badge" style={{ backgroundColor: statusColors[status.status] }}>
        {status.status === 'transcribing' && `${Math.round(status.progress)}%`}
        {status.status === 'complete' && '✓'}
        {status.status === 'error' && '✗'}
        {status.status === 'loading' && '...'}
      </div>
    );
  };

  return (
    <div className="media-bin">
      <div className="media-bin-header">
        <h2>Media Bin</h2>
        <button
          className="add-media-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          + Add Media
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {project?.media.length === 0 ? (
          <div className="empty-state">
            <p>Drop video or audio files here</p>
            <p className="hint">or click "Add Media" button</p>
          </div>
        ) : (
          <div className="media-grid">
            {project?.media.map((item) => (
              <div
                key={item.id}
                className={`media-item ${selectedMediaId === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedMediaId(item.id)}
              >
                <div className="media-thumbnail">
                  <video
                    src={URL.createObjectURL(item.file)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {getTranscriptionStatus(item.id)}
                </div>
                <div className="media-info">
                  <p className="media-name" title={item.name}>
                    {item.name}
                  </p>
                  <p className="media-details">
                    {Math.round(item.duration)}s · {item.width}x{item.height}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
