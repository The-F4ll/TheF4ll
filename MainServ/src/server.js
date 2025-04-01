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

// Importez les fonctions utilitaires
import {
  generatePlayerId,
  generateSpectatorId,
  getUpdatedRoom,
  getGameData,
  validateCode,
  checkAllPlayersCleared,
  incrementStage,
  generateHint,
  getVotesData,
  createRoomInMemory,
  getAllRooms,
  addPlayerToRoom,
  addSpectatorToRoom,
  updatePlayerReady,
} from "./utils/gameUtils.js";

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

// Gestionnaire de connexions Socket.IO
io.on("connection", (socket) => {
  console.log("Nouveau client connecté:", socket.id);

  // Rejoindre une salle
  socket.on("join_room", (data, callback) => {
    const { roomId, player, spectator } = data;

    if (player) {
      // Utiliser l'ID existant ou en générer un nouveau
      const playerId = player.id || generatePlayerId();

      // Ajouter le joueur à la room
      const playerWithId = { ...player, id: playerId };
      const success = addPlayerToRoom(roomId, playerWithId);

      if (success) {
        socket.join(roomId);
        socket.emit("assigned_id", playerId);
        // Notifier tous les membres de la salle
        io.to(roomId).emit("room_updated", getUpdatedRoom(roomId));
        if (callback) callback(playerId);
      } else {
        if (callback) callback({ error: "Impossible de rejoindre la room" });
      }
    } else if (spectator) {
      // Générer un ID pour le spectateur
      const spectatorId = generateSpectatorId();

      // Ajouter le spectateur à la room
      const spectatorWithId = { ...spectator, id: spectatorId };
      const success = addSpectatorToRoom(roomId, spectatorWithId);

      if (success) {
        socket.join(roomId);
        socket.emit("assigned_id", spectatorId);
        // Notifier tous les membres de la salle
        io.to(roomId).emit("room_updated", getUpdatedRoom(roomId));
        if (callback) callback(spectatorId);
      } else {
        if (callback)
          callback({
            error: "Impossible de rejoindre la room en tant que spectateur",
          });
      }
    }
  });

  // Mettre à jour l'état "prêt" d'un joueur
  socket.on("player_ready", (data) => {
    const { roomId, playerId, ready } = data;
    // Mettre à jour l'état du joueur...
    io.to(roomId).emit("room_updated", getUpdatedRoom(roomId));
  });

  // Démarrer la partie
  socket.on("start_game", (data) => {
    const { roomId } = data;
    // Logique pour démarrer la partie...
    io.to(roomId).emit("game_started", { gameData: getGameData(roomId) });
  });

  // Soumettre du code
  socket.on("submit_code", (data, callback) => {
    const { roomId, playerId, code } = data;
    // Valider le code...
    const isCorrect = validateCode(code);

    if (isCorrect) {
      // Vérifier si tous les joueurs ont résolu l'étape
      const allCleared = checkAllPlayersCleared(roomId);

      if (allCleared) {
        // Passer à l'étape suivante
        const newStage = incrementStage(roomId);
        io.to(roomId).emit("stage_cleared", newStage);
      } else {
        // Attendre les autres joueurs
        socket.emit("waiting_others", playerId);
      }
    }

    if (callback) callback({ correct: isCorrect });
  });

  // Demander un indice
  socket.on("request_hint", (data, callback) => {
    const { roomId, playerId } = data;
    // Générer un indice...
    const hint = generateHint(roomId);

    if (callback) callback(hint);
  });

  // Vote de spectateur
  socket.on("cast_vote", (data) => {
    const { roomId, spectatorId, option } = data;
    // Gérer le vote...
    io.to(roomId).emit("votes_updated", getVotesData(roomId));
  });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log("Client déconnecté:", socket.id);
    // Gérer la déconnexion (supprimer le joueur des salles, etc.)
  });
});

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

// Fonction pour créer une room par défaut
const createDefaultRoom = async () => {
  try {
    console.log("Tentative de création de la room par défaut...");

    // Définir les données de la room par défaut
    const defaultRoomId = "default-lobby";
    const defaultRoomData = {
      id: defaultRoomId,
      name: "Lobby principal",
      maxPlayers: 4,
      isPublic: true,
      players: [], // Assurez-vous que cette propriété existe
      spectators: [], // Assurez-vous que cette propriété existe
      isGameStarted: false, // Assurez-vous que cette propriété existe
      gameSettings: {
        difficulty: "medium",
        timeLimit: 300, // 5 minutes
        autoStart: false,
      },
    };

    // Vérifier si la room par défaut existe déjà
    let rooms = [];
    try {
      // Créer un faux objet de requête et de réponse pour getRooms
      const req = {};
      const res = {
        json: (data) => {
          rooms = data;
        },
        status: () => res,
      };

      await getRooms(req, res);
      console.log(`Nombre de rooms trouvées: ${rooms.length}`);
    } catch (error) {
      console.error("Erreur lors de la récupération des rooms:", error);
      // En cas d'erreur, supposer que la room n'existe pas
      rooms = [];
    }

    const defaultRoomExists =
      Array.isArray(rooms) && rooms.some((room) => room.id === defaultRoomId);
    console.log(`La room par défaut existe-t-elle? ${defaultRoomExists}`);

    // Si la room par défaut n'existe pas, la créer
    if (!defaultRoomExists) {
      // Créer un faux objet de requête et de réponse pour createRoom
      const req = {
        body: defaultRoomData,
      };

      const res = {
        status: (code) => {
          console.log(`Status code: ${code}`);
          return res;
        },
        json: (data) => {
          console.log("Room créée:", data);
        },
      };

      try {
        await createRoom(req, res);
        console.log("Room par défaut créée avec succès:", defaultRoomId);
      } catch (createError) {
        console.error(
          "Erreur spécifique lors de la création de la room:",
          createError
        );
      }
    } else {
      console.log("Room par défaut déjà existante:", defaultRoomId);
    }
  } catch (error) {
    console.error(
      "Erreur générale lors de la création de la room par défaut:",
      error
    );
    console.error(error.stack); // Afficher la stack trace pour plus de détails
  }
};

// Démarrage du serveur et création de la room par défaut
const PORT = process.env.PORT || DEFAULT_PORT;
server.listen(PORT, async () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);

  // Attendez un court délai pour que le serveur soit complètement initialisé
  setTimeout(async () => {
    try {
      // Créer une room par défaut au démarrage du serveur
      await createDefaultRoom();
    } catch (error) {
      console.error("Erreur lors de l'appel à createDefaultRoom:", error);
    }
  }, 1000);
});
