// Export function untuk route 'fluent/SignIn' (autoload: templates/fluent/SignIn.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_SignIn(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Sign In | App",
    description: "Contoh form sign in menggunakan Fluent UI Web Components.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">Sign In</h1>
          <p class="nx-page__lead">Memuat komponen…</p>
        </section>
      </div>
    `;

    try {
      await defineFluent(['fluentCard', 'fluentTextField', 'fluentCheckbox', 'fluentButton']);
    } catch (err) {
      container.querySelector('.nx-page').innerHTML += `
        <p class="nx-clone__status nx-clone__status--error">Gagal memuat Fluent UI Web Components: ${err?.message || err}</p>
      `;
      return;
    }

    container.querySelector('.nx-page').innerHTML = `
      <h1 class="nx-page__title">Sign In</h1>
      <p class="nx-page__lead">Contoh form masuk (sign in) menggunakan fluent-card, fluent-text-field, fluent-checkbox, dan fluent-button.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-card style="padding:24px; max-width:360px;">
        <form id="nx-signin-form">
          <h3 style="margin:0 0 4px;">Masuk ke akun</h3>
          <p style="margin:0 0 16px; color:var(--nx-readme-muted,#4b5563);">Silakan masukkan email dan kata sandi Anda.</p>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <fluent-text-field type="email" placeholder="Email" required></fluent-text-field>
            <fluent-text-field type="password" placeholder="Kata sandi" required></fluent-text-field>

            <div style="display:flex; align-items:center; justify-content:space-between;">
              <fluent-checkbox>Ingat saya</fluent-checkbox>
              <a href="#" style="font-size:13px;">Lupa kata sandi?</a>
            </div>

            <fluent-button type="submit" appearance="accent" style="width:100%;">Sign In</fluent-button>
          </div>

          <p style="margin:16px 0 0; font-size:13px; color:var(--nx-readme-muted,#4b5563);">
            Belum punya akun? <a href="/fluent_SignUp">Daftar di sini</a>
          </p>
        </form>
      </fluent-card>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-card style="padding:24px;"&gt;
  &lt;form&gt;
    &lt;fluent-text-field type="email" placeholder="Email" required&gt;&lt;/fluent-text-field&gt;
    &lt;fluent-text-field type="password" placeholder="Kata sandi" required&gt;&lt;/fluent-text-field&gt;
    &lt;fluent-checkbox&gt;Ingat saya&lt;/fluent-checkbox&gt;
    &lt;fluent-button type="submit" appearance="accent"&gt;Sign In&lt;/fluent-button&gt;
  &lt;/form&gt;
&lt;/fluent-card&gt;</code></pre>
    `;

    const form = container.querySelector('#nx-signin-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  });
}
