export const mountainLevels = [
  "Le Départ du Voyage",
  "Le Ravin des Ombres",
  "Le Pont Suspendu",
  "La Tempête de Glace",
  "Le Sommet des Étoiles"
];

export const playerRoles = [
  "Escaladeur",
  "Navigateur",
  "Survivant",
  "Stratège"
];

// Configuration du serveur
export const DEFAULT_PORT = 3000;

// Configuration des parties
export const DEFAULT_MAX_PLAYERS = 4;
export const MIN_PLAYERS_TO_START = 2;
export const MAX_PLAYERS = 8;

// Durées (en secondes)
export const GAME_START_DELAY = 5;
export const GAME_END_DELAY = 3;
export const MAX_GAME_DURATION = 300; // 5 minutes

// États des parties
export const ROOM_STATUS = {
  WAITING: 'En attente',
  STARTING: 'Démarrage',
  IN_PROGRESS: 'En cours',
  FINISHED: 'Terminée'
};

// Configuration des scores
export const SCORE_CONFIG = {
  WIN: 100,
  LOSE: 0,
  DRAW: 50
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  ROOM_FULL: 'La partie est pleine',
  ROOM_NOT_FOUND: 'Partie non trouvée',
  PLAYER_NOT_FOUND: 'Joueur non trouvé',
  GAME_ALREADY_STARTED: 'La partie a déjà commencé',
  NOT_ENOUGH_PLAYERS: 'Pas assez de joueurs pour démarrer',
  INVALID_ACTION: 'Action non valide'
};

// Configuration des événements Socket.IO
export const SOCKET_EVENTS = {
  // Événements de partie
  ROOM_CREATE: 'room:create',
  ROOM_UPDATE: 'room:update',
  ROOM_DELETE: 'room:delete',
  ROOMS_UPDATE: 'rooms:update',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  
  // Événements de jeu
  GAME_START: 'game:start',
  GAME_END: 'game:end',
  GAME_UPDATE: 'game:update',
  
  // Événements de joueur
  PLAYER_JOIN: 'player:join',
  PLAYER_LEAVE: 'player:leave',
  PLAYER_UPDATE: 'player:update',
  PLAYERS_UPDATE: 'players:update',
  
  // Événements système
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Événements d'administration
  ADMIN_CONNECT: 'admin:connect',
  ADMIN_AUTH: 'admin:auth',
  INITIAL_STATE: 'initial:state'
}; 