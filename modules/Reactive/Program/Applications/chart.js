import { getChartConfig as getChartTypeConfig, chartTypes } from "./chart/index.js";

export async function appChart(data) {
  try {
    // Ambil targetElement dari data
    const targetElement = data.targetElement;
    
    if (!targetElement) {
      return { 
        success: false, 
        error: 'Target element tidak ditemukan' 
      };
    }
const Federated= new NXUI.Federated({
  id:data.token,
  ...data
});
 

 const dataTabel= await Federated.analysis(data.failed);
console.log('ass:', dataTabel);
 // const dataTabel= await Federated.get(data.applications);
 
 // Gunakan data dinamis dari dataTabel.response
 // Pastikan dataTabel.response adalah array, jika tidak gunakan array kosong sebagai fallback
 let chartData = [];
 
 if (dataTabel && dataTabel.response) {
   // Jika dataTabel.response sudah array, gunakan langsung
   if (Array.isArray(dataTabel.response)) {
     chartData = dataTabel.response;
   } 
   // Jika dataTabel.response adalah object, coba ekstrak array-nya
   else if (typeof dataTabel.response === 'object') {
     // Cek apakah ada property yang berisi array
     const keys = Object.keys(dataTabel.response);
     const arrayKey = keys.find(key => Array.isArray(dataTabel.response[key]));
     if (arrayKey) {
       chartData = dataTabel.response[arrayKey];
     } else {
       // Jika tidak ada array, konversi object menjadi array
       chartData = [dataTabel.response];
     }
   }
 }
 
 // Validasi format data: pastikan setiap item memiliki 'title' dan 'total'
 // Jika format berbeda, coba transformasi
 if (chartData.length > 0 && !chartData[0].hasOwnProperty('title')) {
   // Coba transformasi jika format berbeda
   chartData = chartData.map((item, index) => {
     // Jika item adalah object, coba cari property yang cocok
     if (typeof item === 'object') {
       const keys = Object.keys(item);
       // Cari key yang mungkin adalah 'title' atau 'name' atau 'label'
       const titleKey = keys.find(k => 
         k.toLowerCase().includes('title') || 
         k.toLowerCase().includes('name') || 
         k.toLowerCase().includes('label')
       ) || keys[0];
       // Cari key yang mungkin adalah 'total' atau 'count' atau 'value'
       const totalKey = keys.find(k => 
         k.toLowerCase().includes('total') || 
         k.toLowerCase().includes('count') || 
         k.toLowerCase().includes('value')
       ) || keys[1] || keys[keys.length - 1];
       
       return {
         title: item[titleKey] || `Item ${index + 1}`,
         total: Number(item[totalKey]) || 0
       };
     }
     // Jika item bukan object, gunakan nilai langsung
     return {
       title: `Item ${index + 1}`,
       total: Number(item) || 0
     };
  });
}

    // Jika ada chartType, langsung insert chart tanpa menampilkan HTML
    if (data.chartType && chartData && chartData.length > 0) {
      
      // Konversi chartData ke CSV format
      const labels = chartData.map(item => {
        return item.title || item.name || item.label || 'Unknown';
      }).join(',');
      
      const values = chartData.map(item => {
        const value = item.total || item.count || item.value || 0;
        return Number(value) || 0;
      }).join(',');
      
      const csvData = `${labels}\n${values}`;
      
      // Simpan data ke window untuk digunakan di modal chart
      window.chartDataCSV = csvData;
      window.chartData = chartData;
      
      // Inisialisasi chartElements
      const chartElementsInstance = new chartElements({
        targetElement: targetElement,
        config: data.config || {},
        nexaUI: window.NXUI || window.nexaUI
      });
      
      // Set targetElement
      chartElementsInstance.interactions.targetElement = targetElement;
      window.chartElementsInstance = chartElementsInstance;
      window.chartTargetElement = targetElement;
      
      // Panggil contextInsertChart dengan chartType
      return chartElementsInstance.contextInsertChart(data.chartType);
    }

    // Jika tidak ada chartType, tampilkan HTML informasi data seperti biasa
    // Buat HTML konten untuk menampilkan informasi data
    const contentHTML = `
      <div class="nexa-app-data-container" style="
        padding: 20px;
        margin: 10px 0;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        background: #f8f9fa;
      ">
        <h2 style="
          margin: 0 0 15px 0;
          color: #495057;
          font-size: 1.5rem;
        ">Data Application</h2>
        <p style="
          margin: 0 0 10px 0;
          color: #6c757d;
        ">Type: <strong>${data.baseType || 'N/A'}</strong></p>
        ${data.applications ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
            <p style="margin: 5px 0;"><strong>Access:</strong> ${data.applications.access || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Tabel:</strong> ${data.applications.tabelName?.join(', ') || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Alias:</strong> ${data.applications.aliasNames?.join(', ') || 'N/A'}</p>
          </div>
        ` : '<p style="margin-top: 10px; color: #6c757d;">Tidak ada data applications tersedia.</p>'}
        
        ${chartData && chartData.length > 0 ? `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <h3 style="margin: 0 0 15px 0; color: #495057; font-size: 1.2rem;">Data Tersedia</h3>
            <p style="margin: 0; color: #6c757d; font-size: 0.9rem;">
              Total data: <strong>${chartData.length}</strong> item
            </p>
            <p style="margin-top: 10px; color: #6c757d; font-size: 0.85rem;">
              💡 Gunakan submenu chart di context menu untuk membuat chart dari data ini.
            </p>
          </div>
        ` : `
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
            <p style="color: #dc3545; margin: 0;">
              ⚠️ Data tidak tersedia. Pastikan dataTabel.response berisi data yang valid.
            </p>
          </div>
        `}
      </div>
    `;

    // Insert konten ke target element
    targetElement.insertAdjacentHTML("beforeend", contentHTML);

    // Ambil element yang baru dibuat untuk styling atau manipulasi lebih lanjut
    const appDataElement = targetElement.querySelector(".nexa-app-data-container");
    if (appDataElement) {
      appDataElement.setAttribute("data-base-type", data.baseType || "");
      appDataElement.setAttribute("data-chart-data", JSON.stringify(chartData));
      if (data.applications) {
        appDataElement.setAttribute("data-access", data.applications.access || "");
      }
    }

    return {
      success: true,
      message: `Data application berhasil ditampilkan untuk type: ${data.baseType}`,
      element: appDataElement
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * chartElements.js - Sortable Functionality for Elements
 * Provides drag-and-drop sortable functionality for container elements
 * Uses jQuery UI Sortable for better stability and features
 */

export class chartElements {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;

    // Store global reference for fallback purposes
    window.chartElementsInstance = this;
  }

  /**
   * Context menu: Insert chart element
   */
  contextInsertChart(chartType) {
    try {
      if (!this.interactions.targetElement) {
        return { success: false, error: "No target element" };
      }

      // Check if Chart.js is available
      if (typeof Chart === "undefined") {
        return {
          success: false,
          error:
            "Chart.js library not available. Please include Chart.js library.",
        };
      }

      // Show chart configuration modal
      this.showChartConfigModal(chartType);

      return {
        success: true,
        message: `Chart configuration modal opened for ${chartType}`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Show chart configuration modal
   */
  showChartConfigModal(chartType) {
    try {
      // Create modal ID - make it simpler and more predictable
      const timestamp = Date.now();
      const modalId = `chartModal${timestamp}`;

      // Setup global callback functions FIRST before creating modal
      const callbackResults = this.setupGlobalCallbacks(modalId, chartType);

      // If callback creation failed, don't proceed
      if (callbackResults.insert !== "function" || callbackResults.cancel !== "function") {
        return;
      }

      // Create and register the NexaUI modal
      this.createChartConfigModal(chartType, modalId);

      // Open the modal after ensuring everything is ready
      setTimeout(() => {
        this.nexaUI.nexaModal.open(modalId);
      }, 500);
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Create chart configuration modal using NexaUI
   */
  createChartConfigModal(chartType, modalId) {
    // Get chart type configuration from modular chart types
    const chartConfig = getChartTypeConfig(chartType);
    
    let modalTitle = "";
    let sampleData = "";

    // Cek apakah ada data dinamis dari window.chartDataCSV (dari ContentObject.js)
    if (window.chartDataCSV && window.chartDataCSV.trim()) {
      sampleData = window.chartDataCSV;
    } else {
      // Gunakan sample data default dari chart config module
      if (chartConfig) {
        modalTitle = chartConfig.modalTitle;
        sampleData = chartConfig.defaultSampleData;
      } else {
        modalTitle = "Insert Chart";
        sampleData = "Label1,Label2,Label3\n10,20,30";
      }
    }

    // Set modal title berdasarkan chartType jika belum diset
    if (!modalTitle) {
      if (chartConfig) {
        modalTitle = chartConfig.modalTitle;
      } else {
        modalTitle = "Insert Chart";
      }
    }

    // Create modal content using NexaUI form standards
    const modalContent = `
      <form id="chartForm-${modalId}">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
          <div>
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="chartTitle-${modalId}">Chart Title</label></dt>
                <dd class="form-group-body">
                  <input type="text" class="form-control input-block" id="chartTitle-${modalId}"
                         value="${
                           chartType.charAt(0).toUpperCase() + chartType.slice(1)
                         } Chart" required>
                </dd>
              </dl>
            </div>

            <div class="form-group" style="display: none;">
              <dl>
                <dt class="form-group-header"><label for="chartData-${modalId}">Chart Data (CSV Format)</label></dt>
                <dd class="form-group-body">
                  <textarea class="form-control input-block" id="chartData-${modalId}" rows="5"
                            placeholder="Enter data in CSV format...">${sampleData}</textarea>
                  <p class="note">
                    First row: Labels, Next rows: Data values. Use comma to separate values.
                  </p>
                </dd>
              </dl>
            </div>

            <div class="nx-row">
              <div class="nx-col-6">
                <div class="form-group">
                  <dl>
                    <dt class="form-group-header"><label for="chartWidth-${modalId}">Width (%)</label></dt>
                    <dd class="form-group-body">
                      <input type="number" class="form-control" id="chartWidth-${modalId}"
                             value="100" min="10" max="100">
                    </dd>
                  </dl>
                </div>
              </div>
              <div class="nx-col-6">
                <div class="form-group">
                  <dl>
                    <dt class="form-group-header"><label for="chartHeight-${modalId}">Height (px)</label></dt>
                    <dd class="form-group-body">
                      <input type="number" class="form-control" id="chartHeight-${modalId}"
                             value="300" min="150" max="600">
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="form-group">
              <label>Chart Colors</label>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                <input type="color" class="form-control" value="#FF6384" title="Color 1" style="width: 35px; height: 35px; padding: 2px;">
                <input type="color" class="form-control" value="#36A2EB" title="Color 2" style="width: 35px; height: 35px; padding: 2px;">
                <input type="color" class="form-control" value="#ffc107" title="Color 3" style="width: 35px; height: 35px; padding: 2px;">
                <input type="color" class="form-control" value="#4BC0C0" title="Color 4" style="width: 35px; height: 35px; padding: 2px;">
                <input type="color" class="form-control" value="#9966FF" title="Color 5" style="width: 35px; height: 35px; padding: 2px;">
              </div>
            </div>

            <div class="form-group">
              <label>Options</label>
              <div class="form-checkbox">
                <label><input type="checkbox" id="showLegend-${modalId}" checked> Show Legend</label>
              </div>
              <div class="form-checkbox">
                <label><input type="checkbox" id="enableAnimation-${modalId}" checked> Enable Animation</label>
              </div>
              <div class="form-checkbox">
                <label><input type="checkbox" id="responsive-${modalId}" checked> Responsive</label>
              </div>
            </div>
          </div>
        </div>
      </form>
    `;

    // Create NexaUI modal
    NXUI.modalHTML({
      elementById: modalId,
      styleClass: "w-500px",
      label: modalTitle,
      onclick: {
        title: "Insert Chart",
        cancel: `cancel`,
        send: `insertChart_${modalId}`,
      },
      content: modalContent,
      footer: false,
    });
  }

  /**
   * Setup global callback functions following NexaUI pattern
   */
  setupGlobalCallbacks(modalId, chartType) {
    // Store reference to 'this' context for use in global functions
    const self = this;

    // Create function names
    const insertFunctionName = `insertChart_${modalId}`;
    const cancelFunctionName = `cancelChart_${modalId}`;

    // Create global insert function for modal onclick.send
    try {
      window[insertFunctionName] = function () {
        try {
          self.insertChartFromModal(modalId, chartType);
        } catch (error) {
          // Silent error handling
        }
      };
    } catch (error) {
      // Silent error handling
    }

    // Create global cancel function for modal onclick.cancel
    try {
      window[cancelFunctionName] = function () {
        try {
          self.nexaUI.nexaModal.close(modalId);
          self.cleanupGlobalCallbacks(modalId);
        } catch (error) {
          // Silent error handling
        }
      };
    } catch (error) {
      // Silent error handling
    }

    // Final verification - check immediately
    const verificationResults = {
      insert: typeof window[insertFunctionName],
      cancel: typeof window[cancelFunctionName],
    };

    return verificationResults;
  }

  /**
   * Clean up global callback functions
   */
  cleanupGlobalCallbacks(modalId) {
    // Remove global functions
    if (window[`insertChart_${modalId}`]) {
      delete window[`insertChart_${modalId}`];
    }

    if (window[`cancelChart_${modalId}`]) {
      delete window[`cancelChart_${modalId}`];
    }
  }

  /**
   * Insert chart from modal form
   */
  insertChartFromModal(modalId, chartType) {
    try {
      const config = this.getChartConfigFromModal(modalId, chartType);

      if (!config) {
        return;
      }

      // Close the NexaUI modal
      this.nexaUI.nexaModal.close(modalId);

      // Clean up global functions
      this.cleanupGlobalCallbacks(modalId);

      // Bersihkan data CSV setelah chart dibuat (opsional, bisa di-comment jika ingin data tetap tersedia)
      // window.chartDataCSV = null;
      // window.chartData = null;

      // Create and insert the chart
      this.createAndInsertChart(chartType, config);
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Get chart configuration from modal form
   */
  getChartConfigFromModal(modalId, chartType = "bar") {
    try {
      const titleInput = document.getElementById(`chartTitle-${modalId}`);
      const dataInput = document.getElementById(`chartData-${modalId}`);
      const widthInput = document.getElementById(`chartWidth-${modalId}`);
      const heightInput = document.getElementById(`chartHeight-${modalId}`);
      const legendCheckbox = document.getElementById(`showLegend-${modalId}`);
      const animationCheckbox = document.getElementById(
        `enableAnimation-${modalId}`
      );
      const responsiveCheckbox = document.getElementById(
        `responsive-${modalId}`
      );

      const title = titleInput ? titleInput.value.trim() : "";
      const csvData = dataInput ? dataInput.value.trim() : "";
      const width = widthInput ? parseInt(widthInput.value) : 100; // Width in percentage
      const height = heightInput ? parseInt(heightInput.value) : 300;
      const showLegend = legendCheckbox ? legendCheckbox.checked : true;
      const enableAnimation = animationCheckbox
        ? animationCheckbox.checked
        : true;
      const responsive = responsiveCheckbox ? responsiveCheckbox.checked : true;

      if (!csvData) {
        throw new Error("Chart data is required");
      }

      // Parse CSV data
      const lines = csvData.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        throw new Error(
          "At least 2 rows of data are required (labels + values)"
        );
      }

      // Get colors from color inputs
      const colorInputs = document.querySelectorAll(
        `#${modalId} input[type="color"]`
      );
      const colors = Array.from(colorInputs).map((input) => input.value);

      // Define default colors untuk setiap kategori
      const defaultColors = [
        "#FF6384", // Color 1 - Merah
        "#36A2EB", // Color 2 - Biru
        "#ffc107", // Color 3 - Warning yellow
        "#4BC0C0", // Color 4 - Teal
        "#9966FF", // Color 5 - Purple
        "#FF9F40",
        "#C9CBCF",
        "#FF99CC",
        "#66FF66",
        "#FFB366",
      ];

      // Get chart type configuration from modular chart types
      const chartTypeConfig = getChartTypeConfig(chartType);
      
      if (!chartTypeConfig) {
        throw new Error(`Unsupported chart type: ${chartType}`);
      }

      // Use modular parseData method from chart type config
      const { labels, datasets } = chartTypeConfig.parseData(lines, colors, defaultColors);

      // Use modular getChartConfig method to build Chart.js config
      const chartJsConfig = chartTypeConfig.getChartConfig(labels, datasets, {
        title,
        width,
        height,
        showLegend,
        enableAnimation,
        responsive,
      });

      // Return config with both chart.js structure and metadata
      return {
        type: chartTypeConfig.type,
        title,
        width,
        height,
        showLegend,
        enableAnimation,
        responsive,
        data: chartJsConfig.data,
        options: chartJsConfig.options,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Create and insert chart element
   */
  createAndInsertChart(chartType, config) {
    try {
      // Generate unique ID for this chart
      const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create chart configuration object for data attribute
      // Config already contains type, data, and options from modular chart types
      const chartConfig = {
        type: config.type || chartType,
        data: config.data,
        options: config.options,
      };

      // Escape config for use in data attribute
      const configJSON = JSON.stringify(chartConfig).replace(/"/g, '&quot;');

      // Create chart container
      const container = document.createElement("div");
      container.className = "nexa-chart-container";
      container.id = `chart-container-${chartId}`;
      container.setAttribute('data-chart-config', configJSON);
      container.style.cssText = `
        position: relative;
        width: ${config.width}%;
        height: ${config.height}px;
        margin: 1rem auto;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        background: white;
      `;

      // Create canvas element
      const canvas = document.createElement("canvas");
      canvas.id = `chart-canvas-${chartId}`;
      canvas.style.cssText = `
        width: 100%;
        height: 100%;
      `;

      container.appendChild(canvas);

      // Insert container into target element
      this.insertChartAtPosition(container);

      // Initialize Chart.js immediately
      const ctx = canvas.getContext("2d");
      const chart = new Chart(ctx, chartConfig);

      // Store chart instance on canvas for reference
      canvas.chart = chart;

      const displayName = `${
        chartType.charAt(0).toUpperCase() + chartType.slice(1)
      } Chart`;

      return { success: true, message: `${displayName} inserted` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Insert chart element at appropriate position in target element
   */
  insertChartAtPosition(element) {
    try {
      // Get target element from interactions
      const targetElement = this.interactions.targetElement;

      if (!targetElement) {
        // Fallback: append to body
        document.body.appendChild(element);
        return;
      }

      // Simple insertion logic: append to target element
      targetElement.appendChild(element);

      // Scroll into view if needed
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    } catch (error) {
      // Ultimate fallback: append to body
      document.body.appendChild(element);
    }
  }

  /**
   * Generate chart HTML directly from data (without modal)
   * @param {Array} data - Array of objects with {title, total} structure
   * @param {string} chartType - Type of chart: 'bar', 'pie', 'doughnut', 'line'
   * @param {Object} options - Chart options {width, height, title, showLegend}
   * @returns {string} HTML string with chart container and initialization script
   */
  static generateChartHTML(data, chartType = 'bar', options = {}) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return '<div class="alert alert-warning">No data available for chart</div>';
    }

    // Default options
    const defaultOptions = {
      width: 800,
      height: 400,
      title: '',
      showLegend: true,
      responsive: true,
      ...options
    };

    // Generate unique ID for this chart
    const chartId = `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Default colors
    const defaultColors = [
      "#FF6384", "#36A2EB", "#ffc107", "#4BC0C0", "#9966FF",
      "#FF9F40", "#C9CBCF", "#FF99CC", "#66FF66", "#FFB366",
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
      "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B739", "#52BE80"
    ];

    // Prepare chart data
    const labels = data.map(item => item.title);
    const values = data.map(item => item.total || 0);
    
    // Generate colors
    const backgroundColors = labels.map((_, index) => 
      defaultColors[index % defaultColors.length]
    );

    // Prepare datasets based on chart type
    let datasets;
    if (chartType === 'pie' || chartType === 'doughnut') {
      datasets = [{
        data: values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }];
    } else {
      datasets = [{
        label: 'Total',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }];
    }

    // Chart configuration
    const chartConfig = {
      type: chartType,
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: defaultOptions.responsive,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!defaultOptions.title,
            text: defaultOptions.title
          },
          legend: {
            display: defaultOptions.showLegend,
            position: chartType === 'pie' || chartType === 'doughnut' ? 'right' : 'top'
          }
        },
        scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
          y: {
            beginAtZero: true
          }
        } : undefined
      }
    };

    // Escape config for use in data attribute
    const configJSON = JSON.stringify(chartConfig).replace(/"/g, '&quot;');

    // Generate HTML with data attribute
    const html = `
      <div class="nexa-chart-container" id="chart-container-${chartId}" 
           data-chart-config='${configJSON}'
           style="position: relative; width: ${defaultOptions.width}px; height: ${defaultOptions.height}px; 
                  margin: 1rem auto; padding: 15px; border-radius: 8px; 
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1); background: white;">
        <canvas id="chart-canvas-${chartId}"></canvas>
      </div>
    `;

    return html;
  }

  /**
   * Initialize all charts in the DOM
   * Call this function after HTML is rendered
   */
  static initializeCharts() {
    if (typeof Chart === 'undefined') {
      return;
    }

    const chartContainers = document.querySelectorAll('.nexa-chart-container[data-chart-config]');
    
    chartContainers.forEach(container => {
      try {
        const canvas = container.querySelector('canvas');
        if (!canvas) {
          return;
        }

        // Skip if chart already initialized
        if (canvas.chart) {
          return;
        }

        // Get chart config from data attribute
        const configJSON = container.getAttribute('data-chart-config');
        if (!configJSON) {
          return;
        }

        // Parse config
        const chartConfig = JSON.parse(configJSON.replace(/&quot;/g, '"'));

        // Initialize chart
        const ctx = canvas.getContext('2d');
        canvas.chart = new Chart(ctx, chartConfig);
      } catch (error) {
        // Silent error handling
      }
    });
  }
}

// Export for both CommonJS and ES6 modules
// chartElements class sudah di-export di baris 199 dengan: export class chartElements
// appChart function sudah di-export di baris 2 dengan: export async function appChart
if (typeof module !== "undefined" && module.exports) {
  module.exports = { chartElements, appChart };
} else if (typeof window !== "undefined") {
  window.chartElements = chartElements;
  window.appChart = appChart;
}

