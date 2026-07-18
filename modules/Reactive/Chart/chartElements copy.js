/**
 * chartElements.js - Sortable Functionality for Elements
 * Provides drag-and-drop sortable functionality for container elements
 * Uses jQuery UI Sortable for better stability and features
 */

class chartElements {
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
        id: "chart-elements",
        icon: "bar-chart-2",
        text: "Chart Elements",
        action: "chartElements",
        showCondition: "hasNoSelectedText",
        submenu: [
          {
            id: "chart-bar",
            icon: "bar-chart-2",
            text: "Bar Chart",
            action: "insertBarChart",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "chart-line",
            icon: "bar-chart-2",
            text: "Line Chart",
            action: "insertLineChart",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "chart-pie",
            icon: "bar-chart-2",
            text: "Pie Chart",
            action: "insertPieChart",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "chart-doughnut",
            icon: "bar-chart-2",
            text: "Doughnut Chart",
            action: "insertDoughnutChart",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "chart-radar",
            icon: "bar-chart-2",
            text: "Radar Chart",
            action: "insertRadarChart",
            showCondition: "hasNoSelectedText",
          },
        ],
      },
    ];
  }

  /**
   * Context menu: Insert chart element
   */
  contextInsertChart(chartType) {
    try {
      if (!this.interactions.targetElement) {
        console.error("Chart insertion failed: No target element");
        return { success: false, error: "No target element" };
      }

      // Check if Chart.js is available
      if (typeof Chart === "undefined") {
        console.error("Chart insertion failed: Chart.js library not available");
        return {
          success: false,
          error:
            "Chart.js library not available. Please include Chart.js library.",
        };
      }

      // Show chart configuration modal
      console.log(`🎨 Opening chart configuration modal for: ${chartType}`);
      this.showChartConfigModal(chartType);

      return {
        success: true,
        message: `Chart configuration modal opened for ${chartType}`,
      };
    } catch (error) {
      console.error("Chart insertion error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Show chart configuration modal
   */
  showChartConfigModal(chartType) {
    try {
      console.log(`🔧 Setting up chart configuration modal for: ${chartType}`);

      // Inject modal control functions
      this.interactions.injectModalControlFunctions();

      // Create and show the chart configuration modal
      const modal = this.createChartConfigModal(chartType);
      document.body.appendChild(modal);
      console.log("📋 Modal created and appended to body");

      // Auto-open the modal
      const modalId = modal.querySelector(".nx-modal").id;
      console.log(`🆔 Modal ID: ${modalId}`);

      // Add event listeners for Chart buttons
      const previewBtn = document.getElementById(
        `preview-chart-btn-${modalId}`
      );
      const insertBtn = document.getElementById(`insert-chart-btn-${modalId}`);

      if (previewBtn) {
        previewBtn.addEventListener("click", () => {
          console.log("🔍 Preview button clicked");
          this.previewChart(modalId, chartType);
        });
        console.log("✅ Preview button listener added");
      } else {
        console.warn("⚠️ Preview button not found");
      }

      if (insertBtn) {
        insertBtn.addEventListener("click", () => {
          console.log("➕ Insert button clicked");
          this.insertChartFromModal(modalId, chartType);
        });
        console.log("✅ Insert button listener added");
      } else {
        console.warn("⚠️ Insert button not found");
      }

      setTimeout(() => {
        console.log(`🚀 Opening modal: ${modalId}`);
        window.openModal(modalId);
      }, 100);
    } catch (error) {
      console.error("❌ Error in showChartConfigModal:", error);
    }
  }

  /**
   * Create chart configuration modal
   */
  createChartConfigModal(chartType) {
    const modalId = `chartModal-${Date.now()}`;
    const container = document.createElement("div");

    let modalTitle = "";
    let sampleData = "";

    switch (chartType) {
      case "bar":
        modalTitle = "Insert Bar Chart";
        sampleData = "Sales,Revenue,Profit\n100,200,50\n150,300,75\n120,250,60";
        break;
      case "line":
        modalTitle = "Insert Line Chart";
        sampleData = "Jan,Feb,Mar,Apr\n10,20,15,25\n8,18,12,22";
        break;
      case "pie":
        modalTitle = "Insert Pie Chart";
        sampleData = "Product A,Product B,Product C\n30,45,25";
        break;
      case "doughnut":
        modalTitle = "Insert Doughnut Chart";
        sampleData = "Desktop,Mobile,Tablet\n60,30,10";
        break;
      case "radar":
        modalTitle = "Insert Radar Chart";
        sampleData = "Speed,Quality,Price,Support\n8,9,6,7\n6,8,9,8";
        break;
      default:
        modalTitle = "Insert Chart";
        sampleData = "Label1,Label2,Label3\n10,20,30";
    }

    container.innerHTML = `
      <!-- Modal -->
      <div class="nx-modal" id="${modalId}">
        <div class="nx-modal-dialog nx-modal-lg">
          <div class="nx-modal-content">
            <div class="nx-modal-header">
              <h5 class="nx-modal-title">${modalTitle}</h5>
              <button type="button" class="nx-modal-close" onclick="closeModal('${modalId}')">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="nx-modal-body">
              <form id="chartForm-${modalId}">
                <div style="display: flex; gap: 1rem;">
                  <div style="flex: 2;">
                    <div class="form-nexa-group">
                      <label class="form-label" for="chartTitle-${modalId}">Chart Title</label>
                      <input type="text" class="form-nexa-control" id="chartTitle-${modalId}" 
                             value="${
                               chartType.charAt(0).toUpperCase() +
                               chartType.slice(1)
                             } Chart" required>
                    </div>
                    
                    <div class="form-nexa-group">
                      <label class="form-label" for="chartData-${modalId}">Chart Data (CSV Format)</label>
                      <textarea class="form-nexa-control" id="chartData-${modalId}" rows="6" 
                                placeholder="Enter data in CSV format...">${sampleData}</textarea>
                      <div class="form-text">
                        First row: Labels, Next rows: Data values. Use comma to separate values.
                      </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                      <div style="flex: 1;">
                        <div class="form-nexa-group">
                          <label class="form-label" for="chartWidth-${modalId}">Width (px)</label>
                          <input type="number" class="form-nexa-control" id="chartWidth-${modalId}" 
                                 value="400" min="200" max="1000">
                        </div>
                      </div>
                      <div style="flex: 1;">
                        <div class="form-nexa-group">
                          <label class="form-label" for="chartHeight-${modalId}">Height (px)</label>
                          <input type="number" class="form-nexa-control" id="chartHeight-${modalId}" 
                                 value="300" min="150" max="600">
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style="flex: 1;">
                    <div class="form-nexa-group">
                      <label class="form-label">Chart Colors</label>
                      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
                        <input type="color" class="form-nexa-control" value="#FF6384" title="Color 1">
                        <input type="color" class="form-nexa-control" value="#36A2EB" title="Color 2">
                        <input type="color" class="form-nexa-control" value="#ffc107" title="Color 3">
                        <input type="color" class="form-nexa-control" value="#4BC0C0" title="Color 4">
                        <input type="color" class="form-nexa-control" value="#9966FF" title="Color 5">
                      </div>
                    </div>
                    
                    <div class="form-nexa-group">
                      <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="showLegend-${modalId}" checked>
                        <label class="form-check-label" for="showLegend-${modalId}">Show Legend</label>
                      </div>
                      
                      <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="enableAnimation-${modalId}" checked>
                        <label class="form-check-label" for="enableAnimation-${modalId}">Enable Animation</label>
                      </div>
                      
                      <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="responsive-${modalId}" checked>
                        <label class="form-check-label" for="responsive-${modalId}">Responsive</label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="nx-modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeModal('${modalId}')">
                Close
              </button>
              <button type="button" class="btn btn-info" id="preview-chart-btn-${modalId}">
                <span class="material-symbols-outlined" style="font-size: 16px; margin-right: 4px;">visibility</span>
                Preview
              </button>
              <button type="button" class="btn btn-primary" id="insert-chart-btn-${modalId}">
                <span class="material-symbols-outlined" style="font-size: 16px; margin-right: 4px;">add</span>
                Insert Chart
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    return container;
  }

  /**
   * Preview chart in modal
   */
  previewChart(modalId, chartType) {
    try {
      const config = this.getChartConfigFromModal(modalId, chartType);

      if (!config) {
        return;
      }

      // Create preview area if not exists
      let previewArea = document.getElementById(`preview-${modalId}`);
      if (!previewArea) {
        previewArea = document.createElement("div");
        previewArea.id = `preview-${modalId}`;
        previewArea.innerHTML = `
          <hr>
          <h6>Chart Preview:</h6>
          <div style="max-width: 300px; max-height: 200px; margin: 10px auto;">
            <canvas id="previewCanvas-${modalId}"></canvas>
          </div>
        `;

        const modalBody = document.querySelector(`#${modalId} .nx-modal-body`);
        modalBody.appendChild(previewArea);
      }

      // Create preview chart
      const canvas = document.getElementById(`previewCanvas-${modalId}`);
      const ctx = canvas.getContext("2d");

      // Destroy existing chart if any
      if (canvas.chart) {
        canvas.chart.destroy();
      }

      // Create new chart
      canvas.chart = new Chart(ctx, {
        type: chartType,
        data: config.data,
        options: {
          ...config.options,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            ...config.options.plugins,
            legend: {
              display: config.showLegend,
              position: "top",
            },
          },
        },
      });
    } catch (error) {}
  }

  /**
   * Insert chart from modal form
   */
  insertChartFromModal(modalId, chartType) {
    try {
      console.log(`📊 Inserting chart from modal: ${chartType}`);
      const config = this.getChartConfigFromModal(modalId, chartType);

      if (!config) {
        console.error("❌ Failed to get chart config from modal");
        return;
      }

      console.log("✅ Chart config retrieved:", config);

      // Close the modal
      window.closeModal(modalId);
      console.log("🚪 Modal closed");

      // Remove modal from DOM after close animation
      setTimeout(() => {
        const modalElement = document.getElementById(modalId);
        if (modalElement && modalElement.parentNode) {
          modalElement.parentNode.remove();
          console.log("🧹 Modal element removed from DOM");
        }
      }, 300);

      // Create and insert the chart
      console.log("🎨 Creating and inserting chart...");
      this.createAndInsertChart(chartType, config);
    } catch (error) {
      console.error("❌ Error in insertChartFromModal:", error);
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
      const width = widthInput ? parseInt(widthInput.value) : 400;
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

      let labels, datasets;

      // Logika berbeda untuk pie/doughnut vs bar/line chart
      if (chartType === "pie" || chartType === "doughnut") {
        // Untuk pie/doughnut: header = labels, single data row
        labels = lines[0].split(",").map((label) => label.trim());

        if (lines.length < 2) {
          throw new Error("Pie/Doughnut chart requires labels and data values");
        }

        const values = lines[1]
          .split(",")
          .map((val) => parseFloat(val.trim()) || 0);

        // Generate colors untuk setiap slice
        const backgroundColors = [];
        for (let i = 0; i < labels.length; i++) {
          const sliceColor =
            colors.length > i && colors[i]
              ? colors[i]
              : defaultColors[i % defaultColors.length];
          backgroundColors.push(sliceColor);
        }

        datasets = [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors,
            borderWidth: 1,
          },
        ];
      } else if (chartType === "radar") {
        // Untuk radar chart: header = axes, setiap baris = dataset
        labels = lines[0].split(",").map((label) => label.trim()); // Speed, Quality, Price, Support

        // Parse data rows - setiap baris adalah satu dataset
        datasets = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((val) => parseFloat(val.trim()) || 0);

          // Tentukan warna untuk dataset ini
          const datasetColor =
            colors.length > i - 1 && colors[i - 1]
              ? colors[i - 1]
              : defaultColors[(i - 1) % defaultColors.length];

          datasets.push({
            label: `Dataset ${i}`, // Dataset 1, Dataset 2, dst
            data: values,
            backgroundColor: datasetColor + "40", // Semi-transparent for radar
            borderColor: datasetColor,
            pointBackgroundColor: datasetColor,
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: datasetColor,
            borderWidth: 2,
          });
        }
      } else {
        // Untuk bar/line: header = categories, multiple data rows
        const categories = lines[0].split(",").map((label) => label.trim());

        // Parse data rows
        const dataRows = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((val) => parseFloat(val.trim()) || 0);
          dataRows.push(values);
        }

        // Generate labels untuk sumbu X (Data Point 1, 2, 3, dst)
        labels = dataRows.map((_, index) => `Data Point ${index + 1}`);

        // Create datasets - satu untuk setiap kategori (Sales, Revenue, Profit)
        datasets = [];

        for (
          let categoryIndex = 0;
          categoryIndex < categories.length;
          categoryIndex++
        ) {
          const categoryName = categories[categoryIndex];

          // Ambil data untuk kategori ini dari semua baris
          const categoryData = dataRows.map((row) => row[categoryIndex] || 0);

          // Tentukan warna untuk kategori ini
          const categoryColor =
            colors.length > categoryIndex && colors[categoryIndex]
              ? colors[categoryIndex]
              : defaultColors[categoryIndex % defaultColors.length];

          datasets.push({
            label: categoryName, // Gunakan nama kategori (Sales, Revenue, Profit)
            data: categoryData,
            backgroundColor: categoryColor,
            borderColor: categoryColor,
            borderWidth: 1,
          });
        }
      }

      return {
        title,
        width,
        height,
        showLegend,
        enableAnimation,
        responsive,
        data: {
          labels,
          datasets,
        },
        options: {
          responsive,
          animation: enableAnimation,
          plugins: {
            title: {
              display: !!title,
              text: title,
            },
            legend: {
              display: showLegend,
            },
          },
        },
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
      console.log(`🏗️ Creating chart container for: ${chartType}`);
      console.log("📐 Chart config:", config);

      // Create chart container
      const container = document.createElement("div");
      container.className = "nexa-chart-container";
      container.style.cssText = `
        position: relative;
        width: ${config.width}px;
        height: ${config.height}px;
        margin: 1rem auto;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        background: white;
      `;
      console.log("📦 Chart container created");

      // Create canvas element
      const canvas = document.createElement("canvas");
      canvas.style.cssText = `
        width: 100%;
        height: 100%;
      `;

      container.appendChild(canvas);
      console.log("🖼️ Canvas element created and added to container");

      // Insert container into target element
      console.log("🎯 Inserting chart at position...");
      this.insertChartAtPosition(container);

      // Initialize Chart.js
      console.log("⚡ Initializing Chart.js...");
      const ctx = canvas.getContext("2d");
      const chart = new Chart(ctx, {
        type: chartType,
        data: config.data,
        options: config.options,
      });

      console.log("✅ Chart successfully created:", chart);

      const displayName = `${
        chartType.charAt(0).toUpperCase() + chartType.slice(1)
      } Chart`;

      console.log(`🎉 ${displayName} insertion completed!`);
      return { success: true, message: `${displayName} inserted` };
    } catch (error) {
      console.error("❌ Error in createAndInsertChart:", error);
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
        console.warn("No target element available for chart insertion");
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
      console.error("Error inserting chart:", error);
      // Ultimate fallback: append to body
      document.body.appendChild(element);
    }
  }

  /**
   * Handle chart action cases
   */
  handleChartActions(actionType) {
    switch (actionType) {
      case "chartElements":
        // Parent menu item - submenu handles the actual actions
        break;
      case "insertBarChart":
        this.contextInsertChart("bar");
        break;
      case "insertLineChart":
        this.contextInsertChart("line");
        break;
      case "insertPieChart":
        this.contextInsertChart("pie");
        break;
      case "insertDoughnutChart":
        this.contextInsertChart("doughnut");
        break;
      case "insertRadarChart":
        this.contextInsertChart("radar");
        break;
      default:
        return false;
    }
    return true;
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = chartElements;
} else if (typeof window !== "undefined") {
  window.chartElements = chartElements;
}

export { chartElements };
