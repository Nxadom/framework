// Export function untuk route 'fluent/DataGrid' (autoload: templates/fluent/DataGrid.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_DataGrid(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent DataGrid | App",
    description: "Showcase fluent-data-grid (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-data-grid</h1>
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

    const grid = container.querySelector('.nx-page');
    grid.innerHTML = `
      <h1 class="nx-page__title">fluent-data-grid</h1>
      <p class="nx-page__lead">Tabel data dengan header & baris — bisa diisi lewat atribut rowsData (JS) atau markup manual.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-data-grid id="demo-grid" style="max-width:480px;"></fluent-data-grid>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>const grid = document.querySelector('fluent-data-grid');
grid.rowsData = [
  { nama: 'Andi', umur: 28 },
  { nama: 'Budi', umur: 34 },
];</code></pre>
    `;

    const el = grid.querySelector('#demo-grid');
    if (el) {
      el.rowsData = [
        { nama: 'Andi', umur: 28 },
        { nama: 'Budi', umur: 34 },
        { nama: 'Citra', umur: 25 },
      ];
    }
  });
}
