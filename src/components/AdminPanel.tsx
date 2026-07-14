import React, { useState, useRef } from 'react';
import { UploadCloud, Music, Image as ImageIcon, ShieldCheck, Check, Film, Clock, Play } from 'lucide-react';
import { Song } from '../types';

interface AdminPanelProps {
  songs: Song[];
  token: string | null;
  onSongUploaded: (newSong: Song) => void;
  onPlaySong: (song: Song, queue: Song[]) => void;
}

export default function AdminPanel({ songs, token, onSongUploaded, onPlaySong }: AdminPanelProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Lofi Chill');
  const [duration, setDuration] = useState<number>(180);

  // File States
  const [audioBase64, setAudioBase64] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [coverBase64, setCoverBase64] = useState('');
  const [coverFileName, setCoverFileName] = useState('');

  // Statuses
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [dragActiveAudio, setDragActiveAudio] = useState(false);
  const [dragActiveCover, setDragActiveCover] = useState(false);

  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleAudioFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setError('Please select a valid audio file (e.g., MP3, WAV, AAC).');
      return;
    }
    setError('');
    setAudioFileName(file.name);

    // Auto detect audio duration
    try {
      const audioUrl = URL.createObjectURL(file);
      const tempAudio = new Audio(audioUrl);
      tempAudio.addEventListener('loadedmetadata', () => {
        if (tempAudio.duration) {
          setDuration(Math.round(tempAudio.duration));
        }
      });
    } catch (e) {
      console.warn('Could not auto-detect audio file duration', e);
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAudioBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP) for album art.');
      return;
    }
    setError('');
    setCoverFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setCoverBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Drag Handlers
  const handleDrag = (e: React.DragEvent, type: 'audio' | 'cover', active: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'audio') setDragActiveAudio(active);
    else setDragActiveCover(active);
  };

  const handleDrop = (e: React.DragEvent, type: 'audio' | 'cover') => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'audio') {
      setDragActiveAudio(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleAudioFile(e.dataTransfer.files[0]);
      }
    } else {
      setDragActiveCover(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleCoverFile(e.dataTransfer.files[0]);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioBase64) {
      setError('An audio file is required to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          artist,
          genre,
          duration,
          audioFile: audioBase64,
          coverImage: coverBase64 || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to curate and upload song.');
      }

      setSuccess(`"${data.title}" by ${data.artist} uploaded and metadata index created!`);
      
      // Clear fields
      setTitle('');
      setArtist('');
      setAudioBase64('');
      setAudioFileName('');
      setCoverBase64('');
      setCoverFileName('');
      setDuration(180);

      onSongUploaded(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred during song curation.');
    } finally {
      setLoading(false);
    }
  };

  const customUploads = songs.filter(s => s.isCustomUpload);

  return (
    <div id="admin-panel-container" className="flex-1 overflow-y-auto p-8 pb-32 space-y-10 select-none">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div>
          <h2 className="font-display font-extrabold text-3xl text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-orange-500" />
            Curator Music Board
          </h2>
          <p className="text-white/40 text-xs mt-1">Manage global music streaming catalog and upload secure audio streams</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold uppercase tracking-wider">
          Curator Mode
        </span>
      </div>

      {/* Main Grid: Upload form on the left, current uploads on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        
        {/* Left column (Form, 3/5 width) */}
        <section className="lg:col-span-3 space-y-6">
          <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-6 shadow-inner backdrop-blur-md">
            <h3 className="font-display font-extrabold text-lg text-white">Catalog New Song & Metadata</h3>

            {success && (
              <div id="admin-success-alert" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div id="admin-error-alert" className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Song Title</label>
                  <input
                    id="admin-song-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter song name"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 focus:border-orange-500 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Artist Name</label>
                  <input
                    id="admin-song-artist"
                    type="text"
                    required
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Enter musician/band"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 focus:border-orange-500 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Genre</label>
                  <select
                    id="admin-song-genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/80 focus:border-orange-500 outline-none cursor-pointer"
                  >
                    <option value="Lofi Chill" className="bg-[#050508] text-white">Lofi Chill</option>
                    <option value="Synthwave" className="bg-[#050508] text-white">Synthwave</option>
                    <option value="Ambient" className="bg-[#050508] text-white">Ambient</option>
                    <option value="Electronic" className="bg-[#050508] text-white">Electronic</option>
                    <option value="Ambient Focus" className="bg-[#050508] text-white">Ambient Focus</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Duration (seconds)</label>
                  <input
                    id="admin-song-duration"
                    type="number"
                    required
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 180)}
                    placeholder="E.g., 180"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 focus:border-orange-500 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Drag and Drop Audio File Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/60 flex items-center gap-1">
                  <Music className="h-3.5 w-3.5 text-orange-400" />
                  Audio Stream Upload (.mp3, .wav)
                </label>
                <div
                  id="dropzone-audio"
                  onDragOver={(e) => handleDrag(e, 'audio', true)}
                  onDragLeave={(e) => handleDrag(e, 'audio', false)}
                  onDrop={(e) => handleDrop(e, 'audio')}
                  onClick={() => audioFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                    dragActiveAudio
                      ? 'border-orange-500 bg-orange-500/5'
                      : audioBase64
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-white/10 hover:border-white/20 bg-black/20'
                  }`}
                >
                  <input
                    type="file"
                    ref={audioFileInputRef}
                    onChange={(e) => e.target.files && handleAudioFile(e.target.files[0])}
                    accept="audio/*"
                    className="hidden"
                  />
                  <UploadCloud className={`h-8 w-8 mb-2 ${audioBase64 ? 'text-emerald-400' : 'text-white/30'}`} />
                  {audioBase64 ? (
                    <div>
                      <p className="text-xs font-semibold text-emerald-400">Audio Stream Read Success!</p>
                      <p className="text-[10px] text-white/40 truncate mt-1 max-w-sm mx-auto">{audioFileName}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-white/80">Drag & Drop audio file here, or <span className="text-orange-400 underline">browse</span></p>
                      <p className="text-[10px] text-white/40 mt-1">Supports standard audio formats</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Artwork File Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/60 flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-orange-400" />
                  Custom Cover Art Image (Optional)
                </label>
                <div
                  id="dropzone-cover"
                  onDragOver={(e) => handleDrag(e, 'cover', true)}
                  onDragLeave={(e) => handleDrag(e, 'cover', false)}
                  onDrop={(e) => handleDrop(e, 'cover')}
                  onClick={() => coverFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                    dragActiveCover
                      ? 'border-orange-500 bg-orange-500/5'
                      : coverBase64
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-white/10 hover:border-white/20 bg-black/20'
                  }`}
                >
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    onChange={(e) => e.target.files && handleCoverFile(e.target.files[0])}
                    accept="image/*"
                    className="hidden"
                  />
                  <ImageIcon className={`h-7 w-7 mb-1.5 ${coverBase64 ? 'text-emerald-400' : 'text-white/30'}`} />
                  {coverBase64 ? (
                    <div>
                      <p className="text-xs font-semibold text-emerald-400">Artwork Read Success!</p>
                      <p className="text-[10px] text-white/40 truncate mt-1 max-w-xs mx-auto">{coverFileName}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-white/80">Drag & Drop album artwork, or <span className="text-orange-400 underline">browse</span></p>
                    </div>
                  )}
                </div>
              </div>

              <button
                id="btn-admin-song-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs transition-all shadow-lg shadow-orange-500/25 active:scale-95 disabled:opacity-50 mt-4 cursor-pointer"
              >
                {loading ? 'Curating stream and uploading files...' : 'Publish to Catalog'}
              </button>
            </form>
          </div>
        </section>

        {/* Right column (Upload status & history list, 2/5 width) */}
        <section className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-1.5">
            <Film className="h-5 w-5 text-orange-500" />
            Curator Upload Logs ({customUploads.length})
          </h3>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 max-h-[500px] overflow-y-auto pr-2 space-y-3 backdrop-blur-md">
            {customUploads.length === 0 ? (
              <p className="text-xs text-white/40 text-center py-10 leading-relaxed">
                No songs have been custom-uploaded yet. Upload a song file on the left to populate the cloud catalog.
              </p>
            ) : (
              customUploads.map((s) => (
                <div
                  id={`upload-log-${s.id}`}
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-lg overflow-hidden bg-black/20 border border-white/5 flex-shrink-0">
                      <img src={s.coverUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white/90 truncate">{s.title}</p>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">{s.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium">
                      {s.genre}
                    </span>
                    <button
                      id={`btn-admin-preview-play-${s.id}`}
                      onClick={() => onPlaySong(s, customUploads)}
                      className="p-1 rounded hover:bg-white/5 text-orange-400 hover:text-white transition-colors cursor-pointer"
                      title="Play track"
                    >
                      <Play className="h-4 w-4 fill-current" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
