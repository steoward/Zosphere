import { Heart, MessageSquare, Share2, Download, Eye } from 'lucide-react';

export function FilePreviewApp({ fileId }: { fileId: string }) {
  return (
    <div className="flex flex-col h-full w-full bg-white/5 backdrop-blur-xl text-white rounded-2xl overflow-hidden p-4">
      <div className="flex-1 bg-black/20 rounded-2xl flex items-center justify-center mb-4 overflow-hidden relative border border-white/10 shadow-inner">
        <div className="text-center text-white/50">
          <p className="text-lg font-medium mb-2 drop-shadow-md">معاينة الملف</p>
          <p className="text-sm">محتوى الملف يعرض هنا (صورة، فيديو، مستند...)</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center border-t border-white/10 pt-4">
        <div className="flex space-x-4 space-x-reverse">
          <button className="flex items-center text-white/70 hover:text-red-400 transition-colors drop-shadow-sm">
            <Heart size={18} className="mr-1" />
            <span className="text-sm">124</span>
          </button>
          <button className="flex items-center text-white/70 hover:text-blue-400 transition-colors drop-shadow-sm">
            <MessageSquare size={18} className="mr-1" />
            <span className="text-sm">23</span>
          </button>
          <button className="flex items-center text-white/70 hover:text-green-400 transition-colors drop-shadow-sm">
            <Share2 size={18} className="mr-1" />
            <span className="text-sm">مشاركة</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse text-white/50 text-sm">
          <div className="flex items-center drop-shadow-sm">
            <Eye size={16} className="mr-1" />
            <span>1.2k</span>
          </div>
          <div className="flex items-center drop-shadow-sm">
            <Download size={16} className="mr-1" />
            <span>340</span>
          </div>
          <button className="bg-blue-500/80 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl transition-colors flex items-center shadow-md border border-blue-400/30">
            <Download size={16} className="mr-1" />
            تحميل
          </button>
        </div>
      </div>
    </div>
  );
}
