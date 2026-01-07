import React from 'react';
import { X, FileCode } from 'lucide-react';

export default function EditorTabs({ openFiles, activeFileId, onSelect }) {
  return (
    <div className="flex bg-[#0B0E14] border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
      {openFiles.map((file) => (
        <div
          key={file.id}
          onClick={() => onSelect(file.id)}
          className={`flex items-center gap-2 px-4 py-2.5 border-r border-white/5 cursor-pointer min-w-[140px] transition-all relative group ${
            activeFileId === file.id ? "bg-[#161B22] text-gray-100" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <FileCode size={14} className={activeFileId === file.id ? "text-cyan-400" : "opacity-50"} />
          <span className="text-[12px] font-medium truncate">{file.name}</span>
          <X size={12} className="ml-auto opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-sm p-0.5" />
          {activeFileId === file.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400" />}
        </div>
      ))}
    </div>
  );
}