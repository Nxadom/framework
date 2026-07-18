import { NexaNpm } from '../npm/index.js';

const TEMPLATE_OPTIONS = [
  { key: 'blank', desc: 'Extension kosong (hanya scaffold dasar)' },
  { key: 'crud',  desc: 'CRUD App — Canonical + Orchestrator + Schema minimal' },
  { key: 'api',   desc: 'API Service — API Gateway + Schema terhubung' },
];

const PLACE_OPTIONS = [
  { key: 'activity-bar', desc: 'Sidebar kiri (Activity Bar)' },
  { key: 'packages',     desc: 'Panel Packages (tengah bawah)' },
  { key: 'edge',         desc: 'Panel Edge kanan (dockview)' },
];

const ICONCLASS_OPTIONS = [
  { key: 'icon-folder-controller', desc: 'folder controller  (default)' },
  { key: 'icon-folder-src',        desc: 'folder source' },
  { key: 'icon-folder-vendor',     desc: 'folder vendor / packages' },
  { key: 'icon-folder-lib',        desc: 'folder library' },
  { key: 'icon-folder-config',     desc: 'folder config' },
  { key: 'icon-folder-components', desc: 'folder components' },
  { key: 'icon-folder-api',        desc: 'folder API' },
  { key: 'icon-folder-assets',     desc: 'folder assets / resources' },
  { key: 'icon-folder-dist',       desc: 'folder dist / build' },
  { key: 'icon-folder-node',       desc: 'folder node / runtime' },
];

// iconType: 'material' → Material Symbols font (nama harus ada di Google Material Symbols)
// iconType: 'file'     → file icon SVG dari assets/modules/icons/file.css
const ICON_OPTIONS = [
  { key: 'assistant_navigation', iconType: 'material', desc: 'Navigasi  (default)' },
  { key: 'widgets',              iconType: 'material', desc: 'Widgets' },
  { key: 'package_2',           iconType: 'material', desc: 'Package' },
  { key: 'extension',           iconType: 'material', desc: 'Extension / plugin' },
  { key: 'code',                iconType: 'material', desc: 'Code / editor' },
  { key: 'settings',            iconType: 'material', desc: 'Pengaturan' },
  { key: 'folder_code',         iconType: 'material', desc: 'Folder code' },
  { key: 'box',                 iconType: 'material', desc: 'Box' },
  { key: 'folder-src',          iconType: 'file',     desc: 'Folder source (file icon)' },
  { key: 'folder-controller',   iconType: 'file',     desc: 'Folder controller (file icon)' },
];

function showMenu(cmd, title, options) {
  cmd.output('');
  cmd.output(`  ${title}`);
  cmd.output('');
  options.forEach((opt, i) => {
    const num = String(i + 1).padStart(2);
    cmd.output(`  ${num}.  ${opt.key.padEnd(28)} ${opt.desc}`);
  });
  cmd.output('');
}

function resolveChoice(input, options, defaultIndex = 0) {
  const raw = String(input || '').trim();
  if (!raw) return options[defaultIndex].key;
  const n = parseInt(raw, 10);
  if (!isNaN(n) && n >= 1 && n <= options.length) return options[n - 1].key;
  const found = options.find((o) => o.key === raw);
  if (found) return found.key;
  return null;
}

