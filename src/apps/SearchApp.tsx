import { Search, Filter, FileText, Video, Image as ImageIcon, User, Database } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';

export function SearchApp() {
  const { isAuthenticated, driveFiles, setDriveFiles } = useStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const searchDrive = async (q: string) => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/drive/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setDriveFiles(data.files || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    searchDrive('');
  }, [isAuthenticated]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchDrive(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex space-x-2 space-x-reverse mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن ملفات، مجلدات، أو مستخدمين..." 
            className="w-full pl-4 pr-10 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white placeholder-white/40 shadow-inner transition-all hover:bg-black/30"
          />
        </div>
        <button className="p-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-colors shadow-sm">
          <Filter size={20} />
        </button>
      </div>

      <div className="flex space-x-6 space-x-reverse mb-4 border-b border-white/10 pb-2">
        <button className="text-blue-400 font-medium border-b-2 border-blue-400 pb-2 -mb-[9px] drop-shadow-sm">الكل</button>
        <button className="text-white/60 hover:text-white transition-colors pb-2">الملفات</button>
        <button className="text-white/60 hover:text-white transition-colors pb-2">المستخدمين</button>
        <button className="text-white/60 hover:text-white transition-colors pb-2">العلامات (Tags)</button>
      </div>

      <div className="flex-1 overflow-auto space-y-2 pr-2 custom-scrollbar">
        {!isAuthenticated && (
          <div className="flex flex-col items-center justify-center h-full text-white/50 p-8">
            <div className="p-6 bg-white/5 rounded-full mb-4 shadow-inner">
              <Database className="opacity-40" size={48} />
            </div>
            <p className="text-center text-lg">يرجى ربط حساب Google Drive من تطبيق "التخزين السحابي" للبحث في ملفاتك.</p>
          </div>
        )}
        
        {isAuthenticated && loading && (
          <div className="flex flex-col items-center justify-center h-full text-white/60 p-8">
             <div className="animate-spin mb-4 text-blue-400 drop-shadow-md">
               <Search size={36} />
             </div>
             <p className="text-lg">جاري البحث...</p>
          </div>
        )}

        {isAuthenticated && !loading && driveFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/50 p-8">
            <div className="p-6 bg-white/5 rounded-full mb-4 shadow-inner">
              <Search className="opacity-40" size={48} />
            </div>
            <p className="text-lg">لم يتم العثور على نتائج.</p>
          </div>
        )}

        {isAuthenticated && !loading && driveFiles.map((file) => (
          <SearchResult 
            key={file.id}
            icon={<img src={file.iconLink} alt="icon" className="w-6 h-6 drop-shadow-sm" />} 
            title={file.name} 
            subtitle={`آخر تعديل: ${new Date(file.modifiedTime).toLocaleDateString('ar-EG')}`} 
            onClick={() => window.open(file.webViewLink, '_blank')}
          />
        ))}
      </div>
    </div>
  );
}

function SearchResult({ icon, title, subtitle, isUser, onClick }: { icon: React.ReactNode, title: string, subtitle: string, isUser?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-xl cursor-pointer transition-all shadow-sm backdrop-blur-sm group">
      <div className={`p-3 ml-4 shadow-inner ${isUser ? 'bg-white/10 rounded-full' : 'bg-white/10 rounded-xl'}`}>
        {icon}
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="font-medium text-white/90 group-hover:text-white truncate">{title}</h4>
        <p className="text-xs text-white/50 mt-1">{subtitle}</p>
      </div>
      <button className="mr-auto text-xs bg-white/10 hover:bg-white/20 border border-white/5 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
        {isUser ? 'متابعة' : 'فتح'}
      </button>
    </div>
  );
}
