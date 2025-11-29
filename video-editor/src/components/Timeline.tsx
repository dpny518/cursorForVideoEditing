import { useState, useEffect } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { useTimelineStore } from '../stores/timelineStore';
import './Timeline.css';

export default function Timeline() {
  const clips = useTimelineStore((state) => state.clips);
  const selectedClipId = useTimelineStore((state) => state.selectedClipId);
  const selectClip = useTimelineStore((state) => state.selectClip);
  const removeClip = useTimelineStore((state) => state.removeClip);
  const clearTimeline = useTimelineStore((state) => state.clearTimeline);
  const reorderClip = useTimelineStore((state) => state.reorderClip);
  const trimClip = useTimelineStore((state) => state.trimClip);

  const project = useProjectStore((state) => state.project);

  const [draggedClipId, setDraggedClipId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [resizingClip, setResizingClip] = useState<{
    clipId: string;
    edge: 'left' | 'right';
    startX: number;
    originalOffset: number;
    originalDuration: number;
    trackWidth: number;
    originalTotalDuration: number;
  } | null>(null);

  const getMediaItem = (mediaId: string) => {
    return project?.media.find((m) => m.id === mediaId);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);

  const handleRemoveClip = (e: React.MouseEvent, clipId: string) => {
    e.stopPropagation();
    if (confirm('Remove this clip from timeline?')) {
      removeClip(clipId);
    }
  };

  const handleDragStart = (e: React.DragEvent, clipId: string) => {
    // Don't start drag if clicking on resize handles or remove button
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle') ||
        target.classList.contains('remove-clip-btn') ||
        target.closest('.resize-handle') ||
        target.closest('.remove-clip-btn')) {
      e.preventDefault();
      return;
    }

    setDraggedClipId(clipId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', clipId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (!draggedClipId) return;

    const draggedIndex = clips.findIndex(c => c.id === draggedClipId);

    if (draggedIndex !== -1 && draggedIndex !== dropIndex) {
      reorderClip(draggedClipId, dropIndex);
    }

    setDraggedClipId(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedClipId(null);
    setDragOverIndex(null);
  };

  const handleResizeStart = (e: React.MouseEvent, clipId: string, edge: 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault(); // Prevent drag from starting

    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    // Get the track width for pixel-to-time conversion
    const trackElement = (e.target as HTMLElement).closest('.track-clips') as HTMLElement;
    if (!trackElement) return;

    console.log('[Timeline] Resize start:', {
      clipId,
      edge,
      clipOffset: clip.offset,
      clipDuration: clip.duration,
      trackWidth: trackElement.offsetWidth,
      totalDuration,
    });

    setResizingClip({
      clipId,
      edge,
      startX: e.clientX,
      originalOffset: clip.offset,
      originalDuration: clip.duration,
      trackWidth: trackElement.offsetWidth,
      originalTotalDuration: totalDuration,
    });
  };


  // Attach document-level mouse handlers during resize
  useEffect(() => {
    if (!resizingClip) return;

    const handleDocumentMouseMove = (e: MouseEvent) => {
      const clip = clips.find(c => c.id === resizingClip.clipId);
      const mediaItem = clip ? getMediaItem(clip.mediaId) : null;
      if (!clip || !mediaItem) return;

      const deltaX = e.clientX - resizingClip.startX;

      // Simple conversion: pixels to time
      const timePerPixel = resizingClip.originalTotalDuration / resizingClip.trackWidth;
      const deltaTime = deltaX * timePerPixel;

      let newOffset = resizingClip.originalOffset;
      let newDuration = resizingClip.originalDuration;

      if (resizingClip.edge === 'left') {
        // Dragging left edge (adjusting in-point)
        newOffset = Math.max(0, resizingClip.originalOffset + deltaTime);
        newOffset = Math.min(newOffset, mediaItem.duration - 0.5);
        newDuration = resizingClip.originalDuration - (newOffset - resizingClip.originalOffset);

        if (newDuration < 0.5) {
          newDuration = 0.5;
          newOffset = resizingClip.originalOffset + resizingClip.originalDuration - 0.5;
        }
      } else {
        // Dragging right edge (adjusting out-point)
        newDuration = Math.max(0.5, resizingClip.originalDuration + deltaTime);
        const maxDuration = mediaItem.duration - newOffset;
        newDuration = Math.min(newDuration, maxDuration);
      }

      console.log('[Timeline] Resize move:', {
        deltaX,
        timePerPixel,
        deltaTime,
        edge: resizingClip.edge,
        newOffset,
        newDuration,
      });

      trimClip(resizingClip.clipId, newOffset, newDuration);
    };

    const handleDocumentMouseUp = () => {
      console.log('[Timeline] Resize end (document)');
      setResizingClip(null);
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [resizingClip, clips, getMediaItem, trimClip]);

  if (clips.length === 0) {
    return (
      <div className="timeline empty">
        <div className="empty-timeline">
          <p>Timeline is empty</p>
          <p className="hint">
            Select a video from the Media Bin and click "+ Timeline" to add it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline">
      <div className="timeline-header">
        <div className="timeline-info">
          <h3>Timeline</h3>
          <span className="clip-count">
            {clips.length} clip{clips.length !== 1 ? 's' : ''} · {formatTime(totalDuration)}
          </span>
        </div>
        <div className="timeline-actions">
          <button className="clear-timeline-btn" onClick={clearTimeline}>
            Clear All
          </button>
        </div>
      </div>

      <div className="timeline-tracks">
        <div className="track-label">Video</div>
        <div className="track-content">
          <div className="track-ruler">
            {[0, 10, 20, 30, 40, 50, 60].map((time) => (
              <div key={time} className="ruler-mark" style={{ left: `${(time / totalDuration) * 100}%` }}>
                <span>{formatTime(time)}</span>
              </div>
            ))}
          </div>
          <div className="track-clips">
            {clips.map((clip, index) => {
              const mediaItem = getMediaItem(clip.mediaId);
              const widthPercent = (clip.duration / totalDuration) * 100;
              const isDragging = draggedClipId === clip.id;
              const isDropTarget = dragOverIndex === index;

              return (
                <div
                  key={clip.id}
                  className={`timeline-clip ${selectedClipId === clip.id ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`}
                  style={{
                    width: `${widthPercent}%`,
                    left: `${(clip.start / totalDuration) * 100}%`,
                  }}
                  draggable
                  onClick={() => selectClip(clip.id)}
                  onDragStart={(e) => handleDragStart(e, clip.id)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="clip-preview">
                    {mediaItem && (
                      <video
                        src={URL.createObjectURL(mediaItem.file)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                      />
                    )}
                  </div>
                  <div className="clip-info">
                    <span className="clip-name">{clip.name}</span>
                    <span className="clip-duration">{formatTime(clip.duration)}</span>
                  </div>
                  <button
                    className="remove-clip-btn"
                    onClick={(e) => handleRemoveClip(e, clip.id)}
                    title="Remove clip"
                  >
                    ×
                  </button>
                  <div className="clip-number">{index + 1}</div>

                  {/* Resize handles */}
                  <div
                    className="resize-handle resize-handle-left"
                    draggable={false}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(e, clip.id, 'left');
                    }}
                    title="Drag to trim start"
                  />
                  <div
                    className="resize-handle resize-handle-right"
                    draggable={false}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(e, clip.id, 'right');
                    }}
                    title="Drag to trim end"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="timeline-footer">
        <p className="timeline-hint">
          Click clips to select · Drag to reorder · Right-click for more options (coming soon)
        </p>
      </div>
    </div>
  );
}
