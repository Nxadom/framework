// Export function untuk route 'fluent/BreadcrumbItem' (autoload: templates/fluent/BreadcrumbItem.js)
// fluent-breadcrumb-item selalu dipakai di dalam fluent-breadcrumb — lihat juga /fluent/Breadcrumb.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_BreadcrumbItem(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent BreadcrumbItem | App",
    description: "Showcase fluent-breadcrumb-item (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-breadcrumb-item</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentBreadcrumb', 'fluentBreadcrumbItem']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-breadcrumb-item</h1>
      <p class="nx-page__lead">Satu langkah di dalam fluent-breadcrumb. Isi href untuk item yang bisa diklik; item terakhir biasanya tanpa href (halaman aktif).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/Breadcrumb">Lihat fluent-breadcrumb</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-breadcrumb>
        <fluent-breadcrumb-item href="#">Beranda</fluent-breadcrumb-item>
        <fluent-breadcrumb-item>Halaman Aktif (tanpa href)</fluent-breadcrumb-item>
      </fluent-breadcrumb>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-breadcrumb-item href="/"&gt;Beranda&lt;/fluent-breadcrumb-item&gt;</code></pre>
    `;
  });
}
