import React, { createContext, ReactNode, useEffect, useState } from "react";

type Question = {
  id: string;
  text: string;
  answer: string;
  hint: string;
  background: string;
};

type GameStats = {
  totalTime: string;
  questionsAnswered: number;
  hintsUsed: number;
  penaltiesReceived: number;
  success: boolean;
};

type GameContextType = {
  isGameActive: boolean;
  currentQuestion: Question | null;
  timeRemaining: number;
  gameStats: GameStats | null;
  submitAnswer: (answer: string) => Promise<{ correct: boolean }>;
  requestHint: () => Promise<string>;
  resetGame: () => void;
  isLoading: boolean;
  gameOutcome: "success" | "failure" | null;
};

// Questions d'exemple pour la démo
const sampleQuestions: Question[] = [
  {
    id: "q1",
    text: "Quelle commande permet de voir les fichiers cachés dans un répertoire?",
    answer: "ls -a",
    hint: "C'est une option de la commande ls",
    background: "terminal",
  },
  {
    id: "q2",
    text: "Combien de planètes contient notre système solaire?",
    answer: "8",
    hint: "Pluton n'est plus considérée comme une planète",
    background: "space",
  },
  {
    id: "q3",
    text: "Quel célèbre hacker a fondé WikiLeaks?",
    answer: "Julian Assange",
    hint: "Il s'est réfugié pendant des années à l'ambassade de l'Équateur",
    background: "hacker",
  },
];

const defaultContext: GameContextType = {
  isGameActive: false,
  currentQuestion: null,
  timeRemaining: 0,
  gameStats: null,
  submitAnswer: async () => ({ correct: false }),
  requestHint: async () => "",
  resetGame: () => {},
  isLoading: false,
  gameOutcome: null,
};

export const GameContext = createContext<GameContextType>(defaultContext);

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes par défaut
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [penaltiesReceived, setpenaltiesReceived] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [gameOutcome, setGameOutcome] = useState<"success" | "failure" | null>(
    null
  );

  // Démarrage du jeu
  useEffect(() => {
    if (isGameActive && !currentQuestion) {
      setCurrentQuestionIndex(0);
      setCurrentQuestion(sampleQuestions[0]);
      setTimeRemaining(120);
      setGameStartTime(new Date());
      setHintsUsed(0);
      setQuestionsAnswered(0);
      setpenaltiesReceived(0);
      setGameOutcome(null);
    }
  }, [isGameActive, currentQuestion]);

  // Timer du jeu
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isGameActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isGameActive, timeRemaining]);

  // Navigation vers les écrans de résultat en fonction du résultat
  useEffect(() => {
    if (gameOutcome) {
      // Dans une application réelle, on pourrait utiliser useNavigate ici
      // Pour notre exemple, on simule une redirection après un délai
      setTimeout(() => {
        if (gameOutcome === "success") {
          window.location.href = "/results/success";
        } else {
          window.location.href = "/results/failure";
        }
      }, 1000);
    }
  }, [gameOutcome]);

  const submitAnswer = async (
    answer: string
  ): Promise<{ correct: boolean }> => {
    if (!currentQuestion) return { correct: false };

    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    const isCorrect =
      answer.toLowerCase() === currentQuestion.answer.toLowerCase();

    if (isCorrect) {
      setQuestionsAnswered((prev) => prev + 1);

      // Si c'était la dernière question
      if (currentQuestionIndex >= sampleQuestions.length - 1) {
        endGame(true);
        return { correct: true };
      }

      // Passer à la question suivante
      setIsLoading(true);
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setCurrentQuestion(sampleQuestions[currentQuestionIndex + 1]);
        setIsLoading(false);
      }, 1500);
    }

    return { correct: isCorrect };
  };

  const requestHint = async (): Promise<string> => {
    if (!currentQuestion) return "";

    // Simuler un délai réseau
    await new Promise((resolve) => setTimeout(resolve, 300));

    setHintsUsed((prev) => prev + 1);
    // Un malus de temps pourrait être appliqué ici
    setTimeRemaining((prev) => Math.max(0, prev - 10));

    return currentQuestion.hint;
  };

  const endGame = (success: boolean) => {
    setIsGameActive(false);
    // Définir l'issue du jeu pour la redirection
    setGameOutcome(success ? "success" : "failure");

    if (gameStartTime) {
      const gameEndTime = new Date();
      const totalSeconds = Math.floor(
        (gameEndTime.getTime() - gameStartTime.getTime()) / 1000
      );
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      setGameStats({
        totalTime: `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`,
        questionsAnswered,
        hintsUsed,
        penaltiesReceived: penaltiesReceived,
        success, // Ajout du statut de succès dans les stats
      });
    }
  };

  const resetGame = () => {
    setIsGameActive(false);
    setCurrentQuestion(null);
    setCurrentQuestionIndex(0);
    setTimeRemaining(120);
    setGameStats(null);
    setHintsUsed(0);
    setQuestionsAnswered(0);
    setpenaltiesReceived(0);
    setGameStartTime(null);
    setGameOutcome(null);
  };

  return (
    <GameContext.Provider
      value={{
        isGameActive,
        currentQuestion,
        timeRemaining,
        gameStats,
        submitAnswer,
        requestHint,
        resetGame,
        isLoading,
        gameOutcome,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
