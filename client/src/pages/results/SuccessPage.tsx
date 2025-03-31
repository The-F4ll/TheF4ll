import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { GameContext } from "../../context/GameContext";
import Button from "../../components/common/Button";

const SuccessPage = () => {
  const { gameStats, resetGame } = useContext(GameContext);

  useEffect(() => {
    // Effet de confettis ou animation de célébration
    const confetti = () => {
      // Logique pour les confettis (utiliserait une librairie dans un vrai projet)
      console.log("Confetti effect activated");
    };

    confetti();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-indigo-900 to-purple-900">
      <div className="w-full max-w-lg p-8 bg-gray-800 bg-opacity-80 rounded-lg text-center">
        <h1 className="text-6xl font-bold mb-8 text-green-400">Victoire!</h1>
        <p className="text-xl mb-6">
          Félicitations! Vous avez réussi à vous échapper!
        </p>

        <div className="mb-8 p-4 bg-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
          <ul className="space-y-2 text-left">
            <li>Temps total: {gameStats?.totalTime || "00:00"}</li>
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

export default SuccessPage;
