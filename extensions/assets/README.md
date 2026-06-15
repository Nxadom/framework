# assets/

Taruh file aset extension Anda di sini: gambar, SVG, ikon kustom, dll.

Referensikan dari `sidebar.js` atau `panel.js` dengan path relatif:

```javascript
// Gunakan import.meta.url untuk path absolut yang benar
const base = new URL('.', import.meta.url).href;
const iconUrl = `${base}assets/my-icon.svg`;
```

Atau langsung di HTML:

```javascript
container.innerHTML = `
  <img src="${new URL('./assets/logo.png', import.meta.url).href}" alt="Logo" />
`;
```

Lihat `../README.md` bagian **Aturan Baku — Icon** untuk panduan lengkap pemakaian icon.
