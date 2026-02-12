# FFmpeg Playground Server - Documentation

## Overview

The FFmpeg Playground Server is a Node.js backend that wraps FFmpeg (a powerful video processing tool) and exposes its functionality through simple REST APIs. Think of it as a "video processing service" that your frontend can call to manipulate videos.

---

## What It Does

This server can:

| Feature | What It Means |
|---------|---------------|
| **Concatenate videos** | Join multiple videos into one |
| **Video transitions** | Add fade, crossfade, wipe, or slide effects between clips |
| **Convert formats** | Change MP4 to WebM, AVI to MP4, etc. |
| **Extract audio** | Pull the audio track out as MP3 |
| **Create thumbnails** | Generate a still image from a video |
| **Resize videos** | Change video dimensions |
| **Trim videos** | Cut out a portion of a video |
| **Add watermarks** | Overlay an image on a video |
| **Apply filters** | Add effects like grayscale, blur, sepia |
| **Speed adjustment** | Fit video to a target duration (slow/speed up) |
| **Zoom effects** | Ken Burns-style zoom in/out with center point control |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FFmpeg Playground Server                  │
│                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   Express   │───▶│   Multer    │───▶│   FFmpeg    │    │
│   │  (Routes)   │    │  (Uploads)  │    │ (Processing)│    │
│   └─────────────┘    └─────────────┘    └─────────────┘    │
│                                               │             │
│                                               ▼             │
│                                        ┌─────────────┐      │
│                                        │   Output    │      │
│                                        │   Files     │      │
│                                        └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Components

| Component | Role |
|-----------|------|
| **Express** | Web framework that handles HTTP requests |
| **Multer** | Middleware that handles file uploads |
| **fluent-ffmpeg** | Node.js wrapper around the FFmpeg command-line tool |
| **CORS** | Allows the frontend (different port) to call this server |

---

## API Endpoints

### 1. Health Check
```
GET /api/ffmpeg-info
```
Returns whether FFmpeg is installed and working.

---

### 2. Probe File
```
POST /api/probe
Body: file (multipart/form-data)
```
Returns metadata about a video: duration, resolution, codec, etc.

---

### 3. Concatenate Videos ⭐ (Main Feature)
```
POST /api/concat
Body: files[] (multiple video files)
Optional: transition (none|fade|crossfade|wipeleft|wiperight|slideup|slidedown)
Optional: transitionDuration (0.5 to 3, default: 1)
```

**Supported Transitions:**

| Transition | Effect |
|------------|--------|
| `none` | No transition, simple concatenation |
| `fade` | Fade to/from black between clips |
| `crossfade` | Blend first video into second |
| `wipeleft` | Wipe transition to the left |
| `wiperight` | Wipe transition to the right |
| `slideup` | Slide transition upward |
| `slidedown` | Slide transition downward |

**What happens behind the scenes:**
1. Receives video files
2. Probes each file to check if it has audio and get duration
3. Builds an FFmpeg filter that:
   - Scales all videos to 1280×720
   - Sets frame rate to 30fps
   - Normalizes pixel format to yuv420p
   - Adds silent audio for videos without audio
4. If transition selected:
   - Uses `xfade` filter for video transitions
   - Uses `adelay` + `amix` + `afade` for audio overlap (keeps audio in sync)
5. Encodes output as H.264 video + AAC audio
6. Returns URL to the combined file

---

### 4. Convert Format
```
POST /api/convert
Body: file, format (e.g., "webm", "avi")
```
Converts a video to a different format.

---

### 5. Extract Audio
```
POST /api/extract-audio
Body: file
```
Extracts the audio track as an MP3 file (192kbps).

---

### 6. Create Thumbnail
```
POST /api/thumbnail
Body: file, timestamp (e.g., "00:00:05")
```
Creates a PNG image from the video at the specified time.

---

### 7. Resize Video
```
POST /api/resize
Body: file, width, height
```
Scales the video to new dimensions.

---

### 8. Trim Video
```
POST /api/trim
Body: file, start (timestamp), duration (e.g., "00:00:10")
```
Cuts a portion of the video starting at `start` for `duration` seconds.

---

### 9. Add Watermark
```
POST /api/watermark
Body: video (file), watermark (image file)
```
Overlays an image on the video (positioned at top-left).

---

### 10. Apply Filter
```
POST /api/filter
Body: file, filter (grayscale|blur|sharpen|mirror|flip|sepia|vintage|negative)
```
Applies a visual effect to the video.

---

### 11. Speed Adjustment / Fit to Duration ⭐
```
POST /api/speed
Body: file
Optional: targetDuration (seconds) - fits video to this exact duration
Optional: speed (multiplier, 0.25-4x) - if no targetDuration provided
```

Adjusts video playback speed to fit a target duration.

