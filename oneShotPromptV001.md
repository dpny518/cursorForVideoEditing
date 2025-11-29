**Project: Local Web-Based AI Video Editor with Chat Interface**

**Core Requirements:**

Build a complete, production-ready browser-based video editing application that runs entirely locally using modern web technologies and native browser APIs. This must be a fully functional editor with professional-grade features, deterministic command parsing, and robust interchange format support.

**Technical Stack:**

- **Frontend Framework**: React with TypeScript (strict mode)
- **@diffusionstudio/core**: Native browser video editing using WebCodecs and WebGPU
  - Video/audio decoding and encoding via WebCodecs API
  - GPU-accelerated effects and compositing via WebGPU
  - TypeScript muxers/demuxers (no WebAssembly needed)
  - ~75KB bundle size vs FFmpeg.wasm's 30MB+
- **Transformers.js**: Local browser-based AI execution:
  - Whisper-tiny or distil-whisper for ASR (user-selectable based on quality/speed tradeoff)
  - CLIP or ViT for video content analysis and scene detection
  - Phi-3-mini or Llama-3.2-1B for chat interface and command parsing
- **Web APIs**: 
  - WebCodecs for hardware-accelerated video processing
  - WebGPU for GPU-powered effects and shader-based transitions
  - File System Access API for file handling
  - Web Workers for background processing
  - OffscreenCanvas for rendering optimization
  - IndexedDB for project storage and model caching
  - WritableStream for time-sliced export rendering
- **Validation**: JSON Schema for strict command validation
- **State Management**: Zustand or Redux Toolkit with immer for immutable state updates
- **All processing runs entirely in-browser** (zero server dependencies)

**UI Layout (DaVinci Resolve-style):**

1. **Media Bin** (top-left, ~25% width, ~40% height)
   - Grid view with video thumbnails (first frame + 1 per second via WebCodecs)
   - File upload button with drag-and-drop zone
   - Clip metadata display: duration, resolution, codec, file size, fps, mediaHash (CRC32)
   - Search and filter controls (by name, duration, resolution, codec)
   - Right-click context menu (delete, rename, properties, generate proxy)
   - Multi-select support with shift/ctrl
   - Batch operations: rename pattern, transcode, generate proxies

2. **Source Preview** (top-center, ~37.5% width, ~40% height)
   - Custom video player for selected media bin clip
   - Transport controls: play, pause, step forward/back (1 frame), jog shuttle
   - Scrubber with frame-accurate seeking (snap to nearest frame)
   - In/out point markers with keyboard shortcuts (I/O keys)
   - Timecode display: current/duration in format HH:MM:SS:FF (dropframe/non-drop toggle)
   - Playback speed control (0.25x, 0.5x, 1x, 1.5x, 2x)
   - Volume control with audio meters (-60dB to 0dB scale)
   - Safe area overlays (action/title safe zones)
   - Waveform overlay on scrubber

3. **Timeline Preview** (top-right, ~37.5% width, ~40% height)
   - Real-time composite output of full timeline
   - Synced playback controls with timeline position
   - Resolution toggle: proxy (480p) / full quality
   - Safe zones overlay option
   - Current frame timecode with frame number
   - Export preview mode (shows exactly what will be exported)
   - Scopes option (waveform, vectorscope, histogram)

4. **Timeline Editor** (bottom, full width, ~55% height)
   - Canvas-based multi-track timeline interface with ruler showing timecode
   - **Video Tracks**: 5 layers with alpha compositing and blend modes
   - **Audio Tracks**: 5 layers with mixing and pan controls
   - Visual features:
     - Waveform visualization for audio tracks (rendered on OffscreenCanvas)
     - Thumbnail filmstrip on video clips (every 2-5 seconds depending on zoom)
     - Transition indicators between clips (duration, type)
     - Effect badges on clips (with parameter preview)
     - Marker flags with labels and colors
   - Editing features:
     - Drag-and-drop clips from media bin
     - Trim handles with snap-to-grid (frame-accurate)
     - Ripple delete and insert modes
     - Copy/paste/duplicate clips with modifiers
     - Split clip at playhead (S key)
     - Razor tool for cutting (C key)
     - Slip/slide/roll editing modes
     - Linked selection (video+audio)
   - Timeline controls:
     - Horizontal zoom slider (frames per pixel)
     - Vertical zoom (track height: compact/normal/expanded)
     - Snap toggle (magnetic timeline to markers/cuts/playhead)
     - Playhead scrubbing with audio scrub
     - Range selection (in/out on timeline)
     - Compound clip creation (nest selected clips)
   - Marker system:
     - Create markers at playhead (M key)
     - Marker categories: chapter, cue, speaker change, scene
     - Color coding and metadata (notes, speaker names, timecodes)
     - Export markers to FCPXML/EDL/CSV

5. **Chat Interface Panel** (collapsible right sidebar, ~300px width)
   - Text input box with send button and command history (up/down arrows)
   - Conversation history (scrollable, persistent to project)
   - Message types:
     - User commands (right-aligned, blue bubble)
     - AI responses (left-aligned, gray bubble)
     - System notifications (centered, italic, timestamped)
     - Command preview cards (shows parsed JSON + visual diff)
   - Command confidence indicator (0-100% with color coding)
   - Loading spinner during AI processing with progress %
   - Suggested commands as chip buttons (context-aware)
   - Command confirmation dialog for low confidence (<60%)
   - Clear chat button
   - Export chat log as JSON/Markdown
   - Model selection dropdown (Whisper-tiny vs distil-whisper, Phi-3 vs Llama)
   - Model download status and size display

6. **Transcript Panel** (tabbed with Chat Panel or separate collapsible panel)
   - Word-level interactive transcript with timestamps
   - Click word to seek playhead to that timestamp
   - Drag select words to set in/out range or create subtitle
   - Inline text editing with +/- timestamp controls (frame resolution)
   - Speaker diarization display:
     - Speaker chips per segment (color-coded)
     - Rename speaker button (maps speakerId → displayName)
     - Merge/split speaker segments
     - Confidence scores per word (visual indicator)
   - Waveform with overlaid word boxes (hover shows start/end/frame/confidence)
   - "Snap to word boundary" toggle for trimming
   - Export options: word-level JSON, SRT/VTT (with speaker labels), chapters, TTML/IMSC
   - Search and replace across transcript
   - Edit history with undo/redo

7. **Top Menu Bar**
   - File: New Project, Open, Save, Save As, Import Media, Export
   - Edit: Undo, Redo, Cut, Copy, Paste, Delete, Select All
   - Clip: Split, Trim, Detach Audio, Link, Nest (Compound Clip)
   - View: Toggle panels, Zoom In/Out, Fit to Window, Fullscreen
   - Timeline: Add Marker, Delete Marker, Go to Marker, Snap Toggle
   - Window: Minimize, Zoom, Bring All to Front
   - Help: Keyboard shortcuts, Documentation, About

8. **Properties Panel** (collapsible left sidebar, ~250px width)
   - Selected clip properties (name, duration, in/out points, speed)
   - Transform controls: position (X/Y), scale (%), rotation (degrees), anchor point
   - Opacity slider (0-100%)
   - Blend mode dropdown (normal, multiply, screen, overlay, etc.)
   - Effect parameters (dynamic based on selected effect)
   - Audio properties: volume (dB), pan (L/R), EQ controls
   - Color correction: exposure, contrast, saturation, temperature, tint, wheels
   - Keyframe editor for animated properties

