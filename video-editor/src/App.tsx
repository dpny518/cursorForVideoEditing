import { useEffect } from 'react';
import { useProjectStore } from './stores/projectStore';
import { useTranscriptionStore } from './stores/transcriptionStore';
import { useUIStore } from './stores/uiStore';
import MediaBin from './components/MediaBin';
import PreviewPanel from './components/PreviewPanel';
import Timeline from './components/Timeline';
import TranscriptionStatus from './components/TranscriptionStatus';
import ModelLoadError from './components/ModelLoadError';
import './App.css';

function App() {
  const createProject = useProjectStore((state) => state.createProject);
  const initializeWorker = useTranscriptionStore((state) => state.initializeWorker);
  const loadModel = useTranscriptionStore((state) => state.loadModel);
  const project = useProjectStore((state) => state.project);
  const selectedMediaId = useUIStore((state) => state.selectedMediaId);
  const modelError = useTranscriptionStore((state) => state.modelError);

  useEffect(() => {
    // Initialize project
    createProject('Video Editor Project');

    // Initialize transcription worker and load model
    const initTranscription = async () => {
      console.log('[App] Initializing transcription worker...');
      initializeWorker();
      // Give worker a moment to initialize before loading model
      setTimeout(() => {
        console.log('[App] Loading model...');
        loadModel('Xenova/whisper-tiny.en');
      }, 500);
    };

    initTranscription();
  }, []);

  const handleRetryModel = () => {
    initializeWorker();
    setTimeout(() => {
      loadModel('Xenova/whisper-tiny.en');
    }, 100);
  };

  return (
    <div className="app">
      {modelError && <ModelLoadError onRetry={handleRetryModel} />}
      <header className="app-header">
        <h1>AI Video Editor</h1>
        <p className="subtitle">
          {project?.name || 'Loading...'}
        </p>
      </header>

      <div className="main-layout">
        <div className="top-section">
          <div className="media-bin-container">
            <MediaBin />
          </div>
          <div className="preview-container">
            <PreviewPanel panel="middle" />
          </div>
          <div className="timeline-preview-container">
            <PreviewPanel panel="right" showTimeline={true} />
          </div>
        </div>

        <div className="bottom-section">
          <div className="timeline-container">
            <Timeline />
          </div>
        </div>
      </div>

      <TranscriptionStatus />
    </div>
  );
}

export default App;
