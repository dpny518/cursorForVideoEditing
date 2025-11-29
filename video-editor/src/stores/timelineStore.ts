import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Clip } from '../types';

interface TimelineClip extends Clip {
  // Additional timeline-specific properties
}

interface TimelineStore {
  clips: TimelineClip[];
  selectedClipId: string | null;

  // Actions
  addClipToTimeline: (
    mediaId: string,
    mediaName: string,
    duration: number,
    inPoint?: number,
    outPoint?: number
  ) => void;
  removeClip: (clipId: string) => void;
  selectClip: (clipId: string | null) => void;
  clearTimeline: () => void;
  reorderClip: (clipId: string, newIndex: number) => void;
  trimClip: (clipId: string, newOffset: number, newDuration: number) => void;
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  clips: [],
  selectedClipId: null,

  addClipToTimeline: (
    mediaId: string,
    mediaName: string,
    duration: number,
    inPoint = 0,
    outPoint?: number
  ) => {
    const { clips } = get();

    // Use outPoint if provided, otherwise use duration
    const effectiveOutPoint = outPoint ?? duration;
    const clipDuration = effectiveOutPoint - inPoint;

    // Calculate start position (end of last clip)
    const lastClip = clips[clips.length - 1];
    const startPosition = lastClip ? lastClip.start + lastClip.duration : 0;

    const newClip: TimelineClip = {
      id: uuidv4(),
      mediaId,
      trackId: 'video-track-1',
      name: mediaName,
      start: startPosition,
      startFrame: Math.round(startPosition * 30), // Assuming 30fps
      duration: clipDuration,
      durationFrames: Math.round(clipDuration * 30),
      offset: inPoint, // Start from the in point
      offsetFrame: Math.round(inPoint * 30),
      trimEnd: effectiveOutPoint,
      trimEndFrame: Math.round(effectiveOutPoint * 30),
      speed: 1,
      reverse: false,
      effects: [],
    };

    set({ clips: [...clips, newClip] });
  },

  removeClip: (clipId: string) => {
    set((state) => ({
      clips: state.clips.filter((c) => c.id !== clipId),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
    }));
  },

  selectClip: (clipId: string | null) => {
    set({ selectedClipId: clipId });
  },

  clearTimeline: () => {
    set({ clips: [], selectedClipId: null });
  },

  reorderClip: (clipId: string, newIndex: number) => {
    set((state) => {
      const clips = [...state.clips];
      const clipIndex = clips.findIndex((c) => c.id === clipId);

      if (clipIndex === -1) return state;

      const [clip] = clips.splice(clipIndex, 1);
      clips.splice(newIndex, 0, clip);

      // Recalculate start positions
      let currentPosition = 0;
      clips.forEach((c) => {
        c.start = currentPosition;
        c.startFrame = Math.round(currentPosition * 30);
        currentPosition += c.duration;
      });

      return { clips };
    });
  },

  trimClip: (clipId: string, newOffset: number, newDuration: number) => {
    set((state) => {
      const clips = state.clips.map((clip) => {
        if (clip.id !== clipId) return clip;

        // Update clip with new trim values
        return {
          ...clip,
          offset: newOffset,
          offsetFrame: Math.round(newOffset * 30),
          duration: newDuration,
          durationFrames: Math.round(newDuration * 30),
          trimEnd: newOffset + newDuration,
          trimEndFrame: Math.round((newOffset + newDuration) * 30),
        };
      });

      // Recalculate start positions after trimming
      let currentPosition = 0;
      clips.forEach((c) => {
        c.start = currentPosition;
        c.startFrame = Math.round(currentPosition * 30);
        currentPosition += c.duration;
      });

      return { clips };
    });
  },
}));
