// Export function untuk route 'fluent/TreeView' (autoload: templates/fluent/TreeView.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_TreeView(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent TreeView | App",
    description: "Showcase fluent-tree-view & fluent-tree-item (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-tree-view</h1>
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
      <h1 class="nx-page__title">fluent-tree-view</h1>
      <p class="nx-page__lead">Struktur pohon (folder/file, kategori bertingkat) dengan fluent-tree-item — mendukung nested & expand/collapse.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-tree-view style="max-width:280px;">
        <fluent-tree-item expanded>
          Folder A
          <fluent-tree-item>File A1</fluent-tree-item>
          <fluent-tree-item>File A2</fluent-tree-item>
        </fluent-tree-item>
        <fluent-tree-item>File B</fluent-tree-item>
      </fluent-tree-view>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-tree-view&gt;
  &lt;fluent-tree-item expanded&gt;
    Folder A
    &lt;fluent-tree-item&gt;File A1&lt;/fluent-tree-item&gt;
  &lt;/fluent-tree-item&gt;
&lt;/fluent-tree-view&gt;</code></pre>
    `;
  });
}
