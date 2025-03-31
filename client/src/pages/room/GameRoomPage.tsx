import { useContext, useEffect, useState } from "react";
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
  const { room, startGame, allPlayersReady } = useContext(RoomContext);
  const { player, isReady, setReady } = useContext(PlayerContext);
  const { spectator } = useContext(SpectatorContext);
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (room && room.players && room.players.length > 0) {
      setIsHost(room.players[0].id === player?.id);
    } else {
      setIsHost(false);
    }
  }, [room, player]);

  const handleStartGame = () => {
    startGame(roomId);
    navigate(`/game/${roomId}`);
  };

  const isSpectator = !!spectator?.id;

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Salle d'attente</h1>
      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Code de la salle: <span className="font-mono">{roomId}</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Joueurs</h2>
          <PlayerList players={room?.players || []} />
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Spectateurs</h2>
          <SpectatorsList spectators={room?.spectators || []} />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        {!isSpectator && (
          <div className="space-y-4 w-full max-w-md">
            <ReadyButton
              isReady={isReady}
              onToggleReady={() => setReady(!isReady)}
            />

            {isHost && (
              <Button
                variant="success"
                fullWidth
                disabled={!allPlayersReady}
                onClick={handleStartGame}
              >
                Lancer la partie
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameRoomPage;