| Parameter | Effect |
|-----------|--------|
| `targetDuration=5` | Fits video to exactly 5 seconds |
| `speed=2` | Plays video at 2x speed (half duration) |
| `speed=0.5` | Plays video at 0.5x speed (double duration) |

**How it works:**
- Uses `setpts` filter for video speed
- Uses chained `atempo` filters for audio (maintains pitch)
- Audio tempo limited to 0.5-2.0 range per filter, so multiple filters are chained for extreme speeds

**Response includes:**
```json
{
  "originalDuration": "10.00",
  "newDuration": "5.00",
  "speedApplied": "2.00"
}
```

---

### 12. Zoom In/Out (Ken Burns Effect) ⭐
```
POST /api/zoom
Body: file
Optional: type ("in" or "out", default: "in")
Optional: startZoom (1-3, default: 1 for zoom in, 1.5 for zoom out)
Optional: endZoom (1-3, default: 1.5 for zoom in, 1 for zoom out)
Optional: centerX (0-1, default: 0.5 - horizontal center point)
Optional: centerY (0-1, default: 0.5 - vertical center point)
```

Applies a smooth Ken Burns-style zoom effect.

| Parameter | Effect |
|-----------|--------|
| `type=in` | Zooms from startZoom to endZoom (usually wider to closer) |
| `type=out` | Zooms from startZoom to endZoom (usually closer to wider) |
| `centerX=0.25` | Zoom focuses on left side of frame |
| `centerX=0.75` | Zoom focuses on right side of frame |

**How it works:**
- Upscales video to 8x resolution (reduces jitter)
- Applies `zoompan` filter with linear interpolation
- Uses `lanczos` scaling for high-quality interpolation
- Downscales back to original resolution

**Response includes:**
```json
{
  "zoomType": "in",
  "startZoom": 1,
  "endZoom": 1.5,
  "center": { "x": 0.5, "y": 0.5 }
}
```

---

## The Video Concatenation Challenge

### Why Can't We Just Stitch Videos Together?

When you have two videos, they might be **completely different**:

| Property | Video 1 | Video 2 |
|----------|---------|---------|
| Resolution | 1920×1080 | 1280×720 |
| Frame Rate | 30 fps | 24 fps |
| Codec | H.264 | H.265 |
| Audio | Yes | No |

If we just append them, the video player gets confused and the result is broken.

### Our Solution

We **normalize everything** before joining:

1. **Scale** all videos to 1280×720 (with letterboxing if needed)
2. **Set frame rate** to 30fps for all
3. **Convert pixel format** to yuv420p (most compatible)
4. **Add silent audio** to videos that don't have it
5. **Re-encode** everything to H.264 + AAC

This takes longer than a simple copy, but the result always works.

---

## How Transitions Work

### The xfade Filter

FFmpeg's `xfade` filter creates smooth transitions by **overlapping** the end of video 1 with the start of video 2:

```
Video 1: ████████████████████░░░░░░░
Video 2:                  ░░░░░░░████████████████████
                          └──────┘
                          Overlap (transition duration)
```

The `offset` parameter determines when the transition starts (end of video 1 minus transition duration).

### Audio Sync Challenge

When videos overlap, the audio must also overlap. We use:

1. **afade** - Fade out first audio, fade in second audio
2. **adelay** - Delay second audio to match the video offset
3. **amix** - Mix both audio tracks during the overlap

This keeps lips in sync throughout the transition.

---

## File Storage

```
ffmpeg-playground/
├── uploads/           # Incoming files (temporary)
├── outputs/           # Processed results
├── server.js          # Main server code
├── package.json       # Dependencies
└── docs/
    └── README.md      # This documentation
```

- **Uploads** are named with timestamps to avoid conflicts
- **Outputs** are served statically so the frontend can download them
- Files are NOT automatically cleaned up (consider adding cleanup for production)

---

## Running the Server

```bash
# Install dependencies
npm install

# Start with auto-reload (development)
npm run dev

# Start without auto-reload (production)
npm start
```

The server runs on **port 3333** by default.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| express | Web server framework |
| fluent-ffmpeg | FFmpeg wrapper for Node.js |
| multer | File upload handling |
| cors | Cross-origin requests (for frontend) |

**External requirement:** FFmpeg must be installed on the system and available in PATH.

---

## Error Handling

The server catches FFmpeg errors and returns them to the client:

```json
{
  "error": "Error message from FFmpeg",
  "details": "Full FFmpeg stderr output"
}
```

Common errors:
- FFmpeg not installed → "FFmpeg not found"
- Corrupted input file → "Invalid data found when processing input"
- Unsupported codec → Various codec-related messages

---

## Future Improvements

- [ ] Add file cleanup (delete old uploads/outputs)
- [ ] Add progress streaming via WebSocket
- [ ] Support more output resolutions
- [ ] Add authentication
- [ ] Move to cloud storage for outputs
