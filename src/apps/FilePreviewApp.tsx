import { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Heart, MessageSquare, Share2, Download, Eye, 
  FileText, Image as ImageIcon, File, Info, X, 
  Maximize2, ZoomIn, ZoomOut, Play, FileCode, FileAudio, FileVideo
} from 'lucide-react';

export function FilePreviewApp({ fileId }: { fileId: string }) {
  const { localFiles, updateLocalFile } = useStore();
  const [showInfo, setShowInfo] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Extract actual ID from 'file-123'
  const actualId = fileId.replace('file-', '');
  const file = localFiles.find(f => f.id === actualId);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-white/5 backdrop-blur-xl text-white rounded-none p-6">
        <File size={48} className="text-white/20 mb-4" />
        <p className="text-lg text-white/60">الملف غير موجود أو تم حذفه</p>
      </div>
    );
  }

  const renderPreview = () => {
    // Determine file type from extension or type property
    const name = file.name.toLowerCase();
    const isImage = file.type === 'image' || name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
    const isVideo = file.type === 'video' || name.match(/\.(mp4|webm|ogg|mov)$/i);
    const isAudio = file.type === 'audio' || name.match(/\.(mp3|wav|ogg)$/i);
    const isPdf = name.match(/\.pdf$/i);
    const isCode = name.match(/\.(js|jsx|ts|tsx|html|css|json|md|py|rs|go)$/i);
    const isText = file.type === 'text' || file.type === 'document' || name.match(/\.(txt|csv|log)$/i);

    if (isImage) {
      return (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black/40">
          <img 
            src={file.url || file.icon} 
            alt={file.name} 
            style={{ transform: `scale(${zoom})` }}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><ZoomOut size={18} /></button>
            <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><ZoomIn size={18} /></button>
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <button onClick={() => setZoom(1)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><Maximize2 size={18} /></button>
          </div>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black/60">
          {file.url ? (
            <video src={file.url} controls className="max-w-full max-h-full rounded-lg shadow-2xl" />
          ) : (
            <div className="text-center text-white/40">
              <FileVideo size={64} className="mx-auto mb-4 opacity-50" />
              <p>لا يمكن تشغيل الفيديو (الرابط غير متوفر)</p>
            </div>
          )}
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.1)] border border-white/20">
            <FileAudio size={48} className="text-blue-400" />
          </div>
          {file.url ? (
            <audio src={file.url} controls className="w-3/4 max-w-md" />
          ) : (
            <p className="text-white/40">لا يمكن تشغيل المقطع الصوتي</p>
          )}
        </div>
      );
    }

    if (isPdf && file.url) {
      return (
        <div className="w-full h-full bg-white">
          <iframe src={file.url} className="w-full h-full border-0" title={file.name} />
        </div>
      );
    }

    if (isCode || isText) {
      return (
        <div className="w-full h-full bg-[#1e1e1e] text-gray-300 p-6 overflow-auto font-mono text-sm leading-relaxed text-left relative group" dir="ltr">
          <textarea 
            value={file.content || ''}
            onChange={(e) => updateLocalFile(file.id, { content: e.target.value })}
            className="w-full h-full bg-transparent border-none outline-none resize-none text-gray-300 font-mono"
            spellCheck={false}
            placeholder="/* لا يوجد محتوى نصي متاح لهذا الملف */\n// حاول استيراد الملف بالكامل أو فتحه في تطبيق خارجي."
          />
        </div>
      );
    }

    // Fallback for unknown types or generic documents
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/20">
        <div className="p-8 bg-white/5 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-sm">
          <File size={64} className="text-blue-400 mb-6 drop-shadow-lg" />
          <h3 className="text-xl font-bold mb-2 text-white">{file.name}</h3>
          <p className="text-sm text-white/50 mb-6">لا تتوفر معاينة مباشرة لهذا النوع من الملفات.</p>
          {file.url && (
            <button 
              onClick={() => window.open(file.url, '_blank')}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              فتح في علامة تبويب جديدة
            </button>
          )}
        </div>
      </div>
    );
  };

  const getFileIcon = () => {
    const name = file.name.toLowerCase();
    if (file.type === 'image' || name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return <ImageIcon size={20} className="text-purple-400" />;
    if (file.type === 'video' || name.match(/\.(mp4|webm|ogg|mov)$/i)) return <FileVideo size={20} className="text-red-400" />;
    if (file.type === 'audio' || name.match(/\.(mp3|wav|ogg)$/i)) return <FileAudio size={20} className="text-yellow-400" />;
    if (name.match(/\.(js|jsx|ts|tsx|html|css|json|md|py|rs|go)$/i)) return <FileCode size={20} className="text-green-400" />;
    return <FileText size={20} className="text-blue-400" />;
  };

  return (
    <div className="flex h-full w-full bg-white/5 backdrop-blur-xl text-white rounded-none overflow-hidden">
      
      {/* Main Preview Section */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20 z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-white/10 rounded-lg shadow-inner shrink-0">
              {getFileIcon()}
            </div>
            <h2 className="font-medium text-white truncate drop-shadow-sm" title={file.name}>{file.name}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 rounded-lg transition-colors ${showInfo ? 'bg-blue-500/30 text-blue-300' : 'hover:bg-white/10 text-white/70'}`}
              title="معلومات الملف"
            >
              <Info size={18} />
            </button>
            <div className="w-px h-5 bg-white/20 mx-1"></div>
            {file.url && (
              <button 
                onClick={() => window.open(file.url, '_blank')}
                className="flex items-center gap-2 bg-blue-500/80 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow-md text-sm border border-blue-400/30"
              >
                <Download size={16} />
                <span className="hidden sm:inline">تحميل</span>
              </button>
            )}
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 relative overflow-hidden bg-black/10">
          {renderPreview()}
        </div>
        
        {/* Bottom Action Bar */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-white/10 bg-black/20">
          <div className="flex space-x-4 space-x-reverse">
            <button className="flex items-center text-white/60 hover:text-red-400 transition-colors group">
              <Heart size={18} className="mr-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">إعجاب</span>
            </button>
            <button className="flex items-center text-white/60 hover:text-blue-400 transition-colors group">
              <MessageSquare size={18} className="mr-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">تعليق</span>
            </button>
            <button className="flex items-center text-white/60 hover:text-green-400 transition-colors group">
              <Share2 size={18} className="mr-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-sm">مشاركة</span>
            </button>
          </div>
          
          <div className="flex items-center text-white/40 text-sm gap-4">
            <div className="flex items-center">
              <Eye size={16} className="mr-1.5" />
              <span>1.2k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Sidebar */}
      {showInfo && (
        <div className="w-80 border-r border-white/10 bg-black/30 flex flex-col shrink-0 transition-all duration-300">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-semibold text-white">تفاصيل الملف</h3>
            <button onClick={() => setShowInfo(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-4 flex-1 overflow-auto space-y-6">
            {/* Thumbnail/Icon */}
            <div className="flex justify-center py-4">
              <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                {file.icon ? (
                  <img src={file.icon} alt="" className="w-16 h-16 object-contain drop-shadow-md" />
                ) : (
                  getFileIcon()
                )}
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-white/40 mb-1">الاسم</p>
                <p className="text-sm text-white/90 break-all">{file.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">النوع</p>
                <p className="text-sm text-white/90 uppercase">{file.type || file.name.split('.').pop() || 'غير معروف'}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">الحجم</p>
                <p className="text-sm text-white/90">{(Math.random() * 10 + 1).toFixed(2)} MB <span className="text-white/30 text-xs">(تقريبي)</span></p>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">تاريخ الإضافة</p>
                <p className="text-sm text-white/90">{new Date().toLocaleDateString('ar-EG')}</p>
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs text-white/40 mb-2">العلامات</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/70 border border-white/5">مهم</span>
                <span className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/70 border border-white/5">{file.type}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

