import { create } from 'zustand';

export type FileItem = {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'image' | 'video' | 'audio' | 'document' | 'text' | 'code';
  parentId: string | null;
  content?: string;
  url?: string;
  icon?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
};

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
  localFiles: FileItem[];
  setAuth: (isAuthenticated: boolean, user?: any) => void;
  setDriveFiles: (files: any[]) => void;
  addLocalFile: (file: FileItem) => void;
  updateLocalFile: (id: string, updates: Partial<FileItem>) => void;
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
    { id: 'root', name: 'الرئيسية', type: 'folder', parentId: null, createdAt: Date.now(), updatedAt: Date.now() },
    { id: '1', name: 'مستند ترحيبي.txt', type: 'text', parentId: 'root', content: 'مرحباً بك في منصة Zosphere!', createdAt: Date.now(), updatedAt: Date.now() },
    { id: '2', name: 'صورة_خلفية.png', type: 'image', parentId: 'root', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', createdAt: Date.now(), updatedAt: Date.now() },
    { id: '3', name: 'مشاريع', type: 'folder', parentId: 'root', color: 'bg-blue-500', createdAt: Date.now(), updatedAt: Date.now() }
  ],
  setAuth: (isAuthenticated, user = null) => set({ isAuthenticated, user }),
  setDriveFiles: (files) => set({ driveFiles: files }),
  addLocalFile: (file) => set((state) => ({ localFiles: [...state.localFiles, file] })),
  updateLocalFile: (id, updates) => set((state) => ({
    localFiles: state.localFiles.map(f => f.id === id ? { ...f, ...updates, updatedAt: Date.now() } : f)
  })),
  removeLocalFile: (id) => set((state) => {
    // Recursively remove children if it's a folder
    const getChildrenIds = (parentId: string): string[] => {
      const children = state.localFiles.filter(f => f.parentId === parentId);
      return [...children.map(c => c.id), ...children.flatMap(c => getChildrenIds(c.id))];
    };
    const idsToRemove = [id, ...getChildrenIds(id)];
    return { localFiles: state.localFiles.filter(f => !idsToRemove.includes(f.id)) };
  }),
}));
