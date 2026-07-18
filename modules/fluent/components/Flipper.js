// Export function untuk route 'fluent/Flipper' (autoload: templates/fluent/Flipper.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Flipper(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Flipper | App",
    description: "Showcase fluent-flipper (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-flipper</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentFlipper']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-flipper</h1>
      <p class="nx-page__lead">Tombol panah kecil untuk navigasi sebelumnya/berikutnya (dipakai internal oleh fluent-horizontal-scroll, tapi bisa dipakai berdiri sendiri).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="display:flex; gap:8px; align-items:center;">
        <fluent-flipper direction="previous"></fluent-flipper>
        <fluent-flipper direction="next"></fluent-flipper>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-flipper direction="previous"&gt;&lt;/fluent-flipper&gt;
&lt;fluent-flipper direction="next"&gt;&lt;/fluent-flipper&gt;</code></pre>
    `;
  });
}
