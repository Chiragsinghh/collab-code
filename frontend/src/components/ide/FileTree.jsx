

import React, { useState } from "react";
import { File, Folder, ChevronDown, ChevronRight, FilePlus, FolderPlus, Trash2 } from "lucide-react";

const surfaceRaised = "#26221C";
const text = "#F4F1EA";
const textMuted = "#9B988F";
const line = "rgba(244,241,234,0.10)";
const clay = "#E4895F";
const teal = "#7FB39E";
const errorColor = "#D9705A";
const inputBg = "#090907ff";

export default function FileTree({ nodes = [], onSelect, onRename, onCreate, onDelete }) {
  return (
    <div className="p-2 text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          onSelect={onSelect}
          onRename={onRename}
          onCreate={onCreate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function TreeNode({ node, onSelect, onRename, onCreate, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [inputValue, setInputValue] = useState(node.name);
  const [menu, setMenu] = useState(null);

  const finishRename = () => {
    if (!inputValue.trim()) return;
    onRename(node.id, inputValue.trim());
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenu({ x: e.pageX, y: e.pageY });
  };

  const closeMenu = () => setMenu(null);

  return (
    <div className="ml-3">
      <div
        className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer relative transition-colors"
        style={{ color: textMuted }}
        onMouseEnter={(e) => (e.currentTarget.style.background = `${line}`)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        onClick={() => {
          if (node.type === "folder") setExpanded(!expanded);
          if (!node.isNew && node.type === "file") onSelect(node);
        }}
        onContextMenu={handleContextMenu}
      >
        {node.type === "folder" ? (
          expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
        ) : (
          <span className="w-[14px]" />
        )}

        {node.type === "folder" ? (
          <Folder size={16} style={{ color: clay }} />
        ) : (
          <File size={16} style={{ color: teal }} />
        )}

        {node.isNew ? (
          <input
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={finishRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") finishRename();
            }}
            className="px-1.5 py-0.5 rounded text-sm w-32 outline-none"
            style={{ background: inputBg, border: `1px solid ${clay}`, color: text }}
          />
        ) : (
          <span style={{ color: text }}>{node.name}</span>
        )}

        {menu && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div
              className="fixed rounded-lg shadow-xl text-xs z-50 min-w-[140px] overflow-hidden py-1"
              style={{ background: surfaceRaised, border: `1px solid ${line}`, top: Math.min(menu.y, window.innerHeight - 100), left: Math.min(menu.x, window.innerWidth - 150) }}
            >
              {node.type === "folder" && (
                <>
                  <button
                    className="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors"
                    style={{ color: text }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = line)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => { onCreate(node.id, "file"); closeMenu(); }}
                  >
                    <FilePlus size={12} /> New file
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors"
                    style={{ color: text }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = line)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => { onCreate(node.id, "folder"); closeMenu(); }}
                  >
                    <FolderPlus size={12} /> New folder
                  </button>
                  <div className="h-px my-1" style={{ background: line }} />
                </>
              )}
              <button
                className="w-full text-left px-3 py-2 flex items-center gap-2 transition-colors"
                style={{ color: errorColor }}
                onMouseEnter={(e) => (e.currentTarget.style.background = line)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                onClick={() => {
                  if (window.confirm(`Delete ${node.name}?`)) onDelete(node.id);
                  closeMenu();
                }}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </>
        )}
      </div>

      {expanded &&
        node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            onSelect={onSelect}
            onRename={onRename}
            onCreate={onCreate}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
}