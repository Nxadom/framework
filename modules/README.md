# nxdom.js — NXUI Global Entry Point

**nxdom.js** adalah modul *entry point* utama framework **Nexa UI** yang membuat seluruh antarmuka tersedia secara global melalui `window.NXUI`, `window.nx`, dan `window.NX`.

---

## Daftar Isi

- [Cara Kerja](#cara-kerja)
- [Global API](#global-api)
  - [`window.NXUI` / `window.NX`](#windownxui--windownx)
  - [`window.nx`](#windownx)
  - [`window.NEXA`](#windownexa)
- [Core Classes](#core-classes)
  - [NexaPage (alias Page, Tatiye)](#nexapage-alias-page-tatiye)
  - [Screen](#screen)
- [Routing & Navigation](#routing--navigation)
  - [NXUI.load](#nxuiload)
  - [NXUI.Refresh](#nxuirefresh)
- [Fluent Element Builder (HTML Builder)](#fluent-element-builder-html-builder)
- [Utility Functions](#utility-functions)
  - [createSlug / parseSlug / extractIdFromSlug](#createslug--parseslug--extractidfromslug)
  - [Css()](#css)
  - [Prism / highlightPrismBlocks](#prism--highlightprismblocks)
  - [initSelect2 / onSelect2Change / onSelect2Open](#initselect2--onselect2change--onselect2open)
  - [htmlDecode](#htmldecode)
- [NexaWindow — Window State Utility](#nexawindow--window-state-utility)
- [Map / Render Helpers](#map--render-helpers)
- [NXUI.Worker — Web Worker HTML Builder](#nxuiworker--web-worker-html-builder)
- [NexaForgeView (Template Engine)](#nexaforgeview-template-engine)
- [NXUI.applications() / NXUI.appBuckets()](#nxuiapplications--nxuiappbuckets)
- [NXUI.nexaWorker / NXUI.nexaServiceWorkerRegistration](#nxuinexaworker--nxuinexaserviceworkeregistration)
- [Markdown & HTML Loader](#markdown--html-loader)
  - [NXUI.html()](#nxuihtml)
  - [NXUI.Markdown()](#nxuimarkdown)
- [Storage & Database](#storage--database)
  - [NXUI.Storage](#nxuistorage)
  - [NXUI.NexaDb (getDb)](#nxuinexadb-getdb)
  - [NXUI.NexaFetch](#nxuinexafetch)
  - [NXUI.NexaModels / NXUI.NexaAwait](#nxuinexamodels--nxuinexaawait)
  - [NXUI.BuildQuery](#nxuibuildquery)
- [Security & Crypto](#security--crypto)
  - [NXUI.Crypto / NXUI.Secure](#nxuicrypto--nxuisecure)
  - [NXUI.checkLicense / NXUI.syncNexaAuth](#nxuichecklicense--nxuisyncnexaauth)
- [Workers (Web Worker & Service Worker)](#workers-web-worker--service-worker)
  - [NXUI.initNexaWorker](#nxuiinitnexaworker)
  - [NXUI.initNexaServiceWorker](#nxuiinitnexaserviceworker)
- [Components Reference](#components-reference)
  - [Modal](#modal)
  - [Tables](#tables)
  - [Form](#form)
  - [Wizard (FormWizard)](#wizard-formwizard)
  - [Sidebar](#sidebar)
  - [Dropdown](#dropdown)
  - [Grid](#grid)
  - [Layer](#layer)
  - [Split](#split)
  - [Tags](#tags)
  - [Chart & Heatmap](#chart--heatmap)
  - [Checkable (Checkbox / Radio)](#checkable-checkbox--radio)
  - [Sortable](#sortable)
  - [Scroll](#scroll)
  - [Filter](#filter)
  - [Field (Inline Edit)](#field-inline-edit)
  - [Editor](#editor)
  - [Terminal](#terminal)
  - [Electron Components](#electron-components)
  - [Lightbox](#lightbox)
  - [Qrcode](#qrcode)
  - [Prind (Printing)](#prind-printing)
  - [Escpos](#escpos)
  - [Codemirror](#codemirror)
  - [Markdown Renderer](#markdown-renderer)
  - [Voice (TTS)](#voice-tts)
  - [Network](#network)
  - [Geolocation](#geolocation)
  - [Click Sound](#click-sound)
  - [Mode](#mode)
  - [Event System](#event-system)
  - [Svg & svgContent](#svg--svgcontent)
  - [Dimensi](#dimensi)
  - [Stylesheet](#stylesheet)
  - [Script Loader](#script-loader)
  - [Federated](#federated)
  - [Notification (Notifikasi)](#notification-notifikasi)
  - [Json Viewer](#json-viewer)
  - [Debug](#debug)
  - [Payload](#payload)
  - [Wilayah (Propinsi / Kabupaten)](#wilayah-propinsi--kabupaten)
  - [Type / fileType](#type--filetype)
- [Modules Map (Import Dependencies)](#modules-map-import-dependencies)
- [Exports](#exports)

---

## Cara Kerja

1. **Import** semua sub-modul dari folder `assets/modules/*` (Route, Event, dom, form, chart, storage, dll).
2. **Inisialisasi global object** `window.NXUI`, `window.nx`, `window.NX` dengan **Proxy** yang:
   - Auto-sync data property (non-function) ke `window`.
   - Fallback get ke `window` bila property tidak ditemukan di NXUI.
3. **Tunggu `NEXA.url`** dari registrasi `NexaPage` (App.js), lalu inisialisasi IndexedDB (`NexaDb`).
4. **Dispatch event** `nxuiReady` saat DOM siap.

> Akses via `NX.*` atau `NXUI.*` sama persis — referensi objek yang sama.

---

## Global API

### `window.NXUI` / `window.NX`

Semua method dan kelas framework tersedia di sini. `NX` adalah alias identik dari `NXUI`.

```

// Contoh akses
NXUI.Page(config);          // inisialisasi halaman
NX.load('blog');             // navigasi
NXUI.div().class('card').html('Halo');  // fluent builder
NX.Storage().users().get();  // IndexedDB
NX.Crypto("key").encode("data");

```

### `window.nx`

Shorthand dengan tambahan akses langsung ke instance internal:
- `nx._global` — instance `NexaGlobal`
- `nx._ui` — instance `NexaKit`

Setiap fungsi yang ditetapkan ke `nx` otomatis disalin ke `window` (backward compatibility untuk callback modal).

### `window.NEXA`

Object konfigurasi global yang diisi otomatis:
- `NEXA.url` — base URL aplikasi (dari `NexaPage`)
- `NEXA.userId` — ID user saat ini
- `NEXA.apiBase` — base URL API (default: `{url}/api`)
- `NEXA.endpoint` — kumpulan endpoint multi-API
- `NEXA.controllers` — controller storage & packages
- `NEXA.credential` / `NEXA.oauth` — data autentikasi
- `NEXA.tabel` — data tabel persistent
- `NEXA.worker` — status Web Worker

---

## Core Classes

### NexaPage (alias Page, Tatiye)

**Constructor halaman utama SPA.** Menerima konfigurasi routing, endpoint, dan event.

```javascript
// Cara 1: NXUI.Page
new NXUI.Page(config);

// Cara 2: NXUI.Tatiye (factory)
new NXUI.Tatiye(config).run();       // → new NexaPage(config)
```

`config` minimal:
| Properti | Tipe | Deskripsi |
|----------|------|-----------|
| `url` | string | Base URL aplikasi |
| `routes` | object | Definisi route SPA |
| `endpoint` | object | Endpoint API |
| `urlApi` | string | Base URL API |
| `appRoot` | string | Folder template (default: `"template"`) |

Method penting:
- `NXUI.setPageMeta({ title, description, ... })` — update title & meta tag SPA
- `NXUI.syncNexaEndpoints(endpoint)` — sinkron endpoint ke `NEXA.endpoint`
- `NXUI.updateNEXAUrl(url, urlApi)` — update `NEXA.url` & `NEXA.apiBase`

---

### Screen

**Abstraksi untuk render berbagai tipe screen (form, modal, wizard, tabel, native).**

```javascript
// Static registry — daftarkan screen handler kustom
NXUI.Screen.register('nama_saya', async (screen) => {
  // render screen.data
});

// Eksekusi
const screen = new NXUI.Screen(data);
await screen.run('nama_saya');
await screen.forms();
await screen.modal();
await screen.wizard();
await screen.datatable();
await screen.tabel();     // alias datatable
await screen.native();
```

**Handler bawaan:**
| Tipe | Kelas Target |
|------|-------------|
| `forms` | `NexaFormsScreen.render` |
| `modal` | `NexaModalScreen.render` |
| `wizard` | `NexaWizardScreen.render` |
| `datatable` | `NexaTabelScreen.render` |
| `tabel` | alias `datatable` |
| `native` | `NexaNativeScreen.render` |

Data otomatis dinormalisasi: `payload.userId` → `payload.userid`.

---

## Routing & Navigation

### NXUI.load

**Navigasi programatik ke route SPA** — delegasi ke `window.nexaRoute.navigate`.

```javascript
await NXUI.load('blog');              // pushState = true
await NXUI.load('contact/data', false);  // replaceState
await NXUI.load('blog', { pushState: false });
```

### NXUI.Refresh

**Refresh view SPA dan partial DOM update.**

```javascript
// Refresh penuh — reload route aktif
await NXUI.Refresh.refresh();
await NXUI.Refresh.refresh({ route: 'contact/data' });
await NXUI.Refresh.refresh({ hard: true });  // reload browser

// Partial — update satu node DOM
await NXUI.Refresh.partial({
  target: '#list',                // selector atau Element
  scope: '#main',                 // scope pencarian (default: #main)
  html: '<ul>...</ul>',           // innerHTML string
  render: async () => html,       // atau render function
  update: (el) => { el.innerHTML = '...'; },  // atau update langsung
  event: true,                    // dispatch nxui:partialRefresh (default true)
  keepScroll: true,               // pertahankan scroll nx_body_*
});
```

`scope` bisa `null` / `false` untuk mencari di seluruh `document`.

---

## Fluent Element Builder (HTML Builder)

Membangun string HTML dengan method chaining. Setiap method mengembalikan instance `NexaKit` builder.

```javascript
// Sintaks
NXUI.div()
  .id('box')
  .class('card rounded')
  .style({ color: 'red', marginTop: '20px' })
  .html('Hello World')
// → '<div id="box" class="card rounded" style="color: red; margin-top: 20px;">Hello World</div>'

// Builder di Web Worker
const html = await NXUI.div().id('box').container().p().view('Halo').worker();
```

**Tag tersedia:**
`tag`, `div`, `span`, `p`, `a`, `button`, `btn`, `input`, `textarea`, `ul`, `ol`, `li`, `h1`-`h6`, `img`, `section`, `article`, `footer`, `nav`, `aside`, `table`, `thead`, `tbody`, `tr`, `td`, `th`, `strong`, `em`, `small`, `code`, `pre`, `blockquote`, `icon`, `form`, `label`, `select`, `option`, `fieldset`, `legend`, `header`, `main`, `details`, `summary`.

**Method akses DOM via NexaKit:**
| Method | Deskripsi |
|--------|-----------|
| `NXUI.id(id)` | `document.getElementById(id)` |
| `NXUI.class(name)` | `document.getElementsByClassName(name)` |
| `NXUI.classAll(name)` | Semua elemen dengan class |
| `NXUI.selector(css)` | `document.querySelector(css)` |
| `NXUI.selectorAll(css)` | `document.querySelectorAll(css)` |
| `NXUI.createElement(tag, attr?)` | Buat elemen DOM |
| `NXUI.uiHtml(selector, value?)` | Get/set innerHTML via selector |
| `NXUI.addID(selector, id)` | Tambah id ke elemen |
| `NXUI.ui` | Instance NexaKit langsung |
| `NXUI.$(selector)` | Shortcut: `#id` → byId, `.class` → byClass, else → querySelector |
| `NXUI.element(selector)` | Sama seperti `$` |

---

## Utility Functions

### createSlug / parseSlug / extractIdFromSlug

**Pembuatan & parsing slug URL** dengan dukungan tanggal publikasi.

```javascript
// Bentuk dasar
NXUI.createSlug('Judul Artikel', 42, 'blog');
// → "judul-artikel" + simpan mapping (42) di sessionStorage & localStorage

// Dengan tanggal
NXUI.createSlug('2025-07-15', 'Judul Artikel', 42, 'blog');
// → "2025/07/15/judul-artikel" + simpan id

// Dapatkan teks asli dari slug
NXUI.parseSlug('judul-artikel');
// → "Judul Artikel"

// Ekstrak id dari slug (format: slug--id)
NXUI.extractIdFromSlug('judul-artikel--42');
// → "42"

// Ambil id tersimpan
NXUI.getSlugId('judul-artikel', 'blog');

// Set mapping manual
NXUI.setSlugId('judul-artikel', 42, 'blog');
```

### Css()

**Muat stylesheet** ke `<head>` dengan proteksi duplikasi.

```javascript
NXUI.Css('/dashboard/style.css');
NXUI.Css(['theme.css', 'print.css']);
// Path relatif → /templates/{path}
```

### Prism / highlightPrismBlocks

**Syntax highlighting** untuk code block menggunakan Prism.js (lokal atau CDN).

```javascript
// Highlight semua code block di container
await NXUI.prism('#content');
await NXUI.prism(document.getElementById('content'));

// Atau via alias
await NXUI.highlightPrismBlocks('#content');
```

### initSelect2 / onSelect2Change / onSelect2Open

**Inisialisasi Select2** (jQuery + Select2 wajib ada).

```javascript
NXUI.initSelect2('#my-select', {
  placeholder: 'Pilih...',
  allowClear: true,
  width: '100%',
});

NXUI.onSelect2Change('#my-select', (e) => console.log(e.params.data));
NXUI.onSelect2Open('#my-select', () => console.log('opened'));
```

### htmlDecode

**Decode HTML entities** (`&amp;` → `&`, `&lt;` → `<`, dll).

```javascript
NXUI.htmlDecode('Nama &amp; Alamat');
// → "Nama & Alamat"
```

---

## NexaWindow — Window State Utility

**Deteksi state jendela Electron** (maximize/restore) dan dimensi viewport, tanpa perlu IPC.

```javascript
// Cek maximize
if (NXUI.Window.isMaximized()) { /* ... */ }

// Kolom grid responsif
const treeCol = NXUI.Window.treeCol({
  maximize: 'nx-col-2',
  restore: 'nx-col-3'
});
const contentCol = NXUI.Window.contentCol({
  maximize: 'nx-col-10',
  restore: 'nx-col-9'
});

// Dimensi viewport
NXUI.Window.width();          // innerWidth
NXUI.Window.height();          // innerHeight
NXUI.Window.screenWidth();     // screen.availWidth
NXUI.Window.screenHeight();    // screen.availHeight
NXUI.Window.size();            // { w, h, sw, sh }

// Breakpoint (Bootstrap-like)
NXUI.Window.breakpoint();     // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

// Listener resize
const unsub = NXUI.Window.onResize((isMaximized) => {
  console.log('Window maximized:', isMaximized);
});
// unsub() untuk melepas listener

// Helper dimensi untuk NexaRoute.Layer
NXUI.Window.dimensi({ short: 75, normal: 75, large: 75, unit: 'vh' });
// → [subtract_px, unit] — menyesuaikan tinggi viewport
```

---

## Map / Render Helpers

**String builder dari array** — alternatif ringan tanpa virtual DOM.

```javascript
// Synchronous
const html = NXUI.mapJoin(users, (user, i) =>
  `<li>${user.nama}</li>`
, '');

// Alias
NXUI.render(users, fn, joiner);

// Asynchronous — fn boleh async
const html = await NXUI.map(products, async (item, i) =>
  `<div>${await item.render()}</div>`
);
```

---

## NXUI.Worker — Web Worker HTML Builder

**Bangun HTML di Web Worker thread** agar tidak memblokir UI. Worker menggunakan `NexaBuilderWorker.js`.

```javascript
const html = await NXUI.Worker.build({
  tag: 'div',
  a: { id: 'box', class: 'card' },
  c: [
    { tag: 'p', t: 'Hello' }
  ]
});

// Map array di worker — fn menerima (item, index, NX)
const html = await NXUI.Worker.buildMap(products, (item, i, NX) =>
  NX.div().class('card').container()
    .p().view(item.name)
    .span().view(item.price)
);

// Pretty-print HTML
const pretty = await NXUI.Worker.pretty('<div><p>Hi</p></div>');

// Cek kesiapan
if (NXUI.Worker.ready) { /* ... */ }
```

---

## NexaForgeView (Template Engine)

**Render HTML template dengan hydrasi data** — dari `NexaForge.js`.

```javascript
// Class
const view = new NXUI.NexaForgeView(config);

// Hydrate list template: isi {{user.nama}} dari data
view.hydrate(container, { user: [...] });

// Alias (deprecated — tetap kompatibel)
NXUI.NexaHtmlView;    // sama dengan NexaForgeView
```
`NexaForge.hydrate` juga tersedia di response `NXUI.html()` dan `NXUI.Markdown()`.

---

## NXUI.applications() / NXUI.appBuckets()

**Factory decode aplikasi & buckets** — mengambil token dari Storage, decode dengan Crypto, dan simpan.

```javascript
// Decode aplikasi
const app = await NXUI.applications('app-name', data);
// Menggunakan NXUI.Crypto("NexaApp") + Storage().sdk(...)

// Decode buckets
const buckets = await NXUI.appBuckets('bucket-name', data);
// Menggunakan NXUI.Crypto("NexaBuckets") + Storage().sdk(...)
// Otomatis menyimpan ke IndexedDB: NXUI.ref.set('nexaStore', Config)
```

---

## NXUI.nexaWorker / NXUI.nexaServiceWorkerRegistration

**Bridge langsung ke Web Worker dan Service Worker.**

```javascript
// Web Worker bridge — diisi oleh NXUI.initNexaWorker()
if (NXUI.nexaWorker) {
  // Fetch Storage lewat Worker thread
  const result = await NXUI.nexaWorker.Storage().users().get({ id: 1 });
}

// Service Worker registration — diisi oleh NXUI.initNexaServiceWorker()
if (NXUI.nexaServiceWorkerRegistration) {
  NXUI.nexaServiceWorkerRegistration.active.postMessage({ type: 'sync' });
}
```

---

## Markdown & HTML Loader

### NXUI.html()

**Muat fragmen HTML statis** via GET dari folder template (bukan POST eventload).

```javascript
const result = await NXUI.html('file-name', { key: 'value' }, 'template-folder');
// GET /{appRoot}/file-name.html

// Dengan template origin kustom
const result = await NXUI.html('konten', {}, null, {
  templateOrigin: 'https://cdn.example.com'
});

// Substitusi {{kunci}} dan {kunci}
// result.success, result.content, result.hydrate(container, lists)
```

### NXUI.Markdown()

**Muat file `.md`** dari folder template, render ke HTML via `marked` (esm.sh), plus syntax highlighting Prism.

```javascript
const result = await NXUI.Markdown('artikel', { key: 'value' }, 'markdown');
// GET /{appRoot}/artikel.md
// Fallback: GET /assets/markdown/artikel.md

// Dari string langsung
const result = await NXUI.Markdown('# Hello', {}, null, { fromString: true });

// Method hasil:
result.content;              // HTML
result.insertAndHighlight('#container');  // innerHTML + Prism highlight
result.highlight(containerEl);            // highlight saja
result.getContent();                       // dapatkan HTML
await result.ensurePrismLoaded();          // muat Prism manual
result.hydrate(container, lists);          // NexaForge hydrate
```

> **Catatan:** Jika server mengembalikan HTML (bukan MD), coba fallback ke `/assets/markdown/{file}.md`.

---

## Storage & Database

### NXUI.Storage()

**Akses IndexedDB** melalui bucket/table system (`NexaDb` + `Storage`).

```javascript
const db = NXUI.Storage();
// db.namaTable().method(data);

// Contoh: model "users"
const users = await NXUI.Storage().users().get({ id: 1 });
await NXUI.Storage().products().set({ id: 5, name: 'Meja' });

// SDK
await NXUI.Storage().sdk('apps/buckets', data);
```

### NXUI.NexaDb (getDb)

**Referensi langsung ke IndexedDB** untuk query lanjutan.

```javascript
const ref = await NXUI.getDb();  // atau NXUI.ref
await ref.get('bucketsStore', 'credential');
await ref.set('bucketsStore', { id: 'credential', ...data });
await ref.delete('bucketsStore', 'credential');
```

### NXUI.NexaFetch

**HTTP client internal** — digunakan oleh `html()`, `Markdown()`, dan Storage.

```javascript
// Di belakang layar untuk GET/POST
await NXUI.NexaFetch.get(url, options);
```

### NXUI.NexaModels / NXUI.NexaAwait

**Model definitions** dan **await queue** untuk manajemen request IndexedDB.

```javascript
NXUI.Models;   // definisi model
NXUI.Await;    // helper async
```

### NXUI.BuildQuery

**Query builder** untuk IndexedDB — menyusun query WHERE, JOIN, ORDER.

```javascript
NXUI.BuildQuery;
```

### StorageModelData

**Shortcut** untuk `Storage().model()` + hook where/join — disediakan sebagai `NXUI.StorageModelData`.

```javascript
// StorageModelData → { model, select?, query?(builder) }
```

---

## Security & Crypto

### NXUI.Crypto / NXUI.Secure

**Enkripsi/dekripsi** dengan XOR + Base64.

```javascript
// Tanpa key — method dasar
NXUI.Crypto().encode('data');
NXUI.Crypto().decode('ZW5j');

// Dengan key — method lanjutan
const c = NXUI.Crypto('MySecretKey');
c.encodeWithKey('data sensitif');
c.decodeWithKey('ZXhj...');
c.createKey('string');
c.isValidBase64('data');
c.generateKey(16);
c.isSupported();

// Shortcut
NXUI.Secure;  // alias NexaEncrypt
```

### NXUI.checkLicense / NXUI.syncNexaAuth

**Manajemen lisensi dan autentikasi.**

```javascript
// Validasi lisensi — otomatis redirect ke 'licenses' jika expired
const cred = await NXUI.checkLicense();
if (!cred) return;

// Sinkron credential & oauth dari IndexedDB
await NXUI.syncNexaAuth();
// atau:
await NXUI.syncNexaAuth({ credential: {...}, oauth: {...} });

// Apply userId dari oauth/credential
NXUI.applyNexaUserIdFromAuth();
```

---

## Workers (Web Worker & Service Worker)

### NXUI.initNexaWorker

**Aktifkan Web Worker** untuk fetch API Storage di thread terpisah.

```javascript
NXUI.initNexaWorker({
  enabled: true,
  storage: true,
  workerUrl: '/custom-worker.js',
  debug: true,       // atau ?nexaWorkerDebug=1
});

// Status: window.NEXA.worker.ready
// Event: nexaWorkerReady, nexaWorkerFailed
```

### NXUI.initNexaServiceWorker

**Registrasi Service Worker** untuk caching dan background sync.

```javascript
// Register — simpan di NXUI.nexaServiceWorkerRegistration
await NXUI.initNexaServiceWorker({
  enabled: true,
  scriptUrl: '/sw.js',
  scope: '/',
  backgroundSync: true,
});

// Unregister
await NXUI.unregisterNexaServiceWorker({ scriptUrl: '/sw.js' });

// Background Sync
await NXUI.registerNexaBackgroundSync('my-custom-tag');
```

---

## Components Reference

### Modal

**Dialog modal dinamis.** Dua pendekatan:

```javascript
// 1. Class — bangun DOM dinamis
const modal = new NXUI.Modal(config);

// 2. Static open/close — delegasi ke nexaModal
NXUI.Modal.open('modal-id', { data: '...' });
NXUI.Modal.close('modal-id', true);  // force close

// 3. Inisialisasi stylesheet
NXUI.ensureModalStylesheet();
```

| Export | Deskripsi |
|--------|-----------|
| `NexaModal` | Class constructor |
| `nexaModal` | Instance global |
| `modalHTML` | Object: `modalHTML(config)` + `modalHTML.open/close` |
| `ensureModalStylesheet` | Inject CSS |

### Tables

**Render tabel data dari storage response.**

```javascript
// Render tabel
NXUI.Tables.render(data, container);

// Inisialisasi stylesheet
NXUI.ensureTableStylesheet();

// Helper ekstrak rows
NXUI.rowsFromStorageResponse(response);
```

| Export | Deskripsi |
|--------|-----------|
| `NexaTables` | Class utama |
| `ensureTableStylesheet` | CSS inject |
| `rowsFromStorageResponse` | Normalisasi response |

### Form

**Form generator dinamis** dengan event system.

```javascript
const form = new NXUI.Form(config);
NXUI.ensureFormStylesheet();
```

### Wizard (FormWizard)

**Form multi-step (step-by-step)** — turunan dari `NexaWizard`.

```javascript
const wizard = new NXUI.FormWizard(config);
// atau
NXUI.NexaWizard;
```

### Sidebar

**Sidebar navigasi** dengan inisialisasi & instance management.

```javascript
// Inisialisasi
NXUI.initSidebar(config);

// Dapatkan instance
const sidebar = NXUI.getSidebarInstance();

// Update path aktif
NXUI.updateSidebarPath('/blog/edit');
```

### Dropdown

**Komponen dropdown** reusable.

```javascript
new NXUI.Dropdown(config);
```

### Grid

**Layout grid dinamis.**

```javascript
const grid = new NXUI.Grid(config);   // constructor
NXUI.grid;                            // instance singleton
```

### Layer

**Layer/panel** — komponen layout bertumpuk.

```javascript
new NXUI.Layer(config);
```

### Split

**Panel terpisah (split view)** — bisa di-resize.

```javascript
new NXUI.Split(config);
```

### Tags

**Input tags/chips.**

```javascript
new NXUI.Tags(config);
```

### Chart & Heatmap

**Grafik (chart.umd.min.js)** dan heatmap.

```javascript
// Chart
NXUI.Chart({ type: 'bar', data: [...], ... });
// atau
NexaChart.create(opts);

// Heatmap
new NXUI.Heatmap(config);
```

### Checkable (Checkbox / Radio)

**Checkbox & radio** dengan event handler.

```javascript
new NXUI.Checkable(config);        // (rekomendasi)
new NXUI.Checkbox(config);         // alias
// Juga: NXUI.NexaCheckable / NXUI.NexaCheckbox
```

### Sortable

**Drag & drop reorder.**

```javascript
new NXUI.Sortable(config);
```

### Scroll

**Custom scroll** untuk container.

```javascript
new NXUI.Scroll(config);
```

### Filter

**Filter data** array/collection.

```javascript
NXUI.Filter.filter(data, criteria);
```

### Field (Inline Edit)

**Inline editing** untuk elemen `.editable`.

```javascript
new NXUI.Field(config);      // (rekomendasi)
// Alias: NXUI.NexaField, NXUI.NexaChild
```

### Editor

**Rich text editor** — wrapper untuk editor konten.

```javascript
new NXUI.Editor(config);
```

### Terminal

**Terminal emulator** di browser — wrapper command-line.

```javascript
new NXUI.Terminal(config);
```

### Electron Components

**Jendela Electron sekunder + handoff** untuk multi-window.

```javascript
// Konstanta layout
NXUI.ROUTE_WINDOW_LAYOUT_SHELL;
NXUI.ROUTE_WINDOW_LAYOUT_COMPACT;
NXUI.ROUTE_WINDOW_HANDOFF_PREFIX;

// Class
NXUI.Electron.NexaElectron;
```

### Lightbox

**Gallery/image lightbox.**

```javascript
new NXUI.Lightbox(config);
```

### Qrcode

**Generate QR Code.**

```javascript
new NXUI.Qrcode(config);
```

### Prind (Printing)

**Sistem printing / cetak.**

```javascript
new NXUI.Prind(config);
```

### Escpos

**RAW ESC/POS byte builder** untuk printer thermal.

```javascript
NXUI.Escpos.encode(data);
```

### Codemirror

**Code editor** berbasis CodeMirror.

```javascript
new NXUI.Codemirror(config);
```

### Markdown Renderer

**Render markdown** (lewat NexaMarkdown).

```javascript
NXUI.md.render('# Hello');
```

### Voice (TTS)

**Text-to-Speech** via Web Speech API.

```javascript
const voice = new NXUI.Voice({
  lang: 'id-ID',
  rate: 1.0,
  pitch: 1.0,
});
voice.speak('Halo, selamat datang');
```

### Network

**Monitoring status jaringan** (online/offline).

```javascript
new NXUI.Network(config);
// Event: online, offline
```

### Geolocation

**Akses geolokasi** browser.

```javascript
new NXUI.Geolocation(config);
```

### Click Sound

**Efek suara klik** — otomatis inisialisasi saat DOM loaded.

```javascript
// Otomatis aktif sejak nxdom.js di-load
// Inisialisasi manual (jika perlu):
new NXUI.Click(config);
```

### Mode

**Mode aplikasi (terang/gelap, layout, dll).**

```javascript
new NXUI.Mode(config);
```

### Event System

**Global & local event system.**

```javascript
NXUI.Event;       // NexaEvent instance
NXUI.global;      // NexaGlobal instance

// Global data
NXUI.setData('key', value);
NXUI.getData('key');
NXUI.clearData('key');
NXUI.showAllData();

// Array & object inspection
NXUI.showArray(arr);          // console.table-like untuk array
NXUI.showObject(obj);         // inspect object properties

// Global data management (auto-sync ke window)
NXUI.setGlobal('key', value);    // set & sync ke window
NXUI.getGlobal('key');           // get dari NXUI atau window
NXUI.hasGlobal('key');           // cek eksistensi
NXUI.deleteGlobal('key');        // hapus dari NXUI & window

// Form & element data
NXUI.getFormData('formId');
NXUI.getElementData('elementId', true);
```

### Svg & svgContent

**String ikon SVG siap pakai** (`forgot`, `nexa`, `qr`, dll).

```javascript
NXUI.Svg;               // Instance
NXUI.svgContent;         // Object { forgot: '...', nexa: '...', qr: '...', ... }
```

### Dimensi

**Utility dimensi** — hitung tinggi/lebar responsif.

```javascript
NXUI.Dimensi.height(selector, subtract, unit);
```

### Stylesheet

**Inject stylesheet dinamis.**

```javascript
NXUI.Stylesheet(cssText);
```

### Script Loader

**Muat script ES / classic** secara dinamis (mode `Dom`, `NexaUi`, `modules`).

```javascript
NXUI.Script(src);
// Relatif ke folder assets/modules/
```

### Federated

**Federated data access** — akses data lintas bucket/table.

```javascript
new NXUI.Federated(config);
```

### Notification (Notifikasi)

**Sistem notifikasi** in-app.

```javascript
NXUI.Notifikasi.show({ title: 'Sukses', message: 'Data tersimpan' });
```

### Json Viewer

**Viewer JSON interaktif** di halaman.

```javascript
// Object-based
NXUI.Json({ payload: data, container: '#viewer', theme: 'light', expandAll: true });

// Function-based (3 arg)
NXUI.renderJson(container, payload, { theme: 'dark' });
```

| Export | Deskripsi |
|--------|-----------|
| `JsonViewer` | Class (dari bundle) |
| `NXUI.Json` | Factory function |
| `NXUI.renderJson` | Render ke container |

### Debug

**Debug panel** untuk development.

```javascript
NXUI.Debug;       // Full debug
NXUI.MinDebug;    // Minimal debug
```

### Payload

**Payload builder** untuk request storage.

```javascript
NXUI.Payload.build(data);
```

### Wilayah (Propinsi / Kabupaten)

**Data wilayah Indonesia** (provinsi & kabupaten).

```javascript
NXUI.Propinsi;        // daftar provinsi
NXUI.Kabupaten;       // daftar kabupaten
```

### Type / fileType

**Tipe file dan ikon preview** untuk upload/file manager.

```javascript
NXUI.fileType('pdf');
// → { icon: '...', color: '...', label: 'PDF' }
```

---

## Modules Map (Import Dependencies)

Berikut adalah semua sub-modul yang diimpor oleh `nxdom.js`:

| Folder | Modul | Kegunaan |
|--------|-------|----------|
| `./Route/` | `NexaRoute`, `NexaPage`, `setPageMeta` | Routing SPA |
| `./Event/` | `NexaGlobal`, `NexaEvent` | Event & global state |
| `./Kit/` | `NexaKit` | Fluent HTML builder |
| `./dimensi/` | `NexaDimensi` | Dimensi responsif |
| `./assets/` | `NexaStylesheet`, `NexaScript` | Dynamic CSS/JS loading |
| `./dom/` | `NexaDom`, `StorageData`, `storageModelStorageData` | DOM manipulation |
| `./field/` | `NexaField` | Inline editing |
| `./type/` | `NexaType`, `fileType` | File type utilities |
| `./split/` | `NexaSplit` | Split panel |
| `./forge/` | `NexaForge`, `NexaDomextractor` | HTML template engine |
| `./filter/` | `NexaFilter` | Data filtering |
| `./cards/` | `NexaLayer` | Layer/panel |
| `./spinner/` | `NexaSpinner` spinner | Loading spinner |
| `./check/` | `NexaCheckable` | Checkbox/radio |
| `./tags/` | `NexaTags` | Tag input |
| `./chart/` | `NexaChart`, `chart.umd.min.js` | Charts |
| `./heatmap/` | `NexaHeatmap`, `NexaHeatmapFactory` | Heatmap |
| `./forms/` | `NexaForm`, `NexaFormsScreen`, `ensureFormStylesheet` | Forms |
| `./wild/` | `NexaWild` | Wildcard utilities |
| `./flag/` | `wilayahPropinsi`, `wilayahKabupaten` | Indonesian regions |
| `./wizard/` | `NexaWizard`, `NexaWizardScreen` | Step forms |
| `./codemirror/` | `NexaCmirror` | Code editor |
| `./Qrcode/` | `NexaQrcode` | QR Code generator |
| `./Prind/` | `NexaPrind` | Printing |
| `./Escpos/` | `NexaEscpos` | ESC/POS printer |
| `./sortable/` | `NexaSortable` | Drag & drop |
| `./scroll/` | `NexaScroll` | Custom scroll |
| `./Link/` | `NexaLink`, `LinkDefault`, `NexaLinkUI` | Navigation links |
| `./Network/` | `NexaNetwork` | Network status |
| `./Geolocation/` | `NexaGeolocation` | Geolocation |
| `./Click/` | `NexaClick` | Click sound |
| `./Mode/` | `NexaMode` | App mode |
| `./editor/` | `NexaEditor` | Rich text editor |
| `./Json/` | `JsonViewer`, `index.js` | JSON viewer |
| `./tables/` | `NexaTables`, `NexaTabelScreen` | Tables |
| `./Buckets/` | `NexaDb`, `NexaFetch`, `Storage`, `NexaModels`, `NexaAwait`, `NexaEncrypt`, `NexaCrypto`, `NexaBuildQuery`, `NexaFederated`, `NexaPayload` | Database & crypto |
| `./Voice/` | `NexaVoice` | Text-to-Speech |
| `./Worker/` | `NexaWorkerClient`, `NexaBuilderWorker` | Web Workers |
| `./ServiceWorker/` | `registerNexaServiceWorker` | Service Worker |
| `./notifikasi/` | `NexaNotif` | Notifications |
| `./Storage/Buckets/` | `NexaBuckets` | Storage buckets |
| `./Dropdown/` | `NexaDropdown` | Dropdown component |
| `./Sidebar/` | `NexaSidebar` | Sidebar navigation |
| `./grid/` | `NexaGrid` | Grid layout |
| `./Svg/` | `Svg`, `svgContent` | SVG icons |
| `./modal/` | `NexaModal`, `NexaModalScreen` | Modal dialogs |
| `./Lightbox/` | `NexaLightbox` | Image lightbox |
| `./utilities/` | `jquery.js`, `jquery-ui.js` | jQuery & UI |
| `./select2/` | `select2.min.js` | Select2 library |
| `./Terminal/` | `NexaTerminal` | Terminal emulator |
| `./Electron/` | `NexaElectron` | Electron multi-window |
| `./native/` | `NexaNativeScreen` | Native screen |
| `./debug/` | `NexaDebug`, `NexaMinDebug` | Debug tools |
| `./markdown/` | `NexaMarkdown` | Markdown renderer |

---

## Exports

File ini mengekspor (ES6 module) berbagai kelas dan fungsi:

| Export | Deskripsi |
|--------|-----------|
| `NexaDb` | IndexedDB wrapper |
| `NexaRoute` / `NexaPage` / `Page` | Routing & page init |
| `NexaTatiye` / `Tatiye` | Factory page |
| `NexaGlobal` | Global data store |
| `NexaKit` | Fluent HTML builder |
| `NexaSidebar` + utilities (`initSidebar`, `getSidebarInstance`, `updateSidebarPath`) | Sidebar component |
| `NexaGrid` | Grid layout |
| `NexaModal` / `nexaModal` / `modalHTML` / `Modal` / `ensureModalStylesheet` | Modal |
| `NexaTables` / `ensureTableStylesheet` / `rowsFromStorageResponse` | Tables |
| `NexaForm` / `ensureFormStylesheet` | Form |
| `NexaWizard` / `NexaWild` | Wizard & wildcard |
| `createSlug` / `parseSlug` / `extractIdFromSlug` / `setSlugId` / `getSlugId` | Slug utilities |
| `NexaDomClass` / `StorageData` / `StorageModelData` | DOM & storage data |
| **`NexaDom()`** | **Alias fungsi → `NexaHtml()`** |
| **`NexaHtml()`** | **Factory HTML/Markdown loader** |
| **`Screen`** | **Screen abstraction class** |
| **`applications(row, data)`** | **Decode aplikasi dari Storage** |
| **`appBuckets(row, data)`** | **Decode buckets dari Storage** |
| **`htmlDecode`** | **Decode HTML entities** |
| `NexaForge` / `NexaDomextractor` | Template engine |
| `NexaType` / `Type` / `fileType` | Type utilities |
| `NexaElectron` / `Electron` + `ROUTE_WINDOW_LAYOUT_SHELL`, `ROUTE_WINDOW_LAYOUT_COMPACT`, `ROUTE_WINDOW_HANDOFF_PREFIX` | Electron components |
| `default` object | Semua export di atas dalam satu default export |

---

> **Catatan:** File ini otomatis mendispatch event `nxuiReady` saat inisialisasi selesai. Tunggu event ini sebelum menggunakan NXUI jika di-load secara defer/async:
>
> ```javascript
> window.addEventListener('nxuiReady', () => {
>   // NXUI siap digunakan
> });
> ```