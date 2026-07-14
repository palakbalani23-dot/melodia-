import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, Trash2, Edit3, Share2, Music, Check, Globe, Lock, ShieldAlert, Sparkles, Copy } from 'lucide-react';
import { Song, Playlist } from '../types';
import AddToPlaylistDropdown from './AddToPlaylistDropdown';

interface PlaylistViewProps {
  playlistId: string;
  playlists: Playlist[];
  songs: Song[];
  likedSongs: string[];
  activeSongId: string | null;
  isPlaying?: boolean;
  currentUser: any;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onToggleLike: (songId: string) => void;
  onUpdatePlaylist: (playlistId: string, updates: Partial<Playlist>) => Promise<void>;
  onDeletePlaylist: (playlistId: string) => Promise<void>;
  onRemoveSongFromPlaylist: (songId: string, playlistId: string) => void;
  setActiveTab: (tab: any) => void;
  onAddSongToPlaylist: (songId: string, playlistId: string) => void;
  onOpenAuth: () => void;
}

export default function PlaylistView({
  playlistId,
  playlists,
  songs,
  likedSongs,
  activeSongId,
  isPlaying = false,
  currentUser,
  onPlaySong,
  onToggleLike,
  onUpdatePlaylist,
  onDeletePlaylist,
  onRemoveSongFromPlaylist,
  setActiveTab,
  onAddSongToPlaylist,
  onOpenAuth,
}: PlaylistViewProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editCover, setEditCover] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const currentPlaylist = playlists.find((p) => p.id === playlistId);

  useEffect(() => {
    if (currentPlaylist) {
      setPlaylist(currentPlaylist);
      setEditName(currentPlaylist.name);
      setEditDesc(currentPlaylist.description);
      setEditIsPublic(currentPlaylist.isPublic);
      setEditCover(currentPlaylist.coverUrl);
      setIsEditing(false);
      setSaveError('');
    }
  }, [playlistId, playlists]);

  if (!playlist) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 select-none">
        <Music className="h-12 w-12 text-white/20 mb-3 animate-pulse" />
        <p className="text-sm font-semibold text-white/40">Playlist not found or is private.</p>
      </div>
    );
  }

  // Filter songs that belong to this playlist
  const playlistSongs = playlist.songs
    .map((songId) => songs.find((s) => s.id === songId))
    .filter(Boolean) as Song[];

  const isOwner = currentUser?.id === playlist.createdBy;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setSaveError('Playlist name is required.');
      return;
    }

    setSaveLoading(true);
    setSaveError('');

    try {
      await onUpdatePlaylist(playlist.id, {
        name: editName,
        description: editDesc,
        isPublic: editIsPublic,
        coverUrl: editCover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
      });
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update playlist details.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this custom playlist? This action cannot be undone.')) {
      return;
    }
    try {
      await onDeletePlaylist(playlist.id);
      setActiveTab('home');
    } catch (err: any) {
      alert(err.message || 'Deletion failed.');
    }
  };

  const handleShare = () => {
    // Generate an absolute share link targeting our specific query parameter
    const shareUrl = `${window.location.origin}?playlistId=${playlist.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch((err) => {
        console.error('Failed to copy to clipboard', err);
      });
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatTotalDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h} hr ${m} min`;
    }
    return `${m} min ${s} sec`;
  };

  const coverOptions = [
    { name: 'Late Night Study', url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=400&q=80' },
    { name: 'Sunset Vibe', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
    { name: 'Neon Cyber', url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&q=80' },
    { name: 'Acoustic Sunday', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80' }
  ];

  const totalDurationSecs = playlistSongs.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div id={`playlist-view-${playlist.id}`} className="flex-1 overflow-y-auto p-8 pb-32 space-y-8 select-none">
      
      {/* Upper header section */}
      {!isEditing ? (
        <section 
          id="playlist-hero-header" 
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-8 relative overflow-hidden p-6 rounded-2xl bg-white/[0.02] border border-white/5 shadow-2xl"
        >
          {/* Ambient colorful backdrop mesh */}
          <div className="absolute -inset-10 bg-gradient-to-tr from-orange-500/10 via-rose-500/5 to-transparent opacity-40 blur-3xl -z-10 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 flex-1 min-w-0">
            {/* Cover Art */}
            <div className="group relative h-36 w-36 md:h-44 md:w-44 rounded-2xl overflow-hidden bg-black/20 border border-white/10 flex-shrink-0 shadow-xl shadow-black/60 transition-all duration-300 hover:scale-[1.03] hover:border-orange-500/30">
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt={playlist.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-orange-400 bg-white/5">
                  <Music className="h-10 w-10 group-hover:rotate-6 transition-transform" />
                </div>
              )}
              {/* Play symbol overlay on cover hover */}
              {playlistSongs.length > 0 && (
                <div 
                  onClick={() => onPlaySong(playlistSongs[0], playlistSongs)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-orange-500/30">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-3.5 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-orange-400 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 flex items-center gap-1.5">
                  {playlist.isSmart && <Sparkles className="h-3 w-3 animate-pulse text-orange-400" />}
                  {playlist.isSmart ? 'AI Generated Smart List' : 'Personal Playlist'}
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-white/40 flex items-center gap-1">
                  {playlist.isPublic ? <Globe className="h-3 w-3 text-orange-500/80" /> : <Lock className="h-3 w-3 text-rose-500/80" />}
                  {playlist.isPublic ? 'Public Share Enabled' : 'Private'}
                </span>
              </div>

              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight truncate leading-none">
                {playlist.name}
              </h2>

              <p className="text-sm text-white/60 leading-relaxed max-w-2xl">{playlist.description || 'No description provided.'}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs font-semibold text-white/40">
                <span className="text-white/80">Created by {playlist.creatorName}</span>
                <span>•</span>
                <span>{playlistSongs.length} tracks</span>
                {playlistSongs.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-orange-400/80">{formatTotalDuration(totalDurationSecs)} total time</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Custom controls (Edit / Share / Delete) */}
          <div className="flex flex-row md:flex-row lg:flex-col items-center justify-center lg:items-end gap-3 flex-wrap">
            {playlistSongs.length > 0 && (
              <button
                id="btn-play-all-playlist"
                onClick={() => onPlaySong(playlistSongs[0], playlistSongs)}
                className="py-2.5 px-5 rounded-full bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current text-white" />
                <span>Play Queue</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                id="btn-share-playlist-link"
                onClick={handleShare}
                className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                  copied
                    ? 'bg-orange-500/15 border-orange-500/20 text-orange-400'
                    : 'bg-black/20 border-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                }`}
              >
                {copied ? <Check className="h-3.5 w-3.5 animate-bounce" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied Public Link!' : 'Share'}</span>
              </button>

              {isOwner && (
                <>
                  <button
                    id="btn-edit-playlist-details"
                    onClick={() => setIsEditing(true)}
                    className="p-2.5 rounded-xl bg-black/20 hover:bg-white/10 border border-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
                    title="Edit details"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    id="btn-delete-playlist"
                    onClick={handleDelete}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                    title="Delete playlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

        </section>
      ) : (
        /* Playlist Editing View */
        <section id="playlist-edit-card" className="p-6 bg-white/5 border border-white/5 rounded-2xl max-w-2xl space-y-6 backdrop-blur-md">
          <div>
            <h3 className="font-display font-extrabold text-xl text-white">Edit Playlist Details</h3>
            <p className="text-xs text-white/40 mt-1">Configure visibility, custom descriptions, and curated aesthetics</p>
          </div>

          {saveError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {saveError}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/60">Playlist Name</label>
                <input
                  id="edit-pl-name"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 focus:border-orange-500 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/60">Visibility Setting</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-edit-visibility-public"
                    type="button"
                    onClick={() => setEditIsPublic(true)}
                    className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      editIsPublic 
                        ? 'border-orange-500 bg-orange-500/10 text-orange-300' 
                        : 'border-white/5 bg-black/20 text-white/40 hover:text-white'
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Public Link</span>
                  </button>
                  <button
                    id="btn-edit-visibility-private"
                    type="button"
                    onClick={() => setEditIsPublic(false)}
                    className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      !editIsPublic 
                        ? 'border-orange-500 bg-orange-500/10 text-orange-300' 
                        : 'border-white/5 bg-black/20 text-white/40 hover:text-white'
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Private</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60">Custom Description</label>
              <textarea
                id="edit-pl-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Write a custom description explaining the theme..."
                className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 focus:border-orange-500 text-xs text-white outline-none h-20 resize-none"
              />
            </div>

            {/* Custom Cover Art Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/60">Curated Cover Artwork Preset</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {coverOptions.map((opt) => (
                  <button
                    id={`btn-preset-cover-${opt.name.replace(/\s+/g, '')}`}
                    key={opt.name}
                    type="button"
                    onClick={() => setEditCover(opt.url)}
                    className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 bg-black/20 transition-all cursor-pointer ${
                      editCover === opt.url 
                        ? 'border-orange-500 ring-1 ring-orange-500' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <img src={opt.url} alt="" className="h-10 w-full object-cover rounded-md" />
                    <span className="text-[9px] text-white/40 truncate w-full text-center">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="btn-edit-pl-cancel"
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2 px-4 rounded-xl bg-black/20 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-edit-pl-save"
                type="submit"
                disabled={saveLoading}
                className="py-2 px-5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white transition-colors text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                {saveLoading ? 'Saving...' : 'Save Updates'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Playlist tracks table list */}
      <section id="playlist-tracks-section" className="space-y-4">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Tracks Inside ({playlistSongs.length})</h3>

        {playlistSongs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center">
            <Music className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-sm font-semibold text-white/60">Empty playlist</p>
            <p className="text-xs text-white/30 mt-1">Go to search and explore songs to add them to this curated playlist!</p>
            <button
              id="btn-playlist-go-explore"
              onClick={() => setActiveTab('search')}
              className="mt-4 py-2 px-4 rounded-xl bg-black/20 hover:bg-white/10 border border-white/5 text-xs font-semibold text-orange-400 hover:text-orange-300 cursor-pointer"
            >
              Explore songs catalog
            </button>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-inner backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-[10px] font-bold tracking-widest uppercase bg-black/20">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Title / Artist</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Genre</th>
                  <th className="py-3 px-4 text-center hidden md:table-cell">Duration</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {playlistSongs.map((song, idx) => {
                  const isLiked = likedSongs.includes(song.id);
                  const isActive = activeSongId === song.id;

                  return (
                    <tr
                      id={`playlist-song-row-${idx}`}
                      key={`${song.id}-${idx}`}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      {/* Index Number / Play Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          id={`btn-playlist-play-${song.id}-${idx}`}
                          onClick={() => onPlaySong(song, playlistSongs)}
                          className={`h-7 w-7 rounded-full flex items-center justify-center transition-all mx-auto cursor-pointer ${
                            isActive && isPlaying 
                              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                              : 'bg-black/20 text-white/40 hover:text-white hover:bg-orange-500'
                          }`}
                        >
                          {isActive && isPlaying ? (
                            <Pause className="h-3 w-3 text-white" />
                          ) : (
                            <Play className={`h-3 w-3 fill-current ${isActive ? 'text-white' : 'ml-0.5'}`} />
                          )}
                        </button>
                      </td>

                      {/* Cover + Title / Artist */}
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

                      {/* Genre */}
                      <td className="py-3 px-4 text-xs font-medium text-white/60 hidden sm:table-cell">
                        <span className="px-2 py-0.5 rounded-md bg-black/40 border border-white/5 text-[10px] uppercase">
                          {song.genre}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 text-center font-mono text-xs text-white/40 hidden md:table-cell">
                        {formatDuration(song.duration)}
                      </td>

                      {/* Delete / Like Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`btn-playlist-row-like-${song.id}-${idx}`}
                            onClick={() => onToggleLike(song.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isLiked ? 'text-orange-500' : 'text-white/40 hover:text-white'
                            }`}
                          >
                            <Heart className="h-3.5 w-3.5" fill={isLiked ? "currentColor" : "none"} />
                          </button>

                          <AddToPlaylistDropdown
                            songId={song.id}
                            playlists={playlists}
                            currentUser={currentUser}
                            onAddSongToPlaylist={onAddSongToPlaylist}
                            onOpenAuth={onOpenAuth}
                          />

                          {isOwner && (
                            <button
                              id={`btn-playlist-row-remove-${song.id}-${idx}`}
                              onClick={() => onRemoveSongFromPlaylist(song.id, playlist.id)}
                              className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                              title="Remove track"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
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
