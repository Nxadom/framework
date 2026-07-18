/** Hanya untuk Node (index.js). Browser: window.__NEXA_ENDPOINT__ dari HTML — GET /config.js diblokir. */
'use strict';

module.exports = {
  url: 'http://localhost:4019',
  electronInitialPath: '/beranda',
  /**
   * true = tolak semua rute HTTP jika Host bukan localhost atau 127.0.0.1 (blok akses lewat IP LAN di browser).
   * Override: env NEXA_LOCALHOST_ONLY=1 (sama efeknya). Matikan jika butuh QR / HP di jaringan yang sama.
   */
  restrictBrowserToLoopback: true,
  /**
   * true = wajib header X-Nexa-Electron-Internal. Hanya Electron menyisipkannya; browser biasa ditolak.
   * Matikan untuk `node index.js` / debugging tanpa Electron.
   * Rahasia: env NEXA_INTERNAL_ELECTRON_SECRET mengalahkan internalElectronSecret.
   */
  electronInternalOnly: true,
  /** Ganti string acak panjang di produksi; jangan commit rahasia ke repo publik. */
  internalElectronSecret: 'nexa-electron-internal-change-me-8f3a2b1c',
  /**
   * url jika menggunakan drive backend Nexa Dom Framework
   * URL API PHP/backend sebenarnya (boleh host/port lain).
   * server.js mem-proxy /api → host ini; browser disuntik same-origin …/api (bukan akses langsung ke URL ini).
   */
  urlApi: "http://localhost/api",
  /** Sama pola: path /assets/drive di origin SPA di-proxy ke URL ini jika beda host */
  drive: "http://localhost/assets/drive",


  // url jika menggunakan rebit backend sisipkan ke public di Framework anda folder rebit
  NXAPI: `http://localhost:8006/nxapi`,


  // url typicode backend umum baca dokuentasi NXUI.Storage().api(row, body) 
  typicode: "https://jsonplaceholder.typicode.com/photos?_limit=5",
  // jika tidak menggunakan firebase backend maka isi dengan false
  firebaseConfig: false,
  // buat variable api backend anda di Framework anda dengan nama apiBackend dan ases megunakan NEXA.apiBackend
  // CONTOH:
  //apiBackend: "http://localhost/api",
};
