"use client";

import { useLyricGenerator } from "./hooks/use-lyric-generator";
import { GeneratorForm } from "./components/features/generator-form";
import { AlbumSongCard } from "./components/features/album-song-card";
import { SkeletonSongCard } from "./components/features/skeleton-song-card";
import { SectionCard } from "./components/ui/section-card";
import { CopyButton } from "./components/ui/copy-button";
import { ARC_LABELS } from "./constants/lyric";
import { motion, AnimatePresence } from "framer-motion";
import { Download, XCircle, Music } from "lucide-react";
import Image from "next/image";
import { StatsCounter } from "./components/ui/stats-counter";
import { SongResult } from "./types/lyric";

function exportAlbum(songs: SongResult[], albumTitle: string) {
  const lines: string[] = [];
  if (albumTitle) lines.push(`# ${albumTitle}\n`);
  for (const s of songs) {
    lines.push(`## Track ${s.position} — ${ARC_LABELS[s.position]}`);
    lines.push(`### ${s.judul}\n`);
    lines.push(s.lirik);
    lines.push(`\n**Suno Prompt:** ${s.sunoPrompt}\n`);
    lines.push("---\n");
  }
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${albumTitle || "album"}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const { state, actions } = useLyricGenerator();
  const {
    albumMode, albumTitle, songPosition, error, albumError,
    loading, result, albumLoading, albumProgress, albumSongs, completedPositions, reloadingTracks
  } = state;
  const posNum = parseInt(songPosition);

  return (
    <div className="min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200 pb-20 relative z-0 overflow-x-hidden">
      
      {/* ── Cyberpunk 3D Background ── */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#030014]">
        {/* Neon Glow Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/15 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[70%] bg-fuchsia-600/15 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full mix-blend-screen" />
        
        {/* Perspective Grid */}
        <div className="absolute bottom-0 left-[-50%] w-[200%] h-[80vh] [transform:perspective(600px)_rotateX(75deg)] [transform-origin:bottom_center] opacity-40">
          <div className="absolute inset-0"
               style={{
                 backgroundImage: "linear-gradient(transparent 0%, rgba(0, 255, 255, 0.3) 1%, transparent 2%), linear-gradient(90deg, transparent 0%, rgba(255, 0, 128, 0.3) 1%, transparent 2%)",
                 backgroundSize: "60px 60px"
               }}
          />
        </div>
        {/* Horizon Fade */}
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-transparent via-[#030014]/80 to-[#030014]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8 sm:py-12">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-10 sm:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-2"
          >
            Where Inspiration Meets Intelligence
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-zinc-400"
          >
            <Image src="/logo.png" alt="SongArc Logo" width={56} height={56} className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
            SongArc
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto"
          >
            Generate professional song lyrics with structural prompts.
          </motion.p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8 space-y-4">
            <GeneratorForm state={state} actions={actions} />
            
            <AnimatePresence>
              {(error || albumError) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-200 text-sm"
                >
                  <XCircle className="w-5 h-5 shrink-0 text-red-400" />
                  <p>{error || albumError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* ── Empty State ── */}
            <AnimatePresence>
              {!loading && !result && !albumLoading && albumSongs.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white/[0.01] border border-white/5 rounded-3xl"
                >
                  <div className="w-20 h-20 mb-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
                    <Music className="w-10 h-10 text-indigo-400/50" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-200 mb-2">Your musical journey begins here</h3>
                  <p className="text-zinc-500 text-sm max-w-sm">
                    Fill out the form on the left to draft your first masterpiece. You can generate a single track or a full 15-track album arc.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Single Result ── */}
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {[80, 240, 100].map((h, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse shadow-lg" style={{ height: h }} />
                  ))}
                </motion.div>
              )}
              
              {!loading && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {albumMode && (
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono">TRACK {songPosition}/15</span>
                      <span className="text-zinc-400 text-sm">{ARC_LABELS[posNum]}</span>
                    </div>
                  )}
                  <SectionCard title="Song Title" content={result.judul} />
                  <SectionCard title="Lyrics" content={result.lirik} mono />
                  
                  <div className="bg-black/20 rounded-2xl p-5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
                      <h3 className="text-sm font-semibold text-indigo-200 uppercase tracking-widest">Suno Prompt</h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono px-2 py-1 rounded-md ${result.sunoPrompt.length > 190 ? "bg-red-500/20 text-red-300" : "bg-white/5 text-zinc-400"}`}>
                          {result.sunoPrompt.length}/190
                        </span>
                        <CopyButton text={result.sunoPrompt} />
                      </div>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-indigo-100/80 font-mono leading-relaxed pt-2">
                      {result.sunoPrompt}
                    </pre>
                  </div>
                  
                  {result.catatan && <SectionCard title="Notes" content={result.catatan} />}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Batch Album Results ── */}
            <AnimatePresence>
              {(albumLoading || albumSongs.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {albumTitle || "Album Generation"}
                      </h2>
                      {albumLoading ? (
                        <p className="text-sm text-indigo-300 mt-1 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          Generating track {albumProgress}/15 — {ARC_LABELS[albumProgress]?.split(" — ")[1]}
                        </p>
                      ) : (
                        <p className="text-sm text-emerald-400 mt-1 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {albumSongs.length} tracks completed
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {albumLoading && (
                        <button
                          onClick={actions.handleCancelAlbum}
                          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors border border-red-500/20"
                        >
                          Cancel
                        </button>
                      )}
                      {!albumLoading && albumSongs.length > 0 && (
                        <button
                          onClick={() => exportAlbum(albumSongs, albumTitle)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
                        >
                          <Download className="w-4 h-4" />
                          Export TXT
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {albumLoading && (
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(albumSongs.length / 15) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  )}

                  {/* List of Tracks */}
                  <div className="space-y-3 pt-2">
                    {Array.from({ length: 15 }, (_, i) => i + 1).map(pos => {
                      const song = albumSongs.find(s => s.position === pos);
                      if (song) return <AlbumSongCard key={pos} song={song} isReloading={reloadingTracks.has(pos)} onRegenerate={actions.handleRegenerateTrack} />;
                      if (albumLoading && pos >= albumProgress && !completedPositions.has(pos)) {
                        return <SkeletonSongCard key={pos} position={pos} />;
                      }
                      return null;
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Footer Stats ── */}
        <StatsCounter />
      </div>
    </div>
  );
}
