// Export function untuk route 'fluent/Button' (autoload: templates/fluent/Button.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Button(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Button | App",
    description: "Showcase fluent-button (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-button</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentButton']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-button</h1>
      <p class="nx-page__lead">Tombol native custom element mengikuti bahasa desain Fluent 2 (Windows 11).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Appearance</h2>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <fluent-button appearance="accent">Accent</fluent-button>
        <fluent-button appearance="neutral">Neutral</fluent-button>
        <fluent-button appearance="outline">Outline</fluent-button>
        <fluent-button appearance="stealth">Stealth</fluent-button>
        <fluent-button appearance="lightweight">Lightweight</fluent-button>
      </div>

      <h2 class="nx-page__subtitle">Disabled</h2>
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <fluent-button appearance="accent" disabled>Accent</fluent-button>
        <fluent-button appearance="outline" disabled>Outline</fluent-button>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-button appearance="accent"&gt;Accent&lt;/fluent-button&gt;
&lt;fluent-button appearance="outline" disabled&gt;Disabled&lt;/fluent-button&gt;</code></pre>
    `;
  });
}
