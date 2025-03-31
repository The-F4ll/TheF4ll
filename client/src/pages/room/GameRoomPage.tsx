import { useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import PlayerList from "../../components/player/PlayerList";
import ReadyButton from "../../components/player/ReadyButton";
import SpectatorsList from "../../components/spectator/SpectatorsList";
import { PlayerContext } from "../../context/PlayerContext";
import { RoomContext } from "../../context/RoomContext";
import { SpectatorContext } from "../../context/SpectatorContext";

const GameRoomPage = () => {
  const { roomId } = useParams();
  const { room, joinRoom, joinRoomAsSpectator, startGame, allPlayersReady } =
    useContext(RoomContext);
  const { player, isReady, setReady } = useContext(PlayerContext);
  const { spectator } = useContext(SpectatorContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const hasInitializedRef = useRef(false);

  // Rejoindre la salle au chargement si l'ID est disponible (une seule fois)
  useEffect(() => {
    const initRoom = async () => {
      // Éviter les initialisations multiples
      if (hasInitializedRef.current || !roomId) return;

      setIsLoading(true);

      try {
        // Marquer comme initialisé avant d'effectuer les opérations asynchrones
        hasInitializedRef.current = true;

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

  // Actualiser la salle si le room context change
  useEffect(() => {
    if (room) {
      setIsLoading(false);
    }
  }, [room]);

  const handleStartGame = () => {
    if (roomId && allPlayersReady) {
      startGame(roomId);
      navigate(`/game/${roomId}`);
    }
  };

  const isSpectator = !!spectator?.id;

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
        <p className="text-sm text-gray-400">
          Partagez ce code avec vos amis pour qu'ils rejoignent cette salle
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            Joueurs ({room?.players.length || 0})
          </h2>
          <PlayerList players={room?.players || []} />
          <p className="mt-4 text-sm text-gray-400">
            {allPlayersReady
              ? "Tous les joueurs sont prêts!"
              : "En attente que tous les joueurs soient prêts..."}
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">
            Spectateurs ({room?.spectators?.length || 0})
          </h2>
          <SpectatorsList spectators={room?.spectators || []} />
          <p className="mt-4 text-sm text-gray-400">
            Les spectateurs peuvent observer la partie mais ne peuvent pas jouer
          </p>
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
              disabled={!allPlayersReady}
              onClick={handleStartGame}
            >
              {allPlayersReady
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
