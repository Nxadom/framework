// Export function untuk route 'fluent/Dialog' (autoload: templates/fluent/Dialog.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Dialog(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Dialog | App",
    description: "Showcase fluent-dialog (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-dialog</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentDialog', 'fluentButton']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    const page_ = container.querySelector('.nx-page');
    page_.innerHTML = `
      <h1 class="nx-page__title">fluent-dialog</h1>
      <p class="nx-page__lead">Modal dialog — kontrol tampil/sembunyi lewat atribut hidden.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-button id="open-dialog-btn" appearance="accent">Buka Dialog</fluent-button>

      <fluent-dialog id="demo-dialog" hidden modal>
        <div style="padding:20px; min-width:280px;">
          <h3 style="margin:0 0 8px;">Judul Dialog</h3>
          <p style="margin:0 0 16px; color:var(--nx-readme-muted,#4b5563);">Isi dialog di sini.</p>
          <fluent-button id="close-dialog-btn" appearance="accent">Tutup</fluent-button>
        </div>
      </fluent-dialog>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-button id="open-btn"&gt;Buka&lt;/fluent-button&gt;
&lt;fluent-dialog id="dlg" hidden modal&gt;…&lt;/fluent-dialog&gt;

openBtn.addEventListener('click', () =&gt; dlg.hidden = false);</code></pre>
    `;

    const dialog = page_.querySelector('#demo-dialog');
    page_.querySelector('#open-dialog-btn')?.addEventListener('click', () => {
      if (dialog) dialog.hidden = false;
    });
    page_.querySelector('#close-dialog-btn')?.addEventListener('click', () => {
      if (dialog) dialog.hidden = true;
    });
  });
}
