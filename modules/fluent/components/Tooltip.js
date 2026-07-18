// Export function untuk route 'fluent/Tooltip' (autoload: templates/fluent/Tooltip.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Tooltip(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Tooltip | App",
    description: "Showcase fluent-tooltip (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-tooltip</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentTooltip', 'fluentButton']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-tooltip</h1>
      <p class="nx-page__lead">Balon informasi yang muncul saat hover/focus elemen anchor.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-button id="tooltip-anchor-btn">Hover saya</fluent-button>
      <fluent-tooltip anchor="tooltip-anchor-btn">Ini teks tooltip.</fluent-tooltip>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-button id="btn"&gt;Hover saya&lt;/fluent-button&gt;
&lt;fluent-tooltip anchor="btn"&gt;Ini teks tooltip.&lt;/fluent-tooltip&gt;</code></pre>
    `;
  });
}
