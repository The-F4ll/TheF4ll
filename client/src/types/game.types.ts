// Types pour les joueurs
export interface Player {
  id: string;
  name: string;
  avatar?: string;
  ready: boolean;
  readySince?: Date | string;
  score?: number;
  level?: number;
  role?: string;
  status?: string;
  progress?: number;
  clearedCurrentStage?: boolean;
  currentCode?: string;
  lastSubmission?: Date | string;
  isPenalized?: boolean;
}

// Types pour les spectateurs
export interface Spectator {
  id: string;
  name: string;
  avatar?: string;
  joinedAt?: Date | string;
  status?: string;
  hasVoted?: boolean;
  lastVote?: {
    option: string;
    timestamp: Date | string;
  };
}

// Type pour les paramètres du jeu
export interface GameSettings {
  difficulty: "easy" | "medium" | "hard" | string;
  timeLimit: number;
  autoStart?: boolean;
  maxHints?: number;
  maxVotesPerSpectator?: number;
  stageCount?: number;
  enableSpectatorVoting?: boolean;
}

// Type pour un puzzle/défi de code
export interface CodePuzzle {
  id: string;
  title: string;
  description: string;
  starter_code: string;
  test_cases: Array<{
    input: string;
    expected: string;
  }>;
  difficulty: string;
  hints?: string[];
  category?: string;
  timeLimit?: number;
}

// Type pour un vote
export interface Vote {
  id: string;
  spectatorId: string;
  option: string;
  timestamp: Date | string;
}

// Type pour le stade du jeu
export interface GameStage {
  number: number;
  puzzle: CodePuzzle;
  startTime: Date | string;
  endTime?: Date | string;
  completed: boolean;
  playerProgress: Record<
    string,
    {
      completed: boolean;
      completedAt?: Date | string;
      attempts: number;
    }
  >;
}

// Type pour une salle de jeu complète
export interface Room {
  id: string;
  name: string;
  players: Player[];
  spectators: Spectator[];
  maxPlayers: number;
  isGameStarted: boolean;
  gameSettings: GameSettings;
  createdAt: Date | string;
  updatedAt?: Date | string;
  isPublic: boolean;
  ownerId?: string;
  currentStage?: number;
  stages?: GameStage[];
  votes?: Record<string, Vote[]>;
  status?: "waiting" | "playing" | "paused" | "completed";
  gameData?: {
    startTime?: Date | string;
    endTime?: Date | string;
    winner?: string;
    teamScore?: number;
  };
}
