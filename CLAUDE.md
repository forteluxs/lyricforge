# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

SongArc (internal/legacy name "LyricForge") is an AI app that generates song lyrics + Suno AI style prompts, with a flagship **Full Album Arc** mode (15 cohesive songs). The Next.js app lives in `web/`; the lyric-craft knowledge base lives in `references/` at the repo root.

## Commands

Run from `web/`:

```bash
npm run dev      # dev server (defaults to :3000)
npm run build    # production build (Turbopack) — required after changing any code in web/
npm run lint     # eslint
```

Production process (this machine):

```bash
pm2 restart songarc   # restart after a build; PM2 process name is "songarc"
pm2 logs songarc
```

- **Production runs on port 3005** (not 3000). Port 3000 on this box is a different app. Public domain `songarc.my.id` → Cloudflare → VPS port 3005.
- No test suite exists.
- AI backend: **DeepSeek** (`deepseek-chat`) via the OpenAI SDK with `baseURL: https://api.deepseek.com`. Key is `DEEPSEEK_API_KEY` in `web/.env.local`.

## Architecture: reference-injection is the core

The single most important thing to understand is how a generation request is assembled in `web/lib/generator.ts`:

1. **`references/` (at the REPO ROOT, not under `web/`)** holds Markdown knowledge: per-market chart notes, `genre_vocab/`, `novel_vocab/`, `classic_lyrics/`, `craft/`, plus `suno_prompt_guide.md` and `album_arc.md`.
2. **`loadReferences(genre, bahasa)`** reads relevant `.md` files **at request time** (`fs.readFileSync`) and concatenates them into one big context string. Which files load is decided by keyword-matching the genre (`GENRE_VOCAB_KEYWORDS`, `classicPriority`, `novelPriority`) and the language (Indonesian triggers the `craft/indonesia_*.md` anti-kaku guides).
3. That string is appended to `SYSTEM_PROMPT` and sent as the system message. The model is told to output four fixed headers: `## JUDUL`, `## LIRIK`, `## SUNO PROMPT`, `## CATATAN`.
4. **`parseResult(text)`** extracts those four sections with a tolerant regex (handles `#`/`##`/`**bold**`, optional colons). If you change the output header names in `SYSTEM_PROMPT`, update this regex too.

Consequence: **editing files under `references/` changes generation behavior with NO rebuild** (they're read per-request). Editing TypeScript under `web/` **does** require `npm run build && pm2 restart songarc`.

### Two generation endpoints
- `web/app/api/generate/route.ts` — single track (and per-track regenerate). Calls `loadReferences` + one DeepSeek completion.
- `web/app/api/generate-album/route.ts` — Full Album. Loads references **once**, then streams 15 songs via **Server-Sent Events**, calling `generateOneSong` per position. Each position gets an emotional role from `ARC_ROLES` (e.g. position 8 = "the abyss", 15 = callback/close-the-loop). The frontend renders progress as songs arrive.

### Frontend
- `web/app/page.tsx` is the layout (form left, results right). State logic is centralized in `web/app/hooks/use-lyric-generator.ts` (including `reloadingTracks` for per-track regenerate) — keep state out of UI components.
- Stats ("Lyrics Forged" / "Active Creators") persist to `web/data/stats.json` via `web/lib/stats.ts`. This file is runtime state, untracked in git — don't commit it.

## Conventions

- **Next.js here is a newer major (16.x) with breaking changes** — its APIs may differ from training data. Before writing Next-specific code, consult `web/node_modules/next/dist/docs/` (see `web/AGENTS.md`).
- **Lyric references store CRAFT/technique analysis, not verbatim copyrighted lyrics.** When expanding the knowledge base, add diction banks, structure notes, and craft techniques — not full song lyrics. Indonesian "anti-kaku" guidance: `references/craft/indonesia_lyric_craft.md` and `references/craft/indonesia_kontemporer_2020_2026.md` (winning register = conversational/diary-style, consistent register, concrete near-object metaphors).
- UI button/placeholder text stays in **English**; generated lyrics follow the user-selected `bahasa`.

> Note: the root `README.md` mentions `albums/` and `templates/` directories that do not currently exist; the live layout is `web/` + `references/`. `PROJECT_CONTEXT.md` is an informal running log and may lag the code.
