import React from 'react';
import { X, Play, Volume2, ListMusic } from 'lucide-react';
import type { Track } from '../types/music';

interface PlaylistQueueProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  currentTrackId: string;
  onSelectTrack: (track: Track) => void;
  isPlaying: boolean;
  playlistTitle: string;
}

export const PlaylistQueue: React.FC<PlaylistQueueProps> = ({
  isOpen,
  onClose,
  tracks,
  currentTrackId,
  onSelectTrack,
  isPlaying,
  playlistTitle
}) => {
  if (!isOpen) return null;

  const formatDuration = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'Tamil':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Telugu':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Malayalam':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Kannada':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md glass-modal border-l border-amber-500/30 shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <ListMusic className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif-cinzel text-lg font-bold text-amber-100 tracking-wider">
              Playlist Queue
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-amber-300/70 hover:text-amber-100 hover:bg-amber-500/10 transition-colors"
            aria-label="Close queue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist Subtitle */}
        <div className="mb-4">
          <p className="text-xs font-sans-ui text-amber-400/80 font-semibold">
            {playlistTitle}
          </p>
          <p className="text-[11px] text-amber-300/60 font-cormorant italic">
            {tracks.length} South Indian melodies queued
          </p>
        </div>

        {/* Track List */}
        <div className="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
          {tracks.map((track, idx) => {
            const isCurrent = track.id === currentTrackId;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className={`group p-3 rounded-xl transition-all cursor-pointer border flex items-center justify-between ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500/50 shadow-md'
                    : 'bg-amber-950/15 hover:bg-amber-500/10 border-amber-500/15'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Track Number / Playing indicator */}
                  <span className="w-5 text-center text-xs font-mono text-amber-400/60 group-hover:text-amber-300">
                    {isCurrent && isPlaying ? (
                      <Volume2 className="w-4 h-4 text-amber-400 animate-pulse mx-auto" />
                    ) : (
                      idx + 1
                    )}
                  </span>

                  {/* Artwork */}
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-amber-500/20">
                    <img
                      src={track.albumArt}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Play className="w-4 h-4 text-amber-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="min-w-0">
                    <h4 className={`text-xs font-semibold font-sans-ui truncate ${isCurrent ? 'text-amber-100' : 'text-amber-200/90'}`}>
                      {track.title}
                    </h4>
                    <p className="text-[11px] text-amber-400/70 truncate font-sans-ui">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Language Tag & Duration */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-sans-ui font-medium border ${getLanguageColor(track.language)}`}>
                    {track.language}
                  </span>
                  <span className="text-[11px] font-mono text-amber-400/60">
                    {formatDuration(track.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
