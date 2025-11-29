import { create } from 'zustand';

type PanelView = 'video' | 'transcript';

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
  toggleMiddlePanelView: () => set({
    middlePanelView: get().middlePanelView === 'video' ? 'transcript' : 'video'
  }),
  toggleRightPanelView: () => set({
    rightPanelView: get().rightPanelView === 'video' ? 'transcript' : 'video'
  }),
}));
