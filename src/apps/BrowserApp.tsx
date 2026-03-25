import { useState } from 'react';
import { Search, ArrowRight, ArrowLeft, RotateCw, Home, Star } from 'lucide-react';

export function BrowserApp() {
  const [url, setUrl] = useState('https://zosphere.ai');
  const [input, setInput] = useState(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = input;
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      finalUrl = 'https://' + input;
    }
    setUrl(finalUrl);
    setInput(finalUrl);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white/5 backdrop-blur-xl text-white rounded-none overflow-hidden">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex gap-1">
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <ArrowRight size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <RotateCw size={18} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <Home size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
          <div className="absolute right-3 text-white/40">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-full py-2 pr-10 pl-4 text-sm outline-none focus:bg-white/20 transition-all text-left shadow-inner"
            dir="ltr"
            placeholder="Search or enter website name"
          />
        </form>

        <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
          <Star size={18} />
        </button>
      </div>

      {/* Browser Content Area */}
      <div className="flex-1 bg-white/5 relative overflow-hidden backdrop-blur-sm">
        {/* Mockup content since iframes can be blocked by CORS */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/90 p-8 text-center">
          <GlobeIcon className="w-24 h-24 text-blue-400 mb-6 opacity-50 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <h1 className="text-3xl font-bold mb-4 drop-shadow-md">Zosphere</h1>
          <p className="text-white/70 max-w-md">
            Welcome to the future of web experiences. This is a simulated browser environment running inside your virtual desktop.
          </p>
          <div className="mt-8 px-6 py-3 bg-blue-500/30 border border-blue-400/30 text-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all cursor-pointer backdrop-blur-md">
            Explore Features
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}
