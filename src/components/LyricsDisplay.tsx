import React, { useState, useEffect, useRef } from 'react';
import { Music, Sparkles, AlertCircle, Play, Layers, AlignLeft } from 'lucide-react';
import { Song } from '../types';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsDisplayProps {
  currentSong: Song | null;
  progress: number;
  isPlaying: boolean;
  onSeek?: (seconds: number) => void;
}

export default function LyricsDisplay({ currentSong, progress, isPlaying, onSeek }: LyricsDisplayProps) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [isSyncedMode, setIsSyncedMode] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Fetch lyrics whenever currentSong changes
  useEffect(() => {
    if (!currentSong) {
      setLyrics([]);
      setSource('');
      return;
    }

    let isMounted = true;
    const fetchLyrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = `songId=${currentSong.id}&title=${encodeURIComponent(currentSong.title)}&artist=${encodeURIComponent(currentSong.artist)}`;
        const res = await fetch(`/api/lyrics?${query}`);
        if (!res.ok) {
          throw new Error('Failed to load lyrics');
        }
        const data = await res.json();
        if (isMounted) {
          setLyrics(data.lyrics || []);
          setSource(data.source || 'gemini');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Could not fetch lyrics');
          // Fallback to static offline presentation
          setLyrics([
            { time: 0, text: `♪ (Now playing: ${currentSong.title}) ♪` },
            { time: 5, text: "Lyrics search returned an error or is offline." },
            { time: 10, text: "Enjoy the pure musical notes flowing in your workspace!" }
          ]);
          setSource('fallback');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLyrics();

    return () => {
      isMounted = false;
    };
  }, [currentSong?.id]);

  // Find active line index based on current audio position
  const activeIndex = lyrics.reduce((acc, line, idx) => {
    if (progress >= line.time) {
      return idx;
    }
    return acc;
  }, -1);

  // Auto-scroll the active line to the center of the container
  useEffect(() => {
    if (isSyncedMode && activeLineRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeLine = activeLineRef.current;

      const containerHeight = container.clientHeight;
      const lineOffsetTop = activeLine.offsetTop;
      const lineHeight = activeLine.clientHeight;

      // Scroll so the active line is exactly in the middle of the container
      const targetScrollTop = lineOffsetTop - containerHeight / 2 + lineHeight / 2;

      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });
    }
  }, [activeIndex, isSyncedMode, lyrics]);

  if (!currentSong) {
    return (
      <div 
        id="lyrics-empty-state"
        className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent p-10 flex flex-col items-center justify-center text-center h-[350px] space-y-4"
      >
        <div className="h-16 w-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
          <Music className="h-8 w-8 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-extrabold text-lg text-white">Real-Time Lyrics</h4>
          <p className="text-xs text-white/50 max-w-sm">
            Play any track from the collection or custom uploads to see real-time, synchronized lyrics power-up your dashboard space.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="lyrics-panel-container"
      className="rounded-3xl border border-white/5 bg-[#050508]/60 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col h-[400px]"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400">
            <Sparkles className="h-4.5 w-4.5 animate-pulse text-orange-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight">Real-Time Sync Lyrics</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] text-white/40 truncate max-w-[150px]">{currentSong.title}</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              {source === 'local' && (
                <span className="text-[8px] font-bold text-emerald-400 uppercase bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Pre-synced
                </span>
              )}
              {source === 'gemini' && (
                <span className="text-[8px] font-bold text-orange-400 uppercase bg-orange-400/10 px-1.5 py-0.5 rounded border border-orange-500/20 flex items-center gap-0.5">
                  <Sparkles className="h-2 w-2" /> Gemini AI
                </span>
              )}
              {source === 'generic_fallback' && (
                <span className="text-[8px] font-bold text-blue-400 uppercase bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                  Visualizer Sync
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-lyric-sync"
            onClick={() => setIsSyncedMode(!isSyncedMode)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isSyncedMode
                ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                : 'bg-white/5 border-white/5 text-white/50 hover:text-white'
            }`}
            title={isSyncedMode ? "Disable Auto-scroll" : "Enable Auto-scroll"}
          >
            {isSyncedMode ? <Layers className="h-3.5 w-3.5" /> : <AlignLeft className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isSyncedMode ? 'Follow' : 'Manual'}</span>
          </button>
        </div>
      </div>

      {/* Lyrics Body Container */}
      <div 
        ref={containerRef}
        id="lyrics-body-scroller"
        className="flex-1 overflow-y-auto px-8 py-16 space-y-6 scrollbar-thin select-text"
        style={{ scrollPadding: '100px 0px' }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="h-6 w-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider animate-pulse">
              Generating lyrics stream...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
            <AlertCircle className="h-6 w-6 text-orange-500/80" />
            <p className="text-xs text-white/60">{error}</p>
            <p className="text-[10px] text-white/30">Displaying backup instrumental timeline</p>
          </div>
        ) : lyrics.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-white/30 text-xs">
            No lyrics available for this track.
          </div>
        ) : (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPassed = idx < activeIndex;

            return (
              <button
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => {
                  if (onSeek) {
                    onSeek(line.time);
                  }
                }}
                className={`w-full text-center py-2 transition-all duration-300 rounded-xl px-4 origin-center cursor-pointer relative group/line flex items-center justify-center border ${
                  isActive 
                    ? 'text-white text-lg sm:text-xl font-extrabold scale-[1.03] drop-shadow-[0_4px_12px_rgba(249,115,22,0.3)] text-orange-400 bg-orange-500/5 border-orange-500/10' 
                    : isPassed
                      ? 'text-white/30 text-sm sm:text-base font-medium hover:text-white/60 hover:bg-white/[0.02] border-transparent'
                      : 'text-white/60 text-sm sm:text-base font-medium hover:text-white/90 hover:bg-white/[0.02] border-transparent'
                }`}
              >
                {/* Floating time badge when hovering or active */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded opacity-0 group-hover/line:opacity-100 transition-opacity pointer-events-none">
                  {Math.floor(line.time / 60)}:{(line.time % 60) < 10 ? '0' : ''}{line.time % 60}
                </span>

                <span className="truncate">{line.text}</span>

                {/* Micro play icon on hover to signify seekable capability */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/line:opacity-100 transition-opacity text-orange-400 pointer-events-none">
                  <Play className="h-3 w-3 fill-current" />
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Subtle Bottom Ambient Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none" />
    </div>
  );
}
