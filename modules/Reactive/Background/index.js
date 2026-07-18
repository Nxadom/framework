// Import SolidColors, GradientBackgrounds, and PatternBackgrounds classes
import { SolidColors } from "./SolidColors.js";
import { GradientBackgrounds } from "./GradientBackgrounds.js";
import { PatternBackgrounds } from "./PatternBackgrounds.js";

class Background {
  constructor(data = null) {
    this.data = data;
    this.nexaUI = NexaUI();
    this.domAnalyzer = new elementsNode(); // Initialize elementsNode instance
    this.formGenerator = new elementsForm(); // Initialize elementsForm instance
    this.currentTargetElement = null; // Store reference to current target element being edited
    this.targetElement = null; // Current target element for context menu actions
    this.selectedText = ""; // Currently selected text
    this.textClipboard = ""; // Text clipboard for paste operations

    // Initialize SolidColors, GradientBackgrounds, and PatternBackgrounds instances
    this.solidColors = new SolidColors(this);
    this.gradientBackgrounds = new GradientBackgrounds(this);
    this.patternBackgrounds = new PatternBackgrounds(this);

    // Setup global functions for modal integration
    this.setupGlobalFunctions();
  }

  struktur() {
    return [
      {
        id: "background-elements",
        icon: "image",
        text: "Background",
        action: "backgroundElements",
        showCondition: "always",
        submenu: [
          // Image Tools

          {
            id: "bg-solid-colors",
            icon: "circle",
            text: "Solid Colors",
            action: "backgroundSolidColors",
            showCondition: "always",
          },
          {
            id: "bg-gradients",
            icon: "trending-up",
            text: "Gradient Backgrounds",
            action: "backgroundGradients",
            showCondition: "always",
          },
          {
            id: "bg-patterns",
            icon: "grid",
            text: "Pattern Backgrounds",
            action: "backgroundPatterns",
            showCondition: "always",
          },
          {
            id: "bg-images",
            icon: "image",
            text: "Image Backgrounds",
            action: "backgroundImages",
            showCondition: "always",
          },
          {
            id: "bg-textures",
            icon: "layers",
            text: "Texture Backgrounds",
            action: "backgroundTextures",
            showCondition: "always",
          },
          {
            id: "bg-effects",
            icon: "sliders",
            text: "Background Effects",
            action: "backgroundEffects",
            showCondition: "always",
          },
          {
            id: "bg-advanced",
            icon: "settings",
            text: "Advanced Options",
            action: "backgroundAdvanced",
            showCondition: "always",
          },
          {
            type: "separator",
            showCondition: "always",
          },
          {
            id: "bg-reset",
            icon: "x-circle",
            text: "Reset Background",
            action: "backgroundReset",
            showCondition: "always",
          },
        ],
      },
    ];
  }

  // ===== BACKGROUND FUNCTIONS =====

