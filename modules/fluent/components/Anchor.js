// Export function untuk route 'fluent/Anchor' (autoload: templates/fluent/Anchor.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Anchor(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Anchor | App",
    description: "Showcase fluent-anchor (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-anchor</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentAnchor']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-anchor</h1>
      <p class="nx-page__lead">Tautan (link) dengan tampilan tombol Fluent — mendukung href navigasi, bukan aksi JS.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <fluent-anchor href="#" appearance="accent">Accent</fluent-anchor>
        <fluent-anchor href="#" appearance="outline">Outline</fluent-anchor>
        <fluent-anchor href="#" appearance="hypertext">Hypertext</fluent-anchor>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-anchor href="/halaman" appearance="accent"&gt;Buka&lt;/fluent-anchor&gt;</code></pre>
    `;
  });
}
