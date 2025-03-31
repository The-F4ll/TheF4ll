import { useEffect, useRef } from 'react';

function Mountain({ progress }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);

    // Dessiner la montagne
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width * 0.2, height * 0.8);
    ctx.lineTo(width * 0.4, height * 0.6);
    ctx.lineTo(width * 0.6, height * 0.4);
    ctx.lineTo(width * 0.8, height * 0.2);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = '#2D3748';
    ctx.fill();

    // Dessiner la progression
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width * 0.2, height * 0.8);
    ctx.lineTo(width * 0.4, height * 0.6);
    ctx.lineTo(width * 0.6, height * 0.4);
    ctx.lineTo(width * 0.8, height * 0.2);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = '#48BB78';
    ctx.fillRect(0, height * (1 - progress / 100), width, height * (progress / 100));

    // Dessiner les avatars des joueurs
    const playerPositions = [
      { x: width * 0.2, y: height * 0.8 },
      { x: width * 0.4, y: height * 0.6 },
      { x: width * 0.6, y: height * 0.4 },
      { x: width * 0.8, y: height * 0.2 }
    ];

    playerPositions.forEach((pos, index) => {
      if (pos.y >= height * (1 - progress / 100)) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#4299E1';
        ctx.fill();
        ctx.strokeStyle = '#2B6CB0';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }, [progress]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full"
      />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-75 px-4 py-2 rounded-lg">
        <span className="text-white font-bold">Progression: {progress}%</span>
      </div>
    </div>
  );
}

export default Mountain; 