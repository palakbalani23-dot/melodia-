import React, { useState } from 'react';
import { FolderPlus, Music, Sparkles, Globe, Lock } from 'lucide-react';
import { User, Song, Playlist } from '../types';

interface LibraryViewProps {
  currentUser: User | null;
  songs: Song[];
  playlists: Playlist[];
  likedSongs: string[];
  activeSongId: string | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onToggleLike: (songId: string) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onAddSongToPlaylist: (songId: string, playlistId: string) => void;
  onSelectPlaylist: (playlistId: string) => void;
  onCreatePlaylist: () => void;
  onFormPlaylistFromFavorites: (name: string, songIds: string[]) => void;
}

export default function LibraryView({
  currentUser,
  songs,
  playlists,
  likedSongs,
  activeSongId,
  isPlaying,
  onPlaySong,
  onToggleLike,
  onOpenAuth,
  onLogout,
  onAddSongToPlaylist,
  onSelectPlaylist,
  onCreatePlaylist,
  onFormPlaylistFromFavorites,
}: LibraryViewProps) {
  const [successMessage, setSuccessMessage] = useState('');

  const myPlaylists = playlists.filter(
    (p) => p.createdBy === currentUser?.id || p.createdBy === 'system'
  );

  const favoriteSongsList = songs.filter((s) => likedSongs.includes(s.id));

  const handleFormFromFav = async () => {
    if (favoriteSongsList.length === 0) return;
    try {
      const songIds = favoriteSongsList.map((s) => s.id);
      await onFormPlaylistFromFavorites('My Fav Tracks', songIds);
      setSuccessMessage('Successfully compiled a brand new playlist from your favorites!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      // already alerted inside App.tsx
    }
  };

  return (
    <div id="library-view-tab" className="flex-1 overflow-y-auto p-8 pb-32 space-y-8 select-none">
      
      {/* Header Banner */}
      <section 
        id="library-header-banner" 
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500/10 via-purple-500/5 to-transparent border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-2 text-center md:text-left">
          <h2 className="font-display font-extrabold text-3xl text-white tracking-tight leading-none">
            Your Library
          </h2>
          <p className="text-sm text-white/60 max-w-xl leading-relaxed">
            Manage your custom cloud soundwaves, create bespoke playlists, and tweak your stream settings.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {currentUser && (
            <>
              <button
                id="btn-lib-create-playlist"
                onClick={onCreatePlaylist}
                className="py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
              >
                <FolderPlus className="h-4 w-4" />
                <span>Create Playlist</span>
              </button>

              {favoriteSongsList.length > 0 && (
                <button
                  id="btn-lib-form-favorites"
                  onClick={handleFormFromFav}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/90 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-orange-400" />
                  <span>Form List from Favorites</span>
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {successMessage && (
        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold text-center animate-fade-in">
          {successMessage}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Music className="h-4 w-4 text-orange-400" />
            Playlists ({myPlaylists.length})
          </h3>
        </div>

        {myPlaylists.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-4">
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Music className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white">No playlists found</p>
              <p className="text-xs text-white/40 max-w-xs leading-relaxed">
                {currentUser 
                  ? "Create your custom playlist using the button above to start assembling your favorite vibes." 
                  : "Connect your account to start curating and sharing your own playlists."}
              </p>
            </div>
            {!currentUser && (
              <button
                id="btn-lib-sign-in"
                onClick={onOpenAuth}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Connect Account
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPlaylists.map((pl) => (
              <button
                id={`lib-playlist-card-${pl.id}`}
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className="group p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 hover:border-white/10 transition-all text-left cursor-pointer"
              >
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-black/20 flex-shrink-0 border border-white/5">
                  {pl.coverUrl ? (
                    <img src={pl.coverUrl} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-white/5 text-orange-400">
                      <Music className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white group-hover:text-orange-400 truncate tracking-tight transition-colors">
                      {pl.name}
                    </h4>
                    {pl.isSmart && (
                      <span className="text-[8px] uppercase font-bold text-orange-400 bg-orange-500/15 px-1 rounded flex items-center gap-0.5">
                        <Sparkles className="h-2 w-2" />
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 line-clamp-1 mt-1">{pl.description || 'No description'}</p>
                  <div className="flex items-center gap-2.5 mt-2.5">
                    <span className="text-[10px] text-white/30 font-semibold">
                      {pl.songs.length} tracks
                    </span>
                    <span className="text-[10px] text-white/30 font-semibold flex items-center gap-1">
                      {pl.isPublic ? <Globe className="h-2.5 w-2.5 text-orange-500/70" /> : <Lock className="h-2.5 w-2.5 text-rose-500/70" />}
                      {pl.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
