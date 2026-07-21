# NexaChat



Panel chat AI (bubble UI + integrasi `NX.Storage()`). Mandiri di `assets/modules/chat/`.



## Dependensi



Butuh modul `../markdown/` (sibling folder, sama-sama diimpor lewat `nxdom.js`) untuk merender balasan assistant sebagai Markdown — lihat `assets/modules/markdown/README.md`.



## Penggunaan



```javascript

import { NexaChat } from './assets/modules/chat/index.js';



const chat = new NexaChat({ container: '#nxchat-panel' });

```



`options.container` — selector string atau `Element`, fallback ke `#nxchat` kalau tidak diisi.



## Backend yang harus disediakan proyek

Modul ini **cuma frontend** — tidak membawa server AI apa pun. Proyek yang memasang modul ini wajib menyediakan sendiri:



1. Endpoint `POST /api/assistant` yang menerima body `{ message: string, history: Array<{role, text}> }` dan mengembalikan `{ status: "success", reply: string }` atau `{ status: "error", message: string }`.

2. Route itu dipanggil dari `sendMessage()` lewat `NX.Storage().api("assistant", {...})` — POST ke `{NEXA.apiBase}/assistant` (lihat dokumentasi `NX.Storage()` di katalog `Storage/`).



Contoh implementasi PHP lengkap (provider OpenRouter, RAG sederhana dari data dokumentasi situs, multi API key dengan fallback) ada di proyek `webnxdom` — `controllers/Api/AssistantController.php`. Bukan bagian dari katalog modul ini karena backend spesifik per-proyek (provider AI, cara simpan API key, dsb bisa beda-beda).



## API kelas `NexaChat`



| | |

|--|--|

| `constructor(options)` | `options.container`, `options.API`/`MODEL`/`CATALOG` (disiapkan, saat ini tidak dipakai — semua konfigurasi provider ditaruh di backend) |

| `.render()` | Render ulang shell panel (header, area pesan, form input) |

| `.addMessage(role, text)` | Tambah pesan ke `this.messages`, render ulang |

| `.sendMessage(text)` | Kirim pesan user ke `/api/assistant`, tampilkan balasan |

| `.close()` | Lepas class `.open` dari elemen `#nxchat` (parent, bukan container render) |



## Perilaku UI



- **Render Markdown** — bubble assistant dirender lewat `NexaMarkdown.fromContent(text).Chat(bubble)` (mode `chat` dari modul `../markdown/`), fallback ke `textContent` polos kalau render gagal. Bubble user selalu `textContent` (plain text).

- **Typing indicator** — 3 dot animasi muncul selagi menunggu balasan (`showTyping()`/`hideTyping()`), input & tombol kirim dinonaktifkan selama proses (`setSending()`).

- **Auto-scroll** — ke bawah otomatis tiap pesan baru, termasuk setelah render Markdown async selesai (supaya tinggi bubble final sudah dihitung, bukan scroll ke posisi bubble yang masih kosong/loading).

- **Cache-bypass** — body request ke `/api/assistant` disisipi `_nonce` unik per kirim, karena `NX.Storage().api()` otomatis cache respons (stale-while-revalidate via IndexedDB) berdasar hash body — tanpa nonce, pesan identik di sesi berbeda bisa dapat balasan lama yang ter-cache alih-alih tanya ulang ke backend.

- **Empty state** — teks disclaimer center (`.nxchat-empty`) saat `this.messages` masih kosong.



## CSS (`index.css`)



Semua class di-prefix `nxchat-` supaya tidak bentrok dengan class generik proyek. `.nxchat-container` pakai `width/height: 100%`, mengikuti ukuran wadah — bukan ukuran tetap. Style konten Markdown (`p`/`ul`/`code`/`pre`/heading di dalam bubble) di-namespace `.nxchat-msg-assistant .nexa-markdown-chat …`.



## Riwayat lengkap

Proses pengembangan modul ini (termasuk beberapa insiden & perbaikannya — dobel penggunaan elemen `#nxchat`, chat hilang setelah navigasi SPA, timeout, cache basi, MIME type `.mjs`, dsb) didokumentasikan lengkap di proyek asalnya, `webnxdom` (`assets/modules/chat/README.md`). Berguna sebagai referensi kalau menemukan masalah serupa saat modul ini dipasang di proyek lain.
