/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe } from './components/Globe';
import { Desktop } from './components/Desktop';
import { Taskbar } from './components/Taskbar';
import { Window } from './components/Window';
import { useStore } from './store/useStore';
import { CloudConnectApp } from './apps/CloudConnectApp';
import { MessagesApp } from './apps/MessagesApp';
import { SearchApp } from './apps/SearchApp';
import { FilePreviewApp } from './apps/FilePreviewApp';
import { CalculatorApp } from './apps/CalculatorApp';
import { NotesApp } from './apps/NotesApp';
import { BrowserApp } from './apps/BrowserApp';
import { FilesApp } from './apps/FilesApp';
import { TerminalApp } from './apps/TerminalApp';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Inbox, Search, Settings, User, Folder, Terminal, X } from 'lucide-react';

export default function App() {
  const { view, theme, openWindows, openWindow, closeWindow } = useStore();

  useEffect(() => {
    // Force dark mode for this specific space theme
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="w-full h-screen overflow-hidden font-sans dark text-white" dir="rtl">
      {/* Deep Space Background */}
      <div className="absolute inset-0 bg-[#020617] transition-colors duration-700">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-black"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>
      
      {/* Main Content Area */}
      <div className="relative w-full h-full">
        {view === 'globe' ? <GlobeView /> : <Desktop />}
        
        {/* Top Navigation Bar */}
        {view === 'globe' && (
          <div className="absolute top-6 left-0 right-0 px-8 flex justify-between items-start z-40 pointer-events-none">
            
            {/* Top Right (Settings & Profile) */}
            <div className="absolute top-6 right-8 flex items-center pointer-events-auto">
              <div className="flex items-center h-[56px] bg-white/20 backdrop-blur-xl border border-white/40 rounded-full p-1 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <button 
                  onClick={() => openWindow('settings')}
                  className="w-[48px] h-[48px] flex items-center justify-center rounded-full hover:bg-white/30 transition-colors"
                >
                  <Settings size={23} className="text-white drop-shadow-md" />
                </button>
                <div className="w-px h-8 bg-white/40 mx-1"></div>
                <button className="w-[48px] h-[48px] flex items-center justify-center rounded-full hover:bg-white/30 transition-colors">
                  <User size={23} className="text-white drop-shadow-md" />
                </button>
              </div>
            </div>

            {/* Top Center (Search) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto z-50 flex flex-col items-center">
              <div 
                onClick={() => openWindows.includes('search') ? closeWindow('search') : openWindow('search')}
                className={`flex items-center justify-between w-[600px] h-[56px] bg-white/20 backdrop-blur-xl border border-white/40 px-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-white/25 transition-all cursor-pointer group relative z-50 ${openWindows.includes('search') ? 'rounded-t-3xl border-b-0' : 'rounded-full'}`}
              >
                <span className="text-gray-200 group-hover:text-white text-[16px] font-medium drop-shadow-md">
                  {openWindows.includes('search') ? 'إغلاق البحث' : 'ابحث عن أي شيء...'}
                </span>
                <div className="w-[35px] h-[35px] flex items-center justify-center bg-white/20 rounded-full shadow-inner">
                  {openWindows.includes('search') ? (
                    <X size={23} className="text-white drop-shadow-md" />
                  ) : (
                    <Search size={23} className="text-white drop-shadow-md" />
                  )}
                </div>
              </div>
              
              {/* Subtle glow under search */}
              {!openWindows.includes('search') && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-400/60 blur-md"></div>
              )}
              
              {/* Search Dropdown */}
              <AnimatePresence>
                {openWindows.includes('search') && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="w-[600px] bg-white/20 backdrop-blur-xl border border-white/40 border-t-0 rounded-b-3xl shadow-[0_16px_64px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden origin-top"
                  >
                    <div className="max-h-[70vh] overflow-auto p-4">
                      <SearchApp />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Top Left (Notifications/Inbox) */}
            <div className="absolute top-6 left-8 pointer-events-auto">
              <button className="relative w-[56px] h-[56px] flex items-center justify-center bg-white/20 backdrop-blur-xl border border-white/40 rounded-full hover:bg-white/30 transition-colors shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                <Inbox width={25} height={24} className="text-white drop-shadow-md" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#020617] shadow-sm"></span>
              </button>
            </div>

          </div>
        )}

        {/* Windows */}
        {openWindows.includes('cloud') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto">
            <div className="w-full max-w-4xl h-[80vh] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                <h2 className="text-lg font-semibold text-white drop-shadow-md">التخزين السحابي</h2>
                <button 
                  onClick={() => closeWindow('cloud')} 
                  className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-auto p-4">
                <ErrorBoundary>
                  <CloudConnectApp />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        )}
        {openWindows.includes('messages') && (
          <Window id="messages" title="الرسائل" defaultPosition={{ x: 100, y: 150 }} width={400} height={500}>
            <MessagesApp />
          </Window>
        )}
        {openWindows.includes('settings') && (
          <Window id="settings" title="الإعدادات" defaultPosition={{ x: 50, y: 50 }} width={400} height={300}>
            <div className="flex flex-col space-y-4 text-white p-4 h-full bg-white/5 backdrop-blur-xl rounded-none">
              <h2 className="text-lg font-bold drop-shadow-md">الإعدادات</h2>
              <div className="p-4 bg-black/20 rounded-xl border border-white/10 shadow-inner">
                <p className="text-white/80">تم تثبيت الوضع المظلم ليتناسب مع تصميم الفضاء.</p>
              </div>
            </div>
          </Window>
        )}
        {openWindows.includes('calculator') && (
          <Window id="calculator" title="الحاسبة" defaultPosition={{ x: 100, y: 100 }} width={320} height={480}>
            <CalculatorApp />
          </Window>
        )}
        {openWindows.includes('notes') && (
          <Window id="notes" title="الملاحظات" defaultPosition={{ x: 150, y: 150 }} width={600} height={400}>
            <NotesApp />
          </Window>
        )}
        {openWindows.includes('browser') && (
          <Window id="browser" title="المتصفح" defaultPosition={{ x: 200, y: 100 }} width={800} height={600}>
            <BrowserApp />
          </Window>
        )}
        {openWindows.includes('files') && (
          <Window id="files" title="الملفات" defaultPosition={{ x: 250, y: 150 }} width={700} height={500}>
            <FilesApp />
          </Window>
        )}
        {openWindows.includes('terminal') && (
          <Window id="terminal" title="Terminal" defaultPosition={{ x: 300, y: 200 }} width={600} height={400}>
            <TerminalApp />
          </Window>
        )}
        {openWindows.filter(id => id.startsWith('file-')).map((id, index) => (
          <Window 
            key={id} 
            id={id} 
            title={`معاينة الملف`} 
            defaultPosition={{ x: 200 + index * 30, y: 100 + index * 30 }} 
            width={800} 
            height={600}
          >
            <FilePreviewApp fileId={id} />
          </Window>
        ))}
      </div>

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
}

function GlobeView() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <Globe />
    </div>
  );
}
