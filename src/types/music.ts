export type Language = 'All' | 'Tamil' | 'Telugu' | 'Malayalam' | 'Kannada';

export interface Track {
  id: string;
  title: string;
  artist: string;
  movie?: string;
  language: 'Tamil' | 'Telugu' | 'Malayalam' | 'Kannada';
  duration: number; // in seconds
  albumArt: string;
  audioUrl?: string;
  youtubeId?: string;
}

export interface Playlist {
  id: string;
  title: string;
  tagline: string;
  description: string;
  youtubeUrl: string;
  youtubePlaylistId: string;
  coverArt: string;
  tracks: Track[];
}
