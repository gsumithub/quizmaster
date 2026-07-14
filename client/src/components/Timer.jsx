import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const Timer = ({ initialSeconds, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = (secondsLeft / initialSeconds) * 100;

  // Determine color based on time left
  let progressColor = 'bg-emerald-500';
  let textColor = 'text-emerald-400';
  let bgColor = 'border-emerald-500/20';

  if (secondsLeft < initialSeconds * 0.25) {
    progressColor = 'bg-red-500 animate-pulse';
    textColor = 'text-red-400 animate-pulse';
    bgColor = 'border-red-500/20';
  } else if (secondsLeft < initialSeconds * 0.5) {
    progressColor = 'bg-amber-500';
    textColor = 'text-amber-400';
    bgColor = 'border-amber-500/20';
  }

  return (
    <div className={`glass-panel border ${bgColor} px-4 py-3 rounded-2xl flex items-center space-x-4 shadow-xl transition-colors duration-300`}>
      <Clock className={`h-5 w-5 ${textColor}`} />
      <div className="flex-1 min-w-[80px]">
        <div className="text-xs text-dark-400 font-semibold uppercase tracking-wider">Time Remaining</div>
        <div className={`text-2xl font-bold font-mono tracking-tight ${textColor}`}>
          {formatTime(secondsLeft)}
        </div>
      </div>
      <div className="w-16 h-1.5 bg-dark-800 rounded-full overflow-hidden hidden sm:block">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${progressColor}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Timer;
