// Export function untuk route 'fluent/HorizontalScroll' (autoload: templates/fluent/HorizontalScroll.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_HorizontalScroll(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent HorizontalScroll | App",
    description: "Showcase fluent-horizontal-scroll (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-horizontal-scroll</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentHorizontalScroll', 'fluentCard']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-horizontal-scroll</h1>
      <p class="nx-page__lead">Carousel scroll horizontal dengan tombol panah (flipper) otomatis di kedua sisi.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-horizontal-scroll style="max-width:480px;">
        ${[1, 2, 3, 4, 5].map((n) => `
          <fluent-card style="min-width:140px; padding:16px; margin-right:8px;">Item ${n}</fluent-card>
        `).join('')}
      </fluent-horizontal-scroll>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-horizontal-scroll&gt;
  &lt;fluent-card&gt;Item 1&lt;/fluent-card&gt;
  &lt;fluent-card&gt;Item 2&lt;/fluent-card&gt;
&lt;/fluent-horizontal-scroll&gt;</code></pre>
    `;
  });
}
