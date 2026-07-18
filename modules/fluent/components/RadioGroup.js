// Export function untuk route 'fluent/RadioGroup' (autoload: templates/fluent/RadioGroup.js)
// fluent-radio-group selalu dipakai bersama fluent-radio — lihat juga /fluent/Radio.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_RadioGroup(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent RadioGroup | App",
    description: "Showcase fluent-radio-group (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-radio-group</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentRadio', 'fluentRadioGroup']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-radio-group</h1>
      <p class="nx-page__lead">Container yang mengelola state "hanya satu terpilih" untuk fluent-radio di dalamnya. Mendukung orientation vertical/horizontal.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/Radio">Lihat fluent-radio</a></p>

      <h2 class="nx-page__subtitle">Contoh (horizontal)</h2>
      <fluent-radio-group orientation="horizontal">
        <fluent-radio value="s" checked>Kecil</fluent-radio>
        <fluent-radio value="m">Sedang</fluent-radio>
        <fluent-radio value="l">Besar</fluent-radio>
      </fluent-radio-group>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-radio-group orientation="horizontal"&gt;
  &lt;fluent-radio value="s" checked&gt;Kecil&lt;/fluent-radio&gt;
  &lt;fluent-radio value="m"&gt;Sedang&lt;/fluent-radio&gt;
&lt;/fluent-radio-group&gt;</code></pre>
    `;
  });
}
