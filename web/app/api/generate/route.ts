import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const REFS_DIR = path.join(process.cwd(), "..", "references");

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

// Maps genre vocab files to keyword lists for matching
const GENRE_VOCAB_KEYWORDS: Record<string, string[]> = {
  "indo_folk_pop.md": ["indie folk", "folk indonesia", "indo folk", "pop ballad", "pop indonesia", "pop ballad indonesia", "singer songwriter indonesia", "indie indonesia"],
  "hiphop_rnb_soul.md": ["hip hop", "hip-hop", "hiphop", "rap", "rnb", "r&b", "neo soul", "soul", "conscious rap", "trap", "boom bap", "lo-fi hip hop", "dangdut", "dangdut modern", "dangdut pop", "koplo"],
  "rock_alternative.md": ["rock", "indie rock", "alternative", "grunge", "post punk", "post-punk", "britpop", "shoegaze", "math rock", "art rock", "folk rock", "garage rock", "metal", "punk"],
  "world_music.md": ["afrobeats", "afro", "bossa nova", "bossanova", "reggae", "dancehall", "latin", "salsa", "cumbia", "reggaeton", "celtic", "irish folk", "samba", "fado", "flamenco"],
  "electronic_pop.md": ["electronic", "synthpop", "synth pop", "indie pop", "dream pop", "art pop", "electropop", "chillwave", "bedroom pop", "lo-fi", "ambient pop", "hyperpop", "dance pop", "edm"],
  "jpop_kpop_asian.md": ["j-pop", "jpop", "j pop", "k-pop", "kpop", "k pop", "c-pop", "cpop", "opm", "original pilipino music", "mandopop", "city pop", "anime", "visual kei", "idol"],
  "jazz_blues_country.md": ["jazz", "blues", "country", "americana", "gospel", "soul jazz", "swing", "bebop", "smooth jazz", "delta blues", "chicago blues", "bluegrass", "outlaw country", "folk country"],
};

function matchGenreVocab(genre: string): string[] {
  const g = genre.toLowerCase();
  const matched: string[] = [];
  for (const [file, keywords] of Object.entries(GENRE_VOCAB_KEYWORDS)) {
    if (keywords.some((kw) => g.includes(kw))) {
      matched.push(file);
    }
  }
  // Fallback: if nothing matched, load indo_folk_pop + electronic_pop as general
  if (matched.length === 0) {
    matched.push("indo_folk_pop.md", "electronic_pop.md");
  }
  return matched;
}

