# SongArc - Project Context & Memory

## Identitas Proyek
- **Nama Lama:** LyricForge
- **Nama Baru:** SongArc
- **Slogan:** "Where Inspiration Meets Intelligence"
- **Tech Stack:** Next.js (App Router), React, Tailwind CSS, Framer Motion, TypeScript, PM2, Cloudflare.
- **AI Backend:** DeepSeek API (`deepseek-chat`).
- **Tujuan:** Aplikasi web berbasis AI untuk men-*generate* lirik lagu profesional, dengan fitur unggulan *Full Album Arc* (15 lagu berkesinambungan).

## Fitur Utama yang Sudah Selesai
1. **Generator Formulir Lengkap:** Memilih Genre, Bahasa, dan Tema Cerita.
2. **Single Track & Full Album Mode:** Mode *Single* menghasilkan 1 lagu instan. Mode *Album* menggunakan *Server-Sent Events (SSE)* untuk meng-*generate* 15 lagu secara bertahap dan kohesif dengan transisi yang berkesinambungan.
3. **Regenerate Per-Track:** Pengguna bisa meng-*generate* ulang lagu spesifik di dalam album tanpa merusak sisa album lainnya (fitur ini menggunakan *state* `reloadingTracks`).
4. **UI/UX Cyberpunk:** Tema warna gelap, aksen *Cyan/Fuchsia*, animasi *Framer Motion*, dan latar belakang *grid* 3D ala Cyberpunk.
5. **Real-time Stats Counter:** Menampilkan angka "Lyrics Forged" dan "Active Creators" yang datanya disimpan secara *persisten* dan statis di `data/stats.json` di server.

## Struktur & Arsitektur
- **`web/app/page.tsx`**: Halaman utama yang memuat layout (Formulir di kiri, Hasil lagu di kanan).
- **`web/app/api/generate/route.ts`**: Endpoint untuk *Single Track* & *Regenerate Track*.
- **`web/app/api/generate-album/route.ts`**: Endpoint SSE untuk *Full Album*.
- **`web/app/api/stats/route.ts`**: Endpoint untuk mengambil dan memperbarui status konter.
- **`web/app/hooks/use-lyric-generator.ts`**: Logika *state management* utama (memisahkan logika dari komponen UI).
- **`web/lib/generator.ts`**: Otak penghubung ke DeepSeek AI, memuat *system prompt*, dan *regex parser* untuk lirik.
- **`web/lib/stats.ts`**: Fungsi utilitas untuk membaca dan menulis *stats counter* ke dalam file lokal JSON.

## Status Deployment (VPS)
- **Lokasi:** VPS pribadi Ubuntu (IP: `xxxxx`).
- **Domain:** `songarc.my.id` (Dikelola penuh oleh Cloudflare).
- **Cara Kerja Domain:** Cloudflare *Origin Rules* mengalihkan *traffic* standar dari `https://songarc.my.id` (Port 443) langsung menuju ke Port `3005` di VPS.
- **Proses Background:** Aplikasi dijaga agar tetap hidup 24/7 menggunakan **PM2** dengan nama proses `songarc`.
- **Lokasi Kode di VPS:** `/home/forteluxs/SongArc/web`

## Aturan *Coding* untuk AI Selanjutnya (PENTING)
1. **Separation of Concern & DRY:** Jangan mencampur *state logic* ke dalam komponen UI. Selalu gunakan *Custom Hooks*.
2. **Aesthetics are VERY Important:** Setiap penambahan komponen UI harus terlihat "Premium", hindari komponen polos. Wajib mengikuti skema desain *glassmorphism* dan *dark mode* yang ada.
3. **Drift in the Future:** Jangan sekadar menulis kode "yang penting jalan sekarang". Pikirkan *maintainability*-nya.
4. Jangan menyentuh/mengubah ekstensi bahasa file dari UI ke bahasa lain (tetap Bahasa Inggris untuk UI *button/placeholder*).

---
*Catatan untuk AI: Jika Anda baru saja membaca dokumen ini, silakan langsung membalas "Saya telah membaca konteks SongArc, kita siap melanjutkan!" kepada User.*