  /**
   * Context menu: Apply solid colors
   */
  contextBackgroundSolidColors() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      // Set target element for SolidColors instance and open dialog
      this.solidColors.setTargetElement(this.targetElement);
      return this.solidColors.contextBackgroundSolidColors();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Apply gradient backgrounds
   */
  contextBackgroundGradients() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      // Set target element for GradientBackgrounds instance and open dialog
      this.gradientBackgrounds.setTargetElement(this.targetElement);
      return this.gradientBackgrounds.contextBackgroundGradients();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Apply pattern backgrounds
   */
  contextBackgroundPatterns() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      // Set target element for PatternBackgrounds instance and open dialog
      this.patternBackgrounds.setTargetElement(this.targetElement);
      return this.patternBackgrounds.contextBackgroundPatterns();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Apply image backgrounds
   */
  contextBackgroundImages() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      this.createImageBackgroundDialog();
      return { success: true, message: "Image background dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Apply texture backgrounds
   */
  contextBackgroundTextures() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      this.createTextureDialog();
      return { success: true, message: "Texture dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Apply background effects
   */
  contextBackgroundEffects() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      this.createEffectsDialog();
      return { success: true, message: "Effects dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Advanced background options
   */
  contextBackgroundAdvanced() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      this.createAdvancedBackgroundDialog();
      return { success: true, message: "Advanced options dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Reset background to default
   */
  contextBackgroundReset() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      // Reset all background properties
      this.targetElement.style.background = "";
      this.targetElement.style.backgroundColor = "";
      this.targetElement.style.backgroundImage = "";
      this.targetElement.style.backgroundSize = "";
      this.targetElement.style.backgroundPosition = "";
      this.targetElement.style.backgroundRepeat = "";
      this.targetElement.style.backgroundAttachment = "";
      this.targetElement.style.filter = "";
      this.targetElement.style.opacity = "";

      return { success: true, message: "Background reset" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ===== HELPER FUNCTIONS =====

  /**
   * Setup global functions for modal integration
   */
  setupGlobalFunctions() {
    // Make functions globally available for modal callbacks
    if (typeof window !== "undefined") {
      window.backgroundInstance = this;
    }
  }

  /**
   * Close modal dialog
   */
  closeModal(modalId) {
    this.nexaUI.nexaModal.close(modalId);
  }

  /**
   * Open modal dialog
   */
  openModal(modalId) {
    this.nexaUI.nexaModal.open(modalId);
  }

  // ===== DIALOG CREATION METHODS =====

  /**
   * Create image background dialog
   */
  createImageBackgroundDialog() {
    const content = `
      <div class="nx-row">
        <div class="nx-col-8">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="backgroundImageUrl">Image URL</label></dt>
              <dd class="form-group-body">
                <input type="url" id="backgroundImageUrl" placeholder="https://example.com/image.jpg" class="form-control input-block">
              </dd>
            </dl>
          </div>
        </div>

        <div class="nx-col-4">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="backgroundSize">Background Size</label></dt>
              <dd class="form-group-body">
                <select id="backgroundSize" class="form-select">
                  <option value="cover">Cover (Fill entire area)</option>
                  <option value="contain">Contain (Fit within area)</option>
                  <option value="auto">Auto (Original size)</option>
                  <option value="100% 100%">Stretch (Fill exactly)</option>
                </select>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Preview</label>
        <div id="backgroundPreview" style="width: 100%; height: 120px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; color: #666;">
          Enter URL to preview
        </div>
      </div>
    `;

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "nexa-background-image-dialog",
      styleClass: "w-600px",
      label: `🖼️ Background Image`,
      onclick: {
        title: "Apply",
        cancel: "Cancel",
        send: "applyBackgroundImage",
      },
      content: content,
    });

    // Open the modal
    this.openModal("nexa-background-image-dialog");

    // Setup event handling after modal is created
    setTimeout(() => {
      this.setupBackgroundImageDialogEvents();
    }, 100);
  }

  /**
   * Setup background image dialog events
   */
  setupBackgroundImageDialogEvents() {
    const modal = document.getElementById("nexa-background-image-dialog");
    if (!modal) return;

    const urlInput = modal.querySelector("#backgroundImageUrl");
    const sizeSelect = modal.querySelector("#backgroundSize");
    const preview = modal.querySelector("#backgroundPreview");
    const applyBtn = modal.querySelector("#applyBackgroundImage");

    const updatePreview = () => {
      if (!preview || !urlInput || !sizeSelect) return;

      const url = urlInput.value.trim();
      const size = sizeSelect.value;

      if (url) {
        preview.style.backgroundImage = `url("${url}")`;
        preview.style.backgroundSize = size;
        preview.style.backgroundPosition = "center";
        preview.style.backgroundRepeat = "no-repeat";
        preview.textContent = "";
      } else {
        preview.style.backgroundImage = "";
        preview.textContent = "Enter URL to preview";
      }
    };

    // Events
    if (urlInput) urlInput.addEventListener("input", updatePreview);
    if (sizeSelect) sizeSelect.addEventListener("change", updatePreview);

    // Apply background image function
    window.applyBackgroundImage = (modalId) => {
      const url = urlInput?.value.trim();
      const size = sizeSelect?.value || "cover";

      if (this.targetElement && url) {
        this.targetElement.style.backgroundImage = `url("${url}")`;
        this.targetElement.style.backgroundSize = size;
        this.targetElement.style.backgroundPosition = "center";
        this.targetElement.style.backgroundRepeat = "no-repeat";
      }

      this.nexaUI.nexaModal.close(modalId);
    };

    // Apply button event (fallback)
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        window.applyBackgroundImage("nexa-background-image-dialog");
      });
    }
  }

  /**
   * Create texture background dialog
   */
  createTextureDialog() {
    // Simple texture implementation
    const textures = [
      'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4"><rect width="4" height="4" fill="%23f8f9fa"/><path d="M0,0L2,2L0,4M2,0L4,2L2,4" stroke="%23dee2e6" stroke-width="0.5" fill="none"/></svg>\')',
    ];

    if (this.targetElement) {
      this.targetElement.style.backgroundImage = textures[0];
      this.targetElement.style.backgroundSize = "20px 20px";
    }
  }

  /**
   * Create background effects dialog
   */
  createEffectsDialog() {
    // Simple effects implementation
    const effect = prompt("Enter blur amount (0-10):", "0");
    if (effect !== null && this.targetElement) {
      this.targetElement.style.filter = `blur(${effect}px)`;
    }
  }

  /**
   * Create advanced background options dialog
   */
  createAdvancedBackgroundDialog() {
    // Simple advanced options
    const size = prompt("Background size (cover, contain, auto):", "cover");
    if (size && this.targetElement) {
      this.targetElement.style.backgroundSize = size;
    }
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Background;
} else if (typeof window !== "undefined") {
  window.Background = Background;
  // Also make all background classes available globally if needed
  window.SolidColors = SolidColors;
  window.GradientBackgrounds = GradientBackgrounds;
  window.PatternBackgrounds = PatternBackgrounds;
}
export { Background };
