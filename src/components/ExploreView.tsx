import React, { useState } from 'react';
import { Sparkles, Play, Pause, Compass, Disc } from 'lucide-react';
import { Song, Playlist } from '../types';
import AddToPlaylistDropdown from './AddToPlaylistDropdown';

interface ExploreViewProps {
  songs: Song[];
  playlists: Playlist[];
  activeSongId: string | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, queue: Song[]) => void;
  onAddSongToPlaylist: (songId: string, playlistId: string) => void;
  onSelectPlaylist: (playlistId: string) => void;
  onGenerateSmartPlaylist: (params: { prompt: string; mood: string; genre: string }) => Promise<void>;
  onOpenAuth: () => void;
  currentUser: any;
}

export default function ExploreView({
  songs,
  playlists,
  activeSongId,
  isPlaying,
  onPlaySong,
  onAddSongToPlaylist,
  onSelectPlaylist,
  onGenerateSmartPlaylist,
  onOpenAuth,
  currentUser,
}: ExploreViewProps) {
  // AI Form state
  const [prompt, setPrompt] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');
  const [aiErrorMsg, setAiErrorMsg] = useState('');

  // Local genre browsing
  const [activeGenreFilter, setActiveGenreFilter] = useState('All');

  const genres = ['All', 'Lofi Chill', 'Synthwave', 'Ambient', 'Electronic', 'Ambient Focus'];
  const filteredSongs = activeGenreFilter === 'All' 
    ? songs 
    : songs.filter(s => s.genre === activeGenreFilter);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setAiGenerating(true);
    setAiSuccessMsg('');
    setAiErrorMsg('');

    try {
      await onGenerateSmartPlaylist({
        prompt: prompt || `Melodia curation with ${selectedMood || 'Chill'} vibe`,
        mood: selectedMood,
        genre: selectedGenre,
      });
      setAiSuccessMsg('Smart Playlist curated successfully! Check your Library.');
      setPrompt('');
      setSelectedMood('');
      setSelectedGenre('');
    } catch (err: any) {
      setAiErrorMsg(err.message || 'AI Playlist creation failed. Please try again.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleQuickPromptClick = (text: string, mood: string, genre: string) => {
    setPrompt(text);
    setSelectedMood(mood);
    setSelectedGenre(genre);
  };

  return (
    <div id="explore-view-tab" className="flex-1 overflow-y-auto p-8 pb-32 space-y-10 select-none">
      
      {/* Premium Hero AI Generator Banner */}
      <section 
        id="ai-generator-banner-explore" 
        className="relative rounded-3xl overflow-hidden bg-black/20 border border-white/5 shadow-xl shadow-black/40 backdrop-blur-md"
      >
        {/* Colorful Ambient Glow */}
        <div className="absolute top-[-50%] right-[-10%] w-[350px] h-[350px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-30%] left-[10%] w-[250px] h-[250px] bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="p-8 md:p-10 flex flex-col lg:flex-row items-center gap-8 relative z-10">
          {/* Headline Text */}
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Smart Playlist Engine</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-none">
              How do you want your music to feel today?
            </h2>
            <p className="text-white/60 text-sm max-w-lg leading-relaxed">
              Describe your mood or activity, and our intelligent curation algorithm will instantly generate a tailored smart playlist from our catalog & recommend external masterpieces.
            </p>

            {/* Quick Prompts Suggestions */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">Try quick vibe checks</span>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  id="btn-quick-vibe-rainy-explore"
                  onClick={() => handleQuickPromptClick('Rainy Sunday afternoon watching droplets fall', 'Cozy Chill', 'Lofi Chill')}
                  className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/5 text-xs text-white/80 transition-colors cursor-pointer"
                >
                  🌧️ Rainy Afternoon
                </button>
                <button
                  id="btn-quick-vibe-coding-explore"
                  onClick={() => handleQuickPromptClick('Hyper-focus coding deep in terminal logic', 'Intense Focus', 'Ambient Focus')}
                  className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/5 text-xs text-white/80 transition-colors cursor-pointer"
                >
                  💻 Focus Code
                </button>
                <button
                  id="btn-quick-vibe-cyber-explore"
                  onClick={() => handleQuickPromptClick('Driving through cyber neon futuristic tunnels', 'Retro High', 'Synthwave')}
                  className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/5 text-xs text-white/80 transition-colors cursor-pointer"
                >
                  🏎️ Neon Cyber Drive
                </button>
              </div>
            </div>
          </div>

          {/* Generator Form */}
          <div className="w-full lg:w-[400px] bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10 flex flex-shrink-0 flex-col">
            {aiSuccessMsg && (
              <div id="ai-success-toast-explore" className="p-3 mb-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold text-center animate-pulse">
                {aiSuccessMsg}
              </div>
            )}
            {aiErrorMsg && (
              <div id="ai-error-toast-explore" className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold text-center">
                {aiErrorMsg}
              </div>
            )}

            <form onSubmit={handleAiSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/60">Vibe Description</label>
                <input
                  id="input-ai-prompt-explore"
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., acoustic mornings with fresh coffee..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs text-white placeholder-white/20 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Mood Pill</label>
                  <select
                    id="select-ai-mood-explore"
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/80 focus:border-orange-500 outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#050508]">Any Mood</option>
                    <option value="Chill" className="bg-[#050508]">Chill & Soft</option>
                    <option value="Focus" className="bg-[#050508]">Focus & Flow</option>
                    <option value="Energetic" className="bg-[#050508]">Energetic</option>
                    <option value="Melancholic" className="bg-[#050508]">Melancholic</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/60">Genre Vibe</label>
                  <select
                    id="select-ai-genre-explore"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/80 focus:border-orange-500 outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#050508]">Any Genre</option>
                    <option value="Lofi Chill" className="bg-[#050508]">Lofi Chill</option>
                    <option value="Synthwave" className="bg-[#050508]">Synthwave</option>
                    <option value="Ambient" className="bg-[#050508]">Ambient</option>
                    <option value="Electronic" className="bg-[#050508]">Electronic</option>
                  </select>
                </div>
              </div>

              <button
                id="btn-ai-generate-explore"
                type="submit"
                disabled={aiGenerating}
                className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 animate-spin-slow" />
                <span>{aiGenerating ? 'AI is Curating...' : 'Generate Smart Playlist'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Explore Playlists Section */}
      <section id="explore-playlists-section-view" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Playlists column (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-display font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
            <Compass className="h-5 w-5 text-orange-500" />
            Curated Hubs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {playlists.slice(0, 6).map((playlist) => (
              <button
                id={`explore-view-playlist-${playlist.id}`}
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist.id)}
                className="group p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 hover:bg-white/10 hover:border-white/10 transition-all text-left cursor-pointer"
              >
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-black/20 flex-shrink-0">
                  <img src={playlist.coverUrl} alt={playlist.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-white group-hover:text-white truncate tracking-tight">{playlist.name}</h4>
                  <p className="text-xs text-white/40 line-clamp-1 mt-1">{playlist.description}</p>
                  <span className="text-[10px] text-white/30 font-medium mt-2 block">
                    {playlist.songs.length} songs • {playlist.isSmart ? 'AI Smart' : `by ${playlist.creatorName}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Genres column (1/3 width) */}
        <div className="space-y-4">
          <h3 className="font-display font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
            <Disc className="h-5 w-5 text-orange-500" />
            Browse Genres
          </h3>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  id={`btn-genre-filter-explore-${genre}`}
                  key={genre}
                  onClick={() => setActiveGenreFilter(genre)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activeGenreFilter === genre
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10'
                      : 'bg-black/20 hover:bg-black/45 text-white/60 hover:text-white border border-white/5'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* List of song items matching genre filter */}
            <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
              {filteredSongs.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-4">No songs found in this genre.</p>
              ) : (
                filteredSongs.map((s) => (
                  <div
                    id={`genre-song-explore-${s.id}`}
                    key={s.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-black/20 border border-white/5 hover:bg-black/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 rounded-lg overflow-hidden bg-black/20 flex-shrink-0 border border-white/5">
                        <img src={s.coverUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white/90 truncate leading-tight">{s.title}</p>
                        <p className="text-[10px] text-white/40 truncate mt-0.5">{s.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <AddToPlaylistDropdown
                        songId={s.id}
                        playlists={playlists}
                        currentUser={currentUser}
                        onAddSongToPlaylist={onAddSongToPlaylist}
                        onOpenAuth={onOpenAuth}
                      />
                      <button
                        id={`btn-genre-play-explore-${s.id}`}
                        onClick={() => onPlaySong(s, filteredSongs)}
                        className="p-1.5 text-orange-400 hover:text-orange-300 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        {activeSongId === s.id && isPlaying ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-current" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
