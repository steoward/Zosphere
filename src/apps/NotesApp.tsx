import { useState } from 'react';
import { Plus, Trash2, CloudUpload } from 'lucide-react';
import { useStore } from '../store/useStore';

export function NotesApp() {
  const { isAuthenticated } = useStore();
  const [notes, setNotes] = useState([
    { id: 1, title: 'أفكار المشروع', content: 'نحتاج لإضافة ميزة التخزين السحابي قريباً.' },
    { id: 2, title: 'قائمة المهام', content: '- إنهاء التصميم\n- كتابة الكود\n- اختبار التطبيق' }
  ]);
  const [activeNote, setActiveNote] = useState(notes[0]);
  const [saving, setSaving] = useState(false);

  const saveToDrive = async () => {
    if (!isAuthenticated) {
      alert('يرجى تسجيل الدخول إلى Google Drive أولاً من تطبيق التخزين السحابي.');
      return;
    }

    setSaving(true);
    try {
      // First ensure folder exists
      const initRes = await fetch('/api/drive/init', { method: 'POST' });
      if (!initRes.ok) throw new Error('Failed to init folder');
      const { folderId } = await initRes.json();

      // Upload file
      const uploadRes = await fetch('/api/drive/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${activeNote.title}.txt`,
          content: activeNote.content,
          mimeType: 'text/plain',
          folderId
        })
      });

      if (!uploadRes.ok) throw new Error('Failed to upload');
      alert('تم الحفظ في Google Drive بنجاح!');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء الحفظ.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full w-full text-white bg-white/5 backdrop-blur-xl rounded-none overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-l border-white/10 bg-black/20 p-4 flex flex-col gap-4">
        <button 
          onClick={() => {
            const newNote = { id: Date.now(), title: 'ملاحظة جديدة', content: '' };
            setNotes([newNote, ...notes]);
            setActiveNote(newNote);
          }}
          className="flex items-center justify-center gap-2 w-full py-2 bg-blue-500/30 hover:bg-blue-500/50 border border-blue-400/30 rounded-xl transition-all shadow-lg backdrop-blur-md"
        >
          <Plus size={18} /> إضافة ملاحظة
        </button>
        
        <div className="flex-col flex gap-2 overflow-y-auto pr-1">
          {notes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNote(note)}
              className={`p-3 rounded-xl text-right transition-all border shadow-sm backdrop-blur-md ${activeNote.id === note.id ? 'bg-white/20 border-white/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
            >
              <div className="font-medium text-sm truncate">{note.title}</div>
              <div className="text-xs text-white/50 truncate mt-1">{note.content || 'فارغ...'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="w-2/3 p-6 flex flex-col gap-4 bg-white/5">
        <div className="flex justify-between items-center">
          <input 
            type="text" 
            value={activeNote.title}
            onChange={(e) => {
              const updated = { ...activeNote, title: e.target.value };
              setActiveNote(updated);
              setNotes(notes.map(n => n.id === activeNote.id ? updated : n));
            }}
            className="bg-transparent text-2xl font-bold outline-none w-full placeholder-white/30"
            placeholder="عنوان الملاحظة..."
          />
          <div className="flex gap-2">
            <button 
              onClick={saveToDrive}
              disabled={saving}
              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors border border-transparent hover:border-blue-400/30 disabled:opacity-50"
              title="حفظ في Google Drive"
            >
              <CloudUpload size={20} className={saving ? "animate-bounce" : ""} />
            </button>
            <button 
              onClick={() => {
                const newNotes = notes.filter(n => n.id !== activeNote.id);
                setNotes(newNotes);
                setActiveNote(newNotes[0] || { id: Date.now(), title: '', content: '' });
              }}
              className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg transition-colors border border-transparent hover:border-red-400/30"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        <textarea 
          value={activeNote.content}
          onChange={(e) => {
            const updated = { ...activeNote, content: e.target.value };
            setActiveNote(updated);
            setNotes(notes.map(n => n.id === activeNote.id ? updated : n));
          }}
          className="bg-transparent flex-1 resize-none outline-none text-white/80 leading-relaxed placeholder-white/20"
          placeholder="اكتب ملاحظتك هنا..."
        />
      </div>
    </div>
  );
}
