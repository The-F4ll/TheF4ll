import React from "react";
import { Spectator } from "../../types/game.types";
// import defaultAvatar from "../../assets/default-avatar.png"; // Assurez-vous d'avoir une image par défaut

interface SpectatorsListProps {
  spectators: Spectator[];
  currentSpectatorId?: string;
}

const SpectatorsList: React.FC<SpectatorsListProps> = ({
  spectators,
  currentSpectatorId,
}) => {
  // Fonction pour formater la date de connexion
  const formatJoinTime = (joinedAt?: Date | string) => {
    if (!joinedAt) return "Récemment";

    const date = typeof joinedAt === "string" ? new Date(joinedAt) : joinedAt;
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-3">
      {spectators.map((spectator) => (
        <div
          key={spectator.id}
          className={`flex items-center p-3 rounded-lg transition-colors ${
            spectator.id === currentSpectatorId
              ? "bg-gray-600 border-l-4 border-blue-500"
              : "bg-gray-700 hover:bg-gray-650"
          }`}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {/* <img
              src={spectator.avatar || defaultAvatar}
              alt={`Avatar de ${spectator.name}`}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
            /> */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-700"></div>
          </div>

          {/* Informations du spectateur */}
          <div className="ml-3 flex-grow">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">
                {spectator.name}
                {spectator.id === currentSpectatorId && (
                  <span className="ml-2 text-xs bg-blue-600 text-white py-0.5 px-2 rounded-full">
                    Vous
                  </span>
                )}
              </h3>
              <span className="text-xs text-gray-400">
                {formatJoinTime(spectator.joinedAt)}
              </span>
            </div>

            {/* Badges et statuts */}
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-xs bg-purple-700 bg-opacity-50 text-white py-0.5 px-2 rounded-full">
                Spectateur
              </span>
              {spectator.status && (
                <span className="text-xs bg-gray-600 text-white py-0.5 px-2 rounded-full">
                  {spectator.status}
                </span>
              )}
              {spectator.hasVoted && (
                <span className="text-xs bg-green-700 bg-opacity-50 text-white py-0.5 px-2 rounded-full">
                  A voté
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {spectators.length > 5 && (
        <p className="text-center text-sm text-gray-400 pt-2">
          {spectators.length} spectateurs connectés
        </p>
      )}
    </div>
  );
};

export default SpectatorsList;
