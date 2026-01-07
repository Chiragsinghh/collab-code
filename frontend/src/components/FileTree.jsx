import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode, Folder, FolderOpen, Plus, FolderPlus, Trash2, Edit2, FileText } from 'lucide-react';

export default function FileTree({ nodes = [], activeFileId, onSelect, onAdd, onDelete, onRename }) {
  if (nodes.length === 0) {
    return (
      <div className="flex items-start justify-center h-full pt-10 bg-[#252526]">
        <span className="text-[11px] font-bold text-gray-500 tracking-widest uppercase opacity-60">
          No files in project
        </span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#252526] py-2">
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
    <div className="select-none">
      <div 
        className={`flex items-center py-1 pr-2 cursor-pointer group transition-colors ${
          isSelected ? 'bg-[#37373d] text-white' : 'text-[#cccccc] hover:bg-[#2a2d2e]'
        }`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={() => node.type === 'folder' ? setIsOpen(!isOpen) : onSelect(node)}
      >
        <span className="mr-1 opacity-60">
          {node.type === 'folder' ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <div className="w-[14px]" />}
        </span>
        
        <span className="mr-2">
          {node.type === 'folder' ? (
            <Folder size={16} className={isOpen ? 'text-[#dcb67a]' : 'text-[#dcb67a]'} />
          ) : (
            <FileText size={16} className="text-gray-400" />
          )}
        </span>

        <span className="text-[13px] truncate flex-1">{node.name}</span>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.type === 'folder' && (
            <Plus size={14} className="hover:text-white" onClick={(e) => { e.stopPropagation(); onAdd(node.id, 'file'); }} />
          )}
          <Trash2 size={14} className="hover:text-red-400" onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} />
        </div>
      </div>
      
      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} activeFileId={activeFileId} onSelect={onSelect} onAdd={onAdd} onDelete={onDelete} onRename={onRename} />
          ))}
        </div>
      )}
    </div>
  );
}