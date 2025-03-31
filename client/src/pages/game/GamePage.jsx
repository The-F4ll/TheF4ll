import { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import CodeEditor from '../../components/CodeEditor';
import Mountain from '../../components/Mountain';
import Timer from '../../components/Timer';
import HintPanel from '../../components/HintPanel';

function GamePage() {
  const { gameState, submitCode } = useGame();
  const [code, setCode] = useState('');

  useEffect(() => {
    if (gameState.currentCode) {
      setCode(gameState.currentCode);
    }
  }, [gameState.currentCode]);

  const handleCodeSubmit = () => {
    submitCode(code);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Panneau de gauche - Éditeur de code */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Niveau {gameState.currentLevel}</h1>
          <Timer timeRemaining={gameState.timeRemaining} />
        </div>
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden">
          <CodeEditor
            value={code}
            onChange={setCode}
            language="javascript"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCodeSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            disabled={gameState.isSubmitting}
          >
            {gameState.isSubmitting ? 'Envoi en cours...' : 'Envoyer le code'}
          </button>
        </div>
      </div>

      {/* Panneau de droite - Montagne et indices */}
      <div className="w-1/2 flex flex-col p-4">
        <div className="flex-1 relative">
          <Mountain progress={gameState.mountainProgress} />
        </div>
        <div className="mt-4">
          <HintPanel hints={gameState.hints} />
        </div>
      </div>
    </div>
  );
}

export default GamePage; 