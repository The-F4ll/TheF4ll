import React from "react";

type HintModalProps = {
  isOpen: boolean;
  onClose: () => void;
  hint: string;
};

const HintModal: React.FC<HintModalProps> = ({ isOpen, onClose, hint }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-yellow-900 p-6 rounded-lg shadow-lg z-10 max-w-md w-full mx-4">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-yellow-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 className="text-xl font-bold mb-4">Indice</h2>
          <p className="mb-6 text-yellow-100 italic">{hint}</p>
          <div className="text-sm text-yellow-300 mb-4">
            Attention: utiliser un indice réduit votre temps de jeu!
          </div>
          <button
            className="bg-yellow-700 hover:bg-yellow-800 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400"
            onClick={onClose}
          >
            Compris
          </button>
        </div>
      </div>
    </div>
  );
};

export default HintModal;
