// Export function untuk route 'fluent/Tabs' (autoload: templates/fluent/Tabs.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Tabs(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Tabs | App",
    description: "Showcase fluent-tabs, fluent-tab & fluent-tab-panel (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-tabs</h1>
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
      <h1 class="nx-page__title">fluent-tabs</h1>
      <p class="nx-page__lead">Navigasi antar panel konten — fluent-tab untuk header, fluent-tab-panel untuk isi (urutan panel mengikuti urutan tab).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-tabs style="max-width:480px;">
        <fluent-tab id="tab-1">Profil</fluent-tab>
        <fluent-tab id="tab-2">Keamanan</fluent-tab>
        <fluent-tab id="tab-3">Notifikasi</fluent-tab>
        <fluent-tab-panel>Isi tab Profil.</fluent-tab-panel>
        <fluent-tab-panel>Isi tab Keamanan.</fluent-tab-panel>
        <fluent-tab-panel>Isi tab Notifikasi.</fluent-tab-panel>
      </fluent-tabs>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-tabs&gt;
  &lt;fluent-tab&gt;Profil&lt;/fluent-tab&gt;
  &lt;fluent-tab&gt;Keamanan&lt;/fluent-tab&gt;
  &lt;fluent-tab-panel&gt;Isi Profil.&lt;/fluent-tab-panel&gt;
  &lt;fluent-tab-panel&gt;Isi Keamanan.&lt;/fluent-tab-panel&gt;
&lt;/fluent-tabs&gt;</code></pre>
    `;
  });
}
