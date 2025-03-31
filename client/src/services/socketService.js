import { io } from 'socket.io-client';
import { SOCKET_EVENTS } from '../config/constants.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
    this.errorHandlers = new Map();
    this.reconnectionAttempts = 0;
    this.maxReconnectionAttempts = 5;
    this.isConnecting = false;
    this.lastCreateRoomAttempt = 0;
    this.createRoomCooldown = 2000; // 2 secondes de cooldown
    this.currentRoomId = null;
    this.isAuthenticated = false;
    this.pendingConnection = false;
    this.playerName = null;
    this.connectionTimeout = null;
    this.playerId = null;
    this.reconnectTimeout = null;
    this.isReconnecting = false;
  }

  setPlayerName(name) {
    if (!name || name.trim() === '') {
      this.emitError('Le pseudo ne peut pas être vide');
      return false;
    }
    this.playerName = name.trim();
    this.isAuthenticated = true;
    
    // Si une connexion est en attente, la lancer
    if (this.pendingConnection) {
      this.pendingConnection = false;
      this.connect();
    }
    
    return true;
  }

  connect() {
    if (this.socket?.connected || this.isConnecting) return;

    // Vérifier si le joueur a un pseudo
    if (!this.playerName) {
      this.pendingConnection = true;
      this.emitError('Veuillez définir un pseudo avant de vous connecter');
      return;
    }

    this.isConnecting = true;
    try {
      // Nettoyer l'ancienne connexion si elle existe
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
      }

      this.socket = io('http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectionAttempts,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true,
        autoConnect: true,
        withCredentials: false,
        auth: {
          playerName: this.playerName
        }
      });

      this.setupSocketListeners();

      // Timeout de connexion
      this.connectionTimeout = setTimeout(() => {
        if (!this.connected) {
          console.error('❌ Timeout de connexion');
          this.emitError('Timeout de connexion au serveur');
          this.handleReconnect();
        }
      }, 10000);

    } catch (error) {
      console.error('Erreur lors de la création du socket:', error);
      this.emitError('Erreur de connexion au serveur');
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connecté au serveur Socket.IO');
      this.connected = true;
      this.reconnectionAttempts = 0;
      this.isConnecting = false;
      this.isAuthenticated = true;
      this.isReconnecting = false;
      
      // Nettoyer les timeouts
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Envoyer l'identifiant du joueur au serveur
      this.socket.emit('player_identify', {
        playerId: this.playerId,
        playerName: this.playerName
      });

      // Si on était dans une salle, la rejoindre à nouveau
      if (this.currentRoomId) {
        this.joinGame(this.currentRoomId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Déconnecté du serveur:', reason);
      this.connected = false;
      this.isConnecting = false;
      
      if (reason === 'io server disconnect') {
        this.emitError('Déconnecté du serveur');
        this.handleReconnect();
      } else if (reason === 'transport close') {
        this.emitError('Connexion perdue');
        this.handleReconnect();
      } else if (reason === 'parse error') {
        console.error('❌ Erreur de parsing détectée');
        this.emitError('Erreur de communication avec le serveur');
        // Ne pas déconnecter/reconnecter en cas d'erreur de parsing
        // Laisser Socket.IO gérer la reconnexion automatiquement
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion:', error);
      this.emitError('Impossible de se connecter au serveur');
      this.connected = false;
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.reconnectionAttempts = attemptNumber;
      console.log(`🔄 Tentative de reconnexion ${attemptNumber}/${this.maxReconnectionAttempts}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Échec de la reconnexion');
      this.emitError('Impossible de se reconnecter au serveur');
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('❌ Erreur Socket.IO:', error);
      this.emitError('Erreur de connexion');
      this.isConnecting = false;
      this.handleReconnect();
    });

    this.socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('❌ Erreur serveur:', error);
      this.emitError(error.message);
    });

    this.socket.on('reconnect', () => {
      console.log('🔄 Reconnexion réussie');
      this.connected = true;
      this.reconnectionAttempts = 0;
      this.isConnecting = false;
      this.isReconnecting = false;
      
      if (this.playerName) {
        this.socket.emit('player_identify', {
          playerId: this.playerId,
          playerName: this.playerName
        });
      }
    });
  }

  handleReconnect() {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    // Nettoyer les timeouts existants
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Attendre un peu avant de tenter une reconnexion
    this.reconnectTimeout = setTimeout(() => {
      if (!this.connected && !this.isConnecting) {
        console.log('🔄 Tentative de reconnexion...');
        this.connect();
      }
    }, 1000);
  }

  disconnect() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.isConnecting = false;
      this.isReconnecting = false;
    }
  }

  // Gestion des événements
  on(event, callback) {
    if (!this.socket) {
      console.log(`⚠️ Tentative d'ajout d'un listener ${event} sans socket connecté`);
      this.connect();
      return;
    }
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    // Supprimer l'ancien listener s'il existe
    this.removeListener(event, callback);
    
    // Ajouter le nouveau listener
    this.listeners.get(event).add(callback);
    
    // Ajouter le listener au socket avec gestion d'erreur
    const wrappedCallback = (data) => {
      try {
        console.log(`📥 Événement reçu ${event}:`, data);
        callback(data);
      } catch (error) {
        console.error(`❌ Erreur lors du traitement de l'événement ${event}:`, error);
        this.emitError('Erreur lors du traitement de la réponse du serveur');
      }
    };

    this.socket.on(event, wrappedCallback);
  }

  removeListener(event, callback) {
    if (!this.socket) return;
    
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      this.socket.off(event);
    }
  }

  removeAllListeners() {
    if (!this.socket) return;
    
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket.off(event, callback);
      });
    });
    this.listeners.clear();
  }

  // Événements spécifiques
  onRoomsList(callback) {
    this.on(SOCKET_EVENTS.ROOMS_LIST, callback);
  }

  onGameStarted(callback) {
    this.on(SOCKET_EVENTS.GAME_STARTED, callback);
  }

  onGameUpdate(callback) {
    this.on(SOCKET_EVENTS.GAME_UPDATE, callback);
  }

  onPlayerJoined(callback) {
    this.on(SOCKET_EVENTS.PLAYER_JOINED, callback);
  }

  onPlayerLeft(callback) {
    this.on(SOCKET_EVENTS.PLAYER_LEFT, callback);
  }

  onError(callback) {
    this.on(SOCKET_EVENTS.ERROR, callback);
  }

  // Actions
  getRooms(callback) {
    if (!this.socket) {
      this.emitError('Non connecté au serveur');
      return;
    }
    this.removeListener(SOCKET_EVENTS.ROOMS_UPDATE);
    this.socket.on(SOCKET_EVENTS.ROOMS_UPDATE, callback);
    this.socket.emit(SOCKET_EVENTS.GET_ROOMS);
  }

  getRoom(roomId, callback) {
    if (!this.socket) {
      this.emitError('Non connecté au serveur');
      return;
    }
    if (!roomId) {
      this.emitError('ID de salle manquant');
      return;
    }

    // Nettoyer les anciens listeners
    this.removeListener(SOCKET_EVENTS.ROOM_UPDATE);
    this.removeListener(SOCKET_EVENTS.ERROR);

    // Ajouter un timeout pour la réponse
    const roomTimeout = setTimeout(() => {
      this.removeListener(SOCKET_EVENTS.ROOM_UPDATE);
      this.removeListener(SOCKET_EVENTS.ERROR);
      this.emitError('Timeout lors de la récupération des informations de la salle');
      callback(null); // Appeler le callback avec null pour indiquer l'échec
    }, 5000);

    // Ajouter un listener pour les erreurs
    const errorHandler = (error) => {
      clearTimeout(roomTimeout);
      this.removeListener(SOCKET_EVENTS.ROOM_UPDATE);
      this.removeListener(SOCKET_EVENTS.ERROR);
      this.emitError(error.message || 'Erreur lors de la récupération des informations de la salle');
      callback(null);
    };

    // Ajouter un listener pour la mise à jour de la salle
    const roomHandler = (data) => {
      clearTimeout(roomTimeout);
      this.removeListener(SOCKET_EVENTS.ERROR);
      callback(data);
    };

    this.socket.on(SOCKET_EVENTS.ROOM_UPDATE, roomHandler);
    this.socket.on(SOCKET_EVENTS.ERROR, errorHandler);

    // Envoyer la requête
    this.socket.emit(SOCKET_EVENTS.GET_ROOM, { roomId });
  }

  joinGame(roomId, player) {
    if (!this.socket) {
      this.emitError('Non connecté au serveur');
      return;
    }
    if (!roomId) {
      this.emitError('ID de salle manquant');
      return;
    }

    // Si on est déjà dans une salle, la quitter d'abord
    if (this.currentRoomId && this.currentRoomId !== roomId) {
      this.leaveGame(this.currentRoomId);
    }

    const playerData = {
      id: player.id,
      name: this.playerName || player.name || 'Anonyme'
    };

    console.log('🎮 Tentative de connexion à la salle:', { roomId, player: playerData });
    
    // Nettoyer les anciens listeners
    this.removeListener(SOCKET_EVENTS.JOIN_GAME_RESPONSE);
    this.removeListener(SOCKET_EVENTS.ERROR);
    this.removeListener(SOCKET_EVENTS.ROOM_UPDATE);

    // Ajouter un timeout pour la réponse
    const joinTimeout = setTimeout(() => {
      this.removeListener(SOCKET_EVENTS.JOIN_GAME_RESPONSE);
      this.removeListener(SOCKET_EVENTS.ERROR);
      this.removeListener(SOCKET_EVENTS.ROOM_UPDATE);
      this.emitError('Timeout lors de la connexion à la salle');
      this.leaveGame(roomId);
    }, 5000);

    // Ajouter un listener pour les erreurs
    const errorHandler = (error) => {
      clearTimeout(joinTimeout);
      this.removeListener(SOCKET_EVENTS.JOIN_GAME_RESPONSE);
      this.removeListener(SOCKET_EVENTS.ERROR);
      this.removeListener(SOCKET_EVENTS.ROOM_UPDATE);
      this.emitError(error.message || 'Erreur lors de la connexion à la salle');
      this.leaveGame(roomId);
    };

    // Ajouter un listener pour la réponse de connexion
    const joinHandler = (response) => {
      clearTimeout(joinTimeout);
      this.removeListener(SOCKET_EVENTS.ERROR);
      
      if (response.success) {
        console.log('✅ Connecté à la salle:', roomId);
        this.currentRoomId = roomId;
        
        // Ajouter un listener pour les mises à jour de la salle
        const roomHandler = (roomData) => {
          if (roomData && roomData.id === roomId) {
            console.log('📥 Informations de la salle reçues:', roomData);
            this.removeListener(SOCKET_EVENTS.ROOM_UPDATE);
          }
        };

        this.socket.on(SOCKET_EVENTS.ROOM_UPDATE, roomHandler);
        
        // Demander une mise à jour immédiate de la salle
        this.socket.emit(SOCKET_EVENTS.GET_ROOM, { roomId });
      } else {
        console.error('❌ Échec de la connexion à la salle:', response.error);
        this.emitError(response.error || 'Échec de la connexion à la salle');
        this.leaveGame(roomId);
      }
    };

    this.socket.on(SOCKET_EVENTS.JOIN_GAME_RESPONSE, joinHandler);
    this.socket.on(SOCKET_EVENTS.ERROR, errorHandler);

    // Envoyer la requête de connexion
    this.socket.emit(SOCKET_EVENTS.JOIN_GAME, { roomId, player: playerData });
  }

  leaveGame(roomId) {
    if (!this.socket) {
      this.emitError('Non connecté au serveur');
      return;
    }
    if (!roomId) {
      this.emitError('ID de salle manquant');
      return;
    }
    this.socket.emit(SOCKET_EVENTS.LEAVE_GAME, { roomId });
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
  }

  startGame(roomId) {
    if (!this.socket) {
      this.emitError('Non connecté au serveur');
      return;
    }
    if (!roomId) {
      this.emitError('ID de salle manquant');
      return;
    }
    this.socket.emit(SOCKET_EVENTS.START_GAME, { roomId });
  }

  makeMove(roomId, move) {
    if (!this.socket) {
      this.emitError('Non connecté au serveur');
      return;
    }
    if (!roomId || !move) {
      this.emitError('Données de mouvement invalides');
      return;
    }
    this.socket.emit(SOCKET_EVENTS.MAKE_MOVE, { roomId, move });
  }

  // Gestion des salles
  createRoom() {
    if (!this.socket?.connected) {
      this.connect();
    }
    
    if (!this.socket?.connected) {
      this.emitError('Non connecté au serveur');
      return;
    }

    // Vérifier le cooldown
    const now = Date.now();
    if (now - this.lastCreateRoomAttempt < this.createRoomCooldown) {
      this.emitError('Veuillez attendre avant de créer une nouvelle salle');
      return;
    }

    // Si on est déjà dans une salle, la quitter d'abord
    if (this.currentRoomId) {
      this.leaveGame(this.currentRoomId);
    }

    console.log('🎮 Tentative de création d\'une salle');

    try {
      this.lastCreateRoomAttempt = now;
      
      // Nettoyer les anciens listeners
      this.socket.off(SOCKET_EVENTS.ROOM_CREATED);
      this.socket.off(SOCKET_EVENTS.ERROR);

      // Ajouter un timeout pour la réponse
      const createTimeout = setTimeout(() => {
        this.socket.off(SOCKET_EVENTS.ROOM_CREATED);
        this.socket.off(SOCKET_EVENTS.ERROR);
        this.emitError('Timeout lors de la création de la salle');
      }, 5000);

      // Ajouter un listener pour les erreurs
      const errorHandler = (error) => {
        clearTimeout(createTimeout);
        this.socket.off(SOCKET_EVENTS.ROOM_CREATED);
        this.socket.off(SOCKET_EVENTS.ERROR);
        this.emitError(error.message || 'Erreur lors de la création de la salle');
      };

      // Ajouter un listener pour la création de la salle
      const createHandler = (roomData) => {
        clearTimeout(createTimeout);
        this.socket.off(SOCKET_EVENTS.ERROR);
        
        if (roomData && roomData.id) {
          console.log('✅ Salle créée:', roomData);
          this.currentRoomId = roomData.id;
          // Rejoindre automatiquement la salle créée
          this.joinGame(roomData.id, {
            id: this.playerId,
            name: this.playerName
          });
        } else {
          this.emitError('Données de salle invalides reçues');
        }
      };

      this.socket.on(SOCKET_EVENTS.ROOM_CREATED, createHandler);
      this.socket.on(SOCKET_EVENTS.ERROR, errorHandler);

      // Envoyer la requête de création
      this.socket.emit(SOCKET_EVENTS.CREATE_ROOM, {
        playerId: this.playerId,
        playerName: this.playerName
      });
    } catch (error) {
      console.error('❌ Erreur lors de la création de la salle:', error);
      this.emitError('Erreur lors de la création de la salle');
    }
  }

  deleteRoom(roomId) {
    if (!this.socket) {
      this.emitError('Non connecté au serveur');
      return;
    }
    if (!roomId) {
      this.emitError('ID de salle manquant');
      return;
    }
    this.socket.emit(SOCKET_EVENTS.DELETE_ROOM, { roomId });
  }

  togglePublicView(roomId) {
    if (!this.socket) {
      this.emitError('Non connecté au serveur');
      return;
    }
    if (!roomId) {
      this.emitError('ID de salle manquant');
      return;
    }
    this.socket.emit(SOCKET_EVENTS.TOGGLE_PUBLIC_VIEW, { roomId });
  }

  // Gestion des parties
  getActiveGames(callback) {
    if (!this.socket?.connected) {
      this.connect();
    }
    
    if (!this.socket?.connected) {
      this.emitError('Non connecté au serveur');
      return;
    }

    try {
      this.removeListener(SOCKET_EVENTS.ACTIVE_GAMES_UPDATE);
      this.socket.on(SOCKET_EVENTS.ACTIVE_GAMES_UPDATE, callback);
      this.socket.emit(SOCKET_EVENTS.GET_ACTIVE_GAMES);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des parties actives:', error);
      this.emitError('Erreur lors de la récupération des parties actives');
    }
  }

  // Écouteurs d'événements
  onGameStarted(callback) {
    if (!this.socket) this.connect();
    this.removeListener(SOCKET_EVENTS.GAME_STARTED);
    this.socket.on(SOCKET_EVENTS.GAME_STARTED, callback);
  }

  onGameUpdate(callback) {
    if (!this.socket) this.connect();
    this.removeListener(SOCKET_EVENTS.GAME_UPDATE);
    this.socket.on(SOCKET_EVENTS.GAME_UPDATE, callback);
  }

  emitError(message) {
    try {
      const handlers = this.errorHandlers.get(SOCKET_EVENTS.ERROR) || [];
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('❌ Erreur lors de l\'émission de l\'erreur:', error);
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la gestion de l\'erreur:', error);
    }
  }
}

export const socketService = new SocketService(); 