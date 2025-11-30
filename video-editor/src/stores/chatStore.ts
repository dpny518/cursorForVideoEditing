import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { useTranscriptionStore } from './transcriptionStore';
import { useTimelineStore } from './timelineStore';
import { useProjectStore } from './projectStore';
import { useUIStore } from './uiStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface ChatStore {
  worker: Worker | null;
  modelReady: boolean;
  modelLoading: boolean;
  modelError: string | null;
  modelLoadingProgress: number;
  modelLoadingMessage: string;
  messages: ChatMessage[];
  initialize: () => void;
  sendMessage: (prompt: string) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  worker: null,
  modelReady: false,
  modelLoading: false,
  modelError: null,
  modelLoadingProgress: 0,
  modelLoadingMessage: '',
  messages: [],

  initialize: () => {
    const worker = new Worker(new URL('../workers/chat.worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.addEventListener('message', (event) => {
      const { type, reply, error, progress } = event.data;

      switch (type) {
        case 'loading':
          set({ modelLoading: true, modelError: null, modelLoadingMessage: 'Loading model...' });
          break;
        case 'progress':
          if (progress) {
            set({
              modelLoadingProgress: (progress.progress || 0) * 100,
              modelLoadingMessage: progress.text || '',
            });
          }
          break;
        case 'ready':
          set({ modelLoading: false, modelReady: true, modelLoadingProgress: 100 });
          break;
        case 'reply':
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            text: reply,
          };
          set((state) => ({ messages: [...state.messages, assistantMessage] }));
          break;
        case 'error':
          set({ modelLoading: false, modelError: error });
          break;
      }
    });

    worker.postMessage({ type: 'load' });
    set({ worker });
  },

  sendMessage: (prompt: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      text: prompt,
    };
    set((state) => ({ messages: [...state.messages, userMessage] }));

    // Command parsing
    if (prompt.startsWith('/')) {
      const [command, ...args] = prompt.split(' ');
      if (command === '/find') {
        const query = args.join(' ');
        const { getState: getTranscriptionState } = useTranscriptionStore;
        const { getState: getUIState } = useUIStore;
        const { addClipToTimeline } = useTimelineStore.getState();
        const { getMediaItem } = useProjectStore.getState();

        const selectedMediaId = getUIState().selectedMediaId;
        if (!selectedMediaId) {
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            text: 'Please select a media item first.',
          };
          set((state) => ({ messages: [...state.messages, assistantMessage] }));
          return;
        }
        
        const transcript = getTranscriptionState().getTranscript(selectedMediaId);
        if (!transcript) {
           const assistantMessage: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            text: 'No transcript available for the selected media.',
          };
          set((state) => ({ messages: [...state.messages, assistantMessage] }));
          return;
        }

        const allWords = transcript.segments.flatMap(s => s.words);
        const searchText = query.replace(/['"]+/g, '').toLowerCase().replace(/[.,!?]/g, '');
        const searchWords = searchText.split(' ');
        
        let found = false;
        for (let i = 0; i <= allWords.length - searchWords.length; i++) {
          const slice = allWords.slice(i, i + searchWords.length);
          const sliceText = slice.map(w => w.text.trim().toLowerCase().replace(/[.,!?]/g, '')).join(' ');

          if (sliceText === searchText) {
            const startWord = slice[0];
            const endWord = slice[slice.length - 1];
            const mediaItem = getMediaItem(selectedMediaId);
            if(mediaItem) {
              addClipToTimeline(selectedMediaId, mediaItem.name, mediaItem.duration, startWord.start, endWord.end);
              const assistantMessage: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                text: `Found "${query}" and added a clip to the timeline from ${startWord.start.toFixed(2)}s to ${endWord.end.toFixed(2)}s.`,
              };
              set((state) => ({ messages: [...state.messages, assistantMessage] }));
              found = true;
            }
            break; 
          }
        }
        
        if(!found) {
            const assistantMessage: ChatMessage = {
              id: uuidv4(),
              role: 'assistant',
              text: `Could not find "${query}" in the transcript.`,
            };
            set((state) => ({ messages: [...state.messages, assistantMessage] }));
        }

        return; // Don't send command to LLM
      }
    }

    // Default behavior: send to LLM
    const { worker, modelReady } = get();
    if (!worker || !modelReady) {
      console.error('Chat worker not ready.');
      return;
    }
    worker.postMessage({ type: 'chat', data: { prompt } });
  },
}));
