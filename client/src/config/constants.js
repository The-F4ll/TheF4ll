export const SOCKET_EVENTS = {
  // Événements de salle
  GET_ROOMS: 'get_rooms',
  ROOMS_UPDATE: 'rooms_update',
  CREATE_ROOM: 'create_room',
  DELETE_ROOM: 'delete_room',
  TOGGLE_PUBLIC_VIEW: 'toggle_public_view',
  ROOM_CREATED: 'room_created',
  
  // Événements de jeu
  GET_ACTIVE_GAMES: 'get_active_games',
  ACTIVE_GAMES_UPDATE: 'active_games_update',
  JOIN_GAME: 'joinGame',
  LEAVE_GAME: 'leaveGame',
  START_GAME: 'startGame',
  MAKE_MOVE: 'makeMove',
  GAME_UPDATE: 'gameUpdate',
  GAME_STARTED: 'gameStarted',
  
  // Événements de notification
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  ERROR: 'error'
};

export const GAME_CONFIG = {
  MAX_PLAYERS: 4,
  DEFAULT_TIME: 180,
  MIN_PLAYERS: 2
};

export const ROOM_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished'
}; 