import { useState } from 'react';
import { useStore, FileItem } from '../store/useStore';
import { FileText, Image, Folder, Trash2, ExternalLink, ChevronLeft, Plus, Edit2, File as FileIcon, FileCode, FileVideo, FileAudio } from 'lucide-react';

export function FilesApp() {
  const { localFiles, removeLocalFile, openWindow, addLocalFile, updateLocalFile } = useStore();
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreating, setIsCreating] = useState<'folder' | 'file' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const currentFiles = localFiles.filter(f => f.parentId === currentFolderId);
  const currentFolder = localFiles.find(f => f.id === currentFolderId);

  // Build breadcrumbs
  const breadcrumbs = [];
  let curr: FileItem | undefined = currentFolder;
  while (curr) {
    breadcrumbs.unshift(curr);
    curr = localFiles.find(f => f.id === curr?.parentId);
  }

  const handleCreate = () => {
    if (!newItemName.trim()) {
      setIsCreating(null);
      return;
    }
    
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: isCreating === 'folder' ? 'folder' : 'text',
      parentId: currentFolderId,
      content: isCreating === 'file' ? '' : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    addLocalFile(newFile);
    setIsCreating(null);
    setNewItemName('');
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      updateLocalFile(id, { name: editName });
    }
    setEditingId(null);
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <Folder size={32} className={file.color ? file.color.replace('bg-', 'text-') : 'text-blue-400'} />;
    if (file.icon) return <img src={file.icon} alt="" className="w-12 h-12 drop-shadow-md" />;
    
    const name = file.name.toLowerCase();
    if (file.type === 'image' || name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return <Image size={32} className="text-purple-400 drop-shadow-md" />;
    if (file.type === 'video' || name.match(/\.(mp4|webm|ogg|mov)$/i)) return <FileVideo size={32} className="text-red-400 drop-shadow-md" />;
    if (file.type === 'audio' || name.match(/\.(mp3|wav|ogg)$/i)) return <FileAudio size={32} className="text-yellow-400 drop-shadow-md" />;
    if (name.match(/\.(js|jsx|ts|tsx|html|css|json|md|py|rs|go)$/i)) return <FileCode size={32} className="text-green-400 drop-shadow-md" />;
    return <FileText size={32} className="text-blue-400 drop-shadow-md" />;
  };

  return (
    <div className="flex flex-col h-full w-full bg-white/5 backdrop-blur-xl text-white rounded-none overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col border-b border-white/10 bg-black/20">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.id} className="flex items-center">
                <button 
                  onClick={() => setCurrentFolderId(crumb.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${idx === breadcrumbs.length - 1 ? 'bg-white/10 text-white font-medium shadow-inner' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                >
                  {crumb.name}
                </button>
                {idx < breadcrumbs.length - 1 && <ChevronLeft size={16} className="text-white/30 mx-1" />}
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setIsCreating('folder')}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition-colors border border-blue-500/30 flex items-center gap-1 shadow-sm"
              title="مجلد جديد"
            >
              <Plus size={16} />
              <Folder size={16} />
            </button>
            <button 
              onClick={() => setIsCreating('file')}
              className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-300 rounded-lg transition-colors border border-green-500/30 flex items-center gap-1 shadow-sm"
              title="ملف جديد"
            >
              <Plus size={16} />
              <FileText size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-transparent">
        {isCreating && (
          <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20 flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-top-4">
            {isCreating === 'folder' ? <Folder className="text-blue-400" /> : <FileText className="text-green-400" />}
            <input 
              autoFocus
              type="text" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setIsCreating(null);
              }}
              placeholder={`اسم ال${isCreating === 'folder' ? 'مجلد' : 'ملف'} الجديد...`}
              className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500/50"
            />
            <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">إنشاء</button>
            <button onClick={() => setIsCreating(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">إلغاء</button>
          </div>
        )}

        {currentFiles.length === 0 && !isCreating ? (
          <div className="flex flex-col items-center justify-center h-full text-white/50">
            <div className="p-6 bg-white/5 rounded-full mb-4 shadow-inner">
              <Folder size={48} className="opacity-40" />
            </div>
            <p className="text-lg">المجلد فارغ</p>
            <p className="text-sm text-white/40 mt-2">قم بإنشاء ملفات أو مجلدات جديدة هنا</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentFiles.map(file => (
              <div 
                key={file.id}
                onClick={() => {
                  if (editingId === file.id) return;
                  if (file.type === 'folder') {
                    setCurrentFolderId(file.id);
                  } else {
                    openWindow(`file-${file.id}`);
                  }
                }}
                className="flex flex-col items-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/30 transition-all group text-center shadow-sm backdrop-blur-sm hover:-translate-y-1 hover:shadow-lg relative cursor-pointer"
              >
                <div className={`w-20 h-20 mb-4 flex items-center justify-center shadow-inner rounded-2xl group-hover:scale-105 transition-transform border border-white/5 ${file.color ? file.color.replace('bg-', 'bg-opacity-20 bg-') : 'bg-black/20'}`}>
                  {getFileIcon(file)}
                </div>
                
                {editingId === file.id ? (
                  <input 
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRename(file.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(file.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="w-full bg-black/50 border border-blue-500/50 rounded px-2 py-1 text-sm text-center text-white outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm font-medium text-white/90 group-hover:text-white line-clamp-2 w-full leading-tight" title={file.name}>
                    {file.name}
                  </span>
                )}
                
                <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeLocalFile(file.id); }}
                    className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg shadow-md"
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditingId(file.id); 
                      setEditName(file.name); 
                    }}
                    className="p-1.5 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg shadow-md"
                    title="إعادة تسمية"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                
                {file.url && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(file.url, '_blank'); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-black/60 text-white/70 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="فتح في علامة تبويب جديدة"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
