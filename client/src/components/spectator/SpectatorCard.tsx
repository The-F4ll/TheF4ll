import React from "react";
import { Spectator } from "../../types/game.types";

const SpectatorCard: React.FC<{ spectator: Spectator }> = ({ spectator }) => {
  // Générer une couleur pseudo-aléatoire basée sur l'ID du spectateur
  const generateColor = (id: string): string => {
    const colors = [
      "bg-blue-600",
      "bg-purple-600",
      "bg-pink-600",
      "bg-indigo-600",
      "bg-teal-600",
      "bg-green-600",
    ];

    // Utiliser les caractères de l'ID pour sélectionner une couleur
    const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  const spectatorColor = generateColor(spectator.id);

  return (
    <div className="flex items-center p-3 bg-gray-700 rounded-lg">
      <div
        className={`w-8 h-8 rounded-full ${spectatorColor} flex items-center justify-center text-sm font-bold mr-3`}
      >
        {spectator.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="font-medium">{spectator.name}</p>
      </div>
      <div className="text-xs px-2 py-1 bg-gray-600 rounded-full">
        Spectateur
      </div>
    </div>
  );
};

export default SpectatorCard;
