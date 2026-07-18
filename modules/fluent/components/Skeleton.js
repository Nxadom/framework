// Export function untuk route 'fluent/Skeleton' (autoload: templates/fluent/Skeleton.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Skeleton(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Skeleton | App",
    description: "Showcase fluent-skeleton (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-skeleton</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentSkeleton']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-skeleton</h1>
      <p class="nx-page__lead">Placeholder shimmer saat konten masih loading.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="display:flex; flex-direction:column; gap:8px; max-width:320px;">
        <fluent-skeleton shape="rect" style="height:20px; width:80%;"></fluent-skeleton>
        <fluent-skeleton shape="rect" style="height:20px; width:60%;"></fluent-skeleton>
        <fluent-skeleton shape="circle" style="height:40px; width:40px;"></fluent-skeleton>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-skeleton shape="rect" style="height:20px;"&gt;&lt;/fluent-skeleton&gt;
&lt;fluent-skeleton shape="circle" style="height:40px; width:40px;"&gt;&lt;/fluent-skeleton&gt;</code></pre>
    `;
  });
}
