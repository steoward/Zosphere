import { Globe, Monitor, Cloud, MessageCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Taskbar() {
  const { view, setView, openWindow } = useStore();

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 h-16 bg-white/20 backdrop-blur-xl border border-white/40 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center px-8 z-50">
      <div className="flex items-center gap-6">
        <TaskbarIcon 
          icon={<Globe size={22} />} 
          label="المجتمع (الأرض)" 
          active={view === 'globe'} 
          onClick={() => setView('globe')} 
        />
        <TaskbarIcon 
          icon={<Monitor size={22} />} 
          label="سطح مكتبي" 
          active={view === 'desktop'} 
          onClick={() => setView('desktop')} 
        />
        <div className="w-px h-8 bg-white/40 rounded-full mx-1" />
        <TaskbarIcon 
          icon={<Cloud size={22} />} 
          label="التخزين السحابي" 
          onClick={() => openWindow('cloud')} 
        />
        <TaskbarIcon 
          icon={<MessageCircle size={22} />} 
          label="الرسائل" 
          onClick={() => openWindow('messages')} 
        />
      </div>
    </div>
  );
}

function TaskbarIcon({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <div className="relative group flex items-center justify-center">
      <button
        onClick={onClick}
        className={`p-2.5 rounded-full transition-all duration-300 relative overflow-hidden ${
          active 
            ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] bg-white/10' 
            : 'text-gray-200 hover:text-white hover:bg-white/10 hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]'
        }`}
      >
        {icon}
        {active && (
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)]" />
        )}
      </button>
      
      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/20 backdrop-blur-xl border border-white/40 text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl">
        {label}
      </div>
    </div>
  );
}