export async function developer(cmd = false) {
  try {
    const steps = {};
    const repodev = String(cmd.workingDirectory || '').trim();

    const finish = async () => {
      const npmUi = new NexaNpm();
      let progressShown = false;

      const _destroyProgress = () => {
        if (!progressShown) return;
        progressShown = false;
        npmUi.destroy();
        try { cmd.commandRow?.commandRow?.remove(); } catch (_) {}
        cmd.commandRow = null;
      };

      try {
        await npmUi.ensureStylesheet();
        const progressHtml = npmUi.renderInstalNexaJs({
          pack: steps.appName,
          ref:  'dev',
          spec: `${steps.appName}@new`,
        });
        cmd.output(progressHtml);
        progressShown = true;
        if (cmd.commandRow) {
          cmd.commandRow.hideTime();
          cmd.commandRow.commandEntry.classList.add('block');
        }
        const entryEl = cmd.commandRow?.commandEntry;
        if (entryEl) {
          npmUi.initInstal(entryEl, {
            pack:      steps.appName,
            ref:       'dev',
            targetDir: repodev,
          });
        }
      } catch (_) {}

      try {
        const result = await window.electronAPI.developerCreateExtension({
          appName:     steps.appName,
          title:       steps.title,
          description: steps.description,
          author:      steps.author,
          version:     steps.version,
          place:       steps.place,
          iconClass:   steps.iconClass,
          icon:        steps.icon,
          iconType:    steps.iconType || 'material',
          template:    steps.template || 'blank',
          token:       steps.token || '',
          repodev,
        });
        _destroyProgress();
        if (result.ok) {
          cmd.output('');
          cmd.output('  ✓  Extension berhasil dibuat');
          cmd.output('');
          cmd.output(`  Location : ${repodev}\\${steps.appName}`);
          cmd.output(`  View ID  : ${steps.appName}`);
          cmd.output(`  Template : ${steps.template || 'blank'}`);
          cmd.output(`  Place    : ${steps.place}`);
          cmd.output(`  iconClass: ${steps.iconClass}`);
          cmd.output(`  Icon     : ${steps.icon}  (${steps.iconType || 'material'})`);
          if (result.gitInit)      cmd.output('  Git      : ✓ git init selesai');
          if (result.gitInitError) cmd.output(`  Git      : ⚠ ${result.gitInitError}`);
          cmd.output('');
          cmd.output('  Langkah selanjutnya:');
          cmd.output('  1. Klik kanan folder extension di Explorer');
          cmd.output('     → pilih "Add Source Control"');
          cmd.output('  2. Buka Source Control (ikon graph di Activity Bar)');
          cmd.output('     → temukan "Changes" → isi Pesan Commit');
          cmd.output('     → klik "Commit & Push Semua File"');
          cmd.output('  3. Setelah push, buka Developer Panel → Install Extension');
          cmd.output('     → masukkan Repository URL Git hasil push');
          cmd.output('');
        } else {
          cmd.error(`Error: ${result.error || 'Gagal membuat extension'}`);
        }
      } catch (err) {
        _destroyProgress();
        cmd.error(`Error: ${err?.message || err}`);
      }
      cmd.startNewCommand();
    };

    // ── Step 9: GitHub Access Token (opsional) ──────────────────────────
    const askToken = async () => {
      // Cek token tersimpan di SourceControl (bucketsStore → git-oauth)
      let savedToken = '';
      let savedUser  = '';
      try {
        const oauth = await NXUI.ref.get('bucketsStore', 'git-oauth');
        savedToken  = String(oauth?.access_token || oauth?.token || '').trim();
        savedUser   = String(oauth?.username || '').trim();
      } catch (_) {}

      if (savedToken) {
        cmd.output('');
        cmd.output(`  ✓  Token GitHub ditemukan${savedUser ? ` (${savedUser})` : ''} — digunakan otomatis.`);
        steps.token = savedToken;
        finish();
        return;
      }

      cmd.output('');
      cmd.output('  GitHub Access Token (opsional)');
      cmd.output('  Format: ghp_xxxxxxxxxxxxxxxxxxxx');
      cmd.output('  Token dipakai untuk git init + simpan konfigurasi push.');
      cmd.output('  Tekan Enter untuk lewati (tidak ada git init).');
      cmd.output('');
      cmd.secret('Token (ghp_...):', (input) => {
        const raw = String(input || '').trim();
        if (raw && !raw.startsWith('ghp_') && !raw.startsWith('github_pat_')) {
          cmd.error('Token tidak valid — harus diawali ghp_ atau github_pat_');
          askToken();
          return;
        }
        steps.token = raw;
        finish();
      });
    };

    // ── Step 8: Icon Activity Bar ────────────────────────────────────────
    const askIcon = (input) => {
      const choice = resolveChoice(input, ICON_OPTIONS, 0);
      if (!choice) {
        cmd.error(`Pilihan tidak valid. Masukkan angka 1-${ICON_OPTIONS.length}.`);
        showMenu(cmd, 'Pilih Icon (Activity Bar):', ICON_OPTIONS);
        cmd.prompt(`Icon [1-${ICON_OPTIONS.length}] (default: 1):`, askIcon);
        return;
      }
      const opt = ICON_OPTIONS.find((o) => o.key === choice);
      steps.icon = choice;
      steps.iconType = opt?.iconType ?? 'material';
      askToken();
    };

    const promptIcon = () => {
      showMenu(cmd, 'Pilih Icon (Activity Bar):', ICON_OPTIONS);
      cmd.prompt(`Icon [1-${ICON_OPTIONS.length}] (default: 1):`, askIcon);
    };

    // ── Step 7: iconClass (Extensions Panel & Tab) ──────────────────────
    const askIconClass = (input) => {
      const choice = resolveChoice(input, ICONCLASS_OPTIONS, 0);
      if (!choice) {
        cmd.error(`Pilihan tidak valid. Masukkan angka 1-${ICONCLASS_OPTIONS.length}.`);
        showMenu(cmd, 'Pilih iconClass:', ICONCLASS_OPTIONS);
        cmd.prompt(`iconClass [1-${ICONCLASS_OPTIONS.length}] (default: 1):`, askIconClass);
        return;
      }
      steps.iconClass = choice;
      promptIcon();
    };

    const promptIconClass = () => {
      showMenu(cmd, 'Pilih iconClass (ikon Extensions Panel & Tab):', ICONCLASS_OPTIONS);
      cmd.prompt(`iconClass [1-${ICONCLASS_OPTIONS.length}] (default: 1):`, askIconClass);
    };

    // ── Step 6: Place ────────────────────────────────────────────────────
    const askPlace = (input) => {
      const choice = resolveChoice(input, PLACE_OPTIONS, 0);
      if (!choice) {
        cmd.error(`Pilihan tidak valid. Masukkan angka 1-${PLACE_OPTIONS.length}.`);
        showMenu(cmd, 'Pilih Place:', PLACE_OPTIONS);
        cmd.prompt(`Place [1-${PLACE_OPTIONS.length}] (default: 1):`, askPlace);
        return;
      }
      steps.place = choice;
      promptIconClass();
    };

    const promptPlace = () => {
      showMenu(cmd, 'Pilih Place (lokasi tampil extension):', PLACE_OPTIONS);
      cmd.prompt(`Place [1-${PLACE_OPTIONS.length}] (default: 1):`, askPlace);
    };

    // ── Step 5b: Template Starter ────────────────────────────────────────
    const askTemplate = (input) => {
      const choice = resolveChoice(input, TEMPLATE_OPTIONS, 0);
      if (!choice) {
        cmd.error(`Pilihan tidak valid. Masukkan angka 1-${TEMPLATE_OPTIONS.length}.`);
        showMenu(cmd, 'Pilih Template:', TEMPLATE_OPTIONS);
        cmd.prompt(`Template [1-${TEMPLATE_OPTIONS.length}] (default: 1):`, askTemplate);
        return;
      }
      steps.template = choice;
      promptPlace();
    };

    const promptTemplate = () => {
      showMenu(cmd, 'Pilih Template Starter:', TEMPLATE_OPTIONS);
      cmd.prompt(`Template [1-${TEMPLATE_OPTIONS.length}] (default: 1):`, askTemplate);
    };

    // ── Step 5: Version ──────────────────────────────────────────────────
    const askVersion = (input) => {
      const raw = String(input || '').trim();
      if (raw && !/^\d+\.\d+(\.\d+)?$/.test(raw)) {
        cmd.error('Format versi tidak valid. Contoh: 1.0.0');
        cmd.prompt('Version (default: 1.0.0):', askVersion);
        return;
      }
      steps.version = raw || '1.0.0';
      promptTemplate();
    };

    // ── Step 4: Author ───────────────────────────────────────────────────
    const askAuthor = (input) => {
      steps.author = String(input || '').trim();
      cmd.prompt('Version (default: 1.0.0):', askVersion);
    };

    // ── Step 3: Description ──────────────────────────────────────────────
    const askDescription = (input) => {
      steps.description = String(input || '').trim();
      cmd.prompt('Author:', askAuthor);
    };

    // ── Step 2: Title ────────────────────────────────────────────────────
    const askTitle = (input) => {
      steps.title = String(input || '').trim() || steps.appName;
      cmd.prompt('Description:', askDescription);
    };

    // ── Step 1: App Name ─────────────────────────────────────────────────
    const askAppName = (input) => {
      const name = String(input || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!name) {
        cmd.error('App name tidak boleh kosong. Gunakan huruf kecil, angka, - atau _');
        cmd.prompt('App Name:', askAppName);
        return;
      }
      steps.appName = name;
      cmd.prompt(`Title (default: ${name}):`, askTitle);
    };

    if (!repodev) {
      cmd.error('Working directory tidak ditemukan.');
      cmd.output('  Gunakan perintah cd untuk berpindah ke folder project terlebih dahulu.');
      cmd.output('  Contoh: cd D:\\projects\\my-extension-folder');
      cmd.output('  Kemudian jalankan nxgo kembali.');
      cmd.startNewCommand();
      return false;
    }

    cmd.output('');
    cmd.output('  ┌─────────────────────────────────────┐');
    cmd.output('  │   Developer Extension               │');
    cmd.output('  └─────────────────────────────────────┘');
    cmd.output(`  Extension akan dibuat di: ${repodev}`);
    cmd.output('');
    cmd.prompt('App Name:', askAppName);
    return false;
  } catch (error) {
    console.error('Developer wizard error:', error);
    return null;
  }
}
