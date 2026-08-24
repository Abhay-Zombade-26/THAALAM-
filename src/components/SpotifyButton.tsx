import React from 'react';

export const SpotifyButton: React.FC = () => {
  return (
    <button
      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all active:scale-95 hover:brightness-125"
      style={{
        background: 'rgba(15, 12, 10, 0.7)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(217, 119, 6, 0.2)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
      aria-label="Spotify integration"
      title="Spotify Sync"
      onClick={() => {
        window.open('https://open.spotify.com', '_blank', 'noopener,noreferrer');
      }}
    >
      <svg className="w-4 h-4 fill-emerald-400" viewBox="0 0 24 24">
        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C14.6 9.9 20 10.56 23.64 12.78c.42.24.6.84.32 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/>
      </svg>
    </button>
  );
};
