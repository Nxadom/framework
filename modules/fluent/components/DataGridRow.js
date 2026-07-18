// Export function untuk route 'fluent/DataGridRow' (autoload: templates/fluent/DataGridRow.js)
// fluent-data-grid-row/-cell selalu dipakai di dalam fluent-data-grid — lihat juga /fluent/DataGrid.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_DataGridRow(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent DataGridRow | App",
    description: "Showcase fluent-data-grid-row (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-data-grid-row</h1>
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
      <h1 class="nx-page__title">fluent-data-grid-row</h1>
      <p class="nx-page__lead">Satu baris di dalam fluent-data-grid — biasanya di-generate otomatis dari rowsData (lihat /fluent/DataGrid), tapi bisa juga ditulis manual dengan row-type="header"/"default".</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/DataGrid">Lihat fluent-data-grid</a> · <a href="/fluent/DataGridCell">Lihat fluent-data-grid-cell</a></p>

      <h2 class="nx-page__subtitle">Contoh (manual)</h2>
      <fluent-data-grid style="max-width:420px; --data-grid-generate-header: none;" no-tabbing>
        <fluent-data-grid-row row-type="header">
          <fluent-data-grid-cell cell-type="columnheader" grid-column="1">Nama</fluent-data-grid-cell>
          <fluent-data-grid-cell cell-type="columnheader" grid-column="2">Umur</fluent-data-grid-cell>
        </fluent-data-grid-row>
        <fluent-data-grid-row>
          <fluent-data-grid-cell grid-column="1">Andi</fluent-data-grid-cell>
          <fluent-data-grid-cell grid-column="2">28</fluent-data-grid-cell>
        </fluent-data-grid-row>
      </fluent-data-grid>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-data-grid-row row-type="header"&gt;
  &lt;fluent-data-grid-cell cell-type="columnheader" grid-column="1"&gt;Nama&lt;/fluent-data-grid-cell&gt;
&lt;/fluent-data-grid-row&gt;</code></pre>
    `;
  });
}
