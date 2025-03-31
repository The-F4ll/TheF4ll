import React, { useEffect } from "react";

type ErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
};

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  message = "Mauvaise réponse! Essayez encore.",
}) => {
  // Fermeture automatique après un délai
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

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
      <div className="bg-red-900 p-6 rounded-lg shadow-lg z-10 max-w-md w-full mx-4 animate-bounce">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
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
          <h2 className="text-xl font-bold mb-4">Erreur!</h2>
          <p className="mb-4">{message}</p>
          <button
            className="bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
