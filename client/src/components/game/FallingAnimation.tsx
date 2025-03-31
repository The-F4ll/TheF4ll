import React, { useEffect, useState } from "react";

type FallingAnimationProps = {
  active: boolean;
};

const FallingAnimation: React.FC<FallingAnimationProps> = ({ active }) => {
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!active) return;

    const fallingInterval = setInterval(() => {
      setPosition((prev) => {
        // Si on atteint le bas, on revient en haut
        if (prev >= 100) {
          return 0;
        }
        return prev + speed;
      });
    }, 100);

    // Variation aléatoire de la vitesse pour simuler des "secousses"
    const speedInterval = setInterval(() => {
      setSpeed(1 + Math.random() * 2);
    }, 3000);

    return () => {
      clearInterval(fallingInterval);
      clearInterval(speedInterval);
    };
  }, [active, speed]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Élément qui "tombe" */}
      <div
        className="absolute inset-x-0 h-screen w-full"
        style={{
          top: `${position - 100}vh`,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23333' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          opacity: 0.5,
        }}
      />

      {/* Lignes de code qui tombent (effet matrix) */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 bg-green-500 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${(position + i * 10) % 100}%`,
              height: `${20 + Math.random() * 30}px`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FallingAnimation;
