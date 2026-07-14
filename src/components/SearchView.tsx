import React, { useState, useEffect } from 'react';
import { Search, Music, Play, Pause, Heart, Plus, Clock, Filter, Sparkles } from 'lucide-react';
import { Song, Playlist } from '../types';
import AddToPlaylistDropdown from './AddToPlaylistDropdown';

interface SearchViewProps {
  currentUser: any;
  playlists: Playlist[];
  likedSongs: string[];
  activeSongId: string | null;
  isPlaying?: boolean;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onToggleLike: (songId: string) => void;
  onAddSongToPlaylist: (songId: string, playlistId: string) => void;
  onOpenAuth: () => void;
}

export default function SearchView({
  currentUser,
  playlists,
  likedSongs,
  activeSongId,
  isPlaying = false,
  onPlaySong,
  onToggleLike,
  onAddSongToPlaylist,
  onOpenAuth,
}: SearchViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedArtist, setSelectedArtist] = useState('All');
  const [maxDuration, setMaxDuration] = useState(600); // in seconds
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active playlist adder index state
  const [activeSongDropdown, setActiveSongDropdown] = useState<string | null>(null);

  // Load genres and artists from current catalog dynamically
  const genresList = ['All', 'Lofi Chill', 'Synthwave', 'Ambient', 'Electronic', 'Ambient Focus'];
  const [artistsList, setArtistsList] = useState<string[]>(['All']);

  const fetchSongs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('query', searchTerm);
      if (selectedGenre && selectedGenre !== 'All') params.append('genre', selectedGenre);
      if (selectedArtist && selectedArtist !== 'All') params.append('artist', selectedArtist);
      params.append('maxDuration', String(maxDuration));

      const res = await fetch(`/api/songs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to retrieve catalog');
      const data = await res.json();
      setSongs(data);

      // Collect all unique artists dynamically to populate filter list
      const uniqueArtists = Array.from(new Set(data.map((s: Song) => s.artist))) as string[];
      setArtistsList(['All', ...uniqueArtists]);
    } catch (err: any) {
      setError(err.message || 'Failed to search music catalog.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on options change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSongs();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedGenre, selectedArtist, maxDuration]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const myPlaylists = playlists.filter(p => p.createdBy === currentUser?.id);

  return (
    <div id="search-view-container" className="flex-1 overflow-y-auto p-8 pb-32 space-y-6 select-none">
      
      {/* Title Header */}
      <div>
        <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-orange-500" />
          Live Music Explorer
        </h2>
        <p className="text-white/40 text-xs mt-1">Search or filter the entire cloud library with direct audio streaming</p>
      </div>

      {/* Advanced Filters Grid */}
      <section id="search-filters-card" className="p-6 bg-white/5 border border-white/5 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-6 backdrop-blur-md">
        
        {/* Search Input */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="h-3 w-3" />
            Title, Artist, or Vibe
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/30">
              <Search className="h-4 w-4" />
            </span>
            <input
              id="search-input-field"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search songs, artists..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/20 border border-white/5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs text-white placeholder-white/20 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Genre Pill Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Select Genre</label>
          <select
            id="search-select-genre"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/80 focus:border-orange-500 outline-none cursor-pointer"
          >
            {genresList.map(g => (
              <option key={g} value={g} className="bg-[#050508] text-white">{g}</option>
            ))}
          </select>
        </div>

        {/* Duration Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-white/40 uppercase tracking-wider">
            <span>Max Duration</span>
            <span className="font-mono text-orange-400 font-semibold">{formatDuration(maxDuration)}</span>
          </div>
          <div className="flex items-center pt-2.5">
            <input
              id="search-duration-slider"
              type="range"
              min="60"
              max="600"
              step="15"
              value={maxDuration}
              onChange={(e) => setMaxDuration(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                  ((maxDuration - 60) / 540) * 100
                }%, rgba(255,255,255,0.1) ${((maxDuration - 60) / 540) * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
          </div>
        </div>

      </section>

      {/* Results Content */}
      <section id="search-results-section" className="space-y-4">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-semibold text-white/40 uppercase tracking-wider px-2">
          <span>Search Results ({songs.length})</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Duration Limit
          </span>
        </div>

        {loading && songs.length === 0 ? (
          <div className="py-20 text-center text-white/40">
            <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs">Scanning cloud sound waves...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center">
            <Music className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-sm font-semibold text-white/60">No matches found</p>
            <p className="text-xs text-white/30 mt-1">Try relaxing filters or broadening your search keywords.</p>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-inner backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-[10px] font-bold tracking-widest uppercase bg-black/20">
                  <th className="py-3 px-4 w-12 text-center">Play</th>
                  <th className="py-3 px-4">Title / Artist</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Genre</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">Duration</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song) => {
                  const isLiked = likedSongs.includes(song.id);
                  const isActive = activeSongId === song.id;

                  return (
                    <tr
                      id={`search-song-row-${song.id}`}
                      key={song.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      {/* Play Column */}
                      <td className="py-3 px-4 text-center">
                        <button
                          id={`btn-search-play-${song.id}`}
                          onClick={() => onPlaySong(song, songs)}
                          className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                              : 'bg-black/20 text-white/40 hover:text-white hover:bg-orange-500 group-hover:scale-105'
                          }`}
                        >
                          {isActive && isPlaying ? (
                            <Pause className="h-3.5 w-3.5 text-white" />
                          ) : (
                            <Play className={`h-3.5 w-3.5 fill-current ${isActive ? 'text-white' : 'ml-0.5'}`} />
                          )}
                        </button>
                      </td>

                      {/* Song Metadata Title / Artist */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg overflow-hidden bg-black/20 border border-white/5 flex-shrink-0">
                            <img src={song.coverUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white/90 truncate">{song.title}</p>
                            <p className="text-[10px] text-white/40 truncate mt-0.5">{song.artist}</p>
                          </div>
                        </div>
                      </td>

                      {/* Genre Column */}
                      <td className="py-3 px-4 text-xs font-medium text-white/60 hidden sm:table-cell">
                        <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-[10px] uppercase">
                          {song.genre}
                        </span>
                      </td>

                      {/* Duration Column */}
                      <td className="py-3 px-4 text-center font-mono text-xs text-white/40 hidden md:table-cell">
                        {formatDuration(song.duration)}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-3">
                          {/* Like Button */}
                          <button
                            id={`btn-search-like-${song.id}`}
                            onClick={() => onToggleLike(song.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isLiked ? 'text-orange-500' : 'text-white/40 hover:text-white'
                            }`}
                            title={isLiked ? "Unlike" : "Like"}
                          >
                            <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
                          </button>

                          {/* Add to Playlist Dropdown Trigger */}
                          <AddToPlaylistDropdown
                            songId={song.id}
                            playlists={playlists}
                            currentUser={currentUser}
                            onAddSongToPlaylist={onAddSongToPlaylist}
                            onOpenAuth={onOpenAuth}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
