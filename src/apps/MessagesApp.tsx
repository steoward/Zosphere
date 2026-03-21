import { Send } from 'lucide-react';

export function MessagesApp() {
  return (
    <div className="flex flex-col h-full w-full bg-white/5 backdrop-blur-xl text-white rounded-2xl overflow-hidden p-4">
      <div className="flex-1 overflow-auto p-2 space-y-4">
        <MessageBubble text="مرحباً! هل يمكنك مشاركة ملف التصميم الأخير معي؟" isMe={false} time="10:30 ص" />
        <MessageBubble text="أهلاً! بالتأكيد، لقد قمت بتحديث صلاحيات المجلد ليكون متاحاً للأصدقاء." isMe={true} time="10:32 ص" />
        <MessageBubble text="شكراً جزيلاً! سأقوم بتحميله الآن." isMe={false} time="10:35 ص" />
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center space-x-2 space-x-reverse">
        <input 
          type="text" 
          placeholder="اكتب رسالة..." 
          className="flex-1 bg-black/20 border border-white/10 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-white/40 shadow-inner transition-all hover:bg-black/30"
        />
        <button className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-500 transition-colors shadow-md border border-blue-400/30">
          <Send size={18} className="mr-1" />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ text, isMe, time }: { text: string, isMe: boolean, time: string }) {
  return (
    <div className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
      <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm backdrop-blur-md border ${
        isMe 
          ? 'bg-blue-500/30 text-white rounded-br-none border-blue-400/30' 
          : 'bg-white/10 text-white rounded-bl-none border-white/20'
      }`}>
        <p className="text-sm">{text}</p>
      </div>
      <span className="text-[10px] text-white/40 mt-1 mx-1">{time}</span>
    </div>
  );
}
