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
      }
     ]
  }


}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = chartElements;
} else if (typeof window !== "undefined") {
  window.chartElements = chartElements;
}

export { chartElements };
