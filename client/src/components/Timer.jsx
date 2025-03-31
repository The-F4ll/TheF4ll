import { useEffect, useState } from 'react';

function Timer({ timeRemaining }) {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    setDisplayTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }, [timeRemaining]);

  return (
    <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-mono text-xl">
      {displayTime}
    </div>
  );
}

export default Timer; 