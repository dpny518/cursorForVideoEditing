import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Project, MediaItem, Timeline, Track } from '../types';

interface ProjectStore {
  project: Project | null;

  // Actions
  createProject: (name: string, settings?: Partial<Project['settings']>) => void;
  addMediaItem: (file: File) => Promise<MediaItem>;
  removeMediaItem: (mediaId: string) => void;
  getMediaItem: (mediaId: string) => MediaItem | undefined;
  updateMediaItem: (mediaId: string, updates: Partial<MediaItem>) => void;
}

const createDefaultTimeline = (): Timeline => ({
  id: uuidv4(),
  duration: 0,
  durationFrames: 0,
  tracks: [
    {
      id: uuidv4(),
      type: 'video',
      name: 'Video 1',
      index: 0,
      locked: false,
      muted: false,
      solo: false,
      visible: true,
      clips: [],
    },
    {
      id: uuidv4(),
      type: 'audio',
      name: 'Audio 1',
      index: 1,
      locked: false,
      muted: false,
      solo: false,
      visible: true,
      clips: [],
      volume: 0,
      pan: 0,
    },
  ],
  markers: [],
  playhead: {
    position: 0,
    frame: 0,
    tc: '00:00:00:00',
  },
  selection: {
    selectedClips: [],
  },
  zoom: 10,
  scrollX: 0,
  scrollY: 0,
});

export const useProjectStore = create<ProjectStore>((set, get) => ({
  project: null,

  createProject: (name: string, settings?) => {
    const defaultSettings = {
      width: 1920,
      height: 1080,
      fps: 30,
      sampleRate: 48000,
      timecodeStart: '00:00:00:00',
      dropFrame: false,
      pixelAspectRatio: 1.0,
    };

    const project: Project = {
      id: uuidv4(),
      name,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      settings: { ...defaultSettings, ...settings },
      media: [],
      timeline: createDefaultTimeline(),
      transcripts: [],
      chatHistory: [],
      manifest: {
        modelVersions: {
          asr: 'whisper-tiny',
          chat: 'phi-3-mini',
          vision: 'clip-vit-base',
        },
        mediaHashes: {},
        exportHistory: [],
      },
    };

    set({ project });
  },

  addMediaItem: async (file: File) => {
    return new Promise<MediaItem>((resolve, reject) => {
      // Create a video element to extract metadata
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.src = url;

      video.addEventListener('loadedmetadata', () => {
        const mediaItem: MediaItem = {
          id: uuidv4(),
          file,
          name: file.name,
          mediaHash: `hash_${Date.now()}`, // TODO: Implement actual hash
          duration: video.duration,
          width: video.videoWidth || 0,
          height: video.videoHeight || 0,
          fps: 30, // Default, would need more complex detection
          codec: 'unknown',
          bitrate: 0,
          audioChannels: 0,
          audioSampleRate: 48000,
          audioCodec: 'unknown',
          importedAt: new Date().toISOString(),
        };

        // Add to project
        set((state) => {
          if (!state.project) return state;
          return {
            project: {
              ...state.project,
              media: [...state.project.media, mediaItem],
              modifiedAt: new Date().toISOString(),
            },
          };
        });

        URL.revokeObjectURL(url);
        resolve(mediaItem);
      });

      video.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load media file'));
      });
    });
  },

  removeMediaItem: (mediaId: string) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          media: state.project.media.filter((item) => item.id !== mediaId),
          modifiedAt: new Date().toISOString(),
        },
      };
    });
  },

  getMediaItem: (mediaId: string) => {
    const { project } = get();
    return project?.media.find((item) => item.id === mediaId);
  },

  updateMediaItem: (mediaId: string, updates: Partial<MediaItem>) => {
    set((state) => {
      if (!state.project) return state;
      return {
        project: {
          ...state.project,
          media: state.project.media.map((item) =>
            item.id === mediaId ? { ...item, ...updates } : item
          ),
          modifiedAt: new Date().toISOString(),
        },
      };
    });
  },
}));
