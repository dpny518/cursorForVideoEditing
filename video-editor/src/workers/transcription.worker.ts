// Load transformers.js from CDN to avoid bundling issues with ONNX Runtime
console.log('[Worker] Worker script loaded');

let pipelineInstance: any = null;
let transformers: any = null;

// Import transformers from CDN
async function initializeTransformers() {
  if (transformers) {
    return transformers;
  }

  console.log('[Worker] Loading transformers from CDN...');

  try {
    // Import from CDN
    transformers = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');

    console.log('[Worker] Transformers loaded from CDN');

    // Configure environment
    const { env } = transformers;
    env.allowLocalModels = false;
    env.allowRemoteModels = true;
    env.backends.onnx.wasm.numThreads = 1;

    console.log('[Worker] Environment configured');

    return transformers;
  } catch (error) {
    console.error('[Worker] Failed to load transformers from CDN:', error);
    throw error;
  }
}

// Message handler
self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  console.log('[Worker] Received message:', type);

  try {
    if (type === 'load') {
      // Load the model
      self.postMessage({
        type: 'loading',
        message: 'Loading Whisper model...'
      });

      // Initialize transformers if not already done
      const { pipeline } = await initializeTransformers();

      console.log('[Worker] Creating pipeline...');

      // Create the pipeline
      pipelineInstance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
        progress_callback: (progress: any) => {
          console.log('[Worker] Progress:', progress);

          // Send progress updates
          if (progress.status === 'progress') {
            self.postMessage({
              type: 'progress',
              progress: {
                file: progress.file,
                progress: progress.progress || 0,
                loaded: progress.loaded || 0,
                total: progress.total || 0,
              },
            });
          } else if (progress.status === 'done') {
            self.postMessage({
              type: 'done',
              file: progress.file,
            });
          }
        },
      });

      console.log('[Worker] Pipeline created successfully');

      // Model is ready
      self.postMessage({
        type: 'ready',
        message: 'Model loaded and ready'
      });
    } else if (type === 'transcribe') {
      const { audio, mediaId, language } = data;

      if (!audio) {
        throw new Error('No audio data provided');
      }

      if (!pipelineInstance) {
        throw new Error('Pipeline not initialized. Call load first.');
      }

      console.log('[Worker] Starting transcription for:', mediaId);
      console.log('[Worker] Audio length:', audio.length, 'Language:', language);

      self.postMessage({
        type: 'transcribing',
        mediaId,
        message: 'Transcribing audio...',
      });

      const startTime = performance.now();

      // Run transcription with word-level timestamps
      const output = await pipelineInstance(audio, {
        return_timestamps: 'word',
        chunk_length_s: 30,
        stride_length_s: 5,
        language: language || 'english',
        task: 'transcribe',
      });

      const endTime = performance.now();
      const executionTime = (endTime - startTime) / 1000;

      console.log('[Worker] Transcription complete in', executionTime, 's');
      console.log('[Worker] Output:', output);

      self.postMessage({
        type: 'complete',
        mediaId,
        result: output,
        executionTime,
      });
    } else {
      console.warn('[Worker] Unknown message type:', type);
    }
  } catch (error) {
    console.error('[Worker] Error:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';

    self.postMessage({
      type: 'error',
      error: `${errorMessage}\n${errorStack}`,
      mediaId: data?.mediaId,
    });
  }
});

console.log('[Worker] Event listener registered');

// Export to make TypeScript happy
export {};
