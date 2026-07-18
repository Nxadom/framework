/**
 * FacebookReactions — ES6 Class
 *
 * Membuat seluruh UI reaksi (Facebook-style) secara dinamis,
 * dengan dukungan localStorage, Material Icons, dan aksesibilitas.
 *
 * @example
 *   new FacebookReactions('#reactions-app');
 *   new FacebookReactions({ container: '.my-box', storageKey: 'my_key' });
 */

class FacebookReactions {
  /**
   * @param {string|HTMLElement|Object} options
   *        Jika string/Element => container
   *        Jika object => { container, storageKey, icons, labels, colors }
   */
  constructor(options = {}) {
    // Handle short syntax: selector string atau element langsung
    if (typeof options === 'string' || options instanceof HTMLElement) {
      options = { container: options };
    }

    const defaults = {
      container: '#reactions-app',
      storageKey: 'facebook_reaction',
      icons: {
        like:  'thumb_up',
        love:  'favorite',
        haha:  'sentiment_very_satisfied',
        wow:   'sentiment_satisfied_alt',
        sad:   'sentiment_dissatisfied',
        angry: 'mood_bad'
      },
      labels: {
        like:  'Like',
        love:  'Love',
        haha:  'Haha',
        wow:   'Wow',
        sad:   'Sad',
        angry: 'Angry'
      },
      colors: {
        like:  '#1877f2',
        love:  '#e74c3c',
        haha:  '#f39c12',
        wow:   '#f39c12',
        sad:   '#f39c12',
        angry: '#e67e22'
      }
    };

    this.opts = { ...defaults, ...options };
    this._uid = 'r' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    this.currentReaction = null;

    // Resolve container
    this.container = (typeof this.opts.container === 'string')
      ? document.querySelector(this.opts.container)
      : this.opts.container;

    if (!this.container) {
      throw new Error(`FacebookReactions: container "${this.opts.container}" tidak ditemukan`);
    }

    // Bangun DOM + event + muat dari localStorage
    this._build();
    this._attachEvents();
    this._loadSaved();
  }

  /* ------------------------------------------------------------------ */
  /*  DOM Builder                                                        */
  /* ------------------------------------------------------------------ */
  _build() {
    // --- .box wrapper ---
    this.box = document.createElement('div');
    this.box.className = 'box';

    // --- Checkbox (untuk toggle toolbox via CSS) ---
    this.checkbox = document.createElement('input');
    this.checkbox.type = 'checkbox';
    this.checkbox.id = this._uid;
    this.checkbox.className = 'field-reactions';
    this.checkbox.setAttribute('aria-hidden', 'true');

    // --- Teks deskripsi ---
    this.desc = document.createElement('h3');
    this.desc.className = 'text-desc';
    this.desc.textContent = 'Press space and after tab key to navigation';

    // --- Label lingkaran utama (pakai sprite CSS) ---
    this.label = document.createElement('label');
    this.label.htmlFor = this._uid;
    this.label.className = 'label-reactions';

    // --- Toolbox (background transparan untuk animasi) ---
    this.toolbox = document.createElement('div');
    this.toolbox.className = 'toolbox';

    // --- Overlay (menutup toolbox saat diklik di luar) ---
    this.overlay = document.createElement('label');
    this.overlay.className = 'overlay';
    this.overlay.htmlFor = this._uid;

    // --- Tombol-tombol reaksi ---
    const types    = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    const offsets  = ['0', '50px', '100px', '150px', '200px', '250px'];
    this.buttons = {};

    types.forEach((type, i) => {
      const btn = document.createElement('button');
      btn.className = `reaction-${type}`;
      btn.style.left = offsets[i];
      btn.setAttribute('data-type', type);
      btn.setAttribute('aria-label', this.opts.labels[type]);

      // Legend (tooltip)
      const legend = document.createElement('span');
      legend.className = 'legend-reaction';
      legend.textContent = this.opts.labels[type];
      btn.appendChild(legend);

      this.buttons[type] = btn;
    });

    // --- Rangkai DOM ---
    this.box.appendChild(this.checkbox);
    this.box.appendChild(this.desc);
    Object.values(this.buttons).forEach(btn => this.box.appendChild(btn));
    this.box.appendChild(this.label);
    this.box.appendChild(this.toolbox);
    this.box.appendChild(this.overlay);

    this.container.appendChild(this.box);
  }

  /* ------------------------------------------------------------------ */
  /*  Events                                                             */
  /* ------------------------------------------------------------------ */
  _attachEvents() {
    // Delegasi: satu listener di .box
    this._clickHandler = (e) => {
      const btn = e.target.closest('[data-type]');
      if (btn) {
        const type = btn.getAttribute('data-type');
        this.setReaction(type);
      }
    };
    this.box.addEventListener('click', this._clickHandler);
  }

  /* ------------------------------------------------------------------ */
  /*  localStorage                                                       */
  /* ------------------------------------------------------------------ */
  _loadSaved() {
    const saved = localStorage.getItem(this.opts.storageKey);
    if (saved && this.opts.labels[saved]) {
      this._updateUI(saved);
      this.currentReaction = saved;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                         */
  /* ------------------------------------------------------------------ */

  /**
   * Set reaksi dan simpan ke localStorage.
   * @param {string} type - 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
   */
  setReaction(type) {
    if (!this.opts.icons[type]) {
      console.warn(`FacebookReactions: reaksi "${type}" tidak dikenali`);
      return;
    }

    this.currentReaction = type;
    localStorage.setItem(this.opts.storageKey, type);
    this._updateUI(type);

    // Tutup toolbox
    this.checkbox.checked = false;

    // Optional: dispatch event untuk integrasi eksternal
    this.box.dispatchEvent(new CustomEvent('reaction', {
      detail: { type, label: this.opts.labels[type], icon: this.opts.icons[type] }
    }));
  }

  /**
   * Hapus reaksi (kembali ke state default).
   */
  clearReaction() {
    this.currentReaction = null;
    localStorage.removeItem(this.opts.storageKey);
    this.label.className = 'label-reactions';
    this.desc.textContent = 'Press space and after tab key to navigation';
  }

  /**
   * Bersihkan: hapus event listener dan DOM.
   */
  destroy() {
    this.box.removeEventListener('click', this._clickHandler);
    this.box.remove();
  }

  /* ------------------------------------------------------------------ */
  /*  Internal UI updater                                                */
  /* ------------------------------------------------------------------ */
  _updateUI(type) {
    // Class sprite — background-position berubah otomatis via CSS
    this.label.className = `label-reactions ${type}`;

    // Teks deskripsi
    this.desc.textContent = `Your reaction: ${this.opts.labels[type]} — Click again to change`;
  }
}

/* ---------------------------------------------------------------------- */
/*  ESM export                                                            */
/* ---------------------------------------------------------------------- */
export default FacebookReactions;
