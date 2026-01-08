import dotenv from 'dotenv';
import express from 'express';
import http from 'http'
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Connectdb } from './lib/db.js';
import { socketHandler } from './socket/socketHandler.js';
import authRoutes from "./Routes/authRoutes.js"
import projectRoutes from "./Routes/projectRoutes.js"



const app = express()
app.use(express.json());
const server = http.createServer(app);



app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true
}));

const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", 
      methods: ["GET", "POST"]
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);

socketHandler(io);

dotenv.config();
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log("server is running on PORT:" + PORT);
    Connectdb();
  });