import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
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
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState({ width, height });

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <Rnd
      default={{
        x: defaultPosition.x,
        y: defaultPosition.y,
        width: width,
        height: height,
      }}
      position={isMaximized ? { x: 0, y: 0 } : position}
      size={isMaximized ? { width: '100%', height: 'calc(100vh - 4rem)' } : size}
      onDragStop={(e, d) => {
        if (!isMaximized) setPosition({ x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!isMaximized) {
          setSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
          setPosition(position);
        }
      }}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      dragHandleClassName="window-header"
      className="z-40"
      style={{ position: 'absolute' }}
    >
      <div className="w-full h-full bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="window-header bg-white/10 dark:bg-black/30 px-4 py-3 flex justify-between items-center cursor-move select-none border-b border-white/10">
          <h3 className="text-sm font-semibold text-white drop-shadow-md truncate pl-4">{title}</h3>
          <div className="flex space-x-2 space-x-reverse shrink-0">
            <button className="p-1.5 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors">
              <Minus size={14} />
            </button>
            <button 
              onClick={toggleMaximize}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-colors"
            >
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
    </Rnd>
  );
}
