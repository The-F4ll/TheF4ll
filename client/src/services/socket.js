import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Connecté au serveur Socket.IO');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Déconnecté du serveur Socket.IO');
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Erreur Socket.IO:', error);
      this.connected = false;
    });
  }

  isConnected() {
    return this.connected && this.socket !== null;
  }

  ensureConnection() {
    if (!this.isConnected()) {
      this.connect();
    }
  }

  // Méthodes pour le dashboard
  getRooms() {
    this.ensureConnection();
    this.socket.emit('get_rooms');
  }

  getActiveGames() {
    this.ensureConnection();
    this.socket.emit('get_active_games');
  }

  createRoom() {
    this.ensureConnection();
    this.socket.emit('create_room');
  }

  deleteRoom(roomId) {
    this.ensureConnection();
    this.socket.emit('delete_room', { roomId });
  }

  togglePublicView(roomId) {
    this.ensureConnection();
    this.socket.emit('toggle_public_view', { roomId });
  }

  // Méthodes pour les événements du jeu
  joinGame(gameId) {
    this.ensureConnection();
    this.socket.emit('joinGame', { gameId });
  }

  leaveGame(gameId) {
    this.ensureConnection();
    this.socket.emit('leaveGame', { gameId });
  }

  startGame(gameId) {
    this.ensureConnection();
    this.socket.emit('startGame', { gameId });
  }

  makeMove(gameId, move) {
    this.ensureConnection();
    this.socket.emit('makeMove', { gameId, move });
  }

  // Écouteurs d'événements
  onGameUpdate(callback) {
    this.ensureConnection();
    this.socket.on('gameUpdate', callback);
  }

  onPlayerJoined(callback) {
    this.ensureConnection();
    this.socket.on('playerJoined', callback);
  }

  onPlayerLeft(callback) {
    this.ensureConnection();
    this.socket.on('playerLeft', callback);
  }

  onGameStarted(callback) {
    this.ensureConnection();
    this.socket.on('gameStarted', callback);
  }

  onGameEnded(callback) {
    this.ensureConnection();
    this.socket.on('gameEnded', callback);
  }

  onRoomsUpdate(callback) {
    this.ensureConnection();
    this.socket.on('rooms_update', callback);
  }

  onActiveGamesUpdate(callback) {
    this.ensureConnection();
    this.socket.on('active_games_update', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

export const socketService = new SocketService(); 