9. **Effects/Transitions Browser** (optional panel or modal)
   - Categorized list: Video Effects, Audio Effects, Transitions, Generators
   - Search and favorites
   - Drag-and-drop to timeline clips
   - Preview on hover

10. **Export Modal/Panel**
    - Preset dropdown (Web 1080p, 4K YouTube, Instagram, Custom)
    - Format selection: MP4, WebM, MOV
    - Codec options: H.264, H.265, VP9, AV1
    - Resolution and frame rate
    - Bitrate/quality slider
    - Audio codec and bitrate
    - Handles option (0-10 seconds)
    - Include subtitles checkbox (burn in or sidecar)
    - Export range: entire timeline / in-out range / selected clips
    - Destination and filename
    - Export progress bar with time remaining
    - Cancel export button

**Core Features:**

**Video Processing (@diffusionstudio/core):**

```javascript
import { Composition, VideoClip, AudioClip, Track, Transition, Effect } from '@diffusionstudio/core';

// Create composition with project settings
const composition = new Composition({
  width: 1920,
  height: 1080,
  fps: 30,
  timecodeStart: '01:00:00:00', // Allow non-zero start TC
  dropFrame: false // or true for 29.97fps
});

// Add video track
const videoTrack = new Track({ type: 'video', name: 'Video 1' });
composition.addTrack(videoTrack);

// Add clip with precise frame timing
const videoClip = new VideoClip(videoFile, { 
  start: 0,        // Timeline position in seconds
  duration: 10,    // Duration in seconds
  offset: 2.5,     // Trim start (source time)
  trimEnd: 5.0,    // Trim end (source time)
  frame: 900       // Timeline position in frames @30fps
});

videoTrack.addClip(videoClip);

// Apply effects
videoClip.addEffect(new Effect('brightness', { value: 1.3 }));
videoClip.addEffect(new Effect('blur', { radius: 5 }));

// Add transition
const transition = new Transition('crossfade', { 
  duration: 1.0,  // 1 second = 30 frames @30fps
  easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
});
videoClip.setTransition(transition);
```

**Supported Operations:**
- **Import formats**: MP4, MOV, WebM, AVI, MKV (anything WebCodecs supports)
- **Editing**: Trim, cut, split, concatenate, slip, slide, roll
- **Transitions**: 
  - Fade (in/out)
  - Dissolve/crossfade
  - Wipe (horizontal/vertical/diagonal)
  - Dip to color
  - Custom WebGPU shader transitions
- **Effects**: 
  - Color correction: brightness, contrast, saturation, hue, exposure, temperature, tint
  - Color wheels: lift/gamma/gain for shadows/midtones/highlights
  - Blur (Gaussian, box, motion)
  - Sharpen
  - Crop (with feather), scale, rotate, flip
  - Opacity/alpha blending with blend modes
  - Transform: position, scale, rotation, anchor point, skew
  - Custom WebGPU shader effects (sobel edge, chromatic aberration, vignette)
- **Audio**: 
  - Volume control (dB) and normalization (peak, LUFS)
  - Fade in/out (linear, logarithmic, exponential curves)
  - Pan (stereo balance L/R)
  - EQ (low/mid/high bands)
  - Audio ducking (automatic volume reduction during speech)
  - Compression and limiting
  - Multiple track mixing with master bus
  - Audio meters (peak, RMS, LUFS)
- **Motion Graphics**:
  - Lower thirds (animated text overlays with background)
  - Title cards (centered, corner, custom position)
  - Subtitle/caption burn-in with style presets
  - Particle effects (simple generators)
- **Export formats**: 
  - Video: MP4 (H.264/H.265), WebM (VP8/VP9/AV1), MOV
  - Audio: AAC, Opus, MP3
  - Interchange: FCPXML, EDL, Premiere XML, AAF
  - Subtitles: SRT, VTT, TTML, JSON
  - Project: JSON (canonical format for re-import)

**AI Features (Transformers.js):**

```javascript
import { pipeline } from '@xenova/transformers';

// Model selection with size display
const models = {
  asr: {
    'whisper-tiny': { size: '75MB', speed: 'fast', quality: 'good' },
    'distil-whisper': { size: '150MB', speed: 'medium', quality: 'excellent' }
  },
  chat: {
    'Phi-3-mini': { size: '2.3GB', speed: 'fast', quality: 'good' },
    'Llama-3.2-1B': { size: '1.2GB', speed: 'very fast', quality: 'good' }
  }
};

// Load models on demand with progress
const transcriber = await pipeline(
  'automatic-speech-recognition', 
  'Xenova/whisper-tiny',
  { 
    progress_callback: (progress) => updateProgress(progress)
  }
);

const classifier = await pipeline(
  'zero-shot-image-classification', 
  'Xenova/clip-vit-base-patch32'
);

const chatbot = await pipeline(
  'text-generation', 
  'Xenova/Phi-3-mini-4k-instruct'
);
```

**Capabilities:**
- **Transcription**: 
  - Automatic speech-to-text with word-level timestamps
  - Speaker diarization (auto-detect and label speakers)
  - Language detection and multi-language support
  - Confidence scores per word (0.0-1.0)
  - Punctuation and capitalization
- **Subtitle Generation**: 
  - Auto-generate SRT/VTT files with configurable line length
  - Speaker labels in brackets `[John]` or as separate cue styles
  - Word-level cue IDs for precise linking
  - Safe area compliance checks
- **Scene Detection**: 
  - Identify scene changes using CLIP embeddings
  - Shot boundary detection with configurable threshold
  - Auto-create markers at scene changes
- **Content Analysis**: 
  - Semantic search: "Find all scenes with people/cars/outdoors"
  - Object detection: identify and timestamp specific objects
  - Action recognition: detect activities (talking, walking, etc.)
  - Sentiment analysis of speech segments
- **Silence Detection**: 
  - Identify silent segments with configurable threshold (-60dB to -20dB)
  - Minimum duration filter (0.5s to 10s)
  - Auto-remove or create markers
  - Export silence report as CSV
- **Smart Cutting**: 
  - AI-suggested cut points based on:
    - Scene changes
    - Speaker changes
    - Pause detection (natural breaks in speech)
    - Action beats (visual motion analysis)
  - Confidence scoring for each suggested cut
- **Natural Language Commands**: 
  - Parse editing instructions with strict JSON schema validation
  - Command confidence scoring (0.0-1.0)
  - Contextual understanding (current playhead, selection, track info)
  - Multi-step command decomposition (compound actions)
  - Fallback deterministic parser for critical operations

**Deterministic Command Schema:**

All LLM command outputs must conform to this JSON Schema:

