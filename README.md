# AFTER YOU — Ruang untuk yang Kehilangan

**Tagline:** *Ruang untuk yang Kehilangan.*

AFTER YOU adalah ruang digital untuk orang-orang yang sedang patah hati, kehilangan seseorang,
dikhianati, merindukan mantan, mengalami perpisahan, atau belajar mengikhlaskan seseorang yang
pernah menjadi bagian terpenting dalam hidup mereka.

Bukan blog biasa. Bukan landing page generik. AFTER YOU dirancang sebagai pengalaman emosional
yang cinematic, artistik, dan premium — dunia kecil yang hanya bisa dipahami oleh orang-orang
yang pernah kehilangan.

---

## Fitur

| Section | Fitur |
| --- | --- |
| **Hero** | Full-screen cinematic: hujan, kabut, partikel melayang, parallax, moon glow, scroll indicator |
| **Ruang Curhat** | Jurnal pribadi: judul, mood (9 pilihan), simpan/edit/baca/hapus, riwayat, konfirmasi hapus, empty state. Data di `localStorage` — tidak pernah dikirim ke server |
| **Surat yang Tak Terkirim** | Tulis surat untuk seseorang; simpan, edit, baca. Ritual pelepasan: **bakar** (animasi api + abu), **sobek** (animasi sobek), **terbangkan** (surat terbang ke langit) |
| **Music Room** | YouTube IFrame Player API resmi: 3 playlist, 18 lagu dengan video ID **terverifikasi**, play/pause/prev/next, progress bar, volume, shuffle, repeat, mini player yang tetap terlihat saat pindah section, visualizer, tombol buka di YouTube, fallback jelas bila video tidak bisa di-embed. **Tidak ada autoplay** |
| **Mood Check-in** | 8 kartu mood; setiap mood menampilkan pesan emosional, kutipan, rekomendasi playlist (langsung memilih playlist di Music Room), dan saran aktivitas kecil |
| **Kata-Kata Malam Ini** | 120 kutipan original bahasa Indonesia; ganti kutipan, salin, favorit (tersimpan lokal), bagikan (Web Share API), unduh sebagai gambar PNG (canvas), ganti latar |
| **Healing Room** | 7 langkah kecil yang bisa dicentang, progress "Perjalanan pulihmu" tersimpan di `localStorage`, catatan bahwa situs ini bukan pengganti bantuan profesional |

---

## Teknologi

- [React 19](https://react.dev) + [Vite](https://vite.dev) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first configuration)
- [Motion](https://motion.dev) (animasi)
- [Lucide React](https://lucide.dev) (ikon)
- YouTube IFrame Player API (musik)
- `localStorage` (semua data pribadi pengguna)
- [Vitest](https://vitest.dev) (unit test) + [oxlint](https://oxc.rs) (lint)

Semua gambar adalah **artwork original** yang digenerate secara prosedural
(`scripts/gen-images.py`) — tidak ada gambar berhak cipta pihak ketiga.

---

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Build & test

```bash
npm run lint      # lint (oxlint)
npm run test      # unit test (vitest)
npm run build     # TypeScript check + production build ke folder dist/
npm run preview   # pratinjau hasil build
```

## Deployment

Website dideploy ke **Netlify**. Konfigurasi ada di [`netlify.toml`](netlify.toml):

- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect `/* → /index.html`

### GitHub Actions

Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. Trigger: push ke `main`, pull request ke `main`, dan manual `workflow_dispatch`.
2. Job **Build & Test**: checkout → Node 22 → `npm ci` → lint → test → build → upload artifact.
3. Job **Deploy**: hanya di branch `main` (bukan PR), build ulang lalu deploy via Netlify CLI.

### Secrets GitHub (wajib untuk auto-deploy)

| Secret | Isi |
| --- | --- |
| `NETLIFY_AUTH_TOKEN` | Personal access token Netlify (User settings → Applications → New access token) |
| `NETLIFY_SITE_ID` | Site ID dari dashboard Netlify (Site configuration → General → Site ID) |

Cara menambahkan: **GitHub → repo → Settings → Secrets and variables → Actions → New repository secret**.

> Secrets tidak pernah ditulis di source code atau di-commit.

### Deploy manual dari terminal

```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## Menambah atau mengubah lagu

Semua lagu dikonfigurasi di `scripts/validate-youtube.py` (daftar `TRACKS`).
Langkah yang benar (jangan mengarang video ID):

1. Tambah baris `(playlist, judul, artis, query pencarian)` di `TRACKS`.
2. Jalankan:
   ```bash
   python3 scripts/validate-youtube.py
   ```
   Skrip mencari video resmi dari channel artis/label, memverifikasi embeddability lewat
   oEmbed, dan menulis ulang `src/data/video-ids.ts`.
3. `src/data/playlists.ts` otomatis memakai hasilnya; lagu tanpa video yang bisa di-embed
   tetap muncul dengan tautan pencarian YouTube dan tombol fallback.

## Mengganti gambar

- Letakkan gambar di `public/images/`.
- Update referensi di section terkait (mis. `src/sections/Hero.tsx` memakai
  `/images/hero-rainy-window.jpg`).
- Untuk membuat artwork baru yang konsisten dengan tema, gunakan `scripts/gen-images.py`
  sebagai titik awal.

## Mengedit kutipan

Kutipan ada di `src/data/quotes.ts` (array `quotes`). Setiap item:

```ts
{ text: '...', theme: 'Rindu' }
```

Tema yang tersedia: `Rindu`, `Dikhianati`, `Kehilangan`, `Patah Hati`, `Cinta Tak Terbalas`,
`Hubungan Berakhir`, `Penyesalan`, `Kenangan`, `Ikhlas`, `Mulai Pulih`.
Unit test di `src/data/quotes.test.ts` memastikan minimal 100 kutipan unik.

## Troubleshooting build

| Gejala | Penyebab umum | Solusi |
| --- | --- | --- |
| `Unresolved reference` / error TS | Impor yang berubah | Jalankan `npm run build` dan baca pesan error pertama |
| Lint gagal | Aturan oxlint ketat | `npm run lint` menunjukkan file & baris |
| `netlify deploy` gagal autentikasi | Belum login | `netlify login`, atau pastikan secrets `NETLIFY_AUTH_TOKEN` benar |
| Musik tidak berbunyi | Autoplay diblokir / video tidak bisa di-embed | Tekan **Play** dulu; jika video diblokir, tombol "Buka di YouTube" muncul otomatis |
| Gambar tidak muncul | File belum ada di `public/images` | Pastikan nama file cocok dengan referensi |

---

## Catatan

AFTER YOU adalah ruang pendamping, **bukan** pengganti bantuan profesional. Jika rasa sakit
terasa terlalu berat dan berkepanjangan, berbicara dengan psikolog atau konselor adalah bentuk
keberanian, bukan kelemahan.

Dibuat dengan 💜 untuk hati yang masih belajar mengikhlaskan.
