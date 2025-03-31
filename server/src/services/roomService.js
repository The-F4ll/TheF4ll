import { GAME_CONFIG, ROOM_STATUS } from '../config/constants.js';
import { createGameState, makeMove } from './gameService.js';

// Stockage des salles et des parties actives
const rooms = new Map();
const activeGames = new Map();
const emptyRoomTimers = new Map();

const ROOM_CLEANUP_DELAY = 60000; // 1 minute en millisecondes

const cleanupEmptyRoom = (roomId) => {
  const room = rooms.get(roomId);
  if (room && room.players.length === 0) {
    console.log(`🗑️ Suppression de la salle ${roomId} après ${ROOM_CLEANUP_DELAY/1000}s d'inactivité`);
    rooms.delete(roomId);
    emptyRoomTimers.delete(roomId);
  }
};

const scheduleRoomCleanup = (roomId) => {
  // Supprimer le timer existant s'il y en a un
  if (emptyRoomTimers.has(roomId)) {
    clearTimeout(emptyRoomTimers.get(roomId));
  }

  // Créer un nouveau timer
  const timer = setTimeout(() => cleanupEmptyRoom(roomId), ROOM_CLEANUP_DELAY);
  emptyRoomTimers.set(roomId, timer);
};

const cancelRoomCleanup = (roomId) => {
  if (emptyRoomTimers.has(roomId)) {
    clearTimeout(emptyRoomTimers.get(roomId));
    emptyRoomTimers.delete(roomId);
  }
};

export const createNewRoom = (creatorId) => {
  const roomId = Math.random().toString(36).substring(2, 8);
  const room = {
    id: roomId,
    players: [],
    status: ROOM_STATUS.WAITING,
    isPublic: true,
    createdAt: new Date().toISOString(),
    createdBy: creatorId
  };
  rooms.set(roomId, room);
  console.log(`🎮 Nouvelle salle créée: ${roomId}`);
  return room;
};

export const getRooms = () => {
  return Array.from(rooms.values());
};

export const joinRoom = (roomId, player) => {
  const room = rooms.get(roomId);
  if (!room) {
    throw new Error('Salle non trouvée');
  }
  if (room.players.length >= 4) {
    throw new Error('La salle est pleine');
  }
  if (!room.players.find(p => p.id === player.id)) {
    room.players.push(player);
    cancelRoomCleanup(roomId); // Annuler la suppression si elle était planifiée
    console.log(`👤 ${player.name} a rejoint la salle ${roomId}`);
  }
  return room;
};

export const leaveRoom = (roomId, playerId) => {
  const room = rooms.get(roomId);
  if (!room) {
    throw new Error('Salle non trouvée');
  }
  room.players = room.players.filter(p => p.id !== playerId);
  console.log(`👋 Joueur ${playerId} a quitté la salle ${roomId}`);
  
  // Si la salle est vide, planifier sa suppression
  if (room.players.length === 0) {
    scheduleRoomCleanup(roomId);
  }
  
  return room;
};

export const startGame = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) {
    throw new Error('Salle non trouvée');
  }
  if (room.players.length < 2) {
    throw new Error('Il faut au moins 2 joueurs pour commencer');
  }
  room.status = 'playing';
  room.gameState = createGameState(room.players);
  console.log(`🎯 Partie démarrée dans la salle ${roomId}`);
  return room;
};

export const deleteRoom = (roomId, playerId) => {
  const room = rooms.get(roomId);
  if (!room) {
    throw new Error('Salle non trouvée');
  }

  // Vérifier si le joueur est le créateur de la salle
  if (room.createdBy !== playerId) {
    throw new Error('Seul le créateur de la salle peut la supprimer');
  }

  rooms.delete(roomId);
  activeGames.delete(roomId);
  return true;
};

export const updateGameState = (roomId, move) => {
  const room = rooms.get(roomId);
  if (!room) {
    throw new Error('Salle non trouvée');
  }
  if (!room.gameState) {
    throw new Error('Aucune partie en cours');
  }
  room.gameState = makeMove(room.gameState, move);
  return room;
};

export const togglePublicView = (roomId, playerId) => {
  const room = rooms.get(roomId);
  if (!room) {
    throw new Error('Salle non trouvée');
  }

  // Vérifier si le joueur est le créateur de la salle
  if (room.createdBy !== playerId) {
    throw new Error('Seul le créateur de la salle peut modifier sa visibilité');
  }

  room.isPublic = !room.isPublic;
  return room;
};

export const getActiveGames = () => {
  return Array.from(rooms.values())
    .filter(room => room.status === ROOM_STATUS.PLAYING)
    .map(room => ({
      id: room.id,
      players: room.players,
      gameState: room.gameState,
      status: room.status,
      createdBy: room.createdBy,
      isPublic: room.isPublic
    }));
}; 