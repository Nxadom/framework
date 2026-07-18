// Export function untuk route 'fluent/DesignSystemProvider' (autoload: templates/fluent/DesignSystemProvider.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_DesignSystemProvider(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent DesignSystemProvider | App",
    description: "Showcase fluent-design-system-provider (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-design-system-provider</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentDesignSystemProvider', 'fluentButton', 'fluentCard']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-design-system-provider</h1>
      <p class="nx-page__lead">Bukan komponen visual — wadah untuk override design token (accent color, density, dll) hanya untuk sub-tree di dalamnya, tanpa memengaruhi komponen Fluent lain di halaman.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh (accent hijau khusus di sini)</h2>
      <fluent-design-system-provider accent-base-color="#107c10" style="display:block; padding:16px; border:1px dashed #d0d7de; border-radius:8px;">
        <fluent-card style="padding:16px; max-width:320px;">
          <p style="margin:0 0 12px;">Tombol di dalam provider ini pakai accent hijau, bukan biru default.</p>
          <fluent-button appearance="accent">Accent Hijau</fluent-button>
        </fluent-card>
      </fluent-design-system-provider>

      <p class="nx-page__hint">Tombol di luar provider tetap accent biru default:</p>
      <fluent-button appearance="accent">Accent Default</fluent-button>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-design-system-provider accent-base-color="#107c10"&gt;
  &lt;fluent-button appearance="accent"&gt;Accent Hijau&lt;/fluent-button&gt;
&lt;/fluent-design-system-provider&gt;</code></pre>
    `;
  });
}
