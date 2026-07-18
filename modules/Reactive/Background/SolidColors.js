class SolidColors {
  constructor(backgroundInstance) {
    this.background = backgroundInstance;
    this.nexaUI = backgroundInstance.nexaUI;
    this.targetElement = null;

    // Setup global functions for modal integration
    this.setupGlobalFunctions();
  }

  /**
   * Set target element for solid color operations
   */
  setTargetElement(element) {
    this.targetElement = element;
  }

  /**
   * Context menu: Apply solid colors
   */
  contextBackgroundSolidColors() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      this.createSolidColorDialog();
      return { success: true, message: "Solid color dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup global functions for modal integration
   */
  setupGlobalFunctions() {
    // Make functions globally available for modal callbacks
    if (typeof window !== "undefined") {
      window.solidColorsInstance = this;

      // Solid color dialog functions
      window.selectColor = (color) => {
        const colorPicker = document.getElementById("color-picker");
        const colorHex = document.getElementById("color-hex");
        if (colorPicker) colorPicker.value = color;
        if (colorHex) colorHex.value = color.toUpperCase();
        this.updateColorPreview();
      };

      window.updateOpacity = () => {
        const opacitySlider = document.getElementById("opacity-slider");
        const opacityValue = document.getElementById("opacity-value");
        if (opacitySlider && opacityValue) {
          opacityValue.textContent = opacitySlider.value + "%";
          this.updateColorPreview();
        }
      };

      window.applySolidColor = (modalId) => {
        const colorPicker = document.getElementById("color-picker");
        const opacitySlider = document.getElementById("opacity-slider");
        if (colorPicker && opacitySlider) {
          const color = colorPicker.value;
          const opacity = opacitySlider.value / 100;
          this.applyBackgroundColor(color, opacity);
          this.nexaUI.nexaModal.close(modalId);
        }
      };
    }
  }

  /**
   * Create solid color picker dialog
   */
  createSolidColorDialog() {
    const popularColors = [
      "#ffffff",
      "#f8f9fa",
      "#e9ecef",
      "#dee2e6",
      "#ced4da",
      "#adb5bd",
      "#6c757d",
      "#495057",
      "#343a40",
      "#212529",
      "#000000",
      "#dc3545",
      "#fd7e14",
      "#ffc107",
      "#28a745",
      "#20c997",
      "#17a2b8",
      "#007bff",
      "#6f42c1",
      "#e83e8c",
      "#f8d7da",
      "#d4edda",
      "#d1ecf1",
    ];

    const content = `
      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label for="color-hex">Color Picker</label></dt>
          <dd class="form-group-body">
            <div class="input-group">
              <input type="color" id="color-picker" class="form-control" value="#4f46e5" style="width: 56px; padding: 4px; flex: 0 0 auto;">
              <input type="text" id="color-hex" class="form-control" value="#4F46E5" placeholder="#4F46E5" style="font-family: monospace;">
            </div>
          </dd>
        </dl>
      </div>

      <div class="form-group">
        <label>Popular Colors</label>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(40px, 1fr)); gap: 8px;">
          ${popularColors
            .map(
              (color) =>
                `<button onclick="selectColor('${color}')" style="width: 40px; height: 40px; background: ${color}; border: 2px solid ${
                  color === "#ffffff" ? "#ddd" : "transparent"
                }; border-radius: 6px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            </button>`
            )
            .join("")}
        </div>
      </div>

      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label for="opacity-slider">Opacity <span id="opacity-value">100%</span></label></dt>
          <dd class="form-group-body">
            <input type="range" id="opacity-slider" class="form-control" min="0" max="100" value="100" oninput="updateOpacity()">
          </dd>
        </dl>
      </div>

      <div class="form-group">
        <label>Preview</label>
        <div id="color-preview" style="width: 100%; height: 100px; background: #4f46e5; border-radius: 8px; border: 2px solid #e0e0e0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
          Preview Text
        </div>
      </div>
    `;

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "nexa-solid-color-dialog",
      styleClass: "w-600px",
      label: `🎨 Solid Colors`,
      onclick: {
        title: "Apply",
        cancel: "Cancel",
        send: "applySolidColor",
      },
      content: content,
    });

    // Open the modal
    this.openModal("nexa-solid-color-dialog");

    // Setup event handling after modal is created
    setTimeout(() => {
      this.setupSolidColorDialogEvents();
    }, 100);
  }

  /**
   * Update color preview
   */
  updateColorPreview() {
    const colorPicker = document.getElementById("color-picker");
    const opacitySlider = document.getElementById("opacity-slider");
    const preview = document.getElementById("color-preview");

    if (!colorPicker || !opacitySlider || !preview) return;

    const color = colorPicker.value;
    const opacity = opacitySlider.value / 100;

    // Use the proper color conversion function
    const rgba = this.hexToRgba(color, opacity);
    preview.style.background = rgba;
  }

  /**
   * Apply background color to target element
   */
  applyBackgroundColor(color, opacity = 1) {
    if (this.targetElement && color) {
      if (opacity < 1) {
        // Convert hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        this.targetElement.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      } else {
        this.targetElement.style.backgroundColor = color;
      }
    }
  }

  /**
   * Open modal dialog
   */
  openModal(modalId) {
    this.nexaUI.nexaModal.open(modalId);
  }

  /**
   * Close modal dialog
   */
  closeModal(modalId) {
    this.nexaUI.nexaModal.close(modalId);
  }

  /**
   * Setup events for solid color dialog
   */
  setupSolidColorDialogEvents() {
    const modal = document.getElementById("nexa-solid-color-dialog");
    if (!modal) return;

    // Get all UI elements
    const colorPicker = modal.querySelector("#color-picker");
    const colorHex = modal.querySelector("#color-hex");
    const opacitySlider = modal.querySelector("#opacity-slider");
    const opacityValue = modal.querySelector("#opacity-value");
    const colorPreview = modal.querySelector("#color-preview");
    const colorPresets = modal.querySelectorAll(".color-preset");
    const applyBtn = modal.querySelector("#apply-color");

    // State variables
    let currentColor = "#4f46e5";
    let currentOpacity = 100;

    // Update all preview elements and information
    const updatePreview = () => {
      const rgba = this.hexToRgba(currentColor, currentOpacity / 100);
      const rgb = this.hexToRgb(currentColor);
      const hsl = this.hexToHsl(currentColor);

      // Update background preview
      if (colorPreview) colorPreview.style.background = rgba;

      // Update color information if elements exist
      const infoHex = modal.querySelector("#info-hex");
      const infoRgb = modal.querySelector("#info-rgb");
      const infoRgba = modal.querySelector("#info-rgba");
      const infoHsl = modal.querySelector("#info-hsl");

      if (infoHex) infoHex.textContent = currentColor.toUpperCase();
      if (infoRgb) infoRgb.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      if (infoRgba)
        infoRgba.textContent = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(
          currentOpacity / 100
        ).toFixed(2)})`;
      if (infoHsl) infoHsl.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    };

    // Color picker events
    if (colorPicker) {
      colorPicker.addEventListener("input", (e) => {
        currentColor = e.target.value;
        if (colorHex) colorHex.value = currentColor.toUpperCase();
        updatePreview();
      });
    }

    // Hex input events
    if (colorHex) {
      colorHex.addEventListener("input", (e) => {
        let hex = e.target.value.trim();

        // Auto-add # if missing
        if (hex && !hex.startsWith("#")) {
          hex = "#" + hex;
          e.target.value = hex;
        }

        if (this.isValidHexColor(hex)) {
          currentColor = hex;
          if (colorPicker) colorPicker.value = hex;
          updatePreview();
        }
      });

      // Format hex input on blur
      colorHex.addEventListener("blur", (e) => {
        e.target.value = e.target.value.toUpperCase();
      });
    }

    // Opacity slider events
    if (opacitySlider) {
      opacitySlider.addEventListener("input", (e) => {
        currentOpacity = parseInt(e.target.value);
        if (opacityValue) opacityValue.textContent = currentOpacity + "%";
        updatePreview();
      });
    }

    // Color preset events
    colorPresets.forEach((preset) => {
      preset.addEventListener("click", () => {
        currentColor = preset.dataset.color;
        if (colorPicker) colorPicker.value = currentColor;
        if (colorHex) colorHex.value = currentColor.toUpperCase();
        updatePreview();

        // Visual feedback
        colorPresets.forEach((p) => {
          p.style.transform = "scale(1)";
          p.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        });
        preset.style.transform = "scale(1.1)";
        preset.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
      });
    });

    // Apply color
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        const rgba = this.hexToRgba(currentColor, currentOpacity / 100);

        if (this.targetElement) {
          this.targetElement.style.backgroundColor = rgba;

          // Store color information as data attributes for future reference
          this.targetElement.dataset.nexaColor = currentColor;
          this.targetElement.dataset.nexaOpacity = currentOpacity;
        }

        this.closeModal("nexa-solid-color-dialog");
      });
    }

    // Initialize with proper values
    if (colorHex) colorHex.value = currentColor.toUpperCase();
    updatePreview();

    // Add keyboard shortcuts
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target !== colorHex) {
        e.preventDefault();
        if (applyBtn) applyBtn.click();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.closeModal("nexa-solid-color-dialog");
      }
    });
  }

  // ===== COLOR UTILITY FUNCTIONS =====

  /**
   * Convert hex to rgba
   */
  hexToRgba(hex, alpha = 1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Convert hex to rgb object
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { r: 0, g: 0, b: 0 };

    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }

  /**
   * Convert hex to hsl object
   */
  hexToHsl(hex) {
    const rgb = this.hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const diff = max - min;
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

      switch (max) {
        case r:
          h = (g - b) / diff + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  /**
   * Validate hex color
   */
  isValidHexColor(color) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(color);
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = SolidColors;
} else if (typeof window !== "undefined") {
  window.SolidColors = SolidColors;
}
export { SolidColors };
