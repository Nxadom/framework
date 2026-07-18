/**
 * GridSystem.js - Sortable Functionality for Elements
 * Provides drag-and-drop sortable functionality for container elements
 * Uses jQuery UI Sortable for better stability and features
 */

class GridSystem {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Initialize sortable element tracking
    this.sortableElements = new Set();

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;
  }
  /**
   * Create grid element with specified column count
   */
  createGridElement(columnCount) {
    // Create row with nx-row class (menggunakan CSS standar dari grid.css)
    const gridRow = document.createElement("div");
    gridRow.className = "nx-row";

    // Calculate column class based on 12-column grid system (sesuai grid.css)
    const colClass = `nx-col-${Math.floor(12 / columnCount)}`;

    // Create columns menggunakan CSS grid system yang sudah ada
    for (let i = 0; i < columnCount; i++) {
      const column = document.createElement("div");
      // Menggunakan class CSS yang sudah didefinisikan di grid.css
      column.className = colClass;

      // Tambahkan border minimal agar user bisa melihat batas kolom
      column.style.cssText = `
        border: 1px dashed #dee2e6;
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(13, 110, 253, 0.05);
      `;

      // Add placeholder content (minimal styling)
      const placeholder = document.createElement("span");
      placeholder.textContent = `Column ${i + 1}`;
      placeholder.style.cssText = `
        color: #6c757d;
        font-size: 14px;
        opacity: 0.8;
      `;
      column.appendChild(placeholder);

      gridRow.appendChild(column);
    }

    return gridRow;
  }

  /**
   * Context menu: Add grid columns to element
   */
  contextAddGridColumn(columnCount) {
    try {
      if (!this.interactions.targetElement) {
        return { success: false, error: "No target element" };
      }

      // Create grid structure using modern CSS Grid
      const gridContainer = this.createGridElement(columnCount);

      // Insert the grid element at the cursor position
      this.interactions.insertElementAtPosition(gridContainer);

      const snapInfo = this.interactions.gridSnapEnabled
        ? ` (Snap: ${this.interactions.gridSnapSize}px)`
        : "";

      return { success: true, message: `${columnCount} columns added` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  struktur() {
    return [
      {
        id: "grid-element",
        icon: "grid",
        text: "Grid Element",
        action: "gridElement",
        showCondition: "hasNoSelectedText",
        submenu: [
          {
            id: "grid-col-1",
            icon: "square",
            text: "1 Column",
            action: "addGridColumn1",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-2",
            icon: "square",
            text: "2 Columns",
            action: "addGridColumn2",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-3",
            icon: "square",
            text: "3 Columns",
            action: "addGridColumn3",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-4",
            icon: "square",
            text: "4 Columns",
            action: "addGridColumn4",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-5",
            icon: "square",
            text: "5 Columns",
            action: "addGridColumn5",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-6",
            icon: "square",
            text: "6 Columns",
            action: "addGridColumn6",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-7",
            icon: "square",
            text: "7 Columns",
            action: "addGridColumn7",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-8",
            icon: "square",
            text: "8 Columns",
            action: "addGridColumn8",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-9",
            icon: "square",
            text: "9 Columns",
            action: "addGridColumn9",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-10",
            icon: "square",
            text: "10 Columns",
            action: "addGridColumn10",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-11",
            icon: "square",
            text: "11 Columns",
            action: "addGridColumn11",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "grid-col-12",
            icon: "square",
            text: "12 Columns",
            action: "addGridColumn12",
            showCondition: "hasNoSelectedText",
          },
        ],
      },
    ];
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = GridSystem;
} else if (typeof window !== "undefined") {
  window.GridSystem = GridSystem;
}

export { GridSystem };
