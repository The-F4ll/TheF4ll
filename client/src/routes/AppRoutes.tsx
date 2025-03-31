import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import PlayerJoinPage from "../pages/join/PlayerJoinPage";
import SpectatorJoinPage from "../pages/join/SpectatorJoinPage";
import GameRoomPage from "../pages/room/GameRoomPage";
import GameplayPage from "../pages/game/GameplayPage";
import SuccessPage from "../pages/results/SuccessPage";
import FailurePage from "../pages/results/FailurePage";
import SpectatorHomePage from "../pages/spectator/SpectatorHomePage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/join/player" element={<PlayerJoinPage />} />
      <Route path="/join/spectator" element={<SpectatorJoinPage />} />
      <Route path="/room/:roomId" element={<GameRoomPage />} />
      <Route path="/game/:roomId" element={<GameplayPage />} />
      <Route path="/results/success" element={<SuccessPage />} />
      <Route path="/results/failure" element={<FailurePage />} />
      <Route path="/spectator" element={<SpectatorHomePage />} />
    </Routes>
  );
};

export default AppRoutes;
