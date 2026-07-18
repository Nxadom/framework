# Terminal — Panduan Penggunaan

**Terminal** adalah shell bawaan di NxCode untuk menjalankan perintah, script, dan alat baris perintah langsung dari aplikasi. Terminal terintegrasi penuh dengan sistem file, Git, npm, dan alat pengembangan lainnya.

---

## Cara Membuka

| Cara | Tindakan |
|------|----------|
| **Panel Bawah** | Klik panel Terminal di bagian bawah jendela |
| **Menu** | Klik menu **View** → **Terminal** |
| **Shortcut** | `Ctrl + Shift + Z` (buka/tutup terminal) |

Terminal muncul sebagai panel di bagian bawah. Bisa di-resize dengan menarik batas atasnya.

---

## Tampilan Terminal

| Area | Fungsi |
|------|--------|
| **Header** | Nama terminal, dropdown pilihan shell, tombol tutup |
| **Input bar** | Baris paling bawah untuk mengetik perintah |
| **Output area** | Area tengah menampilkan hasil perintah |

### Prompt
Prompt menampilkan direktori aktif dan menyesuaikan dengan shell yang dipilih:
```
D:\project>    (CMD / default)
PS D:\project> (PowerShell)
$ D:\project>  (Bash / Git Bash)
```

---

## Perintah Dasar

### Navigasi Direktori

| Perintah | Fungsi |
|----------|--------|
| `pwd` | Tampilkan folder aktif saat ini |
| `cd <path>` | Pindah ke folder lain (contoh: `cd D:/project/src`) |
| `home` | Kembali ke folder awal |
| `ls` | Tampilkan daftar isi folder (nama, ukuran, tanggal) |
| `dir` | Sama seperti `ls` |

### Informasi & Bantuan

| Perintah | Fungsi |
|----------|--------|
| `help` | Tampilkan daftar semua perintah yang tersedia |
| `shortcuts` | Tampilkan pintasan keyboard |
| `whoami` | Tampilkan username saat ini |
| `date` | Tampilkan tanggal dan waktu |
| `clear` / `cls` | Bersihkan layar terminal |

---

## Menjalankan Perintah Shell

Terminal bisa menjalankan perintah native Windows langsung:

### npm / Node.js
```
npm install
npm start
npx create-react-app my-app
node server.js
```
- `npm start` otomatis mendeteksi port dan membuka browser jika perlu
- `npm run dev` / `npx expo start` berjalan dalam mode interaktif

### Git
```
git status
git add .
git commit -m "pesan"
git push
```

### Perintah Lain
```
yarn, pnpm, mkdir, copy, move, del, type, tree
```

> Perintah yang diketik langsung diteruskan ke shell aktif — tidak perlu khawatir format spesifik shell.

---

## Memilih Shell

Klik dropdown di pojok kanan header terminal untuk mengganti shell:

| Shell | Keterangan |
|-------|-----------|
| **Command Prompt** | Default Windows CMD |
| **Windows PowerShell** | PowerShell bawaan Windows |
| **PowerShell Core** | PowerShell 7+ (jika terinstall) |
| **Bash (WSL)** | Bash via Windows Subsystem for Linux |
| **Git Bash** | Bash bawaan Git for Windows |

Pilihan shell disimpan dan akan tetap sama saat Anda membuka terminal lagi.

---

## Autocomplete (Tab)

Tekan **Tab** saat mengetik perintah untuk melihat saran:
1. **Riwayat** — perintah yang pernah dijalankan sebelumnya
2. **Perintah bawaan** — semua perintah yang tersedia di terminal

Gunakan **↑ / ↓** untuk memilih, **Enter** untuk memilih, **Escape** untuk tutup.

---

## Navigasi Riwayat Perintah

- **↑ (Panah Atas)** — perintah sebelumnya
- **↓ (Panah Bawah)** — perintah berikutnya
- Riwayat disimpan dan bisa diakses lagi meski terminal ditutup & dibuka kembali

---

## Context Menu (Klik Kanan)

Klik kanan di area terminal:

| Menu | Fungsi |
|------|--------|
| **Copy** | Salin teks yang dipilih |
| **Paste** | Tempel teks dari clipboard |
| **Select All** | Pilih semua teks terminal |
| **Add Chat** | Kirim teks terpilih ke panel Chat AI |

