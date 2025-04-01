import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { PlayerProvider } from "./context/PlayerContext";
import { RoomProvider } from "./context/RoomContext";
import { SpectatorProvider } from "./context/SpectatorContext";
import { GameProvider } from "./context/GameContext";
import socketService from "./services/socket";
import "./App.css";

function App() {
  // Initialiser la connexion au démarrage de l'application
  useEffect(() => {
    socketService.connect();

    // Nettoyer la connexion à la fermeture
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <PlayerProvider>
        <SpectatorProvider>
          <RoomProvider>
            <GameProvider>
              <div className="min-h-screen bg-gray-900 text-white">
                <AppRoutes />
              </div>
            </GameProvider>
          </RoomProvider>
        </SpectatorProvider>
      </PlayerProvider>
    </BrowserRouter>
  );
}

export default App;
