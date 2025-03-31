import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { handleSocketConnection } from './controllers/socketController.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // URL du client Vite
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors());
app.use(express.json());

// Configuration des gestionnaires Socket.IO
handleSocketConnection(io);

// Gestion des erreurs Socket.IO
io.on("error", (error) => {
  console.error("Erreur Socket.IO:", error);
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
}); 