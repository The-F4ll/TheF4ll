import React, { useState, useContext, useEffect } from "react";
import { SpectatorContext } from "../../context/SpectatorContext";

type VoteSystemProps = {
  roomId: string | undefined;
};

const VoteSystem: React.FC<VoteSystemProps> = ({ roomId }) => {
  const { castVote, currentVote } = useContext(SpectatorContext);
  const [showOptions, setShowOptions] = useState(false);
  const [totalVotes, setTotalVotes] = useState<{ [key: string]: number }>({
    option1: 0,
    option2: 0,
  });

  // Options de vote (50/50)
  const voteOptions = [
    { id: "option1", label: "Option A" },
    { id: "option2", label: "Option B" },
  ];

  // Simuler la récupération et mise à jour des votes
  useEffect(() => {
    if (!roomId) return;

    // Dans une application réelle, cela serait une connexion socket
    const fetchVotes = () => {
      // Simuler des votes aléatoires provenant d'autres spectateurs
      const mockVotes = {
        option1: Math.floor(Math.random() * 10),
        option2: Math.floor(Math.random() * 10),
      };

      // Si l'utilisateur a voté, ajouter son vote
      if (
        currentVote &&
        (currentVote === "option1" || currentVote === "option2")
      ) {
        mockVotes[currentVote] += 1;
      }

      setTotalVotes(mockVotes);
    };

    // Charger les votes au montage
    fetchVotes();

    // Programmer des mises à jour périodiques
    const interval = setInterval(fetchVotes, 5000);

    return () => clearInterval(interval);
  }, [roomId, currentVote]);

  const handleVote = (optionId: string) => {
    if (!roomId) return;

    castVote(optionId);

    // Mettre à jour les votes localement immédiatement
    setTotalVotes((prev) => ({
      ...prev,
      [optionId]: prev[optionId] + 1,
    }));

    setShowOptions(false);

    // Dans une application réelle:
    // socket.emit('cast-vote', { roomId, spectatorId: spectator?.id, optionId });
  };

  // Calcul du pourcentage de votes pour chaque option
  const calculatePercentage = (optionId: string) => {
    const total = totalVotes.option1 + totalVotes.option2;
    if (total === 0) return 0;
    return Math.round((totalVotes[optionId] / total) * 100);
  };

  if (!roomId) return <p className="text-red-500">ID de salle non défini</p>;

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800 bg-opacity-80 rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Mode Spectateur
        </h3>

        {currentVote ? (
          <div className="space-y-4">
            <p className="mb-2 text-center">Vous avez voté pour :</p>
            <div className="inline-block bg-blue-700 px-4 py-2 rounded-lg font-medium mx-auto text-center">
              {voteOptions.find((opt) => opt.id === currentVote)?.label ||
                currentVote}
            </div>

            <div className="mt-6">
              <h4 className="text-sm text-gray-300 mb-2">
                Résultats du vote (Salle {roomId})
              </h4>

              {voteOptions.map((option) => (
                <div key={option.id} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{option.label}</span>
                    <span>
                      {calculatePercentage(option.id)}% ({totalVotes[option.id]}{" "}
                      votes)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        option.id === "option1" ? "bg-blue-600" : "bg-green-600"
                      }`}
                      style={{ width: `${calculatePercentage(option.id)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {showOptions ? (
              <div className="space-y-3">
                <p className="mb-2 text-center">
                  Aidez le joueur avec votre vote :
                </p>
                {voteOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleVote(option.id)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={() => setShowOptions(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition"
                >
                  Voter (50/50)
                </button>

                {(totalVotes.option1 > 0 || totalVotes.option2 > 0) && (
                  <div className="mt-4 text-sm text-gray-400">
                    {totalVotes.option1 + totalVotes.option2} spectateurs ont
                    déjà voté
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-gray-400 text-center">
          {currentVote
            ? "Votre vote aide le joueur à résoudre l'énigme!"
            : "En votant, vous pouvez aider les joueurs à choisir entre deux options."}
        </p>
      </div>
    </div>
  );
};

export default VoteSystem;
