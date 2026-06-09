# LyricForge

Pipeline untuk generate lirik lagu + Suno AI prompts dalam format album (15 lagu per album, per genre).

## Struktur

```
albums/          # Output lirik per album (organized by genre)
references/      # Chart data & lyric style references per market
templates/       # Template struktur lagu per genre
```

## Workflow

1. Tentukan genre
2. Pilih novel referensi (untuk gaya bahasa)
3. Generate 15 lirik + Suno prompt per album
4. Output per lagu: `[Verse]/[Chorus]/[Bridge]` tags + style prompt (<190 chars)

## Markets Covered

Chart analysis tersedia untuk: 🇺🇸 USA · 🇬🇧 UK · 🇯🇵 Japan · 🇮🇩 Indonesia · 🇩🇪 Germany · 🇫🇷 France
