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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setPlayer } = useContext(PlayerContext);
  const { joinRoom } = useContext(RoomContext);
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation de base
    if (!roomCode || !playerName || !selectedAvatar) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    // Réinitialiser l'erreur et activer le chargement
    setError("");
    setIsLoading(true);

    try {
      // Créer d'abord le joueur
      const newPlayer = {
        name: playerName,
        avatar: selectedAvatar,
        ready: false,
        id: Date.now().toString(),
      };

      console.log("Création du joueur:", newPlayer);
      setPlayer(newPlayer);

      // Essayer de rejoindre la room
      console.log("Tentative de rejoindre la room:", roomCode);
      const roomId = await joinRoom(roomCode);

      console.log("Room ID après joinRoom:", roomId);

      // Vérifier si la room ID est valide avant de rediriger
      if (roomId) {
        navigate(`/room/${roomId}`);
      } else {
        console.error("Impossible de rejoindre la room - ID invalide ou null");
        setError(
          "Impossible de rejoindre cette salle. Veuillez vérifier le code et réessayer."
        );
      }
    } catch (error) {
      console.error("Erreur lors de la tentative de rejoindre la room:", error);
      setError("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Rejoindre une partie</h1>

      {error && (
        <div className="bg-red-500 bg-opacity-80 text-white p-3 rounded-md mb-4 w-full max-w-md">
          {error}
        </div>
      )}

      <form className="w-full max-w-md space-y-6" onSubmit={handleJoin}>
        <Input
          label="Code de la room"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Entrez le code de la room"
          required
          disabled={isLoading}
        />
        <Input
          label="Votre pseudo"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Entrez votre pseudo"
          required
          disabled={isLoading}
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Choisissez un avatar
          </label>
          <AvatarSelector
            selectedAvatar={selectedAvatar}
            onSelect={setSelectedAvatar}
            disabled={isLoading}
          />
        </div>
        <Button variant="primary" type="submit" fullWidth disabled={isLoading}>
          {isLoading ? (
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
              Connexion en cours...
            </>
          ) : (
            "Rejoindre la salle"
          )}
        </Button>
      </form>
    </div>
  );
};

export default PlayerJoinPage;
