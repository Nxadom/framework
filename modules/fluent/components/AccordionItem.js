// Export function untuk route 'fluent/AccordionItem' (autoload: templates/fluent/AccordionItem.js)
// fluent-accordion-item selalu dipakai di dalam fluent-accordion — lihat juga /fluent/Accordion.
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_AccordionItem(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent AccordionItem | App",
    description: "Showcase fluent-accordion-item (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-accordion-item</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentAccordion', 'fluentAccordionItem']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">fluent-accordion-item</h1>
      <p class="nx-page__lead">Satu panel expand/collapse di dalam fluent-accordion. Slot "heading" untuk judul, konten default untuk isi. Atribut expanded untuk buka default.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a> · <a href="/fluent/Accordion">Lihat fluent-accordion</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-accordion style="max-width:480px;">
        <fluent-accordion-item expanded>
          <span slot="heading">Terbuka default</span>
          <p>Atribut expanded membuat panel ini terbuka saat pertama render.</p>
        </fluent-accordion-item>
      </fluent-accordion>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-accordion-item expanded&gt;
  &lt;span slot="heading"&gt;Judul&lt;/span&gt;
  &lt;p&gt;Isi panel.&lt;/p&gt;
&lt;/fluent-accordion-item&gt;</code></pre>
    `;
  });
}
