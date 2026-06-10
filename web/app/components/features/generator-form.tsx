import { BAHASA, ARC_LABELS } from "../../constants/lyric";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Disc } from "lucide-react";

interface GeneratorFormProps {
  state: any;
  actions: any;
}

export function GeneratorForm({ state, actions }: GeneratorFormProps) {
  const {
    genre, bahasa, customBahasa, narasi, albumMode, albumTitle, albumConcept, songPosition,
    loading, albumLoading, albumProgress
  } = state;
  const {
    setGenre, setBahasa, setCustom, setNarasi, setAlbumMode, setAlbumTitle, setAlbumConcept, setSongPos,
    handleGenerate, handleGenerateAlbum
  } = actions;

  const posNum = parseInt(songPosition);

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <div className="space-y-6">
        {/* Genre */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-300 ml-1">Music Genre</label>
          <input
            type="text"
            placeholder="e.g. Indie Folk, Synthwave, Modern Country..."
            value={genre}
            onChange={e => setGenre(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Bahasa */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-300 ml-1">Lyric Language</label>
          <div className="relative">
            <select
              value={bahasa}
              onChange={e => setBahasa(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
            >
              <option value="">-- Select language --</option>
              {BAHASA.map(b => <option key={b} value={b}>{b}</option>)}
              <option value="__custom__">Other (type your own)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          {bahasa === "__custom__" && (
            <motion.input
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              type="text"
              placeholder="Type language..."
              value={customBahasa}
              onChange={e => setCustom(e.target.value)}
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        {/* Narasi */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-zinc-300 ml-1">Narrative / Story Theme</label>
          <textarea
            rows={4}
            value={narasi}
            onChange={e => setNarasi(e.target.value)}
            placeholder="What is this song about..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-zinc-100 resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Album Mode Toggle */}
        <div className="border-t border-white/10 pt-6">
          <button
            onClick={() => setAlbumMode(!albumMode)}
            className="group flex items-center gap-3 text-sm text-zinc-400 hover:text-zinc-200 transition-colors touch-manipulation w-full"
          >
            <div className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 shrink-0 border ${albumMode ? "bg-indigo-600 border-indigo-500" : "bg-black/40 border-white/10"}`}>
              <motion.div 
                layout
                className="w-4 h-4 rounded-full bg-white shadow-sm"
                animate={{ x: albumMode ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
            <span className="font-medium">Album Mode</span>
            <span className="text-zinc-500 text-xs">(15-track story arc)</span>
          </button>

          <AnimatePresence>
            {albumMode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-indigo-300">Album Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Echoes of the Past"
                      value={albumTitle}
                      onChange={e => setAlbumTitle(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-indigo-300">Album Concept (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. An emotional journey from loss to acceptance"
                      value={albumConcept}
                      onChange={e => setAlbumConcept(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-indigo-300">Track Position (For single generation)</label>
                    <select
                      value={songPosition}
                      onChange={e => setSongPos(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
                    >
                      {Object.entries(ARC_LABELS).map(([n, l]) => <option key={n} value={n}>{l}</option>)}
                    </select>
                    <p className="text-xs text-zinc-500 mt-1.5 ml-1">
                      {posNum <= 4 && "Act I — Departure"}
                      {posNum >= 5 && posNum <= 9 && "Act II — Confrontation"}
                      {posNum >= 10 && "Act III — Return"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className={`pt-4 grid gap-3 ${albumMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="relative flex items-center justify-center gap-2 w-full bg-white text-black hover:bg-zinc-200 active:scale-[0.98] disabled:bg-white/10 disabled:text-white/30 disabled:active:scale-100 font-semibold py-4 rounded-xl transition-all text-sm touch-manipulation group overflow-hidden"
          >
            <Wand2 className="w-4 h-4 group-disabled:opacity-50" />
            {loading ? "Drafting Lyrics..." : albumMode ? "Generate 1 Track" : "Generate Lyrics"}
          </button>

          {albumMode && (
            <button
              onClick={handleGenerateAlbum}
              disabled={albumLoading}
              className="relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 disabled:active:scale-100 text-white font-semibold py-4 rounded-xl transition-all text-sm touch-manipulation shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:shadow-none"
            >
              <Disc className="w-4 h-4" />
              {albumLoading ? `Generating ${albumProgress}/15…` : "Generate Full Album"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
