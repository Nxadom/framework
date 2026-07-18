# Analisis Terminal — NexaTerminal / NexaCommand
> Terakhir diperbarui: 2026-06-20 (tambahan phpserver: 2026-06-20)

---

## 1. Arsitektur Umum

```
NexaTerminal (class)          ← entry point UI / modal / panel
  └── NexaCommand.instance()  ← engine perintah (CommandLine dari bundle.min.js)
        └── app.min.js        ← registrasi semua perintah & logika shell
```

**File utama:**

| File | Peran |
|------|-------|
| `NexaTerminal.js` | Class wrapper: open modal, domView panel, theme sync, context menu, paste sanitizer, resize observer |
| `app.min.js` | Inti: register command, autocomplete, native shell stream, PS wrap, history |
| `bundle.min.js` | CommandLine + CommandRow (engine rendering terminal, tidak diubah) |
| `shortcuts.js` | Daftar shortcut + command `shortcuts` |
| `server/index.js` | Command: `run`, `target run`, `mobile` — preview HTML & Node.js server |
| `api/index.js` | Command: `api` — HTTP console interaktif |
| `agent/index.js` | Command: `agent` — AI agent loop dengan tool calls |
| `debug/index.js` | Command: `debug` — validasi sintaks proyek (JS, TS, HTML, CSS, JSON, dll.) |
| `debug/problems.js` | Command: `problems` — tampilkan error dari hasil debug terakhir |
| `npm/index.js` | NexaNpm — animasi loading (dipakai oleh api, agent, server) |
| `raw/index.js` | TabelRaw + createTableHTML |
| `mode/index.js` | Command: `mode` — development testing mode |
| `developer/index.js` | Command handler: `nx dev` |
| `developer/bundle/index.js` | Command handler: `nx bundle` |
| `controllers.js` | Auth credential resolver |

---

## 2. Semua Perintah Terdaftar

### Navigasi & Filesystem

| Perintah | Keterangan |
|----------|------------|
| `pwd` | Tampilkan working directory aktif |
| `cd <path>` | Pindah direktori (validasi via electronAPI.discoveryReadFolder) |
| `home` | Reset cwd ke `D:/` |
| `ls [path]` | List isi direktori (tabel PowerShell-style via electronAPI.terminalLs) |
| `dir [path]` | Alias `ls` |

### Terminal & Output

| Perintah | Keterangan |
|----------|------------|
| `clear` | Bersihkan layar |
| `cls` | Alias `clear` |
| `help` | Daftar semua command terdaftar |
| `shortcuts` | Tampilkan keyboard shortcuts |
| `output-mode [clean\|raw]` | Lihat/set mode output |
| `output-clean` | Mode clean (filter noise) |
| `output-raw` | Mode raw (tampilkan semua output mentah) |
| `clean` | Alias `output-clean` |
| `rawmode` | Alias `output-raw` |

### Shell Native

| Perintah | Keterangan |
|----------|------------|
| `shell-stop` | Hentikan proses shell native aktif (SIGINT) |
| `stop-shell` | Alias `shell-stop` |
| `rm <args>` | Hapus file via native shell |

**Alias native shell** (semua diroute ke `runNativeShellCommand`):

```
npm, npx, node, git, yarn, pnpm, rmdir, del, rd, mkdir, copy, move, xcopy, ren,
type, fc, attrib, tree, robocopy,
cat, touch, grep, find, mv, cp, rm, chmod, chown, curl, wget, ssh, scp,
ipconfig, ping, netstat, tasklist, sc, reg, sfc, chkdsk, diskpart, wmic,
set, setx, where, which, echo, ver, systeminfo, hostname,
powershell, pwsh,
code, python, python3, pip, pip3, cargo, go, java, javac, mvn, gradle,
dotnet, php, composer, ruby, gem, rails, make, cmake, gcc, g++, clang,
docker, docker-compose, kubectl, helm, terraform, ansible,
ffmpeg, convert, magick, openssl, gpg, tar, zip, unzip, 7z
```

### Sesi & Info

| Perintah | Keterangan |
|----------|------------|
| `date` | Tampilkan tanggal & waktu |
| `whoami` | Tampilkan username aktif |
| `prompt` | Set username via prompt interaktif |
| `update-user <username>` | Set username via argumen |
| `login` | Login (dari bundle/controllers) |
| `logout` | Logout |

### Server & Preview

