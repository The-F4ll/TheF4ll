import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';

export default function RoomPage() {
  const [searchParams] = useSearchParams();
  const [timeLeft, setTimeLeft] = useState('48:00');
  const { currentRoom, players, stage, gameOver, joinRoom } = useGame();

  useEffect(() => {
    const roomId = searchParams.get('room');
    if (roomId) {
      joinRoom(roomId);
    }
  }, [searchParams, joinRoom]);

  useEffect(() => {
    const endTime = new Date().getTime() + (48 * 60 * 60 * 1000);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft('00:00');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">TheF4ll - Vue Salle</h1>
          <p className="text-gray-600 mt-2">Suivez l'avancement de l'équipe en temps réel</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Progression</h2>
              <div className="flex gap-2 mt-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`flex-1 text-center py-2 rounded ${
                      index < stage
                        ? 'bg-green-500 text-white'
                        : index === stage
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Étape {index + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600">{timeLeft}</div>
          </div>

          {gameOver && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              Partie terminée
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(players).map(([playerId, player]) => (
              <div key={playerId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Joueur {playerId}</h3>
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        !player.socketId
                          ? 'bg-red-500'
                          : player.validated
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                    />
                    <span className="text-sm text-gray-600">
                      {!player.socketId
                        ? 'Hors ligne'
                        : player.validated
                        ? 'Validé'
                        : 'En attente'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-md mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Défi actuel</h4>
                  <p className="text-gray-600">
                    {player.currentChallenge?.description || 'En attente...'}
                  </p>
                </div>

                {player.code && (
                  <div className="bg-gray-900 p-3 rounded-md">
                    <pre className="text-sm text-gray-100 overflow-x-auto">
                      {player.code}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 