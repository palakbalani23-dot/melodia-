import React from 'react';
import { Home, Compass, Search, Heart, Library, Music, FolderHeart, Plus, LogOut, User as UserIcon, ShieldAlert, X } from 'lucide-react';
import { User, Playlist } from '../types';

interface SidebarProps {
  currentUser: User | null;
  playlists: Playlist[];
  activeTab: string;
  selectedPlaylistId: string | null;
  setActiveTab: (tab: any) => void;
  setSelectedPlaylistId: (id: string | null) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onCreatePlaylist: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  currentUser,
  playlists,
  activeTab,
  selectedPlaylistId,
  setActiveTab,
  setSelectedPlaylistId,
  onOpenAuth,
  onLogout,
  onCreatePlaylist,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  
  const handlePlaylistClick = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setActiveTab('playlist');
  };

  const personalPlaylists = playlists.filter(
    (p) => p.createdBy === currentUser?.id || p.createdBy === 'system'
  );

  return (
    <aside
      id="sidebar-panel"
      className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-[#050508]/95 md:bg-black/20 backdrop-blur-2xl md:backdrop-blur-md flex flex-col border-r border-white/5 h-full select-none transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Music className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-tight text-white leading-none">Melodia</h1>
            <span className="text-[10px] text-orange-400 font-medium tracking-widest uppercase">Cloud Stream</span>
          </div>
        </div>

        {/* Close Button on Mobile */}
        {onCloseMobile && (
          <button
            id="btn-sidebar-mobile-close"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-white/40 hover:text-white md:hidden hover:bg-white/10 transition-colors cursor-pointer"
            title="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Primary Navigation */}
      <nav className="p-4 space-y-1">
        <button
          id="btn-nav-home"
          onClick={() => {
            setActiveTab('home');
            setSelectedPlaylistId(null);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-orange-500/10 text-orange-400 font-semibold border-l-2 border-orange-500 pl-3.5'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>

        <button
          id="btn-nav-explore"
          onClick={() => {
            setActiveTab('explore');
            setSelectedPlaylistId(null);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'explore'
              ? 'bg-orange-500/10 text-orange-400 font-semibold border-l-2 border-orange-500 pl-3.5'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>Explore</span>
        </button>

        <button
          id="btn-nav-search"
          onClick={() => {
            setActiveTab('search');
            setSelectedPlaylistId(null);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'search'
              ? 'bg-orange-500/10 text-orange-400 font-semibold border-l-2 border-orange-500 pl-3.5'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
        </button>

        <button
          id="btn-nav-liked"
          onClick={() => {
            setActiveTab('liked');
            setSelectedPlaylistId(null);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'liked'
              ? 'bg-orange-500/10 text-orange-400 font-semibold border-l-2 border-orange-500 pl-3.5'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Liked Songs</span>
        </button>

        <button
          id="btn-nav-library"
          onClick={() => {
            setActiveTab('library');
            setSelectedPlaylistId(null);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'library'
              ? 'bg-orange-500/10 text-orange-400 font-semibold border-l-2 border-orange-500 pl-3.5'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Library className="h-4 w-4" />
          <span>Your Library</span>
        </button>

        {currentUser?.role === 'admin' && (
          <button
            id="btn-nav-admin"
            onClick={() => {
              setActiveTab('admin');
              setSelectedPlaylistId(null);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-red-500/15 text-red-300 border border-red-500/10 shadow-inner'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span className="font-semibold">Curator Panel</span>
          </button>
        )}
      </nav>

      {/* Playlist Library Section */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col min-h-0 border-t border-white/5">
        <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          <span className="flex items-center gap-2">
            <FolderHeart className="h-3 w-3" />
            Playlists
          </span>
          {currentUser && (
            <button
              id="btn-create-playlist"
              onClick={onCreatePlaylist}
              className="p-1 rounded-md hover:bg-white/10 hover:text-orange-400 text-white/60 transition-colors cursor-pointer"
              title="Create Playlist"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-1 flex-1 overflow-y-auto mt-2 pr-1">
          {personalPlaylists.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-white/5 border border-dashed border-white/10">
              <p className="text-xs text-white/40">No playlists yet.</p>
              {currentUser ? (
                <button
                  id="btn-create-playlist-empty"
                  onClick={onCreatePlaylist}
                  className="mt-2 text-[11px] font-semibold text-orange-400 hover:underline cursor-pointer"
                >
                  Create your first
                </button>
              ) : (
                <button
                  id="btn-login-to-create"
                  onClick={onOpenAuth}
                  className="mt-2 text-[11px] font-semibold text-orange-400 hover:underline cursor-pointer"
                >
                  Sign in to create
                </button>
              )}
            </div>
          ) : (
            personalPlaylists.map((p) => (
              <button
                id={`btn-playlist-${p.id}`}
                key={p.id}
                onClick={() => handlePlaylistClick(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-left transition-all truncate cursor-pointer ${
                  activeTab === 'playlist' && selectedPlaylistId === p.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 font-medium'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="h-6 w-6 rounded bg-black/20 flex-shrink-0 flex items-center justify-center text-xs overflow-hidden border border-white/5">
                  {p.coverUrl ? (
                    <img src={p.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Music className="h-3 w-3" />
                  )}
                </div>
                <div className="truncate flex-1">
                  <p className="truncate text-xs">{p.name}</p>
                  <p className="text-[10px] text-white/40 truncate">
                    {p.isSmart ? 'AI Smart' : `by ${p.creatorName}`}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        {currentUser ? (
          <div className="flex flex-col gap-2">
            <div className={`flex items-center justify-between gap-2 p-2 rounded-xl border transition-colors ${
              activeTab === 'account' 
                ? 'bg-orange-500/10 border-orange-500/35 shadow-md shadow-orange-500/5' 
                : 'bg-white/[0.02] border-white/5'
            }`}>
              <div 
                onClick={() => {
                  setActiveTab('account');
                  setSelectedPlaylistId(null);
                }}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer group/profile flex-1"
                title="View my Account Profile & Settings"
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm uppercase transition-colors overflow-hidden ${
                  activeTab === 'account'
                    ? 'bg-orange-500 text-white'
                    : 'bg-orange-500/10 border border-orange-500/20 group-hover/profile:border-orange-500 text-orange-400'
                }`}>
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate leading-tight transition-colors ${
                    activeTab === 'account' ? 'text-orange-400' : 'text-white/95 group-hover/profile:text-orange-400'
                  }`}>{currentUser.name}</p>
                  <span className="text-[9px] font-medium px-1.5 py-0.25 rounded bg-white/10 text-orange-400">
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                id="btn-sidebar-logout"
                onClick={onLogout}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-rose-400 text-white/40 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            id="btn-sidebar-login"
            onClick={onOpenAuth}
            className="w-full py-2 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02] cursor-pointer"
          >
            <UserIcon className="h-4 w-4" />
            <span>Connect Account</span>
          </button>
        )}
      </div>
    </aside>
  );
}