```typescript
interface Command {
  action: 
    | 'cut' | 'split' | 'move' | 'delete' | 'duplicate'
    | 'add_transition' | 'add_effect' | 'remove_effect'
    | 'seek' | 'set_in_out' | 'create_marker'
    | 'transcribe' | 'generate_subtitles' | 'rename_speaker'
    | 'split_silence' | 'normalize_audio' | 'extract_audio'
    | 'scene_detect' | 'content_search'
    | 'create_motion_graphics' | 'add_lower_third'
    | 'export' | 'save_project'
    | 'compound'; // Multiple sub-actions
  
  confidence: number; // 0.0 - 1.0
  
  target: {
    timelineId: string;
    trackId?: string;
    clipId?: string;
    clipIds?: string[]; // For batch operations
  };
  
  time?: {
    start: {
      seconds: number;
      frame: number;      // Frame number (frame-accurate)
      tc: string;         // Timecode HH:MM:SS:FF
    };
    end?: {
      seconds: number;
      frame: number;
      tc: string;
    };
  };
  
  params: Record<string, any>; // Action-specific parameters
  
  preview: {
    effects: string[];                    // List of changes
    expectedDurationChangeSeconds: number; // Timeline duration delta
    affectedClips: string[];              // Clip IDs
  };
  
  undoToken: string; // UUID for undo operation
  
  metadata: {
    userPhrase: string;       // Original user input
    parsedAt: string;         // ISO timestamp
    modelVersion: string;     // LLM model used
    snapTo?: 'nearestFrame' | 'sceneChange' | 'subtitleWord' | 'marker';
  };
  
  subActions?: Command[]; // For compound actions
}
```

**JSON Schema Validation:**

```javascript
import Ajv from 'ajv';

const ajv = new Ajv({ strict: true });

const commandSchema = {
  type: 'object',
  required: ['action', 'confidence', 'target', 'undoToken', 'metadata'],
  properties: {
    action: { 
      type: 'string', 
      enum: ['cut', 'split', 'move', 'delete', 'duplicate', /* ... */] 
    },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    target: {
      type: 'object',
      required: ['timelineId'],
      properties: {
        timelineId: { type: 'string' },
        trackId: { type: 'string' },
        clipId: { type: 'string' },
        clipIds: { type: 'array', items: { type: 'string' } }
      }
    },
    time: {
      type: 'object',
      properties: {
        start: {
          type: 'object',
          required: ['seconds', 'frame', 'tc'],
          properties: {
            seconds: { type: 'number', minimum: 0 },
            frame: { type: 'integer', minimum: 0 },
            tc: { type: 'string', pattern: '^\\d{2}:\\d{2}:\\d{2}:\\d{2}$' }
          }
        },
        end: { /* same as start */ }
      }
    },
    params: { type: 'object' },
    preview: {
      type: 'object',
      required: ['effects', 'expectedDurationChangeSeconds', 'affectedClips'],
      properties: {
        effects: { type: 'array', items: { type: 'string' } },
        expectedDurationChangeSeconds: { type: 'number' },
        affectedClips: { type: 'array', items: { type: 'string' } }
      }
    },
    undoToken: { type: 'string', format: 'uuid' },
    metadata: {
      type: 'object',
      required: ['userPhrase', 'parsedAt', 'modelVersion'],
      properties: {
        userPhrase: { type: 'string' },
        parsedAt: { type: 'string', format: 'date-time' },
        modelVersion: { type: 'string' },
        snapTo: { 
          type: 'string', 
          enum: ['nearestFrame', 'sceneChange', 'subtitleWord', 'marker'] 
        }
      }
    },
    subActions: {
      type: 'array',
      items: { $ref: '#' } // Recursive reference for compound actions
    }
  }
};

const validateCommand = ajv.compile(commandSchema);

// Usage
function parseCommand(llmOutput: string, context: any): Command {
  let parsed: Command;
  
  try {
    parsed = JSON.parse(llmOutput);
  } catch (e) {
    throw new Error('Invalid JSON from LLM');
  }
  
  if (!validateCommand(parsed)) {
    throw new Error(`Schema validation failed: ${ajv.errorsText(validateCommand.errors)}`);
  }
  
  // Additional validation: check confidence threshold
  if (parsed.confidence < 0.6) {
    // Show confirmation dialog to user
    return { ...parsed, requiresConfirmation: true };
  }
  
  return parsed;
}
```

**LLM Prompt Template for Command Parsing:**

```javascript
function buildCommandPrompt(userInput: string, context: ProjectContext): string {
  return `
You are a video editing assistant. Output ONLY valid JSON matching the Command schema. No prose, no markdown.

CONTEXT:
- Timeline: ${context.timelineId}
- FPS: ${context.fps}
- Timecode mode: ${context.dropFrame ? 'dropframe' : 'non-drop'}
- Playhead: ${context.playhead.tc} (frame ${context.playhead.frame})
- Selected clip: ${context.selection?.clipId || 'none'} on track ${context.selection?.trackId || 'none'}
- Timeline duration: ${context.duration.tc} (${context.duration.frames} frames)
- Available tracks: ${context.tracks.map(t => `${t.id} (${t.type})`).join(', ')}

USER COMMAND: "${userInput}"

RULES:
1. Return valid JSON matching Command interface
2. Always include confidence (0.0-1.0)
3. Convert all times to frames using project FPS (${context.fps})
4. Generate unique undoToken (UUID v4)
5. For compound actions, use action: "compound" with subActions array
6. Include preview with affected clips and duration changes
7. If ambiguous, prefer context (e.g., "current clip" = ${context.selection?.clipId})

EXAMPLES:
User: "Cut clip from 1:30 to 2:45"
{
  "action": "cut",
  "confidence": 0.95,
  "target": { "timelineId": "${context.timelineId}", "clipId": "${context.selection?.clipId}" },
  "time": {
    "start": { "seconds": 90, "frame": ${90 * context.fps}, "tc": "00:01:30:00" },
    "end": { "seconds": 165, "frame": ${165 * context.fps}, "tc": "00:02:45:00" }
  },
  "params": {},
  "preview": {
    "effects": ["Trim clip to 1:15 duration"],
    "expectedDurationChangeSeconds": 0,
    "affectedClips": ["${context.selection?.clipId}"]
  },
  "undoToken": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {
    "userPhrase": "Cut clip from 1:30 to 2:45",
    "parsedAt": "${new Date().toISOString()}",
    "modelVersion": "Phi-3-mini",
    "snapTo": "nearestFrame"
  }
}

OUTPUT (JSON only):
`.trim();
}
```

**Chat-Based Editing Commands (Comprehensive Examples):**

**Basic Editing:**
- "Cut clip from 1:30 to 2:45"
- "Split the current clip at 00:45 and at 01:20"
- "Delete the third clip on video track 2"
- "Move clip 2 to start at 10 seconds"
- "Duplicate this clip 3 times with 2 second gaps"
- "Trim 5 seconds from the start of the selected clip"
- "Extend the clip end by 30 frames"
- "Ripple delete this clip and close the gap"

**Playhead/Cursor Control (One-Shot):**
- "Jump the playhead to the next scene change"
- "Set playhead at the start of the current clip"
- "Move playhead to the next subtitle word 'important' and select 2 seconds after it"
- "Go to frame +150 from current playhead and split"
- "Seek to 01:23:45:12" (specific timecode)
- "Go to marker 3"
- "Jump to the next speaker change"
- "Find the loudest part of the audio and go there"

**Effects & Transitions:**
- "Add a fade in transition at the beginning (1 second)"
- "Add a 2-second crossfade between clips 2 and 3"
- "Increase brightness by 20% on the selected clip"
- "Apply a blur effect to the last 5 seconds (10px radius)"
- "Rotate the video 90 degrees clockwise"
- "Set opacity to 50% for this clip"
- "Add color correction: increase contrast by 30%, saturation by 15%"
- "Apply a vignette effect (soft, dark edges)"
- "Remove all effects from this clip"

