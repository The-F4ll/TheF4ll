import React, { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import { ROOM_STATUS } from '../config/constants';

const GameRoom = ({ roomId, onLeaveRoom }) => {
  const [room, setRoom] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socketService.connect();
    socketService.getRooms((roomsList) => {
      const currentRoom = roomsList.find(r => r.id === roomId);
      if (currentRoom) {
        setRoom(currentRoom);
      }
    });

    socketService.onGameStarted(({ gameId }) => {
      if (gameId === roomId) {
        setGameStarted(true);
      }
    });

    socketService.onGameUpdate((updatedRoom) => {
      if (updatedRoom.id === roomId) {
        setRoom(updatedRoom);
      }
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [roomId]);

  const handleLeaveRoom = () => {
    socketService.leaveGame(roomId);
    onLeaveRoom();
  };

  const handleStartGame = () => {
    socketService.startGame(roomId);
  };

  const handleMakeMove = (move) => {
    socketService.makeMove(roomId, move);
  };

  if (!room) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Salle {room.id}</h2>
            <p className="text-sm text-gray-600">
              {room.players.length} / 4 joueurs
            </p>
          </div>
          <button
            onClick={handleLeaveRoom}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Quitter la salle
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Liste des joueurs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Joueurs</h3>
            <div className="space-y-2">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    {player.name.charAt(0)}
                  </div>
                  <span className="text-gray-700">{player.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zone de jeu */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Zone de jeu</h3>
            {!gameStarted ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-600 mb-4">En attente du début de la partie...</p>
                {room.players.length >= 2 && (
                  <button
                    onClick={handleStartGame}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Démarrer la partie
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 h-64">
                {/* Grille de jeu */}
                {Array(9).fill(null).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleMakeMove(index)}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center text-2xl font-bold"
                  >
                    {/* Contenu de la case */}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informations de la partie */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-600">Niveau</h4>
            <p className="text-2xl font-bold text-gray-800">{room.currentLevel}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-600">Temps restant</h4>
            <p className="text-2xl font-bold text-gray-800">{room.timeRemaining}s</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-600">Statut</h4>
            <p className={`text-2xl font-bold ${
              room.status === ROOM_STATUS.WAITING
                ? "text-green-500"
                : "text-blue-500"
            }`}>
              {room.status === ROOM_STATUS.WAITING ? "En attente" : "En cours"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom; 