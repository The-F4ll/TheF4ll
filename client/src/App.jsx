import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomList from './components/RoomList';
import GamePage from './components/GamePage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomList />} />
        <Route path="/room/:roomId" element={<GamePage />} />
      </Routes>
    </Router>
  );
};

export default App;
