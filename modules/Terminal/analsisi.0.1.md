# NexaTerminal — Dokumentasi Modul

Modul terminal interaktif berbasis browser untuk aplikasi Electron Beranda. Terdiri dari dua layer: **UI layer** (`NexaTerminal`) dan **command engine** (`NexaCommand`).

---

## Struktur File

```
Terminal/
├── NexaTerminal.js        # Class utama: lifecycle, tema, context menu, paste sanitizer
├── app.min.js             # NexaCommand engine: semua perintah, autocomplete, history
├── bundle.min.js          # CommandLine & CommandRow (library inti UI terminal)
├── controllers.js         # Ambil credential oauth dari bucketsStore
├── shortcuts.js           # Daftar shortcut + command `shortcuts`
├── npm/index.js           # NexaNpm: animasi spinner saat npm/node berjalan
├── debug/index.js         # Command `debug` — scan syntax errors proyek
├── debug/problems.js      # Command `problems` — tampilkan hasil debug terakhir
├── mode/index.js          # Router `mode <subcommand>` — lazy-load mode/*.js
├── mode/*.js              # Sub-mode: raw, output, confirm, timeout, npm, debug, dll
├── developer/index.js     # `nx dev` — wizard pembuatan extension
├── developer/bundle/      # `nx bundle` — bundler extension
├── api/index.js           # Command `api` — HTTP request interaktif (API Console)
├── agent/index.js         # Command `agent` — percakapan AI langsung dari terminal
└── raw/index.js           # TabelRaw & createTableHTML — render tabel ASCII
```

---

## Cara Pakai

### Mode Panel (terintegrasi dockview)

```js
import { NexaTerminal } from './NexaTerminal.js';

const terminal = new NexaTerminal({ panelMode: true });
const html = await terminal.domView();
// html berisi <div id="..."> yang langsung bisa di-mount ke panel
container.innerHTML = html;
```

### Mode Modal (Ctrl+Z)

```js
const terminal = new NexaTerminal();
terminal.open();   // buka modal
terminal.close();  // tutup modal
```

### Keyboard Global (hanya mode modal)

| Shortcut | Aksi |
|---|---|
| `Ctrl + Z` | Buka terminal modal |
| `Ctrl + Shift + Z` | Buka terminal modal |
| `Ctrl + Shift + X` | Tutup terminal modal |

---

## Fitur Selesai

### 1. Command History (riwayat perintah)

- Riwayat disimpan ke IndexedDB store `bucketsCli` via `NXUI.ref.set`
- **Deduplication saat simpan:** command yang sama dengan entri terakhir tidak disimpan ulang
- **Deduplication saat load:** `hydrateCliHistory` membersihkan duplikat, hanya menyimpan versi terbaru per command unik
- Navigasi dengan `Arrow Up` / `Arrow Down`

### 2. Autocomplete (Tab)

- **Trigger:** tekan `Tab` saat mengetik di input terminal
- **Sumber kandidat (urutan prioritas):**
  1. History (`hist`) — command yang pernah dijalankan, paling relevan ditampilkan pertama
  2. Built-in commands (`cmd`) — semua command terdaftar via `addCommand`
- **UI dropdown** mengikuti tema internal (dark/light mode):
  - Dark: `--dm-bg-card`, `--dm-border`, `--dm-text-main`
  - Light: `--beranda-dv-surface`, `--beranda-dv-header-border`
- **Highlight prefix** — bagian yang sudah diketik di-bold dengan warna accent
- **Icon Material Symbols:** `history` (hijau) untuk riwayat, `terminal` (biru) untuk command
- **Posisi cerdas** — muncul di atas input jika dekat bawah layar, di bawah jika ada ruang
- **Keyboard navigation:**

| Tombol | Aksi |
|---|---|
| `Tab` | Buka dropdown / accept pilihan aktif |
| `↑` / `↓` | Navigasi item |
| `Enter` | Accept pilihan aktif |
| `Escape` | Tutup dropdown |
| Klik item | Accept langsung |

- **Implementasi:** patch `startNewCommand` + attach listener ke `commandEntry` dengan `capture: true` agar jalan sebelum handler bawaan `bundle.min.js`

### 3. Native Shell Streaming (PTY)

