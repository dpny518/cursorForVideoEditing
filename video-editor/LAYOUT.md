# Video Editor Layout

## Panel Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Video Editor                          │
├───────────┬──────────────────────┬──────────────────────────────┤
│           │                      │                              │
│  Media    │  Preview Panel       │  Timeline Preview Panel      │
│  Bin      │  ┌────────────────┐  │  ┌────────────────────────┐ │
│           │  │ 🎬 Video  📝   │  │  │ 🎬 Video  📝 Transcript│ │
│  - Video  │  └────────────────┘  │  └────────────────────────┘ │
│    Items  │                      │                              │
│  - Upload │  Toggle between:     │  Toggle between:             │
│  - Status │  • Video Preview     │  • Timeline Preview          │
│           │  • Transcript View   │  • Transcript View           │
│           │                      │                              │
├───────────┴──────────────────────┴──────────────────────────────┤
│                                                                  │
│  Timeline (Bottom)                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  [Clip 1] [Clip 2] [Clip 3]                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Panel Functions

### Left: Media Bin
- Upload videos/audio
- View transcription status
- Select media for preview

### Middle: Preview Panel (Toggleable)
**🎬 Video Mode:**
- Preview selected video
- Playback controls
- "+ Timeline" button to add to timeline

**📝 Transcript Mode:**
- View transcript segments
- Timestamps and confidence scores
- Processing status

### Right: Timeline Preview Panel (Toggleable)
**🎬 Video Mode:**
- Timeline composition preview (coming soon)

**📝 Transcript Mode:**
- Same transcript view as middle panel
- Synchronized with selected media

### Bottom: Timeline
- Visual timeline editor
- Add/remove clips
- Sequence management

## Usage

1. **Upload a video** to Media Bin
2. **Click the video** to select it
3. **Click "🎬 Video"/"📝 Transcript"** buttons to toggle views
4. **Both middle and right panels** can independently show video or transcript
5. **Click "+ Timeline"** in video preview to add clip to timeline
