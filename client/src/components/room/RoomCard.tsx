import React from "react";
import { Room } from "../../types/game.types";

type RoomCardProps = {
  room: Room;
  onJoin: () => void;
  isLoading: boolean;
  type: "waiting" | "active";
};

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onJoin,
  isLoading,
  type,
}) => {
  const isWaiting = type === "waiting";

  return (
    <div
      className={`bg-gray-800 rounded-lg overflow-hidden border-2 ${
        isWaiting ? "border-yellow-600" : "border-green-600"
      }`}
    >
      <div
        className={`px-4 py-2 text-white ${
          isWaiting ? "bg-yellow-700" : "bg-green-700"
        }`}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Salle #{room.id.substring(0, 8)}</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isWaiting ? "bg-yellow-800" : "bg-green-800"
            }`}
          >
            {isWaiting ? "En attente" : "En cours"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-400">
            Joueurs ({room.players.length}):
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="bg-gray-700 px-2 py-1 rounded text-sm flex items-center"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    player.ready ? "bg-green-500" : "bg-red-500"
                  } mr-2`}
                ></span>
                {player.name || "Joueur anonyme"}
              </div>
            ))}
            {room.players.length === 0 && (
              <p className="text-sm text-gray-500">Aucun joueur</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400">
            Spectateurs ({room.spectators?.length || 0}):
          </p>
          {room.spectators && room.spectators.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {room.spectators.map((spectator) => (
                <div
                  key={spectator.id}
                  className="bg-gray-700 px-2 py-1 rounded text-sm"
                >
                  {spectator.name || "Spectateur anonyme"}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-1">Aucun spectateur</p>
          )}
        </div>

        <button
          onClick={onJoin}
          disabled={isLoading}
          className={`w-full py-2 rounded-lg font-medium mt-2 
            ${
              isWaiting
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-green-600 hover:bg-green-700"
            } 
            transition-colors 
            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Connexion...
            </span>
          ) : (
            `Observer ${isWaiting ? "la salle" : "la partie"}`
          )}
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