function loadReferences(genre: string): string {
  let context = "";

  const sunoGuide = readFile(path.join(REFS_DIR, "suno_prompt_guide.md"));
  if (sunoGuide) context += "\n\n# SUNO AI PROMPT GUIDE\n" + sunoGuide;

  const albumArc = readFile(path.join(REFS_DIR, "album_arc.md"));
  if (albumArc) context += "\n\n# ALBUM ARC SYSTEM\n" + albumArc;

  // Load genre-specific vocab (smart match)
  const genreVocabDir = path.join(REFS_DIR, "genre_vocab");
  const matchedFiles = matchGenreVocab(genre);
  for (const file of matchedFiles) {
    const content = readFile(path.join(genreVocabDir, file));
    if (content) context += `\n\n# GENRE VOCABULARY\n` + content;
  }

  // Load novel vocab — smart select based on genre/language signals
  const novelVocabDir = path.join(REFS_DIR, "novel_vocab");
  const g = genre.toLowerCase();
  const novelPriority: { file: string; keywords: string[] }[] = [
    { file: "viral_indo_wattpad.md",      keywords: ["indo", "indonesia", "melayu", "dangdut", "folk indonesia", "pop indonesia", "wattpad"] },
    { file: "viral_romance_literary.md",  keywords: ["romance", "pop ballad", "indie pop", "r&b", "neo soul", "bedroom pop", "dream pop", "art pop", "romantasy", "fantasy", "k-pop", "opm"] },
    { file: "viral_manhwa_webtoon.md",    keywords: ["k-pop", "kpop", "j-pop", "jpop", "anime", "manhwa", "fantasy", "epic", "rap", "hip hop", "conscious"] },
    { file: "indonesian_classics.md",     keywords: ["indo", "indonesia", "melayu", "folk", "pop indonesia", "dangdut"] },
    { file: "persian_arabic_classics.md", keywords: ["folk", "indie folk", "singer songwriter", "ballad", "sad", "melancholic", "kerinduan"] },
    { file: "western_classics.md",        keywords: ["rock", "folk rock", "indie rock", "alternative", "country", "americana", "pop", "ballad"] },
  ];
  let novelLoaded = 0;
  for (const { file, keywords } of novelPriority) {
    if (novelLoaded >= 3) break; // max 3 novel vocab files per request
    if (keywords.some((kw) => g.includes(kw))) {
      const content = readFile(path.join(novelVocabDir, file));
      if (content) {
        context += `\n\n# NOVEL VOCABULARY (${file.replace(".md", "").toUpperCase()})\n` + content;
        novelLoaded++;
      }
    }
  }
  // Always include indo wattpad as baseline if nothing matched (most users are Indonesian)
  if (novelLoaded === 0) {
    const content = readFile(path.join(novelVocabDir, "viral_indo_wattpad.md"));
    if (content) context += `\n\n# NOVEL VOCABULARY\n` + content;
    const content2 = readFile(path.join(novelVocabDir, "viral_romance_literary.md"));
    if (content2) context += `\n\n# NOVEL VOCABULARY\n` + content2;
  }

  // Load classic lyrics — only country-relevant files based on genre
  const classicDir = path.join(REFS_DIR, "classic_lyrics");
  const classicPriority = [
    { file: "indonesia.md", keywords: ["indo", "indonesia", "dangdut", "melayu"] },
    { file: "usa.md", keywords: ["folk rock", "hip hop", "rap", "country", "americana", "blues", "soul", "r&b"] },
    { file: "uk.md", keywords: ["brit", "rock", "post punk", "indie", "alternative", "shoegaze"] },
    { file: "australia.md", keywords: ["australia", "rock", "indie"] },
    { file: "germany.md", keywords: ["german", "schlager", "deutsch"] },
    { file: "netherlands.md", keywords: ["dutch", "nederpop", "nederland"] },
    { file: "ireland.md", keywords: ["celtic", "irish", "folk"] },
    { file: "new_zealand.md", keywords: ["indie", "art pop", "dream pop"] },
    { file: "italy.md", keywords: ["italian", "cantautore", "chanson"] },
    { file: "canada.md", keywords: ["folk", "singer songwriter", "country"] },
  ];
  let classicLoaded = 0;
  for (const { file, keywords } of classicPriority) {
    if (classicLoaded >= 3) break; // max 3 classic reference files per request
    if (keywords.some((kw) => g.includes(kw))) {
      const content = readFile(path.join(classicDir, file));
      if (content) {
        context += `\n\n# CLASSIC LYRICS (${file.replace(".md", "").toUpperCase()})\n` + content;
        classicLoaded++;
      }
    }
  }
  // Always include indonesia if not already loaded
  if (!g.includes("indo") && classicLoaded < 3) {
    const content = readFile(path.join(classicDir, "indonesia.md"));
    if (content) context += `\n\n# CLASSIC LYRICS (INDONESIA)\n` + content;
  }

  return context;
}

const ARC_ROLES: Record<number, string> = {
  1: "Pembuka / Overture — establishes tone, hook kuat, medium-to-high energy",
  2: "First Glimpse — tema mulai muncul, sedikit lebih intim dari lagu 1",
  3: "Rising Tension — konflik/kerinduan mulai, emosi naik, pre-chorus kuat",
  4: "Intimacy Break — selingan intim/akustik, lagu paling personal di Act I",
  5: "Mid-Rise — energi naik lagi, salah satu lagu terkuat di album",
  6: "The Crack — sesuatu mulai retak, nada berubah, rasa takut pertama muncul",
  7: "Breaking Point — puncak emosional paling intens, lagu paling dramatis",
  8: "The Abyss (Album Center) — titik paling gelap/sunyi, stripped-down, minimal kata",
  9: "First Light — percikan harapan pertama, transisi dari gelap ke terang",
  10: "Looking Back — refleksi dari perspektif lebih tinggi, nuansa nostalgia",
  11: "Acceptance Begins — mulai merelakan, nada lebih lega tapi belum selesai",
  12: "Catharsis — pelepasan emosi penuh, momen 'akhirnya bisa napas'",
  13: "New Identity — siapa narator setelah semua ini, versi diri yang baru",
  14: "Penultimate — jembatan antara catharsis dan penutup, sering underrated",
  15: "Outro / Epilogue — penutup, callback ke lagu 1, lingkaran ditutup",
};

