import React, { useState } from 'react';
import { X, Video, Music2, Sparkles, ArrowRight, Check } from 'lucide-react';
import { PRESET_PLAYLISTS, DEFAULT_PLAYLIST_LINK } from '../data/defaultPlaylist';

interface PlaylistSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlaylistId: string;
  onLoadPlaylist: (playlistInput: string, title?: string) => void;
}

export const PlaylistSettings: React.FC<PlaylistSettingsProps> = ({
  isOpen,
  onClose,
  currentPlaylistId,
  onLoadPlaylist
}) => {
  const [inputValue, setInputValue] = useState(DEFAULT_PLAYLIST_LINK);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    onLoadPlaylist(inputValue.trim());
    setStatusMessage('Playlist updated successfully!');
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  const handleSelectPreset = (preset: typeof PRESET_PLAYLISTS[0]) => {
    setInputValue(preset.url);
    onLoadPlaylist(preset.id, preset.name);
    setStatusMessage(`Loaded preset: ${preset.name}`);
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-lg glass-modal rounded-2xl p-6 sm:p-8 text-amber-50 border border-amber-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top amber glow line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 opacity-80" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-amber-300/70 hover:text-amber-100 hover:bg-amber-500/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-cinzel text-xl font-bold tracking-wider text-amber-100">
              Play Your Playlist
            </h2>
            <p className="font-sans-ui text-xs text-amber-400/70">
              Paste any YouTube Playlist link or ID to stream your custom rhythm
            </p>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-sans-ui flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-sans-ui font-medium text-amber-200/90 mb-1.5 uppercase tracking-wider">
              YouTube Playlist ID or URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. PLvsOMQWnCsyXTSZ1IIk6cm-dGSwpUqFOV"
                className="w-full px-4 py-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-100 placeholder-amber-500/40 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-amber-950 font-sans-ui font-semibold text-sm tracking-wider uppercase shadow-lg shadow-amber-950/50 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Load Playlist</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        {/* Presets */}
        <div>
          <h3 className="text-xs font-sans-ui font-semibold text-amber-300/80 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Featured South Indian Collections
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {PRESET_PLAYLISTS.map((preset) => {
              const isSelected = currentPlaylistId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-100'
                      : 'bg-amber-950/10 hover:bg-amber-500/10 border-amber-500/15 text-amber-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Music2 className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-amber-500/60 group-hover:text-amber-400'}`} />
                    <div>
                      <div className="text-xs font-semibold text-amber-100 font-sans-ui">
                        {preset.name}
                      </div>
                      <div className="text-[11px] text-amber-400/60 line-clamp-1">
                        {preset.desc}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-sans-ui font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
