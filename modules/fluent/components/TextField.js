// Export function untuk route 'fluent/TextField' (autoload: templates/fluent/TextField.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_TextField(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent TextField | App",
    description: "Showcase fluent-text-field (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-text-field</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentTextField']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-text-field</h1>
      <p class="nx-page__lead">Input teks satu baris.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <div style="display:flex; flex-direction:column; gap:12px; max-width:320px;">
        <fluent-text-field placeholder="Nama pengguna"></fluent-text-field>
        <fluent-text-field placeholder="Disabled" disabled></fluent-text-field>
        <fluent-text-field type="password" placeholder="Password"></fluent-text-field>
      </div>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-text-field placeholder="Nama pengguna"&gt;&lt;/fluent-text-field&gt;
&lt;fluent-text-field type="password" placeholder="Password"&gt;&lt;/fluent-text-field&gt;</code></pre>
    `;
  });
}