- Jalankan perintah shell Windows via `electronAPI.terminalShellStream`
- Output di-stream real-time baris per baris
- Dukungan proses interaktif: `npm start`, `npm run dev`, `npx expo start`
- **Ctrl+C** mengirim SIGINT ke proses PTY aktif
- Auto-detect proses interaktif — PTY mode vs single-run mode
- Output cleaner: strip ANSI escape, noise Windows CMD, prompt duplikat
- Mode output: `clean` (default, filter noise) / `raw` (output mentah)
- Last output disimpan ke `localStorage` key `nx-terminal-last-output`

### 4. Command: Navigasi Direktori

| Command | Deskripsi |
|---|---|
| `pwd` | Tampilkan direktori aktif |
| `cd <path>` | Pindah direktori (validasi via `electronAPI.discoveryReadFolder`) |
| `home` | Reset CWD ke `D:/` |
| `ls [path]` | Daftar isi direktori — format tabel PowerShell-style |
| `dir [path]` | Alias `ls` |

- CWD disimpan ke `localStorage` key `nx-terminal-active-cwd`
- Path-like input (misal `D:\project`) otomatis di-wrap jadi `cd D:\project`
- `ls` / `dir` menggunakan IPC `nexa-terminal-ls` (via `electronAPI.terminalLs`) yang membaca `fs.stat` per entry
- Output tabel berkolom: `Mode` · `LastWriteTime` · `Length` · `Name` — mengikuti format `Get-ChildItem` PowerShell
- Direktori berwarna cyan, file berwarna teks normal; warna menyesuaikan dark/light mode

### 5. Command: Server & Preview

| Command | Deskripsi |
|---|---|
| `run [file.html]` | Buka file HTML di preview window Electron |
| `run mobile [url]` | Buka URL/HTML di panel webview mobile |
| `mobile [url]` | Alias `run mobile` |

- Auto-deteksi Node.js project (`package.json`, `server.js`, `app.js`)
- Auto-open browser window saat server siap di port tertentu
- Port conflict detection + auto-free sebelum start

### 6. Shell Selector & Perilaku Per Shell

Dropdown shell tersedia di header terminal (kanan atas). Pilihan disimpan ke `localStorage` key `beranda-terminal-active-shell`.

| Shell ID | Label | Prompt |
|---|---|---|
| `default` / `cmd` | Command Prompt | `D:\path>` |
| `powershell` | Windows PowerShell | `PS D:\path>` |
| `pwsh` | PowerShell (Core) | `PS D:\path>` |
| `bash` | Bash (WSL) | `$ D:\path>` |
| `git-bash` | Git Bash | `$ D:\path>` |
| `zsh` | Zsh | `% D:\path>` |
| `fish` | Fish | `> D:\path>` |

**Cara spawn per shell (`discoveryHost.js`):**

| Shell | Executable | Flag |
|---|---|---|
| `powershell` | `powershell.exe` (path System32 absolut) | `-NoLogo -NonInteractive -Command` |
| `pwsh` | `pwsh.exe` | `-NoLogo -NonInteractive -Command` |
| `cmd` / `default` | `cmd.exe` (`%ComSpec%`) | `/d /s /c` |
| `bash` | `bash.exe` | `-c` |
| `git-bash` | `C:\Program Files\Git\bin\bash.exe` | `-c` |
| `zsh` | `/bin/zsh` | `-c` |
| `fish` | `/usr/bin/fish` | `-c` |

- Spawn langsung tanpa opsi `shell:` Node.js — flag disesuaikan per shell agar command diterima dengan benar
- PTY interaktif (`npm start`, `expo start`): PowerShell dikirim `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`, shell lain `chcp 65001 >nul`

**Routing command:**

- Command tidak terdaftar (`$PSVersionTable`, `Get-Process`, `echo $HOME`, dll.) → otomatis diteruskan ke shell aktif via `runNativeShellCommand`
- `ls` / `dir` tanpa flag → internal tabel (konsisten di semua shell)
- `ls -la`, `ls --color`, `dir /w` (ada flag) → diteruskan ke native shell aktif
- Prompt di terminal menyesuaikan shell aktif secara otomatis (dibaca dari `localStorage` tiap baris baru)

### 7. Command: npm / Node.js

Command berikut diteruskan langsung ke native shell:

`npm`, `npx`, `node`, `git`, `yarn`, `pnpm`, `rmdir`, `del`, `rd`, `mkdir`, `copy`, `move`, `xcopy`, `ren`, `type`, `fc`, `attrib`, `tree`, `robocopy`, `rm`

