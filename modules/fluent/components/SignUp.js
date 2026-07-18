// Export function untuk route 'fluent/SignUp' (autoload: templates/fluent/SignUp.js)
import { defineFluent } from '/assets/modules/fluent/NexaFluent.js';

export async function fluent_SignUp(page, route) {
  route.register(page, async (routeName, container, routeMeta = {
    title: "Fluent Sign Up | App",
    description: "Contoh form sign up menggunakan Fluent UI Web Components.",
  }, style, nav = {}) => {
    route.routeMetaByRoute.set(page, routeMeta);

    container.innerHTML = `
      <div class="main-panel">
        <section class="nx-page">
          <h1 class="nx-page__title">Sign Up</h1>
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
      <h1 class="nx-page__title">Sign Up</h1>
      <p class="nx-page__lead">Contoh form daftar (sign up) menggunakan fluent-card, fluent-text-field, fluent-checkbox, dan fluent-button.</p>
      <p class="nx-page__nav"><a href="/fluent_demo">&larr; Kembali ke daftar komponen</a></p>

      <h2 class="nx-page__subtitle">Contoh</h2>
      <fluent-card style="padding:24px; max-width:360px;">
        <form id="nx-signup-form">
          <h3 style="margin:0 0 4px;">Buat akun baru</h3>
          <p style="margin:0 0 16px; color:var(--nx-readme-muted,#4b5563);">Lengkapi data di bawah untuk mendaftar.</p>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <fluent-text-field placeholder="Nama lengkap" required></fluent-text-field>
            <fluent-text-field type="email" placeholder="Email" required></fluent-text-field>
            <fluent-text-field type="password" placeholder="Kata sandi" required></fluent-text-field>
            <fluent-text-field type="password" placeholder="Konfirmasi kata sandi" required></fluent-text-field>
            <fluent-checkbox required>Saya setuju dengan syarat & ketentuan</fluent-checkbox>
            <fluent-button type="submit" appearance="accent" style="width:100%;">Sign Up</fluent-button>
          </div>

          <p style="margin:16px 0 0; font-size:13px; color:var(--nx-readme-muted,#4b5563);">
            Sudah punya akun? <a href="/fluent_SignIn">Masuk di sini</a>
          </p>
        </form>
      </fluent-card>

      <h2 class="nx-page__subtitle">Contoh Kode</h2>
      <pre style="background:var(--nx-readme-bg,#f9fafb); border:1px solid #e5e7eb; border-radius:8px; padding:12px; overflow-x:auto;"><code>&lt;fluent-card style="padding:24px;"&gt;
  &lt;form&gt;
    &lt;fluent-text-field placeholder="Nama lengkap" required&gt;&lt;/fluent-text-field&gt;
    &lt;fluent-text-field type="email" placeholder="Email" required&gt;&lt;/fluent-text-field&gt;
    &lt;fluent-text-field type="password" placeholder="Kata sandi" required&gt;&lt;/fluent-text-field&gt;
    &lt;fluent-checkbox required&gt;Saya setuju dengan syarat & ketentuan&lt;/fluent-checkbox&gt;
    &lt;fluent-button type="submit" appearance="accent"&gt;Sign Up&lt;/fluent-button&gt;
  &lt;/form&gt;
&lt;/fluent-card&gt;</code></pre>
    `;

    const form = container.querySelector('#nx-signup-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  });
}
