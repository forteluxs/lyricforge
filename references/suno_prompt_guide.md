# Suno AI Prompt Guide
*Source: github.com/AlijeeWrites/suno-ai-prompts-list-pdf*

---

## The Expert Prompt Formula

```
STYLE + MOOD + TEMPO + INSTRUMENTS + VOCALS + USE CASE
```

| Component | Function | Example |
|---|---|---|
| Style | Sound family / genre | Pop, Lo-fi, Cinematic |
| Mood | Emotional color | reflective, aggressive, uplifting |
| Tempo/Energy | Pacing and drive | mid-tempo, high energy, slow build |
| Instruments | Reduces arrangement ambiguity | soft synths, crisp drums |
| Vocals | Performance type + gender | female vocals, male husky |
| Use Case | Practical context | study music, short-form video |

**Priority order (left to right matters!):**
1. Most important genre
2. Secondary genre/subgenre
3. Mood/energy
4. Key instruments
5. BPM
6. Texture/mix character

> ⚠️ "Dark trap, 808s, aggressive" ≠ "Aggressive, 808s, dark trap" — order changes the output

---

## The Dual-Brain Model

**Style Field (Global Brain)**
- Establishes core DNA: genre, mood, instrumentation, production quality
- Shapes the entire sonic landscape

**Lyrics Field (Local Brain)**
- Bracketed tags are ~10x more powerful for arrangement control than Style field
- Acts as real-time performance director per section

---

## The 5-8 Tag Sweet Spot

Use 5–8 strong, non-conflicting signals. Avoid 15+ weak descriptors.

**Weak tokens (avoid):** beautiful, epic, cool, amazing

**Strong tokens (use):**
- Specific instrument names: `Moog bass`, `Rhodes piano`
- Precise BPM: `120 BPM`, `90 BPM`
- Production textures: `tape-saturated`, `vinyl crackle`, `high-fidelity 44.1kHz`

---

## Ready-to-Use Templates by Genre

### Pop
```
Modern pop, bright and confident, mid-tempo, crisp drums and soft synths, female vocals, catchy chorus for short-form creator content.
```

### Indie Pop (Full Song)
```
Indie pop, warm and nostalgic, mid-tempo, soft guitars and airy synths, intimate vocals, verse-chorus structure with a memorable hook.
```

### Synth-Pop
```
Synth-pop, shimmering and euphoric, 120 BPM, arpeggiated synths and punchy 808s, breathy female vocals, huge anthemic chorus.
```

### Melodic Rap
```
Melodic rap, introspective and late-night, mid-tempo, warm pads and clean drums, male vocals, verse and hook structure.
```

### Boom-Bap Hip-Hop
```
Boom-bap hip-hop, gritty and raw, 90 BPM, sampled vinyl crackle, dusty drums, and a deep bassline, male vocal, complex lyrical flow.
```

### Melodic House
```
Melodic house, uplifting and driving, 125 BPM, piano chords, lush pads, and a deep rolling bassline, female vocal chop on the drop.
```

### Lo-Fi Hip-Hop
```
Lo-fi hip-hop, cozy and mellow, 75-85 BPM, warm Rhodes piano, gentle guitar, and a smooth bassline, soft vinyl crackle texture, instrumental study beats.
```

### 90s Alternative Rock
```
90s alternative rock, angsty and raw, mid-tempo, wall of distorted guitars, driving drums, male vocal with a gritty, passionate delivery.
```

### Epic Fantasy Orchestral
```
Epic fantasy orchestral, heroic and grand, 85 BPM, soaring strings, powerful brass section, and thunderous timpani, full choir vocals for a climactic scene.
```

### Short-Form Hook
```
Bright dance-pop, upbeat and catchy, high energy, punchy drums and synth lead, short vocal hook, made for short-form video intros.
```

### Workout Montage
```
High-energy driving rock, aggressive and powerful, fast tempo, distorted electric guitar and thunderous drums, male gang vocals, for a workout montage.
```

### Background / Study Music
```
Minimal ambient piano, calm and reflective, slow tempo, soft pads, no vocals, background music for YouTube narration.
```

---

## Advanced Technique: Describe Sound, Not Genre

Instead of vague genre tags, use technical production language:

❌ Weak: `"dark trap, sad"`

✅ Strong:
```
High-fidelity 44.1kHz stereo mix, crystal-clear dynamics, precise instrument separation, heavy rumbling 808 sub-bass dominating the lows, crisp hi-hats and sharp snares with bright but controlled treble, late-2020s Atlanta trap production, mid-tempo focused energy, 140 BPM head-nod groove, dark cinematic atmosphere
```

---

## Vocal Anchor Tags (in Lyrics Field)

Place at the start of lyrics to lock in singer character:

```
[Vocal: male, deep husky timbre, relaxed but intense delivery, clear diction, precise rhythm, modern rap-adjacent tone.]
```

```
[Vocal: female, smooth and soulful, airy on quiet lines, powerful natural belting on peaks, contemporary R&B inflection.]
```

---

## Behavior Tags for Song Sections

Replace plain `[Verse]`/`[Chorus]` with dynamic instructions:

| Plain Tag | Behavior Tag | Effect |
|---|---|---|
| [Verse] | [Structure: Focused Performance] | Tight storytelling, medium energy |
| [Pre-Chorus] | [Structure: Build-up] | Rising tension, layering instruments |
| [Chorus] | [Structure: Anthemic Peak] | Biggest hook energy, track's highest point |
| [Bridge] | [Structure: Minimalist Breakdown] | Stripped back, intimate, more space |

**Combined example:**
```
[Chorus | High Energy | Anthemic | Electric Guitar Solo]
```

---

## Meta-Layer Tags (in Lyrics Field)

### Instruments
| Category | Tags |
|---|---|
| Keys | `[Synth Pad]`, `[Rhodes]`, `[Organ]` |
| Guitar | `[Distorted Guitar]`, `[Slap Bass]`, `[Banjo]` |
| Drums | `[Breakbeat]`, `[808 sub bass]`, `[Taiko Drums]` |
| Orchestral | `[Strings Section]`, `[Brass Section]`, `[Choir Vocals]` |

### Performance & Delivery
| Category | Tags |
|---|---|
| Vocal FX | `[Whispered]`, `[Autotuned]`, `[Powerful]` |
| Dynamics | `[Drum fill transition into chorus]`, `[Smooth crossfade intro to verse]`, `[Silence]` |
| Atmosphere | `[Rain]`, `[Stadium crowd ambience]`, `[Vinyl static]` |

---

## One-Variable Revision Method

When output is wrong, only change ONE element at a time:

| Problem | Fix |
|---|---|
| Wrong energy | Modify tempo/energy descriptor only |
| Cluttered sound | Alter instruments only |
| Vocal issues | Change vocal direction only |
| Wrong vibe for platform | Adjust use case only |

---

## Common Mistakes

| Mistake | Description |
|---|---|
| Overload | Too many conflicting ideas dilutes AI focus |
| Vagueness | Abstract adjectives are weak signals |
| Missing context | Use case changes everything about arrangement |

---

## Key Constraint
Suno Style field: **max ~190 characters** (hard limit — returns 400 error if exceeded)
