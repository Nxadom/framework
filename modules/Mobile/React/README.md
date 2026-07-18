# React (Mobile)

Modul wajib untuk validasi impor `Nxdom` di proyek Expo.

- **Path proyek:** `assets/modules/React/NexaJSImports.mjs`
- **Dipanggil oleh:** `npm run check:nxdom-imports` (prestart, precommit, …)

Pastikan semua impor framework memakai specifier persis `"Nxdom"`, bukan `NexaJS` / `nexaui`.
