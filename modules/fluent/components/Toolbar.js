// Export function untuk route 'fluent/Toolbar' (autoload: templates/fluent/Toolbar.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Toolbar(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Toolbar | App",
    description: "Showcase fluent-toolbar (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-toolbar</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentToolbar', 'fluentButton', 'fluentDivider']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-toolbar</h1>
      <p class="nx-page__lead">Wadah horizontal untuk sekumpulan tombol aksi, dengan navigasi keyboard (arrow key) otomatis.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-toolbar>
        <fluent-button appearance="stealth">Bold</fluent-button>
        <fluent-button appearance="stealth">Italic</fluent-button>
        <fluent-divider style="height:20px; margin:0 4px;"></fluent-divider>
        <fluent-button appearance="stealth">Align Left</fluent-button>
      </fluent-toolbar>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-toolbar&gt;
  &lt;fluent-button appearance="stealth"&gt;Bold&lt;/fluent-button&gt;
  &lt;fluent-button appearance="stealth"&gt;Italic&lt;/fluent-button&gt;
&lt;/fluent-toolbar&gt;</code></pre>
    `;
  });
}
