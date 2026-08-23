import React from 'react';
import { Settings } from 'lucide-react';
import { SpotifyButton } from './SpotifyButton';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-5 sm:px-8 py-5 flex items-center justify-between pointer-events-auto select-none">
      {/* Top Left: Small Minimal THAALAM Wordmark */}
      <div className="flex items-center gap-2.5">
        <span className="font-serif-cinzel text-lg sm:text-xl font-bold tracking-[0.25em] text-amber-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          THAALAM
        </span>
      </div>

      {/* Top Right: Minimal Listener Count + Spotify + Settings */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Minimal Listener Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 text-amber-200/90 text-xs font-sans-ui border border-amber-500/20 shadow-lg backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium tracking-wide text-[11px] sm:text-xs">
            <span className="text-amber-100 font-semibold">247</span> listening
          </span>
        </div>

        {/* Spotify Icon Button */}
        <SpotifyButton />

        {/* Settings Icon Button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-amber-200/90 hover:text-amber-100 border border-amber-500/20 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
          title="Playlist Settings"
          aria-label="Playlist settings"
        >
          <Settings className="w-4 h-4 text-amber-300" />
        </button>
      </div>
    </header>
  );
};