const SYSTEM_PROMPT = `You are LyricForge — an expert songwriter and music AI prompt engineer.

Your job:
1. Generate complete song lyrics in the requested language/bahasa
2. Generate a Suno AI style prompt (max 190 characters)

Rules for lyrics:
- Use [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], [Bridge], [Outro] tags as appropriate for the genre
- Match the genre's authentic structure, rhyme scheme, and vocabulary
- Narrative must match the narasi/tema provided
- Lyrics must be written in the specified bahasa/language
- Draw from the novel vocabulary banks for rich, non-generic imagery
- Make it emotionally resonant with a strong hook

Rules for Suno prompt:
- Format: GENRE + MOOD + TEMPO + INSTRUMENTS + VOCALS + USE CASE
- HARD LIMIT: max 190 characters total
- No quotes, no brackets in the prompt itself
- Example: "indie folk, melancholic, mid-tempo, acoustic guitar fingerpicking, warm male vocal, introspective"

Output format (use exactly these headers):
## JUDUL
[song title here]

## LIRIK
[full lyrics with section tags]

## SUNO PROMPT
[style prompt, max 190 chars]

## CATATAN
[2-3 sentences on structure choices and arc role]
`;

export async function POST(req: NextRequest) {
  try {
    const { genre, bahasa, narasi, albumMode, albumTitle, albumConcept, songPosition } =
      await req.json();

    if (!genre || !bahasa || !narasi) {
      return NextResponse.json(
        { error: "genre, bahasa, dan narasi wajib diisi" },
        { status: 400 }
      );
    }

    const references = loadReferences(genre);

    let userMessage = `Genre: ${genre}\nBahasa/Language: ${bahasa}\nNarasi/Tema: ${narasi}`;

    if (albumMode && songPosition) {
      const pos = parseInt(songPosition);
      const arcRole = ARC_ROLES[pos] || "";
      userMessage += `\n\n--- ALBUM MODE ---`;
      if (albumTitle) userMessage += `\nAlbum: "${albumTitle}"`;
      if (albumConcept) userMessage += `\nKonsep Album: ${albumConcept}`;
      userMessage += `\nPosisi Lagu: ${pos} dari 15`;
      if (arcRole) userMessage += `\nPeran dalam Arc: ${arcRole}`;
      if (pos === 15) {
        userMessage += `\nPenting: Lagu penutup — harus ada echo/callback ke tema lagu pembuka (lagu 1). Tutup lingkaran.`;
      }
      if (pos === 8) {
        userMessage += `\nPenting: Ini titik paling gelap album. Buat seminimal mungkin — stripped-down, hanya kata yang paling esensial.`;
      }
    }

    userMessage += `\n\nBuat 1 lagu lengkap sesuai format yang diminta.`;

    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            SYSTEM_PROMPT +
            (references ? "\n\n---\nREFERENCE MATERIAL:\n" + references : ""),
        },
        { role: "user", content: userMessage },
      ],
      temperature: 1.0,
      max_tokens: 2000,
    });

    const text = response.choices[0]?.message?.content || "";

    const judulMatch = text.match(/##\s*JUDUL\s*\n([\s\S]*?)(?=##|$)/);
    const lirikMatch = text.match(/##\s*LIRIK\s*\n([\s\S]*?)(?=##|$)/);
    const sunoMatch = text.match(/##\s*SUNO PROMPT\s*\n([\s\S]*?)(?=##|$)/);
    const catatanMatch = text.match(/##\s*CATATAN\s*\n([\s\S]*?)(?=##|$)/);

    return NextResponse.json({
      judul: judulMatch?.[1]?.trim() || "",
      lirik: lirikMatch?.[1]?.trim() || "",
      sunoPrompt: sunoMatch?.[1]?.trim() || "",
      catatan: catatanMatch?.[1]?.trim() || "",
      raw: text,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
