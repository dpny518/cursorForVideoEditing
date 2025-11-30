import { create } from 'zustand';

type PanelView = 'video' | 'transcript' | 'chat';

interface UIStore {
  selectedMediaId: string | null;
  setSelectedMediaId: (mediaId: string | null) => void;

  // Panel view toggles
  middlePanelView: PanelView;
  rightPanelView: PanelView;
  setMiddlePanelView: (view: PanelView) => void;
  setRightPanelView: (view: PanelView) => void;
  toggleMiddlePanelView: () => void;
  toggleRightPanelView: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  selectedMediaId: null,
  setSelectedMediaId: (mediaId) => set({ selectedMediaId: mediaId }),

  middlePanelView: 'video',
  rightPanelView: 'video',
  setMiddlePanelView: (view) => set({ middlePanelView: view }),
  setRightPanelView: (view) => set({ rightPanelView: view }),
  toggleMiddlePanelView: () => {
    const currentView = get().middlePanelView;
    let nextView: PanelView;
    if (currentView === 'video') {
      nextView = 'transcript';
    } else if (currentView === 'transcript') {
      nextView = 'chat';
    } else {
      nextView = 'video';
    }
    set({ middlePanelView: nextView });
  },
  toggleRightPanelView: () => {
    const currentView = get().rightPanelView;
    let nextView: PanelView;
    if (currentView === 'video') {
      nextView = 'transcript';
    } else if (currentView === 'transcript') {
      nextView = 'chat';
    } else {
      nextView = 'video';
    }
    set({ rightPanelView: nextView });
  },
}));
