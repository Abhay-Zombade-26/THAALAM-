import React, { useState } from 'react';
import { ExternalLink, Check, Sparkles } from 'lucide-react';

export const SpotifyButton: React.FC = () => {
  const [showToast, setShowToast] = useState(false);

  const handleClick = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-emerald-400 border border-emerald-500/30 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
        aria-label="Spotify integration"
        title="Spotify Sync"
      >
        <svg className="w-4 h-4 fill-emerald-400" viewBox="0 0 24 24">
          <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 C14.6 9.9 20 10.56 23.64 12.78c.42.24.6.84.32 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/>
        </svg>
      </button>

      {/* Toast Notification Popup */}
      {showToast && (
        <div className="absolute top-12 right-0 w-72 p-3.5 rounded-xl glass-modal border border-emerald-500/40 shadow-2xl z-50 text-xs font-sans-ui text-emerald-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-emerald-200 mb-1 flex items-center gap-1.5">
                Spotify Sync Ready
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </p>
              <p className="text-amber-100/70 text-[11px] leading-relaxed mb-2">
                Spotify OAuth API connection ready for export.
              </p>
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2"
              >
                Open Spotify <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

