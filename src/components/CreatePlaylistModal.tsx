import React, { useState } from 'react';
import { X, FolderHeart, Globe, Lock } from 'lucide-react';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, isPublic: boolean) => Promise<void>;
  suggestedName: string;
}

export default function CreatePlaylistModal({
  isOpen,
  onClose,
  onCreate,
  suggestedName,
}: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const playlistName = name.trim() || suggestedName;
    
    setLoading(true);
    try {
      await onCreate(playlistName, description.trim(), isPublic);
      setName('');
      setDescription('');
      setIsPublic(true);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create playlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="create-playlist-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050508]/85 backdrop-blur-md select-none"
    >
      <div
        id="create-playlist-modal-content"
        className="w-full max-w-md bg-[#050508]/80 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Color Highlight Bar */}
        <div className="h-1.5 bg-orange-500 w-full" />

        {/* Close Button */}
        <button
          type="button"
          id="btn-create-playlist-close"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Body */}
        <div className="p-8">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <FolderHeart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white tracking-tight">
                Create Playlist
              </h3>
              <p className="text-[11px] text-white/40 mt-0.5">
                Form soundscapes to hold your favorite cloud soundwaves
              </p>
            </div>
          </div>

          {error && (
            <div
              id="create-playlist-error"
              className="p-3 my-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60">Playlist Name</label>
              <input
                id="input-create-playlist-name"
                type="text"
                placeholder={suggestedName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                maxLength={40}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60">Description (Optional)</label>
              <textarea
                id="input-create-playlist-desc"
                placeholder="Describe the vibe of this custom playlist..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium resize-none"
                maxLength={200}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60">Privacy Level</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-privacy-public"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    isPublic
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-semibold shadow-inner'
                      : 'bg-black/20 border-white/5 text-white/40 hover:bg-black/35 hover:text-white/60'
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Public (Shared)</span>
                </button>
                <button
                  type="button"
                  id="btn-privacy-private"
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    !isPublic
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-semibold shadow-inner'
                      : 'bg-black/20 border-white/5 text-white/40 hover:bg-black/35 hover:text-white/60'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Private (My Eye Only)</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2.5 pt-4">
              <button
                type="button"
                id="btn-create-playlist-cancel"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/80 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-create-playlist-submit"
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create List'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
