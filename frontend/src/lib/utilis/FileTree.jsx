import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode, Folder, FolderOpen, Plus, FolderPlus, Trash2, Edit2, FileText } from 'lucide-react';

export default function FileTree({ nodes = [], activeFileId, onSelect, onAdd, onDelete, onRename }) {
  // Matches the page background color exactly
  if (nodes.length === 0) {
    return (
      <div className="flex items-start justify-center h-full pt-12 bg-[#0B0E14]">
        <span className="text-[11px] font-bold text-gray-600 tracking-[0.2em] uppercase">
          No files in project
        </span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0B0E14] py-1">
      {nodes.map(node => (
        <TreeNode 
          key={node.id} 
          node={node} 
          depth={0} 
          activeFileId={activeFileId} 
          onSelect={onSelect}
          onAdd={onAdd}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
}

function TreeNode({ node, depth, activeFileId, onSelect, onAdd, onDelete, onRename }) {
  const [isOpen, setIsOpen] = useState(true);
  const isSelected = activeFileId === node.id;

  return (
    <div className="select-none font-sans">
      <div 
        className={`flex items-center py-1.5 pr-2 cursor-pointer group transition-all ${
          /* Changed active and hover colors to blue-ish tints to match CodeSync */
          isSelected ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
        }`}
        style={{ paddingLeft: `${depth * 12 + 16}px` }}
        onClick={() => node.type === 'folder' ? setIsOpen(!isOpen) : onSelect(node)}
      >
        {/* Selection Indicator */}
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-500 shadow-[0_0_10px_rgba(0,229,255,0.3)]" />}
        
        <span className="mr-1.5 opacity-40">
          {node.type === 'folder' ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <div className="w-[14px]" />}
        </span>
        
        <span className="mr-2">
          {node.type === 'folder' ? (
            <Folder size={16} className="text-cyan-500/60" />
          ) : (
            <FileText size={16} className="text-gray-500" />
          )}
        </span>

        <span className={`text-[13px] truncate flex-1 tracking-tight ${isSelected ? 'font-medium' : ''}`}>
          {node.name}
        </span>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500">
          {node.type === 'folder' && (
            <Plus size={14} className="hover:text-cyan-400" onClick={(e) => { e.stopPropagation(); onAdd(node.id, 'file'); }} />
          )}
          <Trash2 size={14} className="hover:text-red-500" onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} />
        </div>
      </div>
      
      {node.type === 'folder' && isOpen && node.children && (
        /* Added a very subtle blue guide line for nesting */
        <div className="border-l border-white/5 ml-[24px]">
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} activeFileId={activeFileId} onSelect={onSelect} onAdd={onAdd} onDelete={onDelete} onRename={onRename} />
          ))}
        </div>
      )}
    </div>
  );
}