**Audio:**
- "Remove all silent parts longer than 2 seconds"
- "Increase volume by 50% on audio track 1"
- "Normalize audio levels across all clips to -16 LUFS"
- "Add fade out to the last 3 seconds of audio (exponential curve)"
- "Extract audio from this video clip to a new audio track"
- "Duck audio track 2 when there's speech on track 1"
- "Pan audio 30% to the right"
- "Apply high-pass filter at 80Hz to remove rumble"

**AI-Powered:**
- "Transcribe all videos and generate subtitles"
- "Find all scenes where someone is speaking"
- "Remove sections where nobody is talking for more than 3 seconds"
- "Find clips with outdoor scenes"
- "Auto-cut this video into 30-second segments"
- "Detect and mark all scene changes"
- "Find the clip where 'artificial intelligence' is mentioned"
- "Create chapter markers for every scene change and export as YouTube chapters"
- "Auto-generate lower thirds for each speaker at their first utterance (4 seconds duration)"
- "Identify all laughter and create markers"

**Transcript & Speaker Management:**
- "Rename speaker A to 'John Doe'"
- "Merge all segments from speaker 2 and speaker 5 (same person)"
- "Split the current speaker segment at 00:45"
- "Find all instances where 'Sarah' speaks and create a supercut"
- "Generate SRT with speaker names in brackets"
- "Export word-level transcript as JSON"
- "Create lower thirds at every speaker change"

**Motion Graphics:**
- "Create a lower third for 'John Doe — Senior Engineer' with slide in from left (0.6s), dark background, white text"
- "Add an opening title card: 'How We Built It' centered, 3 second duration, scale from 80% to 100%"
- "Generate subtitles with style: semi-transparent black box, white 18px sans-serif, 3px margin, drop shadow"
- "Create end credits scroll with all speaker names"

**Export:**
- "Export as 1080p MP4 at 30fps (H.264, high quality)"
- "Export timeline as 4K WebM with VP9 codec"
- "Render and download the final video with burned-in subtitles"
- "Export only the selected region as 720p for web"
- "Export Final Cut XML with 2-second handles and include speaker labels in markers"
- "Export EDL cut list with timecodes"
- "Export AAF for Pro Tools with separate audio tracks"
- "Export SRT subtitles with speaker names"
- "Export audio only as WAV (48kHz, 24-bit)"

**Project Management:**
- "Save this project as 'Interview_Edit_v3'"
- "What's my current timeline duration?"
- "How many clips are on the timeline?"
- "Show me project settings"
- "List all markers on the timeline"
- "Create a backup of this project with all media"

**Batch Operations:**
- "Batch rename all clips with pattern 'camera_{index}_{originalname}'"
- "Apply color correction preset 'Warm Sunset' to all clips on video track 1"
- "Normalize all audio clips to -16 LUFS"
- "Generate proxies for all 4K clips"
- "Transcribe all untranscribed clips"

**Advanced Workflows:**
- "Create a multicam sequence from clips labeled 'camA', 'camB', 'camC', sync on audio"
- "Extract voiceover to a new audio track and normalize to -16 LUFS"
- "Trim silence >2s, transcribe remaining, generate SRT with speaker names, export 1080p MP4"
- "Find all B-roll clips (no speech) and create a separate sequence"
- "Auto-sync audio from external recorder with video clips based on waveform"

**Technical Implementation:**

**Project Architecture:**

```plaintext
src/
├── components/
│   ├── MediaBin/
│   │   ├── MediaBin.tsx
│   │   ├── MediaItem.tsx
│   │   ├── ThumbnailGenerator.ts
│   │   └── MediaBin.module.css
│   ├── SourcePreview/
│   │   ├── SourcePreview.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── TransportControls.tsx
│   │   ├── Waveform.tsx
│   │   └── SourcePreview.module.css
│   ├── TimelinePreview/
│   │   ├── TimelinePreview.tsx
│   │   ├── CompositeRenderer.ts
│   │   ├── Scopes.tsx (waveform, vectorscope, histogram)
│   │   └── TimelinePreview.module.css
│   ├── Timeline/
│   │   ├── Timeline.tsx
│   │   ├── Track.tsx
│   │   ├── Clip.tsx
│   │   ├── Marker.tsx
│   │   ├── Playhead.tsx
│   │   ├── TimelineRuler.tsx
│   │   ├── TimelineCanvas.ts (OffscreenCanvas rendering)
│   │   ├── WaveformRenderer.ts
│   │   └── Timeline.module.css
│   ├── ChatPanel/
│   │   ├── ChatPanel.tsx
│   │   ├── Message.tsx
│   │   ├── CommandPreviewCard.tsx
│   │   ├── ConfidenceIndicator.tsx
│   │   ├── CommandSuggestions.tsx
│   │   ├── ModelSelector.tsx
│   │   └── ChatPanel.module.css
│   ├── TranscriptPanel/
│   │   ├── TranscriptPanel.tsx
│   │   ├── TranscriptWord.tsx
│   │   ├── SpeakerSegment.tsx
│   │   ├── SpeakerChip.tsx
│   │   ├── TranscriptWaveform.tsx
│   │   └── TranscriptPanel.module.css
│   ├── TopMenu/
│   │   ├── MenuBar.tsx
│   │   └── MenuBar.module.css
│   ├── PropertiesPanel/
│   │   ├── PropertiesPanel.tsx
│   │   ├── TransformControls.tsx
│   │   ├── EffectControls.tsx
│   │   ├── ColorCorrection.tsx
│   │   ├── KeyframeEditor.tsx
│   │   └── PropertiesPanel.module.css
```

**Data Structures:**

