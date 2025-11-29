// Core project types based on the specification

export interface Project {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  modifiedAt: string;
  settings: ProjectSettings;
  media: MediaItem[];
  timeline: Timeline;
  transcripts: Transcript[];
  chatHistory: ChatMessage[];
  manifest: ProjectManifest;
}

export interface ProjectSettings {
  width: number;
  height: number;
  fps: number;
  sampleRate: number;
  timecodeStart: string;
  dropFrame: boolean;
  pixelAspectRatio: number;
}

export interface ProjectManifest {
  modelVersions: {
    asr: string;
    chat: string;
    vision: string;
  };
  mediaHashes: Record<string, string>;
  exportHistory: ExportRecord[];
}

export interface MediaItem {
  id: string;
  file: File;
  name: string;
  path?: string;
  mediaHash: string;

  // Video properties
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;

  // Audio properties
  audioChannels: number;
  audioSampleRate: number;
  audioCodec: string;

  // Generated assets
  thumbnail?: Blob;
  thumbnailStrip?: Blob[];
  waveform?: Float32Array;
  proxy?: {
    file: Blob;
    resolution: string;
  };

  // Metadata
  transcription?: {
    text: string;
    segments: TranscriptSegment[];
    language: string;
    confidence: number;
  };

  sceneChanges?: number[];
  importedAt: string;
}

export interface Timeline {
  id: string;
  duration: number;
  durationFrames: number;
  tracks: Track[];
  markers: Marker[];
  playhead: PlayheadState;
  selection: SelectionState;
  zoom: number;
  scrollX: number;
  scrollY: number;
}

export interface PlayheadState {
  position: number;
  frame: number;
  tc: string;
}

export interface SelectionState {
  inPoint?: number;
  outPoint?: number;
  selectedClips: string[];
  selectedTrack?: string;
}

export interface Track {
  id: string;
  type: 'video' | 'audio';
  name: string;
  index: number;
  locked: boolean;
  muted: boolean;
  solo: boolean;
  visible: boolean;
  clips: Clip[];
  volume?: number;
  pan?: number;
}

export interface Clip {
  id: string;
  mediaId: string;
  trackId: string;

  // Timeline position
  start: number;
  startFrame: number;
  duration: number;
  durationFrames: number;

  // Source trimming
  offset: number;
  offsetFrame: number;
  trimEnd: number;
  trimEndFrame: number;

  // Speed & time remapping
  speed: number;
  reverse: boolean;

  // Effects
  effects: Effect[];

  // Transition
  transition?: Transition;

  // Transform (video only)
  transform?: Transform;

  // Audio
  audio?: AudioSettings;

  // Keyframes
  keyframes?: Record<string, Keyframe[]>;

  // Metadata
  name: string;
  color?: string;
  notes?: string;
}

export interface Effect {
  id: string;
  type: string;
  enabled: boolean;
  params: Record<string, any>;
  shader?: {
    vertex: string;
    fragment: string;
    uniforms: Record<string, any>;
  };
}

export interface Transition {
  type: 'fade' | 'dissolve' | 'wipe' | 'dip' | 'custom';
  duration: number;
  durationFrames: number;
  easing: string;
  params?: Record<string, any>;
}

export interface Transform {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  anchorPoint: { x: number; y: number };
  opacity: number;
  blendMode: string;
}

export interface AudioSettings {
  volume: number;
  pan: number;
  muted: boolean;
}

export interface Keyframe {
  time: number;
  frame: number;
  value: any;
  easing?: string;
}

export interface Marker {
  id: string;
  position: number;
  frame: number;
  tc: string;
  name: string;
  notes?: string;
  color: string;
  category: 'chapter' | 'cue' | 'speaker' | 'scene' | 'todo' | 'custom';
  metadata?: {
    speakerId?: string;
    speakerName?: string;
    transcriptSegmentId?: string;
    chapterTitle?: string;
  };
}

export interface Transcript {
  id: string;
  mediaId: string;
  language: string;
  fullText: string;
  segments: TranscriptSegment[];
  speakers: Speaker[];
  generatedAt: string;
  modelVersion: string;
  editHistory: TranscriptEdit[];
}

export interface TranscriptSegment {
  id: string;
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
  text: string;
  words: TranscriptWord[];
  speakerId: string;
  confidence: number;
}

export interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
  confidence: number;
}

export interface Speaker {
  id: string;
  displayName: string;
  color: string;
  segmentIds: string[];
  metadata?: {
    title?: string;
    company?: string;
    notes?: string;
  };
}

export interface TranscriptEdit {
  id: string;
  timestamp: string;
  type: 'word_edit' | 'time_adjust' | 'speaker_merge' | 'speaker_split' | 'speaker_rename';
  segmentId: string;
  wordIndex?: number;
  oldValue: any;
  newValue: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  command?: Command;
  executionResult?: ExecutionResult;
}

export interface Command {
  action: string;
  confidence: number;
  target: CommandTarget;
  time?: TimeRange;
  params: Record<string, any>;
  preview: CommandPreview;
  undoToken: string;
  metadata: CommandMetadata;
  subActions?: Command[];
}

export interface CommandTarget {
  timelineId: string;
  trackId?: string;
  clipId?: string;
  clipIds?: string[];
}

export interface TimeRange {
  start: TimePoint;
  end?: TimePoint;
}

export interface TimePoint {
  seconds: number;
  frame: number;
  tc: string;
}

export interface CommandPreview {
  effects: string[];
  expectedDurationChangeSeconds: number;
  affectedClips: string[];
}

export interface CommandMetadata {
  userPhrase: string;
  parsedAt: string;
  modelVersion: string;
  snapTo?: 'nearestFrame' | 'sceneChange' | 'subtitleWord' | 'marker';
}

export interface ExecutionResult {
  success: boolean;
  error?: string;
  affectedClips?: string[];
  undoToken?: string;
}

export interface ExportRecord {
  id: string;
  timestamp: string;
  format: string;
  resolution: string;
  fps: number;
  duration: number;
  fileSize: number;
  settings: Record<string, any>;
}

// Worker message types
export interface WorkerMessage {
  type: 'load' | 'transcribe' | 'loading' | 'progress' | 'ready' | 'transcribing' | 'complete' | 'error';
  message?: string;
  progress?: any;
  result?: any;
  executionTime?: number;
  mediaId?: string;
  error?: string;
  data?: any;
}

// UI State types
export interface TranscriptionProgress {
  mediaId: string;
  status: 'idle' | 'loading' | 'transcribing' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface ModelDownloadProgress {
  file: string;
  progress: number;
  loaded: number;
  total: number;
}
