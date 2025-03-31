const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

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

// Stockage des salles et des parties
const rooms = new Map();
const activeGames = new Map();

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Un client s\'est connecté:', socket.id);

  // Gestion des salles
  socket.on('get_rooms', () => {
    const roomsList = Array.from(rooms.values());
    socket.emit('rooms_update', roomsList);
  });

  socket.on('create_room', () => {
    const roomId = Math.random().toString(36).substring(7);
    const newRoom = {
      id: roomId,
      players: [],
      status: 'waiting',
      currentLevel: 1,
      timeRemaining: 180
    };
    rooms.set(roomId, newRoom);
    io.emit('rooms_update', Array.from(rooms.values()));
  });

  socket.on('delete_room', ({ roomId }) => {
    rooms.delete(roomId);
    activeGames.delete(roomId);
    io.emit('rooms_update', Array.from(rooms.values()));
    io.emit('active_games_update', Array.from(activeGames.values()));
  });

  socket.on('toggle_public_view', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.isPublic = !room.isPublic;
      io.emit('rooms_update', Array.from(rooms.values()));
    }
  });

  // Gestion des parties actives
  socket.on('get_active_games', () => {
    const gamesList = Array.from(activeGames.values());
    socket.emit('active_games_update', gamesList);
  });

  // Gestion des événements du jeu
  socket.on('joinGame', ({ gameId }) => {
    const room = rooms.get(gameId);
    if (room && room.players.length < 4) {
      const player = {
        id: socket.id,
        name: `Joueur ${room.players.length + 1}`
      };
      room.players.push(player);
      socket.join(gameId);
      io.emit('rooms_update', Array.from(rooms.values()));
    }
  });

  socket.on('leaveGame', ({ gameId }) => {
    const room = rooms.get(gameId);
    if (room) {
      room.players = room.players.filter(p => p.id !== socket.id);
      socket.leave(gameId);
      io.emit('rooms_update', Array.from(rooms.values()));
    }
  });

  socket.on('startGame', ({ gameId }) => {
    const room = rooms.get(gameId);
    if (room) {
      room.status = 'playing';
      activeGames.set(gameId, room);
      io.emit('gameStarted', { gameId });
      io.emit('rooms_update', Array.from(rooms.values()));
      io.emit('active_games_update', Array.from(activeGames.values()));
    }
  });

  socket.on('makeMove', ({ gameId, move }) => {
    const game = activeGames.get(gameId);
    if (game) {
      // Logique de traitement du mouvement
      io.to(gameId).emit('gameUpdate', game);
    }
  });

  // Gestion de la déconnexion
  socket.on('disconnect', () => {
    console.log('Un client s\'est déconnecté:', socket.id);
    
    // Nettoyer les salles et parties
    rooms.forEach((room, roomId) => {
      room.players = room.players.filter(p => p.id !== socket.id);
      if (room.players.length === 0) {
        rooms.delete(roomId);
        activeGames.delete(roomId);
      }
    });

    io.emit('rooms_update', Array.from(rooms.values()));
    io.emit('active_games_update', Array.from(activeGames.values()));
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 