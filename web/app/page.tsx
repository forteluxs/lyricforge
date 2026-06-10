"use client";

import { useState, useRef } from "react";

const BAHASA = [
  "Bahasa Indonesia", "English", "Bahasa Melayu",
  "Japanese (日本語)", "Korean (한국어)", "Dutch (Nederlands)",
  "French (Français)", "German (Deutsch)", "Spanish (Español)",
  "Portuguese (Português)", "Italian (Italiano)",
];

const ARC_LABELS: Record<number, string> = {
  1: "1 — Pembuka / Overture",   2: "2 — First Glimpse",
  3: "3 — Rising Tension",       4: "4 — Intimacy Break",
  5: "5 — Mid-Rise",             6: "6 — The Crack",
  7: "7 — Breaking Point",       8: "8 — The Abyss ★",
  9: "9 — First Light",         10: "10 — Looking Back",
  11: "11 — Acceptance Begins", 12: "12 — Catharsis",
  13: "13 — New Identity",      14: "14 — Penultimate",
  15: "15 — Outro / Epilogue",
};

interface SongResult {
  position: number;
  judul: string;
  lirik: string;
  sunoPrompt: string;
  catatan: string;
}

interface SingleResult {
  judul: string; lirik: string; sunoPrompt: string; catatan: string; raw: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="min-h-[36px] min-w-[56px] px-3 py-1.5 rounded-lg bg-zinc-700 active:bg-zinc-500 hover:bg-zinc-600 text-zinc-300 text-xs font-medium transition-colors touch-manipulation"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function SectionCard({ title, content, mono = false }: { title: string; content: string; mono?: boolean }) {
  if (!content) return null;
  return (
    <div className="bg-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{title}</h3>
        <CopyButton text={content} />
      </div>
      <pre className={`whitespace-pre-wrap text-sm text-zinc-100 leading-relaxed ${mono ? "font-mono" : "font-sans"}`}>
        {content}
      </pre>
    </div>
  );
}

// ── Album song card (collapsible) ──────────────────────────────
function AlbumSongCard({ song }: { song: SongResult }) {
  const [open, setOpen] = useState(false);
  const isAbyss = song.position === 8;

  const exportText = `## Track ${song.position} — ${ARC_LABELS[song.position]}\n\n### ${song.judul}\n\n${song.lirik}\n\n**Suno Prompt:**\n${song.sunoPrompt}`;

  return (
    <div className={`bg-zinc-800 rounded-xl overflow-hidden border ${isAbyss ? "border-indigo-500/40" : "border-zinc-700"}`}>
      {/* Header row */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={e => e.key === "Enter" && setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-zinc-700/50 active:bg-zinc-700 transition-colors cursor-pointer touch-manipulation min-h-[52px]"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <span className="text-xs font-mono text-zinc-500 shrink-0 tabular-nums">
            {String(song.position).padStart(2, "0")}
          </span>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-zinc-100 truncate leading-tight">
              {song.judul || <span className="text-zinc-500 italic font-normal">Generating…</span>}
            </span>
            <span className="text-xs text-zinc-500 truncate leading-tight mt-0.5">
              {ARC_LABELS[song.position]?.split(" — ")[1]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {song.judul && <CopyButton text={exportText} />}
          <span className="text-zinc-500 text-xs select-none w-4 text-center">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded content */}
      {open && song.judul && (
        <div className="px-4 pb-4 space-y-3 border-t border-zinc-700 pt-3">
          <SectionCard title="Lirik" content={song.lirik} mono />
          <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Suno Prompt</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono ${song.sunoPrompt.length > 190 ? "text-red-400" : "text-zinc-500"}`}>
                  {song.sunoPrompt.length}/190
                </span>
                <CopyButton text={song.sunoPrompt} />
              </div>
            </div>
            <p className="text-xs font-mono text-zinc-300 leading-relaxed">{song.sunoPrompt}</p>
          </div>
          {song.catatan && (
            <p className="text-xs text-zinc-500 italic leading-relaxed">{song.catatan}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Skeleton row while generating ─────────────────────────────
function SkeletonSongCard({ position }: { position: number }) {
  return (
    <div className="bg-zinc-800 rounded-xl px-4 py-3.5 flex items-center gap-3 border border-zinc-700 animate-pulse min-h-[52px]">
      <span className="text-xs font-mono text-zinc-500 shrink-0 tabular-nums">{String(position).padStart(2, "0")}</span>
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-3 bg-zinc-700 rounded w-40" />
        <div className="h-2.5 bg-zinc-700/60 rounded w-24" />
      </div>
    </div>
  );
}

// ── Export full album as text ──────────────────────────────────
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
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${albumTitle || "album"}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════════
export default function Home() {
  const [genre, setGenre]           = useState("");
  const [bahasa, setBahasa]         = useState("");
  const [customBahasa, setCustom]   = useState("");
  const [narasi, setNarasi]         = useState("");
  const [albumMode, setAlbumMode]   = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumConcept, setAlbumConcept] = useState("");
  const [songPosition, setSongPos]  = useState("1");

  // Single song state
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [result, setResult]         = useState<SingleResult | null>(null);

  // Batch album state
  const [albumLoading, setAlbumLoading]   = useState(false);
  const [albumProgress, setAlbumProgress] = useState(0);
  const [albumSongs, setAlbumSongs]       = useState<SongResult[]>([]);
  const [albumError, setAlbumError]       = useState("");
  const albumAbort = useRef<AbortController | null>(null);

  const lang   = bahasa === "__custom__" ? customBahasa : bahasa;
  const posNum = parseInt(songPosition);

  // ── Single generate ──────────────────────────────────────────
  const handleGenerate = async () => {
    if (!genre.trim() || !lang || !narasi.trim()) {
      setError("Isi semua field: genre, bahasa, dan narasi.");
      return;
    }
    setError(""); setLoading(true); setResult(null);
    try {
      const res  = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: genre.trim(), bahasa: lang, narasi: narasi.trim(),
          albumMode, albumTitle: albumTitle.trim(),
          albumConcept: albumConcept.trim(),
          songPosition: albumMode ? songPosition : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal generate. Coba lagi."); return; }
      setResult(data);
    } catch { setError("Network error. Coba lagi."); }
    finally   { setLoading(false); }
  };

  // ── Batch album generate (SSE) ───────────────────────────────
  const handleGenerateAlbum = async () => {
    if (!genre.trim() || !lang || !narasi.trim()) {
      setAlbumError("Isi semua field: genre, bahasa, dan narasi.");
      return;
    }
    if (!albumTitle.trim()) {
      setAlbumError("Judul album wajib diisi untuk batch generate.");
      return;
    }

    setAlbumError(""); setAlbumLoading(true); setAlbumProgress(0); setAlbumSongs([]);
    albumAbort.current = new AbortController();

    try {
      const res = await fetch("/api/generate-album", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: albumAbort.current.signal,
        body: JSON.stringify({
          genre: genre.trim(), bahasa: lang, narasi: narasi.trim(),
          albumTitle: albumTitle.trim(), albumConcept: albumConcept.trim(),
        }),
      });

      if (!res.ok || !res.body) {
        setAlbumError("Gagal memulai batch generate.");
        setAlbumLoading(false);
        return;
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));

            if (evt.type === "progress") {
              setAlbumProgress(evt.position);
            } else if (evt.type === "song") {
              setAlbumSongs(prev => [...prev, {
                position:   evt.position,
                judul:      evt.judul,
                lirik:      evt.lirik,
                sunoPrompt: evt.sunoPrompt,
                catatan:    evt.catatan,
              }]);
            } else if (evt.type === "error") {
              setAlbumError(evt.message);
            } else if (evt.type === "done") {
              setAlbumLoading(false);
            }
          } catch { /* malformed line, skip */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setAlbumError("Koneksi terputus. Coba lagi.");
      }
    } finally {
      setAlbumLoading(false);
    }
  };

  const handleCancelAlbum = () => {
    albumAbort.current?.abort();
    setAlbumLoading(false);
  };

  const completedPositions = new Set(albumSongs.map(s => s.position));

  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10 space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="text-center space-y-1 pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">LyricForge</h1>
          <p className="text-zinc-400 text-sm">Generate song lyrics + Suno AI prompt</p>
        </div>

        {/* ── Form ── */}
        <div className="bg-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">

          {/* Genre */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Genre</label>
            <input
              type="text"
              inputMode="text"
              placeholder="Contoh: Indie Folk, Afrobeats, Dangdut Modern, Bossa Nova..."
              value={genre}
              onChange={e => setGenre(e.target.value)}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Bahasa */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Bahasa</label>
            <select
              value={bahasa}
              onChange={e => setBahasa(e.target.value)}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option value="">-- Pilih bahasa --</option>
              {BAHASA.map(b => <option key={b} value={b}>{b}</option>)}
              <option value="__custom__">Lainnya (ketik sendiri)</option>
            </select>
            {bahasa === "__custom__" && (
              <input
                type="text"
                placeholder="Ketik bahasa..."
                value={customBahasa}
                onChange={e => setCustom(e.target.value)}
                className="w-full mt-1.5 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Narasi */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Narasi / Tema</label>
            <textarea
              rows={4}
              value={narasi}
              onChange={e => setNarasi(e.target.value)}
              placeholder="Contoh: Lagu tentang kerinduan pada kampung halaman saat merantau ke kota besar..."
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-3 text-sm text-zinc-100 resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Album Mode */}
          <div className="border-t border-zinc-700 pt-4">
            <button
              onClick={() => setAlbumMode(!albumMode)}
              className="flex items-center gap-3 text-sm text-zinc-400 hover:text-zinc-200 transition-colors touch-manipulation min-h-[36px]"
            >
              <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${albumMode ? "bg-indigo-600" : "bg-zinc-600"}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${albumMode ? "translate-x-4" : "translate-x-0"}`} />
              </div>
              <span>Album Mode</span>
              <span className="text-zinc-600 text-xs">(arc 15 lagu)</span>
            </button>

            {albumMode && (
              <div className="mt-4 space-y-3 pl-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Judul Album</label>
                  <input
                    type="text"
                    placeholder="e.g. Antara Tawa dan Air Mata"
                    value={albumTitle}
                    onChange={e => setAlbumTitle(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Konsep Album</label>
                  <input
                    type="text"
                    placeholder="e.g. Perjalanan emosional dari kehilangan hingga penerimaan"
                    value={albumConcept}
                    onChange={e => setAlbumConcept(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Posisi Lagu (untuk single generate)</label>
                  <select
                    value={songPosition}
                    onChange={e => setSongPos(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  >
                    {Object.entries(ARC_LABELS).map(([n, l]) => <option key={n} value={n}>{l}</option>)}
                  </select>
                  <p className="text-xs text-zinc-600">
                    {posNum <= 4 && "Act I — Departure"}
                    {posNum >= 5 && posNum <= 9 && "Act II — Confrontation"}
                    {posNum >= 10 && "Act III — Return"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2.5">{error}</p>
          )}

          {/* Buttons */}
          <div className={`grid gap-2.5 ${albumMode ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm touch-manipulation"
            >
              {loading ? "Generating..." : albumMode ? "Generate 1 Lagu" : "Generate Lagu"}
            </button>

            {albumMode && (
              <button
                onClick={handleGenerateAlbum}
                disabled={albumLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm touch-manipulation"
              >
                {albumLoading ? `Generating ${albumProgress}/15…` : "Generate Full Album"}
              </button>
            )}
          </div>
        </div>

        {/* ── Single song result ── */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[80, 200, 60, 60].map((h, i) => (
              <div key={i} className="bg-zinc-800 rounded-xl" style={{ height: h }} />
            ))}
          </div>
        )}
        {result && !loading && (
          <div className="space-y-4">
            {albumMode && (
              <div className="text-xs text-zinc-500 text-center">
                Lagu {songPosition}/15 — {ARC_LABELS[posNum]}
                {albumTitle && ` · "${albumTitle}"`}
              </div>
            )}
            <SectionCard title="Judul Lagu" content={result.judul} />
            <SectionCard title="Lirik" content={result.lirik} mono />
            <div className="bg-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Suno Prompt</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${result.sunoPrompt.length > 190 ? "text-red-400" : "text-zinc-500"}`}>
                    {result.sunoPrompt.length}/190
                  </span>
                  <CopyButton text={result.sunoPrompt} />
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-zinc-100 font-mono leading-relaxed">
                {result.sunoPrompt}
              </pre>
            </div>
            {result.catatan && <SectionCard title="Catatan" content={result.catatan} />}
          </div>
        )}

        {/* ── Batch album results ── */}
        {(albumLoading || albumSongs.length > 0) && (
          <div className="space-y-4">

            {/* Album header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-zinc-100 truncate">
                  {albumTitle || "Album"}
                </h2>
                {albumLoading
                  ? <p className="text-xs text-zinc-500 mt-0.5">
                      Generating track {albumProgress}/15 — {ARC_LABELS[albumProgress]?.split(" — ")[1]}…
                    </p>
                  : <p className="text-xs text-zinc-500 mt-0.5">{albumSongs.length} lagu selesai</p>
                }
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {albumLoading && (
                  <button
                    onClick={handleCancelAlbum}
                    className="text-xs px-3 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 text-zinc-300 transition-colors touch-manipulation min-h-[36px]"
                  >
                    Batal
                  </button>
                )}
                {!albumLoading && albumSongs.length > 0 && (
                  <button
                    onClick={() => exportAlbum(albumSongs, albumTitle)}
                    className="text-xs px-3 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800 text-white transition-colors font-medium touch-manipulation min-h-[36px]"
                  >
                    Export .txt
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {albumLoading && (
              <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(albumSongs.length / 15) * 100}%` }}
                />
              </div>
            )}

            {albumError && (
              <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2.5">{albumError}</p>
            )}

            {/* Song list */}
            <div className="space-y-2">
              {Array.from({ length: 15 }, (_, i) => i + 1).map(pos => {
                const song = albumSongs.find(s => s.position === pos);
                if (song) return <AlbumSongCard key={pos} song={song} />;
                if (albumLoading && pos >= albumProgress && !completedPositions.has(pos)) {
                  return <SkeletonSongCard key={pos} position={pos} />;
                }
                return null;
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
