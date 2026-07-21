# NexaMarkdown



Modul markdown **multi-konteks** — dokumen, chat, dan lainnya. Mandiri di `assets/modules/markdown/`.



## Mode



| Mode | Metode | Sumber | Fitur |

|------|--------|--------|--------|

| `doc` | `.Preview()` | path berkas / `fromFile()` | Mermaid, daftar isi, scroll section |

| `chat` | `.Chat()` | string / `fromContent()` | Ringkas, tanpa mermaid, link eksternal browser default |



Inti render: `markdownCore.mjs` → `mountMarkdownContent({ mode: 'doc' \| 'chat' })`.



## Dependensi vendor (bukan npm)

`markdown-it`, `markdown-it-task-lists`, `markdown-it-emoji`,
`markdown-it-anchor`, dan `highlight.js` (parser + syntax highlight) sudah
di-bundle jadi satu file lewat `esbuild` di `markdownEngine.mjs` — tidak
perlu `npm install` apa pun untuk itu, sudah self-contained.

Yang **tidak** ikut ter-bundle dan wajib ada sebagai file terpisah:
`dompurify` (sanitasi HTML — wajib, parser di sini pakai `html: true`,
HTML mentah dalam Markdown diteruskan apa adanya tanpa DOMPurify) dan CSS
tema `highlight.js` (opsional, cuma styling blok kode). Ditaruh langsung
di folder modul ini (bukan `node_modules/` root proyek — modul ini
didesain independen dari toolchain npm proyek yang memasangnya):
```
assets/modules/markdown/dompurify/dist/purify.es.mjs
assets/modules/markdown/highlight.js/styles/github.min.css
assets/modules/markdown/highlight.js/styles/github-dark.min.css
```
Sudah disertakan di dalam folder modul ini (`dompurify/`, `highlight.js/`)
— tidak perlu diunduh ulang saat modul dipasang di proyek baru. Di-fetch
lewat `nodeModulesUrl()` di `markdownCore.mjs` — namanya sisa istilah lama
(`node_modules`), tapi isinya sudah diarahkan ke
`{origin}/assets/modules/markdown/{relPath}`, **bukan**
`{origin}/node_modules/{relPath}`. Kalau nanti nambah paket vendor baru
(mis. `mermaid` untuk mode `doc` — belum disertakan karena mode `chat`
selalu set `mermaid: false`), taruh dengan pola folder yang sama di sini,
tidak perlu ubah `nodeModulesUrl()`.

**Penting saat instalasi ke proyek baru:** pastikan web server bisa serve
folder `assets/modules/markdown/dompurify/` dan `.../highlight.js/`
sebagai static file, dan MIME type `.mjs` di-set ke
`application/javascript` (banyak konfigurasi Apache default tidak
mengenali ekstensi ini — tanpa itu browser menolak load module script
dengan error MIME type kosong).



## Penggunaan



### Dokumen (Discovery / docview)



```javascript

import NexaMarkdown from './assets/modules/markdown/NexaMarkdown.js';



await NexaMarkdown.fromFile('D:/Framework/docs/Checkable.md').Preview('#panel');

// atau

await new NexaMarkdown('D:/Framework/docs/Checkable.md').Preview();

```



### Chat (bubble assistant)



```javascript

const bubble = document.createElement('div');

await NexaMarkdown.fromContent('**Halo!** Ini balasan _markdown_.').Chat(bubble);

messagesContainer.append(bubble);



// Update pesan streaming

const md = NexaMarkdown.fromContent('');

md.setContent('Baris baru…');

await md.Chat(bubble);

```



### HTML saja (tanpa DOM)



```javascript

const html = await NexaMarkdown.fromContent('`code`').html();

```



## API



| | |

|--|--|

| `NexaMarkdown.fromFile(path, opts?)` | Mode dokumen |

| `NexaMarkdown.fromContent(text, opts?)` | Mode chat / string |

| `.Preview(target?)` | Render dokumen penuh |

| `.Chat(target?)` | Render bubble chat |

| `.html()` | String HTML aman |

| `.setContent(text)` | Ganti isi tanpa path (chat streaming) |

| `.dispose()` | Bersihkan listener |



## Arsitektur



```

NexaMarkdown.js     ← API publik (Preview, Chat, …)

markdownCore.mjs    ← render, sanitize, link, mode doc/chat

markdownEngine.mjs  ← bundle markdown-it (generated)

dompurify/           ← vendor, sanitasi HTML

highlight.js/         ← vendor, CSS syntax highlight

```



Fungsi chat/UI lain cukup panggil `.Chat()` — **tidak perlu** NexaRoute atau Discovery.



## Catatan



- Baca disk: Electron `discoveryReadFile` atau `options.content`.

- `data-nx-markdown-preview` / `data-nx-markdown-chat` — NexaRoute melewati zona ini.

- Gaya chat: `.nexa-markdown-chat` — style dasar (p/ul/code/pre/heading) ditaruh scoped di modul pemakai (mis. modul `chat/`, class `.nxchat-msg-assistant .nexa-markdown-chat …`), bukan di CSS global proyek.
