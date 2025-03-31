import React, { useState } from "react";

type AnswerInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

const AnswerInput: React.FC<AnswerInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !disabled) {
      onSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.value);
    }
  };

  const handleSubmit = () => {
    if (!disabled) {
      onSubmit();
    }
  };

  // Classes dynamiques pour l'état désactivé
  const containerClasses = `p-4 bg-gray-800 bg-opacity-80 rounded-lg transition 
    ${isFocused && !disabled ? "ring-2 ring-blue-500" : ""} 
    ${disabled ? "opacity-70" : ""}`;

  const inputClasses = `flex-1 bg-transparent border-none outline-none text-white text-lg p-2
    ${disabled ? "cursor-not-allowed" : ""}`;

  const buttonClasses = `text-white px-6 py-2 rounded-lg ml-2 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
    ${
      disabled
        ? "bg-gray-600 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`;

  return (
    <div className={containerClasses}>
      <div className="flex items-center">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => !disabled && setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={inputClasses}
          placeholder="Entrez votre réponse..."
          disabled={disabled}
          autoFocus={!disabled}
        />
        <button
          onClick={handleSubmit}
          className={buttonClasses}
          disabled={disabled}
          aria-label="Valider la réponse"
        >
          Valider
        </button>
      </div>
    </div>
  );
};

export default AnswerInput;
