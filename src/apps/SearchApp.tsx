import { Search, Filter, Globe, Database, Book, Video, Music, Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SearchApp() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const searchArchive = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/archive/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.response?.docs || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchArchive(query);
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const getMediaTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'texts': return <Book size={20} className="text-blue-400" />;
      case 'movies': return <Video size={20} className="text-red-400" />;
      case 'audio': return <Music size={20} className="text-green-400" />;
      case 'image': return <ImageIcon size={20} className="text-yellow-400" />;
      default: return <Globe size={20} className="text-white/60" />;
    }
  };

  if (selectedItem) {
    return (
      <div className="flex flex-col h-full text-white bg-black/40 backdrop-blur-md rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
          <h3 className="font-medium truncate pr-4 flex-1 text-right" dir="auto">{selectedItem.title || 'بدون عنوان'}</h3>
          <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors ml-4">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 w-full relative bg-black">
          <iframe
            src={`https://archive.org/embed/${selectedItem.identifier}`}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            title={selectedItem.title}
          />
        </div>
        <div className="p-4 bg-black/60 border-t border-white/10 text-sm text-white/70 flex justify-between items-center">
          <span className="truncate" dir="auto">
            {selectedItem.creator ? `بواسطة: ${Array.isArray(selectedItem.creator) ? selectedItem.creator[0] : selectedItem.creator}` : ''}
          </span>
          <a href={`https://archive.org/details/${selectedItem.identifier}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors mr-4">
            <span>فتح في أرشيف الإنترنت</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-white">
      <div className="flex space-x-2 space-x-reverse mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الإنترنت (The Internet Archive)..." 
            className="w-full pl-4 pr-10 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white placeholder-white/40 shadow-inner transition-all hover:bg-black/30"
          />
        </div>
        <button className="p-3 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20 transition-colors shadow-sm">
          <Filter size={20} />
        </button>
      </div>

      <div className="flex space-x-6 space-x-reverse mb-4 border-b border-white/10 pb-2">
        <button className="text-blue-400 font-medium border-b-2 border-blue-400 pb-2 -mb-[9px] drop-shadow-sm">الكل</button>
        <button className="text-white/60 hover:text-white transition-colors pb-2">كتب ونصوص</button>
        <button className="text-white/60 hover:text-white transition-colors pb-2">فيديو</button>
        <button className="text-white/60 hover:text-white transition-colors pb-2">صوتيات</button>
      </div>

      <div className="flex-1 overflow-auto space-y-2 pr-2 custom-scrollbar">
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center h-full text-white/50 p-8">
            <div className="p-6 bg-white/5 rounded-full mb-4 shadow-inner">
              <Globe className="opacity-40" size={48} />
            </div>
            <p className="text-center text-lg">ابحث في مليارات الملفات، الكتب، الفيديوهات والصوتيات من أرشيف الإنترنت.</p>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-white/60 p-8">
             <div className="animate-spin mb-4 text-blue-400 drop-shadow-md">
               <Search size={36} />
             </div>
             <p className="text-lg">جاري البحث في الإنترنت...</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/50 p-8">
            <div className="p-6 bg-white/5 rounded-full mb-4 shadow-inner">
              <Search className="opacity-40" size={48} />
            </div>
            <p className="text-lg">لم يتم العثور على نتائج.</p>
          </div>
        )}

        {!loading && results.map((item) => (
          <SearchResult 
            key={item.identifier}
            icon={getMediaTypeIcon(item.mediatype)} 
            title={item.title || 'بدون عنوان'} 
            subtitle={item.creator ? `بواسطة: ${Array.isArray(item.creator) ? item.creator[0] : item.creator}` : (item.date ? `تاريخ: ${item.date.substring(0,10)}` : 'أرشيف الإنترنت')} 
            onClick={() => setSelectedItem(item)}
          />
        ))}
      </div>
    </div>
  );
}

function SearchResult({ icon, title, subtitle, onClick }: { icon: React.ReactNode, title: string, subtitle: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center p-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-xl cursor-pointer transition-all shadow-sm backdrop-blur-sm group">
      <div className="p-3 ml-4 shadow-inner bg-white/10 rounded-xl">
        {icon}
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="font-medium text-white/90 group-hover:text-white truncate" dir="auto">{title}</h4>
        <p className="text-xs text-white/50 mt-1 truncate" dir="auto">{subtitle}</p>
      </div>
      <button className="mr-auto text-xs bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-colors shadow-sm">
        عرض
      </button>
    </div>
  );
}
