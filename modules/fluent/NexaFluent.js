// ─────────────────────────────────────────────────────────────────────────────
// NexaFluent — muat Fluent UI Web Components v2 (bahasa desain Fluent 2, dipakai
// Windows 11 Settings/File Explorer) sebagai custom elements native. Bundle
// di-vendor lokal (web-components.min.js, self-contained ESM, tanpa bare import)
// agar konsisten dengan pola vendoring library lain di assets/modules/ (chart,
// prism, dll) — proyek ini tidak punya bundler, jadi bare import "@fluentui/..."
// tidak bisa langsung dipakai di browser.
//
// Fluent v2 TIDAK auto-register elemen saat modul di-import — API resminya:
//   provideFluentDesignSystem().register(allComponents.fluentButton(), ...)
// (lihat allComponents di bundle: { fluentButton, fluentCard, fluentDialog, ... })
//
// Usage:
//   import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';
//   await defineFluent(['fluentButton', 'fluentCard', 'fluentTextField']);
//   container.innerHTML = `<fluent-button appearance="accent">Simpan</fluent-button>`;
//
// Referensi tag & API: https://learn.microsoft.com/en-us/fluent-ui/web-components/
// ─────────────────────────────────────────────────────────────────────────────

let _loadPromise = null;
const _registered = new Set();

function _loadBundle() {
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    const localUrl = new URL('./web-components.min.js', import.meta.url).href;
    try {
      return await import(/* @vite-ignore */ localUrl);
    } catch (err) {
      // Fallback CDN — hanya jika file lokal tidak ada/gagal (mis. belum di-vendor).
      const cdnUrl = 'https://cdn.jsdelivr.net/npm/@fluentui/web-components@2/dist/web-components.min.js';
      return import(/* @vite-ignore */ cdnUrl);
    }
  })();
  return _loadPromise;
}

/**
 * Muat bundle Fluent Web Components dan registrasikan komponen yang diminta.
 * Aman dipanggil berkali-kali — tiap nama komponen hanya di-register sekali.
 * @param {string[]} names — key di allComponents, mis. ['fluentButton', 'fluentCard', 'fluentDialog'].
 *   Nama tag HTML hasilnya otomatis kebab-case tanpa prefix "fluent": fluentButton → <fluent-button>.
 * @returns {Promise<void>}
 */
export async function defineFluent(names = []) {
  const mod = await _loadBundle();
  const toRegister = names.filter((n) => !_registered.has(n));
  if (!toRegister.length) return;

  const missing = toRegister.filter((n) => typeof mod.allComponents?.[n] !== 'function');
  if (missing.length) {
    console.warn('[NexaFluent] Komponen tidak dikenal di allComponents:', missing);
  }

  const defs = toRegister
    .filter((n) => typeof mod.allComponents?.[n] === 'function')
    .map((n) => mod.allComponents[n]());

  if (defs.length) {
    mod.provideFluentDesignSystem().register(...defs);
    toRegister.forEach((n) => _registered.add(n));
  }
}

/** Sudah pernah di-register lewat defineFluent (bukan cek langsung ke customElements). */
export function isFluentRegistered(name) {
  return _registered.has(name);
}
