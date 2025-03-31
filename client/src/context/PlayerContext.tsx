import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Player } from "../types/game.types";
import { v4 as uuidv4 } from "uuid"; // Ajoutez cette dépendance avec npm install uuid @types/uuid

type PlayerContextType = {
  player: Player | null;
  setPlayer: (player: Partial<Player>) => void; // Modifié pour accepter des mises à jour partielles
  isReady: boolean;
  setReady: (isReady: boolean) => void;
  clearPlayer: () => void;
  generateNewPlayerId: () => string; // Nouvelle fonction
  validatePlayer: () => Promise<Player | null>; // Nouvelle fonction pour valider le joueur
};

const defaultContext: PlayerContextType = {
  player: null,
  setPlayer: () => {},
  isReady: false,
  setReady: () => {},
  clearPlayer: () => {},
  generateNewPlayerId: () => "",
  validatePlayer: async () => null,
};

export const PlayerContext = createContext<PlayerContextType>(defaultContext);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [player, setPlayerState] = useState<Player | null>(() => {
    try {
      // Récupérer les données du joueur du localStorage au chargement
      const savedPlayer = localStorage.getItem("player");
      if (!savedPlayer) return null;

      const parsedPlayer = JSON.parse(savedPlayer) as Player;

      // Vérifier si l'ID est un UUID valide (approximativement)
      if (!parsedPlayer.id || parsedPlayer.id.length < 30) {
        // Si l'ID n'est pas valide, en assigner un nouveau
        parsedPlayer.id = uuidv4();
      }
      console.log("Joueur chargé:", parsedPlayer);
      return parsedPlayer;
    } catch (error) {
      console.error("Erreur lors du chargement des données joueur:", error);
      return null;
    }
  });

  const [isReady, setReadyState] = useState<boolean>(() => {
    // Récupérer l'état "prêt" du localStorage aussi
    return player?.ready || false;
  });

  // Persister les données du joueur dans localStorage
  useEffect(() => {
    if (player) {
      try {
        localStorage.setItem("player", JSON.stringify(player));
      } catch (error) {
        console.error(
          "Erreur lors de la sauvegarde des données joueur:",
          error
        );
      }
    }
  }, [player]);

  // Fonction pour générer un nouvel ID de joueur
  const generateNewPlayerId = (): string => {
    return uuidv4();
  };

  // Fonction pour valider un joueur existant
  const validatePlayer = async (): Promise<Player | null> => {
    if (!player) return null;

    // Vérifier l'ID du joueur et le mettre à jour si nécessaire
    if (!player.id || player.id.length < 30) {
      const validatedPlayer = {
        ...player,
        id: uuidv4(),
      };

      setPlayerState(validatedPlayer);
      // Attendre que le state soit mis à jour
      await new Promise((resolve) => setTimeout(resolve, 50));
      return validatedPlayer;
    }

    return player;
  };

  // Fonction pour définir ou mettre à jour un joueur
  const setPlayer = (newPlayerData: Partial<Player>) => {
    setPlayerState((currentPlayer) => {
      if (!currentPlayer) {
        // Si aucun joueur n'existe, créer un nouveau joueur avec un ID unique
        const newPlayer: Player = {
          id: uuidv4(), // Générer un UUID complet
          name: "",
          avatar: "avatar1",
          ready: false,
          ...newPlayerData, // Écraser avec les données fournies SAUF l'ID
        };

        // Garantir que l'ID reste un UUID valide
        if (!newPlayer.id || newPlayer.id.length < 30) {
          newPlayer.id = uuidv4();
        }

        return newPlayer;
      } else {
        // Préserver l'ID du joueur actuel, JAMAIS le modifier
        const updatedPlayer = {
          ...currentPlayer,
          ...newPlayerData,
        };

        // S'assurer que l'ID reste intact
        updatedPlayer.id = currentPlayer.id;

        return updatedPlayer;
      }
    });
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
    localStorage.removeItem("currentRoom"); // Supprimer aussi la salle actuelle
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
        generateNewPlayerId,
        validatePlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
