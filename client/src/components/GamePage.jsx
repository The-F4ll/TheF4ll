import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socketService';
import { playerService } from '../services/playerService';
import { SOCKET_EVENTS } from '../config/constants';

const GamePage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const player = playerService.getPlayer();
  const socketRef = useRef(null);
  const joinAttemptRef = useRef(false);

  const setLoadingState = useCallback((loading, errorMessage = null) => {
    setIsLoading(loading);
    if (errorMessage) {
      setError(errorMessage);
    }
  }, []);

  const handleGameUpdate = useCallback((updatedRoom) => {
    console.log('📋 Mise à jour de la salle:', updatedRoom);
    if (updatedRoom.id === roomId) {
      setRoom(updatedRoom);
      setLoadingState(false);
    }
  }, [roomId, setLoadingState]);

  const handleError = useCallback((error) => {
    console.error('❌ Erreur reçue:', error);
    setLoadingState(false, error.message || 'Une erreur est survenue');
  }, [setLoadingState]);

  const handleRoomsUpdate = useCallback((rooms) => {
    console.log('📋 Liste des salles reçue:', rooms);
    const currentRoom = rooms.find(r => r.id === roomId);
    if (currentRoom) {
      setRoom(currentRoom);
      setLoadingState(false);
    } else {
      setLoadingState(false, 'Salle non trouvée');
    }
  }, [roomId, setLoadingState]);

  const handleRoomUpdate = useCallback((updatedRoom) => {
    console.log('📋 Mise à jour de la salle spécifique:', updatedRoom);
    if (updatedRoom.id === roomId) {
      setRoom(updatedRoom);
      setLoadingState(false);
    }
  }, [roomId, setLoadingState]);

  const handleJoinResponse = useCallback((response) => {
    console.log('📥 Réponse de connexion reçue:', response);
    if (!response.success) {
      setLoadingState(false, response.error || 'Échec de la connexion à la salle');
    }
  }, [setLoadingState]);

  const handleGameStarted = useCallback((gameData) => {
    console.log('🎮 Partie démarrée:', gameData);
    setLoadingState(false);
    navigate(`/game/${roomId}`);
  }, [roomId, navigate, setLoadingState]);

  const handlePlayerJoined = useCallback((playerData) => {
    console.log('👤 Nouveau joueur rejoint:', playerData);
    if (room) {
      setRoom(prevRoom => ({
        ...prevRoom,
        players: [...prevRoom.players, playerData]
      }));
    }
  }, [room]);

  const handlePlayerLeft = useCallback((playerData) => {
    console.log('👋 Joueur parti:', playerData);
    if (room) {
      setRoom(prevRoom => ({
        ...prevRoom,
        players: prevRoom.players.filter(p => p.id !== playerData.id)
      }));
    }
  }, [room]);

  const joinRoom = useCallback(() => {
    if (!socketRef.current?.connected || joinAttemptRef.current) return;

    console.log('🎮 Tentative de connexion à la salle:', roomId);
    joinAttemptRef.current = true;

    // Demander la liste des salles pour vérifier si la salle existe
    socketService.getRooms(handleRoomsUpdate);

    // Demander les informations de la salle spécifique
    socketService.getRoom(roomId, handleRoomUpdate);

    // Rejoindre la salle
    socketService.joinGame(roomId, player);

    // Réinitialiser le flag après 5 secondes
    setTimeout(() => {
      joinAttemptRef.current = false;
    }, 5000);
  }, [roomId, player, handleRoomsUpdate, handleRoomUpdate]);

  // Effet pour la gestion du socket
  useEffect(() => {
    if (!player) {
      navigate('/');
      return;
    }

    // Initialiser le socket si nécessaire
    if (!socketService.socket?.connected) {
      socketService.setPlayerName(player.name);
      socketService.playerId = player.id;
      socketService.connect();
    }

    // Stocker la référence du socket
    socketRef.current = socketService.socket;

    return () => {
      if (socketService.currentRoomId === roomId) {
        socketService.leaveGame(roomId);
      }
    };
  }, [player, navigate, roomId]);

  // Effet pour la gestion des événements
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;

    // Réinitialiser l'état de chargement
    setLoadingState(true);

    // Fonction pour nettoyer les listeners
    const cleanup = () => {
      if (!socket) return;
      
      // Supprimer tous les listeners
      socket.off(SOCKET_EVENTS.GAME_UPDATE);
      socket.off(SOCKET_EVENTS.ERROR);
      socket.off(SOCKET_EVENTS.ROOMS_UPDATE);
      socket.off(SOCKET_EVENTS.ROOM_UPDATE);
      socket.off(SOCKET_EVENTS.JOIN_GAME_RESPONSE);
      socket.off(SOCKET_EVENTS.GAME_STARTED);
      socket.off(SOCKET_EVENTS.PLAYER_JOINED);
      socket.off(SOCKET_EVENTS.PLAYER_LEFT);
    };

    // Ajouter les listeners
    socket.on(SOCKET_EVENTS.GAME_UPDATE, handleGameUpdate);
    socket.on(SOCKET_EVENTS.ERROR, handleError);
    socket.on(SOCKET_EVENTS.ROOMS_UPDATE, handleRoomsUpdate);
    socket.on(SOCKET_EVENTS.ROOM_UPDATE, handleRoomUpdate);
    socket.on(SOCKET_EVENTS.JOIN_GAME_RESPONSE, handleJoinResponse);
    socket.on(SOCKET_EVENTS.GAME_STARTED, handleGameStarted);
    socket.on(SOCKET_EVENTS.PLAYER_JOINED, handlePlayerJoined);
    socket.on(SOCKET_EVENTS.PLAYER_LEFT, handlePlayerLeft);

    // Vérifier si on est déjà dans la salle
    if (socketService.currentRoomId !== roomId) {
      joinRoom();
    }

    // Timeout de chargement
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setLoadingState(false, 'Timeout de chargement de la salle');
      }
    }, 10000);

    return () => {
      clearTimeout(loadingTimeout);
      cleanup();
    };
  }, [roomId, player, isLoading, handleGameUpdate, handleError, handleRoomsUpdate, handleRoomUpdate, handleJoinResponse, handleGameStarted, handlePlayerJoined, handlePlayerLeft, setLoadingState, joinRoom]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour à la liste des salles
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Salle non trouvée
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour à la liste des salles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Salle {room.id}</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retour à la liste des salles
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Joueurs ({room.players.length}/4)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="bg-gray-50 p-4 rounded-lg text-center"
              >
                <p className="font-medium">{player.name}</p>
              </div>
            ))}
          </div>

          {room.players.length >= 2 && room.status === 'waiting' && (
            <button
              onClick={() => socketService.startGame(room.id)}
              className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Démarrer la partie
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePage;

 