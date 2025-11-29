import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useTimelineStore } from '../stores/timelineStore';
import './VideoPlayer.css';

interface VideoPlayerProps {
  mediaId?: string;
}

export default function VideoPlayer({ mediaId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rangeTrackRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'range' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);

  const project = useProjectStore((state) => state.project);
  const addClipToTimeline = useTimelineStore((state) => state.addClipToTimeline);
  const mediaItem = mediaId ? project?.media.find((m) => m.id === mediaId) : null;

  useEffect(() => {
    if (!videoRef.current || !mediaItem) return;

    const video = videoRef.current;

    // Set video source
    video.src = URL.createObjectURL(mediaItem.file);

    // Update duration when metadata loads
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setCurrentTime(0);
      // Initialize selection to full duration
      setSelectionStart(0);
      setSelectionEnd(video.duration);
    };

    // Update current time during playback
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    // Handle play/pause events
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      URL.revokeObjectURL(video.src);
    };
  }, [mediaItem?.id]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddToTimeline = () => {
    if (!mediaItem) return;
    const selectedDuration = selectionEnd - selectionStart;
    addClipToTimeline(
      mediaItem.id,
      mediaItem.name,
      selectedDuration,
      selectionStart,
      selectionEnd
    );
  };

  const handleRangeMouseDown = (e: React.MouseEvent, handle: 'start' | 'end' | 'range') => {
    e.preventDefault();
    setIsDragging(handle);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !rangeTrackRef.current || duration === 0) return;

    const rect = rangeTrackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const timeAtX = (x / rect.width) * duration;

    if (isDragging === 'start') {
      setSelectionStart(Math.max(0, Math.min(timeAtX, selectionEnd - 0.1)));
    } else if (isDragging === 'end') {
      setSelectionEnd(Math.max(selectionStart + 0.1, Math.min(timeAtX, duration)));
    } else if (isDragging === 'range') {
      const deltaX = e.clientX - dragStartX;
      const deltaTime = (deltaX / rect.width) * duration;
      const rangeDuration = selectionEnd - selectionStart;

      let newStart = selectionStart + deltaTime;
      let newEnd = selectionEnd + deltaTime;

      // Constrain to boundaries
      if (newStart < 0) {
        newStart = 0;
        newEnd = rangeDuration;
      } else if (newEnd > duration) {
        newEnd = duration;
        newStart = duration - rangeDuration;
      }

      setSelectionStart(newStart);
      setSelectionEnd(newEnd);
      setDragStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!rangeTrackRef.current || duration === 0 || !videoRef.current) return;

    // Don't seek if clicking on handles or selection
    if ((e.target as HTMLElement).closest('.range-handle, .range-selection')) {
      return;
    }

    const rect = rangeTrackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const timeAtX = (x / rect.width) * duration;

    videoRef.current.currentTime = timeAtX;
    setCurrentTime(timeAtX);
  };

  if (!mediaItem) {
    return (
      <div className="video-player empty">
        <p>Select a video from the Media Bin</p>
        <p className="hint">Click on any video to preview it here</p>
      </div>
    );
  }

  return (
    <div className="video-player">
      <div className="player-viewport">
        <video
          ref={videoRef}
          className="player-video"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#000',
          }}
        />
      </div>

      {/* Unified Scrubber with Integrated Controls */}
      <div className="range-selector-container">
        {/* Integrated Controls Bar */}
        <div className="integrated-controls">
          <button
            className="play-pause-btn"
            onClick={handlePlayPause}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <button className="add-to-timeline-btn" title="Add to Timeline" onClick={handleAddToTimeline}>
            + Timeline ({formatTime(selectionEnd - selectionStart)})
          </button>
        </div>

        {/* Range Track */}
        <div
          className="range-track-wrapper"
          ref={rangeTrackRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="range-track" onClick={handleTrackClick}>
          {/* Dimmed areas outside selection */}
          <div
            className="range-dimmed range-dimmed-left"
            style={{ width: `${(selectionStart / duration) * 100}%` }}
          />
          <div
            className="range-dimmed range-dimmed-right"
            style={{
              left: `${(selectionEnd / duration) * 100}%`,
              width: `${((duration - selectionEnd) / duration) * 100}%`
            }}
          />

          {/* Selected range */}
          <div
            className="range-selection"
            style={{
              left: `${(selectionStart / duration) * 100}%`,
              width: `${((selectionEnd - selectionStart) / duration) * 100}%`,
            }}
            onMouseDown={(e) => handleRangeMouseDown(e, 'range')}
          >
            {/* Start handle */}
            <div
              className="range-handle range-handle-start"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleRangeMouseDown(e, 'start');
              }}
            >
              <div className="range-handle-line" />
            </div>

            {/* End handle */}
            <div
              className="range-handle range-handle-end"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleRangeMouseDown(e, 'end');
              }}
            >
              <div className="range-handle-line" />
            </div>

            {/* Selection info */}
            <div className="range-info">
              {formatTime(selectionEnd - selectionStart)}
            </div>
          </div>

          {/* Playhead indicator */}
          <div
            className="playhead"
            style={{
              left: `${(currentTime / duration) * 100}%`,
            }}
          >
            <div className="playhead-line" />
            <div className="playhead-handle" />
          </div>
        </div>

        {/* Time markers */}
        <div className="range-time-markers">
          <span className="range-time-start">{formatTime(selectionStart)}</span>
          <span className="range-time-end">{formatTime(selectionEnd)}</span>
        </div>
        </div>
      </div>
    </div>
  );
}
