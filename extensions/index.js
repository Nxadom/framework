/**
 * Template Developer Extension
 *
 * Cukup export default — framework yang handle registrasi.
 * Tidak perlu import registerDeveloperView.
 *
 * _loadFresh: fetch file fresh dari server setiap kali dipanggil,
 * bypass V8 module cache via Blob URL agar perubahan file langsung
 * terlihat saat Development Mode aktif tanpa restart aplikasi.
 */

async function _loadFresh(relPath) {
  const base = new URL('.', import.meta.url).href;
  const res = await fetch(base + relPath, { cache: 'no-store' });
  const code = await res.text();
  const blob = new Blob([code], { type: 'application/javascript' });
  const blobUrl = URL.createObjectURL(blob);
  const mod = await import(blobUrl);
  URL.revokeObjectURL(blobUrl);
  return mod;
}

export default {
  id: 'example',           // harus sama dengan viewId di package.json
  label: 'My Extension',   // nama di tab header
  description: 'v1.0.0 · Deskripsi singkat extension Anda',
  icon: 'folder-src',      // icon di tab panel (tanpa prefix 'icon-')
  iconType: 'file',        // 'file' atau 'material'

  async render(container) {
    const { renderSidebar } = await _loadFresh('sidebar.js');
    renderSidebar(container);
  },

  async renderTab(container, config) {
    const { renderPanel } = await _loadFresh('panel.js');
    renderPanel(container, config);
  },
};
