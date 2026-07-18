// Export function untuk route 'fluent/Divider' (autoload: templates/fluent/Divider.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Divider(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Divider | App",
    description: "Showcase fluent-divider (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-divider</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentDivider']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-divider</h1>
      <p class="nx-page__lead">Garis pemisah horizontal antar section.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <p>Konten sebelum divider.</p>
      <fluent-divider style="margin:16px 0;"></fluent-divider>
      <p>Konten setelah divider.</p>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-divider&gt;&lt;/fluent-divider&gt;</code></pre>
    `;
  });
}
