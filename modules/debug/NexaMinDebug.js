/**
 * NexaMinDebug — tangkap error modul JS dan tampilkan lokasi file bermasalah di layar.
 *
 * Cara aktifkan (cukup satu baris di App.js setelah import nxdom):
 *   NX.MinDebug();
 *
 * Untuk tampilkan error manual:
 *   NX.MinDebug.show('Judul', 'pesan', errObject);
 */

// ─── DOM ─────────────────────────────────────────────────────────────────────

let _box = null;
let _btn = null;

function _getBox() {
  if (_box && _box.isConnected) return _box;
  _box = document.createElement('div');
  _box.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0', 'bottom:0',
    'background:#1e1e1e', 'color:#f48771', 'font-family:monospace',
    'font-size:13px', 'padding:24px 28px', 'z-index:99999',
    'overflow:auto', 'white-space:pre-wrap', 'word-break:break-all',
    'line-height:1.6',
  ].join(';');
  _btn = document.createElement('button');
  _btn.textContent = '✕ Tutup';
  _btn.style.cssText = [
    'position:fixed', 'top:12px', 'right:16px',
    'background:#333', 'color:#ccc', 'border:1px solid #555',
    'padding:4px 14px', 'font-size:12px', 'cursor:pointer',
    'border-radius:4px', 'font-family:monospace', 'z-index:100000',
  ].join(';');
  _btn.onclick = () => { _box?.remove(); _btn?.remove(); _box = null; _btn = null; };
  document.body.appendChild(_box);
  document.body.appendChild(_btn);
  return _box;
}

function _write(text) {
  if (typeof document === 'undefined') return;
  _getBox().textContent += text;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

// "The requested module '../npm/index.js' does not provide an export named 'NexaNpm1'"
function _parseExportError(msg) {
  const m = String(msg || '').match(
    /module\s+['"]([^'"]+)['"]\s+does not provide an export named\s+['"]([^'"]+)['"]/i
  );
  return m ? { moduleFile: m[1], exportName: m[2] } : null;
}

function _extractLocations(msg, stack) {
  const combined = (msg || '') + '\n' + (stack || '');
  const locs = [];
  const re1 = /((?:https?|file):\/\/[^\s)'"<>]+?\.m?js(?::\d+(?::\d+)?)?)/g;
  let m;
  while ((m = re1.exec(combined)) !== null)
    if (!locs.includes(m[1])) locs.push(m[1]);
  const re3 = /['"]([^'"]+?\.m?js)['"]/g;
  while ((m = re3.exec(combined)) !== null)
    if (!locs.includes(m[1])) locs.push(m[1]);
  return locs;
}

// ─── Grep via debugHost.js IPC ───────────────────────────────────────────────

async function _grepImporter(exportName) {
  if (!window.electronAPI?.debugGrepImport) return null;
  try {
    const res = await window.electronAPI.debugGrepImport(exportName);
    return (res?.ok && res.hits?.length) ? res.hits : null;
  } catch (_) { return null; }
}

// ─── Show ─────────────────────────────────────────────────────────────────────

async function _show(title, msg, err) {
  const stack = err?.stack || '';
  const ts = new Date().toLocaleTimeString('id-ID');

  _write(`[${ts}] ⚠ ${title}\n\nPesan  : ${msg}\n`);
  if (stack) _write(`\nStack:\n${stack}\n`);

  const locs = _extractLocations(msg, stack);
  if (locs.length) {
    _write('\nLokasi modul:\n');
    locs.forEach(l => _write(`  → ${l}\n`));
  }

  const parsed = _parseExportError(msg);
  if (parsed) {
    _write(`\nMencari file yang mengimport '${parsed.exportName}'...\n`);
    const hits = await _grepImporter(parsed.exportName);
    if (hits) {
      _write('\nFile yang melakukan import bermasalah:\n');
      hits.forEach(l => _write(`  ✗ ${l}\n`));
    } else {
      _write(`  → tidak ditemukan via grep\n`);
    }
  }

  _write('\nCara debug:\n');
  _write('  1. Buka file di atas, perbaiki nama import\n');
  _write('  2. Reload setelah diperbaiki\n\n');
}

// ─── Aktivasi ─────────────────────────────────────────────────────────────────

let _active = false;

export function NexaMinDebug() {
  if (_active) return;
  _active = true;

  window.onerror = function (msg, src, line, col, err) {
    const detail = (msg || '')
      + (src  ? `\nFile  : ${src}` : '')
      + (line ? `\nBaris : ${line}${col ? ':' + col : ''}` : '');
    _show('Runtime Error', detail, err);
    return false;
  };

  window.addEventListener('unhandledrejection', (ev) => {
    const err = ev.reason;
    _show('Unhandled Promise Rejection', err?.message || String(ev.reason), err);
  });
}

NexaMinDebug.show = _show;
Object.defineProperty(NexaMinDebug, '_active', { get: () => _active });

/**
 * Dipanggil dari index.html satu kali — load App.js dan tangkap semua error load/parse.
 * Menggantikan <script type="module" src="/App.js"> agar error tidak diam-diam.
 *
 * Contoh di index.html:
 *   import('/assets/modules/debug/NexaMinDebug.js')
 *     .then(m => m.catchAppLoad('/App.js'));
 */
export async function catchAppLoad(appUrl) {
  // Aktifkan listener runtime dulu (onerror + unhandledrejection)
  NexaMinDebug();
  try {
    await import(appUrl);
  } catch (err) {
    await _show('Gagal memuat ' + appUrl, err?.message || String(err), err);
  }
}
