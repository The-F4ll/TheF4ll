import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Room } from "../types/game.types";
import { PlayerContext } from "./PlayerContext";
import { SpectatorContext } from "./SpectatorContext";

type RoomContextType = {
  room: Room | null;
  joinRoom: (roomId: string) => Promise<string>;
  leaveRoom: () => void;
  joinRoomAsSpectator: (roomId: string) => Promise<string>;
  startGame: (roomId: string | undefined) => void;
  allPlayersReady: boolean;
};

const defaultContext: RoomContextType = {
  room: null,
  joinRoom: async () => "",
  leaveRoom: () => {},
  joinRoomAsSpectator: async () => "",
  startGame: () => {},
  allPlayersReady: false,
};

export const RoomContext = createContext<RoomContextType>(defaultContext);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const { player } = useContext(PlayerContext);
  const { spectator } = useContext(SpectatorContext);
  const [allPlayersReady, setAllPlayersReady] = useState(false);

  // Surveiller l'état "prêt" de tous les joueurs
  useEffect(() => {
    if (room && room.players.length > 0) {
      const allReady = room.players.every((p) => p.ready);
      setAllPlayersReady(allReady);
    } else {
      setAllPlayersReady(false);
    }
  }, [room]);

  // Dans un contexte réel, ces fonctions communiqueraient avec une API ou websocket
  const joinRoom = async (roomId: string): Promise<string> => {
    // Simuler une requête API
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (player) {
      // Essayer de trouver la room existante (ici pour la démo, on crée une nouvelle)
      const newRoom: Room = {
        id: roomId,
        players: room?.players || [],
        spectators: room?.spectators || [],
        isGameStarted: false,
      };

      // Ajouter le joueur s'il n'est pas déjà dans la room
      if (!newRoom.players.some((p) => p.id === player.id)) {
        newRoom.players = [...newRoom.players, player];
      }

      setRoom(newRoom);
      return roomId;
    }
    return "";
  };

  const joinRoomAsSpectator = async (roomId: string): Promise<string> => {
    // Simuler une requête API
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (spectator) {
      // Essayer de trouver la room existante (ici pour la démo, on crée une nouvelle)
      const newRoom: Room = {
        id: roomId,
        players: room?.players || [],
        spectators: room?.spectators || [],
        isGameStarted: false,
      };

      // Ajouter le spectateur s'il n'est pas déjà dans la room
      if (!newRoom.spectators.some((s) => s.id === spectator.id)) {
        newRoom.spectators = [...newRoom.spectators, spectator];
      }

      setRoom(newRoom);
      return roomId;
    }
    return "";
  };

  const leaveRoom = () => {
    // Quitter la room
    if (player && room) {
      const updatedPlayers = room.players.filter((p) => p.id !== player.id);
      setRoom({
        ...room,
        players: updatedPlayers,
      });
    } else if (spectator && room) {
      const updatedSpectators = room.spectators.filter(
        (s) => s.id !== spectator.id
      );
      setRoom({
        ...room,
        spectators: updatedSpectators,
      });
    }
  };

  const startGame = (roomId: string | undefined) => {
    if (roomId && room && allPlayersReady) {
      setRoom({
        ...room,
        isGameStarted: true,
      });

      // Dans une implémentation réelle, vous enverriez un événement au serveur
      console.log(`Jeu démarré dans la room: ${roomId}`);
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
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