- `npm start` mendapat perlakuan khusus:
  - Inject `--user-data-dir` untuk Electron app agar tidak konflik cache
  - Auto-detect port Expo dan free port jika sudah terpakai

### 8. Command: Debug & Problems

| Command | Deskripsi |
|---|---|
| `debug` | Scan proyek aktif, tampilkan syntax errors |
| `problems` | Tampilkan semua error dari hasil `debug` terakhir |

### 9. Command: Developer Extension (nx)

| Command | Deskripsi |
|---|---|
| `nx dev` | Wizard interaktif pembuatan extension |
| `nx bundle` | Bundle extension developer |

### 10. Command: Output & Session

| Command | Deskripsi |
|---|---|
| `output-mode [clean\|raw]` | Set/get mode output |
| `output-clean` / `clean` | Mode output bersih |
| `output-raw` / `rawmode` | Mode output mentah |
| `clear` / `cls` | Bersihkan layar |
| `shell-stop` / `stop-shell` | Hentikan proses shell native aktif |
| `whoami` | Tampilkan username saat ini |
| `date` | Tampilkan tanggal & waktu |
| `help` | Daftar semua perintah |
| `shortcuts` | Tampilkan shortcut keyboard |
| `mode <subcommand>` | Lazy-load sub-mode dari `mode/*.js` |

### 11. Context Menu Klik Kanan

- **Copy** — salin teks terpilih
- **Paste** — tempel dari clipboard via `electronAPI.readClipboardText` (IPC, tanpa permission)
- **Select All** — pilih semua konten terminal
- **Add Chat** — kirim teks terpilih ke composer chat panel

### 12. Paste Sanitizer

- Intercept paste event — hanya sisipkan plain text, semua HTML tag dibuang
- Insert via Selection API agar tidak merusak contenteditable

### 13. Tema (Dark / Light)

- Deteksi otomatis via `.dark-mode-grid` class di `document.body`
- Sinkron dengan `MutationObserver` + event `beranda:settings-theme-changed` + `storage` event
- Autocomplete dropdown, NexaNpm spinner, semua mengikuti mode aktif

### 14. Terminal Inject Command (AI Chat Integration)

- Listener event `nexa-terminal-inject-command` — AI Chat bisa inject command ke terminal aktif
- Guard: blokir `taskkill /f /im node`, `killall node`, `pkill -f node`
- Target terminal spesifik via `hostId` dataset

### 15. API Console (`api`)

Command interaktif untuk membuat HTTP request langsung dari terminal.

**Cara pakai:**
- Ketik `api` di prompt terminal, atau klik tombol **API Console** di panel menu bawah

**Alur input:**
1. URL endpoint
2. Method (`GET` / `POST` / `PUT` / `PATCH` / `DELETE` / `HEAD` / `OPTIONS`) — default `GET`
3. Authorization (`Y/N`):
   - **Bearer Token** — masukkan token, dikirim sebagai `Authorization: Bearer <token>`
   - **Basic Auth** — masukkan username + password, di-encode Base64
   - **Custom Header** — nama header bebas + value
4. Ringkasan ditampilkan, konfirmasi kirim (`Y/N`)

**Output respons:**
- Status HTTP + waktu tempuh (ms)
- `Content-Type` header
- Body JSON di-render sebagai syntax-highlighted `<pre>` mengikuti tema aktif:
  - **Dark mode:** background `#12141a`, key `#56b6c2`, string `#a8cc8c`, number `#d19a66`
  - **Light mode:** background `var(--beranda-dv-surface)`, key `#0070a8`, string `#1a7a3a`, number `#b85c00`
- Respons non-JSON dibungkus `{ response: "..." }`

**Integrasi panel menu:**
- Tombol **API Console** di `templates/beranda.js` dispatch `nexa-terminal-inject-command` dengan `command: 'api'` ke terminal aktif — identik dengan mengetik `api` manual

**Keamanan:**
- Endpoint internal aplikasi (`urlApi`, `drive`, `rebit`, `publik` dari `config.js`) diblokir — validasi via `window.__NEXA_ENDPOINT__.internalOrigins`

**Placeholder animasi saat fetch:**
- Menggunakan `NexaNpm.renderStartStopWait` + `initStartStopWait` selama request berlangsung — UI tidak terblokir
- Animasi dihentikan dan baris progress dihapus setelah respons diterima