```typescript
// Project structure
interface Project {
  id: string; // UUID
  name: string;
  version: string; // Schema version for migrations
  createdAt: string; // ISO timestamp
  modifiedAt: string;
  
  settings: {
    width: number;
    height: number;
    fps: number;
    sampleRate: number;
    timecodeStart: string; // HH:MM:SS:FF
    dropFrame: boolean;
    pixelAspectRatio: number; // Usually 1.0
  };
  
  media: MediaItem[];
  timeline: Timeline;
  transcripts: Transcript[];
  chatHistory: ChatMessage[];
  
  manifest: {
    modelVersions: {
      asr: string; // "whisper-tiny-v1"
      chat: string; // "Phi-3-mini-4k"
      vision: string; // "clip-vit-base-patch32"
    };
    mediaHashes: Record<string, string>; // mediaId -> CRC32 hash
    exportHistory: ExportRecord[];
  };
}

interface MediaItem {
  id: string;
  file: File;
  name: string;
  path?: string; // For relinking
  mediaHash: string; // CRC32
  
  // Video properties
  duration: number; // seconds
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
  thumbnail: Blob;
  thumbnailStrip: Blob[]; // Array of thumbnails every N seconds
  waveform: Float32Array; // Audio waveform data
  proxy?: {
    file: Blob;
    resolution: string; // "480p"
  };
  
  // Metadata
  transcription?: {
    text: string;
    segments: TranscriptSegment[];
    language: string;
    confidence: number;
  };
  
  sceneChanges?: number[]; // Array of frame numbers
  
  importedAt: string;
}

interface Timeline {
  id: string;
  duration: number; // Total duration in seconds
  durationFrames: number; // Total duration in frames
  
  tracks: Track[];
  markers: Marker[];
  
  // Playback state
  playhead: {
    position: number; // seconds
    frame: number;
    tc: string; // HH:MM:SS:FF
  };
  
  selection: {
    inPoint?: number; // seconds
    outPoint?: number;
    selectedClips: string[]; // Clip IDs
    selectedTrack?: string; // Track ID
  };
  
  // View state
  zoom: number; // pixels per second
  scrollX: number;
  scrollY: number;
}

interface Track {
  id: string;
  type: 'video' | 'audio';
  name: string;
  index: number; // Stack order
  
  locked: boolean;
  muted: boolean;
  solo: boolean;
  visible: boolean;
  
  clips: Clip[];
  
  // Audio-specific
  volume?: number; // dB
  pan?: number; // -1.0 (L) to 1.0 (R)
}

interface Clip {
  id: string;
  mediaId: string;
  trackId: string;
  
  // Timeline position
  start: number; // Position on timeline (seconds)
  startFrame: number; // Position on timeline (frames)
  duration: number; // Clip duration on timeline (seconds)
  durationFrames: number;
  
  // Source trimming
  offset: number; // Trim start from source (seconds)
  offsetFrame: number;
  trimEnd: number; // Trim end from source (seconds)
  trimEndFrame: number;
  
  // Speed & time remapping
  speed: number; // 1.0 = normal, 0.5 = half speed, 2.0 = double speed
  reverse: boolean;
  
  // Effects
  effects: Effect[];
  
  // Transition
  transition?: {
    type: 'fade' | 'dissolve' | 'wipe' | 'dip' | 'custom';
    duration: number; // seconds
    durationFrames: number;
    easing: string; // CSS easing function
    params?: Record<string, any>; // Transition-specific params
  };
  
  // Transform (video only)
  transform?: {
    position: { x: number; y: number }; // pixels
    scale: { x: number; y: number }; // percentage (100 = original)
    rotation: number; // degrees
    anchorPoint: { x: number; y: number }; // normalized (0-1)
    opacity: number; // 0-100
    blendMode: string; // 'normal', 'multiply', 'screen', etc.
  };
  
  // Audio (audio clips or video with audio)
  audio?: {
    volume: number; // dB
    pan: number; // -1.0 to 1.0
    muted: boolean;
  };
  
  // Keyframes for animated properties
  keyframes?: Record<string, Keyframe[]>;
  
  // Metadata
  name: string;
  color?: string; // Clip color label
  notes?: string;
}

interface Effect {
  id: string;
  type: string; // 'brightness', 'blur', 'color_correction', etc.
  enabled: boolean;
  params: Record<string, any>;
  
  // For custom shaders
  shader?: {
    vertex: string;
    fragment: string;
    uniforms: Record<string, any>;
  };
}

interface Keyframe {
  time: number; // seconds
  frame: number;
  value: any; // Type depends on property
  easing?: string;
}

interface Marker {
  id: string;
  position: number; // seconds
  frame: number;
  tc: string;
  
  name: string;
  notes?: string;
  color: string; // Hex color
  category: 'chapter' | 'cue' | 'speaker' | 'scene' | 'todo' | 'custom';
  
  metadata?: {
    speakerId?: string;
    speakerName?: string;
    transcriptSegmentId?: string;
    chapterTitle?: string;
  };
}

interface Transcript {
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

interface TranscriptSegment {
  id: string;
  start: number; // seconds
  end: number;
  startFrame: number;
  endFrame: number;
  
  text: string;
  words: TranscriptWord[];
  
  speakerId: string;
  confidence: number; // 0.0 - 1.0
}

interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  startFrame: number;
  endFrame: number;
  confidence: number;
}

interface Speaker {
  id: string; // Auto-generated: "speaker_0", "speaker_1"
  displayName: string; // User-editable: "John Doe"
  color: string; // UI color for this speaker
  segmentIds: string[]; // References to segments
  
  metadata?: {
    title?: string; // "Senior Engineer"
    company?: string;
    notes?: string;
  };
}

interface TranscriptEdit {
  id: string;
  timestamp: string;
  type: 'word_edit' | 'time_adjust' | 'speaker_merge' | 'speaker_split' | 'speaker_rename';
  segmentId: string;
  wordIndex?: number;
  oldValue: any;
  newValue: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  
  // For assistant messages
  command?: Command;
  executionResult?: {
    success: boolean;
    error?: string;
    affectedClips?: string[];
    undoToken?: string;
  };
}

interface ExportRecord {
  id: string;
  timestamp: string;
  format: string; // 'mp4', 'webm', 'fcpxml', 'edl', etc.
  resolution: string;
  fps: number;
  duration: number;
  fileSize: number;
  settings: Record<string, any>;
}
```

**Transactional Edit System:**
```typescript
// transaction.utils.ts
interface Transaction {
  id: string;
  label: string; // "LLM command: Increase brightness"
  timestamp: string;
  
  state: {
    before: any; // Deep clone of affected state
    after: any;
  };
  
  commands: Command[];
  executed: boolean;
}

class TransactionManager {
  private undoStack: Transaction[] = [];
  private redoStack: Transaction[] = [];
  private maxStackSize = 100;
  
  beginTransaction(label: string): string {
    const transactionId = uuid();
    // Store current state snapshot
    return transactionId;
  }
  
  commitTransaction(transactionId: string, affectedState: any) {
    const transaction: Transaction = {
      id: transactionId,
      label: this.getLabel(transactionId),
      timestamp: new Date().toISOString(),
      state: {
        before: this.getBeforeState(transactionId),
        after: affectedState
      },
      commands: this.getCommands(transactionId),
      executed: true
    };
    
    this.undoStack.push(transaction);
    this.redoStack = []; // Clear redo stack
    
    // Limit stack size
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
  }
  
  rollbackTransaction(transactionId: string) {
    // Restore before state
    const transaction = this.findTransaction(transactionId);
    if (transaction) {
      this.applyState(transaction.state.before);
    }
  }
  
  undo(): boolean {
    const transaction = this.undoStack.pop();
    if (!transaction) return false;
    
    this.applyState(transaction.state.before);
    this.redoStack.push(transaction);
    return true;
  }
  
  redo(): boolean {
    const transaction = this.redoStack.pop();
    if (!transaction) return false;
    
    this.applyState(transaction.state.after);
    this.undoStack.push(transaction);
    return true;
  }
  
  getUndoLabel(): string | null {
    const transaction = this.undoStack[this.undoStack.length - 1];
    return transaction ? transaction.label : null;
  }
  
  getRedoLabel(): string | null {
    const transaction = this.redoStack[this.redoStack.length - 1];
    return transaction ? transaction.label : null;
  }
  
  private applyState(state: any) {
    // Apply state to Zustand store
    useProjectStore.setState(state);
  }
}

export const transactionManager = new TransactionManager();
```

