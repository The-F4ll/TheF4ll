import { v4 as uuidv4 } from "uuid"; // Assurez-vous d'installer uuid avec npm

// Stockage temporaire des données (à remplacer par une base de données)
const rooms = new Map();

// Génération d'identifiants
export const generatePlayerId = () => `player_${uuidv4().substring(0, 8)}`;
export const generateSpectatorId = () =>
  `spectator_${uuidv4().substring(0, 8)}`;

// Gestion des rooms
export const getUpdatedRoom = (roomId) => {
  const room = rooms.get(roomId);
  if (!room) {
    console.warn(`Room ${roomId} non trouvée`);
    return null;
  }
  return { ...room };
};

export const addPlayerToRoom = (roomId, player) => {
  if (!rooms.has(roomId)) {
    console.warn(`Room ${roomId} non trouvée pour ajouter un joueur`);
    return false;
  }

  const room = rooms.get(roomId);
  if (room.players.length >= room.maxPlayers) {
    console.warn(`Room ${roomId} est pleine`);
    return false;
  }

  room.players.push(player);
  return true;
};

export const addSpectatorToRoom = (roomId, spectator) => {
  if (!rooms.has(roomId)) {
    console.warn(`Room ${roomId} non trouvée pour ajouter un spectateur`);
    return false;
  }

  const room = rooms.get(roomId);
  room.spectators.push(spectator);
  return true;
};

export const updatePlayerReady = (roomId, playerId, ready) => {
  if (!rooms.has(roomId)) {
    console.warn(`Room ${roomId} non trouvée pour mettre à jour un joueur`);
    return false;
  }

  const room = rooms.get(roomId);
  const playerIndex = room.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    console.warn(`Joueur ${playerId} non trouvé dans la room ${roomId}`);
    return false;
  }

  room.players[playerIndex].ready = ready;
  return true;
};

// Gestion du jeu
export const getGameData = (roomId) => {
  if (!rooms.has(roomId)) {
    console.warn(`Room ${roomId} non trouvée pour obtenir les données de jeu`);
    return null;
  }

  const room = rooms.get(roomId);
  // À personnaliser selon vos besoins
  return {
    stage: room.currentStage || 1,
    timeLimit: room.gameSettings.timeLimit,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score || 0,
    })),
    puzzle: getPuzzleForStage(
      room.currentStage || 1,
      room.gameSettings.difficulty
    ),
  };
};

export const validateCode = (code) => {
  // Exemple de validation simplifiée, à adapter selon vos règles
  return code.includes("correct"); // Juste pour démontrer
};

export const checkAllPlayersCleared = (roomId) => {
  if (!rooms.has(roomId)) return false;

  const room = rooms.get(roomId);
  return room.players.every((p) => p.clearedCurrentStage);
};

export const incrementStage = (roomId) => {
  if (!rooms.has(roomId)) return null;

  const room = rooms.get(roomId);
  room.currentStage = (room.currentStage || 1) + 1;

  // Réinitialiser les flags des joueurs
  room.players.forEach((p) => {
    p.clearedCurrentStage = false;
  });

  return {
    stage: room.currentStage,
    puzzle: getPuzzleForStage(room.currentStage, room.gameSettings.difficulty),
  };
};

export const generateHint = (roomId) => {
  if (!rooms.has(roomId)) return "Indice non disponible";

  const room = rooms.get(roomId);
  const stage = room.currentStage || 1;
  // À adapter selon vos puzzles
  return `Indice pour l'étape ${stage}: Essayez d'utiliser une boucle pour résoudre ce problème.`;
};

export const getVotesData = (roomId) => {
  if (!rooms.has(roomId)) return { votes: {} };

  const room = rooms.get(roomId);
  return {
    votes: room.votes || {},
    totalVotes: room.spectators.length,
  };
};

// Fonction utilitaire pour obtenir un puzzle selon l'étape et la difficulté
const getPuzzleForStage = (stage, difficulty) => {
  // À personnaliser selon vos puzzles
  return {
    id: `puzzle_${stage}_${difficulty}`,
    title: `Puzzle ${stage}`,
    description: `Description du puzzle pour l'étape ${stage} (difficulté: ${difficulty})`,
    starter_code: `// Code de démarrage pour le puzzle ${stage}\n`,
    test_cases: [{ input: "test", expected: "test" }],
  };
};

// Fonctions pour la gestion des rooms dans la Map
export const createRoomInMemory = (roomData) => {
  if (rooms.has(roomData.id)) {
    return false;
  }

  rooms.set(roomData.id, {
    ...roomData,
    players: [],
    spectators: [],
    isGameStarted: false,
    currentStage: 1,
    votes: {},
    createdAt: new Date(),
  });

  return true;
};

export const getAllRooms = () => {
  return Array.from(rooms.values());
};

export const getRoomById = (roomId) => {
  return rooms.get(roomId);
};

export const deleteRoomFromMemory = (roomId) => {
  return rooms.delete(roomId);
};
