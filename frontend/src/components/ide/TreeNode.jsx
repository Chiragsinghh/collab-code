import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Trash2,
  Edit2,
} from "lucide-react";

export default function TreeNode({
  node,
  depth,
  onOpen,
  onRename,
  onDelete,
}) {
  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(node.isNew || false);
  const [name, setName] = useState(node.name);

  const isFolder = node.type === "folder";

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onRename(node.id, name.trim());
    setEditing(false);
  }

  return (
    <div style={{ paddingLeft: depth * 14 }}>
      {/* Node Row */}
      <div className="flex items-center justify-between group px-2 py-1 rounded hover:bg-white/5">
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => {
            if (isFolder) setOpen(!open);
            else onOpen(node);
          }}
        >
          {/* Expand Arrow */}
          {isFolder &&
            (open ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            ))}

          {/* Icon */}
          {isFolder ? (
            <Folder size={15} className="text-yellow-400" />
          ) : (
            <File size={14} className="text-gray-400" />
          )}

          {/* Name or Input */}
          {editing ? (
            <form onSubmit={handleSubmit}>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleSubmit}
                className="bg-black text-white text-sm px-1 rounded w-32"
              />
            </form>
          ) : (
            <span className="text-sm">{node.name}</span>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="hidden group-hover:flex gap-2">
            <Edit2
              size={13}
              className="cursor-pointer hover:text-white"
              onClick={() => setEditing(true)}
            />
            <Trash2
              size={13}
              className="cursor-pointer hover:text-red-400"
              onClick={() => onDelete(node.id)}
            />
          </div>
        )}
      </div>

      {/* Children */}
      {isFolder && open && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onOpen={onOpen}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