**Command Execution with Transactions:**
```typescript
// command-executor.service.ts
class CommandExecutor {
  async execute(command: Command): Promise<ExecutionResult> {
    // Start transaction
    const transactionId = transactionManager.beginTransaction(
      `LLM command: ${command.metadata.userPhrase}`
    );
    
    try {
      // Show preview if confidence is low
      if (command.confidence < 0.6) {
        const confirmed = await this.showConfirmationDialog(command);
        if (!confirmed) {
          transactionManager.rollbackTransaction(transactionId);
          return { success: false, cancelled: true };
        }
      }
      
      // Execute action
      const result = await this.executeAction(command);
      
      // Commit transaction
      transactionManager.commitTransaction(transactionId, result.newState);
      
      return { success: true, result };
      
    } catch (error) {
      // Rollback on error
      transactionManager.rollbackTransaction(transactionId);
      return { success: false, error: error.message };
    }
  }
  
  private async executeAction(command: Command): Promise<any> {
    switch (command.action) {
      case 'cut':
        return this.handleCut(command);
      case 'split':
        return this.handleSplit(command);
      case 'add_transition':
        return this.handleAddTransition(command);
      case 'transcribe':
        return this.handleTranscribe(command);
      case 'export':
        return this.handleExport(command);
      case 'compound':
        return this.handleCompound(command);
      default:
        throw new Error(`Unknown action: ${command.action}`);
    }
  }
  
  private async handleCut(command: Command): Promise<any> {
    const { target, time, params } = command;
    
    // Get clip from store
    const clip = useTimelineStore.getState().getClip(target.clipId);
    if (!clip) throw new Error('Clip not found');
    
    // Perform cut (update clip trim points)
    const updatedClip = {
      ...clip,
      offset: time.start.seconds,
      offsetFrame: time.start.frame,
      trimEnd: time.end.seconds,
      trimEndFrame: time.end.frame,
      duration: time.end.seconds - time.start.seconds,
      durationFrames: time.end.frame - time.start.frame
    };
    
    // Update store
    useTimelineStore.getState().updateClip(target.clipId, updatedClip);
    
    return { newState: useProjectStore.getState() };
  }
  
  private async handleCompound(command: Command): Promise<any> {
    // Execute sub-actions sequentially
    for (const subAction of command.subActions) {
      await this.executeAction(subAction);
    }
    
    return { newState: useProjectStore.getState() };
  }
  
  private async showConfirmationDialog(command: Command): Promise<boolean> {
    // Show UI dialog with command preview
    return new Promise((resolve) => {
      // Implementation: show modal with command.preview details
      // User can approve or reject
    });
  }
}

export const commandExecutor = new CommandExecutor();
```

**Frame-Accurate Timecode Utilities:**
```typescript
// frame-converter.utils.ts
class FrameConverter {
  constructor(
    private fps: number,
    private dropFrame: boolean = false
  ) {}
  
  /**
   * Convert seconds to frame number
   */
  secondsToFrames(seconds: number): number {
    return Math.round(seconds * this.fps);
  }
  
  /**
   * Convert frame number to seconds
   */
  framesToSeconds(frames: number): number {
    return frames / this.fps;
  }
  
  /**
   * Convert seconds to timecode string HH:MM:SS:FF
   */
  secondsToTimecode(seconds: number): string {
    const totalFrames = this.secondsToFrames(seconds);
    return this.framesToTimecode(totalFrames);
  }
  
  /**
   * Convert frame number to timecode string
   */
  framesToTimecode(frames: number): string {
    if (this.dropFrame) {
      return this.framesToDropFrameTimecode(frames);
    } else {
      return this.framesToNonDropTimecode(frames);
    }
  }
  
  /**
   * Convert timecode string to seconds
   */
  timecodeToSeconds(tc: string): number {
    const frames = this.timecodeToFrames(tc);
    return this.framesToSeconds(frames);
  }
  
  /**
   * Convert timecode string to frame number
   */
  timecodeToFrames(tc: string): number {
    const parts = tc.split(':');
    if (parts.length !== 4) throw new Error('Invalid timecode format');
    
    const [hh, mm, ss, ff] = parts.map(Number);
    
    if (this.dropFrame) {
      return this.dropFrameTimecodeToFrames(hh, mm, ss, ff);
    } else {
      return hh * 3600 * this.fps + mm * 60 * this.fps + ss * this.fps + ff;
    }
  }
  
  private framesToNonDropTimecode(frames: number): string {
    const ff = frames % this.fps;
    const totalSeconds = Math.floor(frames / this.fps);
    const ss = totalSeconds % 60;
    const mm = Math.floor(totalSeconds / 60) % 60;
    const hh = Math.floor(totalSeconds / 3600);
    
    return `${this.pad(hh)}:${this.pad(mm)}:${this.pad(ss)}:${this.pad(ff)}`;
  }
  
  private framesToDropFrameTimecode(frames: number): string {
    // Drop frame calculation (for 29.97fps, 59.94fps)
    // Drop 2 frames every minute except every 10th minute
    const D = Math.floor(this.fps * 0.066666); // Drop frames per minute
    const framesPerMinute = Math.round(this.fps * 60);
    const framesPer10Minutes = framesPerMinute * 10;
    
    const d = Math.floor(frames / framesPer10Minutes);
    const m = frames % framesPer10Minutes;
    
    const adjustedFrames = frames + 9 * D * d + D * Math.floor((m - D) / (framesPerMinute - D));
    
    return this.framesToNonDropTimecode(adjustedFrames);
  }
  
  private dropFrameTimecodeToFrames(hh: number, mm: number, ss: number, ff: number): number {
    // Reverse drop frame calculation
    const totalMinutes = hh * 60 + mm;
    const D = Math.floor(this.fps * 0.066666);
    
    const frameNumber = 
      (hh * 3600 + mm * 60 + ss) * this.fps + ff -
      D * (totalMinutes - Math.floor(totalMinutes / 10));
    
    return frameNumber;
  }
  
  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }
  
  /**
   * Snap to nearest frame
   */
  snapToNearestFrame(seconds: number): number {
    const frames = this.secondsToFrames(seconds);
    return this.framesToSeconds(frames);
  }
}

export function createFrameConverter(fps: number, dropFrame: boolean = false) {
  return new FrameConverter(fps, dropFrame);
}
```

