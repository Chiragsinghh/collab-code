import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Trash2,
  Plus,
} from "lucide-react";

export default function FileTree({
  nodes,
  onSelect,
  renameNode,
  deleteNode,
  createInside,
}) {
  return (
    <div className="p-2 text-sm space-y-1">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          onSelect={onSelect}
          renameNode={renameNode}
          deleteNode={deleteNode}
          createInside={createInside}
        />
      ))}
    </div>
  );
}

/* ---------------- SINGLE NODE ---------------- */

function TreeNode({
  node,
  level,
  onSelect,
  renameNode,
  deleteNode,
  createInside,
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(node.isNew || false);
  const [tempName, setTempName] = useState(node.name);

  /* ---------------- HANDLE ENTER SAVE ---------------- */
  const handleSave = () => {
    if (!tempName.trim()) return;

    renameNode(node.id, tempName.trim());
    setEditing(false);
  };

  /* ---------------- FILE CLICK ---------------- */
  const handleClick = () => {
    if (node.type === "folder") {
      setOpen(!open);
    } else {
      if (typeof onSelect === "function") {
        onSelect(node);
      }
    }
  };

  return (
    <div>
      {/* ROW */}
      <div
        className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer group"
        style={{ paddingLeft: `${level * 14 + 8}px` }}
        onClick={handleClick}
      >
        {/* Folder Arrow */}
        {node.type === "folder" && (
          <span className="w-4">
            {open ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </span>
        )}

        {/* ICON */}
        {node.type === "folder" ? (
          open ? (
            <FolderOpen size={16} className="text-cyan-400" />
          ) : (
            <Folder size={16} className="text-cyan-400" />
          )
        ) : (
          <File size={15} className="text-gray-400" />
        )}

        {/* NAME OR INPUT */}
        {editing ? (
          <input
            autoFocus
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
            }}
            className="bg-black text-white text-sm px-1 rounded outline-none border border-white/20 w-full"
          />
        ) : (
          <span className="flex-1 truncate">{node.name}</span>
        )}

        {/* ACTIONS */}
        {!editing && (
          <div className="hidden group-hover:flex gap-2">
            {/* Add inside folder */}
            {node.type === "folder" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  createInside(node.id, "file");
                }}
              >
                <Plus size={14} className="text-gray-400 hover:text-white" />
              </button>
            )}

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(node.id);
              }}
            >
              <Trash2 size={14} className="text-red-400 hover:text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* CHILDREN */}
      {node.type === "folder" && open && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              renameNode={renameNode}
              deleteNode={deleteNode}
              createInside={createInside}
            />
          ))}
        </div>
      )}
    </div>
  );
}
