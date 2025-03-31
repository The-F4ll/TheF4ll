import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import RoomCard from "../../components/room/RoomCard";
import { RoomContext } from "../../context/RoomContext";
import { SpectatorContext } from "../../context/SpectatorContext";
import { Room } from "../../types/game.types";

const SpectatorHomePage: React.FC = () => {
  const { spectator, setSpectator } = useContext(SpectatorContext);
  const { joinRoomAsSpectator, room: currentRoom } = useContext(RoomContext);
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [spectatorName, setSpectatorName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer les salles du localStorage
  useEffect(() => {
    const fetchRooms = () => {
      try {
        // Chercher toutes les clés du localStorage qui pourraient être des salles
        const allRooms: Room[] = [];

        // Récupérer la salle actuelle du localStorage
        const savedRoom = localStorage.getItem("currentRoom");
        if (savedRoom) {
          try {
            const parsedRoom = JSON.parse(savedRoom) as Room;

            // Vérifier que c'est bien une salle valide
            if (
              parsedRoom &&
              parsedRoom.id &&
              Array.isArray(parsedRoom.players)
            ) {
              // Éviter les doublons
              if (!allRooms.some((r) => r.id === parsedRoom.id)) {
                allRooms.push(parsedRoom);
              }
            }
          } catch (e) {
            console.error("Erreur lors du parsing de la salle:", e);
          }
        }

        // Si nous avons au moins une salle, mettre à jour l'état
        if (allRooms.length > 0) {
          setRooms(allRooms);
        } else {
          // Si aucune salle n'est trouvée, définir un tableau vide
          setRooms([]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des salles:", error);
        setRooms([]);
      }
    };

    fetchRooms();
    // Actualiser périodiquement pour détecter les nouvelles salles
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, [currentRoom]); // Actualiser quand la salle actuelle change

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpectatorName(e.target.value);
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!spectator && !spectatorName.trim()) {
      alert("Veuillez entrer un nom de spectateur");
      return;
    }

    setIsLoading(true);

    try {
      // Si le spectateur n'existe pas encore, le créer
      if (!spectator) {
        const newSpectator = {
          id: uuidv4(),
          name: spectatorName.trim(),
        };
        setSpectator(newSpectator);
      }

      // Attendre que le state soit mis à jour
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Rejoindre la salle
      await joinRoomAsSpectator(roomId);
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error("Erreur lors de la connexion à la salle:", error);
      alert("Impossible de rejoindre la salle. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour créer une nouvelle salle (pour démonstration en mode développement)
  const handleCreateDemoRoom = () => {
    // Cette fonction est juste pour faciliter les tests pendant le développement
    const demoRooms = [
      {
        id: `demo-${Date.now().toString(36)}`,
        players: [
          {
            id: uuidv4(),
            name: "Joueur Test 1",
            avatar: "avatar1",
            ready: true,
          },
          {
            id: uuidv4(),
            name: "Joueur Test 2",
            avatar: "avatar2",
            ready: false,
          },
        ],
        spectators: [],
        isGameStarted: false,
      },
    ];

    // Ajouter cette salle au localStorage pour la tester
    localStorage.setItem("demoRoom", JSON.stringify(demoRooms[0]));

    // Actualiser la liste
    setRooms((prevRooms) => [...prevRooms, ...demoRooms]);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Mode Spectateur</h1>

      {!spectator ? (
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Entrez votre nom</h2>
          <div className="mb-4">
            <input
              type="text"
              value={spectatorName}
              onChange={handleNameChange}
              placeholder="Votre nom de spectateur"
              className="w-full p-3 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-sm text-gray-400 mb-4">
            En tant que spectateur, vous pourrez observer les parties en cours
            et participer aux votes.
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 p-4 mb-8 rounded-lg">
          <p className="font-medium">
            Connecté en tant que:{" "}
            <span className="font-bold">{spectator.name}</span>
          </p>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="text-center py-8 bg-gray-800 rounded-lg mb-8">
          <p className="text-xl text-gray-400 mb-4">
            Aucune salle disponible pour le moment
          </p>
          <p className="text-sm text-gray-500">
            Les salles apparaîtront ici lorsque des joueurs en créeront.
          </p>

          {/* Bouton pour créer une salle de démo (uniquement en développement) */}
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={handleCreateDemoRoom}
              className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              Créer une salle de démo (dev uniquement)
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Salles en attente de joueurs
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms
                .filter((room) => !room.isGameStarted)
                .map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onJoin={() => handleJoinRoom(room.id)}
                    isLoading={isLoading}
                    type="waiting"
                  />
                ))}
              {rooms.filter((room) => !room.isGameStarted).length === 0 && (
                <p className="text-gray-400 col-span-full">
                  Aucune salle en attente pour le moment
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Parties en cours</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms
                .filter((room) => room.isGameStarted)
                .map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onJoin={() => handleJoinRoom(room.id)}
                    isLoading={isLoading}
                    type="active"
                  />
                ))}
              {rooms.filter((room) => room.isGameStarted).length === 0 && (
                <p className="text-gray-400 col-span-full">
                  Aucune partie en cours pour le moment
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SpectatorHomePage;
