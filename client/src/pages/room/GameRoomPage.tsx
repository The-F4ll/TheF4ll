import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import PlayerList from "../../components/player/PlayerList";
import ReadyButton from "../../components/player/ReadyButton";
import SpectatorsList from "../../components/spectator/SpectatorsList";
import { PlayerContext } from "../../context/PlayerContext";
import { RoomContext } from "../../context/RoomContext";
import { SpectatorContext } from "../../context/SpectatorContext";
import socketService, { SocketEvents } from "../../services/socket";
import { Room } from "../../types/game.types";

const GameRoomPage = () => {
  const { roomId } = useParams();
  const {
    room,
    joinRoom,
    joinRoomAsSpectator,
    startGame,
    allPlayersReady,
    fetchRooms,
  } = useContext(RoomContext);
  const { player, isReady, setReady } = useContext(PlayerContext);
  const { spectator } = useContext(SpectatorContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasInitializedRef = useRef(false);
  const [roomSettings, setRoomSettings] = useState<{
    maxPlayers: number;
    difficulty?: string;
    timeLimit?: number;
  }>({
    maxPlayers: 4,
  });

  // Rejoindre la salle au chargement si l'ID est disponible (une seule fois)
  useEffect(() => {
    const initRoom = async () => {
      // Éviter les initialisations multiples
      if (hasInitializedRef.current || !roomId) return;

      setIsLoading(true);

      try {
        // Marquer comme initialisé avant d'effectuer les opérations asynchrones
        hasInitializedRef.current = true;

        // Charger les données des rooms disponibles
        await fetchRooms();

        if (spectator?.id) {
          // Si c'est un spectateur, rejoindre en tant que spectateur
          await joinRoomAsSpectator(roomId);
        } else if (player?.id) {
          // Si c'est un joueur, rejoindre en tant que joueur
          await joinRoom(roomId);
        } else {
          console.error("Ni joueur ni spectateur défini");
        }
      } catch (error) {
        console.error("Erreur lors de la connexion à la salle:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initRoom();

    // Ce useEffect ne doit s'exécuter qu'une seule fois au montage du composant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Écouter les mises à jour de la room
  useEffect(() => {
    // S'assurer que Socket.IO est connecté
    if (!socketService.isConnected) {
      socketService.connect();
    }

    // Écouter les mises à jour de room en temps réel
    const unsubscribeRoomUpdated = socketService.on<Room>(
      SocketEvents.ROOM_UPDATED,
      (updatedRoom) => {
        console.log("Room mise à jour:", updatedRoom);

        // Extraire les paramètres de la salle - avec vérification de type
        if (updatedRoom && typeof updatedRoom === "object") {
          setRoomSettings({
            maxPlayers: (updatedRoom as Room).maxPlayers || 4,
            difficulty: (updatedRoom as Room).gameSettings?.difficulty,
            timeLimit: (updatedRoom as Room).gameSettings?.timeLimit,
          });
        }
      }
    );

    // Nettoyage des écouteurs
    return () => {
      unsubscribeRoomUpdated();
    };
  }, []);

  // Actualiser les paramètres de la salle lorsque l'objet room change
  useEffect(() => {
    if (room) {
      setIsLoading(false);

      // Mettre à jour les paramètres de la salle - avec vérification explicite
      setRoomSettings({
        maxPlayers: room.maxPlayers || 4,
        difficulty: room.gameSettings?.difficulty,
        timeLimit: room.gameSettings?.timeLimit,
      });
    }
  }, [room]);

  // Fonction pour actualiser manuellement la liste des joueurs
  const handleRefreshPlayers = async () => {
    if (!roomId) return;

    setRefreshing(true);

    try {
      // Recharger la liste des rooms
      await fetchRooms();

      // Rejoindre à nouveau la salle pour actualiser les données
      if (player?.id) {
        await joinRoom(roomId);
      } else if (spectator?.id) {
        await joinRoomAsSpectator(roomId);
      }
    } catch (error) {
      console.error("Erreur lors de l'actualisation:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStartGame = () => {
    if (roomId && allPlayersReady && room?.players && room.players.length > 0) {
      startGame(roomId);
      navigate(`/game/${roomId}`);
    }
  };

  const isSpectator = !!spectator?.id;

  // Calculer si la salle est presque pleine ou pleine
  const playerCount = room?.players?.length || 0;
  const maxPlayers = roomSettings.maxPlayers;
  const isRoomAlmostFull = playerCount >= Math.ceil(maxPlayers * 0.75); // 75% pleine
  const isRoomFull = playerCount >= maxPlayers;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Chargement de la salle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Salle d'attente</h1>
      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Code de la salle: <span className="font-mono">{roomId}</span>
        </h2>
        <div className="flex justify-between flex-wrap">
          <p className="text-sm text-gray-400">
            Partagez ce code avec vos amis pour qu'ils rejoignent cette salle
          </p>

          {/* Afficher les paramètres de la salle */}
          <div className="flex gap-2 mt-2 sm:mt-0">
            {roomSettings.difficulty && (
              <span className="text-xs bg-purple-800 bg-opacity-40 text-white py-1 px-2 rounded">
                Difficulté: {roomSettings.difficulty}
              </span>
            )}

            {roomSettings.timeLimit && (
              <span className="text-xs bg-blue-800 bg-opacity-40 text-white py-1 px-2 rounded">
                Temps: {Math.floor(roomSettings.timeLimit / 60)}:
                {(roomSettings.timeLimit % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button
          variant="secondary"
          onClick={handleRefreshPlayers}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
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
              Actualisation...
            </>
          ) : (
            "Actualiser"
          )}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Joueurs ({playerCount})</h2>
            <div
              className={`text-sm px-3 py-1 rounded ${
                isRoomFull
                  ? "bg-red-700"
                  : isRoomAlmostFull
                  ? "bg-yellow-700"
                  : "bg-gray-700"
              }`}
            >
              {playerCount}/{maxPlayers}
              {isRoomFull && " (Complet)"}
            </div>
          </div>

          {room?.players && room.players.length > 0 ? (
            <>
              <PlayerList players={room.players} currentPlayerId={player?.id} />
              <p className="mt-4 text-sm text-gray-400">
                {allPlayersReady
                  ? "Tous les joueurs sont prêts!"
                  : "En attente que tous les joueurs soient prêts..."}
              </p>
            </>
          ) : (
            <div className="p-4 text-center bg-gray-700 rounded-lg">
              <p>Aucun joueur dans cette salle</p>
              <p className="text-sm text-gray-400 mt-2">
                Attendez que des joueurs rejoignent ou partagez le code de salle
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              Spectateurs ({room?.spectators?.length || 0})
            </h2>
          </div>

          {room?.spectators && room.spectators.length > 0 ? (
            <SpectatorsList
              spectators={room.spectators}
              currentSpectatorId={spectator?.id}
            />
          ) : (
            <div className="p-4 text-center bg-gray-700 rounded-lg">
              <p>Aucun spectateur</p>
              <p className="text-sm text-gray-400 mt-2">
                Les spectateurs peuvent observer la partie mais ne peuvent pas
                jouer
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        {!isSpectator && (
          <div className="space-y-4 w-full max-w-md">
            <ReadyButton
              isReady={isReady}
              onToggleReady={() => setReady(!isReady)}
            />

            <Button
              variant="success"
              fullWidth
              disabled={
                !allPlayersReady || !room?.players || room.players.length === 0
              }
              onClick={handleStartGame}
            >
              {allPlayersReady && room?.players && room.players.length > 0
                ? "Lancer la partie"
                : "En attente des joueurs..."}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoomPage;
