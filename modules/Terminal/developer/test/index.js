/**
 * nx test — jalankan file test.js di folder extension aktif.
 * Membaca `test.js` dari working directory terminal, lalu mengeksekusinya
 * via electronAPI.terminalShellExec (Node.js).
 */
export async function nxTest(cmd) {
  try {
    const cwd = String(cmd.workingDirectory || '').trim();

    if (!cwd) {
      cmd.error('Working directory tidak ditemukan.');
      cmd.output('  Gunakan perintah cd untuk berpindah ke folder extension terlebih dahulu.');
      cmd.output('  Contoh: cd D:\\projects\\my-extension');
      cmd.startNewCommand();
      return false;
    }

    /* Verifikasi test.js ada di folder */
    const api = window.electronAPI;
    let testContent = null;
    try {
      testContent = await api.discoveryReadFile(`${cwd}\\test.js`);
    } catch (_) {
      /* coba path posix */
      try {
        testContent = await api.discoveryReadFile(`${cwd}/test.js`);
      } catch (_) {}
    }

    if (testContent === null || testContent === undefined) {
      cmd.error('File test.js tidak ditemukan di folder ini.');
      cmd.output(`  Buat file test.js di: ${cwd}`);
      cmd.output('');
      cmd.output('  Contoh isi test.js:');
      cmd.output('  ┌────────────────────────────────────────┐');
      cmd.output('  │  // test.js — NxCode Extension Test    │');
      cmd.output("  │  const assert = require('assert');     │");
      cmd.output("  │                                        │");
      cmd.output("  │  assert.strictEqual(1 + 1, 2);         │");
      cmd.output("  │  console.log('✓ Semua test lolos');    │");
      cmd.output('  └────────────────────────────────────────┘');
      cmd.startNewCommand();
      return false;
    }

    cmd.output('');
    cmd.output(`  ▶  Menjalankan test.js di: ${cwd}`);
    cmd.output('');

    const startTime = Date.now();

    let result;
    try {
      result = await api.terminalShellExec({
        command: 'node test.js',
        cwd,
      });
    } catch (err) {
      cmd.error(`Gagal menjalankan test: ${err?.message || err}`);
      cmd.startNewCommand();
      return false;
    }

    const elapsed = Date.now() - startTime;

    if (result?.stdout) {
      result.stdout
        .split('\n')
        .filter((line) => line.trim())
        .forEach((line) => cmd.output(`  ${line}`));
    }

    if (result?.stderr) {
      result.stderr
        .split('\n')
        .filter((line) => line.trim())
        .forEach((line) => cmd.output(`  ⚠ ${line}`));
    }

    cmd.output('');

    const exitCode = result?.exitCode ?? result?.code ?? 0;
    if (exitCode === 0) {
      cmd.success(`Test selesai  ·  ${elapsed}ms`);
    } else {
      cmd.error(`Test gagal dengan exit code ${exitCode}  ·  ${elapsed}ms`);
    }

    return false;
  } catch (error) {
    console.error('[nx test] error:', error);
    cmd.error(`Error: ${error?.message || error}`);
    cmd.startNewCommand();
    return false;
  }
}