| Perintah | Keterangan |
|----------|------------|
| `run [target]` | Jalankan HTML preview atau Node.js server (auto-deteksi package.json) |
| `run mobile [url]` | Buka di mobile webview panel |
| `target run` | Buka HTML preview di jendela baru |
| `mobile [url]` | Buka di mobile webview panel |
| `start [port]` | Jalankan server statik |
| `dev [port]` | Alias `start` |
| `stop [port]` | Hentikan server |
| `servers` | Daftar server aktif |
| `restart <port>` | Restart server |
| `devrun [stop]` | Run project dari editor aktif (baca `nx-discovery-editor-active`) |
| `phpserver [start\|stop\|status] [port]` | Kelola PHP built-in server, buka preview di browser panel internal |

### Pengembangan

| Perintah | Keterangan |
|----------|------------|
| `nx dev` | Wizard pembuatan extension |
| `nx bundle` | Bundle extension developer |
| `debug` | Scan proyek & validasi sintaks semua file |
| `problems` | Tampilkan error dari hasil debug terakhir (dari NXUI.ref 'debug') |
| `mode <args>` | Development testing mode |
| `api` | HTTP console interaktif (URL → Method → Auth → Body → Kirim) |
| `agent` | AI agent loop — bekerja langsung dari terminal |
| `claude [prompt]` | Claude CLI — non-interaktif atau loop interaktif |

---

## 3. Logika `cmd.run()` — Alur Eksekusi Perintah

```
User ketik + Enter
  │
  ├─ shouldTreatInputAsPathLike? → wrap jadi `cd <input>`
  │
  ├─ Perintah terdaftar di cmd.commands?
  │    └─ Ya → origRun(effectiveCommand)
  │
  ├─ firstWord bukan builtins (cd, home, help, clear, cls, pwd, login, logout, date,
  │   whoami, shortcuts, output-mode, output-clean, output-raw, clean, raw,
  │   shell-stop, stop-shell)?
  │    └─ Ya → runNativeShellCommand(raw)  ← semua perintah PS/shell lain masuk sini
  │
  └─ Fallback → origRun(effectiveCommand)
```

---

## 4. Native Shell Streaming (`runNativeShellCommand`)

