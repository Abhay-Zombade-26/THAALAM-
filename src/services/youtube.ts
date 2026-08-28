import type { Track } from '../types/music';
import { DEFAULT_PLAYLIST_ID, DEFAULT_PLAYLIST_LINK } from '../data/defaultPlaylist';

// Extend window interface for YouTube IFrame API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Load YouTube IFrame API script dynamically if not already loaded
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ytApiPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loadYouTubeApi = (): Promise<any> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window is not defined'));
  
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onerror = () => reject(new Error('Failed to load YouTube IFrame API'));
      document.head.appendChild(tag);
    }

    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousOnReady) previousOnReady();
      if (window.YT) {
        resolve(window.YT);
      } else {
        reject(new Error('YouTube API not found on window'));
      }
    };

    setTimeout(() => {
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
      }
    }, 3000);
  });

  return ytApiPromise;
};

// Extract Playlist ID or Video ID from any URL or raw string
export interface ParsedYouTubeInput {
  type: 'playlist' | 'video' | 'default' | 'invalid';
  id: string | null;
  url: string;
  error?: string;
}

export const parseYouTubeInput = (input: string): ParsedYouTubeInput => {
  const trimmed = input.trim();
  if (!trimmed) {
    return { type: 'invalid', id: null, url: '', error: 'Please enter a YouTube Playlist link or ID.' };
  }

  // Only if input is explicitly the keyword 'default' or 'reset'
  if (trimmed.toLowerCase() === 'default' || trimmed.toLowerCase() === 'reset') {
    return { type: 'default', id: DEFAULT_PLAYLIST_ID, url: DEFAULT_PLAYLIST_LINK };
  }

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
      const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      
      const listParam = urlObj.searchParams.get('list');
      if (listParam) {
        return { type: 'playlist', id: listParam, url: trimmed };
      }

      const videoParam = urlObj.searchParams.get('v');
      if (videoParam) {
        return { type: 'video', id: videoParam, url: trimmed };
      }

      if (urlObj.hostname.includes('youtu.be')) {
        const pathSegments = urlObj.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          return { type: 'video', id: pathSegments[0], url: trimmed };
        }
      }

      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      if (pathSegments.includes('embed') || pathSegments.includes('v')) {
        const vidId = pathSegments[pathSegments.length - 1];
        if (vidId) {
          return { type: 'video', id: vidId, url: trimmed };
        }
      }
    }
  } catch {
    // Check as raw ID
  }

  if (/^[a-zA-Z0-9_-]{12,}$/.test(trimmed)) {
    return { type: 'playlist', id: trimmed, url: `https://www.youtube.com/playlist?list=${trimmed}` };
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { type: 'video', id: trimmed, url: `https://www.youtube.com/watch?v=${trimmed}` };
  }

  return {
    type: 'invalid',
    id: null,
    url: trimmed,
    error: 'Invalid YouTube link or ID. Please check the URL and try again.'
  };
};

// Fetch video metadata using public CORS oEmbed
export interface YouTubeVideoMetadata {
  title: string;
  artist: string;
  thumbnail: string;
}

export const fetchVideoMetadata = async (videoId: string): Promise<YouTubeVideoMetadata> => {
  const defaultThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  try {
    const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.title) {
        let title = data.title;
        let artist = data.author_name || 'YouTube Music';

        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          artist = parts[0].trim();
          title = parts.slice(1).join(' - ').trim();
        } else if (title.includes(' | ')) {
          const parts = title.split(' | ');
          title = parts[0].trim();
          artist = parts.slice(1).join(' | ').trim();
        }

        return {
          title,
          artist,
          thumbnail: data.thumbnail_url || defaultThumb
        };
      }
    }
  } catch {
    // Fallback
  }

  return {
    title: `YouTube Track (${videoId})`,
    artist: 'YouTube Melody',
    thumbnail: defaultThumb
  };
};

export const createTrackFromVideoId = (videoId: string, index: number, meta?: YouTubeVideoMetadata): Track => {
  return {
    id: `yt-${videoId}-${index}`,
    title: meta?.title || `Track ${index + 1}`,
    artist: meta?.artist || 'YouTube Stream',
    language: 'Tamil',
    duration: 240,
    albumArt: meta?.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    youtubeId: videoId
  };
};
