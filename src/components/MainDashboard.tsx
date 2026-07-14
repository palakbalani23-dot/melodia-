import React from 'react';
import { Play, Pause, Heart, Flame, Radio, Sparkles, Compass, Music, User as UserIcon } from 'lucide-react';
import { Song, Playlist } from '../types';
import AddToPlaylistDropdown from './AddToPlaylistDropdown';
import LyricsDisplay from './LyricsDisplay';

interface MainDashboardProps {
  songs: Song[];
  playlists: Playlist[];
  likedSongs: string[];
  activeSongId: string | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onToggleLike: (songId: string) => void;
  onAddSongToPlaylist: (songId: string, playlistId: string) => void;
  onSelectPlaylist: (playlistId: string) => void;
  onGenerateSmartPlaylist: (params: { prompt: string; mood: string; genre: string }) => Promise<void>;
  onOpenAuth: () => void;
  onViewProfile: () => void;
  currentUser: any;
  userHistory?: any[];
  currentSong: Song | null;
  progress: number;
  onSeek?: (seconds: number) => void;
}

export default function MainDashboard({
  songs,
  playlists,
  likedSongs,
  activeSongId,
  isPlaying,
  onPlaySong,
  onToggleLike,
  onAddSongToPlaylist,
  onSelectPlaylist,
  onGenerateSmartPlaylist,
  onOpenAuth,
  onViewProfile,
  currentUser,
  userHistory = [],
  currentSong,
  progress,
  onSeek,
}: MainDashboardProps) {

  const trendingSongs = songs.slice(0, 4);

  // Determine greeting based on current time
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div id="main-dashboard-view" className="flex-1 overflow-y-auto p-8 pb-32 space-y-10 select-none">
      
      {/* Warm & Beautiful Welcoming Home Header */}
      <section 
        id="home-welcome-header" 
        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500/10 via-rose-500/5 to-transparent border border-white/5 shadow-xl backdrop-blur-md p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-3 text-center md:text-left">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-orange-400 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 inline-block">
            Dashboard Hub
          </span>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-none">
            {getGreeting()}{currentUser ? `, ${currentUser.name}` : ''}!
          </h2>
          <p className="text-white/60 text-sm max-w-xl leading-relaxed">
            Welcome to Melodia, your cloud-curated workspace audio stream. Get ready to power up your flow with lo-fi beats, ambient soundscapes, and AI-curated vibes.
          </p>
        </div>

        <div className="flex-shrink-0">
          {!currentUser ? (
            <button
              id="btn-home-auth-cta"
              onClick={onOpenAuth}
              className="py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
            >
              <UserIcon className="h-4 w-4" />
              <span>Connect Cloud Profile</span>
            </button>
          ) : (
            <button
              id="btn-home-view-profile-cta"
              onClick={onViewProfile}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner hover:bg-white/10 active:scale-95 transition-all text-left cursor-pointer group"
              title="Click to view & edit your profile details or photo"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-orange-500 to-purple-600 border border-white/10 flex items-center justify-center text-white font-extrabold uppercase overflow-hidden shadow-md flex-shrink-0 transition-transform group-hover:scale-105">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none group-hover:text-orange-400 transition-colors">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-orange-400 font-semibold mt-1">
                  Manage Profile Details
                </p>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Recent and Trending Song Lists */}
        <div className="lg:col-span-2 space-y-10">
          {/* Playback History Section (Firestore Secured) */}
          {currentUser && userHistory && userHistory.length > 0 && (
            <section id="playback-history-section" className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
                  <Radio className="h-5 w-5 text-orange-500 animate-pulse" />
                  Recently Played <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Firestore Connected</span>
                </h3>
                <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Cloud Synchronized</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {userHistory.slice(0, 4).map((entry) => {
                  // Find full song details if available in catalog
                  const fullSong = songs.find(s => s.id === entry.songId) || {
                    id: entry.songId,
                    title: entry.title,
                    artist: entry.artist,
                    coverUrl: entry.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
                    genre: "History",
                    duration: 180,
                    url: ""
                  };
                  const isActive = activeSongId === entry.songId;

                  return (
                    <div
                      id={`history-card-${entry.id}`}
                      key={entry.id}
                      className="group relative bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 hover:border-white/10 transition-all hover:scale-[1.01] cursor-pointer"
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/20 border border-white/5">
                        <img src={fullSong.coverUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80"} alt={fullSong.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <button
                            id={`btn-play-history-${entry.id}`}
                            onClick={(e) => { e.stopPropagation(); onPlaySong(fullSong, songs); }}
                            className="h-10 w-10 rounded-full bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center shadow-lg active:scale-90 cursor-pointer"
                          >
                            {isActive && isPlaying ? (
                              <Pause className="h-4.5 w-4.5 text-white" />
                            ) : (
                              <Play className="h-4.5 w-4.5 fill-current ml-0.5 text-white" />
                            )}
                          </button>
                        </div>

                        {isActive && isPlaying && (
                          <div className="absolute bottom-2 right-2 h-5 px-2 rounded bg-orange-600 text-white flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase">
                            <Radio className="h-2.5 w-2.5 animate-pulse" />
                            <span>Live</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-start justify-between gap-1">
                        <div className="truncate flex-1">
                          <h4 className="text-xs font-semibold text-white truncate tracking-tight">{fullSong.title}</h4>
                          <p className="text-[10px] text-white/40 truncate mt-0.5">{fullSong.artist}</p>
                          <p className="text-[9px] text-white/30 truncate mt-1">
                            {new Date(entry.playedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <AddToPlaylistDropdown
                          songId={entry.songId}
                          playlists={playlists}
                          currentUser={currentUser}
                          onAddSongToPlaylist={onAddSongToPlaylist}
                          onOpenAuth={onOpenAuth}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Popular Trending Section */}
          <section id="trending-grid-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Trending Hotlist
              </h3>
              <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Live Statistics</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingSongs.map((song) => {
                const isLiked = likedSongs.includes(song.id);
                const isActive = activeSongId === song.id;
                
                return (
                  <div
                    id={`trending-card-${song.id}`}
                    key={song.id}
                    className="group relative bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 hover:border-white/10 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20"
                  >
                    {/* Album Cover Art */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black/20 border border-white/5">
                      <img src={song.coverUrl} alt={song.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      
                      {/* Floating Overlay Play Trigger */}
                      <div className={`absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all ${
                        isActive && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <button
                          id={`btn-play-trending-${song.id}`}
                          onClick={(e) => { e.stopPropagation(); onPlaySong(song, songs); }}
                          className={`h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all active:scale-90 cursor-pointer ${
                            isActive && isPlaying ? 'transform-none' : 'transform translate-y-3 group-hover:translate-y-0'
                          }`}
                        >
                          {isActive && isPlaying ? (
                            <Pause className="h-5 w-5 text-white" />
                          ) : (
                            <Play className="h-5 w-5 fill-current ml-0.5 text-white" />
                          )}
                        </button>
                      </div>

                      {/* Playing Live Indicator */}
                      {isActive && isPlaying && (
                        <div className="absolute bottom-3 right-3 h-6 px-2.5 rounded-md bg-orange-600 text-white flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase">
                          <Radio className="h-3 w-3 animate-pulse" />
                          <span>Live</span>
                        </div>
                      )}
                    </div>

                    {/* Meta details */}
                    <div className="mt-4 flex items-start justify-between gap-2">
                      <div className="truncate flex-1">
                        <h4 className="text-sm font-semibold text-white truncate tracking-tight">{song.title}</h4>
                        <p className="text-xs text-white/40 truncate mt-0.5">{song.artist}</p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <AddToPlaylistDropdown
                          songId={song.id}
                          playlists={playlists}
                          currentUser={currentUser}
                          onAddSongToPlaylist={onAddSongToPlaylist}
                          onOpenAuth={onOpenAuth}
                        />
                        <button
                          id={`btn-like-trending-${song.id}`}
                          onClick={() => onToggleLike(song.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-white/5 ${
                            isLiked ? 'text-orange-500' : 'text-white/40 hover:text-white'
                          }`}
                        >
                          <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-medium">
                      <span className="px-1.5 py-0.5 rounded-md bg-black/40 border border-white/5">{song.genre}</span>
                      <span>{Math.floor(song.duration / 60)}:{(song.duration % 60) < 10 ? '0' : ''}{song.duration % 60}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Real-Time Lyrics Sticky Display Panel */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
          <LyricsDisplay 
            currentSong={currentSong}
            progress={progress}
            isPlaying={isPlaying}
            onSeek={onSeek}
          />
        </div>
      </div>

    </div>
  );
}
