/**
 * contextCreateTable Resizable.js - Sortable Functionality for Elements
 * Provides drag-and-drop sortable functionality for container elements
 * Uses jQuery UI Sortable for better stability and features
 */

class CreateTable {
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

  struktur() {
    return [
      {
        text: "Format Tabel",
        icon: "table",
        action: "createTable",
      },
    ];
  }
  /**
   * Context menu: Create Table
   */
  contextCreateTable() {
    try {
      // Show table creation dialog
      this.createTableDialog();

      return { success: true, message: "Table creation dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create table configuration dialog using NexaUI modal
   */
  createTableDialog() {
    const modalId = "nexa-table-dialog";

    // Setup global functions for modal
    this.setupGlobalTableFunctions();

    // Create modal using NexaUI standard method
    this.nexaUI.modalHTML({
      elementById: modalId,
      styleClass: "w-600px",
      label: "📊 Create Table",
      onclick: {
        title: "Create Table",
        cancel: "Cancel",
        send: "createTableFromModal",
      },
      content: `
        <div>
          <!-- Table Size Configuration -->
          <label class="text-secondary" style="display:block;">Table Size</label>
          <div class="nx-row">
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="tableRows">Rows</label></dt>
                  <dd class="form-group-body">
                    <input type="number" id="tableRows" class="form-control" min="1" max="50" value="3" onchange="updateTablePreview()">
                  </dd>
                </dl>
              </div>
            </div>
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="tableColumns">Columns</label></dt>
                  <dd class="form-group-body">
                    <input type="number" id="tableColumns" class="form-control" min="1" max="20" value="3" onchange="updateTablePreview()">
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <!-- Table Options -->
          <div class="nx-row">
            <div class="nx-col-6">
              <div class="form-group">
                <label>Options</label>
                <div class="form-checkbox">
                  <label><input type="checkbox" id="tableHeader" checked onchange="updateTablePreview()"> Add header row</label>
                </div>
              </div>
            </div>
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="tableStyle">Table Style</label></dt>
                  <dd class="form-group-body">
                    <select id="tableStyle" class="form-select" onchange="updateTablePreview()">
                      <option value="basic">Basic</option>
                      <option value="striped">Striped Rows</option>
                      <option value="bordered">Bordered</option>
                      <option value="hover">Hover Effects</option>
                      <option value="modern">Modern</option>
                    </select>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <!-- Quick Templates -->
          <label class="text-secondary" style="display:block;">Quick Templates</label>
          <div style="display: flex; gap: 5px;">
            <button type="button" class="btn" style="flex:1;" onclick="applyTableTemplate('data')">
              <i class="material-symbols-outlined nx-icon-sm">table_chart</i>
              <span>Data Table</span>
            </button>
            <button type="button" class="btn" style="flex:1;" onclick="applyTableTemplate('schedule')">
              <i class="material-symbols-outlined nx-icon-sm">calendar_month</i>
              <span>Schedule</span>
            </button>
            <button type="button" class="btn" style="flex:1;" onclick="applyTableTemplate('comparison')">
              <i class="material-symbols-outlined nx-icon-sm">compare</i>
              <span>Compare</span>
            </button>
          </div>

          <!-- Preview section -->
          <div class="form-group">
            <label>Preview</label>
            <div id="tablePreview" style="
              border: 1px solid #d0d7de;
              border-radius: 6px;
              padding: 15px;
              background: #f6f8fa;
              max-height: 200px;
              overflow: auto;
            ">
              <!-- Preview table will be inserted here -->
            </div>
          </div>
        </div>
      `,
    });

    // Open modal and initialize preview
    setTimeout(() => {
      this.nexaUI.nexaModal.open(modalId);
      setTimeout(() => {
        this.updateTablePreview();
      }, 150);
    }, 100);
  }

  /**
   * Setup global functions for table modal
   */
  setupGlobalTableFunctions() {
    // Store reference to this instance for global functions
    const self = this;

    // Global function to update table preview
    window.updateTablePreview = function () {
      self.updateTablePreview();
    };

    // Global function to apply table template
    window.applyTableTemplate = function (template) {
      self.applyTableTemplate(template);
      self.updateTablePreview();
    };

    // Global function to create table from modal
    window.createTableFromModal = function (modalId, data) {
      console.log("Creating table from modal:", modalId);

      const result = self.createTableElement();
      if (result.success) {
        console.log("Table created successfully");
        self.nexaUI.nexaModal.close(modalId);
      } else {
        console.error("Failed to create table:", result.error);
        alert("Failed to create table: " + result.error);
      }
    };

    // Global function to close modal
    window.closeTableModal = function (modalId) {
      self.nexaUI.nexaModal.close(modalId);
    };
  }

  /**
   * Update table preview
   */
  updateTablePreview() {
    const preview = document.getElementById("tablePreview");
    if (!preview) return;

    const rows = parseInt(document.getElementById("tableRows")?.value || 3);
    const columns = parseInt(
      document.getElementById("tableColumns")?.value || 3
    );
    const hasHeader = document.getElementById("tableHeader")?.checked || false;
    const style = document.getElementById("tableStyle")?.value || "basic";

    const tableHTML = this.generateTableHTML(
      rows,
      columns,
      hasHeader,
      style,
      true
    );
    preview.innerHTML = tableHTML;
  }

  /**
   * Apply table template
   */
  applyTableTemplate(template) {
    const rowsInput = document.getElementById("tableRows");
    const columnsInput = document.getElementById("tableColumns");
    const headerCheckbox = document.getElementById("tableHeader");
    const styleSelect = document.getElementById("tableStyle");

    switch (template) {
      case "data":
        if (rowsInput) rowsInput.value = "5";
        if (columnsInput) columnsInput.value = "4";
        if (headerCheckbox) headerCheckbox.checked = true;
        if (styleSelect) styleSelect.value = "striped";
        break;
      case "schedule":
        if (rowsInput) rowsInput.value = "8";
        if (columnsInput) columnsInput.value = "6";
        if (headerCheckbox) headerCheckbox.checked = true;
        if (styleSelect) styleSelect.value = "bordered";
        break;
      case "comparison":
        if (rowsInput) rowsInput.value = "4";
        if (columnsInput) columnsInput.value = "3";
        if (headerCheckbox) headerCheckbox.checked = true;
        if (styleSelect) styleSelect.value = "modern";
        break;
    }
  }

  /**
   * Generate table HTML
   */
  generateTableHTML(rows, columns, hasHeader, style, isPreview = false) {
    const tableStyles = this.getTableStyles(style, isPreview);

    let html = `<table style="${tableStyles.table}">`;

    // Header row
    if (hasHeader) {
      html += `<thead><tr style="${tableStyles.headerRow}">`;
      for (let col = 1; col <= columns; col++) {
        html += `<th style="${tableStyles.headerCell}">Header ${col}</th>`;
      }
      html += `</tr></thead>`;
    }

    // Body rows
    html += `<tbody>`;
    const startRow = hasHeader ? 2 : 1;
    for (let row = startRow; row <= rows; row++) {
      html += `<tr style="${tableStyles.bodyRow}">`;
      for (let col = 1; col <= columns; col++) {
        html += `<td style="${tableStyles.bodyCell}">${
          isPreview ? `Cell ${row},${col}` : ""
        }</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table>`;

    return html;
  }

  /**
   * Get table styles based on style type
   */
  getTableStyles(style, isPreview = false) {
    const baseSize = isPreview ? "12px" : "14px";
    const basePadding = isPreview ? "4px 6px" : "8px 12px";

    const styles = {
      basic: {
        table: `border-collapse: collapse; width: 100%; font-size: ${baseSize};`,
        headerRow: "",
        headerCell: `border: 1px solid #ddd; padding: ${basePadding}; background: #f5f5f5; font-weight: bold;`,
        bodyRow: "",
        bodyCell: `border: 1px solid #ddd; padding: ${basePadding};`,
      },
      striped: {
        table: `border-collapse: collapse; width: 100%; font-size: ${baseSize};`,
        headerRow: "",
        headerCell: `border: 1px solid #ddd; padding: ${basePadding}; background: #f8f9fa; font-weight: bold;`,
        bodyRow: "",
        bodyCell: `border: 1px solid #ddd; padding: ${basePadding};`,
      },
      bordered: {
        table: `border-collapse: collapse; width: 100%; border: 2px solid #333; font-size: ${baseSize};`,
        headerRow: "",
        headerCell: `border: 1px solid #333; padding: ${basePadding}; background: #e9ecef; font-weight: bold;`,
        bodyRow: "",
        bodyCell: `border: 1px solid #333; padding: ${basePadding};`,
      },
      hover: {
        table: `border-collapse: collapse; width: 100%; font-size: ${baseSize};`,
        headerRow: "",
        headerCell: `border: 1px solid #ddd; padding: ${basePadding}; background: #f8f9fa; font-weight: bold;`,
        bodyRow: "transition: background-color 0.2s;",
        bodyCell: `border: 1px solid #ddd; padding: ${basePadding};`,
      },
      modern: {
        table: `border-collapse: collapse; width: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: ${baseSize};`,
        headerRow: "",
        headerCell: `border: none; padding: ${basePadding}; background: #2196f3; color: white; font-weight: bold;`,
        bodyRow: "",
        bodyCell: `border: none; border-bottom: 1px solid #eee; padding: ${basePadding};`,
      },
    };

    return styles[style] || styles.basic;
  }

  /**
   * Create table element and insert it
   */
  createTableElement() {
    try {
      const rows = parseInt(document.getElementById("tableRows")?.value || 3);
      const columns = parseInt(
        document.getElementById("tableColumns")?.value || 3
      );
      const hasHeader =
        document.getElementById("tableHeader")?.checked || false;
      const style = document.getElementById("tableStyle")?.value || "basic";

      const tableHTML = this.generateTableHTML(rows, columns, hasHeader, style);

      // Create table container
      const tableContainer = document.createElement("div");
      tableContainer.innerHTML = tableHTML;
      tableContainer.style.margin = "10px 0";

      // Insert table after target element or at cursor position
      if (this.interactions.targetElement) {
        this.interactions.targetElement.insertAdjacentElement(
          "afterend",
          tableContainer
        );
      } else {
        document.body.appendChild(tableContainer);
      }

      return {
        success: true,
        message: "Table created successfully",
        element: tableContainer,
        config: { rows, columns, hasHeader, style },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = CreateTable;
} else if (typeof window !== "undefined") {
  window.CreateTable = CreateTable;
}

export { CreateTable };
