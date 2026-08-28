import React, { useState } from 'react';
import { X, Video, Music2, Sparkles, ArrowRight, Check, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { PRESET_PLAYLISTS, DEFAULT_PLAYLIST_ID } from '../data/defaultPlaylist';
import { parseYouTubeInput } from '../services/youtube';

interface PlaylistSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlaylistId: string;
  onLoadPlaylist: (playlistInput: string, title?: string) => Promise<{ success: boolean; error?: string; count?: number }>;
  onResetToDefault: () => void;
  isCustomPlaylist: boolean;
}

export const PlaylistSettings: React.FC<PlaylistSettingsProps> = ({
  isOpen,
  onClose,
  currentPlaylistId,
  onLoadPlaylist,
  onResetToDefault,
  isCustomPlaylist
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const parsed = parseYouTubeInput(inputValue);
    if (parsed.type === 'invalid' || !parsed.id) {
      setErrorMessage(parsed.error || 'Please enter a valid YouTube Playlist URL or ID.');
      return;
    }

    if (parsed.type === 'default') {
      onResetToDefault();
      setSuccessMessage('Restored default South Indian playlist!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1200);
      return;
    }

    setIsLoading(true);
    try {
      const result = await onLoadPlaylist(inputValue.trim());
      if (result.success) {
        setSuccessMessage(`Loaded ${result.count || ''} songs from your YouTube playlist!`);
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1400);
      } else {
        setErrorMessage(result.error || 'Could not load YouTube playlist. Please check if it is Public or Unlisted.');
      }
    } catch {
      setErrorMessage('Failed to connect to YouTube. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = async (preset: typeof PRESET_PLAYLISTS[0]) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (preset.id === DEFAULT_PLAYLIST_ID) {
      onResetToDefault();
      setSuccessMessage('Active: Default South Indian Playlist');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1000);
      return;
    }

    setInputValue(preset.url);
    setIsLoading(true);
    try {
      const result = await onLoadPlaylist(preset.id, preset.name);
      if (result.success) {
        setSuccessMessage(`Loaded preset: ${preset.name}`);
        setTimeout(() => {
          setSuccessMessage(null);
          onClose();
        }, 1200);
      } else {
        setErrorMessage(result.error || 'Failed to load preset playlist.');
      }
    } catch {
      setErrorMessage('Failed to load preset playlist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreDefault = () => {
    setErrorMessage(null);
    onResetToDefault();
    setSuccessMessage('Restored default South Indian playlist!');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-lg glass-modal rounded-2xl p-6 sm:p-8 text-amber-50 border border-amber-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden"
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
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-cinzel text-xl font-bold tracking-wider text-amber-100">
              Play Your Playlist
            </h2>
            <p className="font-sans-ui text-xs text-amber-400/70">
              Enter any YouTube Playlist URL or ID to stream your custom music
            </p>
          </div>
        </div>

        {/* Reset to Default Button (if custom is active) */}
        {isCustomPlaylist && (
          <div className="mb-4">
            <button
              onClick={handleRestoreDefault}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-sans-ui font-medium transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch Back to Default South Indian Playlist</span>
            </button>
          </div>
        )}

        {/* Status / Success Toast */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-sans-ui flex items-center gap-2 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Toast */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-sans-ui flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-sans-ui font-medium text-amber-200/90 mb-1.5 uppercase tracking-wider">
              YouTube Playlist Link or ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading}
                placeholder="https://www.youtube.com/playlist?list=PLvsOMQWnCsyXTSZ1..."
                className="w-full px-4 py-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-100 placeholder-amber-500/40 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-amber-300/50 mt-1 font-sans-ui">
              Tip: Supports playlist URLs, watch URLs with list parameter, or raw playlist IDs.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`w-full py-2.5 px-4 rounded-xl font-sans-ui font-semibold text-xs tracking-wider uppercase shadow-lg transition-all flex items-center justify-center gap-2 ${
              isLoading || !inputValue.trim()
                ? 'bg-amber-950/50 text-amber-400/40 border border-amber-500/10 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-amber-950 shadow-amber-950/50 hover:shadow-amber-500/20 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                <span>Loading Playlist from YouTube...</span>
              </>
            ) : (
              <>
                <span>Load & Play Playlist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Presets */}
        <div>
          <h3 className="text-[11px] font-sans-ui font-semibold text-amber-300/80 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Curated South Indian Collections
          </h3>
          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {PRESET_PLAYLISTS.map((preset) => {
              const isSelected = currentPlaylistId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-center justify-between group ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-100 shadow-sm'
                      : 'bg-amber-950/10 hover:bg-amber-500/10 border-amber-500/15 text-amber-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Music2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-amber-500/60 group-hover:text-amber-400'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-amber-100 font-sans-ui truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-amber-400/60 truncate">
                        {preset.desc}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] uppercase font-sans-ui font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0 ml-2">
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
