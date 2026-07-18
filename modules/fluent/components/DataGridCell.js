// Export function untuk route 'fluent/DataGridCell' (autoload: templates/fluent/DataGridCell.js)
// fluent-data-grid-cell selalu dipakai di dalam fluent-data-grid-row — lihat juga /fluent/DataGridRow.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_DataGridCell(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent DataGridCell | App",
    description: "Showcase fluent-data-grid-cell (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-data-grid-cell</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentDataGrid', 'fluentDataGridRow', 'fluentDataGridCell']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-data-grid-cell</h1>
      <p class="nx-page__lead">Satu sel di dalam fluent-data-grid-row. cell-type="columnheader" untuk header, default untuk sel data biasa. grid-column menentukan urutan kolom.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/DataGridRow">Lihat fluent-data-grid-row</a></p>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-data-grid-cell cell-type="columnheader" grid-column="1"&gt;Nama&lt;/fluent-data-grid-cell&gt;
&lt;fluent-data-grid-cell grid-column="1"&gt;Andi&lt;/fluent-data-grid-cell&gt;</code></pre>
      <p class="nx-page__hint">Lihat contoh render lengkap di halaman fluent-data-grid-row.</p>
    `;
  });
}
