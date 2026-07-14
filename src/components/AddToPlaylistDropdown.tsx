import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, ListMusic, User } from 'lucide-react';
import { Playlist } from '../types';

interface AddToPlaylistDropdownProps {
  songId: string;
  playlists: Playlist[];
  currentUser: any;
  onAddSongToPlaylist: (songId: string, playlistId: string) => void;
  onOpenAuth: () => void;
}

export default function AddToPlaylistDropdown({
  songId,
  playlists,
  currentUser,
  onAddSongToPlaylist,
  onOpenAuth,
}: AddToPlaylistDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter playlists created by the current user
  const myPlaylists = currentUser
    ? playlists.filter((p) => p.createdBy === currentUser.id)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setIsOpen(!isOpen);
  };

  const handlePlaylistSelect = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    onAddSongToPlaylist(songId, playlistId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        id={`btn-add-to-playlist-${songId}`}
        onClick={handleButtonClick}
        className="p-1.5 rounded-lg text-white/40 hover:text-orange-400 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
        title="Add to Playlist"
      >
        <Plus className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          id={`dropdown-playlists-${songId}`}
          className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-xl z-50 py-1.5 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-100"
        >
          <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-1.5">
            <ListMusic className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">Add to Playlist</span>
          </div>

          <div className="max-h-48 overflow-y-auto mt-1 scrollbar-thin">
            {myPlaylists.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-white/40">No custom playlists yet</p>
                <p className="text-[10px] text-white/30 mt-1 leading-relaxed">
                  Go to your Account screen to create one first!
                </p>
              </div>
            ) : (
              myPlaylists.map((playlist) => {
                const alreadyContains = playlist.songs.includes(songId);
                return (
                  <button
                    key={playlist.id}
                    disabled={alreadyContains}
                    onClick={(e) => handlePlaylistSelect(e, playlist.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-all ${
                      alreadyContains
                        ? 'text-white/30 cursor-not-allowed bg-white/[0.01]'
                        : 'text-white/80 hover:bg-white/5 hover:text-orange-400 cursor-pointer'
                    }`}
                  >
                    <span className="truncate pr-2 font-medium">{playlist.name}</span>
                    {alreadyContains ? (
                      <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check className="h-2.5 w-2.5" />
                        <span>Added</span>
                      </span>
                    ) : (
                      <Plus className="h-3 w-3 text-white/30" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
