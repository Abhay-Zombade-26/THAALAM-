import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
  Disc3
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
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-5xl z-40 pointer-events-auto select-none">
      {/* Compact Floating Glass Container (80-100px height on desktop) */}
      <div className="relative bg-[#120e10]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-3 sm:px-5 sm:py-3 shadow-[0_15px_40px_rgba(0,0,0,0.85)] flex flex-col gap-1.5 transition-all">
        
        {/* Subtle Gold Glow Top Line */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

        {/* Main Controls Row: Album | Track Meta | Previous | Play/Pause | Next | Volume | Queue */}
        <div className="flex items-center justify-between gap-3 min-h-[44px]">
          
          {/* Left: Album Art + Track Info */}
          <div className="flex items-center gap-3 min-w-0 sm:w-1/3">
            {/* Album Art Thumbnail */}
            <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-amber-500/30 shadow-md group">
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : ''}`}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Disc3 className={`w-5 h-5 text-amber-300 ${isPlaying ? 'animate-spin-slow text-amber-400' : 'opacity-70'}`} />
              </div>
            </div>

            {/* Song Title & Artist */}
            <div className="min-w-0 flex flex-col justify-center">
              <h3 className="text-xs sm:text-sm font-semibold font-sans-ui text-amber-100 truncate tracking-wide">
                {currentTrack.title}
              </h3>
              <p className="text-[11px] text-amber-300/70 truncate font-sans-ui">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Center: Previous | Play/Pause | Next */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={onPrevious}
              className="p-1.5 rounded-full text-amber-200/80 hover:text-amber-100 hover:bg-amber-500/10 transition-all active:scale-90"
              title="Previous Track"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] transform hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-amber-950" />
              ) : (
                <Play className="w-5 h-5 fill-amber-950 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-1.5 rounded-full text-amber-200/80 hover:text-amber-100 hover:bg-amber-500/10 transition-all active:scale-90"
              title="Next Track"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Right: Volume Slider & Queue Toggle */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 sm:w-1/3">
            {/* Volume Control */}
            <div className="hidden md:flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1 text-amber-300/70 hover:text-amber-100 transition-colors"
                aria-label="Mute/Unmute"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
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
                className="w-16 sm:w-20 h-1 bg-amber-950/60 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Queue Toggle Button */}
            <button
              onClick={onToggleQueue}
              className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                isQueueOpen
                  ? 'bg-amber-500/30 text-amber-100 border-amber-400/50 shadow-md'
                  : 'bg-black/30 text-amber-300/80 hover:text-amber-100 hover:bg-amber-500/10 border-amber-500/20'
              }`}
              title="Playlist Queue"
              aria-label="Toggle playlist queue"
            >
              <ListMusic className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>

        {/* Progress / Seek Bar Row */}
        <div className="pt-0.5">
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

