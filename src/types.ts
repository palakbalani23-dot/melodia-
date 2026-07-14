export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  likedSongs: string[]; // Song IDs
  avatarUrl?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // in seconds
  url: string; // URL to steam (could be relative /uploads/... or absolute SoundHelix)
  coverUrl: string; // cover image URL
  addedBy?: string; // user ID who uploaded (Admin)
  isCustomUpload?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: string[]; // Song IDs
  createdBy: string; // User ID or 'system'
  creatorName: string;
  isPublic: boolean;
  coverUrl: string;
  isSmart?: boolean; // AI generated
}

export interface PlaybackState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  queue: Song[];
  activeIndex: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
}
