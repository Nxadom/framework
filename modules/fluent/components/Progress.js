// Export function untuk route 'fluent/Progress' (autoload: templates/fluent/Progress.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Progress(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Progress | App",
    description: "Showcase fluent-progress (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-progress</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentProgress']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-progress</h1>
      <p class="nx-page__lead">Bar loading linear — indeterminate (tanpa value) atau menunjukkan persentase (dengan value).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="display:flex; flex-direction:column; gap:16px; max-width:320px;">
        <fluent-progress></fluent-progress>
        <fluent-progress value="65" min="0" max="100"></fluent-progress>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-progress&gt;&lt;/fluent-progress&gt;
&lt;fluent-progress value="65" min="0" max="100"&gt;&lt;/fluent-progress&gt;</code></pre>
    `;
  });
}
