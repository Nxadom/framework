// Export function untuk route 'fluent/Calendar' (autoload: templates/fluent/Calendar.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Calendar(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Calendar | App",
    description: "Showcase fluent-calendar (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-calendar</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentCalendar']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-calendar</h1>
      <p class="nx-page__lead">Tampilan kalender bulan penuh (bukan date-picker popover — untuk itu pakai fluent-text-field type="date" atau bangun sendiri di atas komponen ini).</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-calendar style="max-width:420px;"></fluent-calendar>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-calendar&gt;&lt;/fluent-calendar&gt;</code></pre>
    `;
  });
}
