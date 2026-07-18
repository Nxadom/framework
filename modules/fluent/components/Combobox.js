// Export function untuk route 'fluent/Combobox' (autoload: templates/fluent/Combobox.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Combobox(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Combobox | App",
    description: "Showcase fluent-combobox & fluent-option (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-combobox</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentCombobox', 'fluentOption']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-combobox</h1>
      <p class="nx-page__lead">Dropdown yang bisa diketik/difilter (beda dari fluent-select yang murni pilih dari daftar).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="max-width:320px;">
        <fluent-combobox placeholder="Cari opsi…">
          <fluent-option value="apel">Apel</fluent-option>
          <fluent-option value="jeruk">Jeruk</fluent-option>
          <fluent-option value="mangga">Mangga</fluent-option>
        </fluent-combobox>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-combobox placeholder="Cari opsi…"&gt;
  &lt;fluent-option value="apel"&gt;Apel&lt;/fluent-option&gt;
&lt;/fluent-combobox&gt;</code></pre>
    `;
  });
}
