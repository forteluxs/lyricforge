import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { SongResult } from "../../types/lyric";
import { ARC_LABELS } from "../../constants/lyric";
import { CopyButton } from "../ui/copy-button";
import { SectionCard } from "../ui/section-card";

export function AlbumSongCard({ song }: { song: SongResult }) {
  const [open, setOpen] = useState(false);
  const isAbyss = song.position === 8;

  const exportText = `## Track ${song.position} — ${ARC_LABELS[song.position]}\n\n### ${song.judul}\n\n${song.lirik}\n\n**Suno Prompt:**\n${song.sunoPrompt}`;

  return (
    <div className={`bg-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden border shadow-lg transition-colors ${isAbyss ? "border-indigo-500/50 shadow-indigo-500/10" : "border-white/10"}`}>
      {/* Header row */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={e => e.key === "Enter" && setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors cursor-pointer touch-manipulation min-h-[64px]"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1 mr-2">
          <span className="text-sm font-mono text-indigo-400 shrink-0 tabular-nums bg-indigo-500/10 px-2 py-1 rounded-md">
            {String(song.position).padStart(2, "0")}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-semibold text-zinc-100 truncate leading-tight">
              {song.judul || <span className="text-zinc-500 italic font-normal">Generating…</span>}
            </span>
            <span className="text-xs text-zinc-400 truncate leading-tight mt-1">
              {ARC_LABELS[song.position]?.split(" — ")[1]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
          {song.judul && <CopyButton text={exportText} />}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-zinc-500" />
          </motion.div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {open && song.judul && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">
              <SectionCard title="Lirik" content={song.lirik} mono />
              <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    Suno Prompt
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono ${song.sunoPrompt.length > 190 ? "text-red-400" : "text-zinc-500"}`}>
                      {song.sunoPrompt.length}/190
                    </span>
                    <CopyButton text={song.sunoPrompt} />
                  </div>
                </div>
                <p className="text-sm font-mono text-indigo-100/70 leading-relaxed">{song.sunoPrompt}</p>
              </div>
              {song.catatan && (
                <p className="text-sm text-zinc-400 italic leading-relaxed px-2 border-l-2 border-indigo-500/30">{song.catatan}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
