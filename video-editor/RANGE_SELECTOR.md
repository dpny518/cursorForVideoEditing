# iMovie-Style Range Selector

## Feature Overview

The video preview now includes an iMovie-style range selector that allows you to select specific portions of a video clip before adding it to the timeline.

## Visual Layout

```
┌─────────────────────────────────────────────────┐
│  Video Preview                                  │
│  [Video playback area]                          │
├─────────────────────────────────────────────────┤
│  ▶  0:09 / 1:09   [────────●────────] +Timeline │
├─────────────────────────────────────────────────┤
│  Range Selector                                 │
│  ┌───────────────────────────────────────────┐  │
│  │▓▓│─────────────────────────────│▓▓▓▓▓▓▓▓▓│  │
│  │▓▓│  Selected Range (0:15)      │▓▓▓▓▓▓▓▓▓│  │
│  │▓▓│                             │▓▓▓▓▓▓▓▓▓│  │
│  └───────────────────────────────────────────┘  │
│  0:05                                     1:09  │
└─────────────────────────────────────────────────┘
```

## How to Use

### 1. **Initial State**
- When you select a video, the entire duration is selected by default
- Orange handles appear at the start and end
- The selection shows the duration in the center

### 2. **Drag Start Handle (Left)**
- Drag the **left orange handle** to set the in-point
- Clip will start from this position

### 3. **Drag End Handle (Right)**
- Drag the **right orange handle** to set the out-point
- Clip will end at this position

### 4. **Move Entire Selection**
- Click and drag the **middle area** (between handles)
- Moves the entire selection range while maintaining duration

### 5. **Add to Timeline**
- Click "+ Timeline" button
- Only the selected portion is added
- Timeline clip shows the selected duration

## Visual Indicators

| Element | Description |
|---------|-------------|
| **Orange Border** | Selected range boundary |
| **Orange Handles** | Draggable in/out points |
| **White Line** | Visual grip on handles |
| **Dimmed Areas** | Parts not included in selection |
| **Duration Label** | Length of selected range |
| **Time Markers** | Start and end timestamps |

## Technical Details

The selection range:
- Minimum duration: 0.1 seconds
- Handles have ew-resize cursor
- Middle area has move cursor
- Dimmed areas are 60% transparent black
- Selected area has 10% orange tint

## Benefits

✅ **Precise Editing**: Select exact portions of clips
✅ **Non-Destructive**: Original media is unchanged
✅ **Visual Feedback**: See exactly what you're adding
✅ **Smooth Interaction**: Drag handles with pixel precision
✅ **iMovie Familiar**: Matches industry-standard UX

## Example Workflow

1. Upload a 1-minute video
2. Select video in Media Bin
3. Video loads in preview with full range selected
4. Drag left handle to 0:10 (start at 10 seconds)
5. Drag right handle to 0:25 (end at 25 seconds)
6. Duration shows "0:15" (15 seconds selected)
7. Click "+ Timeline"
8. 15-second clip appears in timeline
9. Repeat with different ranges from same video

This allows you to create multiple clips from a single source video!
