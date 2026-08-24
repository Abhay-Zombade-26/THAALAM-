import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic
} from 'lucide-react';
import type { Track } from '../types/music';
import { ProgressBar } from './ProgressBar';

interface MusicPlayerProps {
  currentTrack: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onToggleQueue: () => void;
  isQueueOpen: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolumeChange,
  onToggleQueue,
  isQueueOpen
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVol, setPrevVol] = useState(volume);

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange(prevVol || 0.85);
    } else {
      setPrevVol(volume);
      setIsMuted(true);
      onVolumeChange(0);
    }
  };

  return (
    <div
      className="fixed z-40 pointer-events-auto select-none"
      style={{
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(600px, calc(100vw - 40px))',
      }}
    >
      {/* Dark Warm Glass Player Container */}
      <div
        className="relative flex flex-col gap-1 px-3.5 sm:px-4 py-2.5 sm:py-3 transition-all"
        style={{
          background: 'rgba(12, 9, 8, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(217, 119, 6, 0.18)',
          borderRadius: '20px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Main Row: Art | Meta | Controls | Volume | Queue */}
        <div className="flex items-center gap-2.5 sm:gap-3">

          {/* Album Artwork — Rotating Vinyl ~45px */}
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 border border-amber-500/25 shadow-md">
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
              style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              draggable={false}
            />
            {/* Vinyl Spindle Dot */}
            <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-amber-950/80 border border-amber-400/40" />
          </div>

          {/* Song Title & Artist */}
          <div className="min-w-0 flex flex-col justify-center sm:max-w-[160px]">
            <h3
              className="text-[13px] sm:text-sm font-semibold font-sans-ui text-amber-50/95 truncate tracking-wide leading-tight"
            >
              {currentTrack.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-amber-300/60 truncate font-sans-ui leading-tight mt-0.5">
              {currentTrack.artist}
            </p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 shrink-0 ml-auto sm:ml-0">
            <button
              onClick={onPrevious}
              className="p-1 rounded-full text-amber-200/60 hover:text-amber-100 transition-all active:scale-90"
              title="Previous Track"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Play/Pause — Golden circle ~40px */}
            <button
              onClick={onPlayPause}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
              }}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-950 fill-amber-950" />
              ) : (
                <Play className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-amber-950 fill-amber-950 translate-x-[1px]" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-1 rounded-full text-amber-200/60 hover:text-amber-100 transition-all active:scale-90"
              title="Next Track"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>

          {/* Volume Icon (no slider — matches target) */}
          <button
            onClick={toggleMute}
            className="hidden sm:flex p-1 rounded-full text-amber-300/60 hover:text-amber-200 transition-colors shrink-0"
            aria-label="Mute/Unmute"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400/70" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400/70" />
            )}
          </button>

          {/* Queue Toggle */}
          <button
            onClick={onToggleQueue}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all flex items-center justify-center shrink-0 ${
              isQueueOpen
                ? 'bg-amber-500/25 text-amber-100 border-amber-400/40'
                : 'bg-transparent text-amber-300/50 hover:text-amber-100 border-transparent hover:border-amber-500/20'
            }`}
            title="Playlist Queue"
            aria-label="Toggle playlist queue"
          >
            <ListMusic className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        {/* Progress / Seek Bar */}
        <div className="px-0.5">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
          />
        </div>
      </div>
    </div>
  );
};
