import { useUIStore } from '../stores/uiStore';
import VideoPlayer from './VideoPlayer';
import TranscriptPanel from './TranscriptPanel';
import ChatPanel from './ChatPanel';
import TimelinePreview from './TimelinePreview';
import './PreviewPanel.css';

interface PreviewPanelProps {
  panel: 'middle' | 'right';
  showTimeline?: boolean;
}

export default function PreviewPanel({ panel, showTimeline = false }: PreviewPanelProps) {
  const selectedMediaId = useUIStore((state) => state.selectedMediaId);
  const view = useUIStore((state) =>
    panel === 'middle' ? state.middlePanelView : state.rightPanelView
  );
  const setView = useUIStore((state) =>
    panel === 'middle' ? state.setMiddlePanelView : state.setRightPanelView
  );

  return (
    <div className="preview-panel">
      <div className="preview-panel-header">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${view === 'video' ? 'active' : ''}`}
            onClick={() => setView('video')}
          >
            🎬 Video
          </button>
          <button
            className={`toggle-btn ${view === 'transcript' ? 'active' : ''}`}
            onClick={() => setView('transcript')}
          >
            📝 Transcript
          </button>
          <button
            className={`toggle-btn ${view === 'chat' ? 'active' : ''}`}
            onClick={() => setView('chat')}
          >
            💬 Chat
          </button>
        </div>
        <div className="panel-label">
          {panel === 'middle' ? 'Preview' : 'Timeline Preview'}
        </div>
      </div>

      <div className="preview-panel-content">
        {view === 'video' && (
          showTimeline ? (
            <TimelinePreview />
          ) : (
            <VideoPlayer mediaId={selectedMediaId || undefined} />
          )
        )}
        {view === 'transcript' && <TranscriptPanel />}
        {view === 'chat' && <ChatPanel />}
      </div>
    </div>
  );
}
