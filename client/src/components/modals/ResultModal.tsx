import React from "react";
import { useNavigate } from "react-router-dom";

type ResultModalProps = {
  isOpen: boolean;
  success: boolean;
  message: string;
  stats?: {
    timeSpent: string;
    questionsAnswered: number;
    hintsUsed: number;
  };
};

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  success,
  message,
  stats,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleContinue = () => {
    if (success) {
      navigate("/results/success");
    } else {
      navigate("/results/failure");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      <div
        className={`${
          success ? "bg-green-900" : "bg-red-900"
        } p-8 rounded-lg shadow-lg z-10 max-w-md w-full mx-4`}
      >
        <div className="text-center">
          {success ? (
            <svg
              className="w-20 h-20 text-green-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-20 h-20 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          )}
          <h2 className="text-2xl font-bold mb-4">
            {success ? "Réussite!" : "Échec!"}
          </h2>
          <p className="mb-6 text-lg">{message}</p>

          {stats && (
            <div className="bg-black bg-opacity-20 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2">Statistiques</h3>
              <ul className="text-left space-y-1">
                <li>Temps écoulé: {stats.timeSpent}</li>
                <li>Questions résolues: {stats.questionsAnswered}</li>
                <li>Indices utilisés: {stats.hintsUsed}</li>
              </ul>
            </div>
          )}

          <button
            className={`${
              success
                ? "bg-green-700 hover:bg-green-800"
                : "bg-red-700 hover:bg-red-800"
            } text-white py-2 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              success ? "focus:ring-green-500" : "focus:ring-red-500"
            }`}
            onClick={handleContinue}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
