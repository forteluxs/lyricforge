"use client";

import { useState } from "react";

const BAHASA = [
  "Bahasa Indonesia",
  "English",
  "Bahasa Melayu",
  "Japanese (日本語)",
  "Korean (한국어)",
  "Dutch (Nederlands)",
  "French (Français)",
  "German (Deutsch)",
  "Spanish (Español)",
  "Portuguese (Português)",
  "Italian (Italiano)",
];

const ARC_LABELS: Record<number, string> = {
  1: "1 — Pembuka / Overture",
  2: "2 — First Glimpse",
  3: "3 — Rising Tension",
  4: "4 — Intimacy Break",
  5: "5 — Mid-Rise",
  6: "6 — The Crack",
  7: "7 — Breaking Point",
  8: "8 — The Abyss ★",
  9: "9 — First Light",
  10: "10 — Looking Back",
  11: "11 — Acceptance Begins",
  12: "12 — Catharsis",
  13: "13 — New Identity",
  14: "14 — Penultimate",
  15: "15 — Outro / Epilogue",
};

interface Result {
  judul: string;
  lirik: string;
  sunoPrompt: string;
  catatan: string;
  raw: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function SectionCard({ title, content, mono = false }: { title: string; content: string; mono?: boolean }) {
  if (!content) return null;
  return (
    <div className="bg-zinc-800 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{title}</h3>
        <CopyButton text={content} />
      </div>
      <pre className={`whitespace-pre-wrap text-sm text-zinc-100 leading-relaxed ${mono ? "font-mono" : "font-sans"}`}>
        {content}
      </pre>
    </div>
  );
}

export default function Home() {
  const [genre, setGenre] = useState("");
  const [bahasa, setBahasa] = useState("");
  const [customBahasa, setCustomBahasa] = useState("");
  const [narasi, setNarasi] = useState("");
  const [albumMode, setAlbumMode] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumConcept, setAlbumConcept] = useState("");
  const [songPosition, setSongPosition] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const effectiveBahasa = bahasa === "__custom__" ? customBahasa : bahasa;

  const handleGenerate = async () => {
    if (!genre.trim() || !effectiveBahasa || !narasi.trim()) {
      setError("Isi semua field: genre, bahasa, dan narasi.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: genre.trim(),
          bahasa: effectiveBahasa,
          narasi: narasi.trim(),
          albumMode,
          albumTitle: albumTitle.trim(),
          albumConcept: albumConcept.trim(),
          songPosition: albumMode ? songPosition : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal generate. Coba lagi.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const posNum = parseInt(songPosition);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">LyricForge</h1>
          <p className="text-zinc-400 text-sm">Generate song lyrics + Suno AI prompt</p>
        </div>

        <div className="bg-zinc-800 rounded-2xl p-6 space-y-5">
          {/* Genre */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Genre</label>
            <input
              type="text"
              placeholder="Contoh: Indie Folk, Afrobeats, Dangdut Modern, Bossa Nova, Conscious Rap..."
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Bahasa */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Bahasa</label>
            <select
              value={bahasa}
              onChange={(e) => setBahasa(e.target.value)}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Pilih bahasa --</option>
              {BAHASA.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
              <option value="__custom__">Lainnya (ketik sendiri)</option>
            </select>
            {bahasa === "__custom__" && (
              <input
                type="text"
                placeholder="Ketik bahasa..."
                value={customBahasa}
                onChange={(e) => setCustomBahasa(e.target.value)}
                className="w-full mt-1.5 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Narasi */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300">Narasi / Tema</label>
            <textarea
              rows={4}
              placeholder="Contoh: Lagu tentang kerinduan pada kampung halaman saat merantau ke kota besar, nuansa sore hari dan aroma tanah basah..."
              value={narasi}
              onChange={(e) => setNarasi(e.target.value)}
              className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Album Mode Toggle */}
          <div className="border-t border-zinc-700 pt-4">
            <button
              onClick={() => setAlbumMode(!albumMode)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <div className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${albumMode ? "bg-indigo-600" : "bg-zinc-600"}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${albumMode ? "translate-x-4" : "translate-x-0"}`} />
              </div>
              Album Mode
              <span className="text-zinc-600 text-xs">(arc 15 lagu)</span>
            </button>

            {albumMode && (
              <div className="mt-4 space-y-3 pl-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Judul Album</label>
                  <input
                    type="text"
                    placeholder="Contoh: Antara Tawa dan Air Mata"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Konsep Album</label>
                  <input
                    type="text"
                    placeholder="Contoh: Perjalanan emosional seorang perantau dari rasa kehilangan hingga penerimaan"
                    value={albumConcept}
                    onChange={(e) => setAlbumConcept(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">
                    Posisi Lagu dalam Album
                  </label>
                  <select
                    value={songPosition}
                    onChange={(e) => setSongPosition(e.target.value)}
                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(ARC_LABELS).map(([num, label]) => (
                      <option key={num} value={num}>{label}</option>
                    ))}
                  </select>
                  {posNum && (
                    <p className="text-xs text-zinc-500 pt-0.5">
                      {posNum <= 4 && "Act I — Departure"}
                      {posNum >= 5 && posNum <= 9 && "Act II — Confrontation"}
                      {posNum >= 10 && "Act III — Return"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? "Generating..." : "Generate Lagu"}
          </button>
        </div>

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
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Suno Prompt</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${result.sunoPrompt.length > 190 ? "text-red-400" : "text-zinc-500"}`}>
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
      </div>
    </div>
  );
}
