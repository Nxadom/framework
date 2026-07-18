// Export function untuk route 'fluent/AnchoredRegion' (autoload: templates/fluent/AnchoredRegion.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_AnchoredRegion(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent AnchoredRegion | App",
    description: "Showcase fluent-anchored-region (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-anchored-region</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentAnchoredRegion', 'fluentButton']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-anchored-region</h1>
      <p class="nx-page__lead">Komponen low-level untuk memposisikan elemen relatif ke anchor lain (dasar dari tooltip/menu/popover kustom). Butuh anchor id dan container relative.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;div style="position:relative;"&gt;
  &lt;fluent-button id="anchor-btn"&gt;Anchor&lt;/fluent-button&gt;
  &lt;fluent-anchored-region anchor="anchor-btn" vertical-positioning-mode="dynamic"&gt;
    Konten mengambang di sekitar anchor.
  &lt;/fluent-anchored-region&gt;
&lt;/div&gt;</code></pre>
      <p class="nx-page__hint">Biasanya dipakai sebagai building block, jarang dipakai langsung — pertimbangkan fluent-tooltip atau fluent-menu untuk kasus umum.</p>
    `;
  });
}
