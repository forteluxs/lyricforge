import OpenAI from "openai";
import fs from "fs";
import path from "path";

export const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const REFS_DIR = path.join(process.cwd(), "..", "references");

function readFile(filePath: string): string {
  try { return fs.readFileSync(filePath, "utf-8"); } catch { return ""; }
}

const GENRE_VOCAB_KEYWORDS: Record<string, string[]> = {
  "indo_folk_pop.md":      ["indie folk","folk indonesia","indo folk","pop ballad","pop indonesia","pop ballad indonesia","singer songwriter indonesia","indie indonesia"],
  "hiphop_rnb_soul.md":   ["hip hop","hip-hop","hiphop","rap","rnb","r&b","neo soul","soul","conscious rap","trap","boom bap","lo-fi hip hop","dangdut","dangdut modern","dangdut pop","koplo"],
  "rock_alternative.md":  ["rock","indie rock","alternative","grunge","post punk","post-punk","britpop","shoegaze","math rock","art rock","folk rock","garage rock","metal","punk"],
  "world_music.md":       ["afrobeats","afro","bossa nova","bossanova","reggae","dancehall","latin","salsa","cumbia","reggaeton","celtic","irish folk","samba","fado","flamenco"],
  "electronic_pop.md":    ["electronic","synthpop","synth pop","indie pop","dream pop","art pop","electropop","chillwave","bedroom pop","lo-fi","ambient pop","hyperpop","dance pop","edm"],
  "jpop_kpop_asian.md":   ["j-pop","jpop","j pop","k-pop","kpop","k pop","c-pop","cpop","opm","original pilipino music","mandopop","city pop","anime","visual kei","idol"],
  "jazz_blues_country.md":["jazz","blues","country","americana","gospel","soul jazz","swing","bebop","smooth jazz","delta blues","chicago blues","bluegrass","outlaw country","folk country"],
};

function matchGenreVocab(genre: string): string[] {
  const g = genre.toLowerCase();
  const matched = Object.entries(GENRE_VOCAB_KEYWORDS)
    .filter(([, kws]) => kws.some(kw => g.includes(kw)))
    .map(([file]) => file);
  return matched.length ? matched : ["indo_folk_pop.md", "electronic_pop.md"];
}

export function loadReferences(genre: string): string {
  let ctx = "";
  const g = genre.toLowerCase();

  const sunoGuide = readFile(path.join(REFS_DIR, "suno_prompt_guide.md"));
  if (sunoGuide) ctx += "\n\n# SUNO AI PROMPT GUIDE\n" + sunoGuide;

  const albumArc = readFile(path.join(REFS_DIR, "album_arc.md"));
  if (albumArc) ctx += "\n\n# ALBUM ARC SYSTEM\n" + albumArc;

  const genreVocabDir = path.join(REFS_DIR, "genre_vocab");
  for (const file of matchGenreVocab(genre)) {
    const c = readFile(path.join(genreVocabDir, file));
    if (c) ctx += "\n\n# GENRE VOCABULARY\n" + c;
  }

  const novelVocabDir = path.join(REFS_DIR, "novel_vocab");
  const novelPriority = [
    { file: "viral_indo_wattpad.md",     kws: ["indo","indonesia","melayu","dangdut","folk indonesia","pop indonesia"] },
    { file: "viral_romance_literary.md", kws: ["romance","pop ballad","indie pop","r&b","neo soul","bedroom pop","dream pop","art pop","k-pop","opm"] },
    { file: "viral_manhwa_webtoon.md",   kws: ["k-pop","kpop","j-pop","jpop","anime","fantasy","epic","rap","hip hop"] },
    { file: "indonesian_classics.md",    kws: ["indo","indonesia","melayu","folk","pop indonesia","dangdut"] },
    { file: "persian_arabic_classics.md",kws: ["folk","indie folk","singer songwriter","ballad"] },
    { file: "western_classics.md",       kws: ["rock","folk rock","indie rock","alternative","country","americana","pop","ballad"] },
  ];
  let novelLoaded = 0;
  for (const { file, kws } of novelPriority) {
    if (novelLoaded >= 3) break;
    if (kws.some(kw => g.includes(kw))) {
      const c = readFile(path.join(novelVocabDir, file));
      if (c) { ctx += `\n\n# NOVEL VOCABULARY\n` + c; novelLoaded++; }
    }
  }
  if (novelLoaded === 0) {
    const c1 = readFile(path.join(novelVocabDir, "viral_indo_wattpad.md"));
    const c2 = readFile(path.join(novelVocabDir, "viral_romance_literary.md"));
    if (c1) ctx += "\n\n# NOVEL VOCABULARY\n" + c1;
    if (c2) ctx += "\n\n# NOVEL VOCABULARY\n" + c2;
  }

  const classicDir = path.join(REFS_DIR, "classic_lyrics");
  const classicPriority = [
    { file: "indonesia.md", kws: ["indo","indonesia","dangdut","melayu"] },
    { file: "usa.md",       kws: ["folk rock","hip hop","rap","country","americana","blues","soul","r&b"] },
    { file: "uk.md",        kws: ["brit","rock","post punk","indie","alternative","shoegaze"] },
    { file: "australia.md", kws: ["australia","rock","indie"] },
    { file: "germany.md",   kws: ["german","schlager","deutsch"] },
    { file: "netherlands.md",kws: ["dutch","nederpop","nederland"] },
    { file: "ireland.md",   kws: ["celtic","irish","folk"] },
    { file: "new_zealand.md",kws: ["indie","art pop","dream pop"] },
    { file: "italy.md",     kws: ["italian","cantautore","chanson"] },
    { file: "canada.md",    kws: ["folk","singer songwriter","country"] },
  ];
  let classicLoaded = 0;
  for (const { file, kws } of classicPriority) {
    if (classicLoaded >= 3) break;
    if (kws.some(kw => g.includes(kw))) {
      const c = readFile(path.join(classicDir, file));
      if (c) { ctx += `\n\n# CLASSIC LYRICS (${file.replace(".md","").toUpperCase()})\n` + c; classicLoaded++; }
    }
  }
  if (!g.includes("indo") && classicLoaded < 3) {
    const c = readFile(path.join(classicDir, "indonesia.md"));
    if (c) ctx += "\n\n# CLASSIC LYRICS (INDONESIA)\n" + c;
  }

  return ctx;
}

