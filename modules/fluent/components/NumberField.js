// Export function untuk route 'fluent/NumberField' (autoload: templates/fluent/NumberField.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_NumberField(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent NumberField | App",
    description: "Showcase fluent-number-field (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-number-field</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentNumberField']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-number-field</h1>
      <p class="nx-page__lead">Input angka dengan tombol stepper naik/turun.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="max-width:200px;">
        <fluent-number-field value="1" min="0" max="10"></fluent-number-field>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-number-field value="1" min="0" max="10"&gt;&lt;/fluent-number-field&gt;</code></pre>
    `;
  });
}
