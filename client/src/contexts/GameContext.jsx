import { createContext, useContext, useState, useEffect } from 'react';
import { socketService } from '../services/socket';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState({
    currentPlayer: null,
    players: {},
    stage: 'waiting',
    gameOver: false,
    messages: [],
    currentLevel: 1,
    timeElapsed: 0,
    timeLimit: 180,
    completed: false,
    currentRoom: null,
    currentCode: '',
    hints: [],
    mountainProgress: 0,
    isSubmitting: false,
    lastSubmissionTime: null,
    errors: []
  });

  useEffect(() => {
    socketService.connect();

    socketService.onGameUpdate((data) => {
      setGameState(prev => ({
        ...prev,
        players: data.players.reduce((acc, player) => {
          acc[player.id] = player;
          return acc;
        }, {}),
        currentLevel: data.currentLevel,
        messages: data.messages,
        timeLimit: data.timeRemaining
      }));
    });

    socketService.onGameStarted((data) => {
      setGameState(prev => ({
        ...prev,
        stage: 'playing',
        timeElapsed: 0,
        timeLimit: data.timeRemaining
      }));
    });

    socketService.onGameEnded((data) => {
      setGameState(prev => ({
        ...prev,
        stage: 'completed',
        completed: true,
        mountainProgress: 100
      }));
    });

    socketService.onPlayerJoined((data) => {
      setGameState(prev => ({
        ...prev,
        players: {
          ...prev.players,
          [data.playerId]: data.player
        }
      }));
    });

    socketService.onPlayerLeft((data) => {
      setGameState(prev => {
        const newPlayers = { ...prev.players };
        delete newPlayers[data.playerId];
        return {
          ...prev,
          players: newPlayers
        };
      });
    });

    return () => socketService.disconnect();
  }, []);

  const joinRoom = (roomId, playerName) => {
    socketService.joinGame(roomId);
    setGameState(prev => ({
      ...prev,
      currentPlayer: playerName,
      currentRoom: roomId
    }));
  };

  const submitCode = (roomId, code) => {
    if (gameState.stage === 'playing') {
      socketService.makeMove(roomId, {
        type: 'code_submission',
        playerId: gameState.currentPlayer,
        code,
        timestamp: Date.now()
      });
    }
  };

  const startGame = (roomId) => {
    socketService.startGame(roomId);
  };

  const leaveRoom = (roomId) => {
    socketService.leaveGame(roomId);
    setGameState(prev => ({
      ...prev,
      currentPlayer: null,
      currentRoom: null
    }));
  };

  const value = {
    ...gameState,
    joinRoom,
    submitCode,
    startGame,
    leaveRoom
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame doit être utilisé à l\'intérieur d\'un GameProvider');
  }
  return context;
} 