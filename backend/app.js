import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import { Connectdb } from "./src/lib/db.js";
import { socketHandler } from "./src/socket/socketHandler.js";
import { cleanup } from "./src/services/cleanupService.js";

import authRoutes from "./src/Routes/authRoutes.js";
import projectRoutes from "./src/Routes/projectRoutes.js";
import runRoutes from "./src/Routes/runRoutes.js";
import chatRoutes from "./src/Routes/chatRoutes.js";
import githubRoutes from "./src/Routes/githubRoutes.js";
import deployRoutes from "./src/Routes/deployRoutes.js";
import previewRoutes from "./src/Routes/previewRoutes.js";
import treeRoutes from "./src/Routes/treeRoutes.js";
import { initWorker } from "./src/workers/runWorker.js"; // Import Worker

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ✅ 1. Enable CORS FIRST */
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* ✅ 2. JSON Middleware */
app.use(express.json());

/* ✅ 3. API Routes */
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/deploy", deployRoutes);
app.use("/api/run", runRoutes);
app.use("/api/preview", previewRoutes); // Will be /api/preview/fullstack
app.use("/previews", express.static("previews"));

// Prompt specific endpoint: POST /tree/:roomId
app.use("/tree", treeRoutes);

/* ✅ 4. Socket Server */
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

socketHandler(io);

/* ✅ 5. Start Server */
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log("✅ Server running on PORT:", PORT);
  Connectdb();
  cleanup();
  initWorker(io); // Start Worker
});
