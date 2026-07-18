import { NexaNpm } from '../../npm/index.js';

export async function bundle(cmd) {
  try {
    const npmUi = new NexaNpm();
    let progressShown = false;

    const _destroyProgress = () => {
      if (!progressShown) return;
      progressShown = false;
      npmUi.destroy();
      try { cmd.commandRow?.commandRow?.remove(); } catch (_) {}
      cmd.commandRow = null;
    };

    // ── Tampilkan progress ───────────────────────────────────────────────
    try {
      await npmUi.ensureStylesheet();
      const progressHtml = npmUi.renderInstalNexaJs({
        pack: 'workspace.css',
        ref:  'bundle',
        spec: 'templates/**/*.css',
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
          pack:      'workspace.css',
          ref:       'bundle',
          targetDir: 'templates/',
        });
      }
    } catch (_) {}

    // ── Jalankan bundle via IPC ──────────────────────────────────────────
    let result;
    try {
      result = await window.electronAPI.developerBundleWorkspaceCss();
    } catch (err) {
      _destroyProgress();
      cmd.error(`Error: ${err?.message || err}`);
      cmd.startNewCommand();
      return;
    }

    _destroyProgress();

    if (!result?.ok) {
      cmd.error(`Bundle gagal: ${result?.error || 'unknown error'}`);
      cmd.startNewCommand();
      return;
    }

    const changed = (result.added?.length || 0) + (result.removed?.length || 0);
    if (changed > 0) {
      cmd.success(`Bundle selesai  ·  ${result.total} stylesheet  ·  ${changed} perubahan`);
    } else {
      cmd.success(`Bundle selesai  ·  ${result.total} stylesheet  ·  tidak ada perubahan`);
    }
  } catch (error) {
    console.error('bundle error:', error);
    cmd.error(`Error: ${error?.message || error}`);
    cmd.startNewCommand();
  }
}
