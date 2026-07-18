class Draggable {
  constructor(interactions) {
    this.interactions = interactions;
    this.config = interactions.config;
    this.draggableElements = new Set();
  }

  contextToggleDraggable() {
    try {
      const target = this.interactions.targetElement;
      if (!target) throw new Error("No target element selected");

      const container = this.interactions.sortable.findSortableContainer(target);
      if (!container || container.children.length === 0)
        throw new Error("No suitable container found");

      const hasAny = Array.from(container.children).some(c => c._nxDragActive);
      if (hasAny) {
        Array.from(container.children).forEach(c => this._disable(c));
        // Restore container contenteditable
        if (container._nxDragCE !== undefined) {
          if (container._nxDragCE === null) container.removeAttribute('contenteditable');
          else container.setAttribute('contenteditable', container._nxDragCE);
          delete container._nxDragCE;
        }
        return { success: true, message: "Draggable disabled" };
      } else {
        // Disable contenteditable pada container agar mouse events tidak terhalang
        if (container._nxDragCE === undefined) {
          container._nxDragCE = container.getAttribute('contenteditable');
          container.setAttribute('contenteditable', 'false');
        }
        Array.from(container.children).forEach(c => {
          if (!['SCRIPT','STYLE','META','LINK'].includes(c.tagName))
            this._enable(c, container);
        });
        return { success: true, message: "Draggable enabled" };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  _enable(el, container) {
    if (el._nxDragActive) return;

    // Buat container relative jika belum
    if (getComputedStyle(container).position === 'static')
      container.style.position = 'relative';

    // Buat element absolute dalam container
    const rect = el.getBoundingClientRect();
    const cRect = container.getBoundingClientRect();
    el.style.position = 'absolute';
    el.style.left = (rect.left - cRect.left) + 'px';
    el.style.top  = (rect.top  - cRect.top)  + 'px';
    el.style.width  = rect.width  + 'px';
    el.style.zIndex = '10';
    el.style.cursor = 'move';
    el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    el.style.userSelect = 'none';

    let startX, startY, startLeft, startTop;

    el._nxDragMouseDown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(el.style.left) || 0;
      startTop  = parseInt(el.style.top)  || 0;
      el.style.boxShadow = '0 4px 16px rgba(0,123,255,0.4)';
      el.style.zIndex = '100';

      const onMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const cR = container.getBoundingClientRect();
        const newLeft = Math.max(0, Math.min(startLeft + dx, cR.width  - el.offsetWidth));
        const newTop  = Math.max(0, Math.min(startTop  + dy, cR.height - el.offsetHeight));
        el.style.left = newLeft + 'px';
        el.style.top  = newTop  + 'px';
      };
      const onUp = () => {
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        el.style.zIndex = '10';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };

    el.addEventListener('mousedown', el._nxDragMouseDown);
    el._nxDragActive = true;
    el._nxDragContainer = container;
    this.draggableElements.add(el);
  }

  _disable(el) {
    if (!el._nxDragActive) return;
    if (el._nxDragMouseDown) {
      el.removeEventListener('mousedown', el._nxDragMouseDown);
      delete el._nxDragMouseDown;
    }
    el.style.position = '';
    el.style.left = '';
    el.style.top  = '';
    el.style.width = '';
    el.style.zIndex = '';
    el.style.cursor = '';
    el.style.boxShadow = '';
    el.style.userSelect = '';
    delete el._nxDragActive;
    delete el._nxDragContainer;
    this.draggableElements.delete(el);
  }

  toggleDraggable() {
    return this.contextToggleDraggable();
  }
}

if (typeof module !== "undefined" && module.exports) module.exports = Draggable;
else if (typeof window !== "undefined") window.Draggable = Draggable;
export { Draggable };
