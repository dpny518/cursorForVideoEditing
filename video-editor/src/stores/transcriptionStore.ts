import { create } from 'zustand';
import type { Transcript, TranscriptionProgress, ModelDownloadProgress } from '../types';

interface TranscriptionStore {
  // Worker instance
  worker: Worker | null;
  workerReady: boolean;

  // Model state
  modelLoading: boolean;
  modelReady: boolean;
  modelError: string | null;
  downloadProgress: ModelDownloadProgress[];

  // Transcription state
  transcriptions: Map<string, Transcript>;
  activeTranscriptions: Map<string, TranscriptionProgress>;

  // Actions
  initializeWorker: () => void;
  loadModel: (model?: string) => void;
  transcribeAudio: (mediaId: string, audio: Float32Array, language?: string) => void;
  updateProgress: (mediaId: string, update: Partial<TranscriptionProgress>) => void;
  addTranscript: (mediaId: string, transcript: Transcript) => void;
  getTranscript: (mediaId: string) => Transcript | undefined;
  setDownloadProgress: (progress: ModelDownloadProgress[]) => void;
  setWorkerReady: (ready: boolean) => void;
  setModelReady: (ready: boolean) => void;
}

export const useTranscriptionStore = create<TranscriptionStore>((set, get) => ({
  worker: null,
  workerReady: false,
  modelLoading: false,
  modelReady: false,
  modelError: null,
  downloadProgress: [],
  transcriptions: new Map(),
  activeTranscriptions: new Map(),

  initializeWorker: () => {
    console.log('[TranscriptionStore] Creating worker...');

    const worker = new Worker(
      new URL('../workers/transcription.worker.ts', import.meta.url),
      { type: 'module' }
    );

    console.log('[TranscriptionStore] Worker created:', worker);

    // Request persistent storage
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(persistent => {
        if (persistent) {
          console.log('[TranscriptionStore] Storage will not be cleared except by explicit user action.');
        } else {
          console.log('[TranscriptionStore] Storage may be cleared by the browser under storage pressure.');
        }
      });
    }


    worker.addEventListener('error', (error) => {
      console.error('[TranscriptionStore] Worker error:', error);
      set({
        modelError: `Worker error: ${error.message}`,
        modelLoading: false,
        modelReady: false
      });
    });

    const groupWordsIntoSegments = (words: any[], frameRate = 30) => {
      if (!words || words.length === 0) {
        return [];
      }
    
      const segments: any[] = [];
      if (words.length === 0) {
        return segments;
      }
    
      const MAX_WORDS_PER_SEGMENT = 12;
      const MAX_PAUSE_S = 0.75;
    
      let currentSegment: any = {
        id: `segment_0`,
        start: words[0].timestamp[0],
        end: words[0].timestamp[1],
        text: words[0].text,
        words: [{ ...words[0], id: `word_0_0` }],
      };
    
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const prevWord = words[i - 1];
        const pause = word.timestamp[0] - prevWord.timestamp[1];
    
        if (
          currentSegment.words.length >= MAX_WORDS_PER_SEGMENT ||
          pause > MAX_PAUSE_S
        ) {
          // Finalize the current segment
          segments.push({
            ...currentSegment,
            startFrame: Math.round(currentSegment.start * frameRate),
            endFrame: Math.round(currentSegment.end * frameRate),
            speakerId: 'speaker_0', // Default speaker
            confidence: 0.9, // Default confidence
          });
    
          // Start a new segment
          currentSegment = {
            id: `segment_${segments.length}`,
            start: word.timestamp[0],
            end: word.timestamp[1],
            text: word.text,
            words: [{ ...word, id: `word_${segments.length}_0` }],
          };
        } else {
          // Add word to the current segment
          currentSegment.end = word.timestamp[1];
          currentSegment.text += ` ${word.text}`;
          currentSegment.words.push({
            ...word,
            id: `word_${segments.length}_${currentSegment.words.length}`,
          });
        }
      }
    
      // Add the last segment
      segments.push({
        ...currentSegment,
        startFrame: Math.round(currentSegment.start * frameRate),
        endFrame: Math.round(currentSegment.end * frameRate),
        speakerId: 'speaker_0',
        confidence: 0.9,
      });
    
      return segments;
    };


    worker.addEventListener('message', (event) => {
      const { type, message, progress, result, executionTime, mediaId, error } = event.data;

      switch (type) {
        case 'loading':
          set({ modelLoading: true });
          break;

        case 'progress':
          // Update download progress
          if (progress) {
            const progressItems: ModelDownloadProgress[] = [];
            if (progress.file) {
              progressItems.push({
                file: progress.file,
                progress: progress.progress || 0,
                loaded: progress.loaded || 0,
                total: progress.total || 0,
              });
            }
            get().setDownloadProgress(progressItems);
          }
          break;

        case 'ready':
          set({ modelLoading: false, modelReady: true, workerReady: true });
          break;

        case 'transcribing':
          if (mediaId) {
            get().updateProgress(mediaId, {
              status: 'transcribing',
              message: message || 'Transcribing...',
            });
          }
          break;

        case 'done':
          // File download completed
          console.log('[TranscriptionStore] File download complete');
          break;

        case 'complete':
          if (mediaId && result) {
            console.log('[TranscriptionStore] Processing result:', result);

            // Whisper returns: { text: string, chunks: array }
            const fullText = result.text || '';
            const chunks = result.chunks || [];

            console.log('[TranscriptionStore] Chunks:', chunks);
            
            const segments = groupWordsIntoSegments(chunks, 30);


            const transcript: Transcript = {
              id: `transcript_${mediaId}_${Date.now()}`,
              mediaId,
              language: 'en',
              fullText,
              segments: segments.filter(s => s.text.length > 0),
              speakers: [{
                id: 'speaker_0',
                displayName: 'Speaker 1',
                color: '#3b82f6',
                segmentIds: segments.map(s => s.id),
              }],
              generatedAt: new Date().toISOString(),
              modelVersion: 'Xenova/whisper-tiny',
              editHistory: [],
            };

            console.log('[TranscriptionStore] Created transcript:', transcript);

            get().addTranscript(mediaId, transcript);
            get().updateProgress(mediaId, {
              status: 'complete',
              progress: 100,
              message: `Completed in ${executionTime?.toFixed(2)}s`,
            });
          }
          break;

        case 'error':
          console.error('[TranscriptionStore] Error:', error);
          if (mediaId) {
            get().updateProgress(mediaId, {
              status: 'error',
              message: error || 'Transcription failed',
              error: error,
            });
          } else {
            // Model loading error
            console.error('[TranscriptionStore] Model loading failed:', error);
            set({ modelError: error || 'Unknown model loading error' });
          }
          set({ modelLoading: false, modelReady: false });
          break;
      }
    });


    set({ worker });
  },

  loadModel: (model = 'Xenova/whisper-tiny.en') => {
    const { worker } = get();
    console.log('[TranscriptionStore] loadModel called with:', model);
    console.log('[TranscriptionStore] Worker exists:', !!worker);

    if (!worker) {
      console.error('[TranscriptionStore] Worker not initialized');
      set({ modelError: 'Worker not initialized' });
      return;
    }

    console.log('[TranscriptionStore] Sending load message to worker...');
    worker.postMessage({ type: 'load', data: { model } });
  },

  transcribeAudio: (mediaId: string, audio: Float32Array, language?: string) => {
    const { worker, modelReady } = get();

    if (!worker) {
      console.error('Worker not initialized');
      return;
    }

    if (!modelReady) {
      console.log('Model not ready yet, queueing transcription...');
      // Queue for later when model is ready
      setTimeout(() => {
        if (get().modelReady) {
          get().transcribeAudio(mediaId, audio, language);
        } else {
          get().updateProgress(mediaId, {
            mediaId,
            status: 'error',
            progress: 0,
            message: 'Model failed to load',
            error: 'Model not ready',
          });
        }
      }, 2000);

      get().updateProgress(mediaId, {
        mediaId,
        status: 'loading',
        progress: 0,
        message: 'Waiting for AI model to load...',
      });
      return;
    }

    // Initialize progress tracking
    get().updateProgress(mediaId, {
      mediaId,
      status: 'loading',
      progress: 0,
      message: 'Preparing transcription...',
    });

    worker.postMessage({
      type: 'transcribe',
      data: { mediaId, audio, language },
    });
  },

  updateProgress: (mediaId: string, update: Partial<TranscriptionProgress>) => {
    set((state) => {
      const newActiveTranscriptions = new Map(state.activeTranscriptions);
      const existing = newActiveTranscriptions.get(mediaId) || {
        mediaId,
        status: 'idle',
        progress: 0,
        message: '',
      };
      newActiveTranscriptions.set(mediaId, { ...existing, ...update });
      return { activeTranscriptions: newActiveTranscriptions };
    });
  },

  addTranscript: (mediaId: string, transcript: Transcript) => {
    set((state) => {
      const newTranscriptions = new Map(state.transcriptions);
      newTranscriptions.set(mediaId, transcript);
      return { transcriptions: newTranscriptions };
    });
  },

  getTranscript: (mediaId: string) => {
    return get().transcriptions.get(mediaId);
  },

  setDownloadProgress: (progress: ModelDownloadProgress[]) => {
    set({ downloadProgress: progress });
  },

  setWorkerReady: (ready: boolean) => {
    set({ workerReady: ready });
  },

  setModelReady: (ready: boolean) => {
    set({ modelReady: ready });
  },
}));
