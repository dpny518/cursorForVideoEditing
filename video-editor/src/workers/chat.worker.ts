let chat: typeof import('@mlc-ai/web-llm').ChatModule;
let isModelLoading = false;

async function loadModel() {
  if (isModelLoading) return;
  isModelLoading = true;

  console.log('[ChatWorker] Starting model load...');
  self.postMessage({ type: 'loading', message: 'Loading chat model...' });

  try {
    const webllm = await import('@mlc-ai/web-llm');
    const { CreateChatModule, ChatModule } = webllm;

    chat = await CreateChatModule(
      'gemma-2b-it-q4f16_1-MLC', // Using a pre-built model ID
      {
        initProgressCallback: (report) => {
          console.log('[ChatWorker] Progress:', report);
          self.postMessage({ type: 'progress', progress: report });
        },
      }
    );

    console.log('[ChatWorker] Model loaded successfully.');
    self.postMessage({ type: 'ready', message: 'Chat model loaded.' });
  } catch (err) {
    console.error('[ChatWorker] Error loading model:', err);
    self.postMessage({ type: 'error', error: (err as Error).message });
  } finally {
    isModelLoading = false;
  }
}

self.addEventListener('message', async (event) => {
  const { type, data } = event.data;

  if (type === 'load') {
    await loadModel();
  } else if (type === 'chat') {
    if (!chat) {
      await loadModel();
    }

    if (isModelLoading) {
      self.postMessage({ type: 'error', error: 'Model is still loading.' });
      return;
    }

    try {
      const reply = await chat.generate(data.prompt, (step, message) => {
        // Partial responses can be sent here if needed
      });
      self.postMessage({ type: 'reply', reply });
    } catch (err) {
      self.postMessage({ type: 'error', error: (err as Error).message });
    }
  }
});

export {};
