import { getRooms, createNewRoom, joinRoom, leaveRoom, startGame, updateGameState } from '../services/roomService.js';

export const getAllRooms = (req, res) => {
  try {
    const rooms = getRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createRoom = (req, res) => {
  try {
    const newRoom = createNewRoom();
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const joinRoomHandler = (req, res) => {
  try {
    const { roomId } = req.params;
    const { player } = req.body;
    const room = joinRoom(roomId, player);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const leaveRoomHandler = (req, res) => {
  try {
    const { roomId } = req.params;
    const { playerId } = req.body;
    const room = leaveRoom(roomId, playerId);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const startGameHandler = (req, res) => {
  try {
    const { roomId } = req.params;
    const room = startGame(roomId);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateGameStateHandler = (req, res) => {
  try {
    const { roomId } = req.params;
    const { move } = req.body;
    const room = updateGameState(roomId, move);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRoom = (req, res) => {
  const { roomId } = req.params;
  if (rooms.delete(roomId)) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Salle non trouvée' });
  }
}; 