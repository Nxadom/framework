// Export function untuk route 'fluent/Switch' (autoload: templates/fluent/Switch.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Switch(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Switch | App",
    description: "Showcase fluent-switch (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-switch</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentSwitch']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-switch</h1>
      <p class="nx-page__lead">Toggle on/off.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="display:flex; flex-direction:column; gap:12px; max-width:320px;">
        <fluent-switch>Mode gelap</fluent-switch>
        <fluent-switch checked>Notifikasi (aktif)</fluent-switch>
        <fluent-switch disabled>Disabled</fluent-switch>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-switch&gt;Mode gelap&lt;/fluent-switch&gt;
&lt;fluent-switch checked&gt;Notifikasi&lt;/fluent-switch&gt;</code></pre>
    `;
  });
}
