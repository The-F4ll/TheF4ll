import React from "react";
import { Player } from "../../types/game.types";

const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
  // Correspondance entre ID d'avatar et couleurs
  const avatarColors: { [key: string]: string } = {
    avatar1: "bg-red-500",
    avatar2: "bg-blue-500",
    avatar3: "bg-green-500",
    avatar4: "bg-yellow-500",
    avatar5: "bg-purple-500",
    avatar6: "bg-pink-500",
  };

  const avatarColor = avatarColors[player.avatar] || "bg-gray-500";

  return (
    <div className="flex items-center p-3 bg-gray-700 rounded-lg">
      <div
        className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-lg font-bold mr-3`}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="font-medium">{player.name}</p>
      </div>
      <div
        className={`w-3 h-3 rounded-full ${
          player.ready ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>
    </div>
  );
};

export default PlayerCard;
