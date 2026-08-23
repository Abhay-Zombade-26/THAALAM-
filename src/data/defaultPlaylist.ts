import type { Playlist } from '../types/music';

export const DEFAULT_PLAYLIST_LINK = "https://www.youtube.com/watch?v=x6Q7c9RyMzk&list=PLvsOMQWnCsyXTSZ1IIk6cm-dGSwpUqFOV";
export const DEFAULT_PLAYLIST_ID = "PLvsOMQWnCsyXTSZ1IIk6cm-dGSwpUqFOV";

export const defaultPlaylist: Playlist = {
  id: "thaalam-south-01",
  title: "THAALAM — One South Selection",
  tagline: "One South. Many Languages. One Rhythm.",
  description: "A hand-curated journey across Tamil, Telugu, Malayalam & Kannada soundscapes, harmonized into a single continuous rhythm.",
  youtubeUrl: DEFAULT_PLAYLIST_LINK,
  youtubePlaylistId: DEFAULT_PLAYLIST_ID,
  coverArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
  tracks: [
    {
      id: "track-01",
      title: "Neethanae Neethanae",
      artist: "A.R. Rahman, Shreya Ghoshal",
      movie: "Mersal",
      language: "Tamil",
      duration: 268,
      albumArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=indian-meditation-classical-113333.mp3",
      youtubeId: "x6Q7c9RyMzk"
    },
    {
      id: "track-02",
      title: "Inkem Inkem Inkem Kaale",
      artist: "Sid Sriram, Gopi Sundar",
      movie: "Geetha Govindam",
      language: "Telugu",
      duration: 266,
      albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73220.mp3?filename=soulful-flute-melody-10243.mp3",
      youtubeId: "BddP6PYo2gs"
    },
    {
      id: "track-03",
      title: "Uyire Uyire (Malare)",
      artist: "Vijay Yesudas, Rajesh Murugesan",
      movie: "Premam",
      language: "Malayalam",
      duration: 288,
      albumArt: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=peaceful-acoustic-south-1829.mp3",
      youtubeId: "0G383538qzQ"
    },
    {
      id: "track-04",
      title: "Singara Siriye",
      artist: "Vijay Prakash, Ananya Bhat, B. Ajaneesh Loknath",
      movie: "Kantara",
      language: "Kannada",
      duration: 282,
      albumArt: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop",
      audioUrl: "https://cdn.pixabay.com/download/audio/2021/09/06/audio_4f09d841b8.mp3?filename=traditional-rhythm-folk-8201.mp3",
      youtubeId: "WjW-M"
    },
    {
      id: "track-05",
      title: "Unakkenna Venum Sollu",
      artist: "Benny Dayal, Mahathi, Harris Jayaraj",
      movie: "Yennai Arindhaal",
      language: "Tamil",
      duration: 305,
      albumArt: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f66567.mp3?filename=warm-acoustic-soundtrack-123.mp3"
    },
    {
      id: "track-06",
      title: "Samayama",
      artist: "Anurag Kulkarni, Hesham Abdul Wahab",
      movie: "Hi Nanna",
      language: "Telugu",
      duration: 242,
      albumArt: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=romantic-strings-2910.mp3"
    },
    {
      id: "track-07",
      title: "Poomuthole",
      artist: "Vijay Yesudas, Shaan Rahman",
      movie: "Joseph",
      language: "Malayalam",
      duration: 254,
      albumArt: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_34b3524b0b.mp3?filename=soothing-ambient-soundscape-4921.mp3"
    },
    {
      id: "track-08",
      title: "Ninna Raja Naanu",
      artist: "Armaan Malik, Shreya Ghoshal, Charan Raj",
      movie: "Seetharama Kalyana",
      language: "Kannada",
      duration: 275,
      albumArt: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600&auto=format&fit=crop",
      audioUrl: "https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6af3f22.mp3?filename=morning-harmony-soundtrack-912.mp3"
    }
  ]
};

export const PRESET_PLAYLISTS = [
  {
    name: "Default South Indian Playlist",
    id: DEFAULT_PLAYLIST_ID,
    url: DEFAULT_PLAYLIST_LINK,
    desc: "Mixed Tamil, Telugu, Malayalam & Kannada soulful melodies"
  },
  {
    name: "Ilaiyaraaja Golden Nostalgia",
    id: "PL4fGSI1pDJn6O1LS0XSdF3RyO0U00h8v1",
    url: "https://www.youtube.com/playlist?list=PL4fGSI1pDJn6O1LS0XSdF3RyO0U00h8v1",
    desc: "Legendary orchestrations & timeless acoustic harmonies"
  },
  {
    name: "A.R. Rahman South Masterpieces",
    id: "PLNn9_R3l0gR4Z8vS5cRkQ0mH5a3vS9kLm",
    url: "https://www.youtube.com/playlist?list=PLNn9_R3l0gR4Z8vS5cRkQ0mH5a3vS9kLm",
    desc: "Cinematic magic spanning Tamil & Telugu classics"
  },
  {
    name: "Malayalam Rain & Coffee Melodies",
    id: "PLk8wQv0wQv7n3V3B3c5x6z7A8b9c0d1e2",
    url: "https://www.youtube.com/playlist?list=PLk8wQv0wQv7n3V3B3c5x6z7A8b9c0d1e2",
    desc: "Peaceful acoustic acoustic rhythms from God's Own Country"
  }
];
