// Export function untuk route 'fluent/Menu' (autoload: templates/fluent/Menu.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Menu(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Menu | App",
    description: "Showcase fluent-menu & fluent-menu-item (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-menu</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentMenu', 'fluentMenuItem']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-menu</h1>
      <p class="nx-page__lead">Menu daftar aksi (context menu/dropdown menu).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-menu style="max-width:220px;">
        <fluent-menu-item>Buka</fluent-menu-item>
        <fluent-menu-item>Simpan</fluent-menu-item>
        <fluent-menu-item disabled>Hapus (disabled)</fluent-menu-item>
      </fluent-menu>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-menu&gt;
  &lt;fluent-menu-item&gt;Buka&lt;/fluent-menu-item&gt;
  &lt;fluent-menu-item&gt;Simpan&lt;/fluent-menu-item&gt;
&lt;/fluent-menu&gt;</code></pre>
    `;
  });
}
