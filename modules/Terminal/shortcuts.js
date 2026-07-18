export const SHORTCUTS_LIST = [
  // ── Keyboard ────────────────────────────────────
  { keys: 'Ctrl + C',         desc: 'Cancel / stop proses (SIGINT)' },
  { keys: 'Arrow Up/Down',    desc: 'Navigasi riwayat perintah' },
  { keys: 'Tab',              desc: 'Autocomplete perintah' },

  // ── Navigasi direktori ──────────────────────────
  { keys: 'pwd',              desc: 'Tampilkan direktori aktif' },
  { keys: 'cd <path>',        desc: 'Pindah direktori' },
  { keys: 'home',             desc: 'Kembali ke direktori awal (D:/)' },
  { keys: 'ls [path]',        desc: 'Daftar isi direktori' },
  { keys: 'dir [path]',       desc: 'Alias ls' },

  // ── Server ──────────────────────────────────────
  { keys: 'start [port]',     desc: 'Jalankan server statik' },
  { keys: 'dev [port]',       desc: 'Alias start (development)' },
  { keys: 'stop [port]',      desc: 'Hentikan server' },
  { keys: 'servers',          desc: 'Lihat daftar server aktif' },
  { keys: 'restart <port>',   desc: 'Restart server berdasarkan port' },
  { keys: 'run <file.html>',  desc: 'Buka pratinjau HTML di jendela baru' },

  // ── Native shell ────────────────────────────────
  { keys: 'npm, npx, yarn, pnpm, git, node',
                               desc: 'Jalankan perintah native shell' },
  { keys: 'shell-stop',       desc: 'Hentikan proses shell native' },

  // ── Terminal output ─────────────────────────────
  { keys: 'output-mode',      desc: 'Atur mode output (clean/raw)' },
  { keys: 'output-clean',     desc: 'Mode output bersih (default)' },
  { keys: 'output-raw',       desc: 'Mode output mentah (tanpa filter)' },
  { keys: 'clear / cls',      desc: 'Bersihkan layar terminal' },

  // ── Sesi & info ─────────────────────────────────
  { keys: 'login',            desc: 'Login ke sesi terminal' },
  { keys: 'logout',           desc: 'Logout dari sesi' },
  { keys: 'whoami',           desc: 'Tampilkan username saat ini' },
  { keys: 'date',             desc: 'Tampilkan tanggal & waktu' },
  { keys: 'help',             desc: 'Daftar semua perintah tersedia' },

  // ── Pengembangan ────────────────────────────────
  { keys: 'nx dev',           desc: 'Wizard pembuatan extension' },
  { keys: 'nx bundle',        desc: 'Bundle extension developer' },

  // ── API Console ──────────────────────────────────
  { keys: 'api',              desc: 'HTTP request interaktif (URL → Method → Auth → Body → Kirim)' },

  // ── Agent CLI ────────────────────────────────────
  { keys: 'agent',            desc: 'Kirim prompt ke NxCode Agent — AI bekerja langsung dari terminal' },

  // ── Claude CLI ───────────────────────────────────
  { keys: 'claude [prompt]',  desc: 'Claude CLI — langsung atau mode interaktif (exit untuk keluar)' },

  // ── Debug & Problems ─────────────────────────────
  { keys: 'debug',            desc: 'Scan proyek aktif & validasi sintaks semua file' },
  { keys: 'problems',         desc: 'Tampilkan daftar error dari hasil debug terakhir' },

  // ── Shell selector ───────────────────────────────
  { keys: 'Dropdown header',  desc: 'Pilih shell aktif: Default / PowerShell / CMD / Git Bash' },
  { keys: 'shell-stop',       desc: 'Hentikan proses shell native aktif (SIGINT)' },
  { keys: 'stop-shell',       desc: 'Alias shell-stop' },

  // ── Mode & Devrun ────────────────────────────────
  { keys: 'mode <args>',      desc: 'Development testing mode' },
  { keys: 'devrun [stop]',    desc: 'Run/stop project dari editor aktif (baca package.json)' },

  // ── PHP Server ───────────────────────────────────
  { keys: 'phpserver',                   desc: 'Start PHP built-in server di folder aktif, buka di browser panel' },
  { keys: 'phpserver start [port]',      desc: 'Start PHP server (port auto jika tidak diberikan)' },
  { keys: 'phpserver stop [port]',       desc: 'Stop PHP server di port tertentu, atau semua' },
  { keys: 'phpserver status',            desc: 'Lihat daftar PHP server aktif (port, PID, URL, CWD)' },

  // ── Output mode ──────────────────────────────────
  { keys: 'output-mode',      desc: 'Lihat/set mode output: clean atau raw' },
  { keys: 'output-clean / clean', desc: 'Mode clean — filter noise cmd.exe (default)' },
  { keys: 'output-raw / rawmode', desc: 'Mode raw — tampilkan semua output apa adanya' },
];

export function registerShortcutsCommand(cmd) {
  if (!cmd || typeof cmd.addCommand !== 'function') return;

  cmd.addCommand('shortcuts', function () {
    // Flat array: [key1, desc1, key2, desc2, ...] untuk 2 kolom per baris
    const items = SHORTCUTS_LIST.flatMap((s) => [s.keys, s.desc]);

    cmd.listEnhanced(items, 2, {
      style: 'table',
      header: ['Perintah / Keys', 'Keterangan'],
    });
  }, 'Show keyboard shortcuts & commands');
}

// Alias
export { SHORTCUTS_LIST as shortcutsList, registerShortcutsCommand as shortcuts };


