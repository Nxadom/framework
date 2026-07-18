// Export function untuk route 'fluent/Option' (autoload: templates/fluent/Option.js)
// fluent-option dipakai di dalam fluent-select/-combobox/-listbox — lihat juga halaman-halaman itu.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Option(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Option | App",
    description: "Showcase fluent-option (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-option</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentListbox', 'fluentOption']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-option</h1>
      <p class="nx-page__lead">Satu item pilihan — dipakai di dalam fluent-select, fluent-combobox, atau fluent-listbox. Atribut value untuk nilai, selected/disabled untuk state.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/Select">Lihat fluent-select</a> · <a href="/fluent/Listbox">Lihat fluent-listbox</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-listbox style="max-width:240px;">
        <fluent-option value="1" selected>Terpilih</fluent-option>
        <fluent-option value="2">Biasa</fluent-option>
        <fluent-option value="3" disabled>Disabled</fluent-option>
      </fluent-listbox>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-option value="1" selected&gt;Terpilih&lt;/fluent-option&gt;
&lt;fluent-option value="3" disabled&gt;Disabled&lt;/fluent-option&gt;</code></pre>
    `;
  });
}
