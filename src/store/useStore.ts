import { create } from 'zustand';

type AppState = {
  view: 'globe' | 'desktop';
  setView: (view: 'globe' | 'desktop') => void;
  openWindows: string[];
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isAuthenticated: boolean;
  user: any | null;
  driveFiles: any[];
  localFiles: any[];
  setAuth: (isAuthenticated: boolean, user?: any) => void;
  setDriveFiles: (files: any[]) => void;
  addLocalFile: (file: any) => void;
  removeLocalFile: (id: string) => void;
};

export const useStore = create<AppState>((set) => ({
  view: 'globe',
  setView: (view) => set({ view }),
  openWindows: [],
  openWindow: (id) => set((state) => ({ openWindows: [...new Set([...state.openWindows, id])] })),
  closeWindow: (id) => set((state) => ({ openWindows: state.openWindows.filter(w => w !== id) })),
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  isAuthenticated: false,
  user: null,
  driveFiles: [],
  localFiles: [
    { id: '1', name: 'مستند ترحيبي.txt', type: 'text', content: 'مرحباً بك في منصة Zenith Studio!' },
    { id: '2', name: 'صورة_خلفية.png', type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' }
  ],
  setAuth: (isAuthenticated, user = null) => set({ isAuthenticated, user }),
  setDriveFiles: (files) => set({ driveFiles: files }),
  addLocalFile: (file) => set((state) => ({ localFiles: [...state.localFiles, file] })),
  removeLocalFile: (id) => set((state) => ({ localFiles: state.localFiles.filter(f => f.id !== id) })),
}));