1. Cek API availability (`terminalShellStream`, `onTerminalShellData`, `onTerminalShellExit`)
2. Guard khusus `npm start`: baca `package.json`, inject `--user-data-dir` untuk Electron app, cek/bebaskan port Expo
3. **`wrapForActiveShell(command)`** — wrap PS syntax ke `powershell -Command "..."` (lihat Perbaikan #6)
4. Buat `requestId` unik, set `activeShellRequestId`
5. Deteksi interactive session (npm start, expo, dll.) → set `interactiveSession`
6. Stream data via `onTerminalShellData` → `ingestTerminalChunk` → render baris per baris
7. Exit via `onTerminalShellExit` → flush buffer, cleanup, dispatch state

**Output modes:**
- `clean` (default): filter noise cmd.exe (prompt, chcp, copyright lines)
- `raw`: tampilkan semua output apa adanya

---

## 5. Autocomplete

- **Tab** → trigger/accept autocomplete
- **Arrow Up/Down** → navigasi item
- **Enter** → accept
- **Escape** → tutup
- Sumber kandidat: riwayat command (prioritas) + nama command terdaftar
- Popup `.nexa-ac-popup` fixed position, pintar posisi atas/bawah entry

---

## 6. History CLI

- Disimpan ke NXUI.ref store `'bucketsCli'`
- Deduplikasi berurutan (skip jika sama dengan entri terakhir)
- Di-hydrate saat instance dibuat via `NexaCommand.hydrateCliHistory(cmd)`
- Navigasi dengan Arrow Up/Down di input

---

## 7. Fitur Khusus NexaTerminal.js

| Fitur | Detail |
|-------|--------|
| Theme sync | MutationObserver + storage event → sinkronkan class `light`/dark |
| Context menu | Copy, Paste (via electronAPI.readClipboardText), Select All, Add Chat |
| Paste sanitizer | Strip HTML dari clipboard, insert plain text saja |
| Focus retention | Klik di terminal → refocus ke active command entry |
| Resize observer | Auto-adjust layout saat panel di-resize |
| Panel mode | `_panelMode: true` → tidak daftarkan global shortcut Ctrl+Z/X |
| Shortcut modal | Ctrl+Z / Ctrl+Shift+Z → open, Ctrl+Shift+X → close (modal mode saja) |
| `destroy()` | Cleanup semua listener — dipanggil saat panel di-unmount |
| `refit()` | Paksa ulang layout — berguna setelah resize eksternal |

---

## 8. Debug Command — Validator Sintaks

`debug/index.js` mendukung validasi sintaks untuk:

```
.js .jsx .mjs .cjs   → new Function() + regex keyword check
.ts .tsx .mts .cts   → TypeScript stripped parse
.html .htm           → Tag nesting validator
.css .scss .less .sass → Brace balance checker
.json .jsonc         → JSON.parse()
.py                  → Indentation validator
.php                 → Brace + semicolon + undeclared var
.sh .bash            → Quote balance
.bat .cmd            → Quote balance
.ps1                 → Brace/paren/bracket balance
.sql                 → Paren balance
.xml                 → Tag nesting
.yaml .yml           → Blank line indentation check
.toml .ini .cfg      → key=value format check
.vue .svelte         → Template (HTML) + script (JS)
.md .mdx             → Code fence balance
.env .env.example    → KEY=value format
.rb .go .rs .java .kt .swift → Comment-aware brace check
```

Static analysis (semua file kode):
- `console.log` tertinggal
- TODO/FIXME/XXX
- Baris terlalu panjang (>200 char)
- Empty catch block
- `@ts-ignore` suppressions
- `any` type (TS)
- Magic numbers
- Deeply nested callbacks
- Undeclared variable references (JS, PHP)

---

## 9. Agent Command

- Session per terminal container (`WeakMap`)
- Thread pruning otomatis saat estimasi token >60k
- Inject CWD ke system prompt + aturan wajib path absolut
- Tool labels: `read_file`, `write_file`, `list_files`, `search_code`, `run_terminal`, dll.
- Output di-render via `NexaMarkdown.fromContent().Chat(wrapper)`
- Dynamic import `runAgentChatCompletion` dari `templates/chat/AI/agent-executor.js`

---

## 10. API Console Command

Alur interaktif:
1. Prompt URL
2. Prompt Method (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS)
3. Confirm: ada Authorization?
4. Jika ya → pilih Bearer / Basic Auth / Custom Header
5. Tampilkan ringkasan → confirm kirim
6. `fetch()` dengan animasi NexaNpm loading
7. Output status + JSON viewer

---

## 11. Perbaikan Terakhir (2026-06-20) — Dukungan Semua Perintah PowerShell

### Root Cause
`discoveryHost.js` menggunakan `spawn(cmd, { shell: true })` yang di Windows default ke `cmd.exe`, sehingga perintah PowerShell murni (cmdlet Verb-Noun, alias PS, variabel `$`, operator `-eq`, dll.) **gagal dieksekusi**.

### Solusi (di `app.min.js`)

**a) `getActiveShell()`**
Helper function membaca `localStorage['beranda-terminal-active-shell']`.

**b) `_psAliases` (Set)**
Berisi alias PS bawaan yang tidak ada di cmd.exe:
`gci, gal, gcm, iex, ls, mv, rm, select, where, write, echo, dir, fc, foreach, ...` (50+ alias)

**c) `isPsNativeSyntax(text)`**
Deteksi apakah perintah mengandung sintaks PS murni:
- Pattern `Verb-Noun` (Get-Item, Set-Location, Write-Host, dll.)
- PS alias dari `_psAliases`
- Variabel PS (`$var`, `$env:PATH`, `${}`)
- Operator PS (`-eq`, `-ne`, `-like`, `-match`, dll.)
- Pipeline dengan cmdlets
- Keyword PS (`>$null`, `Out-Null`, `ForEach-Object`, dll.)

**d) `wrapForActiveShell(command)`**
Jika shell aktif `powershell` atau `pwsh` dan `isPsNativeSyntax` true:
```
powershell -NoProfile -NonInteractive -Command "<escaped-command>"
```
Tidak wrap ulang jika sudah di-wrap. Escape `\` dan `"` sebelum wrap.

**e) Dipanggil di `runNativeShellCommand`**
```js
execCommand = wrapForActiveShell(execCommand);
```
Sebelum dikirim ke `terminalShellStream`.

**f) `getActiveShell()` menggantikan inline IIFE**
Di baris `shell: getActiveShell()` pada `terminalShellStream` call.

