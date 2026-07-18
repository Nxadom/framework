// Export function untuk route 'fluent/ProgressRing' (autoload: templates/fluent/ProgressRing.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_ProgressRing(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent ProgressRing | App",
    description: "Showcase fluent-progress-ring (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-progress-ring</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentProgressRing']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-progress-ring</h1>
      <p class="nx-page__lead">Indikator loading melingkar (indeterminate).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="display:flex; gap:16px; align-items:center;">
        <fluent-progress-ring style="width:24px; height:24px;"></fluent-progress-ring>
        <fluent-progress-ring style="width:40px; height:40px;"></fluent-progress-ring>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-progress-ring style="width:24px; height:24px;"&gt;&lt;/fluent-progress-ring&gt;</code></pre>
    `;
  });
}
