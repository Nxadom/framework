// Export function untuk route 'fluent/Radio' (autoload: templates/fluent/Radio.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Radio(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Radio | App",
    description: "Showcase fluent-radio & fluent-radio-group (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-radio</h1>
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
      <h1 class="nx-page__title">fluent-radio</h1>
      <p class="nx-page__lead">Pilihan tunggal dari beberapa opsi, dibungkus fluent-radio-group.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-radio-group orientation="vertical">
        <fluent-radio value="a" checked>Opsi A</fluent-radio>
        <fluent-radio value="b">Opsi B</fluent-radio>
        <fluent-radio value="c">Opsi C</fluent-radio>
      </fluent-radio-group>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-radio-group orientation="vertical"&gt;
  &lt;fluent-radio value="a" checked&gt;Opsi A&lt;/fluent-radio&gt;
  &lt;fluent-radio value="b"&gt;Opsi B&lt;/fluent-radio&gt;
&lt;/fluent-radio-group&gt;</code></pre>
    `;
  });
}