---

## API Console

**API Console** adalah alat untuk menguji HTTP request langsung dari terminal.

### Cara Pakai:
1. Ketik `api` di terminal, atau klik tombol **API Console** di panel bawah
2. Masukkan **URL** endpoint
3. Pilih **Method** (GET, POST, PUT, DELETE, dll.) — default GET
4. Atur **Authorization** (Bearer Token, Basic Auth, atau Custom Header) — opsional
5. Konfirmasi kirim
6. Lihat hasilnya: status HTTP, waktu tempuh, header, dan body respons

### Contoh:
```
D:\project> api
URL: https://api.example.com/users
Method [GET]: GET
Auth? (y/N): n

GET https://api.example.com/users → 200 OK (342ms)
Content-Type: application/json

{ "users": [...] }
```

---

## Agent CLI

**Agent CLI** adalah mode percakapan dengan AI langsung dari terminal, tanpa perlu membuka panel Chat.

### Cara Pakai:
```
D:\project> agent
=== NxCode Agent ===
Ketik prompt. Ketik "exit" untuk keluar.

You: jelaskan isi file ini
[AI menjawab...]

You: tambahkan validasi
[AI mengedit file...]

You: exit
Agent ditutup.
```

AI bisa membaca dan menulis file di folder aktif terminal.

---

## Debug & Problems

| Perintah | Fungsi |
|----------|--------|
| `debug` | Scan project aktif untuk mencari error sintaks |
| `problems` | Tampilkan hasil debug terakhir |

---

## Ekstensi Developer (nx)

| Perintah | Fungsi |
|----------|--------|
| `nx dev` | Wizard pembuatan extension developer |
| `nx bundle` | Bundle extension untuk distribusi |

---

## Output Mode

| Perintah | Fungsi |
|----------|--------|
| `output-mode` | Lihat/set mode output saat ini |
| `output-clean` | Mode bersih — filter noise dari shell (default) |
| `output-raw` | Mode mentah — tampilkan semua output apa adanya |

---

## Pintasan Keyboard Terminal

| Tombol | Fungsi |
|--------|--------|
| **Ctrl + C** | Hentikan proses yang berjalan (SIGINT) |
| **↑ / ↓** | Navigasi riwayat perintah |
| **Tab** | Autocomplete perintah |
| **Ctrl + Shift + Z** | Buka/tutup panel Terminal |

### Server & Preview

| Perintah | Fungsi |
|----------|--------|
| `run <file.html>` | Buka file HTML di jendela pratinjau |
| `run mobile <url>` | Buka URL di panel pratinjau mobile |
| `mobile <url>` | Alias `run mobile` |
| `start [port]` | Jalankan server statik |
| `stop [port]` | Hentikan server |
| `servers` | Lihat daftar server aktif |
| `restart <port>` | Restart server |

### PHP Server

| Perintah | Fungsi |
|----------|--------|
| `phpserver` | Mulai PHP built-in server |
| `phpserver start [port]` | Start PHP server (port otomatis) |
| `phpserver stop [port]` | Stop PHP server |
| `phpserver status` | Lihat daftar PHP server aktif |

### Session & Shell

| Perintah | Fungsi |
|----------|--------|
| `shell-stop` / `stop-shell` | Hentikan proses shell native aktif |
| `login` | Login ke sesi terminal |
| `logout` | Logout dari sesi |
| `mode <args>` | Development testing mode |
| `devrun [stop]` | Run/stop project dari editor aktif |

### Claude CLI

| Perintah | Fungsi |
|----------|--------|
| `claude [prompt]` | Claude AI langsung dari terminal (ketik `exit` untuk keluar) |

---

## Catatan Penting

- **Paste otomatis dibersihkan** — hanya teks biasa yang ditempel, tanpa formatting HTML
- **Auto-scroll** — output baru tidak otomatis menggulung ke bawah, agar Anda bisa membaca output sebelumnya
- **CWD tersimpan** — folder aktif terminal tetap tersimpan meski terminal ditutup
- **Proses interaktif** — `npm start`, `expo start`, `npx expo start` berjalan dalam mode interaktif penuh
