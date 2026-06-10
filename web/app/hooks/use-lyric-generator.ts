import { useState, useRef } from "react";
import { SongResult, SingleResult } from "../types/lyric";

export function useLyricGenerator() {
  const [genre, setGenre] = useState("");
  const [bahasa, setBahasa] = useState("");
  const [customBahasa, setCustom] = useState("");
  const [narasi, setNarasi] = useState("");
  const [albumMode, setAlbumMode] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumConcept, setAlbumConcept] = useState("");
  const [songPosition, setSongPos] = useState("1");

  // Single song state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SingleResult | null>(null);

  // Batch album state
  const [albumLoading, setAlbumLoading] = useState(false);
  const [albumProgress, setAlbumProgress] = useState(0);
  const [albumSongs, setAlbumSongs] = useState<SongResult[]>([]);
  const [albumError, setAlbumError] = useState("");
  const [reloadingTracks, setReloadingTracks] = useState<Set<number>>(new Set());
  const albumAbort = useRef<AbortController | null>(null);

  const lang = bahasa === "__custom__" ? customBahasa : bahasa;
  const posNum = parseInt(songPosition);

  const handleGenerate = async () => {
    if (!genre.trim() || !lang || !narasi.trim()) {
      setError("Isi semua field: genre, bahasa, dan narasi.");
      return;
    }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/generate", {
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
    finally { setLoading(false); }
  };

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

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
                position: evt.position,
                judul: evt.judul,
                lirik: evt.lirik,
                sunoPrompt: evt.sunoPrompt,
                catatan: evt.catatan,
              }]);
            } else if (evt.type === "error") {
              setAlbumError(evt.message);
              setAlbumLoading(false);
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

  const handleRegenerateTrack = async (position: number) => {
    if (!genre.trim() || !lang || !narasi.trim()) return;
    setReloadingTracks(prev => new Set(prev).add(position));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: genre.trim(), bahasa: lang, narasi: narasi.trim(),
          albumMode: true, albumTitle: albumTitle.trim(),
          albumConcept: albumConcept.trim(),
          songPosition: position.toString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlbumSongs(prev => {
          const copy = [...prev];
          const idx = copy.findIndex(s => s.position === position);
          if (idx !== -1) {
            copy[idx] = { position, ...data };
          } else {
            copy.push({ position, ...data });
          }
          return copy;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReloadingTracks(prev => {
        const copy = new Set(prev);
        copy.delete(position);
        return copy;
      });
    }
  };

  const completedPositions = new Set(albumSongs.map(s => s.position));

  return {
    state: {
      genre, bahasa, customBahasa, narasi, albumMode, albumTitle, albumConcept, songPosition,
      loading, error, result,
      albumLoading, albumProgress, albumSongs, albumError, reloadingTracks,
      lang, posNum, completedPositions
    },
    actions: {
      setGenre, setBahasa, setCustom, setNarasi, setAlbumMode, setAlbumTitle, setAlbumConcept, setSongPos,
      handleGenerate, handleGenerateAlbum, handleCancelAlbum, handleRegenerateTrack
    }
  };
}
