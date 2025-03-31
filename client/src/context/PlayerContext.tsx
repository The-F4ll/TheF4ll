import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Player } from "../types/game.types";

type PlayerContextType = {
  player: Player | null;
  setPlayer: (player: Player) => void;
  isReady: boolean;
  setReady: (isReady: boolean) => void;
  clearPlayer: () => void;
};

const defaultContext: PlayerContextType = {
  player: null,
  setPlayer: () => {},
  isReady: false,
  setReady: () => {},
  clearPlayer: () => {},
};

export const PlayerContext = createContext<PlayerContextType>(defaultContext);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [player, setPlayerState] = useState<Player | null>(() => {
    // Récupérer les données du joueur du localStorage au chargement
    const savedPlayer = localStorage.getItem("player");
    return savedPlayer ? JSON.parse(savedPlayer) : null;
  });

  const [isReady, setReadyState] = useState<boolean>(false);

  // Persister les données du joueur dans localStorage
  useEffect(() => {
    if (player) {
      localStorage.setItem("player", JSON.stringify(player));
    }
  }, [player]);

  const setPlayer = (newPlayer: Player) => {
    setPlayerState(newPlayer);
  };

  const setReady = (ready: boolean) => {
    setReadyState(ready);
    if (player) {
      setPlayerState({
        ...player,
        ready,
      });
    }
  };

  const clearPlayer = () => {
    localStorage.removeItem("player");
    setPlayerState(null);
    setReadyState(false);
  };

  return (
    <PlayerContext.Provider
      value={{
        player,
        setPlayer,
        isReady,
        setReady,
        clearPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
