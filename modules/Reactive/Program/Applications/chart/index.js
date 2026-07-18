/**
 * Chart Types Index
 * Central export for all chart type configurations
 */

import { barChartConfig } from "./bar.js";
import { lineChartConfig } from "./line.js";
import { pieChartConfig } from "./pie.js";
import { doughnutChartConfig } from "./doughnut.js";
import { radarChartConfig } from "./radar.js";

/**
 * Chart types registry
 * Maps chart type string to its configuration module
 */
export const chartTypes = {
  bar: barChartConfig,
  line: lineChartConfig,
  pie: pieChartConfig,
  doughnut: doughnutChartConfig,
  radar: radarChartConfig,
};

/**
 * Get chart configuration by type
 * @param {string} chartType - The chart type (bar, line, pie, doughnut, radar)
 * @returns {object|null} Chart configuration object or null if not found
 */
export function getChartConfig(chartType) {
  return chartTypes[chartType] || null;
}

/**
 * Get all available chart types
 * @returns {string[]} Array of chart type names
 */
export function getAvailableChartTypes() {
  return Object.keys(chartTypes);
}

/**
 * Check if a chart type is supported
 * @param {string} chartType - The chart type to check
 * @returns {boolean} True if chart type is supported
 */
export function isChartTypeSupported(chartType) {
  return chartType in chartTypes;
}

// Export individual configs for direct access if needed
export {
  barChartConfig,
  lineChartConfig,
  pieChartConfig,
  doughnutChartConfig,
  radarChartConfig,
};

