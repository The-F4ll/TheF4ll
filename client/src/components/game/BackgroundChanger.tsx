import React, { ReactNode } from "react";

type Question = {
  id: string;
  text: string;
  answer: string;
  hint: string;
  background: string;
} | null;

type BackgroundChangerProps = {
  children: ReactNode;
  currentQuestion: Question;
};

const BackgroundChanger: React.FC<BackgroundChangerProps> = ({
  children,
  currentQuestion,
}) => {
  // Mapping des backgrounds selon le type de question
  const getBackgroundStyle = () => {
    if (!currentQuestion) return "bg-gray-900";

    switch (currentQuestion.background) {
      case "terminal":
        return "bg-black";
      case "space":
        return "bg-gradient-to-b from-purple-900 via-blue-900 to-black";
      case "hacker":
        return "bg-gradient-to-r from-green-900 to-black";
      default:
        return "bg-gray-900";
    }
  };

  return (
    <div
      className={`transition-colors duration-1000 min-h-screen ${getBackgroundStyle()}`}
    >
      {children}
    </div>
  );
};

export default BackgroundChanger;
