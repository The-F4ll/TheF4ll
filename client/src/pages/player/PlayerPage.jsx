import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGame } from '../../contexts/GameContext';

export default function PlayerPage() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('room');
  const playerName = searchParams.get('name');
  const { 
    currentPlayer, 
    players, 
    stage, 
    gameOver, 
    messages,
    currentLevel,
    timeElapsed,
    timeLimit,
    completed,
    joinRoom, 
    submitCode, 
    setPlayerReady,
    startGame,
    sendMessage
  } = useGame();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (roomId && playerName && !hasJoinedRef.current) {
      hasJoinedRef.current = true;
      joinRoom(roomId, playerName);
    }
  }, [roomId, playerName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      submitCode(roomId, code);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(roomId, message);
      setMessage('');
    }
  };

  const handleReady = () => {
    setPlayerReady(roomId);
  };

  const handleStartGame = () => {
    startGame(roomId);
  };

  const currentPlayerData = players[currentPlayer];
  const timeLeft = Math.max(0, timeLimit - timeElapsed);
  const progress = (timeElapsed / timeLimit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">Partie #{roomId}</h1>
                  <p className="text-gray-400">Niveau {currentLevel}</p>
                </div>
                <div className="flex items-center space-x-4">
                  {!currentPlayerData?.ready && (
                    <button
                      onClick={handleReady}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Je suis prêt
                    </button>
                  )}
                  {currentPlayerData?.ready && !currentPlayerData?.socketId && (
                    <span className="text-yellow-500">En attente des autres grimpeurs...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Temps restant</span>
                  <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Éditeur de code */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 bg-gray-900 text-white p-4 rounded-lg font-mono"
                placeholder="Votre code ici..."
              />
              <button
                onClick={handleSubmit}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Soumettre
              </button>
            </div>
          </div>

          {/* Zone latérale */}
          <div className="space-y-6">
            {/* Liste des joueurs */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Grimpeurs</h2>
              <div className="space-y-2">
                {Object.values(players).map((player) => (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      player.id === currentPlayer ? 'bg-yellow-500/20' : 'bg-gray-700/50'
                    }`}
                  >
                    <span className="text-white">{player.name}</span>
                    {player.ready ? (
                      <span className="text-green-500">✓</span>
                    ) : (
                      <span className="text-gray-500">...</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Chat</h2>
              <div className="h-64 overflow-y-auto mb-4 space-y-2">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`p-2 rounded ${
                      msg.playerId === currentPlayer ? 'bg-blue-500/20 ml-4' : 'bg-gray-700/50 mr-4'
                    }`}
                  >
                    <div className="text-sm text-gray-400">{msg.playerName}</div>
                    <div className="text-white">{msg.message}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg"
                  placeholder="Votre message..."
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>

        {gameOver && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-red-900/90 text-white p-8 rounded-lg text-center transform scale-110 animate-pulse border border-red-700">
              <h2 className="text-2xl font-bold mb-4">Partie terminée</h2>
              <p className="text-xl">Un ou plusieurs grimpeurs ont échoué</p>
            </div>
          </div>
        )}

        {completed && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-green-900/90 text-white p-8 rounded-lg text-center transform scale-110 animate-pulse border border-green-700">
              <h2 className="text-2xl font-bold mb-4">Félicitations !</h2>
              <p className="text-xl">Vous avez atteint le sommet du Mont Seraph !</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 