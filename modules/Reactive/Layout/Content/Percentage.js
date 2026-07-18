/**
 * Percentage.js - Percentage Component
 * Simple percentage display component for NexaReactive
 */

import { initData } from "./Percent/index.js";
class Percentage {
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
   * Create a percentage display element
   */
  createPercentage(
    value = 75,
    label = "Percentage",
    total = null,
    color = "#007bff",
    index = 0
  ) {
    const percentageId = `percentage-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const totalInfo =
      total !== null
        ? `
      <div class="nexa-percentage-total" style="
        font-size: 12px;
        color: #6c757d;
        margin-top: 5px;
      ">Total: ${total}</div>
    `
        : "";

    // Create gradient color
    const gradientColor = this.createGradientColor(color);

    const percentageHTML = `
      <div class="nexa-percentage-container" id="${percentageId}" style="
        width: 100%;
        margin: 0;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f8f9fa;
        text-align: center;
        border-left: 4px solid ${color};
        box-sizing: border-box;
        min-height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      ">
        <div class="nexa-percentage-label" style="
          margin-bottom: 10px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        ">${label}</div>
        <div class="nexa-percentage-value" style="
          font-size: 36px;
          font-weight: bold;
          color: ${color};
          margin: 10px 0;
        ">${value}%</div>
        <div class="nexa-percentage-bar" style="
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        ">
          <div class="nexa-percentage-fill" style="
            width: ${value}%;
            height: 100%;
            background: ${gradientColor};
            transition: width 0.5s ease;
            border-radius: 4px;
          "></div>
        </div>
        ${totalInfo}
      </div>
    `;

    return percentageHTML;
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
          <div class="nexa-percentage-summary" style="
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #2196f3;
          ">
            <h3 style="margin: 0 0 10px 0; color: #1976d2; font-size: 18px;">
              📊 Data Desa - ${packageKey || "Summary"}
            </h3>
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
              <div style="font-size: 14px; color: #333;">
                <strong>Total Desa:</strong> ${totalDesa}
              </div>
              <div style="font-size: 14px; color: #333;">
                <strong>Total Keseluruhan:</strong> ${totalAll}
              </div>
              <div style="font-size: 14px; color: #333;">
                <strong>Rata-rata:</strong> ${avgPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        `;

        // Create wrapper for responsive 2-column layout
        percentageHTML += `
          <div class="nexa-percentage-grid" style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 20px;
          ">
          <style>
            .nexa-percentage-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 20px;
            }
            
            .nexa-percentage-container {
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            
            .nexa-percentage-container:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            @media (max-width: 768px) {
              .nexa-percentage-grid {
                grid-template-columns: 1fr !important;
                gap: 10px !important;
              }
            }
            @media (max-width: 480px) {
              .nexa-percentage-grid {
                grid-template-columns: 1fr !important;
                gap: 8px !important;
              }
            }
          </style>
        `;

        // Create multiple percentage elements for each desa with unique colors
        dataform.forEach((desa, index) => {
          const value = desa.percent || 0;
          const label = desa.label || `Desa ${index + 1}`;
          const total = desa.total || 0;
          const color = colorPalette[index] || "#007bff";

          percentageHTML += this.createPercentage(
            value,
            label,
            total,
            color,
            index
          );
        });

        // Close grid wrapper
        percentageHTML += `</div>`;
      } else {
        // Fallback to default behavior
        const value =
          this.getPercentageValueForPackage(packageType, packageData) ||
          options.value ||
          75;
        const label =
          options.label ||
          this.getPercentageLabelForPackage(packageKey, packageType);

        percentageHTML = this.createPercentage(value, label);
      }

      // Insert into target element
      targetElement.insertAdjacentHTML("beforeend", percentageHTML);

      // Add package-specific styling or attributes to all percentage elements
      const percentageElements = targetElement.querySelectorAll(
        ".nexa-percentage-container"
      );

      percentageElements.forEach((element, index) => {
        element.setAttribute("data-package-key", packageKey || "");
        element.setAttribute("data-package-type", packageType);
        element.classList.add(`nexa-percentage-${packageType}`);

        // Add some spacing between multiple elements
        if (dataform && dataform.length > 1) {
          element.style.marginBottom = "15px";
        }
      });

      console.log("✅ Percentage element inserted successfully");

      // Get the first percentage element for return value
      const firstPercentageElement = targetElement.querySelector(
        ".nexa-percentage-container"
      );

      return {
        success: true,
        message: `Percentage element inserted successfully for ${
          packageKey || "default"
        }`,
        element: firstPercentageElement,
        packageInfo: { packageKey, packageType, packageData },
        dataCount: dataform && dataform.length ? dataform.length : 1,
      };
    } catch (error) {
      console.error("❌ Error inserting percentage element:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get percentage value based on package type
   */
  getPercentageValueForPackage(packageType, packageData) {
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
   * Get percentage label based on package
   */
  getPercentageLabelForPackage(packageKey, packageType) {
    const labelMap = {
      petani: `${packageKey} Progress`,
      transaksi: `${packageKey} Completion`,
      project: `${packageKey} Status`,
      default: "Percentage",
    };
    return labelMap[packageType] || labelMap["default"];
  }

  /**
   * Update percentage value
   */
  updatePercentage(percentageElement, newValue) {
    if (!percentageElement) return false;

    const valueDisplay = percentageElement.querySelector(
      ".nexa-percentage-value"
    );
    const fill = percentageElement.querySelector(".nexa-percentage-fill");

    if (valueDisplay && fill) {
      valueDisplay.textContent = `${newValue}%`;
      fill.style.width = `${newValue}%`;
      return true;
    }
    return false;
  }
}

export { Percentage };