**Anti-scroll fix:**
- `startNewCommand` dan klik konten terminal tidak lagi auto-scroll ke bawah (patch `capture:true` + restore `scrollTop` di `app.min.js`)
- Ctrl+C juga tidak memicu scroll (scroll disimpan sebelum `startNewCommand` dipanggil)

### 16. Agent CLI (`agent`)

Command interaktif untuk percakapan langsung dengan NxCode AI dari terminal — tanpa perlu panel Chat aktif.

**Cara pakai:**
```
D:\project> agent
=== NxCode Agent ===
Ketik prompt. Ketik "exit" untuk keluar.

You: jelaskan isi file index.html ini
[AI menjawab...]

You: tambahkan meta description yang sesuai
[AI menulis patch ke file...]

You: exit
Agent ditutup.
D:\project>
```

**Arsitektur:**
- `agent/index.js` import `runAgentChatCompletion` langsung dari `templates/chat/AI/agent-executor.js` — tidak butuh panel Chat mount
- Percakapan disimpan per-terminal di `WeakMap` — history terisolasi, tidak bocor antar terminal
- Sesi berakhir saat user ketik `exit` / `quit`, atau tutup terminal
- `return false` ke bundle mencegah `stop()` dipanggil di antara giliran percakapan
- Callback chain `_agentLoop → _sendToAgent → _agentLoop` tanpa `startNewCommand()` di antaranya (pola `confirm.js`)

**NexaNpm placeholder:**
- Animasi spinner aktif selama AI memproses — UI tidak terblokir
- Dihentikan otomatis setelah response diterima

**CWD context:**
- Membaca `localStorage` key `nx-terminal-active-cwd` → dipakai sebagai `editContext` (AI bisa baca & tulis file di folder aktif terminal)

**Output:**
- Teks biasa di-render dengan `<div>` per baris
- Code block (``` ... ```) di-render sebagai `<pre>` dengan background kontras
- Inline `` `code` `` di-render dengan `<code>` berwarna hijau

### 17. Expo Web Integration

Saat menjalankan `expo start` atau `npm start` (project Expo):
- Deteksi URL "Web is waiting on ..." dari stdout
- Tekan `w` → buka di Electron window baru
- Tekan `v` → buka di panel Webview Beranda

---

## CSS Variables yang Digunakan

| Variable | Kegunaan |
|---|---|
| `--dm-bg-card` | Background popup autocomplete (dark) |
| `--dm-bg-surface` | Background elemen surface (dark) |
| `--dm-border` | Border popup & scrollbar (dark) |
| `--dm-text-main` | Teks utama (dark) |
| `--dm-text-secondary` | Teks hint/label (dark) |
| `--dm-blue-accent` | Warna icon command + highlight prefix |
| `--dm-green-accent` | Warna icon history |
| `--dm-bg-hover` | Background hover item |
| `--beranda-dv-surface` | Background popup (light) |
| `--beranda-dv-header-border` | Border (light) |
| `--beranda-fg` | Teks (light) |
| `--beranda-dv-hover` | Hover (light) |
| `--beranda-dv-accent` | Accent highlight (light) |

---

## localStorage Keys

| Key | Isi |
|---|---|
| `nx-terminal-active-cwd` | CWD aktif terminal `{ cwd, ts }` |
| `nx-terminal-last-output` | Output command terakhir `{ command, cwd, output, exitCode, ts }` |
| `nx-terminal-output-mode` | Mode output: `"clean"` atau `"raw"` |
| `nx-discovery-editor-active` | Fallback path awal CWD dari editor aktif |
| `beranda-terminal-active-shell` | Shell aktif: `"default"`, `"powershell"`, `"pwsh"`, `"bash"`, `"git-bash"`, `"zsh"`, `"fish"` |

---

## Events

| Event | Arah | Payload |
|---|---|---|
| `nexa-terminal-state` | dispatch → window | `{ hostId, state, cwd, requestId }` |
| `nexa-terminal-inject-command` | listen ← window | `{ hostId, command }` |
| `nexa-open-webview-panel` | dispatch → window | `{ url }` |
| `beranda:settings-theme-changed` | listen ← window | — |

> **Catatan:** Event `nexa-terminal-agent-prompt / delta / done / error` telah dihapus. Command `agent` kini menggunakan import langsung ke `runAgentChatCompletion` — tidak memerlukan event bus atau panel Chat aktif.
