# NexaMarkdown



Modul markdown **multi-konteks** — dokumen, chat, dan lainnya. Mandiri di `assets/modules/markdown/`.



## Mode



| Mode | Metode | Sumber | Fitur |

|------|--------|--------|--------|

| `doc` | `.Preview()` | path berkas / `fromFile()` | Mermaid, daftar isi, scroll section |

| `chat` | `.Chat()` | string / `fromContent()` | Ringkas, tanpa mermaid, link eksternal browser default |



Inti render: `markdownCore.mjs` → `mountMarkdownContent({ mode: 'doc' \| 'chat' })`.



## Dependensi npm



```bash

npm install markdown-it markdown-it-task-lists markdown-it-emoji markdown-it-anchor highlight.js dompurify mermaid

npm run vendor:markdown

```



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



## Arsitektur (nanti ditambah fungsi)



```

NexaMarkdown.js     ← API publik (Preview, Chat, …)

markdownCore.mjs    ← render, sanitize, link, mode doc/chat

markdownEngine.mjs  ← bundle markdown-it (generated)

```



Fungsi chat/UI lain cukup panggil `.Chat()` — **tidak perlu** NexaRoute atau Discovery.



## Catatan



- Baca disk: Electron `discoveryReadFile` atau `options.content`.

- `data-nx-markdown-preview` / `data-nx-markdown-chat` — NexaRoute melewati zona ini.

- Gaya chat: `.nexa-markdown-chat` di `assets/css/style.css`.


