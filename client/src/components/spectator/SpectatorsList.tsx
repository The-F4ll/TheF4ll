import React from "react";
import SpectatorCard from "./SpectatorCard";
import { Spectator } from "../../types/game.types";

type SpectatorsListProps = {
  spectators: Spectator[];
};

const SpectatorsList: React.FC<SpectatorsListProps> = ({ spectators }) => {
  if (spectators.length === 0) {
    return <p className="text-gray-400">Aucun spectateur dans cette salle</p>;
  }

  return (
    <div className="space-y-2">
      {spectators.map((spectator) => (
        <SpectatorCard key={spectator.id} spectator={spectator} />
      ))}
    </div>
  );
};

export default SpectatorsList;
