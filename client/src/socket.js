import { io } from 'socket.io-client';

export const socket = io('http://localhost:3001', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

// Gestion des événements de connexion
socket.on('connect', () => {
  console.log('Connecté au serveur Socket.IO');
});

socket.on('connect_error', (error) => {
  console.error('Erreur de connexion Socket.IO:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Déconnecté du serveur Socket.IO:', reason);
});

export default socket; 