**Interchange Format Export:**
```typescript
// interchange.service.ts

/**
 * Export Final Cut Pro XML
 */
async function exportFCPXML(
  project: Project, 
  options: {
    handles?: number; // seconds
    includeMarkers?: boolean;
    markerMetadata?: string[];
  }
): Promise<string> {
  const { timeline, settings, media } = project;
  const handles = options.handles || 0;
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    ${media.map(m => `
    <asset id="${m.id}" name="${m.name}" uid="${m.mediaHash}" 
           src="file:///${m.path}" start="0s" 
           duration="${m.duration}s" hasVideo="1" hasAudio="1">
      <media-rep kind="original-media"/>
    </asset>
    `).join('')}
  </resources>
  
  <library>
    <event name="${project.name}">
      <project name="${project.name}">
        <sequence format="${settings.width}x${settings.height}p${settings.fps}" 
                  tcStart="${settings.timecodeStart}" tcFormat="${settings.dropFrame ? 'DF' : 'NDF'}">
          <spine>
            ${timeline.tracks
              .filter(t => t.type === 'video')
              .flatMap(track => track.clips.map(clip => {
                const mediaItem = media.find(m => m.id === clip.mediaId);
                const offset = clip.offset - handles;
                const duration = clip.duration + (handles * 2);
                
                return `
            <asset-clip name="${clip.name}" 
                       offset="${clip.start}s" 
                       ref="${clip.mediaId}" 
                       duration="${duration}s"
                       start="${Math.max(0, offset)}s"
                       ${clip.transition ? `transitionIn="${clip.transition.type}" transitionInDuration="${clip.transition.duration}s"` : ''}>
              ${clip.effects.map(e => `
              <filter-video ref="${e.type}" name="${e.type}">
                ${Object.entries(e.params).map(([k, v]) => `
                <param name="${k}" key="${k}" value="${v}"/>
                `).join('')}
              </filter-video>
              `).join('')}
              
              ${clip.transform ? `
              <adjust-transform position="${clip.transform.position.x} ${clip.transform.position.y}" 
                              scale="${clip.transform.scale.x / 100} ${clip.transform.scale.y / 100}"
                              rotation="${clip.transform.rotation}"/>
              ` : ''}
            </asset-clip>
                `;
              })).join('')}
          </spine>
          
          ${options.includeMarkers ? timeline.markers.map(marker => `
          <marker start="${marker.position}s" duration="0.033s" value="${marker.name}">
            ${options.markerMetadata?.includes('speakerName') && marker.metadata?.speakerName ? `
            <note>Speaker: ${marker.metadata.speakerName}</note>
            ` : ''}
          </marker>
          `).join('') : ''}
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
  
  return xml;
}

/**
 * Export EDL (Edit Decision List)
 */
async function exportEDL(project: Project): Promise<string> {
  const { timeline, settings } = project;
  
  let edl = `TITLE: ${project.name}\n`;
  edl += `FCM: ${settings.dropFrame ? 'DROP FRAME' : 'NON-DROP FRAME'}\n\n`;
  
  const converter = createFrameConverter(settings.fps, settings.dropFrame);
  
  let eventNumber = 1;
  
  for (const track of timeline.tracks.filter(t => t.type === 'video')) {
    for (const clip of track.clips) {
      const sourceIn = converter.secondsToTimecode(clip.offset);
      const sourceOut = converter.secondsToTimecode(clip.offset + clip.duration);
      const recordIn = converter.secondsToTimecode(clip.start);
      const recordOut = converter.secondsToTimecode(clip.start + clip.duration);
      
      edl += `${String(eventNumber).padStart(3, '0')}  `;
      edl += `${clip.mediaId.substring(0, 8).toUpperCase()} V     `;
      edl += `C        `;
      edl += `${sourceIn} ${sourceOut} ${recordIn} ${recordOut}\n`;
      
      if (clip.name) {
        edl += `* FROM CLIP NAME: ${clip.name}\n`;
      }
      
      eventNumber++;
    }
  }
  
  return edl;
}

/**
 * Export Premiere XML
 */
async function exportPremiereXML(project: Project): Promise<string> {
  // Similar to FCPXML but with Premiere-specific format
  // Implementation details...
  return `<?xml version="1.0" encoding="UTF-8"?>
<xmeml version="5">
  <!-- Premiere XML structure -->
</xmeml>`;
}

/**
 * Export SRT subtitles
 */
async function exportSRT(
  transcript: Transcript,
  options: {
    includeSpeakers?: boolean;
    maxLineLength?: number;
    maxLinesPerCue?: number;
  }
): Promise<string> {
  const { segments } = transcript;
  const { includeSpeakers = false, maxLineLength = 42, maxLinesPerCue = 2 } = options;
  
  let srt = '';
  let cueNumber = 1;
  
  for (const segment of segments) {
    const speaker = transcript.speakers.find(s => s.id === segment.speakerId);
    const speakerLabel = includeSpeakers && speaker ? `[${speaker.displayName}] ` : '';
    
    // Break text into lines
    const words = segment.text.split(' ');
    const lines: string[] = [];
    let currentLine = speakerLabel;
    
    for (const word of words) {
      if (currentLine.length + word.length + 1 > maxLineLength) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += (currentLine ? ' ' : '') + word;
      }
    }
    if (currentLine) lines.push(currentLine.trim());
    
    // Group lines into cues
    for (let i = 0; i < lines.length; i += maxLinesPerCue) {
      const cueLines = lines.slice(i, i + maxLinesPerCue);
      const cueText = cueLines.join('\n');
      
      // Calculate timing for this cue
      const wordRatio = i / lines.length;
      const start = segment.start + (segment.end - segment.start) * wordRatio;
      const end = segment.start + (segment.end - segment.start) * Math.min(1, (i + maxLinesPerCue) / lines.length);
      
      srt += `${cueNumber}\n`;
      srt += `${formatSRTTimecode(start)} --> ${formatSRTTimecode(end)}\n`;
      srt += `${cueText}\n\n`;
      
      cueNumber++;
    }
  }
  
  return srt;
}

function formatSRTTimecode(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

export const interchangeService = {
  exportFCPXML,
  exportEDL,
  exportPremiereXML,
  exportSRT,
  // exportAAF, exportWebVTT, exportJSON, etc.
};
```

**Performance Optimization:**

1. **Proxy Workflow:**
```typescript
   // Generate proxy on import
   async function generateProxy(mediaItem: MediaItem): Promise<Blob> {
     const composition = new Composition({
       width: 854, // 480p
       height: 480,
       fps: mediaItem.fps
     });
     
     const clip = new VideoClip(mediaItem.file, {
       start: 0,
       duration: mediaItem.duration
     });
     
     composition.add(clip);
     
     return await composition.render({
       format: 'mp4',
       quality: 'low'
     });
   }
```

2. **Web Workers:**
   ```typescript
   // transcription.worker.ts
   import { pipeline } from '@xenova/transformers';
   
   let transcriber: any = null;
   
   self.onmessage = async (e) => {
     const { type, data } = e.data;
     
     if (type === 'init') {
       transcriber = await pipeline(
         'automatic-speech-recognition',
         data.model,
         {
           progress_callback: (progress) => {
             self.postMessage({ type: 'progress', progress });
           }
         }
       );
       self.postMessage({ type: 'ready' });
     }
     
     if (type === 'transcribe') {
       const result = await transcriber(data.audio, {
         return_timestamps: 'word',
         chunk_length_s: 30
       });
       
       self.postMessage({ type: 'result', result });
     }
   };
   ```

3. **Time-Sliced Export:**
   ```typescript
   // export.worker.ts
   async function timeSlicedExport(
     composition: Composition,
     options: ExportOptions
   ): Promise<WritableStream> {
     const stream = new WritableStream();
     const chunkDuration = 5; // Process 5 seconds at a time
     const totalDuration = composition.duration;
     
     for (let time = 0; time < totalDuration; time += chunkDuration) {
       const chunkEnd = Math.min(time + chunkDuration, totalDuration);
       
       const chunkBlob = await composition.renderChunk({
         start: time,
         end: chunkEnd,
         format: options.format
       });
       
       await stream.write(chunkBlob);
       
       // Report progress
       const progress = (time / totalDuration) * 100;
       self.postMessage({ type: 'progress', progress });
     }
     
     return stream;
   }
   ```

