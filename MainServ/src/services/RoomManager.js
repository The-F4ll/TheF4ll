import { Room } from "../models/Room.js";
import { MAX_PLAYERS_PER_ROOM } from "../config/constants.js";

export class RoomManager {
  constructor() {
    this.rooms = {};
    this.playerSockets = new Map(); // Pour suivre les sockets des joueurs
  }

  createRoom(roomId) {
    try {
      if (this.rooms[roomId]) {
        return this.rooms[roomId];
      }
      this.rooms[roomId] = new Room(roomId);
      console.log(`Salle ${roomId} créée avec succès`);
      return this.rooms[roomId];
    } catch (error) {
      console.error(`Erreur lors de la création de la salle ${roomId}:`, error);
      throw new Error(`Impossible de créer la salle: ${error.message}`);
    }
  }

  getRoom(roomId) {
    return this.rooms[roomId];
  }

  deleteRoom(roomId) {
    if (this.rooms[roomId]) {
      delete this.rooms[roomId];
      console.log(`Salle ${roomId} supprimée avec succès`);
    }
  }

  addPlayerToRoom(roomId, playerName, socketId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error("Salle non trouvée");
    }

    // Vérifier si le joueur existe déjà dans une salle
    const existingRoomId = this.playerSockets.get(socketId);
    if (existingRoomId) {
      if (existingRoomId === roomId) {
        // Le joueur est déjà dans cette salle
        const existingPlayer = Object.values(room.players).find(
          (p) => p.socketId === socketId
        );
        if (existingPlayer) {
          console.log(
            `Joueur ${existingPlayer.name} (${existingPlayer.id}) déjà dans la salle ${roomId}`
          );
          return existingPlayer.id;
        }
      } else {
        // Le joueur est dans une autre salle
        throw new Error("Le joueur est déjà dans une autre salle");
      }
    }

    if (Object.keys(room.players).length >= MAX_PLAYERS_PER_ROOM) {
      throw new Error("La salle est pleine");
    }

    const playerId = room.addPlayer(playerName, socketId);
    this.playerSockets.set(socketId, roomId);
    console.log(
      `Joueur ${playerName} (${playerId}) ajouté à la salle ${roomId}`
    );
    return playerId;
  }

  removePlayerFromRoom(roomId, playerId) {
    const room = this.getRoom(roomId);
    if (room) {
      const player = room.getPlayer(playerId);
      if (player) {
        console.log(
          `Joueur ${player.name} (${playerId}) retiré de la salle ${roomId}`
        );
        this.playerSockets.delete(player.socketId);
        room.removePlayer(playerId);
      }
    }
  }

  getRoomsList() {
    return Object.entries(this.rooms).map(([id, room]) => ({
      id,
      playerCount: Object.keys(room.players).length,
      stage: room.stage,
      started: room.started,
      failed: room.failed,
      completed: room.completed,
      currentLevel: room.currentLevel,
    }));
  }
}
