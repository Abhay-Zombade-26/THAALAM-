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

  // Initialize HTML5 audio element
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

  // Update audio source when track changes
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
          // If media play fails (e.g. autoplay restriction/CORS), start ambient audio synth fallback
          startAmbientSynth();
        });
      }
    } else {
      setDuration(currentTrack.duration);
    }
  }, [currentTrackIndex, playlist]);

  // Sync play/pause state with audio element & volume
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

  // Web Audio API ambient drone fallback if media stream blocked
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
    <div className="relative min-h-screen bg-[#0b090a] text-amber-50 font-sans-ui overflow-hidden flex flex-col justify-between select-none">
      {/* Native Full-Screen Muted Background Video at 100% Original Sharp HD Quality */}
      <BackgroundVideo />

      {/* Minimal Top Controls Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Unobstructed Video Center */}
      <main className="relative z-10 flex-1 pointer-events-none" />

      {/* Compact Bottom Music Player (80-110px desktop, glass ONLY on player) */}
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


