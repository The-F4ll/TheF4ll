import { v4 as uuidv4 } from 'uuid';

// Stockage temporaire des parties (à remplacer par une base de données)
let rooms = [];

export const getRooms = () => {
  return rooms;
};

export const createRoom = (roomData) => {
  const newRoom = {
    id: uuidv4(),
    name: roomData.name || 'Nouvelle partie',
    status: 'En attente',
    maxPlayers: roomData.maxPlayers || 4,
    players: [],
    startTime: null,
    endTime: null,
    duration: 0,
    winner: null,
    createdAt: Date.now()
  };

  rooms.push(newRoom);
  return newRoom;
};

export const getRoom = (roomId) => {
  return rooms.find(room => room.id === roomId);
};

export const updateRoom = (roomId, updates) => {
  const roomIndex = rooms.findIndex(room => room.id === roomId);
  if (roomIndex === -1) return null;

  rooms[roomIndex] = {
    ...rooms[roomIndex],
    ...updates
  };

  return rooms[roomIndex];
};

export const deleteRoom = (roomId) => {
  const roomIndex = rooms.findIndex(room => room.id === roomId);
  if (roomIndex === -1) return false;

  rooms.splice(roomIndex, 1);
  return true;
};

export const addPlayerToRoom = (roomId, playerData) => {
  const room = getRoom(roomId);
  if (!room || room.players.length >= room.maxPlayers) return null;

  const newPlayer = {
    id: uuidv4(),
    name: playerData.name,
    avatar: playerData.avatar,
    score: 0,
    joinedAt: Date.now()
  };

  room.players.push(newPlayer);
  return newPlayer;
};

export const removePlayerFromRoom = (roomId, playerId) => {
  const room = getRoom(roomId);
  if (!room) return false;

  const playerIndex = room.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return false;

  room.players.splice(playerIndex, 1);
  return true;
};

export const updatePlayerScore = (roomId, playerId, score) => {
  const room = getRoom(roomId);
  if (!room) return false;

  const player = room.players.find(p => p.id === playerId);
  if (!player) return false;

  player.score = score;
  return true;
};

export const setRoomWinner = (roomId, playerId) => {
  const room = getRoom(roomId);
  if (!room) return false;

  const player = room.players.find(p => p.id === playerId);
  if (!player) return false;

  room.winner = {
    id: player.id,
    name: player.name,
    score: player.score
  };

  return true;
}; 