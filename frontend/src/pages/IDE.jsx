/**
 * EditorPage.jsx — recolored to match the site-wide dark palette
 * ------------------------------------------------------------------
 * IMPORTANT: this is the actual working IDE, not a marketing mockup, so
 * I only touched color/border classes on the chrome you render directly
 * (sidebar, header, buttons, empty state). All socket logic, tree ops,
 * save/run handlers, and refs are byte-for-byte unchanged.
 *
 * <FileTree>, <CodeEditor>, and <TerminalPanel> are separate components
 * I don't have the source for — they likely hardcode their own colors
 * (especially CodeEditor's syntax theme and TerminalPanel's background).
 * Once you've got this rendering, send me those three files and I'll
 * match them to the same palette so the whole editor is consistent.
 */

import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../lib/api";
import { useAuth } from "../Context/AuthContext";

import { Plus, FolderPlus, Play, MonitorPlay, Share2, X } from "lucide-react";

import FileTree from "../components/ide/FileTree";
import CodeEditor from "../components/ide/CodeEditor";
import TerminalPanel from "../components/ide/TerminalPanel";
import UserAvatar from "../components/ide/UserAvatar";

/* ---- Design tokens (same across the app) ---- */
const bg = "#191817";
const surface = "#221F1A";
const text = "#F4F1EA";
const textMuted = "#9B988F";
const line = "rgba(244,241,234,0.10)";
const clay = "#E4895F";
const teal = "#7FB39E";

const detectLanguage = (filename) => {
  const ext = filename.split(".").pop();
  const map = {
    js: "javascript",
    py: "python",
    html: "html",
    css: "css",
    jsx: "javascript",
    ts: "typescript",
    java: "java",
    cpp: "cpp",
  };
  return map[ext] || "plaintext";
};

