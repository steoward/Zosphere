import { Search, Globe, Database, Book, Video, Music, Image as ImageIcon, X, ExternalLink, Play, FileText, Download, Check, Monitor, Cloud } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useStore } from '../store/useStore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type MediaType = 'text' | 'image' | 'video' | 'audio' | 'book';

interface SearchResultItem {
  id?: string;
  title: string;
  snippet: string;
  url: string;
  type: MediaType;
  mediaUrl?: string;
  renderMethod?: 'iframe' | 'video' | 'audio' | 'image' | 'text';
  source?: 'internet' | 'archive';
}

const getMediaTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'book':
    case 'text': return <Book size={20} className="text-blue-400" />;
    case 'video': return <Video size={20} className="text-red-400" />;
    case 'audio': return <Music size={20} className="text-green-400" />;
    case 'image': return <ImageIcon size={20} className="text-yellow-400" />;
    default: return <Globe size={20} className="text-white/60" />;
  }
};

function ImportModal({ item, onClose }: { item: SearchResultItem, onClose: () => void }) {
  const { addLocalFile, driveFiles, setDriveFiles, isAuthenticated } = useStore();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImport = async (destination: 'desktop' | 'drive') => {
    setSaving(true);
    // Simulate AI downloading the file
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fileId = Math.random().toString(36).substr(2, 9);
    const fileType = item.type === 'book' ? 'document' : item.type === 'text' ? 'document' : item.type;
    
    if (destination === 'desktop') {
      addLocalFile({
        id: fileId,
        name: item.title,
        type: fileType as any,
        parentId: 'root',
        url: item.mediaUrl || item.url,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } else if (destination === 'drive') {
      setDriveFiles([...driveFiles, {
        id: fileId,
        name: item.title,
        mimeType: 'application/vnd.google-apps.document',
        webViewLink: item.mediaUrl || item.url,
        iconLink: '',
      }]);
    }
    
    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-white/50 hover:text-white">
          <X size={20} />
        </button>
        <h3 className="text-xl font-medium text-white mb-6">استيراد الملف</h3>
        
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <p className="text-white font-medium">تم الاستيراد بنجاح!</p>
          </div>
        ) : saving ? (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/70">يقوم الذكاء الاصطناعي بتحميل الملف...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/70 text-sm mb-4">اختر مكان حفظ "{item.title}":</p>
            <button 
              onClick={() => handleImport('desktop')}
              className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-4 transition-colors text-right"
            >
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <Monitor size={24} />
              </div>
              <div>
                <div className="text-white font-medium">سطح المكتب</div>
                <div className="text-white/50 text-xs mt-1">حفظ في الملفات المحلية</div>
              </div>
            </button>
            
            <button 
              onClick={() => handleImport('drive')}
              disabled={!isAuthenticated}
              className={`w-full p-4 border rounded-xl flex items-center gap-4 transition-colors text-right ${isAuthenticated ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'}`}
            >
              <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                <Cloud size={24} />
              </div>
              <div>
                <div className="text-white font-medium">Google Drive</div>
                <div className="text-white/50 text-xs mt-1">
                  {isAuthenticated ? 'حفظ في التخزين السحابي' : 'يجب تسجيل الدخول أولاً'}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MediaPreview({ item }: { item: SearchResultItem }) {
  const [error, setError] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    setError(false);
  }, [item]);

  const method = item.renderMethod || (item.source === 'archive' ? 'iframe' : item.type);

  if (!item.mediaUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-white/5 rounded-lg p-8 text-center">
        {getMediaTypeIcon(item.type)}
        <h4 className="text-xl font-medium mt-4 mb-2">{item.title}</h4>
        <p className="text-white/60 max-w-md leading-relaxed">{item.snippet}</p>
        <div className="flex items-center gap-3 mt-6">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noreferrer" 
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-[35px] transition-colors flex items-center gap-2 shadow-lg"
          >
            <span>زيارة الموقع الأصلي</span>
            <ExternalLink size={18} />
          </a>
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-[35px] transition-colors flex items-center gap-2 shadow-lg"
          >
            <span>استيراد</span>
            <Download size={18} />
          </button>
        </div>
        {showImportModal && <ImportModal item={item} onClose={() => setShowImportModal(false)} />}
      </div>
    );
  }

  if (method === 'iframe') {
    return (
      <div className="w-full h-full relative flex flex-col">
        <iframe
          src={item.mediaUrl}
          className="w-full flex-grow border-0 rounded-lg shadow-lg bg-white/5"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={item.title}
          onError={() => setError(true)}
        />
        <div className="mt-4 flex justify-center gap-3">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noreferrer" 
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-[35px] transition-colors flex items-center gap-2"
          >
            <span>فتح الموقع الأصلي</span>
            <ExternalLink size={14} />
          </a>
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-[35px] transition-colors flex items-center gap-2"
          >
            <span>استيراد</span>
            <Download size={14} />
          </button>
        </div>
        {showImportModal && <ImportModal item={item} onClose={() => setShowImportModal(false)} />}
      </div>
    );
  }

  if (method === 'image' && !error) {
    return (
      <div className="w-full h-full relative flex flex-col items-center justify-center">
        <img src={item.mediaUrl} alt={item.title} onError={() => setError(true)} className="max-w-full max-h-full object-contain rounded-lg shadow-lg flex-grow" referrerPolicy="no-referrer" />
        <div className="absolute bottom-4 right-4">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-sm rounded-[35px] transition-colors flex items-center gap-2 shadow-lg border border-white/10"
          >
            <span>استيراد</span>
            <Download size={14} />
          </button>
        </div>
        {showImportModal && <ImportModal item={item} onClose={() => setShowImportModal(false)} />}
      </div>
    );
  }
  
  if (method === 'video' && !error) {
    return (
      <div className="w-full h-full relative flex flex-col items-center justify-center bg-black/40 rounded-lg">
        <video 
          src={item.mediaUrl} 
          controls 
          autoPlay
          onError={() => setError(true)}
          className="max-w-full max-h-full rounded-lg shadow-lg flex-grow" 
        >
          متصفحك لا يدعم تشغيل هذا الفيديو.
        </video>
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-sm rounded-[35px] transition-colors flex items-center gap-2 shadow-lg border border-white/10"
          >
            <span>استيراد</span>
            <Download size={14} />
          </button>
        </div>
        {showImportModal && <ImportModal item={item} onClose={() => setShowImportModal(false)} />}
      </div>
    );
  }
  
  if (method === 'audio' && !error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-white/5 rounded-lg p-8 relative">
        <Music size={64} className="text-green-400 mb-8 opacity-50" />
        <audio src={item.mediaUrl} controls autoPlay onError={() => setError(true)} className="w-full max-w-md" />
        <div className="mt-8">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-[35px] transition-colors flex items-center gap-2 shadow-lg"
          >
            <span>استيراد لسطح المكتب</span>
            <Download size={18} />
          </button>
        </div>
        {showImportModal && <ImportModal item={item} onClose={() => setShowImportModal(false)} />}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-white/5 rounded-lg p-8 text-center">
      {getMediaTypeIcon(item.type)}
      <h4 className="text-xl font-medium mt-4 mb-2">{item.title}</h4>
      <p className="text-white/60 max-w-md leading-relaxed">{item.snippet}</p>
      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm max-w-md">
          تعذر تشغيل الوسائط مباشرة (قد يكون الرابط محمياً أو غير مدعوم). يرجى فتح الموقع الأصلي.
        </div>
      )}
      <div className="flex items-center gap-3 mt-6">
        <a 
          href={item.url} 
          target="_blank" 
          rel="noreferrer" 
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-[35px] transition-colors flex items-center gap-2 shadow-lg"
        >
          <span>زيارة الموقع الأصلي</span>
          <ExternalLink size={18} />
        </a>
        <button 
          onClick={() => setShowImportModal(true)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-[35px] transition-colors flex items-center gap-2 shadow-lg"
        >
          <span>استيراد</span>
          <Download size={18} />
        </button>
      </div>
      {showImportModal && <ImportModal item={item} onClose={() => setShowImportModal(false)} />}
    </div>
  );
}

