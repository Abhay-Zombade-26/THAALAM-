import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BackgroundVideo } from './components/BackgroundVideo';
import { Header } from './components/Header';
import { MusicPlayer } from './components/MusicPlayer';
import { PlaylistQueue } from './components/PlaylistQueue';
import { PlaylistSettings } from './components/PlaylistSettings';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { defaultPlaylist, DEFAULT_PLAYLIST_ID } from './data/defaultPlaylist';
import type { Track, Playlist } from './types/music';
import { 
  loadYouTubeApi, 
  parseYouTubeInput, 
  fetchVideoMetadata, 
  createTrackFromVideoId 
} from './services/youtube';
import { 
  type WebsiteSettings, 
  subscribeToWebsiteSettings, 
  defaultWebsiteSettings 
} from './services/settingsService';
import { useAuth } from './hooks/useAuth';
import { usePresence } from './hooks/usePresence';

export const App: React.FC = () => {
  // Navigation / Path Routing
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Firebase Realtime Presence Listener Count
  const listenerCount = usePresence();

  // Firebase Authentication for Admin
  const { user, loading: authLoading, error: authError, login, logout } = useAuth();

  // Firestore Website Configuration
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(defaultWebsiteSettings);

  // Playback & Playlist States
  const [playlist, setPlaylist] = useState<Playlist>(defaultPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playbackEngine, setPlaybackEngine] = useState<'default' | 'youtube'>('default');
  const isUserCustomPlaylistRef = useRef(false);

  // Audio & YouTube Player References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode }>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ytPlayerRef = useRef<any>(null);
  const ytPlayerReadyRef = useRef<boolean>(false);
  const ytPollTimerRef = useRef<number | null>(null);

  const currentTrack: Track = playlist.tracks[currentTrackIndex] || playlist.tracks[0];
  const isCustomPlaylist = playlist.id !== defaultPlaylist.id;

  // ─── Listen to browser path changes ───
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // ─── Subscribe to Firestore Website Settings ───
  const isLoadingPlaylistRef = useRef<boolean>(false);
  const lastLoadedPlaylistIdRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('🔄 Subscribing to Firestore settings...');
    
    const unsubscribe = subscribeToWebsiteSettings(async (settings) => {
      console.log('🔥 Firestore settings updated:', settings);
      const playlistIdFromFirestore = settings.defaultPlaylistId?.trim();
      console.log('📀 New playlist ID from Firestore:', playlistIdFromFirestore);
      setWebsiteSettings(settings);

      // Only update if user hasn't loaded an explicit custom playlist in this session
      if (!isUserCustomPlaylistRef.current && playlistIdFromFirestore) {
        if (lastLoadedPlaylistIdRef.current === playlistIdFromFirestore) {
          console.log('ℹ️ Dynamic playlist already loaded:', playlistIdFromFirestore);
          return;
        }

        if (isLoadingPlaylistRef.current) {
          console.log('⏳ Dynamic playlist load already in progress, skipping duplicate');
          return;
        }

        isLoadingPlaylistRef.current = true;
        console.log(`🔄 Loading dynamic playlist from Firestore: [${playlistIdFromFirestore}]`);

        try {
          // Always construct the full YouTube playlist URL
          const fullPlaylistUrl = playlistIdFromFirestore.startsWith('http')
            ? playlistIdFromFirestore
            : `https://www.youtube.com/playlist?list=${playlistIdFromFirestore}`;

          const result = await handleLoadCustomPlaylist(fullPlaylistUrl, 'THAALAM — Featured Rhythm', false);
          if (result.success) {
            lastLoadedPlaylistIdRef.current = playlistIdFromFirestore;
            console.log(`✅ Dynamic playlist loaded successfully: [${playlistIdFromFirestore}]`);
          } else {
            console.warn(`⚠️ Failed to load dynamic playlist from Firestore [${playlistIdFromFirestore}]:`, result.error);
          }
        } catch (err) {
          console.error(`❌ Error loading dynamic playlist from Firestore [${playlistIdFromFirestore}]:`, err);
        } finally {
          isLoadingPlaylistRef.current = false;
        }
      } else if (!isUserCustomPlaylistRef.current && !playlistIdFromFirestore) {
        if (playlist.id !== defaultPlaylist.id) {
          console.log('📀 Firestore playlist is empty, resetting to default playlist');
          handleResetToDefault();
          lastLoadedPlaylistIdRef.current = null;
        }
      } else {
        console.log('👤 User has custom playlist, ignoring Firestore update');
      }
    });

    return () => {
      console.log('🔄 Unsubscribing from Firestore settings');
      unsubscribe();
    };
  }, []); // Empty dependency array - only runs once, keeps listening continuously

  // ─── Initialize YouTube IFrame API and invisible player ───
  useEffect(() => {
    let isMounted = true;

    loadYouTubeApi().then((YT) => {
      if (!isMounted) return;

      if (!ytPlayerRef.current) {
        ytPlayerRef.current = new YT.Player('thaalam-yt-player', {
          height: '1',
          width: '1',
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
            playsinline: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0
          },
          events: {
            onReady: () => {
              ytPlayerReadyRef.current = true;
              if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
                ytPlayerRef.current.setVolume(Math.round(volume * 100));
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onStateChange: (event: any) => {
              const state = event.data;
              if (state === 1) {
                setIsPlaying(true);
                if (ytPlayerRef.current && ytPlayerRef.current.getPlaylistIndex) {
                  const idx = ytPlayerRef.current.getPlaylistIndex();
                  if (idx >= 0 && idx !== currentTrackIndex) {
                    setCurrentTrackIndex(idx);
                  }
                }
              } else if (state === 2) {
                setIsPlaying(false);
              } else if (state === 0) {
                if (ytPlayerRef.current && ytPlayerRef.current.getPlaylist) {
                  const pl = ytPlayerRef.current.getPlaylist();
                  if (!pl || pl.length <= 1) {
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }
                }
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (err: any) => {
              console.warn('YouTube Player notice:', err);
            }
          }
        });
      }
    }).catch((err) => {
      console.warn('Could not initialize YouTube Player API:', err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Initialize HTML5 audio element for Default South Indian Playlist ───
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (playbackEngine === 'default') {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      if (playbackEngine === 'default') {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        } else {
          setDuration(currentTrack.duration);
        }
      }
    };

    const handleEnded = () => {
      if (playbackEngine === 'default') {
        handleNextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [playbackEngine, currentTrack]);

  // ─── Smooth Polling for YouTube Progress ───
  useEffect(() => {
    if (playbackEngine === 'youtube' && isPlaying) {
      ytPollTimerRef.current = window.setInterval(() => {
        const player = ytPlayerRef.current;
        if (!player) return;

        try {
          if (player.getCurrentTime) {
            const cur = player.getCurrentTime();
            if (typeof cur === 'number' && !isNaN(cur)) {
              setCurrentTime(cur);
            }
          }

          if (player.getDuration) {
            const dur = player.getDuration();
            if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
              setDuration(dur);
            }
          }

          if (player.getPlaylistIndex) {
            const idx = player.getPlaylistIndex();
            if (typeof idx === 'number' && idx >= 0 && idx !== currentTrackIndex) {
              setCurrentTrackIndex(idx);
            }
          }
        } catch {
          // Ignore poll errors
        }
      }, 250);
    } else {
      if (ytPollTimerRef.current) {
        clearInterval(ytPollTimerRef.current);
        ytPollTimerRef.current = null;
      }
    }

    return () => {
      if (ytPollTimerRef.current) {
        clearInterval(ytPollTimerRef.current);
        ytPollTimerRef.current = null;
      }
    };
  }, [playbackEngine, isPlaying, currentTrackIndex]);

  // ─── Update Default Audio Source When Track Changes in Default Mode ───
  useEffect(() => {
    if (playbackEngine !== 'default') return;

    const audio = audioRef.current;
    if (!audio) return;

    const src = currentTrack.audioUrl;
    if (src) {
      audio.src = src;
      audio.load();
      setCurrentTime(0);
      setDuration(currentTrack.duration);

      if (isPlaying) {
        audio.play().catch(() => {
          startAmbientSynth();
        });
      }
    } else {
      setDuration(currentTrack.duration);
    }
  }, [currentTrackIndex, playlist, playbackEngine]);

  // ─── Sync Play/Pause with Active Engine & Volume ───
  useEffect(() => {
    if (playbackEngine === 'default') {
      const audio = audioRef.current;
      if (!audio) return;

      audio.volume = volume;

      if (isPlaying) {
        if (audio.src) {
          audio.play().catch(() => {
            startAmbientSynth();
          });
        } else {
          startAmbientSynth();
        }
      } else {
        audio.pause();
        stopAmbientSynth();
      }
    } else if (playbackEngine === 'youtube') {
      const player = ytPlayerRef.current;
      if (player && ytPlayerReadyRef.current) {
        try {
          if (player.setVolume) {
            player.setVolume(Math.round(volume * 100));
          }

          if (isPlaying) {
            player.playVideo();
          } else {
            player.pauseVideo();
          }
        } catch {
          // Ignore state change errors
        }
      }
    }
  }, [isPlaying, volume, playbackEngine]);

  // ─── Web Audio API Ambient Drone Fallback ───
  const startAmbientSynth = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!synthNodesRef.current.gain) {
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
        gain.connect(ctx.destination);

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(130.81, ctx.currentTime);
        osc1.connect(gain);
        osc1.start();

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(196.00, ctx.currentTime);
        osc2.connect(gain);
        osc2.start();

        synthNodesRef.current = { osc1, osc2, gain };
      }
    } catch {
      // Audio synth fallback ignored
    }
  };

  const stopAmbientSynth = () => {
    if (synthNodesRef.current.gain && audioCtxRef.current) {
      try {
        synthNodesRef.current.osc1?.stop();
        synthNodesRef.current.osc2?.stop();
        synthNodesRef.current = {};
      } catch {
        synthNodesRef.current = {};
      }
    }
  };

  // ─── Playback Controls ───
  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNextTrack = () => {
    setCurrentTime(0);
    if (playbackEngine === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.nextVideo();
        setIsPlaying(true);
        return;
      } catch {
        // fallback
      }
    }

    setCurrentTrackIndex((prev) => (prev + 1) % playlist.tracks.length);
  };

  const handlePreviousTrack = () => {
    setCurrentTime(0);
    if (playbackEngine === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.previousVideo();
        setIsPlaying(true);
        return;
      } catch {
        // fallback
      }
    }

    setCurrentTrackIndex((prev) => (prev - 1 + playlist.tracks.length) % playlist.tracks.length);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (playbackEngine === 'default') {
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.currentTime = newTime;
      }
    } else if (playbackEngine === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(newTime, true);
      } catch {
        // Seek error ignored
      }
    }
  };

  const handleSelectTrack = (track: Track) => {
    const index = playlist.tracks.findIndex((t) => t.id === track.id);
    if (index !== -1) {
      setCurrentTrackIndex(index);
      setCurrentTime(0);
      setIsPlaying(true);

      if (playbackEngine === 'youtube' && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.playVideoAt(index);
        } catch {
          // Playback index error ignored
        }
      }
    }
  };

  // ─── Switch Back to Default South Indian Playlist ───
  const handleResetToDefault = useCallback(() => {
    isUserCustomPlaylistRef.current = false;
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
        ytPlayerRef.current.stopVideo();
      } catch {
        // Ignore
      }
    }

    setPlaybackEngine('default');
    setPlaylist(defaultPlaylist);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setDuration(defaultPlaylist.tracks[0].duration);
    setIsPlaying(true);
  }, []);

  // ─── Load Custom YouTube Playlist Dynamically ───
  const handleLoadCustomPlaylist = async (
    input: string,
    titleOverride?: string,
    markAsUserCustom = true
  ): Promise<{ success: boolean; error?: string; count?: number }> => {
    if (markAsUserCustom) {
      isUserCustomPlaylistRef.current = true;
    }

    const parsed = parseYouTubeInput(input);

    if (parsed.type === 'invalid' || !parsed.id) {
      console.warn('⚠️ Invalid YouTube playlist input:', input);
      return { success: false, error: parsed.error || 'Invalid YouTube Playlist link or ID.' };
    }

    if (parsed.type === 'default') {
      console.log('🔄 Explicit default keyword requested, resetting to default playlist');
      handleResetToDefault();
      return { success: true, count: defaultPlaylist.tracks.length };
    }

    // Stop default HTML5 audio
    if (audioRef.current) {
      audioRef.current.pause();
      stopAmbientSynth();
    }

    try {
      await loadYouTubeApi();
    } catch (err) {
      console.error('❌ Failed to load YouTube player script:', err);
      return { success: false, error: 'Could not load YouTube player. Please check your internet connection.' };
    }

    // ─── Wait for YouTube Player ready with retry mechanism ───
    let attempts = 0;
    while (
      (!ytPlayerRef.current || !ytPlayerReadyRef.current || typeof ytPlayerRef.current.loadPlaylist !== 'function') &&
      attempts < 10
    ) {
      attempts++;
      console.log(`⏳ Waiting for YouTube Player to be ready (attempt ${attempts}/10)...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const player = ytPlayerRef.current;
    if (!player || typeof player.loadPlaylist !== 'function') {
      console.error('❌ YouTube player failed to initialize in time');
      return { success: false, error: 'YouTube player initializing. Please try again in a few seconds.' };
    }

    // ─── Single Video ───
    if (parsed.type === 'video') {
      const videoId = parsed.id;
      console.log(`▶️ Loading single YouTube video: [${videoId}]`);
      const meta = await fetchVideoMetadata(videoId);
      const singleTrack = createTrackFromVideoId(videoId, 0, meta);

      const newPlaylist: Playlist = {
        id: `yt-single-${videoId}`,
        title: titleOverride || meta.title,
        tagline: 'Custom YouTube Track',
        description: 'Single track stream from YouTube',
        youtubeUrl: parsed.url,
        youtubePlaylistId: videoId,
        coverArt: meta.thumbnail,
        tracks: [singleTrack]
      };

      try {
        player.loadVideoById({ videoId: videoId, startSeconds: 0 });
        player.setVolume(Math.round(volume * 100));
      } catch (err) {
        console.error('❌ Error in player.loadVideoById:', err);
      }

      setPlaylist(newPlaylist);
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      setPlaybackEngine('youtube');
      setIsPlaying(true);

      console.log(`✅ Single video loaded successfully: [${videoId}]`);
      return { success: true, count: 1 };
    }

    // ─── YouTube Playlist ───
    const playlistId = parsed.id;
    console.log(`▶️ Calling player.loadPlaylist for playlist ID: [${playlistId}]`);

    try {
      player.loadPlaylist({
        list: playlistId,
        listType: 'playlist',
        index: 0
      });
      player.setVolume(Math.round(volume * 100));

      let videoIds: string[] = [];
      for (let attempt = 0; attempt < 12; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 350));
        if (player.getPlaylist) {
          const pl = player.getPlaylist();
          if (Array.isArray(pl) && pl.length > 0) {
            videoIds = pl;
            console.log(`📀 Retrieved ${videoIds.length} video IDs from YouTube Player for [${playlistId}]`);
            break;
          }
        }
      }

      if (videoIds.length === 0) {
        if (player.getVideoData && player.getVideoData().video_id) {
          videoIds = [player.getVideoData().video_id];
          console.log(`📀 Fallback video ID from YouTube Player: ${videoIds[0]}`);
        }
      }

      if (videoIds.length === 0) {
        console.warn(`⚠️ No playable videos found in YouTube playlist [${playlistId}]`);
        return {
          success: false,
          error: 'This YouTube Playlist appears to be private, empty, or unplayable. Please ensure it is Public or Unlisted.'
        };
      }

      const initialTracks: Track[] = videoIds.map((vidId, idx) =>
        createTrackFromVideoId(vidId, idx)
      );

      const playlistTitle = titleOverride || `Custom YouTube Playlist (${videoIds.length} tracks)`;

      const newPlaylist: Playlist = {
        id: `yt-playlist-${playlistId}`,
        title: playlistTitle,
        tagline: 'Custom YouTube Selection',
        description: `Streaming ${videoIds.length} tracks from YouTube playlist`,
        youtubeUrl: parsed.url,
        youtubePlaylistId: playlistId,
        coverArt: `https://i.ytimg.com/vi/${videoIds[0]}/hqdefault.jpg`,
        tracks: initialTracks
      };

      setPlaylist(newPlaylist);
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      setPlaybackEngine('youtube');
      setIsPlaying(true);
      console.log(`✅ Playlist state updated for [${playlistId}] with ${videoIds.length} tracks`);

      // Resolve real metadata in background
      (async () => {
        const updatedTracks = [...initialTracks];
        const fetchLimit = Math.min(videoIds.length, 25);
        for (let i = 0; i < fetchLimit; i++) {
          try {
            const meta = await fetchVideoMetadata(videoIds[i]);
            updatedTracks[i] = {
              ...updatedTracks[i],
              title: meta.title,
              artist: meta.artist,
              albumArt: meta.thumbnail
            };
          } catch {
            // Ignore single fetch failure
          }
        }

        setPlaylist((prev) => {
          if (prev.id === `yt-playlist-${playlistId}`) {
            return {
              ...prev,
              tracks: updatedTracks
            };
          }
          return prev;
        });
      })();

      return { success: true, count: videoIds.length };
    } catch (err) {
      console.error(`❌ Exception in player.loadPlaylist for [${playlistId}]:`, err);
      return {
        success: false,
        error: 'Failed to stream YouTube playlist. Please check the link and try again.'
      };
    }
  };

  // ─── ADMIN ROUTE (/admin) ───
  if (currentPath === '/admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#0b090a] text-amber-50 flex items-center justify-center font-sans-ui">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
            <span className="text-xs font-serif-cinzel tracking-widest text-amber-300">
              THAALAM AUTHENTICATION
            </span>
          </div>
        </div>
      );
    }

    if (user) {
      return (
        <AdminDashboard
          user={user}
          onLogout={logout}
          onBackToSite={() => navigateTo('/')}
          listenerCount={listenerCount}
        />
      );
    }

    return (
      <AdminLogin
        onLogin={login}
        onBackToSite={() => navigateTo('/')}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  // ─── PUBLIC THAALAM WEBPAGE (/) ───
  return (
    <div
      className="relative min-h-screen h-screen bg-[#0b090a] text-amber-50 font-sans-ui overflow-hidden flex flex-col select-none"
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Invisible YouTube IFrame Player */}
      <div 
        id="thaalam-yt-player" 
        className="absolute top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden -z-50"
        aria-hidden="true"
      />

      {/* Full-Screen Cinematic Background Video at 100% Original Quality */}
      <BackgroundVideo />

      {/* Minimal Top Controls Header */}
      <Header 
  onOpenSettings={() => setIsSettingsOpen(true)} 
  listenerCount={listenerCount}
  spotifyUrl={websiteSettings.spotifyUrl}
/>

      {/* ─── Lower-Left Tagline: Tagline only ─── */}
      <main className="relative z-10 flex-1 flex items-end pointer-events-none">
        <div className="pl-8 sm:pl-12 md:pl-14 pb-28 sm:pb-32 md:pb-36">
          <div className="animate-hero-fade-in">
            <p
              className="font-serif-cinzel text-lg sm:text-xl md:text-2xl font-normal tracking-[0.04em] text-amber-50/90 leading-[1.25]"
              style={{
                textShadow: '0 2px 16px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.3)',
              }}
            >
              One South. Many Languages.
            </p>
            <p
              className="font-serif-cinzel text-lg sm:text-xl md:text-2xl font-normal tracking-[0.04em] text-amber-50/90 leading-[1.25] mt-1 text-center"
              style={{
                textShadow: '0 2px 16px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.3)',
                maxWidth: '340px',
              }}
            >
              {websiteSettings.tagline && websiteSettings.tagline.includes('One Rhythm')
                ? 'One Rhythm.'
                : websiteSettings.tagline || 'One Rhythm.'}
            </p>
          </div>

          {/* Decorative Classical Ornament Line */}
          <div className="mt-3 sm:mt-4 flex items-center gap-2.5 animate-hero-tagline max-w-[220px] sm:max-w-[280px]">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-amber-500/35 to-transparent" />
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500/45 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2l1.09 3.26L16 6l-2.18 1.74L14.54 11 12 9.27 9.46 11l.72-3.26L8 6l2.91-.74L12 2z" />
            </svg>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-amber-500/35 to-transparent" />
          </div>
        </div>
      </main>

      {/* Compact Bottom Music Player */}
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        currentTime={currentTime}
        duration={duration || currentTrack.duration}
        onSeek={handleSeek}
        volume={volume}
        onVolumeChange={setVolume}
        onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
        isQueueOpen={isQueueOpen}
      />

      {/* Playlist Queue Drawer */}
      <PlaylistQueue
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        tracks={playlist.tracks}
        currentTrackId={currentTrack.id}
        onSelectTrack={handleSelectTrack}
        isPlaying={isPlaying}
        playlistTitle={playlist.title}
      />

      {/* Custom Playlist Modal */}
      <PlaylistSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentPlaylistId={playlist.youtubePlaylistId || websiteSettings.defaultPlaylistId || DEFAULT_PLAYLIST_ID}
        onLoadPlaylist={handleLoadCustomPlaylist}
        onResetToDefault={handleResetToDefault}
        isCustomPlaylist={isCustomPlaylist}
      />
    </div>
  );
};

export default App;