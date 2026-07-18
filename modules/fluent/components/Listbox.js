// Export function untuk route 'fluent/Listbox' (autoload: templates/fluent/Listbox.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Listbox(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Listbox | App",
    description: "Showcase fluent-listbox & fluent-option (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-listbox</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentListbox', 'fluentOption']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-listbox</h1>
      <p class="nx-page__lead">Daftar pilihan yang selalu terbuka (beda dari fluent-select yang dropdown tertutup).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-listbox style="max-width:240px;">
        <fluent-option value="1">Opsi 1</fluent-option>
        <fluent-option value="2">Opsi 2</fluent-option>
        <fluent-option value="3">Opsi 3</fluent-option>
      </fluent-listbox>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-listbox&gt;
  &lt;fluent-option value="1"&gt;Opsi 1&lt;/fluent-option&gt;
&lt;/fluent-listbox&gt;</code></pre>
    `;
  });
}
