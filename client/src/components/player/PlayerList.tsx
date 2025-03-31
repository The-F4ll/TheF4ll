import React from "react";
import PlayerCard from "./PlayerCard";
import { Player } from "../../types/game.types";

type PlayerListProps = {
  players: Player[];
};

const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  if (players.length === 0) {
    return <p className="text-gray-400">Aucun joueur dans cette salle</p>;
  }

  return (
    <div className="space-y-2">
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
};

export default PlayerList;
