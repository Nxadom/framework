/**
 * Percentage.js - Percentage Component
 * Simple percentage display component for NexaReactive
 */

import { initData } from "./Percent/index.js";
class Progress {
  constructor(interactions) {
    this.interactions = interactions;
    this.config = interactions.config;
    this.nexaUI = interactions.nexaUI;
  }

  /**
   * Generate dynamic color palette
   */
  generateColorPalette(count) {
    const baseColors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#C9CBCF",
      "#FF99CC",
      "#4BC0C0",
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
    ];

    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // Generate additional colors dynamically
    const colors = [...baseColors];
    const additionalCount = count - baseColors.length;

    for (let i = 0; i < additionalCount; i++) {
      // Generate HSL colors with different hues
      const hue = (i * 137.5) % 360; // Golden angle approximation
      const saturation = 70 + (i % 3) * 10; // Vary saturation
      const lightness = 50 + (i % 2) * 10; // Vary lightness
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  }

  /**
   * Create gradient color from base color
   */
  createGradientColor(baseColor) {
    // Convert hex to RGB
    const hex = baseColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Create darker version for gradient
    const darkerR = Math.max(0, r - 30);
    const darkerG = Math.max(0, g - 30);
    const darkerB = Math.max(0, b - 30);

    const darkerColor = `rgb(${darkerR}, ${darkerG}, ${darkerB})`;

    return `linear-gradient(90deg, ${baseColor}, ${darkerColor})`;
  }

