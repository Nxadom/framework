class Resizable {
  constructor(interactions) {
    this.interactions = interactions;
    this.config = interactions.config;
    this.resizableElements = new Set();
  }

  contextToggleResizable() {
    try {
      const target = this.interactions.targetElement;
      if (!target) throw new Error("No target element selected");

      // Cari elemen yang tepat — lebih suka img/table/div/figure, hindari text-only
      const el = this._findResizeTarget(target);
      if (!el) throw new Error("Tidak ada elemen yang dapat di-resize");

      if (el._nxResizeActive) {
        this._disable(el);
        return { success: true, message: "Resizable disabled" };
      } else {
        this._enable(el);
        return { success: true, message: "Resizable enabled" };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  _findResizeTarget(el) {
    const RESIZABLE_TAGS = new Set(['IMG','TABLE','FIGURE','VIDEO','IFRAME','WEBVIEW','DIV','SECTION','ARTICLE','ASIDE','BLOCKQUOTE','PRE']);
    const TEXT_ONLY = new Set(['P','H1','H2','H3','H4','H5','H6','LI','SPAN','A','STRONG','EM','B','I','U']);

    // Jika el sendiri cocok
    if (RESIZABLE_TAGS.has(el.tagName)) return el;

    // Cari di dalam el
    for (const tag of ['IMG','TABLE','FIGURE','VIDEO','IFRAME','WEBVIEW']) {
      const found = el.querySelector(tag);
      if (found) return found;
    }

    // Naik ke parent yang cocok (bukan root editor)
    let p = el.parentElement;
    while (p && p.tagName !== 'BODY') {
      const ce = p.getAttribute('contenteditable');
      if (ce === 'true' || ce === '') return el; // sampai root, pakai el apa adanya
      if (RESIZABLE_TAGS.has(p.tagName)) return p;
      p = p.parentElement;
    }

    return el; // fallback
  }

  _enable(el) {
    if (el._nxResizeActive) return;

    // Kunci dimensi
    const rect = el.getBoundingClientRect();
    if (rect.width  > 0) el.style.width  = rect.width  + 'px';
    if (rect.height > 0) el.style.height = rect.height + 'px';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.style.overflow = 'hidden';
    el.style.boxSizing = 'border-box';
    el.style.outline = '2px solid #007bff';

    // Disable contenteditable pada el dan parent editor agar mouse events bekerja
    if (el._nxResizeCE === undefined) {
      el._nxResizeCE = el.getAttribute('contenteditable');
      el.setAttribute('contenteditable', 'false');
    }
    const ceParent = el.closest('[contenteditable="true"],[contenteditable=""]');
    if (ceParent && ceParent._nxResizeParentCE === undefined) {
      ceParent._nxResizeParentCE = ceParent.getAttribute('contenteditable');
      ceParent.setAttribute('contenteditable', 'false');
    }

    // Buat handle SE (resize dari pojok kanan-bawah)
    const handle = document.createElement('div');
    handle.className = 'nx-resize-handle-se';
    handle.style.cssText = `
      position:absolute; bottom:0; right:0;
      width:14px; height:14px;
      background:#007bff; border-radius:2px 0 2px 0;
      cursor:se-resize; z-index:9999;
      opacity:0.85;
    `;
    el.appendChild(handle);
    el._nxResizeHandle = handle;

    // Handle N (atas)
    const handleN = document.createElement('div');
    handleN.className = 'nx-resize-handle-n';
    handleN.style.cssText = `
      position:absolute; top:0; left:50%; transform:translateX(-50%);
      width:30px; height:6px;
      background:#007bff; border-radius:0 0 3px 3px;
      cursor:n-resize; z-index:9999; opacity:0.85;
    `;
    el.appendChild(handleN);
    el._nxResizeHandleN = handleN;

    // Handle E (kanan)
    const handleE = document.createElement('div');
    handleE.className = 'nx-resize-handle-e';
    handleE.style.cssText = `
      position:absolute; top:50%; right:0; transform:translateY(-50%);
      width:6px; height:30px;
      background:#007bff; border-radius:3px 0 0 3px;
      cursor:e-resize; z-index:9999; opacity:0.85;
    `;
    el.appendChild(handleE);
    el._nxResizeHandleE = handleE;

    // Pasang events resize
    this._attachResize(el, handle, 'se');
    this._attachResize(el, handleN, 'n');
    this._attachResize(el, handleE, 'e');

    el._nxResizeActive = true;
    this.resizableElements.add(el);

    // Tambah CSS sekali
    this._ensureStyles();
  }

  _attachResize(el, handle, dir) {
    handle._nxResizeMouseDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = el.offsetWidth;
      const startH = el.offsetHeight;
      const startT = parseInt(el.style.top)  || 0;

      const onMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (dir === 'se' || dir === 'e') {
          const newW = Math.max(50, startW + dx);
          el.style.width = newW + 'px';
        }
        if (dir === 'se' || dir === 's') {
          const newH = Math.max(30, startH + dy);
          el.style.height = newH + 'px';
        }
        if (dir === 'n') {
          const newH = Math.max(30, startH - dy);
          el.style.height = newH + 'px';
        }
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };
    handle.addEventListener('mousedown', handle._nxResizeMouseDown);
  }

  _disable(el) {
    if (!el._nxResizeActive) return;

    // Hapus handles
    ['_nxResizeHandle','_nxResizeHandleN','_nxResizeHandleE'].forEach(key => {
      if (el[key]) {
        if (el[key]._nxResizeMouseDown)
          el[key].removeEventListener('mousedown', el[key]._nxResizeMouseDown);
        el[key].remove();
        delete el[key];
      }
    });

    el.style.outline = '';
    el.style.overflow = '';

    // Restore contenteditable
    if (el._nxResizeCE !== undefined) {
      if (el._nxResizeCE === null) el.removeAttribute('contenteditable');
      else el.setAttribute('contenteditable', el._nxResizeCE);
      delete el._nxResizeCE;
    }
    // Restore parent
    const ceParent = el.closest('[contenteditable="false"][data-nx-rp]') || document.querySelector('[data-nx-rp]');
    if (ceParent && ceParent._nxResizeParentCE !== undefined) {
      ceParent.setAttribute('contenteditable', ceParent._nxResizeParentCE);
      ceParent.removeAttribute('data-nx-rp');
      delete ceParent._nxResizeParentCE;
    } else {
      // Cari semua elemen yang punya _nxResizeParentCE
      document.querySelectorAll('[contenteditable="false"]').forEach(p => {
        if (p._nxResizeParentCE !== undefined) {
          p.setAttribute('contenteditable', p._nxResizeParentCE);
          delete p._nxResizeParentCE;
        }
      });
    }

    delete el._nxResizeActive;
    this.resizableElements.delete(el);
  }

  _ensureStyles() {
    if (document.getElementById('nx-resize-styles')) return;
    const s = document.createElement('style');
    s.id = 'nx-resize-styles';
    s.textContent = `
      .nx-resize-handle-se, .nx-resize-handle-n, .nx-resize-handle-e {
        transition: opacity 0.15s;
      }
      .nx-resize-handle-se:hover, .nx-resize-handle-n:hover, .nx-resize-handle-e:hover {
        opacity: 1 !important;
        background: #0056b3 !important;
      }
    `;
    document.head.appendChild(s);
  }

  toggleResizable() {
    return this.contextToggleResizable();
  }

  // Stub methods yang mungkin dipanggil dari Controls/index.js lama
  enableAllResizable(container) {}
  disableAllResizable(container) {}
  removeElementResizable(el) { this._disable(el); }
  makeElementResizable(el, container) { this._enable(el); }
  addResizableStyles() { this._ensureStyles(); }
}

if (typeof module !== "undefined" && module.exports) module.exports = Resizable;
else if (typeof window !== "undefined") window.Resizable = Resizable;
export { Resizable };
