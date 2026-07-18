// Export function untuk route 'fluent/MenuItem' (autoload: templates/fluent/MenuItem.js)
// fluent-menu-item selalu dipakai di dalam fluent-menu — lihat juga /fluent/Menu.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_MenuItem(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent MenuItem | App",
    description: "Showcase fluent-menu-item (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-menu-item</h1>
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
      <h1 class="nx-page__title">fluent-menu-item</h1>
      <p class="nx-page__lead">Satu aksi di dalam fluent-menu. Mendukung role="menuitemcheckbox"/"menuitemradio" untuk item yang bisa dicentang, dan submenu bertingkat.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/Menu">Lihat fluent-menu</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-menu style="max-width:240px;">
        <fluent-menu-item role="menuitemcheckbox" checked>Tampilkan Sidebar</fluent-menu-item>
        <fluent-menu-item>
          Lainnya
          <fluent-menu slot="submenu">
            <fluent-menu-item>Sub Item 1</fluent-menu-item>
          </fluent-menu>
        </fluent-menu-item>
      </fluent-menu>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-menu-item role="menuitemcheckbox" checked&gt;Opsi&lt;/fluent-menu-item&gt;</code></pre>
    `;
  });
}
