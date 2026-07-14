import React from 'react';
import { Heart, Play, Pause, Trash2, Music } from 'lucide-react';
import { Song, Playlist } from '../types';
import AddToPlaylistDropdown from './AddToPlaylistDropdown';

interface LikedViewProps {
  currentUser: any;
  songs: Song[];
  playlists: Playlist[];
  likedSongs: string[];
  activeSongId: string | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onToggleLike: (songId: string) => void;
  onOpenAuth: () => void;
  onAddSongToPlaylist: (songId: string, playlistId: string) => void;
}

export default function LikedView({
  currentUser,
  songs,
  playlists,
  likedSongs,
  activeSongId,
  isPlaying,
  onPlaySong,
  onToggleLike,
  onOpenAuth,
  onAddSongToPlaylist,
}: LikedViewProps) {
  // Filter active song objects that are favorited/liked
  const favoriteSongsList = songs.filter((s) => likedSongs.includes(s.id));

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalDurationSecs = favoriteSongsList.reduce((sum, s) => sum + s.duration, 0);
  const totalMin = Math.floor(totalDurationSecs / 60);

  return (
    <div id="liked-songs-view-tab" className="flex-1 overflow-y-auto p-8 pb-32 space-y-8 select-none">
      
      {/* Spotify-style Liked Songs Header Card */}
      <section 
        id="liked-songs-hero-header" 
        className="flex flex-col md:flex-row items-center md:items-end gap-6 border-b border-white/5 pb-8 relative overflow-hidden p-6 rounded-2xl bg-white/[0.02] border border-white/5 shadow-2xl"
      >
        {/* Ambient colorful backdrop mesh */}
        <div className="absolute -inset-10 bg-gradient-to-tr from-rose-500/10 via-orange-500/5 to-transparent opacity-40 blur-3xl -z-10 pointer-events-none" />
        
        {/* Big Heart Icon Card */}
        <div className="h-36 w-36 md:h-44 md:w-44 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-xl shadow-rose-500/20 transition-all duration-300 hover:scale-[1.03]">
          <Heart className="h-16 w-16 text-white fill-white animate-pulse" />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-3.5 text-center md:text-left">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-rose-400 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 inline-block">
            Collection
          </span>

          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-none">
            Liked Songs
          </h2>

          <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
            All your heart-marked favorites compiled into a single beautiful dynamic stream. Powered by cloud local synchronizer.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs font-semibold text-white/40">
            <span className="text-white/80">{currentUser ? currentUser.name : 'Guest User'}</span>
            <span>•</span>
            <span>{favoriteSongsList.length} songs</span>
            {favoriteSongsList.length > 0 && (
              <>
                <span>•</span>
                <span className="text-rose-400/80">{totalMin} minutes total</span>
              </>
            )}
          </div>
        </div>

        {/* Play all button */}
        {favoriteSongsList.length > 0 && (
          <button
            id="btn-play-all-liked"
            onClick={() => onPlaySong(favoriteSongsList[0], favoriteSongsList)}
            className="py-3 px-6 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer flex-shrink-0"
          >
            <Play className="h-4 w-4 fill-current text-white" />
            <span>Play Favorites Queue</span>
          </button>
        )}
      </section>

      {/* Liked Songs List */}
      <section id="liked-songs-list-section" className="space-y-4">
        {favoriteSongsList.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Heart className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-sm font-semibold text-white">No liked songs yet</h4>
              <p className="text-xs text-white/40 leading-relaxed">
                Click the heart icon next to any song in our catalog, home page, or search tab to curate your ultimate favorites stream right here.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-extrabold tracking-wider text-white/40">
                    <th className="py-4 pl-6 w-12">#</th>
                    <th className="py-4 px-4">Title</th>
                    <th className="py-4 px-4">Genre</th>
                    <th className="py-4 px-4 w-24">Duration</th>
                    <th className="py-4 pr-6 w-28 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {favoriteSongsList.map((song, idx) => {
                    const isCurrent = activeSongId === song.id;
                    return (
                      <tr
                        key={song.id}
                        id={`liked-row-${song.id}`}
                        className={`group hover:bg-white/[0.03] transition-colors ${
                          isCurrent ? 'bg-rose-500/5' : ''
                        }`}
                      >
                        {/* Number / Play indicator */}
                        <td className="py-3 pl-6">
                          {isCurrent && isPlaying ? (
                            <button
                              id={`btn-liked-play-row-${song.id}`}
                              onClick={() => onPlaySong(song, favoriteSongsList)}
                              className="p-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                            >
                              <Pause className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <>
                              <span className="text-xs text-white/30 group-hover:hidden">{idx + 1}</span>
                              <button
                                id={`btn-liked-play-row-${song.id}`}
                                onClick={() => onPlaySong(song, favoriteSongsList)}
                                className="hidden group-hover:block p-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                              </button>
                            </>
                          )}
                        </td>

                        {/* Song Title & Album art */}
                        <td className="py-3 px-4 min-w-[200px]">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg overflow-hidden bg-black/20 border border-white/5 flex-shrink-0">
                              <img src={song.coverUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className={`text-xs font-semibold truncate ${
                                  isCurrent ? 'text-rose-400' : 'text-white/90'
                                }`}
                              >
                                {song.title}
                              </p>
                              <p className="text-[10px] text-white/40 truncate mt-0.5">{song.artist}</p>
                            </div>
                          </div>
                        </td>

                        {/* Genre */}
                        <td className="py-3 px-4 text-xs text-white/40 font-medium">
                          <span className="px-1.5 py-0.5 rounded bg-black/30 border border-white/5">
                            {song.genre}
                          </span>
                        </td>

                        {/* Duration */}
                        <td className="py-3 px-4 text-xs font-mono text-white/40">
                          {formatDuration(song.duration)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <AddToPlaylistDropdown
                              songId={song.id}
                              playlists={playlists}
                              currentUser={currentUser}
                              onAddSongToPlaylist={onAddSongToPlaylist}
                              onOpenAuth={onOpenAuth}
                            />
                            <button
                              id={`btn-liked-remove-${song.id}`}
                              onClick={() => onToggleLike(song.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Unlike song"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
