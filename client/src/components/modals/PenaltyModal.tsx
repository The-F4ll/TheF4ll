import React, { useEffect } from "react";

type PenaltyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  penalty: string;
};

const PenaltyModal: React.FC<PenaltyModalProps> = ({
  isOpen,
  onClose,
  penalty,
}) => {
  // Animation et fermeture automatique
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-purple-900 p-6 rounded-lg shadow-lg z-10 max-w-md w-full mx-4 animate-pulse">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-purple-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <h2 className="text-xl font-bold mb-4">Malus!</h2>
          <div className="text-lg font-semibold text-red-300 mb-6">
            {penalty}
          </div>
          <button
            className="bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            onClick={onClose}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PenaltyModal;
