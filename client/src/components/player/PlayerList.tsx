import React from "react";
import { Player } from "../../types/game.types";
// import defaultAvatar from "../../assets/default-avatar.png"; // Assurez-vous d'avoir une image par défaut

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerId,
}) => {
  // Fonction pour formater le temps depuis que le joueur est prêt
  const formatReadyTime = (readySince?: Date | string) => {
    if (!readySince) return "";

    const date =
      typeof readySince === "string" ? new Date(readySince) : readySince;
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "à l'instant";
    if (diffSeconds < 3600) return `il y a ${Math.floor(diffSeconds / 60)} min`;
    return `il y a ${Math.floor(diffSeconds / 3600)} h`;
  };

  return (
    <div className="space-y-3">
      {players.length === 0 ? (
        <p className="text-gray-400">Aucun joueur dans cette salle</p>
      ) : (
        players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center p-3 rounded-lg transition-colors ${
              player.id === currentPlayerId
                ? "bg-gray-600 border-l-4 border-blue-500"
                : "bg-gray-700 hover:bg-gray-650"
            }`}
          >
            {/* Avatar et statut */}
            <div className="relative flex-shrink-0">
              {/* <img
                src={player.avatar || defaultAvatar}
                alt={`Avatar de ${player.name}`}
                className={`w-12 h-12 rounded-full object-cover border-2 ${
                  player.ready ? "border-green-500" : "border-gray-400"
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAvatar;
                }}
              /> */}
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-700 ${
                  player.ready ? "bg-green-500" : "bg-yellow-500"
                }`}
              />
            </div>

            {/* Informations du joueur */}
            <div className="ml-3 flex-grow">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">
                  {player.name}
                  {player.id === currentPlayerId && (
                    <span className="ml-2 text-xs bg-blue-600 text-white py-0.5 px-2 rounded-full">
                      Vous
                    </span>
                  )}
                </h3>

                {/* Score ou niveau si disponible */}
                {player.score !== undefined && (
                  <span className="text-sm font-semibold text-yellow-400">
                    {player.score} pts
                  </span>
                )}
                {player.level !== undefined && (
                  <span className="text-sm font-semibold text-purple-400">
                    Niv. {player.level}
                  </span>
                )}
              </div>

              {/* Badges et statuts */}
              <div className="flex flex-wrap gap-1 mt-1">
                <span
                  className={`text-xs py-0.5 px-2 rounded-full ${
                    player.ready
                      ? "bg-green-700 bg-opacity-60 text-white"
                      : "bg-yellow-700 bg-opacity-50 text-white"
                  }`}
                >
                  {player.ready ? "Prêt" : "Pas prêt"}
                  {player.ready &&
                    player.readySince &&
                    ` · ${formatReadyTime(player.readySince)}`}
                </span>

                {/* Rôle du joueur (si défini) */}
                {player.role && (
                  <span className="text-xs bg-blue-700 bg-opacity-50 text-white py-0.5 px-2 rounded-full">
                    {player.role}
                  </span>
                )}

                {/* Statut spécial (si défini) */}
                {player.status && (
                  <span className="text-xs bg-gray-600 text-white py-0.5 px-2 rounded-full">
                    {player.status}
                  </span>
                )}
              </div>
            </div>

            {/* Indicateur de progression (si en jeu) */}
            {player.progress !== undefined && (
              <div className="ml-2 w-16">
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, player.progress))}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-center mt-1 text-gray-400">
                  {Math.round(player.progress)}%
                </p>
              </div>
            )}
          </div>
        ))
      )}

      {/* Si besoin de pagination ou d'autres informations sur la liste */}
      {players.length > 0 && (
        <div className="flex justify-between text-sm text-gray-400 pt-2">
          <span>
            {players.filter((p) => p.ready).length}/{players.length} joueurs
            prêts
          </span>
          {players.length === 1 && <span>En attente d'autres joueurs...</span>}
        </div>
      )}
    </div>
  );
};

export default PlayerList;
