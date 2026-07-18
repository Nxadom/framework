// Export function untuk route 'fluent/Search' (autoload: templates/fluent/Search.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Search(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Search | App",
    description: "Showcase fluent-search (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-search</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentSearch']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-search</h1>
      <p class="nx-page__lead">Input pencarian dengan ikon kaca pembesar & tombol clear bawaan.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="max-width:320px;">
        <fluent-search placeholder="Cari…"></fluent-search>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-search placeholder="Cari…"&gt;&lt;/fluent-search&gt;</code></pre>
    `;
  });
}
