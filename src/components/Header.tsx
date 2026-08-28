import React from 'react';
import { Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  listenerCount: number;  // Receive from parent
  spotifyUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenSettings, 
  listenerCount,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between pointer-events-auto select-none">
      {/* Top Left: THAALAM Logo */}
      <div className="flex flex-col items-center gap-1">
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400/70"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l1.09 3.26L16 6l-2.18 1.74L14.54 11 12 9.27 9.46 11l.72-3.26L8 6l2.91-.74L12 2zm-4 12l.55 1.63L10 16.5l-1.09.87.36-1.63L8 15l1.45-.37L10 13zm8 0l.55 1.63L18 16.5l-1.09.87.36-1.63L16 15l1.45-.37L18 13zM12 17l.55 1.63L14 19.5l-1.09.87.36-1.63L12 18l-1.27.74.36 1.63L10 19.5l1.45-.87L12 17z" />
        </svg>
        <span
          className="font-serif-cinzel text-base sm:text-lg font-semibold tracking-[0.35em] text-amber-50/90"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
        >
          THAALAM
        </span>
      </div>

      {/* Top Right */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Listener Counter */}
        <div
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-sans-ui font-medium tracking-wide"
          style={{
            background: 'rgba(15, 12, 10, 0.75)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(217, 119, 6, 0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
          title="Active Listeners Online"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-amber-50/95">
            <span className="font-semibold">{listenerCount}</span> listening
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all active:scale-95 hover:brightness-125"
          style={{
            background: 'rgba(15, 12, 10, 0.7)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(217, 119, 6, 0.2)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
          title="Playlist Settings"
          aria-label="Playlist settings"
        >
          <Settings className="w-4 h-4 text-amber-200/80" />
        </button>
      </div>
    </header>
  );
};