export function renderPanel(container, config) {
  const contentType = config?.contentType || 'home';

  switch (contentType) {
    case 'settings':
      renderSettings(container);
      break;
    case 'buckets':
      renderBuckets(container);
      break;
    default:
      renderHome(container);
      break;
  }
}

function renderHome(container) {
  container.innerHTML = `
    <div style="padding: 24px; max-width: 800px; margin: 0 auto;">
      <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600;">My Extension</h2>
      <p style="margin: 0 0 24px 0; color: var(--beranda-dv-text-muted);">
        Selamat datang di extension Anda. Edit <code>panel.js</code> untuk mengubah konten ini.
      </p>
      <div style="padding: 16px; background: var(--beranda-dv-content-bg); border: 1px solid var(--beranda-dv-header-border); border-radius: 6px;">
        <p style="margin: 0; font-size: 13px; color: var(--beranda-dv-text-muted);">
          Render apapun di sini: form, tabel, chart, editor, atau konten lainnya.
        </p>
      </div>
    </div>
  `;
}

function renderSettings(container) {
  container.innerHTML = `
    <div style="padding: 24px; max-width: 800px; margin: 0 auto;">
      <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600;">Settings</h2>
      <p style="margin: 0 0 24px 0; color: var(--beranda-dv-text-muted);">
        Konfigurasi extension Anda.
      </p>
      <div style="padding: 16px; background: var(--beranda-dv-content-bg); border: 1px solid var(--beranda-dv-header-border); border-radius: 6px;">
        <p style="margin: 0; font-size: 13px; color: var(--beranda-dv-text-muted);">
          Gunakan <code>db.set</code> / <code>db.get</code> dari <code>./buckets/db.js</code>
          untuk menyimpan konfigurasi extension ini.
        </p>
      </div>
    </div>
  `;
}

// ── Contoh penggunaan db (buckets/db.js) ─────────────────────────────────────

async function renderBuckets(container) {
  const { db } = await import('./buckets/db.js');
  container.innerHTML = `
    <div style="padding: 24px; max-width: 800px; margin: 0 auto;">
      <h2 style="margin: 0 0 4px 0; font-size: 22px; font-weight: 600;">Buckets</h2>
      <p style="margin: 0 0 20px 0; font-size: 13px; color: var(--beranda-dv-text-muted);">
        Contoh penggunaan <code>buckets/db.js</code> — semua data terisolasi per-extension.
      </p>

      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
        <input id="bk-key"   placeholder="key"   style="flex:1;min-width:120px;padding:6px 10px;border:1px solid var(--beranda-dv-header-border);border-radius:4px;background:var(--beranda-dv-input-bg);color:var(--beranda-dv-text);font-size:13px;" />
        <input id="bk-value" placeholder="value" style="flex:2;min-width:180px;padding:6px 10px;border:1px solid var(--beranda-dv-header-border);border-radius:4px;background:var(--beranda-dv-input-bg);color:var(--beranda-dv-text);font-size:13px;" />
        <button id="bk-set" style="padding:6px 14px;border:none;border-radius:4px;background:var(--beranda-dv-accent);color:#fff;cursor:pointer;font-size:13px;">Set</button>
        <button id="bk-get" style="padding:6px 14px;border:1px solid var(--beranda-dv-header-border);border-radius:4px;background:var(--beranda-dv-surface);color:var(--beranda-dv-text);cursor:pointer;font-size:13px;">Get</button>
        <button id="bk-del" style="padding:6px 14px;border:1px solid var(--beranda-dv-header-border);border-radius:4px;background:var(--beranda-dv-surface);color:var(--beranda-dv-text);cursor:pointer;font-size:13px;">Delete</button>
        <button id="bk-all" style="padding:6px 14px;border:1px solid var(--beranda-dv-header-border);border-radius:4px;background:var(--beranda-dv-surface);color:var(--beranda-dv-text);cursor:pointer;font-size:13px;">Get All</button>
      </div>

      <pre id="bk-result" style="margin:0;padding:12px;background:var(--beranda-dv-code-bg);border:1px solid var(--beranda-dv-header-border);border-radius:4px;font-size:12px;color:var(--beranda-dv-text);white-space:pre-wrap;min-height:60px;">—</pre>
    </div>
  `;

  const keyEl    = container.querySelector('#bk-key');
  const valueEl  = container.querySelector('#bk-value');
  const resultEl = container.querySelector('#bk-result');

  function show(data) {
    resultEl.textContent = JSON.stringify(data, null, 2);
  }

  container.querySelector('#bk-set').addEventListener('click', async () => {
    const k = keyEl.value.trim();
    const v = valueEl.value.trim();
    if (!k) return;
    await db.set(k, { value: v });
    show(await db.get(k));
  });

  container.querySelector('#bk-get').addEventListener('click', async () => {
    const k = keyEl.value.trim();
    if (!k) return;
    show(await db.get(k));
  });

  container.querySelector('#bk-del').addEventListener('click', async () => {
    const k = keyEl.value.trim();
    if (!k) return;
    await db.del(k);
    show({ deleted: k });
  });

  container.querySelector('#bk-all').addEventListener('click', async () => {
    show(await db.getAll());
  });
}
