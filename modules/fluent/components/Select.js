// Export function untuk route 'fluent/Select' (autoload: templates/fluent/Select.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Select(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Select | App",
    description: "Showcase fluent-select & fluent-option (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-select</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentSelect', 'fluentOption']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-select</h1>
      <p class="nx-page__lead">Dropdown pilihan tunggal, isi dengan fluent-option.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="max-width:320px;">
        <fluent-select>
          <fluent-option value="1">Opsi 1</fluent-option>
          <fluent-option value="2">Opsi 2</fluent-option>
          <fluent-option value="3">Opsi 3</fluent-option>
        </fluent-select>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-select&gt;
  &lt;fluent-option value="1"&gt;Opsi 1&lt;/fluent-option&gt;
  &lt;fluent-option value="2"&gt;Opsi 2&lt;/fluent-option&gt;
&lt;/fluent-select&gt;</code></pre>
    `;
  });
}
