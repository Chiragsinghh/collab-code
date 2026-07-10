import React, { useState } from "react";
import {
  File,
  Folder,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function FileTree({
  nodes = [],
  onSelect,
  onRename,
  onCreate,
  onDelete,
}) {
  return (
    <div className="p-2 text-sm">
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

  /* ✅ Rename complete on Enter */
  const finishRename = () => {
    if (!inputValue.trim()) return;
    onRename(node.id, inputValue.trim());
  };

  /* ✅ Right Click Menu */
  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenu({ x: e.pageX, y: e.pageY });
  };

  const closeMenu = () => setMenu(null);

  return (
    <div className="ml-3">
      {/* ROW */}
      <div
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 cursor-pointer relative"
        onClick={() => {
          if (node.type === "folder") setExpanded(!expanded);
          if (!node.isNew && node.type === "file") onSelect(node);
        }}
        onContextMenu={handleContextMenu}
      >
        {/* Arrow */}
        {node.type === "folder" ? (
          expanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )
        ) : (
          <span className="w-[14px]" />
        )}

        {/* Icon */}
        {node.type === "folder" ? (
          <Folder size={16} className="text-yellow-400" />
        ) : (
          <File size={16} className="text-blue-400" />
        )}

        {/* Inline Rename */}
        {node.isNew ? (
          <input
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={finishRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") finishRename();
            }}
            className="bg-black border border-white/20 px-1 rounded text-white text-sm w-32"
          />
        ) : (
          <span>{node.name}</span>
        )}

        {/* ✅ Right Click Menu */}
        {menu && (
          <>
            {/* Backdrop to close menu */}
            <div className="fixed inset-0 z-40" onClick={closeMenu} />

            <div
              className="fixed bg-[#1a1f2e] border border-white/10 rounded shadow-lg text-xs z-50 min-w-[120px]"
              style={{
                top: Math.min(menu.y, window.innerHeight - 100),
                left: Math.min(menu.x, window.innerWidth - 150),
              }}
            >
              {/* Folder Options */}
              {node.type === "folder" && (
                <>
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                    onClick={() => {
                      onCreate(node.id, "file");
                      closeMenu();
                    }}
                  >
                    <File size={12} /> New File
                  </button>

                  <button
                    className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                    onClick={() => {
                      onCreate(node.id, "folder");
                      closeMenu();
                    }}
                  >
                    <Folder size={12} /> New Folder
                  </button>
                  <div className="h-px bg-white/10 my-1" />
                </>
              )}

              {/* Delete */}
              <button
                className="w-full text-left px-3 py-2 hover:bg-white/10 text-red-400 flex items-center gap-2"
                onClick={() => {
                  if (window.confirm(`Delete ${node.name}?`)) {
                    onDelete(node.id);
                  }
                  closeMenu();
                }}
              >
                🗑 Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* CHILDREN */}
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
