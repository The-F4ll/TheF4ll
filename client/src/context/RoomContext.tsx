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
import { v4 as uuidv4 } from "uuid";
import socketService, { SocketEvents } from "../services/socket";
import axios from "axios"; // Assurez-vous d'avoir axios installé

type RoomContextType = {
  room: Room | null;
  joinRoom: (roomId: string) => Promise<string | null>;
  leaveRoom: () => void;
  joinRoomAsSpectator: (roomId: string) => Promise<string>;
  startGame: (roomId: string | undefined) => void;
  allPlayersReady: boolean;
  currentRoomId: string | null;
  generateRoomId: () => string;
  availableRooms: Room[]; // Nouvelle propriété pour les rooms disponibles
  fetchRooms: () => Promise<void>; // Nouvelle méthode pour récupérer les rooms
};

const defaultContext: RoomContextType = {
  room: null,
  joinRoom: async () => null,
  leaveRoom: () => {},
  joinRoomAsSpectator: async () => "",
  startGame: () => {},
  allPlayersReady: false,
  currentRoomId: null,
  generateRoomId: () => "",
  availableRooms: [], // Valeur par défaut
  fetchRooms: async () => {}, // Valeur par défaut
};

export const RoomContext = createContext<RoomContextType>(defaultContext);

// URL de base pour l'API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const RoomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const { player, setPlayer } = useContext(PlayerContext);
  const { spectator } = useContext(SpectatorContext);
  const [allPlayersReady, setAllPlayersReady] = useState(false);
  const updatingPlayerRef = useRef(false);

  // Fonction pour récupérer les rooms disponibles depuis le serveur
  const fetchRooms = async (): Promise<void> => {
    try {
      const response = await axios.get<Room[]>(`${API_BASE_URL}/rooms`);
      setAvailableRooms(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des rooms:", error);
    }
  };

  // Récupérer les rooms disponibles au chargement du composant
  useEffect(() => {
    fetchRooms();

    // Rafraîchir les rooms périodiquement (toutes les 30 secondes)
    const intervalId = setInterval(fetchRooms, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Surveiller l'état "prêt" de tous les joueurs
  useEffect(() => {
    if (room && room.players.length > 0) {
      const allReady = room.players.every((p) => p.ready);
      setAllPlayersReady(allReady);
    } else {
      setAllPlayersReady(false);
    }
  }, [room]);

  // Fonction pour générer un ID de room unique
  const generateRoomId = (): string => {
    return uuidv4().substring(0, 8);
  };

  // Rejoindre une room en tant que joueur
  const joinRoom = async (roomId: string): Promise<string | null> => {
    try {
      if (!player) {
        console.error(
          "Impossible de rejoindre la salle: aucun joueur n'est défini"
        );
        return null;
      }

      console.log(
        "Tentative de rejoindre la room:",
        roomId,
        "en tant que joueur:",
        player
      );

      // Utiliser le service socket pour rejoindre la room
      const playerId = await socketService.joinRoom(roomId, {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        ready: player.ready,
      });

      console.log("Réponse du serveur (playerId):", playerId);

      // Important: vérifier explicitement si playerId est une chaîne valide
      if (playerId && typeof playerId === "string") {
        // Mettre à jour l'ID du joueur uniquement si nécessaire
        if (playerId !== player.id) {
          setPlayer({
            ...player,
            id: playerId,
          });
        }

        // Mettre à jour l'état avant de retourner la valeur
        setCurrentRoomId(roomId);

        // Assurez-vous que la valeur retournée est la même que celle utilisée pour setCurrentRoomId
        return roomId;
      }

      console.warn(
        "Échec de la connexion à la room - playerId invalide:",
        playerId
      );
      return null;
    } catch (error) {
      console.error("Erreur lors de la tentative de rejoindre la room:", error);
      return null;
    }
  };

  // Rejoindre une room en tant que spectateur
  const joinRoomAsSpectator = async (roomId: string): Promise<string> => {
    try {
      if (!spectator) {
        console.error(
          "Impossible de rejoindre la salle: aucun spectateur n'est défini"
        );
        return "";
      }

      console.log(
        "Tentative de rejoindre la room:",
        roomId,
        "en tant que spectateur:",
        spectator
      );

      // Option 1: Extraire les propriétés nécessaires sans l'ID
      const { name, avatar } = spectator;
      const spectatorData = { name, avatar };

      // Passer l'ID séparément, en tant que paramètre distinct
      const spectatorId = await socketService.joinRoomAsSpectator(
        roomId,
        spectatorData,
        spectator.id // Passer l'ID en tant que paramètre optionnel séparé
      );

      // Alternative si vous souhaitez modifier la signature de votre fonction dans socketService:
      // const spectatorId = await socketService.joinRoomAsSpectator(roomId, spectator);

      console.log("Réponse du serveur (spectatorId):", spectatorId);

      if (spectatorId) {
        // Mettre à jour l'état avant de retourner la valeur
        setCurrentRoomId(roomId);

        // Important: s'assurer que la valeur retournée n'est jamais null
        return roomId;
      }

      return "";
    } catch (error) {
      console.error(
        "Erreur lors de la tentative de rejoindre la room en tant que spectateur:",
        error
      );
      return "";
    }
  };

  // Quitter une room
  const leaveRoom = async () => {
    if (!room) return;

    try {
      if (player) {
        // Quitter la room en tant que joueur
        await socketService.leaveRoom(room.id, player.id, false);
      } else if (spectator) {
        // Quitter la room en tant que spectateur
        await socketService.leaveRoom(room.id, spectator.id, true);
      }

      setRoom(null);
      setCurrentRoomId(null);
    } catch (error) {
      console.error("Erreur lors de la tentative de quitter la room:", error);
    }
  };

  // Démarrer la partie
  const startGame = async (roomId: string | undefined) => {
    if (!roomId || !room || !allPlayersReady) return;

    try {
      await socketService.startGame(roomId);
    } catch (error) {
      console.error("Erreur lors du démarrage de la partie:", error);
    }
  };

  // Écouter les mises à jour de la salle via Socket.IO
  useEffect(() => {
    // Se connecter au socket si nécessaire
    if (!socketService.isConnected) {
      socketService.connect();
    }

    // Écouter les mises à jour de room
    const unsubscribe = socketService.on<Room>(
      SocketEvents.ROOM_UPDATED,
      (updatedRoom) => {
        setRoom(updatedRoom);
      }
    );

    // Écouter le démarrage de la partie
    const unsubscribeGameStart = socketService.on(
      SocketEvents.GAME_STARTED,
      () => {
        if (room) {
          setRoom({
            ...room,
            isGameStarted: true,
          });
        }
      }
    );

    return () => {
      unsubscribe();
      unsubscribeGameStart();
    };
  }, [room]);

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
        availableRooms,
        fetchRooms,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
