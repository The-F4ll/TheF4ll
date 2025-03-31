import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Spectator } from "../types/game.types";

type SpectatorContextType = {
  spectator: Spectator | null;
  setSpectator: (spectator: Spectator) => void;
  clearSpectator: () => void;
  castVote: (option: string) => void;
  currentVote: string | null;
};

const defaultContext: SpectatorContextType = {
  spectator: null,
  setSpectator: () => {},
  clearSpectator: () => {},
  castVote: () => {},
  currentVote: null,
};

export const SpectatorContext =
  createContext<SpectatorContextType>(defaultContext);

export const SpectatorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [spectator, setSpectatorState] = useState<Spectator | null>(() => {
    const savedSpectator = localStorage.getItem("spectator");
    return savedSpectator ? JSON.parse(savedSpectator) : null;
  });

  const [currentVote, setCurrentVote] = useState<string | null>(null);

  useEffect(() => {
    if (spectator) {
      localStorage.setItem("spectator", JSON.stringify(spectator));
    }
  }, [spectator]);

  const setSpectator = (newSpectator: Spectator) => {
    setSpectatorState(newSpectator);
  };

  const clearSpectator = () => {
    localStorage.removeItem("spectator");
    setSpectatorState(null);
    setCurrentVote(null);
  };

  const castVote = (option: string) => {
    if (spectator) {
      setCurrentVote(option);
      // Ici, vous pourriez également envoyer ce vote à un serveur via websocket
    }
  };

  return (
    <SpectatorContext.Provider
      value={{
        spectator,
        setSpectator,
        clearSpectator,
        castVote,
        currentVote,
      }}
    >
      {children}
    </SpectatorContext.Provider>
  );
};
