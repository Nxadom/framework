
export async function timeout(cmd) {
  try {
    cmd.info('=== Demo: setTimeout / async patterns ===');
    cmd.info('');

    // ── 1. Chained setTimeout (classic pattern dari login) ────
    cmd.info('1) Rantai setTimeout (seperti login):');
    setTimeout(() => {
      cmd.info('  • Authenticating ...');
      setTimeout(() => {
        cmd.info('  • Loading Application ...');
        setTimeout(() => {
          cmd.warning('  • ⚠️  I am not saving this password! Don\'t worry :)');
          setTimeout(() => {
            cmd.success('  • ✓ System Ready to use!');
            cmd.info('');

            // ── 2. Sequential loading bar ────
            cmd.info('2) Loading bertahap:');
            cmd.info('  • Memeriksa konfigurasi...');
            setTimeout(() => {
              cmd.info('  • Menghubungi server...');
              setTimeout(() => {
                cmd.info('  • Memvalidasi data...');
                setTimeout(() => {
                  cmd.success('  • ✓ Selesai!');
                  cmd.info('');

                  // ── 3. Countdown timer ────
                  cmd.info('3) Countdown 5 → 1 (setInterval):');
                  let count = 5;
                  const countdownId = setInterval(() => {
                    cmd.info(`  • ${count}...`);
                    count--;
                    if (count < 0) {
                      clearInterval(countdownId);
                      cmd.success('  • ✅ Go!');
                      cmd.info('');

                      // ── 4. clearTimeout demo ────
                      cmd.info('4) clearTimeout — batal eksekusi:');
                      const timeoutId = setTimeout(() => {
                        cmd.error('  • ✗ Ini tidak akan muncul!');
                      }, 2000);
                      clearTimeout(timeoutId);
                      cmd.success('  • ✓ Timeout berhasil dibatalkan (clearTimeout).');
                      cmd.info('');

                      // ── 5. Timeout dengan jeda berbeda ────
                      cmd.info('5) Multi timeout dengan jeda berbeda:');
                      setTimeout(() => {
                        cmd.warning('  • ⚠️  Peringatan: memori hampir penuh (1000ms)');
                      }, 200);
                      setTimeout(() => {
                        cmd.info('  • ℹ️  Info: sistem berjalan normal (500ms)');
                      }, 100);
                      setTimeout(() => {
                        cmd.error('  • ✗ Error simulasi: koneksi terputus (1500ms)');
                      }, 300);
                      setTimeout(() => {
                        cmd.success('  • ✓ Semua timeout demo selesai!');
                        cmd.info('');
                        cmd.info('=== Ringkasan method ===');
                        cmd.list(
                          ['setTimeout(fn, ms)', 'setInterval(fn, ms)',
                           'clearTimeout(id)', 'clearInterval(id)',
                           'setTimeout nested (chain)', 'countdown timer'],
                          2,
                        );
                        cmd.startNewCommand();
                      }, 600);
                    }
                  }, 800);
                }, 600);
              }, 600);
            }, 600);
          }, 800);
        }, 800);
      }, 800);
    }, 800);

    return false;
  } catch (error) {
    console.error('❌ mode timeout failed:', error);
    return null;
  }
}
