import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Spectator, Room } from "../types/game.types"; // Ajout de Room à l'importation
import { v4 as uuidv4 } from "uuid";

type SpectatorContextType = {
  spectator: Spectator | null;
  setSpectator: (spectator: Spectator) => void;
  clearSpectator: () => void;
  castVote: (option: string) => void;
  currentVote: string | null;
  getAllRooms: () => Promise<Room[]>;
};

const defaultContext: SpectatorContextType = {
  spectator: null,
  setSpectator: () => {},
  clearSpectator: () => {},
  castVote: () => {},
  currentVote: null,
  getAllRooms: async () => [],
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

  // Fonction pour récupérer toutes les salles disponibles
  const getAllRooms = async (): Promise<Room[]> => {
    // Dans une application réelle, ce serait un appel API
    // Ici, on simule un délai
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Salles simulées
    return [
      {
        id: "room1",
        players: [
          { id: "p1", name: "Alice", avatar: "avatar1", ready: true },
          { id: "p2", name: "Bob", avatar: "avatar3", ready: false },
        ],
        spectators: [],
        isGameStarted: false,
      },
      {
        id: "room2",
        players: [
          { id: "p3", name: "Charlie", avatar: "avatar2", ready: true },
          { id: "p4", name: "David", avatar: "avatar4", ready: true },
        ],
        spectators: [{ id: "s1", name: "Observer1" }],
        isGameStarted: true,
      },
      {
        id: "room3",
        players: [{ id: "p5", name: "Eve", avatar: "avatar5", ready: false }],
        spectators: [],
        isGameStarted: false,
      },
    ];
  };

  return (
    <SpectatorContext.Provider
      value={{
        spectator,
        setSpectator,
        clearSpectator,
        castVote,
        currentVote,
        getAllRooms,
      }}
    >
      {children}
    </SpectatorContext.Provider>
  );
};
