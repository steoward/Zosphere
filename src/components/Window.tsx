import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { X, Minus, Square } from 'lucide-react';
import { useStore } from '../store/useStore';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  width?: number;
  height?: number;
}

export function Window({ id, title, children, defaultPosition = { x: 50, y: 50 }, width = 600, height = 400 }: WindowProps) {
  const closeWindow = useStore(state => state.closeWindow);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [windowSize, setWindowSize] = useState({ width, height });

  useEffect(() => {
    // Ensure window fits within the viewport
    const handleResize = () => {
      setWindowSize({
        width: Math.min(width, window.innerWidth - 32),
        height: Math.min(height, window.innerHeight - 100)
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width, height]);

  return (
    <Draggable nodeRef={nodeRef} handle=".window-header" defaultPosition={defaultPosition} bounds={{ top: 0 }}>
      <div 
        ref={nodeRef}
        className="absolute top-0 left-0 bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-40"
        style={{ width: windowSize.width, height: windowSize.height, maxWidth: '100vw', maxHeight: 'calc(100vh - 4rem)' }}
      >
        <div className="window-header bg-white/10 dark:bg-black/30 px-4 py-3 flex justify-between items-center cursor-move select-none border-b border-white/10">
          <h3 className="text-sm font-semibold text-white drop-shadow-md truncate pl-4">{title}</h3>
          <div className="flex space-x-2 space-x-reverse shrink-0">
            <button className="p-1.5 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors">
              <Minus size={14} />
            </button>
            <button className="p-1.5 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors">
              <Square size={14} />
            </button>
            <button 
              onClick={() => closeWindow(id)}
              className="p-1.5 hover:bg-red-500/80 hover:text-white rounded-lg text-white/70 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-0 text-white">
          {children}
        </div>
      </div>
    </Draggable>
  );
}
