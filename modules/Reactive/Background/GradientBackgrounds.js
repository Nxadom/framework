class GradientBackgrounds {
  constructor(backgroundInstance) {
    this.background = backgroundInstance;
    this.nexaUI = backgroundInstance.nexaUI;
    this.targetElement = null;

    // Setup global functions for modal integration
    this.setupGlobalFunctions();
  }

  /**
   * Set target element for gradient operations
   */
  setTargetElement(element) {
    this.targetElement = element;
  }

  /**
   * Context menu: Apply gradient backgrounds
   */
  contextBackgroundGradients() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      this.createGradientDialog();
      return { success: true, message: "Gradient dialog opened" };
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
      window.gradientBackgroundsInstance = this;

      // Setup gradient functions
      window.updateGradientPreview = () => {
        const type = document.getElementById("gradient-type")?.value;
        const direction = document.getElementById("gradient-direction")?.value;
        const startColor = document.getElementById("start-color")?.value;
        const endColor = document.getElementById("end-color")?.value;
        const preview = document.getElementById("gradient-preview");

        if (!type || !direction || !startColor || !endColor || !preview) return;

        let gradient;
        if (type === "linear") {
          gradient = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
        } else {
          gradient = `radial-gradient(circle, ${startColor}, ${endColor})`;
        }

        preview.style.background = gradient;
      };

      window.applyGradient = (modalId) => {
        const type = document.getElementById("gradient-type")?.value;
        const direction = document.getElementById("gradient-direction")?.value;
        const startColor = document.getElementById("start-color")?.value;
        const endColor = document.getElementById("end-color")?.value;

        if (!type || !direction || !startColor || !endColor) return;

        let gradient;
        if (type === "linear") {
          gradient = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
        } else {
          gradient = `radial-gradient(circle, ${startColor}, ${endColor})`;
        }

        this.applyBackgroundGradient(gradient);
        this.nexaUI.nexaModal.close(modalId);
      };
    }
  }

  /**
   * Create gradient background dialog
   */
  createGradientDialog() {
    const content = `
      <div class="nx-row">
        <div class="nx-col-6">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="gradient-type">Gradient Type</label></dt>
              <dd class="form-group-body">
                <select id="gradient-type" class="form-select" onchange="updateGradientPreview()">
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
              </dd>
            </dl>
          </div>
        </div>

        <div class="nx-col-6">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="gradient-direction">Direction</label></dt>
              <dd class="form-group-body">
                <select id="gradient-direction" class="form-select" onchange="updateGradientPreview()">
                  <option value="to right">Left to Right</option>
                  <option value="to left">Right to Left</option>
                  <option value="to bottom">Top to Bottom</option>
                  <option value="to top">Bottom to Top</option>
                  <option value="45deg">Diagonal ↗</option>
                  <option value="135deg">Diagonal ↘</option>
                </select>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="nx-row">
        <div class="nx-col-6">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="start-color">Start Color</label></dt>
              <dd class="form-group-body">
                <input type="color" id="start-color" class="form-control input-block" value="#4f46e5" onchange="updateGradientPreview()">
              </dd>
            </dl>
          </div>
        </div>
        <div class="nx-col-6">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="end-color">End Color</label></dt>
              <dd class="form-group-body">
                <input type="color" id="end-color" class="form-control input-block" value="#06b6d4" onchange="updateGradientPreview()">
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Preview</label>
        <div id="gradient-preview" style="width: 100%; height: 120px; background: linear-gradient(to right, #4f46e5, #06b6d4); border-radius: 8px; border: 2px solid #e0e0e0; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 16px;">
          Gradient Preview
        </div>
      </div>
    `;

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "nexa-gradient-dialog",
      styleClass: "w-600px",
      label: `🌈 Gradient Backgrounds`,
      onclick: {
        title: "Apply",
        cancel: "Cancel",
        send: "applyGradient",
      },
      content: content,
    });

    // Open the modal
    this.openModal("nexa-gradient-dialog");

    // Initialize preview after modal is created
    setTimeout(() => {
      window.updateGradientPreview();
    }, 100);
  }

  /**
   * Apply background gradient to target element
   */
  applyBackgroundGradient(gradientCSS) {
    if (this.targetElement && gradientCSS) {
      this.targetElement.style.background = gradientCSS;
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
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = GradientBackgrounds;
} else if (typeof window !== "undefined") {
  window.GradientBackgrounds = GradientBackgrounds;
}
export { GradientBackgrounds };
