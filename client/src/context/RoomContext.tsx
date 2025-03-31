import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { Room } from "../types/game.types";
import { PlayerContext } from "./PlayerContext";
import { SpectatorContext } from "./SpectatorContext";
import { v4 as uuidv4 } from "uuid"; // Ajout de l'import uuid

type RoomContextType = {
  room: Room | null;
  joinRoom: (roomId: string) => Promise<string | null>;
  leaveRoom: () => void;
  joinRoomAsSpectator: (roomId: string) => Promise<string>;
  startGame: (roomId: string | undefined) => void;
  allPlayersReady: boolean;
  currentRoomId: string | null;
  generateRoomId: () => string; // Nouvelle fonction
};

const defaultContext: RoomContextType = {
  room: null,
  joinRoom: async () => null,
  leaveRoom: () => {},
  joinRoomAsSpectator: async () => "",
  startGame: () => {},
  allPlayersReady: false,
  currentRoomId: null,
  generateRoomId: () => "", // Valeur par défaut
};

export const RoomContext = createContext<RoomContextType>(defaultContext);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [room, setRoom] = useState<Room | null>(() => {
    // Récupérer la salle actuelle du localStorage
    const savedRoom = localStorage.getItem("currentRoom");
    return savedRoom ? JSON.parse(savedRoom) : null;
  });

  const [currentRoomId, setCurrentRoomId] = useState<string | null>(() => {
    return room?.id || null;
  });

  const { player, setPlayer } = useContext(PlayerContext);
  const { spectator } = useContext(SpectatorContext);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const updatingPlayerRef = useRef(false); // Référence pour éviter la boucle infinie

  // Persister la salle dans localStorage quand elle change
  useEffect(() => {
    if (room) {
      localStorage.setItem("currentRoom", JSON.stringify(room));
      setCurrentRoomId(room.id);
    } else {
      localStorage.removeItem("currentRoom");
      setCurrentRoomId(null);
    }
  }, [room]);

  // Mise à jour de l'état du joueur dans la salle quand il change
  useEffect(() => {
    if (updatingPlayerRef.current) {
      // Éviter la boucle si nous sommes déjà en train de mettre à jour
      return;
    }

    if (room && player) {
      // Vérifier si le joueur est déjà dans la salle
      const playerIndex = room.players.findIndex((p) => p.id === player.id);

      if (playerIndex >= 0) {
        // Comparer si le joueur a réellement changé pour éviter les mises à jour inutiles
        const currentPlayerInRoom = room.players[playerIndex];

        // Vérifier si les attributs ont changé avant de mettre à jour
        if (
          currentPlayerInRoom.ready !== player.ready ||
          currentPlayerInRoom.name !== player.name ||
          currentPlayerInRoom.avatar !== player.avatar
        ) {
          // Marquer que nous sommes en train de mettre à jour
          updatingPlayerRef.current = true;

          // Mettre à jour les informations du joueur dans la salle
          const updatedPlayers = [...room.players];
          updatedPlayers[playerIndex] = player;

          setRoom((prevRoom) => {
            if (!prevRoom) return null;
            return {
              ...prevRoom,
              players: updatedPlayers,
            };
          });

          // Réinitialiser le flag après la mise à jour
          setTimeout(() => {
            updatingPlayerRef.current = false;
          }, 0);
        }
      }
    }
  }, [player]); // Ne dépendre que de player, pas de room

  // Surveiller l'état "prêt" de tous les joueurs
  useEffect(() => {
    if (room && room.players.length > 0) {
      const allReady = room.players.every((p) => p.ready);
      setAllPlayersReady(allReady);
    } else {
      setAllPlayersReady(false);
    }
  }, [room]);

  // Ajouter cet effet pour surveiller les changements de spectateurs

  // Mise à jour de l'état du spectateur dans la salle quand il change
  useEffect(() => {
    if (room && spectator) {
      // Vérifier si le spectateur est déjà dans la salle
      const spectatorIndex = room.spectators.findIndex(
        (s) => s.id === spectator.id
      );

      if (spectatorIndex >= 0) {
        // Mettre à jour les informations du spectateur dans la salle
        const updatedSpectators = [...room.spectators];
        updatedSpectators[spectatorIndex] = spectator;

        setRoom({
          ...room,
          spectators: updatedSpectators,
        });
      }
    }
  }, [spectator]);

  // Fonction pour générer un ID de room unique
  const generateRoomId = (): string => {
    // Générer un ID court et lisible basé sur UUID
    return uuidv4().substring(0, 8);
  };

  // Fonction pour valider et s'assurer que le joueur a un ID valide
  const validatePlayer = async () => {
    if (!player) return null;

    // Vérifier si l'ID du joueur est un UUID valide
    return {
      ...player,
      id: player.id.length < 10 ? uuidv4() : player.id,
    };
  };

  // Dans un contexte réel, ces fonctions communiqueraient avec une API ou websocket
  const joinRoom = async (roomId: string): Promise<string | null> => {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Vérifier si un joueur existe déjà
    if (!player) {
      console.error(
        "Impossible de rejoindre la salle: aucun joueur n'est défini"
      );
      return null;
    }

    // Valider le joueur pour s'assurer qu'il a un ID UUID valide
    const validPlayer = await validatePlayer();
    if (!validPlayer) {
      console.error("Impossible de valider le joueur");
      return null;
    }

    // Chercher une salle existante ou en créer une nouvelle
    let newRoom: Room;

    if (room && room.id === roomId) {
      // La salle existe déjà et c'est celle qu'on veut rejoindre
      newRoom = { ...room };

      // Important: vérifier si le joueur existe DÉJÀ dans cette salle
      const existingPlayerIndex = newRoom.players.findIndex(
        (p) => p.id === validPlayer.id
      );

      if (existingPlayerIndex >= 0) {
        // Mettre à jour le joueur existant plutôt que d'en ajouter un nouveau
        newRoom.players[existingPlayerIndex] = {
          ...validPlayer,
        };
      } else {
        // Ajouter le joueur car il n'est pas encore dans la salle
        newRoom.players = [...newRoom.players, validPlayer];
      }
    } else {
      // Nouvelle salle ou salle différente
      newRoom = {
        id: roomId,
        players: [validPlayer], // Ajouter directement le joueur validé
        spectators: [],
        isGameStarted: false,
      };
    }

    setRoom(newRoom);
    setCurrentRoomId(roomId);
    return roomId;
  };

  const joinRoomAsSpectator = async (roomId: string): Promise<string> => {
    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!spectator) {
      console.error(
        "Impossible de rejoindre la salle: aucun spectateur n'est défini"
      );
      return "";
    }

    // Vérifier si l'ID du spectateur est un UUID valide
    const spectatorWithUuid = {
      ...spectator,
      id: spectator.id.length < 30 ? uuidv4() : spectator.id,
    };

    // Chercher une salle existante ou en créer une nouvelle
    let newRoom: Room;

    if (room && room.id === roomId) {
      // La salle existe déjà et c'est celle qu'on veut rejoindre
      newRoom = { ...room };

      // Vérifier si le spectateur existe déjà dans la salle
      const existingSpectatorIndex = newRoom.spectators.findIndex(
        (s) => s.id === spectatorWithUuid.id
      );

      if (existingSpectatorIndex >= 0) {
        // Mettre à jour le spectateur existant
        newRoom.spectators[existingSpectatorIndex] = spectatorWithUuid;
      } else {
        // Ajouter le spectateur à la liste
        newRoom.spectators = [...newRoom.spectators, spectatorWithUuid];
      }
    } else {
      // Nouvelle salle ou salle différente
      newRoom = {
        id: roomId,
        players: [],
        spectators: [spectatorWithUuid],
        isGameStarted: false,
      };
    }

    // Mettre à jour la salle dans le state et localStorage
    setRoom(newRoom);
    setCurrentRoomId(roomId);
    localStorage.setItem("currentRoom", JSON.stringify(newRoom));

    // Journaliser pour déboguer
    console.log("Salle mise à jour avec le spectateur:", newRoom);

    return roomId;
  };

  const leaveRoom = () => {
    if (!room) return;

    if (player) {
      // Retirer le joueur de la salle
      const updatedPlayers = room.players.filter((p) => p.id !== player.id);
      const updatedRoom = {
        ...room,
        players: updatedPlayers,
      };

      // Si la salle est vide, la supprimer
      if (
        updatedPlayers.length === 0 &&
        (!room.spectators || room.spectators.length === 0)
      ) {
        setRoom(null);
        localStorage.removeItem("currentRoom");
      } else {
        setRoom(updatedRoom);
      }
    } else if (spectator) {
      // Retirer le spectateur de la salle
      const updatedSpectators = room.spectators.filter(
        (s) => s.id !== spectator.id
      );
      const updatedRoom = {
        ...room,
        spectators: updatedSpectators,
      };

      // Si la salle est vide, la supprimer
      if (
        updatedSpectators.length === 0 &&
        (!room.players || room.players.length === 0)
      ) {
        setRoom(null);
        localStorage.removeItem("currentRoom");
      } else {
        setRoom(updatedRoom);
      }
    }

    setCurrentRoomId(null);
  };

  const startGame = (roomId: string | undefined) => {
    if (roomId && room && allPlayersReady) {
      setRoom({
        ...room,
        isGameStarted: true,
      });
    }
  };

  return (
    <RoomContext.Provider
      value={{
        room,
        joinRoom,
        leaveRoom,
        joinRoomAsSpectator,
        startGame,
        allPlayersReady,
        currentRoomId,
        generateRoomId,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