**g) Extended native shell aliases**
Ditambahkan puluhan perintah baru ke `registerNativeShellAlias`:
- Unix: `cat`, `touch`, `grep`, `find`, `mv`, `cp`, `chmod`, `chown`, `curl`, `wget`, `ssh`, `scp`
- Windows: `ipconfig`, `ping`, `netstat`, `tasklist`, `sc`, `reg`, `sfc`, `chkdsk`, `wmic`, `set`, `setx`, `where`, `which`, `echo`, `ver`, `systeminfo`, `hostname`
- PowerShell binary: `powershell`, `pwsh`
- Dev tools: `code`, `python`, `python3`, `pip`, `cargo`, `go`, `java`, `dotnet`, `php`, `composer`, `ruby`, `docker`, `docker-compose`, `kubectl`, `helm`, `terraform`, `ffmpeg`, `openssl`, `gpg`, `tar`, `zip`, `unzip`, `7z`, dll.

### Cara Kerja Setelah Perbaikan

```
User ketik: Get-ChildItem .\src | Where-Object { $_.Name -like "*.js" }
  │
  ├─ cmd.run() → tidak terdaftar → runNativeShellCommand(raw)
  │
  ├─ wrapForActiveShell() → shell = 'powershell'
  │   isPsNativeSyntax() = true (Verb-Noun + $_ + -like)
  │   → execCommand = 'powershell -NoProfile -NonInteractive -Command "Get-ChildItem .\src | ..."'
  │
  └─ terminalShellStream({ command: execCommand, shell: 'powershell' })
       → cmd.exe spawn → jalankan powershell -Command ... → stream output ke terminal ✓
```

---

## 12. Shell Selector — Dropdown di Header Terminal

### Lokasi
`templates/beranda.js` ~L797 — dibuat saat `terminalGroup` terdeteksi di header dockview.

### Storage Key
```
localStorage['beranda-terminal-active-shell']
```

### Opsi yang tersedia
| Value | Label |
|-------|-------|
| `default` | Default Shell |
| `powershell` | Windows PowerShell |
| `cmd` | Command Prompt |
| `git-bash` | Git Bash |
| `pwsh` | PowerShell Core (jika terdeteksi) |

Shell yang muncul dideteksi async via `window.electronAPI.terminalDetectShells()`.

### Cara Kerja
```
User pilih shell di dropdown
  │
  └─ localStorage.setItem('beranda-terminal-active-shell', value)
       ← HANYA menyimpan, TIDAK restart terminal

Perintah berikutnya diketik
  │
  ├─ getActiveShell() → baca localStorage real-time
  ├─ wrapForActiveShell(command) → wrap jika perlu
  └─ terminalShellStream({ shell: getActiveShell() })
```

### Penting
- **Tidak ada restart terminal otomatis** saat ganti shell
- Efek berlaku pada **perintah berikutnya** yang diketik
- Backend (`discoveryHost.js`) tetap `spawn({ shell: true })` = selalu cmd.exe
- Perbedaan antar shell hanya di layer **frontend wrapping** (`wrapForActiveShell`)
- Prompt label di CommandRow juga berubah sesuai shell:
  - `powershell` / `pwsh` → prefix `PS `
  - `bash` / `git-bash` → prefix `$ `
  - `zsh` → prefix `% `
  - `fish` → prefix `> `
  - lainnya → tanpa prefix

### Kapan Wrap Terjadi
| Shell dipilih | Perintah PS-syntax | Hasil |
|---|---|---|
| `powershell` / `pwsh` | Ya (`Get-Item`, `$var`, `-eq`, dll.) | Wrap jadi `powershell -Command "..."` |
| `powershell` / `pwsh` | Tidak (cmd biasa) | Dikirim apa adanya |
| `default` / `cmd` / `git-bash` | Apapun | Dikirim apa adanya |

---

---

## 13. PHP Server Manager (2026-06-20)

### Latar Belakang

Saat user menjalankan `php -S localhost:8001` dari terminal biasa, browser membuka `localhost:8001` — tapi asset (CSS, JS, gambar) sering 404 karena PHP built-in server tanpa router tidak memetakan path dengan benar, atau MIME type salah.

### Solusi

Perintah `phpserver` menjalankan PHP server via Electron main process dan membuka hasilnya di **browser panel internal** — sehingga semua asset ter-serve lewat PHP itu sendiri tanpa hambatan.

### File yang Terlibat

