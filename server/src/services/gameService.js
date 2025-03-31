import { GAME_CONFIG } from '../config/constants.js';

export const createGameState = (players) => ({
  board: Array(9).fill(null),
  currentPlayer: players[0].id,
  winner: null,
  isDraw: false,
  lastMove: null,
  moveCount: 0,
  players: players.map(player => ({
    id: player.id,
    name: player.name,
    symbol: player.id === players[0].id ? 1 : 2
  }))
});

export const checkWinner = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
};

export const isBoardFull = (board) => {
  return board.every(cell => cell !== null);
};

export const makeMove = (gameState, index, playerId) => {
  // Vérifier si c'est le tour du joueur
  if (gameState.currentPlayer !== playerId) {
    return false;
  }

  // Vérifier si la case est déjà occupée ou si la partie est terminée
  if (gameState.board[index] || gameState.winner || gameState.isDraw) {
    return false;
  }

  // Trouver le symbole du joueur
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return false;

  const newBoard = [...gameState.board];
  newBoard[index] = player.symbol;

  const winner = checkWinner(newBoard);
  const isDraw = !winner && isBoardFull(newBoard);

  gameState.board = newBoard;
  gameState.currentPlayer = gameState.players.find(p => p.id !== playerId).id;
  gameState.winner = winner;
  gameState.isDraw = isDraw;
  gameState.lastMove = index;
  gameState.moveCount++;

  return true;
};

export const resetGame = (gameState) => {
  gameState.board = Array(9).fill(null);
  gameState.currentPlayer = gameState.players[0].id;
  gameState.winner = null;
  gameState.isDraw = false;
  gameState.lastMove = null;
  gameState.moveCount = 0;
}; 