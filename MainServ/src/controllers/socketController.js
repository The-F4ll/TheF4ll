import { GameStateManager } from "../services/GameStateManager.js";
import { SOCKET_EVENTS } from "../config/constants.js";

const gameState = new GameStateManager();

export const setupSocketHandlers = (io) => {
  // Gestion des connexions
  io.on("connection", (socket) => {
    console.log("Nouveau client connecté:", socket.id);

    // Envoyer l'état initial au client
    socket.emit(SOCKET_EVENTS.INITIAL_STATE, gameState.getGlobalState());

    // Gestion des événements de partie
    socket.on(SOCKET_EVENTS.ROOM_CREATE, (roomData) => {
      const roomId = roomData.id || Date.now().toString();
      const newRoom = gameState.createRoom(roomId, roomData);
      io.emit(SOCKET_EVENTS.ROOMS_UPDATE, gameState.getGlobalState().rooms);
      io.emit(SOCKET_EVENTS.ROOM_UPDATE, newRoom.toJSON());
    });

    socket.on(SOCKET_EVENTS.ROOM_JOIN, (data) => {
      const { roomId, playerName } = data;
      const room = gameState.getRoom(roomId);

      if (room) {
        const player = gameState.addPlayer(
          room.nextId++,
          playerName,
          socket.id
        );
        gameState.assignPlayerToRoom(socket.id, roomId);
        room.addPlayer(player.name, player.socketId);

        socket.join(roomId);
        io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATE, room.toJSON());
        io.emit(
          SOCKET_EVENTS.PLAYERS_UPDATE,
          gameState.getGlobalState().players
        );
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_LEAVE, (roomId) => {
      const currentRoomId = gameState.getPlayerRoom(socket.id);
      if (currentRoomId) {
        socket.leave(currentRoomId);
        gameState.removePlayer(socket.id);

        const room = gameState.getRoom(currentRoomId);
        if (room) {
          io.to(currentRoomId).emit(SOCKET_EVENTS.ROOM_UPDATE, room.toJSON());
        }
        io.emit(
          SOCKET_EVENTS.PLAYERS_UPDATE,
          gameState.getGlobalState().players
        );
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_DELETE, (roomId) => {
      if (gameState.isAdmin(socket.id)) {
        gameState.deleteRoom(roomId);
        io.emit(SOCKET_EVENTS.ROOMS_UPDATE, gameState.getGlobalState().rooms);
      }
    });

    // Gestion des événements de jeu
    socket.on(SOCKET_EVENTS.GAME_START, (roomId) => {
      const room = gameState.getRoom(roomId);
      if (room && room.allPlayersReady()) {
        room.startGame();
        io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATE, room.toJSON());
      }
    });

    socket.on(SOCKET_EVENTS.GAME_END, (roomId) => {
      const room = gameState.getRoom(roomId);
      if (room) {
        room.status = "Terminée";
        room.endTime = Date.now();
        room.duration = Math.floor((room.endTime - room.startTime) / 1000);
        io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATE, room.toJSON());
        io.emit(SOCKET_EVENTS.ROOMS_UPDATE, gameState.getGlobalState().rooms);
      }
    });

    socket.on(SOCKET_EVENTS.PLAYER_UPDATE, (data) => {
      const { roomId, playerId, updates } = data;
      const room = gameState.getRoom(roomId);
      if (room) {
        const player = room.getPlayer(playerId);
        if (player) {
          Object.assign(player, updates);
          io.to(roomId).emit(SOCKET_EVENTS.ROOM_UPDATE, room.toJSON());
        }
      }
    });

    // Gestion des administrateurs
    socket.on(SOCKET_EVENTS.ADMIN_CONNECT, (adminKey) => {
      // Vérifier la clé d'administration (à implémenter selon vos besoins)
      if (adminKey === process.env.ADMIN_KEY) {
        gameState.addAdmin(socket.id);
        socket.emit(SOCKET_EVENTS.ADMIN_AUTH, true);
      }
    });

    // Gestion des déconnexions
    socket.on("disconnect", () => {
      console.log("Client déconnecté:", socket.id);

      if (gameState.isAdmin(socket.id)) {
        gameState.removeAdmin(socket.id);
      }

      const currentRoomId = gameState.getPlayerRoom(socket.id);
      if (currentRoomId) {
        const room = gameState.getRoom(currentRoomId);
        if (room) {
          io.to(currentRoomId).emit(SOCKET_EVENTS.ROOM_UPDATE, room.toJSON());
        }
      }

      gameState.removePlayer(socket.id);
      io.emit(SOCKET_EVENTS.PLAYERS_UPDATE, gameState.getGlobalState().players);
    });
  });
};
