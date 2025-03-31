import { Room } from "../models/Room.js";
import { Player } from "../models/Player.js";

export class GameStateManager {
  constructor() {
    this.rooms = new Map();
    this.players = new Map(); // Map de tous les joueurs connectés
    this.adminSockets = new Set(); // Sockets des administrateurs
    this.playerToRoom = new Map(); // Map pour suivre dans quelle salle est chaque joueur
  }

  // Gestion des salles
  createRoom(roomId, roomData) {
    const room = new Room(roomId);
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  deleteRoom(roomId) {
    const room = this.getRoom(roomId);
    if (room) {
      // Nettoyer les références des joueurs
      Object.values(room.players).forEach((player) => {
        this.playerToRoom.delete(player.socketId);
      });
      this.rooms.delete(roomId);
    }
  }

  // Gestion des joueurs
  addPlayer(playerId, name, socketId) {
    const player = new Player(playerId, name, socketId);
    this.players.set(socketId, player);
    return player;
  }

  removePlayer(socketId) {
    const player = this.players.get(socketId);
    if (player) {
      const roomId = this.playerToRoom.get(socketId);
      if (roomId) {
        const room = this.getRoom(roomId);
        if (room) {
          room.removePlayer(player.id);
        }
        this.playerToRoom.delete(socketId);
      }
      this.players.delete(socketId);
    }
  }

  // Gestion des administrateurs
  addAdmin(socketId) {
    this.adminSockets.add(socketId);
  }

  removeAdmin(socketId) {
    this.adminSockets.delete(socketId);
  }

  isAdmin(socketId) {
    return this.adminSockets.has(socketId);
  }

  // Gestion des associations joueur-salle
  assignPlayerToRoom(socketId, roomId) {
    this.playerToRoom.set(socketId, roomId);
  }

  getPlayerRoom(socketId) {
    return this.playerToRoom.get(socketId);
  }

  // Obtenir l'état global pour le dashboard admin
  getGlobalState() {
    return {
      rooms: Array.from(this.rooms.values()).map((room) => room.toJSON()),
      players: Array.from(this.players.values()).map((player) => ({
        ...player.toJSON(),
        roomId: this.playerToRoom.get(player.socketId),
      })),
      stats: {
        totalPlayers: this.players.size,
        totalRooms: this.rooms.size,
        activeGames: Array.from(this.rooms.values()).filter(
          (room) => room.started && !room.completed
        ).length,
      },
    };
  }
}
