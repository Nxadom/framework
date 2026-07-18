// Export function untuk route 'fluent/Accordion' (autoload: templates/fluent/Accordion.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_Accordion(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Accordion | App",
    description: "Showcase fluent-accordion & fluent-accordion-item (Fluent UI Web Components).",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">fluent-accordion</h1>
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
      <h1 class="nx-page__title">fluent-accordion</h1>
      <p class="nx-page__lead">Daftar panel yang bisa expand/collapse, satu atau beberapa sekaligus.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-accordion style="max-width:480px;">
        <fluent-accordion-item>
          <span slot="heading">Bagian 1</span>
          <p>Isi bagian pertama.</p>
        </fluent-accordion-item>
        <fluent-accordion-item>
          <span slot="heading">Bagian 2</span>
          <p>Isi bagian kedua.</p>
        </fluent-accordion-item>
      </fluent-accordion>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-accordion&gt;
  &lt;fluent-accordion-item&gt;
    &lt;span slot="heading"&gt;Bagian 1&lt;/span&gt;
    &lt;p&gt;Isi bagian.&lt;/p&gt;
  &lt;/fluent-accordion-item&gt;
&lt;/fluent-accordion&gt;</code></pre>
    `;
  });
}
