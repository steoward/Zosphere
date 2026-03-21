import { useState } from 'react';
import { useStore } from '../store/useStore';
import { FileText, Image, Folder, Trash2, ExternalLink } from 'lucide-react';

export function FilesApp() {
  const { localFiles, removeLocalFile, openWindow } = useStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex flex-col h-full w-full bg-white/5 backdrop-blur-xl text-white rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl shadow-inner">
            <Folder className="text-blue-400 drop-shadow-md" size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-white drop-shadow-sm">ملفاتي</h2>
            <p className="text-xs text-white/60">{localFiles.length} عنصر</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-transparent">
        {localFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50">
            <div className="p-6 bg-white/5 rounded-full mb-4 shadow-inner">
              <Folder size={48} className="opacity-40" />
            </div>
            <p className="text-lg">لا توجد ملفات</p>
            <p className="text-sm text-white/40 mt-2">قم باستيراد ملفات من التخزين السحابي</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {localFiles.map(file => (
              <div 
                key={file.id}
                onClick={() => {
                  if (file.url) {
                    window.open(file.url, '_blank');
                  } else {
                    openWindow(`file-${file.id}`);
                  }
                }}
                className="flex flex-col items-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/30 transition-all group text-center shadow-sm backdrop-blur-sm hover:-translate-y-1 hover:shadow-lg relative cursor-pointer"
              >
                <div className="w-20 h-20 mb-4 flex items-center justify-center bg-black/20 shadow-inner rounded-2xl group-hover:scale-105 transition-transform border border-white/5">
                  {file.icon ? (
                    <img src={file.icon} alt="" className="w-12 h-12 drop-shadow-md" />
                  ) : file.type === 'image' ? (
                    <Image size={32} className="text-purple-400 drop-shadow-md" />
                  ) : (
                    <FileText size={32} className="text-blue-400 drop-shadow-md" />
                  )}
                </div>
                <span className="text-sm font-medium text-white/90 group-hover:text-white line-clamp-2 w-full leading-tight" title={file.name}>
                  {file.name}
                </span>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); removeLocalFile(file.id); }}
                  className="absolute top-2 left-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="حذف"
                >
                  <Trash2 size={14} />
                </button>
                
                {file.url && (
                  <div className="absolute top-2 right-2 p-1.5 bg-black/40 text-white/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
