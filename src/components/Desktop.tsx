import { useState, useEffect } from 'react';
import { 
  Calculator, 
  FileText, 
  Settings, 
  Folder, 
  Globe, 
  CloudSun, 
  MoreVertical,
  RefreshCw,
  Maximize
} from 'lucide-react';
import { useStore } from '../store/useStore';

export function Desktop() {
  const openWindow = useStore(state => state.openWindow);
  const [time, setTime] = useState(new Date());
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle right click on desktop
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Close context menu on click anywhere
  const handleClick = () => {
    if (contextMenu) setContextMenu(null);
  };

  const apps = [
    { id: 'files', name: 'الملفات', icon: <Folder size={32} className="text-blue-400" /> },
    { id: 'notes', name: 'الملاحظات', icon: <FileText size={32} className="text-emerald-400" /> },
    { id: 'calculator', name: 'الحاسبة', icon: <Calculator size={32} className="text-purple-400" /> },
    { id: 'browser', name: 'المتصفح', icon: <Globe size={32} className="text-cyan-400" /> },
    { id: 'settings', name: 'الإعدادات', icon: <Settings size={32} className="text-gray-400" /> },
  ];

  return (
    <div 
      className="w-full h-full p-6 flex flex-col relative overflow-hidden"
      onContextMenu={handleContextMenu}
      onClick={handleClick}
    >
      {/* Widgets Area (Top Left) */}
      <div className="absolute top-8 left-8 flex flex-col gap-6 items-start pointer-events-none z-10">
        
        {/* Clock Widget */}
        <div className="w-64 p-6 rounded-3xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl pointer-events-auto hover:bg-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300 group">
          <div className="text-5xl font-light text-white tracking-wider mb-2 drop-shadow-lg text-left" dir="ltr">
            {time.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-sm font-medium text-white/70 tracking-wide text-left">
            {time.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Weather Widget */}
        <div className="w-64 p-5 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 shadow-2xl pointer-events-auto flex items-center justify-between hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all duration-300">
          <div className="relative flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl shadow-inner border border-white/10">
            <CloudSun size={36} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
          </div>
          <div className="text-left">
            <div className="text-3xl font-light text-white drop-shadow-md" dir="ltr">24°C</div>
            <div className="text-sm text-white/80 mt-1">غائم جزئياً</div>
            <div className="text-xs text-white/50 mt-1">الرياض</div>
          </div>
        </div>

      </div>

      {/* App Icons Grid (Right Side in RTL) */}
      <div className="flex flex-col flex-wrap gap-4 h-full content-start items-start pt-4 pr-4 z-0">
        {apps.map(app => (
          <button
            key={app.id}
            onDoubleClick={() => openWindow(app.id)}
            className="flex flex-col items-center justify-center w-24 p-3 rounded-2xl hover:bg-white/10 dark:hover:bg-black/20 border border-transparent hover:border-white/20 transition-all duration-200 group"
          >
            <div className="mb-2 p-3 bg-white/10 dark:bg-gray-800/40 rounded-2xl group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-lg backdrop-blur-md border border-white/10">
              {app.icon}
            </div>
            <span className="text-sm font-medium text-white drop-shadow-md px-1 text-center">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Context Menu */}
      {contextMenu && (
        <div 
          className="absolute z-50 w-48 py-2 rounded-xl bg-white/10 dark:bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button className="w-full px-4 py-2 text-right text-sm text-white hover:bg-white/20 flex items-center gap-3 transition-colors">
            <RefreshCw size={16} /> تحديث
          </button>
          <button className="w-full px-4 py-2 text-right text-sm text-white hover:bg-white/20 flex items-center gap-3 transition-colors">
            <Folder size={16} /> مجلد جديد
          </button>
          <div className="h-px w-full bg-white/10 my-1"></div>
          <button className="w-full px-4 py-2 text-right text-sm text-white hover:bg-white/20 flex items-center gap-3 transition-colors">
            <Maximize size={16} /> تخصيص الشاشة
          </button>
          <button className="w-full px-4 py-2 text-right text-sm text-white hover:bg-white/20 flex items-center gap-3 transition-colors">
            <Settings size={16} /> إعدادات العرض
          </button>
        </div>
      )}
    </div>
  );
}
