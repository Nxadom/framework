class PatternBackgrounds {
  constructor(backgroundInstance) {
    this.background = backgroundInstance;
    this.nexaUI = backgroundInstance.nexaUI;
    this.targetElement = null;

    // Setup global functions for modal integration
    this.setupGlobalFunctions();
  }

  /**
   * Set target element for pattern operations
   */
  setTargetElement(element) {
    this.targetElement = element;
  }

  /**
   * Context menu: Apply pattern backgrounds
   */
  contextBackgroundPatterns() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      this.createPatternDialog();
      return { success: true, message: "Pattern dialog opened" };
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
      window.patternBackgroundsInstance = this;

      // Apply pattern function
      window.applyPattern = (modalId) => {
        const colorInput = document.querySelector("#pattern-color");
        const widthInput = document.querySelector("#pattern-width");
        const heightInput = document.querySelector("#pattern-height");

        const color = colorInput?.value || "#000000";
        const width = widthInput?.value || "20";
        const height = heightInput?.value || "20";

        // Get current pattern from instance
        const currentPattern = this.getCurrentPattern();
        let finalPattern = currentPattern.value.replace(/#000/g, color);
        const finalSize = `${width}px ${height}px`;

        if (this.targetElement) {
          this.targetElement.style.backgroundImage = finalPattern;
          this.targetElement.style.backgroundSize = finalSize;

          // Store pattern information as data attributes for future reference
          this.targetElement.dataset.nexaPattern =
            JSON.stringify(currentPattern);
          this.targetElement.dataset.nexaPatternColor = color;
          this.targetElement.dataset.nexaPatternSize = finalSize;
        }

        this.nexaUI.nexaModal.close(modalId);
      };
    }
  }

  /**
   * Create pattern background dialog
   */
  createPatternDialog() {
    // Pattern presets
    const patterns = [
      {
        name: "Dots",
        value: "radial-gradient(circle, #000 1px, transparent 1px)",
        size: "20px 20px",
      },
      {
        name: "Lines",
        value:
          "linear-gradient(45deg, transparent 25%, #000 25%, #000 50%, transparent 50%, transparent 75%, #000 75%)",
        size: "20px 20px",
      },
      {
        name: "Grid",
        value:
          "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
        size: "20px 20px",
      },
      {
        name: "Diagonal Stripes",
        value:
          "linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%)",
        size: "30px 30px",
      },
      {
        name: "Checkerboard",
        value:
          "linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%)",
        size: "20px 20px",
      },
      {
        name: "Polka Dots",
        value: "radial-gradient(circle, #000 2px, transparent 2px)",
        size: "25px 25px",
      },
    ];

    const content = `
      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label for="pattern-color">Pattern Color</label></dt>
          <dd class="form-group-body">
            <input type="color" id="pattern-color" class="form-control input-block" value="#000000">
          </dd>
        </dl>
      </div>

      <div class="form-group">
        <label>Pattern Presets</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          ${patterns
            .map(
              (pattern) => `
            <div class="pattern-preset" data-pattern='${JSON.stringify(
              pattern
            )}' style="height: 80px; background-image: ${
              pattern.value
            }; background-size: ${
              pattern.size
            }; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.7); font-weight: 500;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              ${pattern.name}
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <div class="nx-row">
        <div class="nx-col-6">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="pattern-width">Width (px)</label></dt>
              <dd class="form-group-body">
                <input type="number" id="pattern-width" class="form-control" value="20" min="5" max="100">
              </dd>
            </dl>
          </div>
        </div>
        <div class="nx-col-6">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="pattern-height">Height (px)</label></dt>
              <dd class="form-group-body">
                <input type="number" id="pattern-height" class="form-control" value="20" min="5" max="100">
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Preview</label>
        <div id="pattern-preview" style="width: 100%; height: 100px; border: 1px solid #ddd; border-radius: 8px; background-image: radial-gradient(circle, #000 1px, transparent 1px); background-size: 20px 20px;"></div>
      </div>
    `;

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "nexa-pattern-dialog",
      styleClass: "w-800px",
      label: `🔳 Pattern Backgrounds`,
      onclick: {
        title: "Apply Pattern",
        cancel: "Cancel",
        send: "applyPattern",
      },
      content: content,
    });

    // Store patterns for later use
    this.patterns = patterns;

    // Open the modal
    this.openModal("nexa-pattern-dialog");

    // Setup event handling after modal is created
    setTimeout(() => {
      this.setupPatternDialogEvents();
    }, 100);
  }

  /**
   * Setup events for pattern dialog
   */
  setupPatternDialogEvents() {
    const modal = document.getElementById("nexa-pattern-dialog");
    if (!modal) return;

    const patternPreview = modal.querySelector("#pattern-preview");
    const patternPresets = modal.querySelectorAll(".pattern-preset");
    const colorInput = modal.querySelector("#pattern-color");
    const widthInput = modal.querySelector("#pattern-width");
    const heightInput = modal.querySelector("#pattern-height");
    const applyBtn = modal.querySelector("#apply-pattern");

    let currentPattern = {
      name: "Dots",
      value: "radial-gradient(circle, #000 1px, transparent 1px)",
      size: "20px 20px",
    };

    // Store current pattern in instance for global access
    this.currentPattern = currentPattern;

    const updatePreview = () => {
      if (!patternPreview || !colorInput || !widthInput || !heightInput) return;

      const color = colorInput.value;
      const width = widthInput.value;
      const height = heightInput.value;

      // Update pattern with new color and size
      let updatedPattern = currentPattern.value.replace(/#000/g, color);
      const newSize = `${width}px ${height}px`;

      patternPreview.style.backgroundImage = updatedPattern;
      patternPreview.style.backgroundSize = newSize;
    };

    // Preset events
    patternPresets.forEach((preset) => {
      preset.addEventListener("click", () => {
        currentPattern = JSON.parse(preset.dataset.pattern);
        this.currentPattern = currentPattern; // Update instance variable
        updatePreview();

        // Visual feedback
        patternPresets.forEach((p) => (p.style.borderColor = "#ddd"));
        preset.style.borderColor = "#4f46e5";
      });
    });

    // Color and size events
    if (colorInput) colorInput.addEventListener("input", updatePreview);
    if (widthInput) widthInput.addEventListener("input", updatePreview);
    if (heightInput) heightInput.addEventListener("input", updatePreview);

    // Apply pattern button event (fallback)
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        window.applyPattern("nexa-pattern-dialog");
      });
    }

    // Initialize
    updatePreview();

    // Initialize first pattern as selected
    if (patternPresets.length > 0) {
      patternPresets[0].style.borderColor = "#4f46e5";
    }
  }

  /**
   * Get current pattern (for global function access)
   */
  getCurrentPattern() {
    return (
      this.currentPattern || {
        name: "Dots",
        value: "radial-gradient(circle, #000 1px, transparent 1px)",
        size: "20px 20px",
      }
    );
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
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = PatternBackgrounds;
} else if (typeof window !== "undefined") {
  window.PatternBackgrounds = PatternBackgrounds;
}
export { PatternBackgrounds };
