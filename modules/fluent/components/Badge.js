// Export function untuk route 'fluent/Badge' (autoload: templates/fluent/Badge.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Badge(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Badge | App",
    description: "Showcase fluent-badge (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-badge</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentBadge']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-badge</h1>
      <p class="nx-page__lead">Label kecil untuk status/penanda.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <fluent-badge>Baru</fluent-badge>
        <fluent-badge fill="lightweight">Lightweight</fluent-badge>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-badge&gt;Baru&lt;/fluent-badge&gt;</code></pre>
    `;
  });
}
