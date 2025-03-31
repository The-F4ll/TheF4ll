import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { joinRoom, socket } = useGame();
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Veuillez entrer votre nom');
      return;
    }
    if (!roomId.trim()) {
      setError('Veuillez entrer un ID de partie');
      return;
    }
    joinRoom(roomId, playerName);
    navigate(`/player?room=${roomId}&name=${encodeURIComponent(playerName)}`);
  };

  const createNewRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">TheF4ll</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-300 mb-2">
              Votre nom
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez votre nom"
              required
            />
          </div>

          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-300 mb-2">
              ID de la partie
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez l'ID de la partie"
                required
              />
              <button
                type="button"
                onClick={createNewRoom}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Nouvelle partie
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Rejoindre la partie
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">Ou visitez le dashboard pour voir les parties en cours</p>
          <a
            href="/dashboard"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Voir le dashboard →
          </a>
        </div>
      </div>
    </div>
  );
} 