export const ARC_ROLES: Record<number, string> = {
  1:  "Pembuka / Overture — establishes tone, hook kuat, medium-to-high energy",
  2:  "First Glimpse — tema mulai muncul, sedikit lebih intim dari lagu 1",
  3:  "Rising Tension — konflik/kerinduan mulai, emosi naik, pre-chorus kuat",
  4:  "Intimacy Break — selingan intim/akustik, lagu paling personal di Act I",
  5:  "Mid-Rise — energi naik lagi, salah satu lagu terkuat di album",
  6:  "The Crack — sesuatu mulai retak, nada berubah, rasa takut pertama muncul",
  7:  "Breaking Point — puncak emosional paling intens, lagu paling dramatis",
  8:  "The Abyss (Album Center) — titik paling gelap/sunyi, stripped-down, minimal kata",
  9:  "First Light — percikan harapan pertama, transisi dari gelap ke terang",
  10: "Looking Back — refleksi dari perspektif lebih tinggi, nuansa nostalgia",
  11: "Acceptance Begins — mulai merelakan, nada lebih lega tapi belum selesai",
  12: "Catharsis — pelepasan emosi penuh, momen 'akhirnya bisa napas'",
  13: "New Identity — siapa narator setelah semua ini, versi diri yang baru",
  14: "Penultimate — jembatan antara catharsis dan penutup, sering underrated",
  15: "Outro / Epilogue — penutup, callback ke lagu 1, lingkaran ditutup",
};

export const SYSTEM_PROMPT = `You are LyricForge — an expert songwriter and music AI prompt engineer.

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

export function parseResult(text: string) {
  const get = (key: string) => {
    // Regex that is case-insensitive, allows # or ## or ###, optional **bolding**, optional colon
    const regex = new RegExp(`(?:^|\\n)(?:#+\\s*|\\*\\*)?${key}(?:\\*\\*)?\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n(?:#+\\s*|\\*\\*)[A-Z]|$)`, "i");
    return text.match(regex)?.[1]?.trim() || "";
  };

  let judul = get("JUDUL");
  let lirik = get("LIRIK");
  let sunoPrompt = get("SUNO PROMPT") || get("PROMPT") || get("SUNO AI PROMPT");
  let catatan = get("CATATAN");

  if (!judul && !lirik) {
    // Fallback if the AI completely ignored headings
    const lines = text.trim().split("\\n");
    judul = lines[0].replace(/^[#*]+\\s*/, "").replace(/\\*\\*$/, "").trim();
    lirik = lines.slice(1).join("\\n").trim();
  }

  return {
    judul: judul || "Gagal Membaca Judul",
    lirik: lirik || text,
    sunoPrompt: sunoPrompt || "suno prompt tidak ditemukan",
    catatan: catatan || "",
    raw: text,
  };
}

export interface SongResult {
  position: number;
  judul: string;
  lirik: string;
  sunoPrompt: string;
  catatan: string;
  raw: string;
}

export async function generateOneSong(params: {
  genre: string;
  bahasa: string;
  narasi: string;
  position: number;
  albumTitle?: string;
  albumConcept?: string;
  references: string;
}): Promise<SongResult> {
  const { genre, bahasa, narasi, position, albumTitle, albumConcept, references } = params;
  const arcRole = ARC_ROLES[position] || "";

  let userMessage = `Genre: ${genre}\nBahasa/Language: ${bahasa}\nNarasi/Tema Album: ${narasi}`;
  userMessage += `\n\n--- ALBUM MODE ---`;
  if (albumTitle)   userMessage += `\nAlbum: "${albumTitle}"`;
  if (albumConcept) userMessage += `\nKonsep Album: ${albumConcept}`;
  userMessage += `\nPosisi Lagu: ${position} dari 15`;
  if (arcRole)      userMessage += `\nPeran dalam Arc: ${arcRole}`;
  if (position === 8)  userMessage += `\nPenting: Titik paling gelap album — stripped-down, hanya kata paling esensial.`;
  if (position === 15) userMessage += `\nPenting: Lagu penutup — harus ada echo/callback ke tema lagu 1. Tutup lingkaran.`;
  userMessage += `\n\nBuat 1 lagu untuk posisi ini. Adaptasi narasi sesuai peran emosional posisi ${position}.`;

  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "system", content: SYSTEM_PROMPT + (references ? "\n\n---\nREFERENCE MATERIAL:\n" + references : "") },
      { role: "user",   content: userMessage },
    ],
    temperature: 1.0,
    max_tokens: 2000,
  });

  const text = response.choices[0]?.message?.content || "";
  return { position, ...parseResult(text) };
}
