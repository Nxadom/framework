// Export function untuk route 'fluent/TextArea' (autoload: templates/fluent/TextArea.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_TextArea(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent TextArea | App",
    description: "Showcase fluent-text-area (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-text-area</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentTextArea']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-text-area</h1>
      <p class="nx-page__lead">Input teks multi-baris.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="max-width:400px;">
        <fluent-text-area placeholder="Tulis pesan…" rows="4"></fluent-text-area>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-text-area placeholder="Tulis pesan…" rows="4"&gt;&lt;/fluent-text-area&gt;</code></pre>
    `;
  });
}
