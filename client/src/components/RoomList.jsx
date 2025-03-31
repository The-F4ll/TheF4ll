import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../services/socketService';
import { playerService } from '../services/playerService';
import { SOCKET_EVENTS } from '../config/constants';
import PlayerNameModal from './PlayerNameModal';
import RoomCard from './RoomCard';

const RoomList = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const initializePlayer = async () => {
      try {
        const savedPlayer = playerService.getPlayer();
        console.log('👤 Joueur trouvé:', savedPlayer);

        if (!savedPlayer || !savedPlayer.name) {
          console.log('Aucun joueur trouvé, affichage du modal');
          setShowNameModal(true);
          setIsLoading(false);
          return;
        }

        setPlayer(savedPlayer);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du joueur:', error);
        setError('Erreur lors de l\'initialisation du joueur');
        setIsLoading(false);
      }
    };

    initializePlayer();
  }, []);

  useEffect(() => {
    if (!player) return;

    const setupSocket = () => {
      try {
        socketService.setPlayerName(player.name);
        socketService.playerId = player.id;
        socketService.connect();
        setIsSocketReady(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du socket:', error);
        setError('Erreur de connexion au serveur');
      }
    };

    setupSocket();

    return () => {
      if (socketService.socket) {
        socketService.disconnect();
      }
    };
  }, [player]);

  useEffect(() => {
    if (!isSocketReady || !socketService.socket) return;

    const handleRoomsUpdate = (updatedRooms) => {
      console.log('📋 Liste des salles mise à jour:', updatedRooms);
      setRooms(updatedRooms);
    };

    const handleError = (error) => {
      console.error('❌ Erreur reçue:', error);
      setError(error.message || 'Une erreur est survenue');
    };

    const handleRoomCreated = ({ roomId }) => {
      console.log('🎮 Salle créée, redirection vers:', roomId);
      navigate(`/room/${roomId}`);
    };

    socketService.onRoomsList(handleRoomsUpdate);
    socketService.onError(handleError);
    socketService.on(SOCKET_EVENTS.ROOM_CREATED, handleRoomCreated);

    // Demander la liste des salles
    socketService.getRooms(handleRoomsUpdate);

    return () => {
      socketService.removeListener(SOCKET_EVENTS.ROOMS_UPDATE);
      socketService.removeListener(SOCKET_EVENTS.ERROR);
      socketService.removeListener(SOCKET_EVENTS.ROOM_CREATED);
    };
  }, [isSocketReady]);

  const handlePlayerNameSubmit = async (name) => {
    try {
      console.log('Création du joueur avec le nom:', name);
      const newPlayer = playerService.initializePlayer(name);
      console.log('Joueur créé:', newPlayer);
      setPlayer(newPlayer);
      setShowNameModal(false);
      socketService.setPlayerName(name);
      socketService.connect();
    } catch (error) {
      console.error('Erreur lors de la création du joueur:', error);
      setError('Erreur lors de la création du joueur');
    }
  };

  const handleJoinRoom = (roomId) => {
    if (!player) {
      setError('Veuillez d\'abord définir votre nom');
      return;
    }
    navigate(`/room/${roomId}`);
  };

  const handleCreateRoom = () => {
    if (!player) {
      setError('Veuillez d\'abord définir votre nom');
      return;
    }
    if (!socketService.socket?.connected) {
      setError('Connexion au serveur perdue. Tentative de reconnexion...');
      socketService.connect();
      return;
    }
    try {
      socketService.createRoom();
    } catch (error) {
      console.error('Erreur lors de la création de la salle:', error);
      setError('Erreur lors de la création de la salle');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {showNameModal && (
        <PlayerNameModal
          onSubmit={handlePlayerNameSubmit}
          onClose={() => setShowNameModal(false)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Salles disponibles</h1>
          <button
            onClick={handleCreateRoom}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Créer une salle
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={() => handleJoinRoom(room.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomList; 