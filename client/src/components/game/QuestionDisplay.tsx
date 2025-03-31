import React from "react";

type Question = {
  id: string;
  text: string;
  answer: string;
  hint: string;
  background: string;
};

type QuestionDisplayProps = {
  question: Question | null;
};

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  if (!question) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-400">Chargement de la question...</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Question</h2>
      <p className="text-xl">{question.text}</p>
    </div>
  );
};

export default QuestionDisplay;
