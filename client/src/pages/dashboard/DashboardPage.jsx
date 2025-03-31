import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { socketService } from '../../services/socket';

function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  const [publicView, setPublicView] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomId, setNewRoomId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialiser la connexion
    socketService.connect();

    // Écouter l'état de la connexion
    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
    };

    // Vérifier la connexion toutes les secondes
    const connectionInterval = setInterval(checkConnection, 1000);

    // Écouter les mises à jour des salles
    socketService.onRoomsUpdate((roomsData) => {
      setRooms(roomsData);
      // Si une nouvelle salle a été créée, afficher son ID
      if (roomsData.length > rooms.length) {
        const newRoom = roomsData[roomsData.length - 1];
        setNewRoomId(newRoom.id);
      }
    });

    // Écouter les mises à jour des parties actives
    socketService.onActiveGamesUpdate((gamesData) => {
      setActiveGames(gamesData);
    });

    // Demander les données initiales une fois connecté
    if (socketService.isConnected()) {
      socketService.getRooms();
      socketService.getActiveGames();
    }

    return () => {
      clearInterval(connectionInterval);
      socketService.socket?.off('rooms_update');
      socketService.socket?.off('active_games_update');
    };
  }, []);

  // Demander les données quand la connexion est établie
  useEffect(() => {
    if (isConnected) {
      socketService.getRooms();
      socketService.getActiveGames();
    }
  }, [isConnected]);

  const handleCreateRoom = () => {
    if (isConnected) {
      socketService.createRoom();
      setShowCreateModal(true);
    }
  };

  const deleteRoom = (roomId) => {
    if (isConnected) {
      socketService.deleteRoom(roomId);
    }
  };

  const togglePublicView = (roomId) => {
    if (isConnected) {
      socketService.togglePublicView(roomId);
      setPublicView(!publicView);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard TheF4ll</h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </span>
            <button
              onClick={handleCreateRoom}
              disabled={!isConnected}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Créer une nouvelle partie
            </button>
          </div>
        </div>

        {/* Parties actives */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Parties en cours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGames.map((game) => (
              <div
                key={game.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Partie #{game.id}</h3>
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                    En cours
                  </span>
                </div>
                <div className="space-y-2">
                  <p>Niveau: {game.currentLevel}</p>
                  <p>Joueurs: {game.players.length}/4</p>
                  <p>Temps restant: {game.timeRemaining}s</p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => togglePublicView(game.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                  >
                    {publicView ? 'Désactiver' : 'Activer'} la vue publique
                  </button>
                  <button
                    onClick={() => deleteRoom(game.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salles disponibles */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Salles disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Salle #{room.id}</h3>
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">
                    En attente
                  </span>
                </div>
                <div className="space-y-2">
                  <p>Joueurs: {room.players.length}/4</p>
                  <p>Statut: {room.status}</p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Détails
                  </button>
                  <button
                    onClick={() => deleteRoom(room.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Détails de la salle #{selectedRoom.id}</h2>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Joueurs</h3>
                <ul className="space-y-2">
                  {selectedRoom.players.map((player) => (
                    <li key={player.id} className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>Joueur {player.id}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Statistiques</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Niveau actuel</p>
                    <p className="text-xl">{selectedRoom.currentLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Temps restant</p>
                    <p className="text-xl">{selectedRoom.timeRemaining}s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de partie */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Nouvelle partie créée</h2>
            <p className="text-gray-300 mb-4">ID de la partie :</p>
            <div className="bg-gray-700 p-3 rounded-lg mb-4">
              <code className="text-yellow-500 text-lg">{newRoomId}</code>
            </div>
            <p className="text-gray-300 mb-4">Partagez cet ID avec les autres joueurs pour qu'ils puissent rejoindre la partie.</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage; 