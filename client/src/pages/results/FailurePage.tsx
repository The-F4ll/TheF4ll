import { useContext } from "react";
import { Link } from "react-router-dom";
import { GameContext } from "../../context/GameContext";
import Button from "../../components/common/Button";

const FailurePage = () => {
  const { gameStats, resetGame } = useContext(GameContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-red-900 to-gray-900">
      <div className="w-full max-w-lg p-8 bg-gray-800 bg-opacity-80 rounded-lg text-center">
        <h1 className="text-6xl font-bold mb-8 text-red-500">Échec</h1>
        <p className="text-xl mb-6">
          Vous n'avez pas réussi à vous échapper à temps...
        </p>

        <div className="mb-8 p-4 bg-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
          <ul className="space-y-2 text-left">
            <li>Temps écoulé: {gameStats?.totalTime || "00:00"}</li>
            <li>Questions résolues: {gameStats?.questionsAnswered || 0}</li>
            <li>Indices utilisés: {gameStats?.hintsUsed || 0}</li>
            <li>Pénalités reçues: {gameStats?.penaltiesReceived || 0}</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link to="/" className="block">
            <Button variant="primary" fullWidth onClick={resetGame}>
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FailurePage;
