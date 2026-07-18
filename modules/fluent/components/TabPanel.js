// Export function untuk route 'fluent/TabPanel' (autoload: templates/fluent/TabPanel.js)
// fluent-tab-panel selalu dipakai di dalam fluent-tabs — lihat juga /fluent/Tabs.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_TabPanel(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent TabPanel | App",
    description: "Showcase fluent-tab-panel (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-tab-panel</h1>
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
      <h1 class="nx-page__title">fluent-tab-panel</h1>
      <p class="nx-page__lead">Isi konten untuk satu fluent-tab — urutan panel harus mengikuti urutan tab di dalam fluent-tabs.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/Tabs">Lihat fluent-tabs</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-tabs style="max-width:480px;">
        <fluent-tab>Tab A</fluent-tab>
        <fluent-tab-panel>
          <p style="margin:0;">Bisa berisi elemen apa pun, termasuk komponen Fluent lain.</p>
        </fluent-tab-panel>
      </fluent-tabs>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-tab-panel&gt;
  &lt;p&gt;Isi konten tab.&lt;/p&gt;
&lt;/fluent-tab-panel&gt;</code></pre>
    `;
  });
}
