// Export function untuk route 'fluent/Checkbox' (autoload: templates/fluent/Checkbox.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Checkbox(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Checkbox | App",
    description: "Showcase fluent-checkbox (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-checkbox</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentCheckbox']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-checkbox</h1>
      <p class="nx-page__lead">Kotak centang biner.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="display:flex; flex-direction:column; gap:12px; max-width:320px;">
        <fluent-checkbox>Setuju dengan ketentuan</fluent-checkbox>
        <fluent-checkbox checked>Sudah dicentang</fluent-checkbox>
        <fluent-checkbox disabled>Disabled</fluent-checkbox>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-checkbox&gt;Setuju dengan ketentuan&lt;/fluent-checkbox&gt;
&lt;fluent-checkbox checked&gt;Sudah dicentang&lt;/fluent-checkbox&gt;</code></pre>
    `;
  });
}
