import { v4 as uuidv4 } from "uuid";
import {
  getAllRooms,
  getRoomById,
  createRoomInMemory,
  deleteRoomFromMemory as removeRoomFromMemory, // Importer la fonction avec un alias
} from "../utils/gameUtils.js";

// Stockage temporaire des parties (à remplacer par une base de données)
let rooms = [];

// Récupérer toutes les rooms
export const getRooms = (req, res) => {
  try {
    const rooms = getAllRooms();
    res.json(rooms);
  } catch (error) {
    console.error("Erreur lors de la récupération des rooms:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des rooms" });
  }
};

// Créer une nouvelle room
export const createRoom = (req, res) => {
  try {
    const roomData = req.body;

    // Vérifier si les données de la room sont valides
    if (!roomData.id || !roomData.name) {
      return res.status(400).json({ error: "Données de room invalides" });
    }

    // Créer la room
    const success = createRoomInMemory(roomData);

    if (success) {
      const newRoom = getRoomById(roomData.id);
      res.status(201).json(newRoom);
    } else {
      res.status(409).json({ error: "Une room avec cet ID existe déjà" });
    }
  } catch (error) {
    console.error("Erreur lors de la création de la room:", error);
    res.status(500).json({ error: "Erreur lors de la création de la room" });
  }
};

// Supprimer une room
export const deleteRoom = (req, res) => {
  try {
    const { roomId } = req.params;

    // Vérifier si la room existe
    const room = getRoomById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room non trouvée" });
    }

    // Utiliser la fonction importée avec l'alias pour supprimer la room
    const success = removeRoomFromMemory(roomId);

    if (success) {
      res.json({ message: "Room supprimée avec succès" });
    } else {
      res
        .status(500)
        .json({ error: "Erreur lors de la suppression de la room" });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la room:", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la room" });
  }
};

export const getRoom = (roomId) => {
  return rooms.find((room) => room.id === roomId);
};

export const updateRoom = (roomId, updates) => {
  const roomIndex = rooms.findIndex((room) => room.id === roomId);
  if (roomIndex === -1) return null;

  rooms[roomIndex] = {
    ...rooms[roomIndex],
    ...updates,
  };

  return rooms[roomIndex];
};

export const deleteRoomFromMemory = (roomId) => {
  const roomIndex = rooms.findIndex((room) => room.id === roomId);
  if (roomIndex === -1) return false;

  rooms.splice(roomIndex, 1);
  return true;
};

export const addPlayerToRoom = (roomId, playerData) => {
  const room = getRoom(roomId);
  if (!room || room.players.length >= room.maxPlayers) return null;

  // Vérifier si le joueur existe déjà
  const existingPlayerIndex = room.players.findIndex(
    (p) => p.id === playerData.id
  );

  if (existingPlayerIndex !== -1) {
    // Mettre à jour le joueur existant au lieu d'en ajouter un nouveau
    room.players[existingPlayerIndex] = {
      ...room.players[existingPlayerIndex],
      ...playerData,
    };
    return room.players[existingPlayerIndex];
  }

  const newPlayer = {
    id: uuidv4(),
    name: playerData.name,
    avatar: playerData.avatar,
    score: 0,
    joinedAt: Date.now(),
  };

  room.players.push(newPlayer);
  return newPlayer;
};

export const removePlayerFromRoom = (roomId, playerId) => {
  const room = getRoom(roomId);
  if (!room) return false;

  const playerIndex = room.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) return false;

  room.players.splice(playerIndex, 1);
  return true;
};

export const updatePlayerScore = (roomId, playerId, score) => {
  const room = getRoom(roomId);
  if (!room) return false;

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return false;

  player.score = score;
  return true;
};

export const setRoomWinner = (roomId, playerId) => {
  const room = getRoom(roomId);
  if (!room) return false;

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return false;

  room.winner = {
    id: player.id,
    name: player.name,
    score: player.score,
  };

  return true;
};