  /**
   * Create a progress bar element
   */
  createProgressBar(
    value = 75,
    label = "Progress",
    total = null,
    color = "#007bff",
    index = 0
  ) {
    const progressId = `progress-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const totalInfo =
      total !== null
        ? `
      <div class="nexa-progress-total" style="
        font-size: 11px;
        color: #6c757d;
        margin-top: 8px;
        text-align: right;
      ">${total} items</div>
    `
        : "";

    // Create gradient color
    const gradientColor = this.createGradientColor(color);

    const progressHTML = `
      <div class="nexa-progress-container" id="${progressId}" style="
        width: 100%;
        margin: 0;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
      ">
        <div class="nexa-progress-header" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        ">
          <div class="nexa-progress-label" style="
            font-weight: 600;
            color: #2c3e50;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: ${color};
              border-radius: 50%;
            "></div>
            ${label}
          </div>
          <div class="nexa-progress-value" style="
            font-size: 24px;
            font-weight: bold;
            color: ${color};
            background: linear-gradient(135deg, ${color}, ${color}dd);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">${value}%</div>
        </div>
        
        <div class="nexa-progress-bar-container" style="
          position: relative;
          width: 100%;
          height: 12px;
          background: #f1f3f4;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 10px;
        ">
          <div class="nexa-progress-fill" style="
            width: ${value}%;
            height: 100%;
            background: ${gradientColor};
            border-radius: 6px;
            transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(90deg, 
                transparent 0%, 
                rgba(255,255,255,0.3) 50%, 
                transparent 100%);
              animation: shimmer 2s infinite;
            "></div>
          </div>
        </div>
        
        <div class="nexa-progress-footer" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #6c757d;
        ">
          <span>Progress</span>
          <span>${value}% Complete</span>
        </div>
        ${totalInfo}
        
        <style>
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        </style>
      </div>
    `;

    return progressHTML;
  }

  /**
   * Insert percentage element into target element
   */
  async insertPercentage(targetElement, options = {}) {
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

      // Use real data from initData if available
      let percentageHTML = "";

      if (dataform && Array.isArray(dataform) && dataform.length > 0) {
        // Generate color palette for all data
        const colorPalette = this.generateColorPalette(dataform.length);

        // Create summary header
        const totalDesa = dataform.length;
        const totalAll = dataform.reduce(
          (sum, desa) => sum + (desa.total || 0),
          0
        );
        const avgPercent =
          dataform.reduce((sum, desa) => sum + (desa.percent || 0), 0) /
          totalDesa;

        percentageHTML += `
          <div class="nexa-progress-summary" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 25px;
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          ">
            <h3 style="margin: 0 0 15px 0; color: white; font-size: 20px; font-weight: 600;">
              📈 Progress Overview - ${packageKey || "Summary"}
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
              <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${totalDesa}</div>
                <div style="font-size: 12px; opacity: 0.9;">Total Desa</div>
              </div>
              <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${totalAll}</div>
                <div style="font-size: 12px; opacity: 0.9;">Total Items</div>
              </div>
              <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">${avgPercent.toFixed(
                  1
                )}%</div>
                <div style="font-size: 12px; opacity: 0.9;">Average Progress</div>
              </div>
            </div>
          </div>
        `;

        // Create 2-column layout for progress bars using nx-row/nx-col system
        percentageHTML += `
          <div class="nx-row" style="margin-top: 20px;">
        `;

        // Create multiple progress bars for each desa with unique colors in 2-column layout
        dataform.forEach((desa, index) => {
          const value = desa.percent || 0;
          const label = desa.label || `Desa ${index + 1}`;
          const total = desa.total || 0;
          const color = colorPalette[index] || "#007bff";

          percentageHTML += `
            <div class="nx-col-6">
              ${this.createProgressBar(value, label, total, color, index)}
            </div>
          `;
        });

        // Close main wrapper
        percentageHTML += `</div>`;
      } else {
        // Fallback to default behavior
        const value =
          this.getProgressValueForPackage(packageType, packageData) ||
          options.value ||
          75;
        const label =
          options.label ||
          this.getProgressLabelForPackage(packageKey, packageType);

        percentageHTML = `
          <div class="nx-row">
            <div class="nx-col-6">
              ${this.createProgressBar(value, label)}
            </div>
          </div>
        `;
      }

      // Insert into target element
      targetElement.insertAdjacentHTML("beforeend", percentageHTML);

      // Add package-specific styling or attributes to all progress elements
      const progressElements = targetElement.querySelectorAll(
        ".nexa-progress-container"
      );

      progressElements.forEach((element, index) => {
        element.setAttribute("data-package-key", packageKey || "");
        element.setAttribute("data-package-type", packageType);
        element.classList.add(`nexa-progress-${packageType}`);

        // Add some spacing between multiple elements
        if (dataform && dataform.length > 1) {
          element.style.marginBottom = "15px";
        }
      });

      console.log("✅ Progress element inserted successfully");

      // Get the first progress element for return value
      const firstProgressElement = targetElement.querySelector(
        ".nexa-progress-container"
      );

      return {
        success: true,
        message: `Progress element inserted successfully for ${
          packageKey || "default"
        }`,
        element: firstProgressElement,
        packageInfo: { packageKey, packageType, packageData },
        dataCount: dataform && dataform.length ? dataform.length : 1,
      };
    } catch (error) {
      console.error("❌ Error inserting progress element:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get progress value based on package type
   */
  getProgressValueForPackage(packageType, packageData) {
    const valueMap = {
      petani: packageData?.total
        ? Math.min((packageData.total / 200) * 100, 100)
        : 75,
      transaksi: packageData?.total
        ? Math.min((packageData.total / 1000) * 100, 100)
        : 60,
      project:
        packageData?.status === "completed"
          ? 100
          : packageData?.status === "active"
          ? 75
          : 25,
      default: 75,
    };
    return valueMap[packageType] || valueMap["default"];
  }

  /**
   * Get progress label based on package
   */
  getProgressLabelForPackage(packageKey, packageType) {
    const labelMap = {
      petani: `${packageKey} Progress`,
      transaksi: `${packageKey} Completion`,
      project: `${packageKey} Status`,
      default: "Progress",
    };
    return labelMap[packageType] || labelMap["default"];
  }

  /**
   * Update progress value
   */
  updateProgress(progressElement, newValue) {
    if (!progressElement) return false;

    const valueDisplay = progressElement.querySelector(".nexa-progress-value");
    const fill = progressElement.querySelector(".nexa-progress-fill");

    if (valueDisplay && fill) {
      valueDisplay.textContent = `${newValue}%`;
      fill.style.width = `${newValue}%`;
      return true;
    }
    return false;
  }
}

export { Progress };
