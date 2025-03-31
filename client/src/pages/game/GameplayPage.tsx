import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AnswerInput from "../../components/game/AnswerInput";
import BackgroundChanger from "../../components/game/BackgroundChanger";
import Chronometer from "../../components/game/Chronometer";
import FallingAnimation from "../../components/game/FallingAnimation";
import QuestionDisplay from "../../components/game/QuestionDisplay";
import ErrorModal from "../../components/modals/ErrorModal";
import HintModal from "../../components/modals/HintModal";
import PenaltyModal from "../../components/modals/PenaltyModal";
import VoteSystem from "../../components/spectator/VoteSystem";
import { GameContext } from "../../context/GameContext";
import { PlayerContext } from "../../context/PlayerContext";
import { SpectatorContext } from "../../context/SpectatorContext";

const GameplayPage = () => {
  const { roomId } = useParams();
  const {
    currentQuestion,
    timeRemaining,
    submitAnswer,
    requestHint,
    isLoading,
  } = useContext(GameContext);
  const { player } = useContext(PlayerContext);
  const { spectator } = useContext(SpectatorContext);
  const [answer, setAnswer] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [currentHint, setCurrentHint] = useState("");
  const [currentPenalty, setCurrentPenalty] = useState("");

  const isSpectator = !!spectator?.id;

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    const result = await submitAnswer(answer);
    if (!result.correct) {
      setShowErrorModal(true);
    }
    setAnswer("");
  };

  const handleRequestHint = async () => {
    const hint = await requestHint();
    setCurrentHint(hint);
    setShowHintModal(true);
  };

  // Simulation d'un événement de pénalité
  useEffect(() => {
    const penaltyInterval = setInterval(() => {
      const random = Math.random();
      if (random < 0.1 && !showPenaltyModal) {
        setCurrentPenalty("Temps réduit de 10 secondes!");
        setShowPenaltyModal(true);
      }
    }, 15000);

    return () => clearInterval(penaltyInterval);
  }, [showPenaltyModal]);

  // Obtenir la couleur de l'avatar basée sur l'ID
  const getAvatarColor = () => {
    type AvatarType =
      | "avatar1"
      | "avatar2"
      | "avatar3"
      | "avatar4"
      | "avatar5"
      | "avatar6";

    const avatarColors: Record<AvatarType, string> = {
      avatar1: "bg-red-500",
      avatar2: "bg-blue-500",
      avatar3: "bg-green-500",
      avatar4: "bg-yellow-500",
      avatar5: "bg-purple-500",
      avatar6: "bg-pink-500",
    };

    return player?.avatar
      ? avatarColors[player.avatar as AvatarType] || "bg-gray-500"
      : "bg-gray-500";
  };

  return (
    <BackgroundChanger currentQuestion={currentQuestion}>
      <div className="container mx-auto min-h-screen relative overflow-hidden">
        <FallingAnimation active={true} />

        {/* Barre d'informations joueur/spectateur en haut */}
        <div className="absolute top-0 left-0 right-0 bg-gray-900 bg-opacity-70 p-3 z-20">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              {!isSpectator && player ? (
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 ${getAvatarColor()} rounded-full flex items-center justify-center text-sm font-bold mr-2`}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                    S
                  </div>
                  <span className="font-medium">
                    Spectateur: {spectator?.name}
                  </span>
                </div>
              )}
            </div>
            <div>
              <span className="text-sm bg-gray-800 px-2 py-1 rounded">
                Salle: {roomId}
              </span>
            </div>
          </div>
        </div>

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-30">
            <div className="text-center">
              <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg">Chargement de la prochaine énigme...</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 mt-12">
          <div className="mb-8">
            <Chronometer time={timeRemaining} />
          </div>

          <div className="w-full max-w-2xl bg-gray-800 bg-opacity-80 p-6 rounded-lg mb-8">
            <QuestionDisplay question={currentQuestion} />
          </div>

          {!isSpectator ? (
            <div className="w-full max-w-2xl">
              <AnswerInput
                value={answer}
                onChange={setAnswer}
                onSubmit={handleSubmitAnswer}
                disabled={isLoading}
              />
              <button
                onClick={handleRequestHint}
                className={`mt-4 text-yellow-400 underline ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-yellow-300"
                }`}
                disabled={isLoading}
              >
                Obtenir un indice
              </button>
            </div>
          ) : (
            <VoteSystem roomId={roomId as string} />
          )}
        </div>

        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
        />

        <HintModal
          isOpen={showHintModal}
          onClose={() => setShowHintModal(false)}
          hint={currentHint}
        />

        <PenaltyModal
          isOpen={showPenaltyModal}
          onClose={() => setShowPenaltyModal(false)}
          penalty={currentPenalty}
        />
      </div>
    </BackgroundChanger>
  );
};

export default GameplayPage;
