import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Radio, 
  Check, 
  AlertCircle, 
  Loader2, 
  Save, 
  RefreshCw, 
  ArrowLeft,
  Settings,
  Sparkles,
  Video
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { 
  type WebsiteSettings, 
  subscribeToWebsiteSettings, 
  updateWebsiteSettings 
} from '../../services/settingsService';
import { parseYouTubeInput } from '../../services/youtube';
import { PRESET_PLAYLISTS, DEFAULT_PLAYLIST_ID } from '../../data/defaultPlaylist';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onBackToSite: () => void;
  listenerCount: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onBackToSite,
  listenerCount
}) => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [playlistInput, setPlaylistInput] = useState('');
  const [spotifyInput, setSpotifyInput] = useState('');
  const [taglineInput, setTaglineInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Subscribe to Firestore settings
  useEffect(() => {
    const unsubscribe = subscribeToWebsiteSettings((data) => {
      setSettings(data);
      setPlaylistInput(data.defaultPlaylistUrl || data.defaultPlaylistId);
      setSpotifyInput(data.spotifyUrl || 'https://open.spotify.com');
      setTaglineInput(data.tagline || 'One South. Many Languages. One Rhythm.');
    });

    return () => unsubscribe();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const parsed = parseYouTubeInput(playlistInput);
    if (parsed.type === 'invalid' || !parsed.id) {
      setSaveError(parsed.error || 'Invalid YouTube playlist link or ID. Please check the URL.');
      return;
    }

    setIsSaving(true);
    try {
      const playlistId = parsed.id;
      const playlistUrl = parsed.url;

      const res = await updateWebsiteSettings(
        {
          defaultPlaylistId: playlistId,
          defaultPlaylistUrl: playlistUrl,
          spotifyUrl: spotifyInput.trim() || 'https://open.spotify.com',
          tagline: taglineInput.trim() || 'One South. Many Languages. One Rhythm.'
        },
        user.email || undefined
      );

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setSaveError(res.error || 'Could not update settings in Firestore.');
      }
    } catch {
      setSaveError('Failed to save settings. Please check Firestore permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_PLAYLISTS[0]) => {
    setPlaylistInput(preset.url);
  };

  return (
    <div className="min-h-screen bg-[#0b090a] text-amber-50 font-sans-ui p-4 sm:p-8 flex flex-col items-center select-none">
      {/* Top Header Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-amber-500/20 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSite}
            className="p-2 rounded-xl bg-amber-950/30 hover:bg-amber-500/10 text-amber-300 border border-amber-500/20 transition-all flex items-center gap-2 text-xs"
            title="Return to THAALAM"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to THAALAM</span>
          </button>
          <div className="h-4 w-[1px] bg-amber-500/30 hidden sm:block" />
          <h1 className="font-serif-cinzel text-lg sm:text-xl font-bold tracking-wider text-amber-100 flex items-center gap-2">
            <span>THAALAM</span>
            <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Admin Console
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-amber-200 font-medium truncate max-w-[200px]">
              {user.email}
            </p>
            <p className="text-[10px] text-amber-400/60 font-mono">
              Authenticated Admin
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-200 hover:text-red-100 border border-red-500/30 text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="w-full max-w-5xl space-y-6">
        
        {/* Status Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Active Presence Metric */}
          <div className="p-5 rounded-2xl bg-[#140f12]/80 backdrop-blur-xl border border-amber-500/20 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-400/70 uppercase font-semibold tracking-wider">
                Real-Time Listeners
              </span>
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-serif-cinzel text-amber-100">
                {listenerCount}
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                Active Connections
              </span>
            </div>
            <p className="text-[11px] text-amber-400/50 mt-1">
              Synced via Firebase Realtime Database
            </p>
          </div>

          {/* Current Playlist ID Metric */}
          <div className="p-5 rounded-2xl bg-[#140f12]/80 backdrop-blur-xl border border-amber-500/20 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-400/70 uppercase font-semibold tracking-wider">
                Default Playlist
              </span>
              <Video className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-sm font-mono text-amber-200 truncate" title={settings?.defaultPlaylistId}>
              {settings?.defaultPlaylistId || DEFAULT_PLAYLIST_ID}
            </div>
            <p className="text-[11px] text-amber-400/50 mt-1">
              Stored in Cloud Firestore
            </p>
          </div>

          {/* System Status */}
          <div className="p-5 rounded-2xl bg-[#140f12]/80 backdrop-blur-xl border border-amber-500/20 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-400/70 uppercase font-semibold tracking-wider">
                Cloud Sync
              </span>
              <RefreshCw className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Live & Connected</span>
            </div>
            <p className="text-[11px] text-amber-400/50 mt-1">
              Changes broadcast automatically
            </p>
          </div>
        </div>

        {/* Edit Configuration Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#140f12]/90 backdrop-blur-2xl border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-cinzel text-lg font-bold tracking-wide text-amber-100">
                Website Music & Playlist Configuration
              </h2>
              <p className="text-xs text-amber-400/70">
                Manage the default YouTube playlist and metadata broadcasted to all THAALAM visitors
              </p>
            </div>
          </div>

          {/* Success Toast */}
          {saveSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-sans-ui flex items-center gap-2.5 animate-in fade-in">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-200">Settings successfully saved to Firestore!</p>
                <p className="text-emerald-300/80 text-[11px]">All active visitors will immediately load the updated playlist.</p>
              </div>
            </div>
          )}

          {/* Error Toast */}
          {saveError && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-sans-ui flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* YouTube Playlist URL / ID */}
            <div>
              <label className="block text-xs font-semibold text-amber-200/90 mb-2 uppercase tracking-wider">
                Default YouTube Playlist Link or ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={playlistInput}
                  onChange={(e) => {
                    setPlaylistInput(e.target.value);
                    if (saveError) setSaveError(null);
                  }}
                  disabled={isSaving}
                  placeholder="https://www.youtube.com/playlist?list=PLvsOMQWnCsyXTSZ1..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-100 placeholder-amber-500/40 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-amber-400/60 mt-1.5">
                Paste any YouTube Playlist URL, Watch link with &list=, or raw Playlist ID (e.g. PL...).
              </p>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-amber-300/70 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick-Set Curated South Indian Playlists
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_PLAYLISTS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-left p-2.5 rounded-xl bg-amber-950/20 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-200 text-xs transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-amber-100 truncate group-hover:text-amber-300">
                        {preset.name}
                      </p>
                      <p className="text-[10px] text-amber-400/60 truncate font-mono">
                        {preset.id}
                      </p>
                    </div>
                    <span className="text-[10px] font-sans text-amber-400/80 px-2 py-0.5 rounded bg-amber-500/10 shrink-0 ml-2">
                      Use
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Spotify Link */}
              <div>
                <label className="block text-xs font-semibold text-amber-200/90 mb-2 uppercase tracking-wider">
                  Spotify Profile / Playlist URL
                </label>
                <input
                  type="url"
                  value={spotifyInput}
                  onChange={(e) => setSpotifyInput(e.target.value)}
                  disabled={isSaving}
                  placeholder="https://open.spotify.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-100 placeholder-amber-500/40 text-xs focus:outline-none focus:border-amber-400 transition-all font-mono"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold text-amber-200/90 mb-2 uppercase tracking-wider">
                  Hero Tagline
                </label>
                <input
                  type="text"
                  value={taglineInput}
                  onChange={(e) => setTaglineInput(e.target.value)}
                  disabled={isSaving}
                  placeholder="One South. Many Languages. One Rhythm."
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-100 placeholder-amber-500/40 text-xs focus:outline-none focus:border-amber-400 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-3.5 px-6 rounded-xl font-sans-ui font-semibold text-xs tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2 ${
                  isSaving
                    ? 'bg-amber-950/50 text-amber-400/40 border border-amber-500/10 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-amber-950 shadow-amber-950/50 hover:shadow-amber-500/25 active:scale-[0.99]'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-950" />
                    <span>Saving to Firestore Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Publish Changes to THAALAM</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
