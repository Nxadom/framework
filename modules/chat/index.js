import { NexaMarkdown } from "../markdown/NexaMarkdown.js";

export class NexaChat {
  constructor(options = {}) {
    this.config = {
      API: options.API || "",
      MODEL: options.MODEL || "",
      CATALOG: options.CATALOG || "",
    };
    this.container =
      typeof options.container === "string"
        ? document.querySelector(options.container)
        : options.container || document.getElementById("nxchat");
    this.messages = [];
    this.rendered = false;
    this.init();
  }
  init() {
    if (!this.container) return;
    this.render();
  }
  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="nxchat-container">
        <div class="nxchat-header">
          <div class="nxchat-header-left">
            <span class="material-symbols-outlined nxchat-sparkle-icon">auto_awesome</span>
            <span>Ask Assistant</span>
          </div>
          <div class="nxchat-header-right">
            <span class="material-symbols-outlined nxchat-header-icon" id="nxchatClose" aria-label="Tutup">close</span>
          </div>
        </div>
        <div class="nxchat-content-area nx-scroll nxchat-empty" id="nxchatMessages">
          <p class="nxchat-disclaimer-text">Tanyakan sesuatu untuk memulai percakapan.</p>
        </div>
        <div class="nxchat-input-area">
          <form class="nxchat-input-box-container" id="nxchatForm">
            <input type="text" class="nxchat-input-field" id="nxchatInput" placeholder="Tulis pesan..." autocomplete="off" />
            <div class="nxchat-input-actions">
              <span class="material-symbols-outlined nxchat-attachment-btn" aria-label="Lampirkan">attach_file</span>
              <button type="submit" class="nxchat-send-btn" aria-label="Kirim">
                <span class="material-symbols-outlined">arrow_upward</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.messagesEl = this.container.querySelector("#nxchatMessages");
    this.formEl = this.container.querySelector("#nxchatForm");
    this.inputEl = this.container.querySelector("#nxchatInput");
    this.closeEl = this.container.querySelector("#nxchatClose");

    this.bindEvents();
    this.renderMessages();
    this.rendered = true;
  }

  bindEvents() {
    if (this.formEl) {
      this.formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }
    if (this.closeEl) {
      this.closeEl.addEventListener("click", () => this.close());
    }
  }

  handleSubmit() {
    const text = (this.inputEl?.value || "").trim();
    if (!text || this.sending) return;
    this.addMessage("user", text);
    this.inputEl.value = "";
    this.sendMessage(text);
  }

  setSending(sending) {
    this.sending = sending;
    if (this.inputEl) this.inputEl.disabled = sending;
    const sendBtn = this.formEl?.querySelector(".nxchat-send-btn");
    if (sendBtn) sendBtn.disabled = sending;
  }

  showTyping() {
    if (!this.messagesEl) return;
    this.messagesEl.classList.remove("nxchat-empty");
    const el = document.createElement("div");
    el.className = "nxchat-typing";
    el.id = "nxchatTyping";
    el.innerHTML =
      '<span class="nxchat-typing-dot"></span><span class="nxchat-typing-dot"></span><span class="nxchat-typing-dot"></span>';
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
  }

  hideTyping() {
    this.messagesEl?.querySelector("#nxchatTyping")?.remove();
  }

  addMessage(role, text) {
    this.messages.push({ role, text });
    this.renderMessages();
    return this.messages[this.messages.length - 1];
  }

  /**
   * Terhubung ke backend lewat NX.Storage().api("assistant", {...}) —
   * POST ke {NEXA.apiBase}/assistant. Proyek yang memasang modul ini perlu
   * menyediakan sendiri endpoint /api/assistant (lihat contoh implementasi
   * PHP di webnxdom: controllers/Api/AssistantController.php, provider
   * OpenRouter) — modul JS ini cuma memanggilnya, tidak membawa backend.
   */
  async sendMessage(text) {
    this.setSending(true);
    this.showTyping();
    try {
      // _nonce: NX.Storage().api() cache respons lewat IndexedDB (stale-while-revalidate)
      // berdasar hash body — tanpa ini, pesan yang sama persis (mis. "hallo" di sesi
      // beda) akan menyajikan ulang balasan lama yang ter-cache alih-alih tanya AI lagi.
      const res = await NX.Storage().api("assistant", {
        message: text,
        history: this.messages,
        _nonce: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });
      const reply =
        res && res.status === "success" && res.reply
          ? res.reply
          : (res && res.message) || "Maaf, terjadi kesalahan saat memproses pesan.";
      this.addMessage("assistant", reply);
      return reply;
    } catch (err) {
      const reply = "Gagal menghubungi assistant. Coba lagi nanti.";
      this.addMessage("assistant", reply);
      return reply;
    } finally {
      this.hideTyping();
      this.setSending(false);
    }
  }

  scrollToBottom() {
    if (!this.messagesEl) return;
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  renderMessages() {
    if (!this.messagesEl) return;
    if (this.messages.length === 0) {
      this.messagesEl.classList.add("nxchat-empty");
      this.messagesEl.innerHTML =
        '<p class="nxchat-disclaimer-text">Tanyakan sesuatu untuk memulai percakapan.</p>';
      return;
    }
    this.messagesEl.classList.remove("nxchat-empty");
    this.messagesEl.innerHTML = "";

    for (const m of this.messages) {
      const bubble = document.createElement("div");
      bubble.className = `nxchat-msg nxchat-msg-${m.role}`;
      this.messagesEl.appendChild(bubble);

      if (m.role === "assistant") {
        // Balasan AI dirender sebagai Markdown (bold, list, code block, link, dst)
        // lewat modul ../markdown/ — sanitasi HTML lewat DOMPurify di dalamnya
        // karena teks berasal dari sumber eksternal (LLM). Render-nya async, jadi
        // scroll ke bawah lagi setelah selesai — kalau tidak, tinggi bubble belum
        // final saat scrollToBottom() di bawah dijalankan (terutama balasan
        // panjang/multi-baris), hasilnya scroll berhenti terlalu awal.
        NexaMarkdown.fromContent(m.text)
          .Chat(bubble)
          .catch(() => {
            bubble.textContent = m.text;
          })
          .finally(() => this.scrollToBottom());
      } else {
        bubble.textContent = m.text;
      }
    }

    this.scrollToBottom();
  }

  close() {
    var outer = document.getElementById("nxchat");
    if (outer) outer.classList.remove("open");
  }
}
