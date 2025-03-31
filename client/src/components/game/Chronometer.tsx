import React, { useMemo } from "react";

type ChronometerProps = {
  time: number;
};

const Chronometer: React.FC<ChronometerProps> = ({ time }) => {
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [time]);

  // Changer la couleur en fonction du temps restant
  const getColorClass = () => {
    if (time <= 10) return "text-red-500";
    if (time <= 30) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="bg-gray-800 bg-opacity-75 rounded-full px-6 py-3 text-center">
      <div className={`text-3xl font-bold font-mono ${getColorClass()}`}>
        {formattedTime}
      </div>
    </div>
  );
};

export default Chronometer;
