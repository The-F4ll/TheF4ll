import React, { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import { ROOM_STATUS } from '../config/constants';

const Dashboard = ({ onJoinRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    activePlayers: 0,
    gamesInProgress: 0
  });

  useEffect(() => {
    socketService.getRooms((roomsList) => {
      setRooms(roomsList);
      updateStats(roomsList);
    });
    socketService.getActiveGames((gamesList) => {
      setActiveGames(gamesList);
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const updateStats = (roomsList) => {
    const totalPlayers = roomsList.reduce((acc, room) => acc + room.players.length, 0);
    const gamesInProgress = roomsList.filter(room => room.status === ROOM_STATUS.PLAYING).length;

    setStats({
      totalRooms: roomsList.length,
      activePlayers: totalPlayers,
      gamesInProgress
    });
  };

  const handleJoinRoom = (roomId) => {
    socketService.joinGame(roomId);
    onJoinRoom(roomId);
  };

  const handleCreateRoom = () => {
    socketService.createRoom();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Salles totales</h3>
          <p className="text-3xl font-bold text-blue-500">{stats.totalRooms}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Joueurs actifs</h3>
          <p className="text-3xl font-bold text-green-500">{stats.activePlayers}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Parties en cours</h3>
          <p className="text-3xl font-bold text-purple-500">{stats.gamesInProgress}</p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleCreateRoom}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
          >
            <span className="mr-2">➕</span>
            Créer une nouvelle salle
          </button>
        </div>
      </div>

      {/* Salles disponibles */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Salles disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Salle {room.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {room.players.length} / 4 joueurs
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  room.status === ROOM_STATUS.WAITING
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {room.status === ROOM_STATUS.WAITING ? "En attente" : "En cours"}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {room.players.map((player) => (
                    <span
                      key={player.id}
                      className="bg-white text-gray-700 px-2 py-1 rounded-full text-sm shadow-sm"
                    >
                      {player.name}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={room.players.length >= 4 || room.status !== ROOM_STATUS.WAITING}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    room.players.length >= 4 || room.status !== ROOM_STATUS.WAITING
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  Rejoindre la salle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 