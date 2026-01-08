import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Code2, Play, Settings, Plus, FolderPlus, Share2,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, ChevronRight, Check, Copy
} from 'lucide-react';

import FileTree from '../lib/utilis/FileTree';
import EditorTabs from '../components/ide/EditorTabs';
import CodeEditor from '../components/ide/CodeEditor';
import SidebarChat from '../components/ide/SidebarChat';

const socket = io('http://localhost:5001');

export default function EditorPage() {
  const { roomId } = useParams();
  const [tree, setTree] = useState([]); 
  const [activeFile, setActiveFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [syncStatus, setSyncStatus] = useState("Connected");
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [copied, setCopied] = useState(false);

  // UI States
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(true);
  
  // Ref to track the user object from localStorage
  const user = JSON.parse(localStorage.getItem('codesync_user'));

  useEffect(() => {
    if (roomId) {
      socket.emit('join-room', { 
        roomId, 
        username: user?.username || 'Guest',
        userId: user?.id || null 
      });
    }

    socket.on('init-state', ({ tree }) => {
      setTree(tree);
    });

    socket.on('tree-synced', (newTree) => {
      setTree(newTree);
    });

    socket.on('code-synced', ({ fileId, newContent }) => {
      setTree(prevTree => {
        const updateContent = (nodes) => nodes.map(node => {
          if (node.id === fileId) {
            const updated = { ...node, content: newContent };
            // Update active file only if it's the one being edited
            if (activeFile?.id === fileId) setActiveFile(updated);
            return updated;
          }
          if (node.children) return { ...node, children: updateContent(node.children) };
          return node;
        });
        return updateContent(prevTree);
      });
    });

    return () => {
      socket.off('init-state');
      socket.off('tree-synced');
      socket.off('code-synced');
    };
  }, [roomId, activeFile?.id]);

  // --- AUTO-SAVE DEBOUNCE LOGIC ---
  useEffect(() => {
    if (!activeFile || activeFile.type === 'folder') return;

    setSyncStatus("Typing...");
    
    const delayDebounceFn = setTimeout(() => {
      socket.emit('code-change', { 
        roomId, 
        fileId: activeFile.id, 
        newContent: activeFile.content 
      });
      setSyncStatus("Cloud Saved");
    }, 1000); // Wait 1 second after last keystroke to save to DB

    return () => clearTimeout(delayDebounceFn);
  }, [activeFile?.content, roomId]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAdd = (parentId, type) => {
    const name = prompt(`Enter ${type} name:`);
    if (!name) return;
    const newNode = { 
      id: crypto.randomUUID(), 
      name, type, 
      content: type === 'file' ? '' : undefined, 
      children: type === 'folder' ? [] : undefined 
    };

    let newTree;
    if (!parentId) {
      newTree = [...tree, newNode];
    } else {
      const addToNode = (nodes) => nodes.map(node => {
        if (node.id === parentId) return { ...node, children: [...(node.children || []), newNode] };
        if (node.children) return { ...node, children: addToNode(node.children) };
        return node;
      });
      newTree = addToNode(tree);
    }
    setTree(newTree);
    socket.emit('update-tree', { roomId, newTree });
  };

  const handleOpenFile = (file) => {
    if (file.type === 'folder') return;
    if (!openFiles.find(f => f.id === file.id)) setOpenFiles([...openFiles, file]);
    setActiveFile(file);
  };

  const handleContentChange = (newContent) => {
    if (!activeFile) return;
    
    // 1. Update Active File immediately for smooth typing
    const updatedFile = { ...activeFile, content: newContent };
    setActiveFile(updatedFile);

    // 2. Update Tree state so tabs and other components stay in sync
    setTree(prevTree => {
      const updateTreeContent = (nodes) => nodes.map(node => {
        if (node.id === updatedFile.id) return updatedFile;
        if (node.children) return { ...node, children: updateTreeContent(node.children) };
        return node;
      });
      return updateTreeContent(prevTree);
    });
    
    // Note: socket.emit is now handled by the useEffect debounce above
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0B0E14] text-gray-400 overflow-hidden font-sans">
      <header className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0B0E14] z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
            {isSidebarVisible ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          
          {/* THE TOP LEFT BUTTON: Ensure it uses Link */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-semibold text-white tracking-tight">CodeSync</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={copyRoomId} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-[12px]">
            {copied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} />}
            {copied ? "Link Copied" : "Invite"}
          </button>
          <button onClick={() => setIsChatVisible(!isChatVisible)}>
            {isChatVisible ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        {isSidebarVisible && (
          <aside className="w-64 flex flex-col bg-[#0B0E14] border-r border-white/5">
            <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 bg-white/[0.02]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Explorer</span>
              <div className="flex gap-2">
                  <Plus size={14} className="cursor-pointer hover:text-white opacity-60" onClick={() => handleAdd(null, 'file')} />
                  <FolderPlus size={14} className="cursor-pointer hover:text-white opacity-60" onClick={() => handleAdd(null, 'folder')} />
              </div>
            </div>
            <FileTree nodes={tree} activeFileId={activeFile?.id} onSelect={handleOpenFile} onAdd={handleAdd} />
          </aside>
        )}

        <main className="flex-1 flex flex-col min-w-0 bg-[#0B0E14]">
          <EditorTabs openFiles={openFiles} activeFileId={activeFile?.id} onSelect={setActiveFile} />
          <div className="flex-1 relative">
            {activeFile ? (
              <CodeEditor activeFile={activeFile} onChange={handleContentChange} onCursorChange={setCursorPos} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                <Code2 size={48} className="mb-4 text-cyan-500" />
                <p className="text-sm font-medium text-white tracking-widest uppercase">Open a file to start collaborating</p>
              </div>
            )}
          </div>
        </main>

        {isChatVisible && (
          <aside className="w-80 bg-[#0B0E14] border-l border-white/5">
            <SidebarChat />
          </aside>
        )}
      </div>

      <footer className="h-7 border-t border-white/5 flex items-center justify-between px-4 text-[10px] bg-[#0B0E14] text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${syncStatus === 'Cloud Saved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span>{syncStatus}</span>
          </div>
          <span className="opacity-30">|</span>
          <span className="font-mono uppercase">Room: {roomId?.slice(0, 8)}...</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span>UTF-8</span>
          <span className="bg-white/5 px-2 py-0.5 rounded text-gray-400">Ln {cursorPos.line}, Col {cursorPos.col}</span>
        </div>
      </footer>
    </div>
  );
}