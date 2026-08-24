import React, { useState, useEffect, useRef } from 'react';
import { BackgroundVideo } from './components/BackgroundVideo';
import { Header } from './components/Header';
import { MusicPlayer } from './components/MusicPlayer';
import { PlaylistQueue } from './components/PlaylistQueue';
import { PlaylistSettings } from './components/PlaylistSettings';
import { defaultPlaylist } from './data/defaultPlaylist';
import type { Track, Playlist } from './types/music';

export const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<Playlist>(defaultPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode }>({});

  const currentTrack: Track = playlist.tracks[currentTrackIndex] || playlist.tracks[0];

  // ─── Disable right-click globally (basic frontend protection) ───
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block common keyboard shortcuts for viewing source / dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+U (view source), Ctrl+S (save), Ctrl+Shift+I (devtools), F12
      if (
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ─── Initialize HTML5 audio element ───
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      } else {
        setDuration(currentTrack.duration);
      }
    };

    const handleEnded = () => {
      handleNextTrack();
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
  }, []);

  // ─── Update audio source when track changes ───
  useEffect(() => {
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
  }, [currentTrackIndex, playlist]);

  // ─── Sync play/pause state with audio element & volume ───
  useEffect(() => {
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
  }, [isPlaying, volume]);

  // ─── Web Audio API ambient drone fallback ───
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
        osc1.frequency.setValueAtTime(130.81, ctx.currentTime); // C3 Sa drone
        osc1.connect(gain);
        osc1.start();

        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(196.00, ctx.currentTime); // G3 Pa drone
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

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNextTrack = () => {
    setCurrentTime(0);
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.tracks.length);
  };

  const handlePreviousTrack = () => {
    setCurrentTime(0);
    setCurrentTrackIndex((prev) => (prev - 1 + playlist.tracks.length) % playlist.tracks.length);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSelectTrack = (track: Track) => {
    const index = playlist.tracks.findIndex((t) => t.id === track.id);
    if (index !== -1) {
      setCurrentTrackIndex(index);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handleLoadCustomPlaylist = (input: string, titleOverride?: string) => {
    let playlistId = input;
    if (input.includes('list=')) {
      playlistId = input.split('list=')[1].split('&')[0];
    }

    setPlaylist((prev) => ({
      ...prev,
      title: titleOverride || `Custom YouTube Playlist (${playlistId.substring(0, 8)}...)`,
      youtubePlaylistId: playlistId,
      youtubeUrl: input
    }));

    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <div
      className="relative min-h-screen h-screen bg-[#0b090a] text-amber-50 font-sans-ui overflow-hidden flex flex-col select-none"
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Full-Screen Cinematic Background Video */}
      <BackgroundVideo />

      {/* Minimal Top Controls Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* ─── Lower-Left Tagline: NO duplicate THAALAM, tagline only ─── */}
      <main className="relative z-10 flex-1 flex items-end pointer-events-none">
        <div className="pl-8 sm:pl-12 md:pl-14 pb-28 sm:pb-32 md:pb-36">
          {/* Tagline — Two elegant lines, second line centered */}
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
              One Rhythm.
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
        currentPlaylistId={playlist.youtubePlaylistId}
        onLoadPlaylist={handleLoadCustomPlaylist}
      />
    </div>
  );
};

export default App;
