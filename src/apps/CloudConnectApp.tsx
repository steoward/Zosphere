import { Cloud, HardDrive, Database, RefreshCw, Search, Grid, List, LogOut, ExternalLink, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import React, { useEffect, useState } from 'react';

export function CloudConnectApp() {
  const { isAuthenticated, user, setAuth } = useStore();
  const [loading, setLoading] = useState(true);
  const [folderId, setFolderId] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/status');
      const data = await res.json();
      setAuth(data.authenticated, data.user);
      
      if (data.authenticated) {
        // Initialize Zosphere folder
        const initRes = await fetch('/api/drive/init', { method: 'POST' });
        if (initRes.ok) {
          const initData = await initRes.json();
          setFolderId(initData.folderId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      const popup = window.open(url, 'oauth', 'width=600,height=700');

      const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === 'OAUTH_AUTH_SUCCESS') {
          checkAuth();
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/auth/logout');
      setAuth(false, null);
      setFolderId(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-white/80">جاري التحقق من حالة الاتصال...</div>;
  }

  if (isAuthenticated) {
    return <DriveExplorer onDisconnect={handleDisconnect} userEmail={user?.email} folderId={folderId} />;
  }

  return (
    <div className="flex flex-col space-y-6 text-white h-full items-center justify-center bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden p-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-2 drop-shadow-md">اربط خدمات التخزين السحابي</h2>
        <p className="text-sm text-white/70 max-w-md mx-auto">
          اختر الخدمة التي تفضلها لمزامنة ملفاتك وعرضها على سطح مكتبك الافتراضي. سيتم إنشاء مجلد "Zosphere" خاص بك.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <CloudProviderCard 
          name="Google Drive" 
          icon={<Database size={40} className="text-green-400 drop-shadow-md" />} 
          connected={isAuthenticated}
          userEmail={user?.email}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
        <CloudProviderCard 
          name="OneDrive" 
          icon={<Cloud size={40} className="text-blue-400 drop-shadow-md" />} 
          connected={false}
        />
        <CloudProviderCard 
          name="Dropbox" 
          icon={<HardDrive size={40} className="text-blue-500 drop-shadow-md" />} 
          connected={false}
        />
      </div>
    </div>
  );
}

function CloudProviderCard({ 
  name, 
  icon, 
  connected, 
  userEmail,
  onConnect,
  onDisconnect
}: { 
  name: string, 
  icon: React.ReactNode, 
  connected: boolean, 
  userEmail?: string,
  onConnect?: () => void,
  onDisconnect?: () => void
}) {
  return (
    <div className="border border-white/20 bg-white/5 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition-all backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1">
      <div className="mb-4 p-4 bg-white/10 rounded-full shadow-inner">{icon}</div>
      <h3 className="font-semibold mb-2 text-lg text-white drop-shadow-sm">{name}</h3>
      {connected ? (
        <>
          <span className="text-xs text-green-300 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full mb-2 shadow-sm">متصل</span>
          {userEmail && <span className="text-xs text-white/60 mb-4 truncate w-full">{userEmail}</span>}
          <button onClick={onDisconnect} className="mt-auto text-sm bg-red-500/80 hover:bg-red-500 text-white px-5 py-2 rounded-xl transition-colors shadow-md border border-red-500/50 w-full">
            إلغاء الربط
          </button>
        </>
      ) : (
        <button onClick={onConnect} className="mt-auto text-sm bg-blue-500/80 hover:bg-blue-500 text-white px-5 py-2 rounded-xl transition-colors shadow-md border border-blue-500/50 w-full">
          ربط الحساب
        </button>
      )}
    </div>
  );
}

function DriveExplorer({ onDisconnect, userEmail, folderId }: { onDisconnect: () => void, userEmail?: string, folderId: string | null }) {
  const { driveFiles, setDriveFiles, addLocalFile } = useStore();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [importing, setImporting] = useState<string | null>(null);

  const fetchFiles = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive/search?q=${encodeURIComponent(query)}`);
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
    fetchFiles();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchFiles(searchQuery);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleImport = async (file: any) => {
    setImporting(file.id);
    try {
      // In a real app, we would download the file content here.
      // For now, we'll add a reference to it in localFiles.
      addLocalFile({
        id: file.id,
        name: file.name,
        type: file.mimeType.includes('image') ? 'image' : 'document',
        url: file.webViewLink,
        icon: file.iconLink,
        parentId: 'root',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      // Show a brief success indication
      setTimeout(() => setImporting(null), 1000);
    } catch (err) {
      console.error(err);
      setImporting(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-2 bg-white/10 rounded-xl shadow-inner">
            <Database className="text-green-400 drop-shadow-md" size={24} />
          </div>
          <div>
            <h2 className="font-semibold text-white drop-shadow-sm">Google Drive</h2>
            <p className="text-xs text-white/60">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {folderId && (
            <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
              مجلد Zosphere جاهز
            </span>
          )}
          <button 
            onClick={onDisconnect}
            className="flex items-center space-x-2 space-x-reverse text-sm text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-xl transition-colors border border-transparent hover:border-red-500/30"
          >
            <LogOut size={16} />
            <span>إلغاء الربط</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في ملفاتي..." 
            className="w-full pl-3 pr-10 py-2 text-sm bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white placeholder-white/40 shadow-inner transition-all hover:bg-black/30"
          />
        </div>
        <div className="flex items-center space-x-2 space-x-reverse mr-4 bg-black/20 p-1 rounded-xl border border-white/10 shadow-inner">
          <button onClick={() => fetchFiles(searchQuery)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="h-5 w-px bg-white/20 mx-1"></div>
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
            <Grid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-transparent">
        {loading && driveFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/60">
            <RefreshCw className="animate-spin mb-4 text-blue-400 drop-shadow-md" size={36} />
            <p className="text-lg">جاري تحميل الملفات...</p>
          </div>
        ) : driveFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50">
            <div className="p-6 bg-white/5 rounded-full mb-4 shadow-inner">
              <Database size={48} className="opacity-40" />
            </div>
            <p className="text-lg">لا توجد ملفات لعرضها</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" : "flex flex-col space-y-2"}>
            {driveFiles.map(file => (
              <FileItem 
                key={file.id} 
                file={file} 
                viewMode={viewMode} 
                onImport={() => handleImport(file)}
                isImporting={importing === file.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FileItem({ file, viewMode, onImport, isImporting }: { file: any, viewMode: 'grid' | 'list', onImport: () => void, isImporting: boolean }) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/30 transition-all group shadow-sm backdrop-blur-sm">
        <div 
          onClick={() => window.open(file.webViewLink, '_blank')}
          className="flex items-center space-x-4 space-x-reverse overflow-hidden cursor-pointer flex-1"
        >
          <div className="p-2 bg-white/10 rounded-lg shadow-inner">
            <img src={file.iconLink} alt="" className="w-6 h-6 flex-shrink-0 drop-shadow-sm" />
          </div>
          <span className="truncate text-sm font-medium text-white/90 group-hover:text-white">{file.name}</span>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse text-xs text-white/50">
          <span className="hidden sm:inline-block">{new Date(file.modifiedTime).toLocaleDateString('ar-EG')}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onImport(); }}
            disabled={isImporting}
            className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1 rounded-lg transition-colors border border-blue-500/30"
          >
            {isImporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            <span>استيراد</span>
          </button>
          <ExternalLink 
            size={16} 
            className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 drop-shadow-sm cursor-pointer" 
            onClick={() => window.open(file.webViewLink, '_blank')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/30 transition-all group text-center shadow-sm backdrop-blur-sm hover:-translate-y-1 hover:shadow-lg relative">
      <div 
        onClick={() => window.open(file.webViewLink, '_blank')}
        className="w-full flex flex-col items-center cursor-pointer"
      >
        <div className="w-20 h-20 mb-4 flex items-center justify-center bg-black/20 shadow-inner rounded-2xl group-hover:scale-105 transition-transform border border-white/5">
          <img src={file.iconLink} alt="" className="w-12 h-12 drop-shadow-md" />
        </div>
        <span className="text-sm font-medium text-white/90 group-hover:text-white line-clamp-2 w-full leading-tight" title={file.name}>
          {file.name}
        </span>
        <span className="text-[11px] text-white/50 mt-2">
          {new Date(file.modifiedTime).toLocaleDateString('ar-EG')}
        </span>
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); onImport(); }}
        disabled={isImporting}
        className="absolute top-2 left-2 p-1.5 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        title="استيراد للمنصة"
      >
        {isImporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
      </button>
    </div>
  );
}
