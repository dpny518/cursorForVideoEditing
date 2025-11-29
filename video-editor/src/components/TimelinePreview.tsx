import { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useTimelineStore } from '../stores/timelineStore';
import './TimelinePreview.css';

export default function TimelinePreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);

  const clips = useTimelineStore((state) => state.clips);
  const project = useProjectStore((state) => state.project);

  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);
  const currentClip = clips[currentClipIndex];
  const mediaItem = currentClip ? project?.media.find((m) => m.id === currentClip.mediaId) : null;

  useEffect(() => {
    if (!videoRef.current || !currentClip || !mediaItem) return;

    const video = videoRef.current;
    const wasPlaying = !video.paused;

    console.log('[TimelinePreview] Loading clip', {
      index: currentClipIndex,
      offset: currentClip.offset,
      duration: currentClip.duration,
      trimEnd: currentClip.trimEnd,
      mediaId: currentClip.mediaId,
      wasPlaying,
    });

    // Create new blob URL
    const blobUrl = URL.createObjectURL(mediaItem.file);

    // Set video source (always set it to reload)
    video.src = blobUrl;
    video.load(); // Force reload

    // Set start time to the clip's offset (in-point)
    const handleLoadedMetadata = () => {
      console.log('[TimelinePreview] Metadata loaded, seeking to', currentClip.offset);
      video.currentTime = currentClip.offset;
      setCurrentTime(currentClip.start);

      // Auto-play if we were playing before
      if (wasPlaying || isPlaying) {
        video.play().catch(err => console.error('[TimelinePreview] Play error:', err));
      }
    };

    // Handle time updates
    const handleTimeUpdate = () => {
      const videoTime = video.currentTime;
      const clipEndTime = currentClip.trimEnd; // Use trimEnd which is offset + duration

      // If we've reached the end of this clip (with small buffer for accuracy)
      if (videoTime >= clipEndTime - 0.1) {
        console.log('[TimelinePreview] Clip ended', {
          videoTime,
          clipEndTime,
          currentIndex: currentClipIndex,
          totalClips: clips.length,
        });

        // Move to next clip
        if (currentClipIndex < clips.length - 1) {
          console.log('[TimelinePreview] Moving to next clip:', currentClipIndex + 1);
          setCurrentClipIndex(currentClipIndex + 1);
        } else {
          // End of timeline
          console.log('[TimelinePreview] End of timeline reached');
          video.pause();
          setIsPlaying(false);
          setCurrentClipIndex(0);
          setCurrentTime(0);
        }
      } else {
        // Update current time relative to timeline start
        const clipProgress = videoTime - currentClip.offset;
        setCurrentTime(currentClip.start + clipProgress);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (currentClipIndex < clips.length - 1) {
        setCurrentClipIndex(currentClipIndex + 1);
      } else {
        setIsPlaying(false);
        setCurrentClipIndex(0);
        setCurrentTime(0);
      }
    };

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
      URL.revokeObjectURL(blobUrl);
    };
  }, [currentClip, mediaItem, currentClipIndex, clips.length, isPlaying]);

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

  if (clips.length === 0) {
    return (
      <div className="timeline-preview empty">
        <div className="empty-state">
          <p>No clips in timeline</p>
          <p className="hint">Add clips from the preview panel to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-preview">
      <div className="preview-viewport">
        <video
          ref={videoRef}
          className="preview-video"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            background: '#000',
          }}
        />

        {/* Clip indicator */}
        <div className="clip-indicator">
          Clip {currentClipIndex + 1} of {clips.length}
        </div>
      </div>

      <div className="preview-controls">
        <button className="play-pause-btn" onClick={handlePlayPause}>
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </div>

        <div className="timeline-info">
          {clips.length} clip{clips.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
