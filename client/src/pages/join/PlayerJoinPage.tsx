import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import AvatarSelector from "../../components/player/AvatarSelector";
import { PlayerContext } from "../../context/PlayerContext";
import { RoomContext } from "../../context/RoomContext";

const PlayerJoinPage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const { setPlayer } = useContext(PlayerContext);
  const { joinRoom } = useContext(RoomContext);
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomCode || !playerName || !selectedAvatar) return;

    setPlayer({
      name: playerName,
      avatar: selectedAvatar,
      ready: false,
      id: Date.now().toString(),
    });

    const roomId = await joinRoom(roomCode);
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Rejoindre une partie</h1>
      <form className="w-full max-w-md space-y-6" onSubmit={handleJoin}>
        <Input
          label="Code de la room"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Entrez le code de la room"
          required
        />
        <Input
          label="Votre pseudo"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Entrez votre pseudo"
          required
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Choisissez un avatar
          </label>
          <AvatarSelector
            selectedAvatar={selectedAvatar}
            onSelect={setSelectedAvatar}
          />
        </div>
        <Button variant="primary" type="submit" fullWidth>
          Rejoindre la salle
        </Button>
      </form>
    </div>
  );
};

export default PlayerJoinPage;
