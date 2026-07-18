// Export function untuk route 'fluent/Tab' (autoload: templates/fluent/Tab.js)
// fluent-tab selalu dipakai di dalam fluent-tabs — lihat juga /fluent/Tabs.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Tab(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Tab | App",
    description: "Showcase fluent-tab (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-tab</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentTabs', 'fluentTab', 'fluentTabPanel']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-tab</h1>
      <p class="nx-page__lead">Satu header tab di dalam fluent-tabs. Atribut disabled untuk menonaktifkan tab tertentu.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/Tabs">Lihat fluent-tabs</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-tabs style="max-width:480px;">
        <fluent-tab>Aktif</fluent-tab>
        <fluent-tab disabled>Disabled</fluent-tab>
        <fluent-tab-panel>Konten tab aktif.</fluent-tab-panel>
        <fluent-tab-panel>Tidak bisa dibuka.</fluent-tab-panel>
      </fluent-tabs>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-tab disabled&gt;Tidak Aktif&lt;/fluent-tab&gt;</code></pre>
    `;
  });
}
