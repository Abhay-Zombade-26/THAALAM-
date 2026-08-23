import React, { useRef } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (newTime: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek
}) => {
  const barRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * duration);
  };

  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 w-full font-sans-ui text-amber-300/40 select-none">
      <span className="w-8 text-right font-mono text-[9px] sm:text-[10px]">
        {formatTime(currentTime)}
      </span>

      <div
        ref={barRef}
        onClick={handleSeek}
        className="relative flex-1 h-1 hover:h-1.5 bg-white/[0.08] rounded-full cursor-pointer overflow-hidden transition-all group"
      >
        <div
          className="h-full bg-gradient-to-r from-amber-600/80 via-amber-400/90 to-amber-300/80 rounded-full relative group-hover:shadow-[0_0_8px_rgba(245,158,11,0.6)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="w-8 text-left font-mono text-[9px] sm:text-[10px]">
        {formatTime(duration)}
      </span>
    </div>
  );
};
