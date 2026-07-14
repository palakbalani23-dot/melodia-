import React, { useState, useRef } from 'react';
import { User as UserIcon, Shield, Sparkles, Mail, Radio, LogOut, Clock, Layers, Flame, CheckCircle, Database, Camera, Loader2, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { User, Song, Playlist } from '../types';

interface AccountViewProps {
  currentUser: User | null;
  songs: Song[];
  playlists: Playlist[];
  likedSongs: string[];
  userHistory?: any[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onUpdateAvatar: (base64Image: string) => Promise<void>;
  onDeleteAvatar: () => Promise<void>;
  onUpdateProfile: (name: string, email: string) => Promise<void>;
}

export default function AccountView({
  currentUser,
  songs,
  playlists,
  likedSongs,
  userHistory = [],
  onOpenAuth,
  onLogout,
  onPlaySong,
  onUpdateAvatar,
  onDeleteAvatar,
  onUpdateProfile,
}: AccountViewProps) {
  const [quality, setQuality] = useState('lossless');
  const [crossfade, setCrossfade] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myPlaylists = playlists.filter(
    (p) => p.createdBy === currentUser?.id || p.createdBy === 'system'
  );

  const handleAvatarClick = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB.');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        await onUpdateAvatar(base64);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload profile image.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAvatarClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || !currentUser.avatarUrl) return;

    setUploadError('');
    setIsDeleting(true);
    try {
      await onDeleteAvatar();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to delete profile image.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!editName.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }
    if (!editEmail.trim()) {
      setProfileError('Email cannot be empty.');
      return;
    }

    setProfileError('');
    setIsSavingProfile(true);
    try {
      await onUpdateProfile(editName.trim(), editEmail.trim());
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleStartEditing = () => {
    if (!currentUser) return;
    setEditName(currentUser.name);
    setEditEmail(currentUser.email);
    setProfileError('');
    setIsEditingProfile(true);
  };

  return (
    <div id="account-view-tab" className="flex-1 overflow-y-auto p-8 pb-32 space-y-8 select-none">
      
      {/* Account Hero Card */}
      <section 
        id="account-hero-banner" 
        className="relative rounded-3xl overflow-hidden bg-black/20 border border-white/5 shadow-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8"
      >
        <div className="absolute top-[-50%] left-[-10%] w-[350px] h-[350px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-30%] right-[10%] w-[250px] h-[250px] bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Avatar Container */}
        <div className="relative group flex-shrink-0 z-10 select-none">
          {currentUser ? (
            <button
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="h-28 w-28 md:h-32 md:w-32 rounded-3xl overflow-hidden bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-orange-500/15 border border-white/10 relative transition-transform duration-300 hover:scale-[1.03] cursor-pointer"
            >
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover rounded-3xl" referrerPolicy="no-referrer" />
              ) : (
                <span>{currentUser.name.charAt(0)}</span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-[10px] font-extrabold uppercase tracking-wider text-orange-400 gap-1.5">
                <Camera className="h-5 w-5 text-orange-400" />
                <span>Upload</span>
              </div>

              {/* Loader overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-[10px] font-extrabold uppercase tracking-wider text-orange-400 gap-1.5">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
            </button>
          ) : (
            <div className="h-28 w-28 md:h-32 md:w-32 rounded-3xl bg-white/5 flex items-center justify-center text-white/30 border border-white/10 relative">
              <UserIcon className="h-14 w-14" />
            </div>
          )}

          {/* Delete Avatar Button Overlay */}
          {currentUser && currentUser.avatarUrl && (
            <button
              id="btn-delete-avatar-action"
              onClick={handleDeleteAvatarClick}
              disabled={isDeleting || isUploading}
              className="absolute -top-1.5 -right-1.5 p-2 rounded-xl bg-rose-500/90 hover:bg-rose-600 text-white shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 z-20 cursor-pointer border border-white/10 flex items-center justify-center"
              title="Delete Profile Image"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="flex-1 text-center md:text-left space-y-3 relative z-10 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-orange-400 px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 inline-flex items-center gap-1">
              <Database className="h-3 w-3" />
              <span>Cloud Profile</span>
            </span>
            {currentUser && (
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 inline-flex items-center gap-1">
                <CheckCircle className="h-3 w-3 animate-pulse" />
                <span>Connected</span>
              </span>
            )}
          </div>

          {currentUser ? (
            <div className="space-y-1 w-full max-w-md">
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold tracking-wider text-orange-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Display Name"
                      disabled={isSavingProfile}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold tracking-wider text-orange-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Email Address"
                      disabled={isSavingProfile}
                      required
                    />
                  </div>
                  
                  {profileError && (
                    <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="py-1.5 px-4 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-55"
                    >
                      {isSavingProfile ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      disabled={isSavingProfile}
                      className="py-1.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-none truncate">
                    {currentUser.name}
                  </h2>
                  <p className="text-white/60 text-sm flex items-center justify-center md:justify-start gap-1.5 mt-1.5">
                    <Mail className="h-4 w-4 text-white/40" />
                    <span className="truncate">{currentUser.email}</span>
                  </p>
                  {uploadError && (
                    <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-center md:justify-start gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white/50 tracking-tight leading-none">
                Offline Guest Account
              </h2>
              <p className="text-white/40 text-sm leading-relaxed max-w-md">
                Connect your account to synchronize your favorite tracks, custom playlists, and listening statistics across devices.
              </p>
            </div>
          )}
        </div>

        <div className="relative z-10 flex-shrink-0 flex flex-col md:flex-row gap-2">
          {!currentUser ? (
            <button
              id="btn-account-login-cta"
              onClick={onOpenAuth}
              className="py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
            >
              <UserIcon className="h-4 w-4" />
              <span>Connect Cloud Profile</span>
            </button>
          ) : (
            <>
              {!isEditingProfile && (
                <button
                  id="btn-account-edit-cta"
                  onClick={handleStartEditing}
                  className="py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Edit2 className="h-4 w-4 text-orange-400" />
                  <span>Edit Details</span>
                </button>
              )}
              <button
                id="btn-account-logout-cta"
                onClick={onLogout}
                className="py-3 px-6 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout Account</span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* Grid of Profile Stats and Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Stats column */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-display font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
            <Radio className="h-5 w-5 text-orange-500" />
            Vibe Profile & Statistics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between h-32">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-400" />
                Saved Favorites
              </span>
              <div>
                <span className="text-3xl font-extrabold text-white font-mono">{likedSongs.length}</span>
                <p className="text-[10px] text-white/30 mt-1">Tracks Liked</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between h-32">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-purple-400" />
                Personal Playlists
              </span>
              <div>
                <span className="text-3xl font-extrabold text-white font-mono">{myPlaylists.length}</span>
                <p className="text-[10px] text-white/30 mt-1">Custom Playlists</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between h-32">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-400" />
                Access Tier
              </span>
              <div>
                <span className="text-xl font-extrabold text-orange-400 uppercase tracking-tight flex items-center gap-1 mt-1">
                  <Shield className="h-5 w-5 text-orange-500 flex-shrink-0" />
                  {currentUser ? currentUser.role : 'Guest'}
                </span>
                <p className="text-[10px] text-white/30 mt-2">Workspace Privilege</p>
              </div>
            </div>
          </div>

          {/* Recently Played Logs Section */}
          {currentUser && userHistory && userHistory.length > 0 ? (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-white/40 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Your Cloud Stream History
              </h4>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden max-h-[320px] overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase font-bold tracking-wider text-white/40">
                      <th className="py-3 pl-5 w-12">#</th>
                      <th className="py-3 px-4">Song Title</th>
                      <th className="py-3 px-4 text-right pr-5">Played At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {userHistory.map((item, index) => {
                      // Find full song details if available in catalog
                      const fullSong = songs.find(s => s.id === item.songId) || {
                        id: item.songId,
                        title: item.title,
                        artist: item.artist,
                        coverUrl: item.coverUrl,
                        genre: "History",
                        duration: 180,
                        url: ""
                      };

                      return (
                        <tr key={item.id} className="group hover:bg-white/[0.03] transition-colors">
                          <td className="py-2.5 pl-5 text-xs text-white/30">{index + 1}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-7 w-7 rounded-lg overflow-hidden bg-black/20 border border-white/5 flex-shrink-0">
                                <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p 
                                  onClick={() => onPlaySong(fullSong, songs)}
                                  className="text-xs font-semibold text-white/95 truncate hover:text-orange-400 cursor-pointer transition-colors"
                                >
                                  {item.title}
                                </p>
                                <p className="text-[10px] text-white/40 truncate mt-0.5">{item.artist}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right pr-5 text-[10px] font-mono text-white/40">
                            {new Date(item.playedAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-white/30 text-xs">
              Playback history will appear here once you stream songs on Melodia.
            </div>
          )}
        </div>

        {/* Profile Settings Preferences column */}
        <div className="space-y-6">
          <h3 className="font-display font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Vibe Preferences
          </h3>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-6">
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-white/60 uppercase tracking-wider block">Audio Stream Quality</label>
              <div className="grid grid-cols-3 gap-2">
                {['standard', 'high', 'lossless'].map((q) => (
                  <button
                    id={`btn-pref-quality-${q}`}
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      quality === q
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/15'
                        : 'bg-black/30 text-white/40 border border-white/5 hover:text-white hover:bg-black/40'
                    }`}
                  >
                    {q === 'lossless' ? 'Lossless' : q === 'high' ? '320kbps' : '128kbps'}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed mt-1">
                Lossless audio uses higher bandwidth to deliver crisp studio-fidelity soundwaves directly to your device.
              </p>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-extrabold text-white/60 uppercase tracking-wider block">Seamless Crossfade</label>
                  <p className="text-[10px] text-white/30 leading-relaxed mt-0.5">Smooth transitions between ambient beats.</p>
                </div>
                <button
                  id="btn-pref-crossfade-toggle"
                  onClick={() => setCrossfade(!crossfade)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                    crossfade ? 'bg-orange-500' : 'bg-black/40 border border-white/5'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${crossfade ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <label className="text-xs font-extrabold text-white/60 uppercase tracking-wider block">Visual Waveform</label>
                  <p className="text-[10px] text-white/30 leading-relaxed mt-0.5">Show beautiful audio ripples in player.</p>
                </div>
                <div className="w-11 h-6 rounded-full bg-orange-500 p-1">
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-5" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Melodia Node Identity</span>
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>Version</span>
                <span>2.4.0-cloud</span>
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>Regional Server</span>
                <span>Southeast-1</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
