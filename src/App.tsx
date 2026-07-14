/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Music, Sparkles, AlertCircle, Share2, Check, X, ShieldAlert } from 'lucide-react';
import { Song, Playlist, User } from './types';
import Sidebar from './components/Sidebar';
import BottomPlayer from './components/BottomPlayer';
import AuthModal from './components/AuthModal';
import MainDashboard from './components/MainDashboard';
import ExploreView from './components/ExploreView';
import SearchView from './components/SearchView';
import LikedView from './components/LikedView';
import LibraryView from './components/LibraryView';
import AccountView from './components/AccountView';
import PlaylistView from './components/PlaylistView';
import AdminPanel from './components/AdminPanel';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import { addSongToHistory, fetchUserHistory } from './firebase';

export default function App() {
  // Navigation & User session states
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('melodia_token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global Music collections
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<string[]>([]);
  const [userHistory, setUserHistory] = useState<any[]>([]);

  // Audio Playback Engine states
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(Number(localStorage.getItem('melodia_volume') || '0.8'));
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Song[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off');

  // Shared generic share links overlay alert
  const [shareToast, setShareToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });

  // Native HTMLAudioElement reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load play history from Firestore
  const loadHistory = async (userId: string) => {
    try {
      const historyData = await fetchUserHistory(userId);
      setUserHistory(historyData);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  // Load user profile if token is available
  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setCurrentUser(userData);
        setLikedSongs(userData.likedSongs || []);
        loadHistory(userData.id);
      } else {
        // Token might be invalid
        handleLogout();
      }
    } catch (e) {
      console.error('Failed to retrieve user profile:', e);
    }
  };

  // Fetch initial music catalog
  const fetchMusicCatalog = async () => {
    try {
      const songsRes = await fetch('/api/songs');
      const playlistsRes = await fetch('/api/playlists', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (songsRes.ok) {
        const songsData = await songsRes.json();
        setSongs(songsData);
      }
      if (playlistsRes.ok) {
        const playlistsData = await playlistsRes.json();
        setPlaylists(playlistsData);
      }
    } catch (e) {
      console.error('Failed to load music collections:', e);
    }
  };

  // Sync profile & catalog on mount
  useEffect(() => {
    if (token) {
      fetchProfile(token);
    }
    fetchMusicCatalog();

    // Check for public share links on page load
    const params = new URLSearchParams(window.location.search);
    const sharedPlId = params.get('playlistId');
    if (sharedPlId) {
      setSelectedPlaylistId(sharedPlId);
      setActiveTab('playlist');
      // Wipe query from URL cleanly
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [token]);

  // Handle native audio creation & listener hooks
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Volume syncing
    audio.volume = volume;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => handleTrackEnded();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [queue, activeIndex, shuffle, repeat]);

  // Playback control state change triggers
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    // If source has changed, reload it
    const isNewSource = audioRef.current.src !== currentSong.url;
    if (isNewSource) {
      audioRef.current.src = currentSong.url;
      audioRef.current.load();
    }

    if (isPlaying) {
      audioRef.current.play().catch((e) => {
        console.warn('Playback error. Browser may require user gesture:', e);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentSong, isPlaying]);

  // Sync volume level
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      localStorage.setItem('melodia_volume', String(volume));
    }
  }, [volume]);

  // Playback triggers
  const playSong = (song: Song, customQueue: Song[]) => {
    setQueue(customQueue);
    setCurrentSong(song);
    const idx = customQueue.findIndex((s) => s.id === song.id);
    setActiveIndex(idx);
    setIsPlaying(true);

    if (currentUser) {
      addSongToHistory(currentUser.id, song).then(() => {
        loadHistory(currentUser.id);
      }).catch((err) => {
        console.error("Failed to append song to Firestore history:", err);
      });
    }
  };

  const handlePlayPause = () => {
    if (!currentSong && songs.length > 0) {
      playSong(songs[0], songs);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (queue.length === 0) return;

    let nextIdx = activeIndex + 1;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      nextIdx = 0; // wrap around
    }

    setActiveIndex(nextIdx);
    setCurrentSong(queue[nextIdx]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (queue.length === 0) return;

    let prevIdx = activeIndex - 1;
    if (shuffle) {
      prevIdx = Math.floor(Math.random() * queue.length);
    } else if (prevIdx < 0) {
      prevIdx = queue.length - 1; // wrap around
    }

    setActiveIndex(prevIdx);
    setCurrentSong(queue[prevIdx]);
    setIsPlaying(true);
  };

  const handleTrackEnded = () => {
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else if (repeat === 'all' || activeIndex < queue.length - 1) {
      handleNext();
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setProgress(seconds);
    }
  };

  // Auth Modal Success handler
  const handleAuthSuccess = (newToken: string, user: any) => {
    setToken(newToken);
    localStorage.setItem('melodia_token', newToken);
    setCurrentUser(user);
    setLikedSongs(user.likedSongs || []);
    setIsAuthModalOpen(false);
    loadHistory(user.id);
    fetchMusicCatalog();
  };

  // Logout handler
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('melodia_token');
    setCurrentUser(null);
    setLikedSongs([]);
    setUserHistory([]);
    setActiveTab('home');
    setSelectedPlaylistId(null);
    fetchMusicCatalog();
  };

  // Update Avatar handler
  const handleUpdateAvatar = async (base64Image: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ avatarImage: base64Image })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update avatar');
      }
    } catch (e) {
      console.error('Error updating user avatar:', e);
      throw e;
    }
  };

  // Delete Avatar handler
  const handleDeleteAvatar = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me/avatar', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete avatar');
      }
    } catch (e) {
      console.error('Error deleting user avatar:', e);
      throw e;
    }
  };

  // Update Profile Name/Email handler
  const handleUpdateProfile = async (name: string, email: string) => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        showShareToast('Profile updated successfully!');
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update profile');
      }
    } catch (e) {
      console.error('Error updating user profile:', e);
      throw e;
    }
  };

  // Create Playlist Action
  const handleCreatePlaylist = () => {
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCreatePlaylistModalOpen(true);
  };

  const handleCreatePlaylistSubmit = async (name: string, description: string, isPublic: boolean) => {
    if (!token) return;
    const defaultTitle = `Vibe List #${playlists.length + 1}`;

    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.trim() || defaultTitle,
        description: description || 'A customized, curated selection of cloud soundwaves.',
        isPublic,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Playlist creation failed');
    }
    const data = await res.json();
    
    setPlaylists((prev) => [...prev, data]);
    setSelectedPlaylistId(data.id);
    setActiveTab('playlist');
  };

  // Form Playlist from Favorites
  const handleFormPlaylistFromFavorites = async (name: string, songIds: string[]) => {
    if (!token) return;
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: `Custom curated selection of my favourite tracks.`,
          isPublic: true,
          songs: songIds,
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
        }),
      });

      if (!res.ok) throw new Error('Playlist creation failed');
      const data = await res.json();
      
      setPlaylists((prev) => [...prev, data]);
      setSelectedPlaylistId(data.id);
      setActiveTab('playlist');
      showShareToast('Playlist successfully formed from favorites!');
    } catch (e: any) {
      alert(e.message || 'Failed to form playlist from favorites.');
    }
  };

  // Update Playlist Action (Rename, private status)
  const handleUpdatePlaylist = async (playlistId: string, updates: Partial<Playlist>) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to save updates');
      const data = await res.json();
      setPlaylists((prev) => prev.map((p) => (p.id === playlistId ? data : p)));
    } catch (e: any) {
      throw new Error(e.message || 'Update failed.');
    }
  };

  // Delete Playlist Action
  const handleDeletePlaylist = async (playlistId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete playlist');
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      setSelectedPlaylistId(null);
    } catch (e: any) {
      throw new Error(e.message || 'Deletion failed.');
    }
  };

  // Add song to playlist action
  const handleAddSongToPlaylist = async (songId: string, playlistId: string) => {
    if (!token) return;
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    if (playlist.songs.includes(songId)) return; // already added

    const updatedSongs = [...playlist.songs, songId];
    try {
      await handleUpdatePlaylist(playlistId, { songs: updatedSongs });
      showShareToast('Song successfully added to your playlist!');
    } catch (e: any) {
      console.error(e);
    }
  };

  // Remove song from playlist
  const handleRemoveSongFromPlaylist = async (songId: string, playlistId: string) => {
    if (!token) return;
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return;

    const updatedSongs = playlist.songs.filter((id) => id !== songId);
    try {
      await handleUpdatePlaylist(playlistId, { songs: updatedSongs });
    } catch (e: any) {
      console.error(e);
    }
  };

  // Song Like Action
  const handleToggleLike = async (songId: string) => {
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/songs/${songId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setLikedSongs(data.likedSongs);
        if (currentUser) {
          setCurrentUser({ ...currentUser, likedSongs: data.likedSongs });
        }
      }
    } catch (e) {
      console.error('Like toggle failed:', e);
    }
  };

  // AI Smart Playlist curation
  const handleGenerateSmartPlaylist = async (params: { prompt: string; mood: string; genre: string }) => {
    if (!token) return;
    try {
      const res = await fetch('/api/ai/smart-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: params.prompt,
          likedSongIds: likedSongs,
          mood: params.mood,
          genre: params.genre,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Smart Playlist compilation failed');
      }

      // Prepend or add new playlist to state
      setPlaylists((prev) => [...prev, data.playlist]);
      setSelectedPlaylistId(data.playlist.id);
      setActiveTab('playlist');
    } catch (e: any) {
      throw new Error(e.message || 'AI engine failed.');
    }
  };

  // Callback after admin uploads song successfully
  const handleSongUploaded = (newSong: Song) => {
    setSongs((prev) => [...prev, newSong]);
  };

  // Show copy link alert
  const showShareToast = (msg: string) => {
    setShareToast({ show: true, msg });
    setTimeout(() => setShareToast({ show: false, msg: '' }), 3000);
  };

  const handleShareSong = (song: Song) => {
    const shareUrl = `${window.location.origin}?playlistId=system-all`; // simple mock target or public app reference
    navigator.clipboard.writeText(`${song.title} by ${song.artist} on Melodia: ${shareUrl}`)
      .then(() => {
        showShareToast('Track share link copied to clipboard!');
      });
  };

  return (
    <div className="flex flex-col h-screen bg-[#050508] text-white overflow-hidden font-sans relative select-none">
      
      {/* Atmospheric Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-[400px] h-[400px] rounded-full bg-blue-900/15 blur-[100px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-orange-500/5 blur-[80px]"></div>
      </div>

      {/* Upper Layout Area */}
      <div className="flex flex-1 overflow-hidden relative z-10 bg-transparent">
        
        {/* Mobile Sidebar Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div
            id="mobile-sidebar-backdrop"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/65 z-40 md:hidden backdrop-blur-sm transition-all duration-300"
          />
        )}

        {/* Sidebar Panel */}
        <Sidebar
          currentUser={currentUser}
          playlists={playlists}
          activeTab={activeTab}
          selectedPlaylistId={selectedPlaylistId}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          setSelectedPlaylistId={(id) => {
            setSelectedPlaylistId(id);
            setIsMobileSidebarOpen(false);
          }}
          onOpenAuth={() => {
            setIsAuthModalOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          onLogout={() => {
            handleLogout();
            setIsMobileSidebarOpen(false);
          }}
          onCreatePlaylist={() => {
            handleCreatePlaylist();
            setIsMobileSidebarOpen(false);
          }}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Floating Custom Notification Toast */}
        {shareToast.show && (
          <div id="share-toast-notification" className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-orange-400 text-xs font-semibold shadow-lg shadow-black/40 backdrop-blur-xl animate-bounce">
            <Check className="h-4 w-4" />
            <span>{shareToast.msg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
          
          {/* Header Bar */}
          <header className="h-16 border-b border-white/5 px-4 md:px-8 flex items-center justify-between bg-[#050508]/40 backdrop-blur-md relative z-20">
            <div className="flex items-center gap-3">
              {/* Menu trigger button on mobile */}
              <button
                id="btn-mobile-menu-toggle"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 md:hidden transition-all cursor-pointer"
                title="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Cloud Streaming Hub</span>
            </div>
            {!token && (
              <button
                id="header-connect-cta"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Curating playlists? Sign in</span>
                <Sparkles className="h-3 w-3" />
              </button>
            )}
          </header>

          {/* Dynamic Inner Tab View Router */}
          {activeTab === 'home' && (
            <MainDashboard
              songs={songs}
              playlists={playlists}
              likedSongs={likedSongs}
              activeSongId={currentSong?.id || null}
              isPlaying={isPlaying}
              onPlaySong={playSong}
              onToggleLike={handleToggleLike}
              onAddSongToPlaylist={handleAddSongToPlaylist}
              onSelectPlaylist={(id) => {
                setSelectedPlaylistId(id);
                setActiveTab('playlist');
              }}
              onGenerateSmartPlaylist={handleGenerateSmartPlaylist}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onViewProfile={() => setActiveTab('account')}
              currentUser={currentUser}
              userHistory={userHistory}
              currentSong={currentSong}
              progress={progress}
              onSeek={handleSeek}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreView
              songs={songs}
              playlists={playlists}
              activeSongId={currentSong?.id || null}
              isPlaying={isPlaying}
              onPlaySong={playSong}
              onAddSongToPlaylist={handleAddSongToPlaylist}
              onSelectPlaylist={(id) => {
                setSelectedPlaylistId(id);
                setActiveTab('playlist');
              }}
              onGenerateSmartPlaylist={handleGenerateSmartPlaylist}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'search' && (
            <SearchView
              currentUser={currentUser}
              playlists={playlists}
              likedSongs={likedSongs}
              activeSongId={currentSong?.id || null}
              isPlaying={isPlaying}
              onPlaySong={playSong}
              onToggleLike={handleToggleLike}
              onAddSongToPlaylist={handleAddSongToPlaylist}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}

          {activeTab === 'liked' && (
            <LikedView
              currentUser={currentUser}
              songs={songs}
              playlists={playlists}
              likedSongs={likedSongs}
              activeSongId={currentSong?.id || null}
              isPlaying={isPlaying}
              onPlaySong={playSong}
              onToggleLike={handleToggleLike}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onAddSongToPlaylist={handleAddSongToPlaylist}
            />
          )}

          {activeTab === 'library' && (
            <LibraryView
              currentUser={currentUser}
              songs={songs}
              playlists={playlists}
              likedSongs={likedSongs}
              activeSongId={currentSong?.id || null}
              isPlaying={isPlaying}
              onPlaySong={playSong}
              onToggleLike={handleToggleLike}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
              onAddSongToPlaylist={handleAddSongToPlaylist}
              onSelectPlaylist={(id) => {
                setSelectedPlaylistId(id);
                setActiveTab('playlist');
              }}
              onCreatePlaylist={handleCreatePlaylist}
              onFormPlaylistFromFavorites={handleFormPlaylistFromFavorites}
            />
          )}

          {activeTab === 'account' && (
            <AccountView
              currentUser={currentUser}
              songs={songs}
              playlists={playlists}
              likedSongs={likedSongs}
              userHistory={userHistory}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
              onPlaySong={playSong}
              onUpdateAvatar={handleUpdateAvatar}
              onDeleteAvatar={handleDeleteAvatar}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {activeTab === 'playlist' && selectedPlaylistId && (
            <PlaylistView
              playlistId={selectedPlaylistId}
              playlists={playlists}
              songs={songs}
              likedSongs={likedSongs}
              activeSongId={currentSong?.id || null}
              isPlaying={isPlaying}
              currentUser={currentUser}
              onPlaySong={playSong}
              onToggleLike={handleToggleLike}
              onUpdatePlaylist={handleUpdatePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onRemoveSongFromPlaylist={handleRemoveSongFromPlaylist}
              setActiveTab={setActiveTab}
              onAddSongToPlaylist={handleAddSongToPlaylist}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          )}

          {activeTab === 'admin' && currentUser?.role === 'admin' && (
            <AdminPanel
              songs={songs}
              token={token}
              onSongUploaded={handleSongUploaded}
              onPlaySong={playSong}
            />
          )}
        </main>
      </div>

      {/* Floating Auth Modal Overlay */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Floating Create Playlist Modal Overlay */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistModalOpen}
        onClose={() => setIsCreatePlaylistModalOpen(false)}
        onCreate={handleCreatePlaylistSubmit}
        suggestedName={`Vibe List #${playlists.length + 1}`}
      />

      {/* Persistent Bottom Music Player */}
      <BottomPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        volume={volume}
        progress={progress}
        duration={duration}
        shuffle={shuffle}
        repeat={repeat}
        likedSongs={likedSongs}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onVolumeChange={setVolume}
        onSeek={handleSeek}
        onShuffleToggle={() => setShuffle(!shuffle)}
        onRepeatToggle={() => {
          if (repeat === 'off') setRepeat('one');
          else if (repeat === 'one') setRepeat('all');
          else setRepeat('off');
        }}
        onToggleLike={handleToggleLike}
        onShareSong={handleShareSong}
      />
    </div>
  );
}
