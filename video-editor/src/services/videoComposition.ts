import * as core from '@diffusionstudio/core';
import type { Clip, Timeline, ProjectSettings } from '../types';

export class VideoCompositionService {
  private composition: core.Composition | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor() {}

  /**
   * Initialize a new composition with project settings
   */
  async createComposition(settings: ProjectSettings, canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.composition = new core.Composition({
      width: settings.width,
      height: settings.height,
      fps: settings.fps,
    });

    // Attach to canvas for rendering
    await this.composition.attachPlayer(canvas);

    return this.composition;
  }

  /**
   * Add a video clip to the composition
   */
  async addVideoClip(file: File, clip: Clip) {
    if (!this.composition) {
      throw new Error('Composition not initialized');
    }

    // Create a video clip from the file
    const videoClip = await core.VideoClip.from(file);

    // Set the clip properties
    videoClip.set({
      startAt: clip.start,
      stopAt: clip.start + clip.duration,
      offset: clip.offset,
      trim: clip.trimEnd - clip.offset,
    });

    // Apply transform if present
    if (clip.transform) {
      videoClip.set({
        x: clip.transform.position.x,
        y: clip.transform.position.y,
        scaleX: clip.transform.scale.x / 100,
        scaleY: clip.transform.scale.y / 100,
        rotation: clip.transform.rotation,
        opacity: clip.transform.opacity / 100,
      });
    }

    // Apply effects
    if (clip.effects && clip.effects.length > 0) {
      for (const effect of clip.effects) {
        if (!effect.enabled) continue;

        switch (effect.type) {
          case 'brightness':
            videoClip.filters.brightness = effect.params.value || 1;
            break;
          case 'blur':
            videoClip.filters.blur = effect.params.radius || 0;
            break;
          case 'contrast':
            videoClip.filters.contrast = effect.params.value || 1;
            break;
          case 'saturation':
            videoClip.filters.saturate = effect.params.value || 1;
            break;
          // Add more effects as needed
        }
      }
    }

    // Add to composition
    this.composition.add(videoClip);

    return videoClip;
  }

  /**
   * Add an audio clip to the composition
   */
  async addAudioClip(file: File, clip: Clip) {
    if (!this.composition) {
      throw new Error('Composition not initialized');
    }

    const audioClip = await core.AudioClip.from(file);

    audioClip.set({
      startAt: clip.start,
      stopAt: clip.start + clip.duration,
      offset: clip.offset,
    });

    // Apply audio settings
    if (clip.audio) {
      audioClip.set({
        volume: clip.audio.volume,
        muted: clip.audio.muted,
      });
    }

    this.composition.add(audioClip);

    return audioClip;
  }

  /**
   * Seek to a specific time in the composition
   */
  async seek(seconds: number) {
    if (!this.composition) return;
    await this.composition.seek(seconds);
  }

  /**
   * Play the composition
   */
  async play() {
    if (!this.composition) return;
    await this.composition.play();
  }

  /**
   * Pause the composition
   */
  async pause() {
    if (!this.composition) return;
    await this.composition.pause();
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    return this.composition?.time || 0;
  }

  /**
   * Get composition duration
   */
  getDuration(): number {
    return this.composition?.duration || 0;
  }

  /**
   * Render the composition to a video file
   */
  async render(options?: {
    format?: 'mp4' | 'webm';
    quality?: number;
    onProgress?: (progress: number) => void;
  }) {
    if (!this.composition) {
      throw new Error('Composition not initialized');
    }

    // Use Diffusion Studio's rendering engine
    const blob = await this.composition.render({
      format: options?.format || 'mp4',
      quality: options?.quality || 0.8,
      onProgress: options?.onProgress,
    });

    return blob;
  }

  /**
   * Generate thumbnail for a clip at a specific time
   */
  async generateThumbnail(file: File, time: number = 0): Promise<Blob> {
    const tempComposition = new core.Composition({
      width: 320,
      height: 180,
      fps: 1,
    });

    const videoClip = await core.VideoClip.from(file);
    videoClip.set({ startAt: 0 });
    tempComposition.add(videoClip);

    await tempComposition.seek(time);

    // Render a single frame
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 180;

    await tempComposition.attachPlayer(canvas);
    await tempComposition.render({ frameCount: 1 });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  }

  /**
   * Extract waveform data from audio
   */
  async extractWaveform(file: File, samples: number = 1000): Promise<Float32Array> {
    const audioContext = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Downsample to the requested number of samples
    const channelData = audioBuffer.getChannelData(0);
    const blockSize = Math.floor(channelData.length / samples);
    const waveform = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      const start = i * blockSize;
      const end = Math.min(start + blockSize, channelData.length);

      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j]);
      }

      waveform[i] = sum / blockSize;
    }

    return waveform;
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.composition) {
      this.composition.detachPlayer();
      this.composition = null;
    }
  }
}

// Singleton instance
let videoCompositionService: VideoCompositionService | null = null;

export function getVideoCompositionService(): VideoCompositionService {
  if (!videoCompositionService) {
    videoCompositionService = new VideoCompositionService();
  }
  return videoCompositionService;
}
