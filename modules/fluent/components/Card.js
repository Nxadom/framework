// Export function untuk route 'fluent/Card' (autoload: templates/fluent/Card.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Card(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Card | App",
    description: "Showcase fluent-card (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-card</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentCard', 'fluentButton']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-card</h1>
      <p class="nx-page__lead">Container dengan elevasi & radius khas Fluent 2.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-card style="padding:16px; max-width:360px;">
        <h3 style="margin:0 0 8px;">Judul Card</h3>
        <p style="margin:0 0 12px; color:var(--nx-readme-muted,#4b5563);">Contoh isi card dengan elevasi & radius khas Fluent 2.</p>
        <fluent-button appearance="accent">Aksi</fluent-button>
      </fluent-card>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-card style="padding:16px;"&gt;
  &lt;h3&gt;Judul Card&lt;/h3&gt;
  &lt;p&gt;Isi card.&lt;/p&gt;
  &lt;fluent-button appearance="accent"&gt;Aksi&lt;/fluent-button&gt;
&lt;/fluent-card&gt;</code></pre>
    `;
  });
}
