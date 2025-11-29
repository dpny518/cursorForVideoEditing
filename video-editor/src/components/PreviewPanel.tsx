import { useUIStore } from '../stores/uiStore';
import VideoPlayer from './VideoPlayer';
import TranscriptPanel from './TranscriptPanel';
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
  const toggleView = useUIStore((state) =>
    panel === 'middle' ? state.toggleMiddlePanelView : state.toggleRightPanelView
  );

  return (
    <div className="preview-panel">
      <div className="preview-panel-header">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${view === 'video' ? 'active' : ''}`}
            onClick={() => toggleView()}
          >
            🎬 Video
          </button>
          <button
            className={`toggle-btn ${view === 'transcript' ? 'active' : ''}`}
            onClick={() => toggleView()}
          >
            📝 Transcript
          </button>
        </div>
        <div className="panel-label">
          {panel === 'middle' ? 'Preview' : 'Timeline Preview'}
        </div>
      </div>

      <div className="preview-panel-content">
        {view === 'video' ? (
          showTimeline ? (
            <TimelinePreview />
          ) : (
            <VideoPlayer mediaId={selectedMediaId || undefined} />
          )
        ) : (
          <TranscriptPanel />
        )}
      </div>
    </div>
  );
}
