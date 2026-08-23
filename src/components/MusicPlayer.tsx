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
    <div className="fixed bottom-3 left-4 right-4 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-[640px] z-40 pointer-events-auto select-none">
      {/* Compact Glassmorphism Floating Pill */}
      <div className="relative bg-black/30 backdrop-blur-lg border border-white/[0.08] rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-0.5 transition-all">
        
        {/* Subtle Top Glow Line */}
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

        {/* Single Row: Art | Meta | Controls | Volume | Queue */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Rotating Circular Vinyl Artwork */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-amber-400/30 shadow-sm">
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              className={`w-full h-full object-cover rounded-full ${isPlaying ? 'animate-spin-slow' : ''}`}
              style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              draggable={false}
            />
            {/* Vinyl Spindle Dot */}
            <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-amber-950/90 border border-amber-400/40" />
          </div>

          {/* Song Title & Artist */}
          <div className="min-w-0 flex flex-col justify-center sm:max-w-[160px]">
            <h3 className="text-[11px] sm:text-xs font-semibold font-sans-ui text-amber-100/90 truncate tracking-wide leading-tight">
              {currentTrack.title}
            </h3>
            <p className="text-[9px] sm:text-[10px] text-amber-300/50 truncate font-sans-ui leading-tight">
              {currentTrack.artist}
            </p>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 shrink-0 ml-auto sm:ml-0">
            <button
              onClick={onPrevious}
              className="p-0.5 rounded-full text-amber-200/60 hover:text-amber-100 transition-all active:scale-90"
              title="Previous Track"
              aria-label="Previous track"
            >
              <SkipBack className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.35)] transform hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-950" />
              ) : (
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-950 translate-x-[1px]" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-0.5 rounded-full text-amber-200/60 hover:text-amber-100 transition-all active:scale-90"
              title="Next Track"
              aria-label="Next track"
            >
              <SkipForward className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          {/* Volume (desktop only) */}
          <div className="hidden sm:flex items-center gap-1 shrink-0">
            <button
              onClick={toggleMute}
              className="p-0.5 text-amber-300/50 hover:text-amber-100 transition-colors"
              aria-label="Mute/Unmute"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3 h-3 text-red-400/70" />
              ) : (
                <Volume2 className="w-3 h-3 text-amber-400/70" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setIsMuted(false);
                onVolumeChange(parseFloat(e.target.value));
              }}
              className="w-12 sm:w-14"
            />
          </div>

          {/* Queue Toggle */}
          <button
            onClick={onToggleQueue}
            className={`p-1 sm:p-1.5 rounded-full border transition-all flex items-center justify-center shrink-0 ${
              isQueueOpen
                ? 'bg-amber-500/25 text-amber-100 border-amber-400/40'
                : 'bg-transparent text-amber-300/50 hover:text-amber-100 border-white/[0.06] hover:border-amber-500/20'
            }`}
            title="Playlist Queue"
            aria-label="Toggle playlist queue"
          >
            <ListMusic className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>

        {/* Inline Seek Progress Bar */}
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