4. **Canvas Optimization:**
   ```typescript
   // timeline-canvas.ts
   class TimelineRenderer {
     private offscreen: OffscreenCanvas;
     private ctx: OffscreenCanvasRenderingContext2D;
     private visibleRange: { start: number; end: number };
     
     render() {
       // Only render visible portion
       const clips = this.getVisibleClips(this.visibleRange);
       
       this.ctx.clearRect(0, 0, this.offscreen.width, this.offscreen.height);
       
       for (const clip of clips) {
         this.renderClip(clip);
       }
       
       // Debounce during scrubbing
       requestAnimationFrame(() => this.render());
     }
     
     private getVisibleClips(range: { start: number; end: number }) {
       return this.clips.filter(clip => 
         clip.start < range.end && (clip.start + clip.duration) > range.start
       );
     }
   }
   ```

5. **Memory Management:**
   ```typescript
   // model-manager.service.ts
   class ModelManager {
     private cache = new Map<string, any>();
     private maxCacheSize = 3; // Keep max 3 models in memory
     
     async loadModel(name: string, type: string): Promise<any> {
       if (this.cache.has(name)) {
         return this.cache.get(name);
       }
       
       // Check cache size
       if (this.cache.size >= this.maxCacheSize) {
         // Remove least recently used
         const firstKey = this.cache.keys().next().value;
         this.cache.delete(firstKey);
       }
       
       const model = await pipeline(type, name);
       this.cache.set(name, model);
       
       return model;
     }
     
     clearCache() {
       this.cache.clear();
     }
     
     getCacheInfo() {
       return {
         size: this.cache.size,
         models: Array.from(this.cache.keys())
       };
     }
   }
   ```

**Motion Graphics Templates:**

```typescript
// Lower third JSON structure
interface LowerThirdTemplate {
  type: 'lower_third';
  duration: number; // seconds
  animation: {
    entry: {
      type: 'translateX' | 'translateY' | 'scale' | 'opacity';
      from: string | number;
      to: string | number;
      duration: number;
      easing: string;
    };
    exit?: {
      type: string;
      from: string | number;
      to: string | number;
      duration: number;
      easing: string;
    };
  };
  layers: {
    name: string;
    type: 'shape' | 'text';
    shape?: 'rect' | 'roundedRect' | 'circle';
    text?: string;
    font?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    opacity?: number;
    blur?: number;
    position: { x: number | string; y: number | string };
    size: { width: number | string; height: number | string };
  }[];
}

// Example lower third
const lowerThirdExample: LowerThirdTemplate = {
  type: 'lower_third',
  duration: 4.0,
  animation: {
    entry: {
      type: 'translateX',
      from: '-100%',
      to: '0%',
      duration: 0.6,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    },
    exit: {
      type: 'opacity',
      from: 1,
      to: 0,
      duration: 0.4,
      easing: 'ease-out'
    }
  },
  layers: [
    {
      name: 'background',
      type: 'shape',
      shape: 'roundedRect',
      backgroundColor: '#0B1224',
      opacity: 0.85,
      blur: 6,
      position: { x: '5%', y: '80%' },
      size: { width: '60%', height: '15%' }
    },
    {
      name: 'name',
      type: 'text',
      text: 'John Doe',
      font: 'Inter',
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      position: { x: '8%', y: '82%' },
      size: { width: 'auto', height: 'auto' }
    },
    {
      name: 'title',
      type: 'text',
      text: 'Senior Engineer',
      font: 'Inter',
      fontSize: 14,
      fontWeight: 'regular',
      color: '#CCCCCC',
      position: { x: '8%', y: '88%' },
      size: { width: 'auto', height: 'auto' }
    }
  ]
};
```

**Browser Requirements:**

- **Chrome/Edge 94+** (recommended) - Full WebCodecs and WebGPU support
- **Safari 16.4+** - WebCodecs support (limited WebGPU)
- **Firefox 130+** - WebCodecs support (experimental)
- **Hardware**: 
  - Minimum 8GB RAM (16GB recommended for 4K)
  - Modern CPU (2018+ for hardware decode)
  - GPU with WebGPU support for effects
  - 2GB+ free disk space for cache and models
  - SSD recommended for proxy storage

**Features & Limitations:**

**Advantages:**
- ✅ Runs 100% offline after initial load
- ✅ No file upload to servers (privacy-focused)
- ✅ Native performance via WebCodecs
- ✅ GPU acceleration for effects
- ✅ Tiny bundle size (~75KB core + models)
- ✅ Hardware-accelerated encoding/decoding
- ✅ Long-form video support
- ✅ Professional interchange formats (FCPXML, EDL, AAF)
- ✅ Frame-accurate editing
- ✅ Transactional undo/redo
- ✅ Word-level transcript editing

**Limitations:**
- ⚠️ Initial AI model downloads (200-800MB depending on selections)
- ⚠️ Processing speed depends on hardware
- ⚠️ Large 4K files may require significant RAM (16GB+)
- ⚠️ Some codecs limited by browser WebCodecs support
- ⚠️ WebGPU effects require compatible GPU
- ⚠️ Export speed slower than native apps due to browser constraints
- ⚠️ No ProRes or DNxHD codec support (browser limitation)

**Deployment:**

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Deploy to static host
npm run deploy

# Or deploy to:
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages
- Any static file server
```

**Essential Keyboard Shortcuts:**

```typescript
const keyboardShortcuts = {
  playback: {
    'Space': 'Play/Pause',
    'J': 'Play backward',
    'K': 'Pause',
    'L': 'Play forward',
    'Left Arrow': 'Step back 1 frame',
    'Right Arrow': 'Step forward 1 frame',
    'Shift+Left': 'Jump back 1 second',
    'Shift+Right': 'Jump forward 1 second'
  },
  editing: {
    'I': 'Mark in',
    'O': 'Mark out',
    'S': 'Split clip at playhead',
    'C': 'Razor tool',
    'V': 'Selection tool',
    'Delete': 'Delete selected',
    'Backspace': 'Ripple delete'
  },
  timeline: {
    'M': 'Add marker',
    'Shift+M': 'Go to next marker',
    'Alt+M': 'Delete marker',
    '+': 'Zoom in',
    '-': 'Zoom out',
    'Shift+Z': 'Fit timeline to window'
  },
  general: {
    'Cmd/Ctrl+Z': 'Undo',
    'Cmd/Ctrl+Shift+Z': 'Redo',
    'Cmd/Ctrl+C': 'Copy',
    'Cmd/Ctrl+V': 'Paste',
    'Cmd/Ctrl+D': 'Duplicate',
    'Cmd/Ctrl+S': 'Save project',
    'Cmd/Ctrl+E': 'Export'
  }
};
```

**Model Download UI:**

```typescript
// Show model selection and download status
interface ModelInfo {
  name: string;
  size: string;
  speed: string;
  quality: string;
  downloaded: boolean;
  downloading: boolean;
  progress: number;
}

const modelOptions: Record<string, ModelInfo> = {
  'whisper-tiny': {
    name: 'Whisper Tiny',
    size: '75 MB',
    speed: 'Fast',
    quality: 'Good',
    downloaded: false,
    downloading: false,
    progress: 0
  },
  'distil-whisper': {
    name: 'Distil-Whisper',
    size: '150 MB',
    speed: 'Medium',
    quality: 'Excellent',
    downloaded: false,
    downloading: false,
    progress: 0
  }
};
```
