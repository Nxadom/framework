# Daftar Perintah Terminal (NexaTerminal)

> Berisi semua perintah yang tersedia dari `NexaTerminal.js`, `app.min.js`, `app.min.dev.js`, `shortcuts.js`, dan `server/index.js`.

---

## ⌨️  Keyboard Shortcuts

---

## ⌨️  Keyboard Shortcuts

| Tombol | Fungsi |
|--------|--------|
| `Ctrl + Z` | Buka terminal (modal) |
| `Ctrl + Shift + Z` | Buka terminal (modal) |
| `Ctrl + Shift + X` | Tutup terminal |
| `Ctrl + C` | Cancel / stop proses (SIGINT) |
| `Arrow Up / Down` | Navigasi riwayat perintah |
| `Tab` | Autocomplete perintah |

---

## 📂  Navigasi Direktori

| Perintah | Deskripsi |
|----------|-----------|
| `pwd` | Tampilkan direktori aktif |
| `cd <path>` | Pindah direktori |
| `home` | Kembali ke direktori awal (`D:/`) |
| `ls [path]` | Daftar isi direktori (tampilan tabel) |
| `dir [path]` | Alias `ls` |

---

## 🧹  Layar Terminal

| Perintah | Deskripsi |
|----------|-----------|
| `clear` | Bersihkan layar terminal |
| `cls` | Bersihkan layar terminal (alias) |

---

## 👁️  Preview & Run

| Perintah | Deskripsi |
|----------|-----------|
| `run <file.html>` | Buka pratinjau HTML di jendela baru |
| `run` | Deteksi project (Node.js) atau buka `index.html` |
| `target run <file.html>` | Buka pratinjau HTML (`@file.html run`) |
| `mobile [url]` | Buka Node.js server di mobile webview panel |

---

## 🔄  Native Shell

| Perintah | Deskripsi |
|----------|-----------|
| `npm <args>` | Node package manager |
| `npx <args>` | Jalankan package npm |
| `node <args>` | Jalankan script Node.js |
| `git <args>` | Git version control |
| `yarn <args>` | Yarn package manager |
| `pnpm <args>` | pnpm package manager |
| `bun <args>` | Bun runtime & package manager |
| `shell-stop` | Hentikan proses shell native aktif |
| `stop-shell` | Alias `shell-stop` |

### Windows-specific

| Perintah | Deskripsi |
|----------|-----------|
| `rmdir <path>` | Hapus direktori (`/s` untuk rekursif) |
| `rd <path>` | Alias `rmdir` |
| `del <file>` | Hapus file |
| `erase <file>` | Alias `del` |
| `md <dir>` | Buat direktori (alias `mkdir`) |
| `move <src> <dst>` | Pindah/rename file |
| `copy <src> <dst>` | Salin file |
| `xcopy <src> <dst>` | Salin direktori rekursif |
| `type <file>` | Tampilkan isi file |
| `ren <old> <new>` | Rename file |
| `attrib <file>` | Atribut file |
| `fc <file1> <file2>` | Bandingkan file |
| `tree <path>` | Tampilkan struktur direktori |
| `robocopy <src> <dst>` | Robocopy (salin lanjutan) |
| `mkdir <dir>` | Buat direktori |

### Unix / Cross-platform

| Perintah | Deskripsi |
|----------|-----------|
| `rm <file/dir>` | Hapus file/direktori |
| `mv <src> <dst>` | Pindah/rename file |
| `cp <src> <dst>` | Salin file |
| `cat <file>` | Tampilkan isi file |
| `touch <file>` | Buat file kosong |
| `find <query>` | Cari file |
| `grep <pattern>` | Cari teks dalam file |
| `where <name>` | Lokasi executable |
| `which <name>` | Alias `where` |

---

## 📝  Terminal Output Mode

| Perintah | Deskripsi |
|----------|-----------|
| `output-mode [mode]` | Set/get mode output (`clean` / `raw`) |
| `output-clean` | Set mode output ke clean (default) |
| `output-raw` | Set mode output ke raw (tanpa filter) |
| `clean` | Alias `output-clean` |
| `rawmode` | Alias `output-raw` |

---

## 🔐  Sesi & Informasi

| Perintah | Deskripsi |
|----------|-----------|
| `login` | Login ke sesi terminal |
| `logout` | Logout dari sesi |
| `whoami` | Tampilkan username saat ini |
| `date` | Tampilkan tanggal & waktu |
| `help` | Daftar semua perintah tersedia |
| `shortcuts` | Tampilkan shortcut keyboard & perintah |
| `update-user <username>` | Set username via argumen |
| `prompt` | Set username via prompt interaktif |

---

## 🛠️  Development Extension

| Perintah | Deskripsi |
|----------|-----------|
| `nx dev` | Wizard pembuatan extension developer (termasuk pilih template: blank / CRUD App / API Service) |
| `nx bundle` | Bundle extension developer |
| `nx test` | Jalankan `test.js` di working directory aktif via Node.js |
| `mode <subcommand>` | Development testing mode (subcommand = nama file `.js` di folder `mode/`) |

---

## 🌐  API Console

| Perintah | Deskripsi |
|----------|-----------|
| `api` | HTTP request interaktif (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS + Auth) |

---

## 🤖  Agent CLI

| Perintah | Deskripsi |
|----------|-----------|
| `agent` | Kirim prompt ke NxCode Agent — AI bekerja langsung dari terminal (ketik `exit` atau `quit` untuk keluar) |

---

## 🧠  Claude CLI

| Perintah | Deskripsi |
|----------|-----------|
| `claude` | Buka sesi interaktif Claude CLI (ketik `exit` atau `quit` untuk keluar) |
| `claude <prompt>` | Kirim prompt langsung ke Claude CLI dan tampilkan hasilnya |

---

## 🔍  Debug & Problems

| Perintah | Deskripsi |
|----------|-----------|
| `debug` | Scan proyek aktif dan tampilkan syntax errors |
| `problems` | Tampilkan semua errors dari hasil debug terakhir |

---

## ⚙️  Sub-module Mode (dinamis)

Perintah `mode <nama>` akan me-load file `<nama>.js` dari folder `assets/modules/Terminal/mode/`.

File yang tersedia di folder `mode/`:
- `tree.js`
- `exploring.js`
- `debug.js`
- `npm.js`
- `exploringAI.js`
- `timeout.js`
- `confirm.js`
- `output.js`
- `raw.js`
- `exsampel.js`

---

## 🔄  File Operations (native shell alias)

> Perintah berikut di-register sebagai alias native shell di `app.min.js` dan `app.min.dev.js`:

`npm`, `npx`, `node`, `git`, `yarn`, `pnpm`, `rmdir`, `del`, `rd`, `mkdir`, `copy`, `move`, `xcopy`, `ren`, `type`, `fc`, `attrib`, `tree`, `robocopy`

---

> **Catatan:** Perintah native shell (npm, node, git, dll) di-forward ke shell sistem melalui IPC Electron (`terminalShellExec` / `terminalShellStream`) sehingga bisa menjalankan perintah apa pun yang tersedia di PATH sistem. Jika perintah tidak dikenal, terminal akan otomatis mencoba menjalankannya sebagai native shell command.
