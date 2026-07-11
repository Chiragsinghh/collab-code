import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import Project from "../models/Project.js";
import ChatMessage from "../models/ProjectChatMessage.js"; // Updated to new model

// In-memory store: roomId -> { 
//    users: Map<socketId, { userId, username, lastSeen }>, 
//    files: Map<fileId, { content: string, version: number, lastModified: number }>,
//    dirty: boolean
// }
const rooms = new Map();

// Save interval (5 seconds)
const AUTOSAVE_INTERVAL = 5000;

export const socketHandler = (io) => {
  // Middleware for Socket Auth (if not using handshake auth)
  // For this architecture, we use an event-based auth 'auth:socket' as requested

  io.on("connection", (socket) => {
    let currentRoomId = null;
    let currentUser = null;
    let terminalCwd = null;
    let activeTerminalProcess = null;

    // Helper to get or initialize project path
    const getProjectPath = (roomId) => {
      const PREVIEW_ROOT = path.join(process.cwd(), 'previews');
      const projectPath = path.join(PREVIEW_ROOT, roomId);
      if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
      }
      return projectPath;
    };

    console.log(`🔌 Client connected: ${socket.id}`);

    // 🔐 AUTH & JOIN
    socket.on("auth:socket", async ({ token, projectId }) => {
      try {
        if (!token) throw new Error("No token provided");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Fetch user details? For now, we trust the token payload or fetch from DB if needed
        // Assuming we have username in token or passed in payload? 
        // The prompt says payload: token, projectId. 
        // We'll need to fetch user or expect username in join_room (which is separate in prompt).
        // Let's stick to the prompt flow: 
        // 1. auth:socket -> verify
        // 2. join_room -> actually join

        socket.emit("auth:success", { userId });
      } catch (err) {
        socket.emit("auth:failed", { message: "Invalid token" });
        socket.disconnect();
      }
    });

    // 🟢 JOIN ROOM
    socket.on("join-room", async ({ roomId, username, userId, email, name, bio, socialLinks }) => {
      if (!roomId) return;

      // Initialize room if not exists
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          users: new Map(),
          files: new Map(),
          dirty: false,
          lastSave: Date.now()
        });

        // Load project from DB to populate initial file state
        try {
          const project = await Project.findOne({ roomId });
          if (project && project.tree) {
            // lazy load or populate
          }
        } catch (e) { console.error("Error loading project:", e); }
      }

      const room = rooms.get(roomId);
      const userMeta = {
        userId,
        username,
        email: email || "",
        name: name || "",
        bio: bio || "",
        socialLinks: socialLinks || {},
        lastSeen: Date.now()
      };
      room.users.set(socket.id, userMeta);

      currentRoomId = roomId;
      currentUser = userMeta;

      socket.join(roomId);
      console.log(`👤 ${username} joined ${roomId}`);

      // Broadcast to others
      socket.to(roomId).emit("user-joined", {
        userId,
        username,
        email: email || "",
        name: name || "",
        bio: bio || "",
        socialLinks: socialLinks || {},
        socketId: socket.id
      });

      // Send active users
      const activeUsers = Array.from(room.users.values());
      socket.emit("room-state", { users: activeUsers });
    });

    // ✏️ CODE PATCH (Optimistic Locking / Versioning)
    socket.on("code_patch", ({ roomId, fileId, baseVersion, patch, content, cursor }) => {
      // Allow roomId from payload for robustness, fallback to currentRoomId
      const targetRoomId = roomId || currentRoomId;

      console.log(`📝 Received code_patch for ${fileId} in room ${targetRoomId}`);

      if (!targetRoomId) {
        console.error("❌ code_patch failed: No Room ID identified.");
        return;
      }

      const room = rooms.get(targetRoomId);
      if (!room) {
        console.error(`❌ code_patch failed: Room ${targetRoomId} not found in memory.`);
        return;
      }

      // Get file state
      let file = room.files.get(fileId);
      if (!file) {
        // First time seeing this file in memory, initialize
        console.log(`✨ Initializing file ${fileId} in memory.`);
        file = { content: content || "", version: 0, lastModified: Date.now() };
        room.files.set(fileId, file);
      }

      // ⚔️ CONFLICT CHECK
      if (baseVersion !== file.version) {
        console.warn(`⚠️ Conflict: Client base ${baseVersion} != Server ${file.version}`);
        socket.emit("conflict_detected", {
          fileId,
          serverVersion: file.version,
          reason: "Version mismatch. Please resync."
        });
        return;
      }

      // ✅ ACCEPT PATCH
      file.content = content;
      file.version++;
      file.lastModified = Date.now();

      room.dirty = true; // Mark for autosave

      // Broadcast
      socket.to(targetRoomId).emit("code_patch_applied", {
        fileId,
        newVersion: file.version,
        patch,
        content,
        authorId: currentUser?.userId
      });

      // Ack to sender
      socket.emit("patch_ack", { fileId, version: file.version });
      console.log(`✅ Patch applied. File ${fileId} v${file.version}`);
    });

    // 🔄 RESYNC REQUEST
    socket.on("file_resync_request", ({ fileId }) => {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      const file = room?.files.get(fileId);

      if (file) {
        socket.emit("file_resync_response", {
          fileId,
          fullContent: file.content,
          version: file.version
        });
      }
    });

    // 🌳 TREE PATCH (File/Folder operations)
    socket.on("tree-update", async ({ roomId, tree }) => {
      // This is a "whole tree" replacement event from the frontend
      // checking auth/room
      socket.to(roomId).emit("tree-update", tree);

      // We mark room dirty and update internal 'latest tree'
      // But effectively for this MVP architecture, we accept the tree.
      // ideally we'd have versioned tree too.

      // Persist to DB immediately or throttle?
      // Prompt said "autosave_tick".
      // We'll store the tree in the room state for autosave.
      const room = rooms.get(roomId);
      if (room) {
        room.pendingTree = tree;
        room.dirty = true;
      }
    });

    // 🟠 PRESENCE
    socket.on("presence_ping", () => {
      if (currentRoomId && rooms.has(currentRoomId)) {
        const room = rooms.get(currentRoomId);
        const user = room.users.get(socket.id);
        if (user) {
          user.lastSeen = Date.now();
        }
      }
    });

    socket.on("cursor-update", (data) => {
      if (currentRoomId) {
        socket.to(currentRoomId).emit("cursor-update", { ...data, userId: currentUser?.userId });
      }
    });

    // 💬 CHAT
    socket.on("chat-message", async (msg) => {
      // msg: { message, mentions }
      if (!currentRoomId) return;

      const chatEntry = {
        projectId: null, // fill if available
        roomId: currentRoomId,
        userId: currentUser?.userId,
        username: currentUser?.username,
        message: msg.message,
        mentions: msg.mentions || [],
        type: "text"
      };

      // Broadcast
      io.to(currentRoomId).emit("chat-message", chatEntry);

      // Save Async
      try {
        await ChatMessage.create(chatEntry);
      } catch (e) { console.error("Chat save error", e); }
    });

    // 🖥️ TERMINAL SOCK EVENTS
    socket.on("terminal:init", ({ roomId }) => {
      const targetRoomId = roomId || currentRoomId;
      if (!targetRoomId) return;

      const projectPath = getProjectPath(targetRoomId);
      if (!terminalCwd) {
        terminalCwd = projectPath;
      }

      const relativePath = path.relative(projectPath, terminalCwd);
      socket.emit("terminal:ready", { relativePath });
    });

    socket.on("terminal:command", async ({ command, roomId }) => {
      const targetRoomId = roomId || currentRoomId;
      if (!targetRoomId) {
        socket.emit("terminal:output", { output: "\r\n❌ Terminal error: No room context.\r\n" });
        socket.emit("terminal:ready", { relativePath: "" });
        return;
      }

      const projectPath = getProjectPath(targetRoomId);
      if (!terminalCwd) {
        terminalCwd = projectPath;
      }

      const parts = command.trim().split(/\s+/);
      const mainCmd = parts[0];

      if (mainCmd === "cd") {
        const targetPath = parts[1] || "";
        let newCwd;
        if (!targetPath) {
          newCwd = projectPath;
        } else {
          newCwd = path.resolve(terminalCwd, targetPath);
        }

        // Secure: clamp to project root to prevent moving out of the project folder
        if (!newCwd.startsWith(projectPath)) {
          newCwd = projectPath;
        }

        if (fs.existsSync(newCwd) && fs.statSync(newCwd).isDirectory()) {
          terminalCwd = newCwd;
        } else {
          socket.emit("terminal:output", { output: `cd: no such file or directory: ${targetPath}\r\n` });
        }

        const relativePath = path.relative(projectPath, terminalCwd);
        socket.emit("terminal:ready", { relativePath });
        return;
      }

      // Execute general shell commands
      try {
        activeTerminalProcess = spawn(command, {
          cwd: terminalCwd,
          shell: true
        });

        activeTerminalProcess.stdout.on("data", (data) => {
          socket.emit("terminal:output", { output: data.toString().replace(/\r?\n/g, "\r\n") });
        });

        activeTerminalProcess.stderr.on("data", (data) => {
          socket.emit("terminal:output", { output: data.toString().replace(/\r?\n/g, "\r\n") });
        });

        activeTerminalProcess.on("error", (err) => {
          socket.emit("terminal:output", { output: `\r\n❌ Error executing command: ${err.message}\r\n` });
        });

        activeTerminalProcess.on("close", (code) => {
          activeTerminalProcess = null;
          const relativePath = path.relative(projectPath, terminalCwd);
          socket.emit("terminal:ready", { relativePath });
        });
      } catch (err) {
        socket.emit("terminal:output", { output: `\r\n❌ Command failed: ${err.message}\r\n` });
        const relativePath = path.relative(projectPath, terminalCwd);
        socket.emit("terminal:ready", { relativePath });
      }
    });

    socket.on("terminal:kill", () => {
      if (activeTerminalProcess) {
        try {
          activeTerminalProcess.kill("SIGINT");
        } catch (err) {
          console.error("Failed to kill terminal process:", err);
        }
      }
    });

    // ❌ DISCONNECT
    socket.on("disconnect", () => {
      if (activeTerminalProcess) {
        try {
          activeTerminalProcess.kill("SIGINT");
        } catch (e) {}
      }

      if (currentRoomId && rooms.has(currentRoomId)) {
        const room = rooms.get(currentRoomId);
        room.users.delete(socket.id);
        io.to(currentRoomId).emit("user-left", {
          socketId: socket.id,
          username: currentUser?.username,
          userId: currentUser?.userId
        });

        if (room.users.size === 0) {
          // Room empty. Maybe cleanup after timeout?
          // For now we keep it around for autosave to finish.
        }
      }
      console.log(`❌ Disconnected: ${socket.id}`);
    });
  });

  // 💾 AUTOSAVE LOOP
  setInterval(async () => {
    for (const [roomId, room] of rooms.entries()) {
      if (room.dirty) {
        console.log(`💾 Autosaving room ${roomId}...`);

        // Construct update payload
        // If we have pendingTree, save it
        const update = {};
        if (room.pendingTree) {
          update.tree = room.pendingTree;
        }

        // If we have file contents in 'files', we ideally should update the `tree` object's content properties
        // This is the tricky part of separating Tree structure vs File Content map.
        // For this implementation, we assume `tree-update` event kept the tree structure in sync with basic content,
        // or that we rely on the `tree` sent by client.
        // If we strictly used `files` map for content, we'd need to merge it back into the tree.
        // Let's assume the client sends `tree-update` with content included for now to keep DB consistent.

        if (Object.keys(update).length > 0) {
          try {
            await Project.findOneAndUpdate({ roomId }, update);
            room.dirty = false;
            io.to(roomId).emit("autosave_success", { timestamp: Date.now() });
          } catch (e) {
            console.error("Autosave failed", e);
          }
        }
      }
    }
  }, AUTOSAVE_INTERVAL);
};