| File | Peran |
|------|-------|
| `electron/phpServerprocess.js` | Main process: spawn PHP, track server, router auto-detect, fallback router |
| `electron/main.js` | Register `registerPhpServerIpc`, cleanup saat quit |
| `electron/preload.js` | Expose `phpServerStart`, `phpServerStop`, `phpServerStatus`, `phpServerPreview` |
| `assets/modules/Terminal/app.min.js` | Perintah `phpserver` terdaftar via `cmd.addCommand` |

### IPC Channels

| Channel | Payload | Keterangan |
|---------|---------|------------|
| `nexa-php-server-start` | `{ cwd, port?, phpBin? }` | Spawn PHP server, return `{ ok, pid, url, port, router, routerIsExternal }` |
| `nexa-php-server-stop` | `{ port? }` | Stop server di port tertentu, atau semua jika tanpa port |
| `nexa-php-server-status` | `{ port? }` | Status satu port atau list semua server aktif |
| `nexa-php-server-preview` | `{ cwd, port?, phpBin?, title? }` | Start + buka BrowserWindow (tidak dipakai lagi, diganti browser panel) |

### Router PHP — Auto-detect

`phpServerprocess.js` mencari router secara otomatis dengan urutan prioritas:

1. `router.php` — di root folder project langsung
2. `system/bin/router.php` — pola framework PHP
3. `public/router.php`
4. `src/router.php`

**Jika tidak ada router sama sekali** → Electron generate `nexa-php-router.php` di `os.tmpdir()` sebagai fallback. Router ini menangani MIME type lengkap: JS, MJS, CSS, PNG, JPG, SVG, WOFF2, font, PDF, video, dll. — identik dengan router user.

### Alur Eksekusi `phpserver start 8002`

```
User ketik: phpserver start 8002
  │
  ├─ cmd.run() → terdaftar → callback phpserver args*
  │
  ├─ api.phpServerStart({ cwd: shellCwd, port: 8002 })
  │   └─ IPC nexa-php-server-start → main process
  │       ├─ resolveRouterScript(root) → cari router.php
  │       ├─ Jika tidak ada → ensureFallbackRouter() → tulis ke tmpdir
  │       ├─ spawn('php', ['-S', '127.0.0.1:8002', '-t', root, routerPath])
  │       ├─ waitForPort(8002, 3000ms) → poll TCP sampai siap
  │       └─ return { ok, pid, url, router, routerIsExternal }
  │
  ├─ cmd.output('[phpServer] Server aktif: http://127.0.0.1:8002 ...')
  │
  └─ window.dispatchEvent(new CustomEvent('nx-browser-open', { detail: { url } }))
       └─ beranda.js listener → openBerandaBrowserPanel() atau reuse panel yang ada
            └─ nx-browser-navigate → mount.js → safeLoadUrl(url)
                 → webview load http://127.0.0.1:8002 ✓
                 → semua asset dimuat via PHP router ✓
                 → riwayat tersimpan ke NXUI.ref 'browser' ✓
```

### Output Terminal

```
[phpServer] Memulai PHP server di "D:\project\dev" port 8002 …
[phpServer] Server aktif: http://127.0.0.1:8002  (PID 1234)  router: system/bin/router.php
```
atau jika tidak ada router:
```
[phpServer] Server aktif: http://127.0.0.1:8002  (PID 1234)  router: nexa-builtin
```

### Sub-perintah

| Perintah | Fungsi |
|----------|--------|
| `phpserver` / `phpserver start` / `phpserver start 8002` | Start server di CWD aktif, port auto atau spesifik |
| `phpserver stop` | Stop semua server |
| `phpserver stop 8002` | Stop server di port tertentu |
| `phpserver status` | List semua server aktif (port, PID, URL, CWD) |

---

## 14. Catatan Penting

- `discoveryHost.js` **DILARANG diubah** (dikunci final, memory: DiscoveryHost Locked)
- `bundle.min.js` tidak diubah — CommandLine/CommandRow engine murni
- Dynamic import wajib untuk dependency dari `templates/chat/` (memory: Dynamic Import Rule)
- `NexaTerminal._panelMode` mencegah shortcut global terdaftar dua kali saat terminal di-embed sebagai panel
- `interactiveSession` state dibagi antara keyboard handler container dan `runNativeShellCommand`
- Ctrl+C selalu dikirim sebagai `\x03` ke PTY aktif, atau cancel input jika tidak ada proses