export default function EditorPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  const [tree, setTree] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const terminalRef = useRef(null);
  const fileContentRef = useRef({});

  const [users, setUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [copied, setCopied] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const fileVersionsRef = useRef({});

  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (!roomId || !user) return;

    const token = localStorage.getItem("codesync_token");

    if (!token) {
      window.location.href = '/login';
      return;
    }

    const newSocket = io("http://localhost:5001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected, authenticating...");
      newSocket.emit("auth:socket", { token, projectId: roomId });
    });

    newSocket.on("auth:success", ({ userId }) => {
      console.log("Socket authenticated!");
      newSocket.emit("join-room", {
        roomId,
        username: user.username,
        userId,
        email: user.email,
        name: user.name || "",
        bio: user.bio || "",
        socialLinks: user.socialLinks || {}
      });
    });

    newSocket.on("auth:failed", () => {
      alert("Real-time authentication failed. Please login again.");
    });

    newSocket.on("room-state", ({ users }) => {
      setUsers(users);
    });

    newSocket.on("user-joined", ({ userId, username, email, name, bio, socialLinks, socketId }) => {
      terminalRef.current?.write(`👤 ${username} joined the room.\n`);
      addNotification(`👤 ${username} joined the project!`, "success");
      setUsers((prev) => {
        if (prev.some((u) => u.userId === userId)) return prev;
        return [...prev, { userId, username, email, name, bio, socialLinks }];
      });
    });

    newSocket.on("user-left", ({ userId, username, socketId }) => {
      terminalRef.current?.write(`👋 ${username} left the room.\n`);
      addNotification(`👋 ${username} left the project.`, "warning");
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      const styleEl = document.getElementById(`monaco-remote-cursor-style-${userId}`);
      if (styleEl) styleEl.remove();
    });

    newSocket.on("cursor-update", (data) => {
      const { userId, fileId, cursor, username } = data;
      setRemoteCursors((prev) => ({
        ...prev,
        [userId]: { fileId, cursor, username }
      }));
    });

    newSocket.on("tree-update", (newTree) => {
      setTree(newTree);
      const populateRefs = (nodes) => {
        nodes.forEach(n => {
          if (n.type === 'file') {
            if (fileVersionsRef.current[n.id] === undefined) {
              fileVersionsRef.current[n.id] = 0;
            }
            if (fileContentRef.current[n.id] === undefined) {
              fileContentRef.current[n.id] = n.content || "";
            }
          }
          if (n.children) populateRefs(n.children);
        });
      };
      populateRefs(newTree);
    });

    newSocket.on("code_patch_applied", ({ fileId, content, newVersion, authorId }) => {
      console.log("⚡ Received code_patch_applied:", { fileId, newVersion, authorId });

      if (authorId === user._id) {
        fileVersionsRef.current[fileId] = newVersion;
        return;
      }

      console.log("📝 Applying external patch to:", fileId);

      fileContentRef.current[fileId] = content;
      fileVersionsRef.current[fileId] = newVersion;

      setActiveFile(prev => {
        if (prev && prev.id === fileId) {
          console.log("🔄 Updating active file content!");
          return { ...prev, content };
        }
        return prev;
      });

      setTree(prev => {
        const update = (nodes) => nodes.map(n =>
          n.id === fileId ? { ...n, content } : (n.children ? { ...n, children: update(n.children) } : n)
        );
        return update(prev);
      });
    });

    newSocket.on("patch_ack", ({ fileId, version }) => {
      console.log("✅ Received patch_ack:", version);
      fileVersionsRef.current[fileId] = version;
    });

    newSocket.on("conflict_detected", ({ fileId, serverVersion }) => {
      terminalRef.current?.write(`⚠️ Sync Conflict in file. Resyncing...\n`);
      newSocket.emit("file_resync_request", { fileId });
    });

    newSocket.on("file_resync_response", ({ fileId, fullContent, version }) => {
      fileContentRef.current[fileId] = fullContent;
      fileVersionsRef.current[fileId] = version;

      setActiveFile(prev => {
        if (prev && prev.id === fileId) {
          return { ...prev, content: fullContent };
        }
        return prev;
      });
      terminalRef.current?.write(`✅ Resynced file.\n`);
    });

    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${roomId}`);
        const projectTree = Array.isArray(data.tree) ? data.tree : [];
        setTree(projectTree);

        const populateRef = (nodes) => {
          nodes.forEach(n => {
            if (n.type === 'file') {
              fileContentRef.current[n.id] = n.content || "";
              fileVersionsRef.current[n.id] = 0;
            }
            if (n.children) populateRef(n.children);
          });
        };
        populateRef(data.tree || []);
      } catch (err) {
        terminalRef.current?.write(`Error loading project: ${err.message}\n`);
      }
    };
    fetchProject();

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, user]);

  const flattenFiles = (nodes, base = "") => {
    let result = [];
    for (let node of nodes) {
      if (node.type === "file") {
        result.push({
          path: base + node.name,
          content: node.content || "",
        });
      }
      if (node.children) {
        result = result.concat(flattenFiles(node.children, base + node.name + "/"));
      }
    }
    return result;
  };

  const handleTreeUpdate = (newTree) => {
    setTree(newTree);
    socket?.emit("tree-update", { roomId, tree: newTree });
  };

  const createNode = (parentId, type) => {
    const newNode = {
      id: crypto.randomUUID(),
      name: type === "folder" ? "New Folder" : "New File",
      type,
      content: type === "file" ? "" : undefined,
      children: type === "folder" ? [] : undefined,
      isNew: true,
    };

    const insert = (nodes) => nodes.map(n =>
      n.id === parentId
        ? { ...n, children: [...(n.children || []), newNode] }
        : (n.children ? { ...n, children: insert(n.children) } : n)
    );

    const newTree = parentId === 'root' ? [...tree, newNode] : insert(tree);
    handleTreeUpdate(newTree);
  };

  const renameNode = (id, newName) => {
    const rename = (nodes) => nodes.map(n =>
      n.id === id
        ? { ...n, name: newName, isNew: false }
        : (n.children ? { ...n, children: rename(n.children) } : n)
    );
    handleTreeUpdate(rename(tree));
  };

  const deleteNode = (id) => {
    const remove = (nodes) =>
      nodes
        .filter((n) => n.id !== id)
        .map((n) => ({
          ...n,
          children: n.children ? remove(n.children) : undefined,
        }));

    const newTree = remove(tree);
    handleTreeUpdate(newTree);

    if (activeFile && activeFile.id === id) {
      setActiveFile(null);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCursorChange = (position) => {
    if (!socket || !activeFile) return;
    socket.emit("cursor-update", {
      fileId: activeFile.id,
      cursor: position,
      username: user.username
    });
  };

  const openFile = (file) => {
    if (file.type !== "file") return;

    const content = fileContentRef.current[file.id] !== undefined
      ? fileContentRef.current[file.id]
      : (file.content || "");

    fileContentRef.current[file.id] = content;

    setActiveFile({ ...file, content });
  };

  const updateContent = (val) => {
    if (!activeFile) return;

    setActiveFile((prev) => ({ ...prev, content: val }));
    fileContentRef.current[activeFile.id] = val;

    const currentVersion = fileVersionsRef.current[activeFile.id] || 0;

    socket?.emit("code_patch", {
      fileId: activeFile.id,
      baseVersion: currentVersion,
      content: val,
      patch: "",
    });
  };

  const saveProject = async () => {
    setIsSaving(true);
    try {
      const mergeContent = (nodes) => nodes.map(n => {
        if (n.type === 'file') {
          return { ...n, content: fileContentRef.current[n.id] || n.content || "" };
        }
        if (n.children) {
          return { ...n, children: mergeContent(n.children) };
        }
        return n;
      });

      const latestTree = mergeContent(tree);
      setTree(latestTree);

      socket?.emit("tree-update", { roomId, tree: latestTree });
      await api.put(`/projects/${roomId}/tree`, { tree: latestTree });

      terminalRef.current?.write("Saved successfully.\n");
    } catch (e) {
      terminalRef.current?.write("Save failed.\n");
    }
    setIsSaving(false);
  };

  const runCode = async () => {
    if (!activeFile) return;
    terminalRef.current?.write(`\n🚀 Potential language: ${detectLanguage(activeFile.name)}...\n`);

    try {
      const { data } = await api.post("/run", {
        language: detectLanguage(activeFile.name),
        code: activeFile.content
      });
      terminalRef.current?.write(data.output + "\n");
    } catch (err) {
      terminalRef.current?.write(`\n❌ Execution Error: ${err.response?.data?.output || err.message}\n`);
    }
  };

  const runWebsite = async () => {
    terminalRef.current?.write("\n🚀 Starting Full Website...\n");
    const files = flattenFiles(tree);

    try {
      const { data } = await api.post("/preview/fullstack", {
        roomId,
        files,
      });

      terminalRef.current?.write("\n" + (data.output || "Server Started") + "\n");

      if (data.url) {
        setPreviewUrl(data.url);
      }
    } catch (err) {
      terminalRef.current?.write("\n❌ Preview Server Error: " + (err.response?.data?.message || err.message) + "\n");
    }
  };

  return (
    <div className="h-screen flex" style={{ background: bg, color: text, fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col" style={{ borderRight: `1px solid ${line}`, background: surface }}>
        <div className="h-12 flex justify-between items-center px-3" style={{ borderBottom: `1px solid ${line}` }}>
          <span className="text-[13px] font-medium" style={{ color: textMuted }}>Explorer</span>
          <div className="flex gap-2.5" style={{ color: textMuted }}>
            <button onClick={() => createNode("root", "file")} title="New File" className="hover:opacity-70 transition-opacity">
              <Plus size={16} />
            </button>
            <button onClick={() => createNode("root", "folder")} title="New Folder" className="hover:opacity-70 transition-opacity">
              <FolderPlus size={16} />
            </button>
          </div>
        </div>
        <FileTree
          nodes={tree}
          onSelect={openFile}
          onRename={renameNode}
          onCreate={createNode}
          onDelete={deleteNode}
        />
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-12 flex justify-between items-center px-4" style={{ borderBottom: `1px solid ${line}`, background: surface }}>
          <Link to="/dashboard" className="flex gap-2 items-center">
            <span
              className="w-6 h-6 rounded-[5px] flex items-center justify-center text-[11px]"
              style={{ background: clay, color: bg, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {"</>"}
            </span>
            <span className="text-[14px]" style={{ fontFamily: "'Fraunces', serif", fontWeight: 560 }}>CodeSync</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Active Users Avatar Stack */}
            {users.length > 0 && (
              <div className="flex -space-x-1.5 mr-2">
                {users.map((u) => (
                  <div
                    key={u.userId || u.socketId}
                    title={u.username}
                    onClick={() => setSelectedProfile(u)}
                    className="relative cursor-pointer group"
                  >
                    <UserAvatar
                      name={u.username}
                      className="w-7 h-7 text-[10px] border border-[#191817] shadow-sm hover:scale-110 transition-transform"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-[#191817] rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {/* Share Link Button */}
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-1.5 rounded-lg flex gap-1.5 items-center text-[13px] transition-colors hover:bg-white/5"
              style={{ border: `1px solid ${line}`, color: text }}
            >
              {copied ? (
                <span style={{ color: teal }}>Copied!</span>
              ) : (
                <>
                  <Share2 size={14} style={{ color: textMuted }} /> Share Link
                </>
              )}
            </button>

            <button
              onClick={saveProject}
              className="text-[13px] transition-colors"
              style={{ color: textMuted }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={runCode}
              className="px-3 py-1.5 rounded-lg flex gap-1.5 items-center text-[13px] transition-transform hover:-translate-y-0.5"
              style={{ background: clay, color: bg }}
            >
              <Play size={14} /> Run
            </button>

            <button
              onClick={runWebsite}
              className="px-3 py-1.5 rounded-lg flex gap-1.5 items-center text-[13px] transition-colors"
              style={{ border: `1px solid ${line}`, color: teal }}
            >
              <MonitorPlay size={14} /> Preview app
            </button>
          </div>
        </header>

        {/* Editor */}
        <div className="flex-1 overflow-hidden relative">
          {activeFile ? (
            <CodeEditor
              activeFile={activeFile}
              onChange={updateContent}
              language={detectLanguage(activeFile.name)}
              remoteCursors={remoteCursors}
              onCursorChange={handleCursorChange}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[14px]" style={{ color: textMuted }}>
              Select a file to start coding...
            </div>
          )}
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="h-1/3 relative" style={{ borderTop: `1px solid ${line}`, background: "#fff" }}>
            <div
              className="absolute top-0 right-0 px-2 py-1 text-[11px] cursor-pointer"
              style={{ background: surface, color: textMuted }}
              onClick={() => setPreviewUrl("")}
            >
              Close
            </div>
            <iframe
              src={previewUrl}
              title="Website Preview"
              className="w-full h-full"
            />
          </div>
        )}

        {/* Terminal */}
        <TerminalPanel ref={terminalRef} />
      </main>

      {/* PROFILE MODAL */}
      {selectedProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(10,9,8,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 relative overflow-hidden text-center"
            style={{
              background: "rgba(34,31,26,0.92)",
              border: `1px solid ${line}`,
              boxShadow: "0 30px 80px -30px rgba(0,0,0,0.8)",
              backdropFilter: "blur(12px)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-4 right-4 hover:opacity-75 transition-opacity"
              style={{ color: textMuted }}
            >
              <X size={18} />
            </button>

            {/* Glowing Active Ring around Avatar */}
            <div className="flex justify-center mt-4 mb-4 relative">
              <div className="relative">
                <UserAvatar
                  name={selectedProfile.username}
                  className="w-16 h-16 text-xl border-2 border-green-500 shadow-lg"
                />
                <span
                  className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border border-[#221F1A] rounded-full animate-ping"
                  style={{ animationDuration: "2s" }}
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border border-[#221F1A] rounded-full" />
              </div>
            </div>

            <h3 className="text-lg font-semibold" style={{ color: text }}>
              {selectedProfile.name || selectedProfile.username}
            </h3>
            <p className="text-sm mb-4" style={{ color: textMuted }}>
              @{selectedProfile.username}
            </p>

            <div className="text-left space-y-3 mt-6 border-t pt-4" style={{ borderColor: line }}>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: textMuted }}>Email</span>
                <span className="font-mono text-[13px]" style={{ color: text }}>
                  {selectedProfile.email || "No email shared"}
                </span>
              </div>
              <div className="flex justify-between items-start text-xs gap-4">
                <span className="shrink-0" style={{ color: textMuted }}>Bio</span>
                <span className="text-[13px] text-right" style={{ color: text }}>
                  {selectedProfile.bio || "No bio available."}
                </span>
              </div>
              {selectedProfile.socialLinks && (
                <div className="flex justify-between items-center text-xs">
                  <span style={{ color: textMuted }}>GitHub</span>
                  {selectedProfile.socialLinks.github ? (
                    <a
                      href={selectedProfile.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: clay }}
                    >
                      View profile
                    </a>
                  ) : (
                    <span style={{ color: textMuted }}>Not linked</span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setSelectedProfile(null)}
                className="px-4 py-1.5 rounded-lg text-sm transition-all active:scale-95 hover:brightness-110"
                style={{ background: line, color: text }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="px-4 py-3 rounded-lg flex items-center gap-2.5 shadow-lg border text-sm pointer-events-auto animate-slide-in"
            style={{
              background: surface,
              borderColor: n.type === "success" ? "rgba(127,179,158,0.3)" : "rgba(228,137,95,0.3)",
              color: text
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: n.type === "success" ? teal : clay,
                boxShadow: `0 0 8px ${n.type === "success" ? teal : clay}`
              }}
            />
            <span>{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}