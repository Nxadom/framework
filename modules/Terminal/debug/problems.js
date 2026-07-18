import { TabelRaw } from '../raw/index.js';

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Command "problems" — tampilkan semua error dari NXUI.ref.getAll('debug')
 * Format mirip VS Code Problems panel, ditampilkan di terminal via cmd.output()
 */
export async function problems(cmd) {
  try {
    const nx = globalThis.NXUI;
    if (!nx?.ref?.getAll) {
      cmd.error('NXUI.ref tidak tersedia.');
      return false;
    }

    const res = await nx.ref.getAll('debug');
    const records = Array.isArray(res?.data) ? res.data : [];

    if (records.length === 0) {
      cmd.success('✅  Tidak ada masalah yang ditemukan.');
      return false;
    }

    // Hitung total
    const totalErrors   = records.reduce((s, r) => s + (Number(r.totalErrors)   || 0), 0);
    const totalWarnings = records.reduce((s, r) => s + (Number(r.totalWarnings) || 0), 0);

    // Header ringkasan
    const summaryRows = [
      ['Metric', 'Value'],
      ['Directories scanned', String(records.length)],
      ['Total Errors',        String(totalErrors)],
      ['Total Warnings',      String(totalWarnings)],
    ];
    cmd.info('🔴  Problems');
    cmd.output(new TabelRaw(summaryRows).toString());

    // Detail per direktori
    for (const record of records) {
      const dir  = String(record.directory || record.directoryName || record.id || '—');
      const errs = Number(record.totalErrors   || 0);
      const warn = Number(record.totalWarnings || 0);

      if (errs === 0 && warn === 0) continue;

      const ts = record.timestamp
        ? new Date(record.timestamp).toLocaleString()
        : '—';

      cmd.info(`📁  ${escHtml(dir)}  (${ts})`);

      const filesWithErrors = Array.isArray(record.filesWithErrors) ? record.filesWithErrors : [];

      if (filesWithErrors.length === 0) {
        cmd.output(`  ${errs} error(s), ${warn} warning(s) — detail tidak tersedia`);
        continue;
      }

      for (const entry of filesWithErrors) {
        const file   = String(entry.file || '—');
        const errors = Array.isArray(entry.errors) ? entry.errors : [];

        if (errors.length === 0) continue;

        cmd.output(`  📄 ${escHtml(file)}`);

        for (const e of errors) {
          const sev  = String(e.severity || 'HIGH');
          const type = String(e.type     || 'Syntax Error');
          const line = e.line ? `L${e.line}` : '';
          const col  = e.col  ? `:${e.col}`  : '';
          const msg  = String(e.message  || '');
          const sug  = String(e.suggestion || '');

          const sevIcon = sev === 'HIGH' ? '🔴' : sev === 'MEDIUM' ? '🟡' : '⚪';
          cmd.output(`     ${sevIcon} ${line}${col}  [${escHtml(type)}]  ${escHtml(msg)}`);
          if (sug) {
            cmd.output(`        💡 ${escHtml(sug)}`);
          }
        }
      }
    }

    // Footer
    cmd.output('');
    if (totalErrors > 0) {
      cmd.error(`🔴  ${totalErrors} error(s)  ${totalWarnings > 0 ? `| ⚠️  ${totalWarnings} warning(s)` : ''}`);
    } else if (totalWarnings > 0) {
      cmd.warning(`⚠️  ${totalWarnings} warning(s)`);
    }

    cmd.output('Jalankan <b>debug</b> untuk scan ulang direktori aktif.');

    return false;
  } catch (err) {
    cmd.error('Problems: ' + String(err?.message || err));
    return false;
  }
}
