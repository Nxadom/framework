// Export function untuk route 'fluent/Slider' (autoload: templates/fluent/Slider.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Slider(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Slider | App",
    description: "Showcase fluent-slider & fluent-slider-label (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-slider</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentSlider', 'fluentSliderLabel']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-slider</h1>
      <p class="nx-page__lead">Input rentang nilai dengan drag handle.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="max-width:320px;">
        <fluent-slider min="0" max="100" value="40">
          <fluent-slider-label position="0">0</fluent-slider-label>
          <fluent-slider-label position="50">50</fluent-slider-label>
          <fluent-slider-label position="100">100</fluent-slider-label>
        </fluent-slider>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-slider min="0" max="100" value="40"&gt;
  &lt;fluent-slider-label position="50"&gt;50&lt;/fluent-slider-label&gt;
&lt;/fluent-slider&gt;</code></pre>
    `;
  });
}