export function SearchApp() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('الكل');
  const [currentPage, setCurrentPage] = useState(1);

  const filters = ['الكل', 'كتب ونصوص', 'فيديو', 'صوتيات', 'صور'];

  const searchInternet = async (q: string, filter: string, page: number = 1) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    
    setLoading(true);
    setHasSearched(true);
    setSelectedItem(null);
    
    try {
      // 1. Fetch Archive Results
      let archiveResults: SearchResultItem[] = [];
      try {
        let mediaFilter = '';
        if (filter === 'كتب ونصوص') mediaFilter = ' AND mediatype:texts';
        else if (filter === 'فيديو') mediaFilter = ' AND mediatype:movies';
        else if (filter === 'صوتيات') mediaFilter = ' AND mediatype:audio';
        else if (filter === 'صور') mediaFilter = ' AND mediatype:image';

        const res = await fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent('(' + q + ')' + mediaFilter)}&fl[]=identifier,title,description,mediatype,creator,date&sort[]=downloads+desc&rows=15&page=${page}&output=json`);
        const data = await res.json();
        const docs = data.response?.docs || [];
        
        archiveResults = docs.map((doc: any) => {
          let type: MediaType = 'text';
          if (doc.mediatype === 'movies') type = 'video';
          if (doc.mediatype === 'audio') type = 'audio';
          if (doc.mediatype === 'image') type = 'image';
          if (doc.mediatype === 'texts') type = 'book';

          let snippet = 'أرشيف الإنترنت';
          if (doc.description) {
            snippet = Array.isArray(doc.description) ? doc.description[0] : doc.description;
            snippet = snippet.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
          }

          return {
            id: doc.identifier,
            title: doc.title || 'بدون عنوان',
            snippet,
            url: `https://archive.org/details/${doc.identifier}`,
            type,
            mediaUrl: `https://archive.org/embed/${doc.identifier}`,
            renderMethod: 'iframe',
            source: 'archive'
          };
        });
      } catch (e) {
        console.error("Archive fetch error:", e);
      }

      // 2. Fetch Gemini + Verify Everything
      try {
        const prompt = `
          You are a highly precise search engine assistant and strict relevance evaluator.
          The user is searching for EXACTLY: "${q}".
          The requested filter category is: "${filter}".
          THIS IS PAGE ${page} OF THE SEARCH RESULTS.

          Here are some initial results retrieved from the Internet Archive for page ${page}:
          ${JSON.stringify(archiveResults)}

          INSTRUCTIONS:
          1. Use the Google Search tool to find MORE highly relevant results from the internet.
          2. Because this is PAGE ${page}, you MUST dig deeper and find DIFFERENT results than you would normally find on page 1. Look for results ranked ${(page-1)*15 + 1} to ${page*15}.
          3. VERIFICATION & FILTERING: Critically evaluate ALL results. Discard ANY result that is not directly related to "${q}".
          4. UNIVERSAL MEDIA SUPPORT: You can return results from ANY website (YouTube, Vimeo, Spotify, SoundCloud, Wikipedia, news sites, blogs, etc.).
          5. EMBEDDING RULES (CRITICAL):
             For EVERY result, you must provide a \`mediaUrl\` and a \`renderMethod\` so the app can display it directly:
             - YouTube: mediaUrl MUST be "https://www.youtube.com/embed/[VIDEO_ID]", renderMethod: "iframe"
             - Spotify: mediaUrl MUST be "https://open.spotify.com/embed/track/[ID]" (or album/playlist), renderMethod: "iframe"
             - Vimeo: mediaUrl MUST be "https://player.vimeo.com/video/[ID]", renderMethod: "iframe"
             - SoundCloud: mediaUrl MUST be the visual embed URL, renderMethod: "iframe"
             - Wikipedia or Articles: mediaUrl is the page URL, renderMethod: "iframe"
             - Raw Video (.mp4, .webm): mediaUrl is the direct link, renderMethod: "video"
             - Raw Audio (.mp3, .ogg): mediaUrl is the direct link, renderMethod: "audio"
             - Raw Image (.jpg, .png): mediaUrl is the direct link, renderMethod: "image"
          6. Return a JSON array of the final, verified results. Sort them by relevance. Return AT LEAST 15 results if possible to ensure a large result set.
          
          Each object MUST have:
          - title: string
          - snippet: string
          - url: string (the original page URL)
          - type: string ("text", "image", "video", "audio", "book")
          - mediaUrl: string (the embed URL or raw file URL)
          - renderMethod: string ("iframe", "video", "audio", "image", "text")
          - source: string ("archive" or "internet")
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  url: { type: Type.STRING },
                  type: { type: Type.STRING },
                  mediaUrl: { type: Type.STRING },
                  renderMethod: { type: Type.STRING },
                  source: { type: Type.STRING }
                },
                required: ["title", "snippet", "url", "type", "mediaUrl", "renderMethod", "source"]
              }
            }
          }
        });

        const jsonStr = response.text;
        if (jsonStr) {
          const data = JSON.parse(jsonStr);
          setResults(data);
        } else {
          setResults([]);
        }
      } catch (e) {
        console.error("Gemini fetch error:", e);
        setResults([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    searchInternet(query, activeFilter, 1);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    if (query) {
      searchInternet(query, filter, 1);
    }
  };

  const handlePageChange = (p: number) => {
    if (p < 1 || p > 10 || p === currentPage) return;
    setCurrentPage(p);
    searchInternet(query, activeFilter, p);
  };

  if (selectedItem) {
    let hostname = '';
    try {
      hostname = new URL(selectedItem.url).hostname;
    } catch (e) {
      hostname = selectedItem.url;
    }

    return (
      <div className="flex flex-col h-[500px] text-white bg-black/40 backdrop-blur-md rounded-t-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
          <h3 className="font-medium truncate pr-4 flex-1 text-right leading-relaxed" dir="auto">{selectedItem.title || 'بدون عنوان'}</h3>
          <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors ml-4">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 w-full relative bg-black/20 p-4 flex items-center justify-center overflow-hidden">
          <MediaPreview item={selectedItem} />
        </div>
        <div className="p-4 bg-black/60 border-t border-white/10 text-sm text-white/70 flex justify-between items-center">
          <span className="truncate flex-1 leading-relaxed" dir="auto">
            المصدر: {selectedItem.source === 'archive' ? 'أرشيف الإنترنت' : hostname}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] text-white">
      <div className="flex space-x-2 space-x-reverse mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="ابحث في الإنترنت والأرشيف باستخدام الذكاء الاصطناعي..." 
            className="w-full pl-4 pr-10 py-3 bg-white/10 border border-white/20 rounded-[35px] focus:ring-2 focus:ring-blue-500/50 outline-none text-white placeholder-white/50 shadow-inner transition-all hover:bg-white/20"
            autoFocus
          />
        </div>
        <button 
          onClick={handleSearch}
          className="px-5 py-3 ml-1 w-[100px] justify-center bg-blue-500 hover:bg-blue-600 border border-blue-400/50 rounded-[35px] text-white transition-colors shadow-sm flex items-center gap-2 font-medium"
        >
          <Search size={20} />
          <span>بحث</span>
        </button>
      </div>

      <div className="flex gap-6 mb-4 border-b border-white/10 pb-2 overflow-x-auto custom-scrollbar">
        {filters.map(filter => (
          <button 
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`whitespace-nowrap pb-2 transition-colors ${
              activeFilter === filter 
                ? 'text-blue-400 font-medium border-b-2 border-blue-400 -mb-[9px] drop-shadow-sm' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto space-y-3 pr-2 custom-scrollbar pb-4">
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center h-full text-white/50 p-8">
            <div className="p-6 bg-white/5 rounded-full mb-6 shadow-inner">
              <Globe className="opacity-40" size={48} />
            </div>
            <p className="text-center text-lg leading-relaxed">ابحث في كامل الإنترنت وأرشيف الإنترنت معاً. سيقوم الذكاء الاصطناعي بجلب المحتوى والوسائط بدقة وسرعة عالية.</p>
          </div>
        )}
        
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-white/60 p-8">
             <div className="animate-spin mb-6 text-blue-400 drop-shadow-md">
               <Search size={36} />
             </div>
             <p className="text-lg leading-relaxed">جاري البحث وتحليل النتائج...</p>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/50 p-8">
            <div className="p-6 bg-white/5 rounded-full mb-6 shadow-inner">
              <Search className="opacity-40" size={48} />
            </div>
            <p className="text-lg leading-relaxed">لم يتم العثور على نتائج. جرب كلمات مفتاحية أخرى.</p>
          </div>
        )}

        {!loading && results.map((item, idx) => (
          <SearchResult 
            key={idx}
            icon={getMediaTypeIcon(item.type)} 
            title={item.title || 'بدون عنوان'} 
            snippet={item.snippet} 
            url={item.url}
            source={item.source}
            onClick={() => setSelectedItem(item)}
          />
        ))}

        {!loading && hasSearched && results.length > 0 && (
          <div className="flex flex-col items-center mt-12 mb-8" dir="ltr">
            <div className="flex items-end justify-center text-4xl font-bold mb-2 select-none">
              <span className="text-[#4285F4]">G</span>
              {Array.from({ length: 10 }).map((_, i) => {
                const p = i + 1;
                const isRed = i % 2 === 0;
                return (
                  <span 
                    key={p} 
                    className={`cursor-pointer transition-all ${isRed ? 'text-[#EA4335]' : 'text-[#FBBC05]'} ${currentPage === p ? 'text-5xl' : 'hover:opacity-80'}`} 
                    onClick={() => handlePageChange(p)}
                  >
                    o
                  </span>
                );
              })}
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </div>
            <div className="flex items-center justify-center gap-1 mb-4">
              <span className="w-6"></span>
              {Array.from({ length: 10 }).map((_, i) => {
                const p = i + 1;
                return (
                  <button 
                    key={p} 
                    onClick={() => handlePageChange(p)}
                    className={`w-6 text-center text-sm transition-colors ${currentPage === p ? 'text-white font-bold' : 'text-blue-400 hover:underline'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <span className="w-6"></span>
            </div>
            <div className="flex gap-8 mt-2" dir="rtl">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className={`text-sm font-medium flex items-center gap-1 transition-colors ${currentPage === 1 ? 'text-white/30 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300 hover:underline'}`}
              >
                السابق
              </button>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === 10}
                className={`text-sm font-medium flex items-center gap-1 transition-colors ${currentPage === 10 ? 'text-white/30 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300 hover:underline'}`}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResult({ icon, title, snippet, url, source, onClick }: { icon: React.ReactNode, title: string, snippet: string, url: string, source?: string, onClick?: () => void }) {
  let domain = '';
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    domain = url;
  }

  return (
    <div onClick={onClick} className="flex items-start p-4 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-xl cursor-pointer transition-all shadow-sm backdrop-blur-sm group gap-4">
      <div className="p-3 shadow-inner bg-white/10 rounded-xl shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="font-medium text-white/90 group-hover:text-white truncate leading-relaxed" dir="auto">{title}</h4>
        <p className="text-sm text-white/60 mt-1.5 line-clamp-2 leading-relaxed" dir="auto">{snippet}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-blue-300/70 bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20 truncate max-w-[200px]" dir="ltr">
            {domain}
          </span>
          {source === 'archive' && (
            <span className="text-xs text-amber-300/70 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
              أرشيف الإنترنت
            </span>
          )}
          {source === 'internet' && (
            <span className="text-xs text-emerald-300/70 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              الويب (Gemini)
            </span>
          )}
        </div>
      </div>
      <button className="shrink-0 text-xs bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-colors shadow-sm self-center">
        عرض
      </button>
    </div>
  );
}
