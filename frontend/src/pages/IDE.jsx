import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Code2,
  Play, 
  Settings, 
  Plus, 
  FolderPlus, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen 
} from 'lucide-react';

import FileTree from '../lib/utilis/FileTree';
import EditorTabs from '../components/ide/EditorTabs';
import CodeEditor from '../components/ide/CodeEditor';
import SidebarChat from '../components/ide/SidebarChat';

export default function EditorPage() {
  const location = useLocation();
  const [projectName, setProjectName] = useState("New Project");
  
  // Persistence: Load tree from localStorage on initialization
  const [tree, setTree] = useState(() => {
    const saved = localStorage.getItem('codesync_tree');
    return saved ? JSON.parse(saved) : [];
  }); 
  
  const [activeFile, setActiveFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // UI States
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [chatWidth, setChatWidth] = useState(320);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isChatVisible, setIsChatVisible] = useState(true);
  
  const isResizingSidebar = useRef(false);
  const isResizingChat = useRef(false);

  // Persistence: Save tree to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('codesync_tree', JSON.stringify(tree));
  }, [tree]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get('name');
    if (name) setProjectName(name);

    const handleMouseMove = (e) => {
      if (isResizingSidebar.current) {
        const newWidth = e.clientX;
        if (newWidth > 150 && newWidth < 450) setSidebarWidth(newWidth);
      }
      if (isResizingChat.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 200 && newWidth < 500) setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingChat.current = false;
      document.body.style.cursor = 'default';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [location]);

  // --- LOGIC FUNCTIONS ---
  const handleAdd = (parentId, type) => {
    const name = prompt(`Enter ${type} name:`);
    if (!name) return;
    const newNode = { 
      id: crypto.randomUUID(), 
      name, 
      type, 
      content: type === 'file' ? '' : undefined, 
      children: type === 'folder' ? [] : undefined 
    };
    if (!parentId) {
      setTree([...tree, newNode]);
    } else {
      const addToNode = (nodes) => nodes.map(node => {
        if (node.id === parentId) return { ...node, children: [...(node.children || []), newNode] };
        if (node.children) return { ...node, children: addToNode(node.children) };
        return node;
      });
      setTree(addToNode(tree));
    }
  };

  const handleDelete = (id) => {
    const removeFromTree = (nodes) => nodes
      .filter(node => node.id !== id)
      .map(node => ({ ...node, children: node.children ? removeFromTree(node.children) : undefined }));
    setTree(removeFromTree(tree));
    setOpenFiles(prev => prev.filter(f => f.id !== id));
    if (activeFile?.id === id) setActiveFile(null);
  };

  const handleRename = (id) => {
    const newName = prompt("Enter new name:");
    if (!newName) return;
    const renameInTree = (nodes) => nodes.map(node => {
      if (node.id === id) return { ...node, name: newName };
      if (node.children) return { ...node, children: renameInTree(node.children) };
      return node;
    });
    setTree(renameInTree(tree));
  };

  const handleOpenFile = (file) => {
    if (file.type === 'folder') return;
    if (!openFiles.find(f => f.id === file.id)) setOpenFiles([...openFiles, file]);
    setActiveFile(file);
  };

  const handleContentChange = (newContent) => {
    if (!activeFile) return;
    const updatedFile = { ...activeFile, content: newContent };
    setActiveFile(updatedFile);
    setOpenFiles(prev => prev.map(f => f.id === updatedFile.id ? updatedFile : f));
    const updateTreeContent = (nodes) => nodes.map(node => {
      if (node.id === updatedFile.id) return updatedFile;
      if (node.children) return { ...node, children: updateTreeContent(node.children) };
      return node;
    });
    setTree(updateTreeContent(tree));
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#0B0E14] text-gray-400 overflow-hidden select-none font-sans">
      
      {/* HEADER */}
      <header className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0B0E14] shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="hover:text-cyan-400 transition-colors">
            {isSidebarVisible ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-semibold text-lg text-white">CodeSync</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="bg-[#00E5FF] hover:bg-cyan-400 text-black px-4 py-1.5 rounded-md text-[13px] font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.15)] transition-all active:scale-95">
            <Play size={14} fill="black" /> Preview
          </button>
          <button onClick={() => setIsChatVisible(!isChatVisible)} className="hover:text-cyan-400 transition-colors">
            {isChatVisible ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
          <Settings size={18} className="hover:text-white cursor-pointer opacity-60" />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* LEFT SIDEBAR (Matte Grey Theme) */}
        <aside 
          style={{ width: isSidebarVisible ? sidebarWidth : 0 }} 
          className={`flex flex-col shrink-0 bg-[#252526] border-r border-black/40 transition-all duration-300 ease-in-out ${!isSidebarVisible ? 'opacity-0 invisible' : 'opacity-100'}`}
        >
          <div className="h-10 flex items-center justify-between px-4 border-b border-white/5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Files</span>
            <div className="flex gap-2">
                <Plus size={16} className="text-gray-400 hover:text-white cursor-pointer" onClick={() => handleAdd(null, 'file')} />
                <FolderPlus size={16} className="text-gray-400 hover:text-white cursor-pointer" onClick={() => handleAdd(null, 'folder')} />
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <FileTree 
              nodes={tree} 
              activeFileId={activeFile?.id} 
              onSelect={handleOpenFile} 
              onAdd={handleAdd} 
              onDelete={handleDelete} 
              onRename={handleRename} 
            />
          </div>
        </aside>

        {isSidebarVisible && (
          <div 
            onMouseDown={() => { isResizingSidebar.current = true; document.body.style.cursor = 'col-resize'; }} 
            className="w-[2px] hover:w-1 hover:bg-cyan-500/50 transition-all bg-transparent cursor-col-resize shrink-0 z-20" 
          />
        )}

        {/* CENTER: EDITOR (Midnight Theme) */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#0B0E14] relative">
          <EditorTabs openFiles={openFiles} activeFileId={activeFile?.id} onSelect={setActiveFile} />
          {activeFile && (
            <div className="h-8 flex items-center px-4 bg-[#1e1e1e] border-b border-white/5 text-[11px] text-gray-500 gap-2 font-medium">
               <span className="opacity-50">src</span> 
               <ChevronRight size={10} className="opacity-30" /> 
               <span className="text-gray-300">{activeFile.name}</span>
            </div>
          )}
          <div className="flex-1 relative w-full h-full bg-[#0B0E14]">
            {activeFile ? (
              <CodeEditor activeFile={activeFile} onChange={handleContentChange} onCursorChange={setCursorPos} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                <Plus size={64} className="mb-4 text-cyan-500" />
                <p className="text-lg font-bold tracking-tighter text-white uppercase">Ready to Code</p>
              </div>
            )}
          </div>
        </main>

        {isChatVisible && (
          <div 
            onMouseDown={() => { isResizingChat.current = true; document.body.style.cursor = 'col-resize'; }} 
            className="w-[2px] hover:w-1 hover:bg-cyan-500/50 transition-all bg-transparent cursor-col-resize shrink-0 z-20" 
          />
        )}

        {/* RIGHT SIDEBAR */}
        <aside 
          style={{ width: isChatVisible ? chatWidth : 0 }} 
          className={`shrink-0 bg-[#0B0E14] border-l border-white/5 transition-all duration-300 ease-in-out ${!isChatVisible ? 'opacity-0 invisible' : 'opacity-100'}`}
        >
          <div className="h-full w-full overflow-hidden">
            <SidebarChat />
          </div>
        </aside>
      </div>

      {/* FOOTER */}
      <footer className="h-7 border-t border-white/5 flex items-center justify-between px-4 text-[11px] text-gray-500 bg-[#0B0E14] shrink-0 font-medium z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
            <span className="text-cyan-500 font-bold">{"{ }"}</span>
            <span>JavaScript React</span>
          </div>
          <span className="opacity-50">UTF-8</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px]">
          <span className="bg-white/5 px-2 py-0.5 rounded text-gray-400">Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <div className="flex items-center gap-3 font-sans">
            <span className="hover:text-green-400 cursor-pointer transition-colors">Prettier</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">ESLint</span>
          </div>
        </div>
      </footer>
    </div>
  );
}