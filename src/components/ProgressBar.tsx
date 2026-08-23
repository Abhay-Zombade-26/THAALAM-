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
    <div className="flex items-center gap-3 w-full font-sans-ui text-xs text-amber-300/70 select-none">
      <span className="w-10 text-right font-mono text-[11px]">
        {formatTime(currentTime)}
      </span>

      <div
        ref={barRef}
        onClick={handleSeek}
        className="relative flex-1 h-1.5 bg-amber-950/60 hover:h-2.5 rounded-full cursor-pointer overflow-hidden border border-amber-500/20 transition-all group"
      >
        <div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 rounded-full relative group-hover:shadow-[0_0_10px_rgba(245,158,11,0.8)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="w-10 text-left font-mono text-[11px]">
        {formatTime(duration)}
      </span>
    </div>
  );
};
