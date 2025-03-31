import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { DEFAULT_PORT } from "./config/constants.js";
import { setupSocketHandlers } from "./controllers/socketController.js";
import {
  getRooms,
  createRoom,
  deleteRoom,
} from "./controllers/roomController.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Configuration de base
app.use(cors());
app.use(express.json());

// Routes API
app.get("/api/rooms", getRooms);
app.post("/api/rooms", createRoom);
app.delete("/api/rooms/:roomId", deleteRoom);

// Configuration des gestionnaires Socket.IO
setupSocketHandlers(io);

// Gestion des erreurs globale pour l'API
app.use((err, req, res, next) => {
  console.error("Erreur API:", err);
  res.status(500).json({
    error: "Erreur serveur",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Une erreur est survenue",
  });
});

// Gestion des erreurs pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Gestion des erreurs pour les requêtes malformées
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Requête malformée" });
  }
  next(err);
});

// Gestion des erreurs Socket.IO
io.on("error", (error) => {
  console.error("Erreur Socket.IO:", error);
});

// Démarrage du serveur
const PORT = process.env.PORT || DEFAULT_PORT;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
