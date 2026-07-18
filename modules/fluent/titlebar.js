// ─────────────────────────────────────────────────────────────────────────────
// Title bar custom Fluent — tampil HANYA saat jendela Electron aktif memakai
// titleBarStyle:'hidden' + titleBarOverlay (Windows 11). Di browser biasa (npm run
// server) atau platform lain, #nx-titlebar tetap hidden (frame native OS dipakai).
// Warna titleBarOverlay (tombol native) diselaraskan dengan dark-mode via
// window.electronAPI.setTitleBarTheme — sumber kebenaran tema: localStorage.darkMode
// / class 'dark-mode-grid' di body, sama seperti aturan tema di templates/README.md.
// ─────────────────────────────────────────────────────────────────────────────

async function initTitleBar() {
  const bar = document.getElementById('nx-titlebar');
  if (!bar) return;

  if (typeof window.electronAPI?.getWindowInfo !== 'function') {
    return; // Bukan Electron (browser biasa) — biarkan hidden.
  }

  let info;
  try {
    info = await window.electronAPI.getWindowInfo();
  } catch {
    return;
  }
  if (!info?.supportsTitleBarOverlay) {
    return; // macOS/Linux/Electron lama — frame native tetap dipakai.
  }

  bar.hidden = false;
  document.body.classList.add('nx-has-titlebar');

  const syncTheme = () => {
    const isDark = document.body.classList.contains('dark-mode-grid');
    window.electronAPI.setTitleBarTheme?.(isDark).catch(() => {});
  };
  syncTheme();

  const observer = new MutationObserver(syncTheme);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTitleBar, { once: true });
} else {
  initTitleBar();
}
