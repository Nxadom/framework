// Export function untuk route 'fluent/SliderLabel' (autoload: templates/fluent/SliderLabel.js)
// fluent-slider-label selalu dipakai di dalam fluent-slider — lihat juga /fluent/Slider.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_SliderLabel(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent SliderLabel | App",
    description: "Showcase fluent-slider-label (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-slider-label</h1>
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
      <h1 class="nx-page__title">fluent-slider-label</h1>
      <p class="nx-page__lead">Label penanda posisi tertentu di sepanjang fluent-slider — atribut position menentukan letaknya (skala sesuai min/max slider).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/Slider">Lihat fluent-slider</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="max-width:320px;">
        <fluent-slider min="0" max="10" value="5">
          <fluent-slider-label position="0">Min</fluent-slider-label>
          <fluent-slider-label position="5">Mid</fluent-slider-label>
          <fluent-slider-label position="10">Max</fluent-slider-label>
        </fluent-slider>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-slider-label position="5"&gt;Mid&lt;/fluent-slider-label&gt;</code></pre>
    `;
  });
}
