import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-cyan-400 text-xl tracking-wider animate-pulse-slow">
      <div className="flex flex-col items-end">
        <div className="text-2xl font-bold">
          {time.toLocaleTimeString('en-GB', { hour12: false })}
        </div>
        <div className="text-xs text-gray-400">
          {time.toLocaleDateString('en-GB')}
        </div>
      </div>
    </div>
  );
};

export default Clock;