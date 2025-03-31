import { SOCKET_EVENTS } from '../config/constants.js';
import { 
  createNewRoom, 
  getRooms, 
  joinRoom, 
  leaveRoom, 
  startGame, 
  updateGameState,
  deleteRoom,
  togglePublicView,
  getActiveGames
} from '../services/roomService.js';

export const handleSocketConnection = (io) => {
  // Map pour stocker les connexions actives par playerId
  const activeConnections = new Map();
  // Map pour stocker les salles par playerId
  const playerRooms = new Map();

  io.on('connection', (socket) => {
    console.log('🔌 Nouveau client connecté:', socket.id);

    // Gestion de l'identification du joueur
    socket.on('player_identify', ({ playerId, playerName }) => {
      try {
        if (!playerName || playerName.trim() === '') {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Le pseudo ne peut pas être vide' });
          return;
        }

        // Stocker les informations du joueur dans le socket
        socket.playerId = playerId || socket.id;
        socket.playerName = playerName.trim();
        activeConnections.set(socket.playerId, socket.id);

        console.log(`👤 Joueur identifié: ${socket.playerName} (${socket.playerId})`);
      } catch (error) {
        console.error('❌ Erreur lors de l\'identification du joueur:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    // Gestion des salles
    socket.on(SOCKET_EVENTS.GET_ROOMS, () => {
      try {
        const rooms = getRooms();
        socket.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des salles:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    socket.on(SOCKET_EVENTS.GET_ROOM, ({ roomId }) => {
      try {
        const rooms = getRooms();
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          socket.emit(SOCKET_EVENTS.ROOM_UPDATE, room);
        } else {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Salle non trouvée' });
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération de la salle:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    socket.on(SOCKET_EVENTS.CREATE_ROOM, ({ playerId, playerName }) => {
      try {
        if (!playerId || !playerName) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Informations du joueur manquantes' });
          return;
        }

        // Vérifier si le joueur est déjà dans une salle
        const currentRoomId = playerRooms.get(playerId);
        if (currentRoomId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Vous êtes déjà dans une salle' });
          return;
        }

        // Créer la nouvelle salle
        const room = createNewRoom(playerId);
        
        // Ajouter le créateur à la salle
        const player = {
          id: playerId,
          name: playerName
        };
        joinRoom(room.id, player);
        
        // Rejoindre le socket à la salle
        socket.join(room.id);
        playerRooms.set(playerId, room.id);

        // Notifier le créateur
        socket.emit(SOCKET_EVENTS.ROOM_CREATED, { 
          roomId: room.id,
          room: room
        });

        // Notifier tous les clients
        io.emit(SOCKET_EVENTS.ROOMS_UPDATE, getRooms());
        io.emit(SOCKET_EVENTS.PLAYER_JOINED, { roomId: room.id, player });
        
        console.log(`🎮 Nouvelle salle créée: ${room.id} par ${playerName}`);
      } catch (error) {
        console.error('❌ Erreur lors de la création de la salle:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    socket.on(SOCKET_EVENTS.JOIN_GAME, ({ roomId, player }) => {
      try {
        if (!roomId || !player) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Informations manquantes' });
          return;
        }

        // Vérifier si le joueur est déjà dans une salle
        const currentRoomId = playerRooms.get(player.id);
        if (currentRoomId && currentRoomId !== roomId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Vous êtes déjà dans une salle' });
          return;
        }

        // Rejoindre la salle
        const updatedRoom = joinRoom(roomId, player);
        socket.join(roomId);
        playerRooms.set(player.id, roomId);

        // Envoyer la réponse de succès
        socket.emit(SOCKET_EVENTS.JOIN_GAME_RESPONSE, { 
          success: true, 
          room: updatedRoom 
        });

        // Notifier les autres clients
        io.to(roomId).emit(SOCKET_EVENTS.GAME_UPDATE, updatedRoom);
        io.emit(SOCKET_EVENTS.PLAYER_JOINED, { roomId, player });
        io.emit(SOCKET_EVENTS.ROOMS_UPDATE, getRooms());
        
        console.log(`👤 ${player.name} a rejoint la salle ${roomId}`);
      } catch (error) {
        console.error('❌ Erreur lors de la connexion à la salle:', error);
        socket.emit(SOCKET_EVENTS.JOIN_GAME_RESPONSE, { 
          success: false, 
          error: error.message 
        });
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_GAME, ({ roomId }) => {
      try {
        if (!roomId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'ID de salle manquant' });
          return;
        }

        const player = socket.playerId;
        const room = leaveRoom(roomId, player);
        
        socket.leave(roomId);
        playerRooms.delete(player);

        // Notifier les autres clients
        io.to(roomId).emit(SOCKET_EVENTS.GAME_UPDATE, room);
        io.emit(SOCKET_EVENTS.PLAYER_LEFT, { roomId, player });
        io.emit(SOCKET_EVENTS.ROOMS_UPDATE, getRooms());

        console.log(`👋 Joueur ${player} a quitté la salle ${roomId}`);
      } catch (error) {
        console.error('❌ Erreur lors de la déconnexion de la salle:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    socket.on(SOCKET_EVENTS.START_GAME, ({ roomId }) => {
      try {
        if (!roomId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'ID de salle manquant' });
          return;
        }

        const room = startGame(roomId);
        
        // Notifier tous les clients dans la salle
        io.to(roomId).emit(SOCKET_EVENTS.GAME_STARTED, { 
          gameId: roomId,
          gameState: room.gameState 
        });
        io.to(roomId).emit(SOCKET_EVENTS.GAME_UPDATE, room);
        io.emit(SOCKET_EVENTS.ROOMS_UPDATE, getRooms());

        console.log(`🎯 Partie démarrée dans la salle ${roomId}`);
      } catch (error) {
        console.error('❌ Erreur lors du démarrage de la partie:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    socket.on(SOCKET_EVENTS.MAKE_MOVE, ({ roomId, move }) => {
      try {
        if (!roomId || !move) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'Données de mouvement manquantes' });
          return;
        }
        const room = updateGameState(roomId, move);
        io.to(roomId).emit(SOCKET_EVENTS.GAME_UPDATE, room);
        console.log(`🎲 Coup joué dans la salle ${roomId}`);
      } catch (error) {
        console.error('❌ Erreur lors du coup joué:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    socket.on(SOCKET_EVENTS.DELETE_ROOM, ({ roomId }) => {
      try {
        if (!roomId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'ID de salle manquant' });
          return;
        }
        deleteRoom(roomId, socket.playerId);
        io.emit(SOCKET_EVENTS.ROOMS_UPDATE, getRooms());
        console.log(`✅ Salle supprimée: ${roomId}`);
      } catch (error) {
        console.error('❌ Erreur lors de la suppression de la salle:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    socket.on(SOCKET_EVENTS.TOGGLE_PUBLIC_VIEW, ({ roomId }) => {
      try {
        if (!roomId) {
          socket.emit(SOCKET_EVENTS.ERROR, { message: 'ID de salle manquant' });
          return;
        }
        const room = togglePublicView(roomId, socket.playerId);
        io.emit(SOCKET_EVENTS.ROOMS_UPDATE, getRooms());
        console.log(`✅ Visibilité de la salle ${roomId} changée: ${room.isPublic ? 'public' : 'privé'}`);
      } catch (error) {
        console.error('❌ Erreur lors du changement de visibilité:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    socket.on(SOCKET_EVENTS.GET_ACTIVE_GAMES, () => {
      try {
        const activeGames = getActiveGames();
        socket.emit(SOCKET_EVENTS.ACTIVE_GAMES_UPDATE, activeGames);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des parties actives:', error);
        socket.emit(SOCKET_EVENTS.ERROR, { message: error.message });
      }
    });

    // Gestion de la déconnexion
    socket.on('disconnect', () => {
      try {
        const playerId = socket.playerId;
        if (playerId) {
          const roomId = playerRooms.get(playerId);
          if (roomId) {
            const room = leaveRoom(roomId, playerId);
            io.to(roomId).emit(SOCKET_EVENTS.GAME_UPDATE, room);
            io.emit(SOCKET_EVENTS.PLAYER_LEFT, { roomId, player: { id: playerId } });
            io.emit(SOCKET_EVENTS.ROOMS_UPDATE, getRooms());
          }
          playerRooms.delete(playerId);
          activeConnections.delete(playerId);
        }
        console.log(`🔌 Client déconnecté: ${socket.id}`);
      } catch (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
      }
    });

    // Gestion des erreurs Socket.IO
    socket.on('error', (error) => {
      console.error('❌ Erreur Socket.IO:', error);
      if (error.message.includes('parse error')) {
        console.error('❌ Erreur de parsing détectée');
      }
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Erreur de connexion' });
    });
  });
}; 