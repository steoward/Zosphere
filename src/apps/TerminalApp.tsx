import { useState, useRef, useEffect } from 'react';
import { useStore, FileItem } from '../store/useStore';
import { Terminal as TerminalIcon, Play, X, Cpu, Command, Square, Plus, RefreshCw } from 'lucide-react';

declare global {
  interface Window {
    V86: any;
    V86Starter: any;
  }
}

type CommandHistory = {
  command: string;
  output: string | React.ReactNode;
  isError?: boolean;
};

function DaytonaSandbox({ isActive }: { isActive: boolean }) {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');

  const fetchWorkspaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/daytona/workspace');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch workspaces');
      }
      const data = await res.json();
      setWorkspaces(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/daytona/workspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositories: [
            {
              url: repoUrl
            }
          ]
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create workspace');
      }
      
      setRepoUrl('');
      await fetchWorkspaces();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchWorkspaces();
    }
  }, [isActive]);

  return (
    <div className="flex-1 w-full h-full bg-[#0a0a0a] text-gray-300 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TerminalIcon className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Daytona Workspaces</h2>
              <p className="text-sm text-gray-400">Manage your cloud development environments</p>
            </div>
          </div>
          <button 
            onClick={fetchWorkspaces}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-md transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && !workspaces.length ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {workspaces.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <TerminalIcon size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No workspaces found</h3>
                <p className="text-gray-400 mb-6">Create a new Daytona workspace to get started.</p>
                <form onSubmit={createWorkspace} className="max-w-md mx-auto flex gap-2">
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="Git Repository URL"
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {isCreating ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />}
                    Create
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <form onSubmit={createWorkspace} className="flex gap-2">
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="Git Repository URL"
                      className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {isCreating ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />}
                      Create
                    </button>
                  </form>
                </div>
                {workspaces.map((ws: any) => (
                  <div key={ws.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white">{ws.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">Repository: {ws.repository?.url || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${ws.info?.providerMetadata?.state === 'started' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <span className="text-sm text-gray-300 capitalize">{ws.info?.providerMetadata?.state || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white" title="Start">
                          <Play size={16} />
                        </button>
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-white" title="Stop">
                          <Square size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TerminalApp() {
  const { localFiles, addLocalFile, removeLocalFile, updateLocalFile } = useStore();
  const [activeTab, setActiveTab] = useState<'cli' | 'daytona'>('cli');
  const [history, setHistory] = useState<CommandHistory[]>([
    { command: '', output: 'Zosphere Terminal v1.0.0\nType "help" for a list of commands.\nKaggle API integration available via "kaggle" command (uses KAGGLE_API_TOKEN from secrets).\nGoogle Drive & Docs integration available via "drive" command.' }
  ]);
  const [input, setInput] = useState('');
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'cli') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, activeTab]);

  const getCurrentFolderId = () => currentPath[currentPath.length - 1];

  const getPathString = () => {
    const names = currentPath.map(id => {
      if (id === 'root') return '~';
      return localFiles.find(f => f.id === id)?.name || 'unknown';
    });
    return names.join('/');
  };

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    const args = cmd.split(' ').filter(Boolean);
    const command = args[0].toLowerCase();
    
    let output: string | React.ReactNode = '';
    let isError = false;

    const currentFolderId = getCurrentFolderId();

    // Add command to history immediately
    setHistory(prev => [...prev, { command: cmd, output: '...' }]);
    setInput('');

    try {
      switch (command) {
        case 'help':
          output = `Available commands:
  ls       - List directory contents
  cd       - Change directory
  mkdir    - Create a directory
  touch    - Create an empty file
  rm       - Remove a file or directory
  cat      - Display file contents
  play     - Play/View media files (images, audio, video)
  echo     - Write text to a file (e.g., echo "hello" > file.txt)
  clear    - Clear the terminal screen
  python   - Execute Python code (e.g., python -c "print('hello')")
  kaggle   - Interact with Kaggle API (Compute/Kernels only)
             Usage: kaggle kernels list
                    kaggle kernels status <ref>
                    kaggle kernels pull <ref>
  drive    - Google Drive & Docs integration
             Usage: drive init
                    drive ls
                    drive push <filename>
                    drive pull <file_id>
  pwd      - Print working directory`;
          break;
        
        case 'pwd':
          output = getPathString();
          break;

        case 'clear':
          setHistory([]);
          return;

        case 'ls':
          const files = localFiles.filter(f => f.parentId === currentFolderId);
          if (files.length === 0) {
            output = '';
          } else {
            output = (
              <div className="grid grid-cols-3 gap-2 mt-1">
                {files.map(f => (
                  <span key={f.id} className={f.type === 'folder' ? 'text-blue-400 font-bold' : 'text-gray-300'}>
                    {f.name}{f.type === 'folder' ? '/' : ''}
                  </span>
                ))}
              </div>
            );
          }
          break;

        case 'cd':
          const target = args[1];
          if (!target || target === '~') {
            setCurrentPath(['root']);
          } else if (target === '..') {
            if (currentPath.length > 1) {
              setCurrentPath(prev => prev.slice(0, -1));
            }
          } else {
            const folder = localFiles.find(f => f.parentId === currentFolderId && f.name === target && f.type === 'folder');
            if (folder) {
              setCurrentPath(prev => [...prev, folder.id]);
            } else {
              output = `cd: ${target}: No such directory`;
              isError = true;
            }
          }
          break;

        case 'mkdir':
          const dirName = args[1];
          if (!dirName) {
            output = 'mkdir: missing operand';
            isError = true;
          } else if (localFiles.some(f => f.parentId === currentFolderId && f.name === dirName)) {
            output = `mkdir: cannot create directory '${dirName}': File exists`;
            isError = true;
          } else {
            addLocalFile({
              id: Date.now().toString(),
              name: dirName,
              type: 'folder',
              parentId: currentFolderId,
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
          }
          break;

        case 'touch':
          const fileName = args[1];
          if (!fileName) {
            output = 'touch: missing operand';
            isError = true;
          } else if (!localFiles.some(f => f.parentId === currentFolderId && f.name === fileName)) {
            addLocalFile({
              id: Date.now().toString(),
              name: fileName,
              type: 'text',
              parentId: currentFolderId,
              content: '',
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
          }
          break;

        case 'rm':
          const rmTarget = args[1];
          if (!rmTarget) {
            output = 'rm: missing operand';
            isError = true;
          } else {
            const fileToRemove = localFiles.find(f => f.parentId === currentFolderId && f.name === rmTarget);
            if (fileToRemove) {
              removeLocalFile(fileToRemove.id);
            } else {
              output = `rm: cannot remove '${rmTarget}': No such file or directory`;
              isError = true;
            }
          }
          break;

        case 'play':
          const playTarget = args[1];
          if (!playTarget) {
            output = 'play: missing operand';
            isError = true;
          } else {
            const playFile = localFiles.find(f => f.parentId === currentFolderId && f.name === playTarget);
            if (playFile) {
              if (playFile.type === 'folder') {
                output = `play: ${playTarget}: Is a directory`;
                isError = true;
              } else if (playFile.content && playFile.content.startsWith('data:')) {
                const mimeType = playFile.content.split(';')[0].split(':')[1];
                if (mimeType.startsWith('image/')) {
                  output = <img src={playFile.content} alt={playFile.name} className="max-w-full max-h-64 object-contain mt-2 rounded border border-gray-700" />;
                } else if (mimeType.startsWith('video/')) {
                  output = <video src={playFile.content} controls className="max-w-full max-h-64 mt-2 rounded border border-gray-700" />;
                } else if (mimeType.startsWith('audio/')) {
                  output = <audio src={playFile.content} controls className="mt-2 w-full max-w-md" />;
                } else {
                  output = `play: ${playTarget}: Unsupported media type (${mimeType})`;
                  isError = true;
                }
              } else {
                output = `play: ${playTarget}: Not a valid media file or missing data URL`;
                isError = true;
              }
            } else {
              output = `play: ${playTarget}: No such file or directory`;
              isError = true;
            }
          }
          break;

        case 'cat':
          const catTarget = args[1];
          if (!catTarget) {
            output = 'cat: missing operand';
            isError = true;
          } else {
            const catFile = localFiles.find(f => f.parentId === currentFolderId && f.name === catTarget);
            if (catFile) {
              if (catFile.type === 'folder') {
                output = `cat: ${catTarget}: Is a directory`;
                isError = true;
              } else {
                output = catFile.content || '';
              }
            } else {
              output = `cat: ${catTarget}: No such file or directory`;
              isError = true;
            }
          }
          break;

        case 'echo':
          const echoText = args.slice(1).join(' ');
          const redirectIndex = echoText.lastIndexOf('>');
          if (redirectIndex !== -1) {
            const text = echoText.substring(0, redirectIndex).trim().replace(/^["']|["']$/g, '');
            const outFile = echoText.substring(redirectIndex + 1).trim();
            
            const existingFile = localFiles.find(f => f.parentId === currentFolderId && f.name === outFile);
            if (existingFile) {
              updateLocalFile(existingFile.id, { content: text });
            } else {
              addLocalFile({
                id: Date.now().toString(),
                name: outFile,
                type: 'text',
                parentId: currentFolderId,
                content: text,
                createdAt: Date.now(),
                updatedAt: Date.now()
              });
            }
          } else {
            output = echoText.replace(/^["']|["']$/g, '');
          }
          break;

        case 'python':
          if (args[1] === '-c') {
            const code = args.slice(2).join(' ').replace(/^["']|["']$/g, '');
            try {
              const mockResult = eval(code.replace('print', ''));
              output = mockResult !== undefined ? String(mockResult) : 'Executed successfully.';
            } catch (e: any) {
              output = `Python Error: ${e.message}\n(Note: This is a simulated environment running JS under the hood for preview purposes)`;
              isError = true;
            }
          } else {
            output = "Python 3.10.12 (main, Nov 20 2023, 15:14:05) [GCC 11.4.0] on daytona\nType 'help', 'copyright', 'credits' or 'license' for more information.\n>>> (Interactive mode not supported in preview. Use python -c \"code\")";
          }
          break;

        case 'drive':
          const dCmd = args[1];
          let folderId = localStorage.getItem('drive_folder_id');

          if (dCmd === 'init') {
            try {
              const res = await fetch('/api/drive/init', { method: 'POST' });
              const data = await res.json();
              if (res.ok && data.folderId) {
                localStorage.setItem('drive_folder_id', data.folderId);
                output = `Drive initialized. Zosphere folder ID: ${data.folderId}`;
              } else {
                output = `Drive Error: ${data.error || 'Please login to Google Drive first.'}`;
                isError = true;
              }
            } catch (err: any) {
              output = `Network Error: ${err.message}`;
              isError = true;
            }
            break;
          }

          if (!folderId) {
            output = 'Drive not initialized. Please run "drive init" first.';
            isError = true;
            break;
          }

          if (dCmd === 'ls') {
            try {
              const res = await fetch(`/api/drive/ls?folderId=${folderId}`);
              const data = await res.json();
              if (res.ok) {
                if (data.files && data.files.length > 0) {
                  output = data.files.map((f: any) => `${f.id.padEnd(35)} ${f.name}`).join('\n');
                } else {
                  output = 'No files found in Zosphere folder.';
                }
              } else {
                output = `Drive Error: ${data.error || 'Unknown error'}`;
                isError = true;
              }
            } catch (err: any) {
              output = `Network Error: ${err.message}`;
              isError = true;
            }
          } else if (dCmd === 'push' && args[2]) {
            const fileName = args[2];
            const localFile = localFiles.find(f => f.name === fileName && f.parentId === currentFolderId);
            if (!localFile) {
              output = `File not found: ${fileName}`;
              isError = true;
              break;
            }
            try {
              const res = await fetch('/api/drive/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: localFile.name,
                  content: localFile.content || '',
                  folderId
                })
              });
              const data = await res.json();
              if (res.ok) {
                output = `Successfully pushed ${fileName} to Google Docs.\nFile ID: ${data.file.id}\nLink: ${data.file.webViewLink}`;
              } else {
                output = `Drive Error: ${data.error || 'Unknown error'}`;
                isError = true;
              }
            } catch (err: any) {
              output = `Network Error: ${err.message}`;
              isError = true;
            }
          } else if (dCmd === 'pull' && args[2]) {
            const fileId = args[2];
            try {
              const res = await fetch(`/api/drive/pull?fileId=${fileId}`);
              const data = await res.json();
              if (res.ok) {
                const existingFile = localFiles.find(f => f.name === data.name && f.parentId === currentFolderId);
                if (existingFile) {
                  updateLocalFile(existingFile.id, { content: data.content, updatedAt: Date.now() });
                } else {
                  addLocalFile({
                    id: Date.now().toString(),
                    name: data.name,
                    type: 'text',
                    parentId: currentFolderId,
                    content: data.content,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                  });
                }
                output = `Successfully pulled ${data.name} from Google Drive.`;
              } else {
                output = `Drive Error: ${data.error || 'Unknown error'}`;
                isError = true;
              }
            } catch (err: any) {
              output = `Network Error: ${err.message}`;
              isError = true;
            }
          } else {
            output = `Google Drive Integration\nUsage:\n  drive init         - Initialize Zosphere folder\n  drive ls           - List files in Zosphere folder\n  drive push <file>  - Upload a local file as a Google Doc\n  drive pull <id>    - Download a file from Google Drive`;
          }
          break;

        case 'kaggle':
          const kCmd = args[1];

          const username = localStorage.getItem('kaggle_username');
          const key = localStorage.getItem('kaggle_key');

          if (kCmd === 'kernels' && args[2] === 'list') {
            try {
              const res = await fetch('/api/kaggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  endpoint: '/kernels/list',
                  username,
                  key
                })
              });
              const data = await res.json();
              if (res.ok) {
                if (Array.isArray(data)) {
                  output = data.map((k: any) => `${(k.ref || '').padEnd(50)} ${k.title || ''}`).join('\n');
                  if (!output) output = 'No kernels found.';
                } else {
                  output = JSON.stringify(data, null, 2);
                }
              } else {
                output = `Kaggle API Error: ${data.error || data.message || 'Unknown error'}`;
                isError = true;
              }
            } catch (err: any) {
              output = `Network Error: ${err.message}`;
              isError = true;
            }
          } else if (kCmd === 'kernels' && args[2] === 'status' && args[3]) {
            try {
              const res = await fetch('/api/kaggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  endpoint: `/kernels/status/${args[3]}`,
                  username,
                  key
                })
              });
              const data = await res.json();
              if (res.ok) {
                output = `Kernel: ${args[3]}\nStatus: ${data.status || 'unknown'}`;
              } else {
                output = `Kaggle API Error: ${data.error || data.message || 'Unknown error'}`;
                isError = true;
              }
            } catch (err: any) {
              output = `Network Error: ${err.message}`;
              isError = true;
            }
          } else if (kCmd === 'kernels' && args[2] === 'pull' && args[3]) {
            try {
              const res = await fetch('/api/kaggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  endpoint: `/kernels/pull/${args[3]}`,
                  username,
                  key
                })
              });
              const data = await res.json();
              if (res.ok) {
                const notebookName = args[3].split('/')[1] + '.ipynb';
                addLocalFile({
                  id: Date.now().toString(),
                  name: notebookName,
                  type: 'code',
                  parentId: currentFolderId,
                  content: JSON.stringify(data.blob || data, null, 2),
                  createdAt: Date.now(),
                  updatedAt: Date.now()
                });
                output = `Successfully pulled kernel to ${notebookName}`;
              } else {
                output = `Kaggle API Error: ${data.error || data.message || 'Unknown error'}`;
                isError = true;
              }
            } catch (err: any) {
              output = `Network Error: ${err.message}`;
              isError = true;
            }
          } else {
            output = `Kaggle API 1.5.16\nUsage: kaggle <command>\n\nCommands:\n  kernels list\n  kernels status <ref>\n  kernels pull <ref>`;
          }
          break;

        default:
          output = `bash: ${command}: command not found`;
          isError = true;
      }
    } catch (err: any) {
      output = `Error: ${err.message}`;
      isError = true;
    }

    setHistory(prev => {
      const newHistory = [...prev];
      newHistory[newHistory.length - 1] = { command: cmd, output, isError };
      return newHistory;
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0a0a]/90 backdrop-blur-2xl text-gray-300 font-mono text-sm rounded-none overflow-hidden border border-white/10 shadow-2xl" dir="ltr" onClick={() => activeTab === 'cli' && inputRef.current?.focus()}>
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/50">
            <TerminalIcon size={16} />
            <span className="text-xs font-sans font-medium">Zosphere Terminal</span>
          </div>
          
          <div className="flex items-center bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('cli')}
              className={`px-3 py-1 text-xs font-sans rounded-md transition-colors ${activeTab === 'cli' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              CLI
            </button>
            <button
              onClick={() => setActiveTab('daytona')}
              className={`px-3 py-1 text-xs font-sans rounded-md transition-colors flex items-center gap-1 ${activeTab === 'daytona' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              <Cpu size={12} />
              Daytona Sandbox
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
      </div>

      {/* Terminal Content */}
      <div className={`flex-1 overflow-auto p-4 space-y-2 ${activeTab === 'cli' ? 'block' : 'hidden'}`}>
        {history.map((entry, i) => (
          <div key={i} className="space-y-1">
            {entry.command && (
              <div className="flex items-center gap-2 text-blue-400">
                <span className="text-green-400">zosphere@studio</span>
                <span className="text-white">:</span>
                <span className="text-blue-400">{getPathString()}</span>
                <span className="text-white">$</span>
                <span className="text-white ml-1">{entry.command}</span>
              </div>
            )}
            {entry.output && (
              <div className={`whitespace-pre-wrap ${entry.isError ? 'text-red-400' : 'text-gray-300'}`}>
                {entry.output}
              </div>
            )}
          </div>
        ))}
        
        {/* Current Input Line */}
        <form onSubmit={handleCommand} className="flex items-center gap-2 text-blue-400 mt-2">
          <span className="text-green-400">zosphere@studio</span>
          <span className="text-white">:</span>
          <span className="text-blue-400">{getPathString()}</span>
          <span className="text-white">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white ml-1 font-mono"
            spellCheck={false}
            autoComplete="off"
            autoFocus
          />
        </form>
        <div ref={bottomRef} />
      </div>
      
      <div className={`flex-1 w-full h-full ${activeTab === 'daytona' ? 'block' : 'hidden'}`}>
        <DaytonaSandbox isActive={activeTab === 'daytona'} />
      </div>
    </div>
  );
}
