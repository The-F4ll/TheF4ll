import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { PlayerProvider } from "./context/PlayerContext";
import { RoomProvider } from "./context/RoomContext";
import { SpectatorProvider } from "./context/SpectatorContext";
import { GameProvider } from "./context/GameContext";
import "./App.css";

function App() {
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
