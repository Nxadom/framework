// Export function untuk route 'fluent/TreeItem' (autoload: templates/fluent/TreeItem.js)
// fluent-tree-item selalu dipakai di dalam fluent-tree-view — lihat juga /fluent/TreeView.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_TreeItem(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent TreeItem | App",
    description: "Showcase fluent-tree-item (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-tree-item</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentTreeView', 'fluentTreeItem']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-tree-item</h1>
      <p class="nx-page__lead">Satu node di dalam fluent-tree-view. Atribut expanded untuk buka default, disabled untuk non-aktif, bisa nested (tree-item di dalam tree-item).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/TreeView">Lihat fluent-tree-view</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-tree-view style="max-width:280px;">
        <fluent-tree-item>Item biasa</fluent-tree-item>
        <fluent-tree-item disabled>Item disabled</fluent-tree-item>
      </fluent-tree-view>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-tree-item disabled&gt;Item disabled&lt;/fluent-tree-item&gt;</code></pre>
    `;
  });
}
