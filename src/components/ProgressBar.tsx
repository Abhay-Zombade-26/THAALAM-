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
    <div className="flex items-center gap-2.5 w-full font-sans-ui select-none">
      <span className="w-8 text-right font-mono text-[10px] sm:text-[11px] text-amber-400/60 tabular-nums">
        {formatTime(currentTime)}
      </span>

      <div
        ref={barRef}
        onClick={handleSeek}
        className="relative flex-1 h-1 hover:h-1.5 rounded-full cursor-pointer overflow-hidden transition-all group"
        style={{ background: 'rgba(120, 53, 15, 0.35)' }}
      >
        <div
          className="h-full rounded-full relative transition-shadow group-hover:shadow-[0_0_8px_rgba(245,158,11,0.6)]"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
          }}
        />
      </div>

      <span className="w-8 text-left font-mono text-[10px] sm:text-[11px] text-amber-400/60 tabular-nums">
        {formatTime(duration)}
      </span>
    </div>
  );
};
