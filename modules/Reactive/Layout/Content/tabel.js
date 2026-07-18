/**
 * Tabel.js - Simple Table Component
 * Basic table component for NexaReactive
 */

import { initData } from "./Percent/index.js";

class Tabel {
  constructor(interactions) {
    this.interactions = interactions;
    this.config = interactions.config;
    this.nexaUI = interactions.nexaUI;
  }

  /**
   * Create a simple table element
   */
  createTabel(title = "Table", columns = [], rows = []) {
    const tabelId = `tabel-${Date.now()}`;

    // Default columns if none provided
    if (columns.length === 0) {
      columns = [
        { key: "name", label: "Name" },
        { key: "age", label: "Age" },
        { key: "email", label: "Email" },
      ];
    }

    // Default rows if none provided
    if (rows.length === 0) {
      rows = [
        { name: "John Doe", age: 30, email: "john@example.com" },
        { name: "Jane Smith", age: 25, email: "jane@example.com" },
        { name: "Bob Johnson", age: 35, email: "bob@example.com" },
      ];
    }

    // Generate table header
    const tableHeader = columns
      .map(
        (col) => `
        <th style="
          padding: 12px;
          text-align: left;
          background: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
          font-weight: 600;
          color: #495057;
        ">${col.label}</th>
      `
      )
      .join("");

    // Generate table rows
    const tableRows = rows
      .map(
        (row) => `
        <tr style="border-bottom: 1px solid #dee2e6;">
          ${columns
            .map(
              (col) => `
            <td style="
              padding: 12px;
              color: #495057;
            ">${row[col.key] || "-"}</td>
          `
            )
            .join("")}
        </tr>
      `
      )
      .join("");

    const tabelHTML = `
      <div class="nexa-tabel-container" id="${tabelId}" style="
        width: 100%;
        margin: 10px 0;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      ">
        <div class="nexa-tabel-header" style="
          margin-bottom: 20px;
          text-align: center;
          border-bottom: 2px solid #f8f9fa;
          padding-bottom: 15px;
        ">
          <h3 style="margin: 0; color: #333; font-size: 18px;">${title}</h3>
        </div>
        
        <div class="nexa-tabel-wrapper" style="overflow-x: auto;">
          <table class="nexa-tabel" style="
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          ">
            <thead>
              <tr>
                ${tableHeader}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        
      </div>
    `;

    return tabelHTML;
  }

  /**
   * Insert table element into target element
   */
  async insertTabel(targetElement, options = {}) {
    try {
      if (!targetElement) {
        console.error("No target element provided");
        return { success: false, error: "No target element" };
      }

      // Extract package information
      const packageKey = options.packageKey;
      const packageData = options.packageData;
      const packageType = packageData?.type || "default";
      const dataform = await initData(packageData);
      console.log(dataform);

      console.log(
        `📊 Table component for package: ${packageKey} (${packageType})`,
        {
          packageKey,
          packageData,
          options,
        }
      );

      let title, columns, rows;

      // Use real data if available
      console.log("🔍 Data validation:", {
        dataform: dataform,
        isArray: Array.isArray(dataform),
        length: dataform?.length,
        hasData: dataform && Array.isArray(dataform) && dataform.length > 0,
      });

      if (dataform && Array.isArray(dataform) && dataform.length > 0) {
        console.log("📊 Using real data for table generation:", dataform);

        title =
          options.title ||
          this.getTableTitleFromData(packageKey, packageType, dataform);
        columns = options.columns || this.getTableColumnsFromData(dataform);
        rows = options.rows || this.getTableRowsFromData(dataform);

        console.log("📊 Generated table data:", { title, columns, rows });
      } else {
        console.log("⚠️ No real data available, using fallback data");
        title =
          options.title ||
          `📊 Data ${packageKey || "Default"} - No Data Available`;
        columns = options.columns || [
          { key: "message", label: "Status" },
          { key: "info", label: "Information" },
        ];
        rows = options.rows || [
          { message: "No Data", info: "No real data available" },
        ];

        console.log("📊 Fallback table data:", { title, columns, rows });
      }

      const tabelHTML = this.createTabel(title, columns, rows);

      // Insert into target element
      targetElement.insertAdjacentHTML("beforeend", tabelHTML);

      // Add package-specific styling or attributes
      const tabelElement = targetElement.querySelector(".nexa-tabel-container");
      if (tabelElement) {
        tabelElement.setAttribute("data-package-key", packageKey || "");
        tabelElement.setAttribute("data-package-type", packageType);
        tabelElement.classList.add(`nexa-tabel-${packageType}`);
      }

      console.log("✅ Table element inserted successfully");
      return {
        success: true,
        message: `Table element inserted successfully for ${
          packageKey || "default"
        }`,
        element: tabelElement,
        packageInfo: { packageKey, packageType, packageData },
      };
    } catch (error) {
      console.error("❌ Error inserting table element:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get table title from real data
   */
  getTableTitleFromData(packageKey, packageType, dataform) {
    const totalItems = dataform.length;
    const totalValue = dataform.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );

    return `📊 Data ${packageKey} - ${totalItems} Desa (Total: ${totalValue})`;
  }

  /**
   * Get table columns from real data
   */
  getTableColumnsFromData(dataform) {
    return [
      { key: "label", label: "Nama Desa" },
      { key: "total", label: "Total" },
      { key: "percent", label: "Persentase (%)" },
      { key: "name", label: "Kategori" },
    ];
  }

  /**
   * Get table rows from real data
   */
  getTableRowsFromData(dataform) {
    return dataform.map((item, index) => ({
      label: item.label || `Desa ${index + 1}`,
      total: item.total || 0,
      percent: item.percent ? `${item.percent}%` : "0%",
      name: item.name || "desa",
    }));
  }
}

export { Tabel };
