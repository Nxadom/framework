class Sortable {
  constructor(interactions) {
    this.interactions = interactions;
    this.config = interactions.config;
    this.sortableElements = new Set();
  }

  contextToggleSortable() {
    try {
      const target = this.interactions.targetElement;
      if (!target) throw new Error("No target element selected");

      const container = this._findContainer(target);
      if (!container || container.children.length === 0)
        throw new Error("No suitable container found");

      if (this.sortableElements.has(container)) {
        this._disable(container);
        return { success: true, message: "Sortable disabled" };
      } else {
        this._enable(container);
        return { success: true, message: "Sortable enabled" };
      }
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  _findContainer(el) {
    // Jika el sendiri punya children, pakai el; jika tidak naik ke parent
    let cur = el;
    while (cur && cur.tagName !== 'BODY') {
      if (cur.children.length > 1) return cur;
      cur = cur.parentElement;
    }
    return el.parentElement || el;
  }

  _enable(container) {
    // Simpan contenteditable lama lalu nonaktifkan agar drag HTML5 bisa jalan
    container._nxSortCE = container.getAttribute('contenteditable');
    container.setAttribute('contenteditable', 'false');

    container.setAttribute('data-nx-sortable', 'true');
    container.style.outline = '2px dashed #6c757d';
    container.style.minHeight = '40px';

    const children = Array.from(container.children);
    children.forEach(child => {
      child.setAttribute('draggable', 'true');
      child.style.cursor = 'grab';
      child.style.userSelect = 'none';
      child._nxSortDragStart = (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
        child._nxDragging = true;
        child.style.opacity = '0.4';
      };
      child._nxSortDragEnd = (e) => {
        child._nxDragging = false;
        child.style.opacity = '';
        container.querySelectorAll('[data-nx-sort-over]').forEach(el => {
          el.removeAttribute('data-nx-sort-over');
          el.style.borderTop = '';
        });
      };
      child._nxSortDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const dragging = container.querySelector('[draggable="true"][style*="opacity"]') ||
                         Array.from(container.children).find(c => c._nxDragging);
        if (!dragging || dragging === child) return;
        const rect = child.getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        container.querySelectorAll('[data-nx-sort-over]').forEach(el => {
          el.removeAttribute('data-nx-sort-over');
          el.style.borderTop = '';
          el.style.borderBottom = '';
        });
        child.setAttribute('data-nx-sort-over', '1');
        if (after) {
          child.style.borderBottom = '2px solid #007bff';
        } else {
          child.style.borderTop = '2px solid #007bff';
        }
      };
      child._nxSortDrop = (e) => {
        e.preventDefault();
        const dragging = Array.from(container.children).find(c => c._nxDragging);
        if (!dragging || dragging === child) return;
        const rect = child.getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        if (after) {
          container.insertBefore(dragging, child.nextSibling);
        } else {
          container.insertBefore(dragging, child);
        }
        child.style.borderTop = '';
        child.style.borderBottom = '';
        child.removeAttribute('data-nx-sort-over');
      };
      child.addEventListener('dragstart', child._nxSortDragStart);
      child.addEventListener('dragend',   child._nxSortDragEnd);
      child.addEventListener('dragover',  child._nxSortDragOver);
      child.addEventListener('drop',      child._nxSortDrop);
    });

    this.sortableElements.add(container);
  }

  _disable(container) {
    Array.from(container.children).forEach(child => {
      child.removeAttribute('draggable');
      child.style.cursor = '';
      child.style.userSelect = '';
      child.style.opacity = '';
      child.style.borderTop = '';
      child.style.borderBottom = '';
      if (child._nxSortDragStart) child.removeEventListener('dragstart', child._nxSortDragStart);
      if (child._nxSortDragEnd)   child.removeEventListener('dragend',   child._nxSortDragEnd);
      if (child._nxSortDragOver)  child.removeEventListener('dragover',  child._nxSortDragOver);
      if (child._nxSortDrop)      child.removeEventListener('drop',      child._nxSortDrop);
      delete child._nxSortDragStart;
      delete child._nxSortDragEnd;
      delete child._nxSortDragOver;
      delete child._nxSortDrop;
      delete child._nxDragging;
    });

    container.removeAttribute('data-nx-sortable');
    container.style.outline = '';
    container.style.minHeight = '';

    if (container._nxSortCE === null) {
      container.removeAttribute('contenteditable');
    } else if (container._nxSortCE !== undefined) {
      container.setAttribute('contenteditable', container._nxSortCE);
    }
    delete container._nxSortCE;

    this.sortableElements.delete(container);
  }

  findSortableContainer(el) {
    return this._findContainer(el);
  }

  toggleSortable() {
    return this.contextToggleSortable();
  }

  getSortableElements() { return this.sortableElements; }
  isSortable(el) { return this.sortableElements.has(el); }
}

if (typeof module !== "undefined" && module.exports) module.exports = Sortable;
else if (typeof window !== "undefined") window.Sortable = Sortable;
export { Sortable };
