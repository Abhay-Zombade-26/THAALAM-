import React from 'react';
import { Settings } from 'lucide-react';
import { SpotifyButton } from './SpotifyButton';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between pointer-events-auto select-none">
      {/* Top Left: Small Elegant THAALAM Wordmark */}
      <div className="flex items-center">
        <span className="font-serif-cinzel text-sm sm:text-base font-semibold tracking-[0.3em] text-amber-100/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
          THAALAM
        </span>
      </div>

      {/* Top Right: Subtle Listener Count + Spotify + Settings */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Minimal Listener Dot */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/20 text-amber-200/70 text-[10px] sm:text-[11px] font-sans-ui border border-white/[0.06] backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="font-medium tracking-wide opacity-80">
            <span className="text-amber-100/90 font-semibold">247</span> listening
          </span>
        </div>

        {/* Spotify Icon — smaller */}
        <SpotifyButton />

        {/* Settings Icon — smaller */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-full bg-black/20 hover:bg-black/35 text-amber-200/60 hover:text-amber-100/80 border border-white/[0.06] backdrop-blur-sm transition-all active:scale-95 flex items-center justify-center"
          title="Playlist Settings"
          aria-label="Playlist settings"
        >
          <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300/60" />
        </button>
      </div>
    </header>
  );
};
