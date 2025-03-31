import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { SpectatorContext } from "../../context/SpectatorContext";
import { RoomContext } from "../../context/RoomContext";

const SpectatorJoinPage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [spectatorName, setSpectatorName] = useState("");
  const { setSpectator } = useContext(SpectatorContext);
  const { joinRoomAsSpectator } = useContext(RoomContext);
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roomCode || !spectatorName) return;

    setSpectator({
      name: spectatorName,
      id: Date.now().toString(),
    });

    const roomId = await joinRoomAsSpectator(roomCode);
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">
        Rejoindre en tant que spectateur
      </h1>
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
          value={spectatorName}
          onChange={(e) => setSpectatorName(e.target.value)}
          placeholder="Entrez votre pseudo"
          required
        />
        <Button variant="primary" type="submit" fullWidth>
          Rejoindre en tant que spectateur
        </Button>
      </form>
    </div>
  );
};

export default SpectatorJoinPage;
