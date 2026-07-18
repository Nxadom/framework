export function APIConsole(cmd) {
  try {
    cmd.info('=== API Console ===');
    // ── 1: URL ────────────────────────────────
    cmd.prompt('URL endpoint:', (url) => {
      if (!url || url.trim() === '') {
        cmd.error('URL wajib diisi!');
        cmd.startNewCommand();
        return;
      }
      const endpoint = url.trim();

      // Blokir endpoint internal aplikasi
      const internalOrigins = Array.isArray(window.__NEXA_ENDPOINT__?.internalOrigins)
        ? window.__NEXA_ENDPOINT__.internalOrigins
        : [];
      const isBlocked = internalOrigins.some((origin) => {
        try { return endpoint.startsWith(origin) || endpoint.startsWith(new URL(origin).origin); }
        catch { return false; }
      });
      if (isBlocked) {
        cmd.error('⛔ Endpoint ini tidak diizinkan.');
        cmd.warning('Gunakan endpoint eksternal atau API publik.');
        cmd.startNewCommand();
        return;
      }

      // ── 2: Method ────────────────────────────
      cmd.list(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'], 4);
      cmd.prompt('Method [GET]:', (method) => {
        const m = (method || 'GET').trim().toUpperCase();
        const valid = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
        const methodType = valid.includes(m) ? m : 'GET';

        // ── 3: Authorization ───────────────────
        cmd.confirm('Ada Authorization? [Y/N]', (withAuth) => {
          if (!withAuth) {
            // ── 4: Ringkasan & kirim ──────────────
            cmd.info('URL    : ' + endpoint);
            cmd.info('Method : ' + methodType);
            cmd.info('Auth   : Tidak ada');
            cmd.info('');

            cmd.confirm('Kirim? [Y/N]', (send) => {
              if (!send) {
                cmd.warning('Dibatalkan.');
                cmd.startNewCommand();
                return;
              }
              apiDoFetch(cmd, endpoint, methodType, {}, null);
            });
            return;
          }

          cmd.list(['1. Bearer Token', '2. Basic Auth', '3. Custom Header'], 1);
          cmd.prompt('Pilih [1/2/3]:', (type) => {
            const t = (type || '1').trim();

            if (t === '2' || t.toLowerCase() === 'basic') {
              cmd.prompt('Username:', (user) => {
                cmd.secret('Password:', (pass) => {
                  const encoded = btoa((user || '') + ':' + (pass || ''));
                  const authStr = 'Basic ' + encoded;

                  cmd.info('');
                  cmd.info('=== RINGKASAN ===');
                  cmd.info('URL    : ' + endpoint);
                  cmd.info('Method : ' + methodType);
                  cmd.info('Auth   : ' + authStr.slice(0, 20) + '...');
                  cmd.info('');

                  cmd.confirm('Kirim? [Y/N]', (send) => {
                    if (!send) {
                      cmd.warning('Dibatalkan.');
                      cmd.startNewCommand();
                      return;
                    }
                    apiDoFetch(cmd, endpoint, methodType, { Authorization: authStr }, null);
                  });
                });
              });
            } else if (t === '3' || t.toLowerCase() === 'custom') {
              cmd.prompt('Nama Header:', (hName) => {
                cmd.secret('Value:', (hVal) => {
                  cmd.info('');
                  cmd.info('=== RINGKASAN ===');
                  cmd.info('URL    : ' + endpoint);
                  cmd.info('Method : ' + methodType);
                  cmd.info('Header : ' + (hName || 'X-Custom') + ': ' + (hVal || ''));
                  cmd.info('');

                  cmd.confirm('Kirim? [Y/N]', (send) => {
                    if (!send) {
                      cmd.warning('Dibatalkan.');
                      cmd.startNewCommand();
                      return;
                    }
                    apiDoFetch(cmd, endpoint, methodType, { [hName || 'X-Custom']: hVal || '' }, null);
                  });
                });
              });
            } else {
              cmd.secret('Bearer Token:', (token) => {
                cmd.info('');
                cmd.info('=== RINGKASAN ===');
                cmd.info('URL    : ' + endpoint);
                cmd.info('Method : ' + methodType);
                cmd.info('Auth   : Bearer ' + (token ? '***' : '(kosong)'));
                cmd.info('');

                cmd.confirm('Kirim? [Y/N]', (send) => {
                  if (!send) {
                    cmd.warning('Dibatalkan.');
                    cmd.startNewCommand();
                    return;
                  }
                  apiDoFetch(cmd, endpoint, methodType, { Authorization: 'Bearer ' + (token || '') }, null);
                });
              });
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('❌ API Console failed:', error);
    cmd.startNewCommand();
  }
  return false;
}

function renderJsonHtml(data) {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const pad = (n) => '  '.repeat(n || 0);
  const isDark = document.body?.classList?.contains('dark-mode-grid')
    || document.documentElement?.classList?.contains('dark-mode-grid');
  const clr = isDark ? {
    key:  (s) => '<span style="color:#56b6c2">' + s + '</span>',
    str:  (s) => '<span style="color:#a8cc8c">"' + esc(s) + '"</span>',
    num:  (s) => '<span style="color:#d19a66">' + s + '</span>',
    bool: (s) => '<span style="color:#4ba7ef">' + s + '</span>',
    nil:  ()  => '<span style="color:#df9cf3;font-style:italic">null</span>',
    br:   (s) => '<span style="color:#636d83">' + s + '</span>',
  } : {
    key:  (s) => '<span style="color:#0070a8;font-weight:600">' + s + '</span>',
    str:  (s) => '<span style="color:#1a7a3a">"' + esc(s) + '"</span>',
    num:  (s) => '<span style="color:#b85c00">' + s + '</span>',
    bool: (s) => '<span style="color:#7c3aed;font-weight:600">' + s + '</span>',
    nil:  ()  => '<span style="color:#9333ea;font-style:italic">null</span>',
    br:   (s) => '<span style="color:#64748b">' + s + '</span>',
  };

  function toHtml(val, depth) {
    depth = depth || 0;
    if (val === null) return clr.nil();
    if (typeof val === 'boolean') return clr.bool(val);
    if (typeof val === 'number') return clr.num(val);
    if (typeof val === 'string') return clr.str(val);

    if (Array.isArray(val)) {
      if (val.length === 0) return clr.br('[]');
      const inner = val.map((v) => pad(depth + 1) + toHtml(v, depth + 1)).join(clr.br(',') + '\n');
      return clr.br('[') + '\n' + inner + '\n' + pad(depth) + clr.br(']');
    }

    if (typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length === 0) return clr.br('{}');
      const inner = keys.map((k) =>
        pad(depth + 1) + clr.key('"' + esc(k) + '"') + clr.br(': ') + toHtml(val[k], depth + 1)
      ).join(clr.br(',') + '\n');
      return clr.br('{') + '\n' + inner + '\n' + pad(depth) + clr.br('}');
    }

    return esc(String(val));
  }

  const bg   = isDark ? '#12141a' : 'var(--beranda-dv-surface, #f4f5f7)';
  const fg   = isDark ? '#f8f8f2' : 'var(--beranda-fg, #1a1a2e)';

  return '<pre style="margin:4px 0;padding:10px;border-radius:4px;background:' + bg + ';'
    + 'color:' + fg + ';font-size:11px;line-height:1.5;'
    + 'font-family:Cascadia Mono,Consolas,monospace;white-space:pre;overflow:visible;">'
    + toHtml(data)
    + '</pre>';
}

async function apiDoFetch(cmd, endpoint, method, headers, body) {
  const { NexaNpm } = await import('../npm/index.js');
  const npmUi = new NexaNpm();
  let progressShown = false;

  try {
    await npmUi.ensureStylesheet();

    // Tampilkan placeholder animasi selama menunggu respons
    const progressHtml = npmUi.renderStartStopWait({ kind: 'start', cwd: endpoint });
    cmd.output(progressHtml);
    progressShown = true;
    if (cmd.commandRow) {
      cmd.commandRow.hideTime();
      cmd.commandRow.commandEntry.classList.add('block');
    }
    const entryEl = cmd.commandRow?.commandEntry;
    if (entryEl) {
      npmUi.initStartStopWait(entryEl, { kind: 'start', cwd: endpoint });
    }

    // Jalankan fetch tanpa memblokir UI
    const opts = { method, headers: Object.assign({}, headers) };
    if (body && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      opts.body = body;
      if (!opts.headers['Content-Type']) opts.headers['Content-Type'] = 'application/json';
    }

    const t0 = Date.now();
    const res = await fetch(endpoint, opts);
    const ms = Date.now() - t0;
    const text = await res.text();

    // Hentikan animasi + hapus baris progress
    npmUi.destroy();
    if (progressShown && cmd.commandRow?.commandRow) {
      try { cmd.commandRow.commandRow.remove(); } catch { /* ignore */ }
      cmd.commandRow = null;
    }
    progressShown = false;

    // Output hasil
    if (res.ok) {
      cmd.success(res.status + ' ' + res.statusText + '  (' + ms + 'ms)');
    } else {
      cmd.error(res.status + ' ' + res.statusText + '  (' + ms + 'ms)');
    }
    cmd.info('Content-Type: ' + (res.headers.get('content-type') || '-'));

    let rows;
    try { rows = JSON.parse(text); } catch { rows = { response: text }; }
    cmd.output(renderJsonHtml(rows));

  } catch (err) {
    npmUi.destroy();
    if (progressShown && cmd.commandRow?.commandRow) {
      try { cmd.commandRow.commandRow.remove(); } catch { /* ignore */ }
      cmd.commandRow = null;
    }
    cmd.error('Fetch gagal: ' + String(err?.message || err));
  }

  cmd.startNewCommand();
}
