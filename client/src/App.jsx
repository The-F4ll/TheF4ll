import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import HomePage from './pages/home/HomePage';
import PlayerPage from './pages/player/PlayerPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import GamePage from './pages/game/GamePage';
import PublicPage from './pages/public/PublicPage';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/player" element={<PlayerPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/public" element={<PublicPage />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
