
export async function confirm(cmd) {
  try {
    cmd.info('=== Demo: confirm / prompt / secret ===');
    cmd.info('');

    // Fungsi bantu untuk step secret + confirm berantai
    const stepSecretAndChain = () => {
      cmd.info('3) cmd.secret — input password (tersembunyi)');
      cmd.secret('Masukkan password untuk verifikasi:', (password) => {
        if (!password || password.trim() === '') {
          cmd.error('Password required!');
          cmd.startNewCommand();
          return;
        }

        if (password === 'rahasia') {
          cmd.success('✓ Password benar! Akses diberikan.');
        } else {
          cmd.warning('Password salah, tapi demo tetap lanjut.');
        }

        // ── 4. Confirm + secret berantai ──────────
        cmd.info('');
        cmd.info('4) Rantai: confirm → secret');
        cmd.warning('⚠️  Aksi ini akan mengubah pengaturan.');
        cmd.confirm('Lanjutkan? [Y/N]', async (confirmed) => {
          if (!confirmed) {
            cmd.info('Dibatalkan pengguna.');
            cmd.startNewCommand();
            return;
          }

          cmd.secret('Konfirmasi password Anda:', (pw) => {
            if (!pw || pw.trim() === '') {
              cmd.error('Password wajib diisi!');
              cmd.startNewCommand();
              return;
            }

            cmd.success('✓ Konfirmasi berhasil! Pengaturan diubah.');
            cmd.info('');
            cmd.info('=== Demo selesai ===');
            cmd.info('Method yang dicoba:');
            cmd.list(
              ['cmd.confirm(title, cb)',
               'cmd.prompt(title, cb)',
               'cmd.secret(title, cb)',
               'cmd.info(msg)',
               'cmd.success(msg)',
               'cmd.warning(msg)',
               'cmd.error(msg)',
               'cmd.list(arr, cols)',
               'cmd.startNewCommand()'],
              2,
            );
            cmd.startNewCommand();
          });
        });
      });
    };

    // ── 1. Confirm sederhana ──────────────────────────
    cmd.info('1) cmd.confirm — konfirmasi Y/N');
    cmd.confirm('Hapus semua file?', (yes) => {
      if (yes) {
        cmd.error('Permission denied!!');
      } else {
        cmd.success('Batal — tidak jadi hapus :)');
      }

      // ── 2. Prompt (input teks) ──────────────────────
      cmd.info('');
      cmd.info('2) cmd.prompt — input teks');
      cmd.prompt('Masukkan nama Anda:', (name) => {
        if (!name || name.trim() === '') {
          cmd.warning('Nama tidak boleh kosong. Coba lagi.');
          cmd.prompt('Masukkan nama Anda:', (retry) => {
            const finalName = retry && retry.trim() ? retry.trim() : 'User';
            cmd.success(`Halo, ${finalName}!`);
            cmd.info('');
            stepSecretAndChain();
          });
        } else {
          cmd.success(`Halo, ${name.trim()}!`);
          cmd.info('');
          stepSecretAndChain();
        }
      });
    });
  } catch (error) {
    console.error('❌ mode confirm failed:', error);
    return null;
  }
}
