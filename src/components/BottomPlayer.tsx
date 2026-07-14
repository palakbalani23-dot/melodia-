import React from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Music,
  Download,
  Share2
} from 'lucide-react';
import { Song } from '../types';

interface BottomPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  likedSongs: string[];
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeChange: (vol: number) => void;
  onSeek: (seconds: number) => void;
  onShuffleToggle: () => void;
  onRepeatToggle: () => void;
  onToggleLike: (songId: string) => void;
  onShareSong: (song: Song) => void;
}

export default function BottomPlayer({
  currentSong,
  isPlaying,
  volume,
  progress,
  duration,
  shuffle,
  repeat,
  likedSongs,
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeChange,
  onSeek,
  onShuffleToggle,
  onRepeatToggle,
  onToggleLike,
  onShareSong,
}: BottomPlayerProps) {
  const isLiked = currentSong ? likedSongs.includes(currentSong.id) : false;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVal = parseFloat(e.target.value);
    onSeek(targetVal);
  };

  const [isMuted, setIsMuted] = React.useState(false);
  const [prevVolume, setPrevVolume] = React.useState(volume);

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  // If there's no song loaded, show a placeholder bar or empty player
  if (!currentSong) {
    return (
      <div className="h-20 bg-black/40 backdrop-blur-xl border-t border-white/5 px-6 flex items-center justify-between text-white/40 text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20">
            <Music className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-white/60">No track loaded</p>
            <p className="text-[10px] text-white/30">Select a song to start listening</p>
          </div>
        </div>
        <div className="text-center font-display text-white/40 text-xs sm:text-sm">
          Select a song or let Melodia AI curate a custom playlist
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-white/30" />
          <div className="w-24 h-1 bg-white/10 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div id="fixed-bottom-player" className="h-24 bg-black/60 backdrop-blur-2xl border-t border-white/10 px-6 flex flex-col justify-center select-none relative z-40">
      {/* Absolute Timeline bar at the top of the player for premium aesthetic */}
      <div className="absolute top-0 left-0 right-0 h-1 flex items-center">
        <input
          id="player-progress-range"
          type="range"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={handleProgressChange}
          className="w-full h-1 bg-white/10 appearance-none cursor-pointer outline-none accent-orange-500 hover:accent-orange-400 transition-all [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow"
          style={{
            background: `linear-gradient(to right, #f97316 0%, #f97316 ${
              duration > 0 ? (progress / duration) * 100 : 0
            }%, rgba(255,255,255,0.1) ${duration > 0 ? (progress / duration) * 100 : 0}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        {/* Left: Track Details */}
        <div className="flex items-center gap-2.5 md:gap-4 w-1/2 md:w-1/4 min-w-0">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 relative group shadow-lg">
            {currentSong.coverUrl ? (
              <img src={currentSong.coverUrl} alt={currentSong.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-white/5 text-orange-400">
                <Music className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="truncate pr-1 md:pr-4 min-w-0 flex-1">
            <h4 className="text-xs md:text-sm font-semibold text-white truncate tracking-tight">{currentSong.title}</h4>
            <p className="text-[10px] md:text-xs text-white/40 truncate mt-0.5">{currentSong.artist}</p>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              id={`btn-player-like-${currentSong.id}`}
              onClick={() => onToggleLike(currentSong.id)}
              className={`p-1 md:p-1.5 rounded-lg transition-all ${
                isLiked
                  ? 'text-orange-500 hover:text-orange-400 scale-105'
                  : 'text-white/40 hover:text-white hover:bg-white/10'
              }`}
              title={isLiked ? "Unlike song" : "Like song"}
            >
              <Heart className="h-3.5 w-3.5 md:h-4 md:w-4" fill={isLiked ? "currentColor" : "none"} />
            </button>
            <button
              id={`btn-player-share-${currentSong.id}`}
              onClick={() => onShareSong(currentSong)}
              className="p-1.5 rounded-lg text-white/40 hover:text-orange-400 hover:bg-white/10 transition-all hidden sm:inline-flex"
              title="Share track"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex flex-col items-center flex-1 min-w-0 px-2">
          <div className="flex items-center gap-3 md:gap-6">
            {/* Shuffle Button */}
            <button
              id="btn-player-shuffle"
              onClick={onShuffleToggle}
              className={`p-1 rounded-md transition-colors ${
                shuffle ? 'text-orange-400 hover:text-orange-300' : 'text-white/40 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </button>

            {/* Skip Back Button */}
            <button
              id="btn-player-prev"
              onClick={onPrevious}
              className="p-1 rounded-md text-white/60 hover:text-white transition-colors"
              title="Previous song"
            >
              <SkipBack className="h-4 w-4 fill-current" />
            </button>

            {/* Play / Pause Toggle */}
            <button
              id="btn-player-play-pause"
              onClick={onPlayPause}
              className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-white text-black hover:bg-white/90 flex items-center justify-center shadow-lg hover:scale-105 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current text-black" /> : <Play className="h-4 w-4 fill-current ml-0.5 text-black" />}
            </button>

            {/* Skip Forward Button */}
            <button
              id="btn-player-next"
              onClick={onNext}
              className="p-1 rounded-md text-white/60 hover:text-white transition-colors"
              title="Next song"
            >
              <SkipForward className="h-4 w-4 fill-current" />
            </button>

            {/* Repeat Button */}
            <button
              id="btn-player-repeat"
              onClick={onRepeatToggle}
              className={`p-1 rounded-md transition-colors ${
                repeat !== 'off' ? 'text-orange-400 hover:text-orange-300' : 'text-white/40 hover:text-white'
              }`}
              title={`Repeat: ${repeat}`}
            >
              {repeat === 'one' ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </button>
          </div>

          {/* Timing indicators (Only visible on medium devices and larger) */}
          <div className="hidden md:flex items-center gap-3 w-full max-w-lg mt-2 justify-center">
            <span className="text-[10px] font-mono text-white/40 w-8 text-right">
              {formatTime(progress)}
            </span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden flex-shrink-0 relative">
              <div
                className="bg-white h-full rounded-full"
                style={{ width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-white/40 w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Sound Controls (hidden on mobile, relies on physical device keys) */}
        <div className="hidden sm:flex items-center justify-end gap-2 md:gap-3 w-auto md:w-1/4 md:min-w-[150px]">
          {/* Direct stream indicator */}
          {currentSong.isCustomUpload && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-orange-400 font-medium border border-white/10 backdrop-blur-sm hidden lg:inline-block">
              Custom Upload
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              id="btn-player-mute"
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              id="player-volume-range"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                onVolumeChange(vol);
                if (vol > 0) setIsMuted(false);
              }}
              className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                  (isMuted ? 0 : volume) * 100
                }%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
