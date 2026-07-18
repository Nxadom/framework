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

      this.createSolidColorDialog();
      return { success: true, message: "Solid color dialog opened" };
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

      this.createGradientDialog();
      return { success: true, message: "Gradient dialog opened" };
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

      this.createPatternDialog();
      return { success: true, message: "Pattern dialog opened" };
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
      window.closeModal = this.closeModal.bind(this);
      window.openModal = this.openModal.bind(this);
      window.applyBackgroundColor = this.applyBackgroundColor.bind(this);
      window.applyBackgroundGradient = this.applyBackgroundGradient.bind(this);

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
          opacityValue.textContent = opacitySlider.value;
          this.updateColorPreview();
        }
      };

      window.applySolidColor = () => {
        const colorPicker = document.getElementById("color-picker");
        const opacitySlider = document.getElementById("opacity-slider");
        if (colorPicker && opacitySlider) {
          const color = colorPicker.value;
          const opacity = opacitySlider.value / 100;
          this.applyBackgroundColor(color, opacity);
          this.closeModal("nexa-solid-color-dialog");
        }
      };
    }
  }

  /**
   * Close modal dialog
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
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
   * Apply background gradient to target element
   */
  applyBackgroundGradient(gradientCSS) {
    if (this.targetElement && gradientCSS) {
      this.targetElement.style.background = gradientCSS;
    }
  }

  /**
   * Inject modal control functions into the page
   */
  injectModalControlFunctions() {
    if (typeof window !== "undefined") {
      // Ensure global functions are available
      this.setupGlobalFunctions();
    }
  }

  // ===== DIALOG CREATION METHODS =====

  /**
   * Create solid color picker dialog
   */
  createSolidColorDialog() {
    const existingDialog = document.getElementById("nexa-solid-color-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

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

    const modalHTML = `
      <div class="nx-modal" id="nexa-solid-color-dialog" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; justify-content: center; align-items: center;">
        <div class="nx-modal-dialog" style="background: white; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
          <div class="nx-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h5 style="margin: 0; font-size: 18px; font-weight: 600;">🎨 Solid Colors</h5>
            <button onclick="closeModal('nexa-solid-color-dialog')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
          </div>
          <div class="nx-modal-body">
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Color Picker</label>
              <div style="display: flex; gap: 12px; align-items: center;">
                <input type="color" id="color-picker" value="#4f46e5" style="width: 50px; height: 50px; border: none; border-radius: 8px; cursor: pointer;">
                <input type="text" id="color-hex" value="#4F46E5" placeholder="#4F46E5" style="flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-family: monospace;">
              </div>
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Popular Colors</label>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(40px, 1fr)); gap: 8px;">
                ${popularColors
                  .map(
                    (color) => `
                  <button onclick="selectColor('${color}')" 
                          style="width: 40px; height: 40px; border-radius: 6px; border: 2px solid ${
                            color === "#ffffff" ? "#ddd" : "transparent"
                          }; background: ${color}; cursor: pointer; transition: transform 0.2s;"
                          onmouseover="this.style.transform='scale(1.1)'" 
                          onmouseout="this.style.transform='scale(1)'">
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Opacity: <span id="opacity-value">100</span>%</label>
              <input type="range" id="opacity-slider" min="0" max="100" value="100" style="width: 100%;" oninput="updateOpacity()">
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Preview</label>
              <div id="color-preview" style="width: 100%; height: 100px; border-radius: 8px; border: 2px solid #e0e0e0; background: #4f46e5; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                Preview Text
              </div>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button onclick="closeModal('nexa-solid-color-dialog')" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">Cancel</button>
              <button onclick="applySolidColor()" style="padding: 10px 20px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer;">Apply</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Open the modal
    setTimeout(() => {
      this.openModal("nexa-solid-color-dialog");
    }, 100);

    // Call the complete setup method for event handling
    this.setupSolidColorDialogEvents();
  }

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

  createGradientDialog() {
    const existingDialog = document.getElementById("nexa-gradient-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

    const modalHTML = `
      <div class="nx-modal" id="nexa-gradient-dialog" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; justify-content: center; align-items: center;">
        <div class="nx-modal-dialog" style="background: white; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
          <div class="nx-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h5 style="margin: 0; font-size: 18px; font-weight: 600;">🌈 Gradient Backgrounds</h5>
            <button onclick="closeModal('nexa-gradient-dialog')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
          </div>
          <div class="nx-modal-body">
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Gradient Type</label>
              <select id="gradient-type" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;" onchange="updateGradientPreview()">
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Direction</label>
              <select id="gradient-direction" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;" onchange="updateGradientPreview()">
                <option value="to right">Left to Right</option>
                <option value="to left">Right to Left</option>
                <option value="to bottom">Top to Bottom</option>
                <option value="to top">Bottom to Top</option>
                <option value="45deg">Diagonal ↗</option>
                <option value="135deg">Diagonal ↘</option>
              </select>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Colors</label>
              <div style="display: flex; gap: 12px;">
                <div style="flex: 1;">
                  <label style="display: block; font-size: 12px; margin-bottom: 4px;">Start Color</label>
                  <input type="color" id="start-color" value="#4f46e5" style="width: 100%; height: 40px; border: none; border-radius: 6px;" onchange="updateGradientPreview()">
                </div>
                <div style="flex: 1;">
                  <label style="display: block; font-size: 12px; margin-bottom: 4px;">End Color</label>
                  <input type="color" id="end-color" value="#06b6d4" style="width: 100%; height: 40px; border: none; border-radius: 6px;" onchange="updateGradientPreview()">
                </div>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Preview</label>
              <div id="gradient-preview" style="width: 100%; height: 120px; border-radius: 8px; border: 2px solid #e0e0e0; background: linear-gradient(to right, #4f46e5, #06b6d4); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 16px;">
                Gradient Preview
              </div>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button onclick="closeModal('nexa-gradient-dialog')" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">Cancel</button>
              <button onclick="applyGradient()" style="padding: 10px 20px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer;">Apply</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    window.updateGradientPreview = () => {
      const type = document.getElementById("gradient-type").value;
      const direction = document.getElementById("gradient-direction").value;
      const startColor = document.getElementById("start-color").value;
      const endColor = document.getElementById("end-color").value;
      const preview = document.getElementById("gradient-preview");

      let gradient;
      if (type === "linear") {
        gradient = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
      } else {
        gradient = `radial-gradient(circle, ${startColor}, ${endColor})`;
      }

      if (preview) {
        preview.style.background = gradient;
      }
    };

    window.applyGradient = () => {
      const type = document.getElementById("gradient-type").value;
      const direction = document.getElementById("gradient-direction").value;
      const startColor = document.getElementById("start-color").value;
      const endColor = document.getElementById("end-color").value;

      let gradient;
      if (type === "linear") {
        gradient = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
      } else {
        gradient = `radial-gradient(circle, ${startColor}, ${endColor})`;
      }

      this.applyBackgroundGradient(gradient);
      this.closeModal("nexa-gradient-dialog");
    };

    // Open the modal
    setTimeout(() => {
      this.openModal("nexa-gradient-dialog");
    }, 100);

    window.updateGradientPreview();
  }

  // ===== PATTERN DIALOG - COMPLETE IMPLEMENTATION FROM NexaInteract.js =====

  /**
   * Create pattern background dialog - COMPLETE VERSION from NexaInteract.js
   */
  createPatternDialog() {
    // Inject modal control functions
    this.injectModalControlFunctions();

    // Remove existing dialog
    const existingDialog = document.getElementById("nexa-pattern-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

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

    const modalHTML = `
      <!-- Modal -->
      <div class="nx-modal" id="nexa-pattern-dialog" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; justify-content: center; align-items: center;">
        <div class="nx-modal-dialog nx-modal-lg" style="background: white; border-radius: 12px; padding: 24px; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
          <div class="nx-modal-content">
            <div class="nx-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h5 style="margin: 0; font-size: 20px; font-weight: 600;">🔳 Pattern Backgrounds</h5>
              <button type="button" onclick="closeModal('nexa-pattern-dialog')" style="background: none; border: none; font-size: 24px; cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 18px;">×</span>
              </button>
            </div>
            <div class="nx-modal-body">
              <div style="margin-bottom: 20px;">
                <label style="font-weight: 600; margin-bottom: 8px; display: block;">Pattern Color</label>
                <input type="color" id="pattern-color" value="#000000" style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer;">
              </div>

              <div style="margin-bottom: 20px;">
                <label style="font-weight: 600; margin-bottom: 8px; display: block;">Pattern Presets</label>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                  ${patterns
                    .map(
                      (pattern, index) => `
                    <div class="pattern-preset" data-pattern='${JSON.stringify(
                      pattern
                    )}' style="
                      height: 80px; 
                      background-image: ${pattern.value}; 
                      background-size: ${pattern.size};
                      border: 2px solid #ddd; 
                      border-radius: 8px; 
                      cursor: pointer;
                      transition: all 0.2s;
                      position: relative;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
                      font-weight: 500;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                      ${pattern.name}
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>

              <div style="margin-bottom: 20px;">
                <label style="font-weight: 600; margin-bottom: 8px; display: block;">Pattern Size</label>
                <div style="display: flex; gap: 1rem;">
                  <div style="flex: 1;">
                    <label style="font-size: 0.9rem; margin-bottom: 4px; display: block; color: #666;">Width (px)</label>
                    <input type="number" id="pattern-width" value="20" min="5" max="100" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                  </div>
                  <div style="flex: 1;">
                    <label style="font-size: 0.9rem; margin-bottom: 4px; display: block; color: #666;">Height (px)</label>
                    <input type="number" id="pattern-height" value="20" min="5" max="100" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                  </div>
                </div>
              </div>

              <div style="margin-bottom: 20px;">
                <label style="font-weight: 600; margin-bottom: 8px; display: block;">Preview</label>
                <div id="pattern-preview" style="
                  width: 100%; 
                  height: 100px; 
                  border: 1px solid #ddd; 
                  border-radius: 8px; 
                  background-image: radial-gradient(circle, #000 1px, transparent 1px);
                  background-size: 20px 20px;
                "></div>
              </div>
            </div>
            <div class="nx-modal-footer" style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee;">
              <button type="button" onclick="closeModal('nexa-pattern-dialog')" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">Cancel</button>
              <button type="button" id="apply-pattern" style="padding: 8px 16px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer;">Apply Pattern</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert modal into the DOM
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Open the modal
    setTimeout(() => {
      this.openModal("nexa-pattern-dialog");
    }, 100);

    this.setupPatternDialogEvents();
  }

  /**
   * Setup events for pattern dialog - COMPLETE VERSION from NexaInteract.js
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

    // Apply pattern
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        const color = colorInput.value;
        const width = widthInput.value;
        const height = heightInput.value;

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

        this.closeModal("nexa-pattern-dialog");
      });
    }

    // Initialize
    updatePreview();
  }

  /**
   * Create image background dialog - COMPLETE VERSION from NexaInteract.js
   */
  createImageBackgroundDialog() {
    // Inject modal control functions
    this.injectModalControlFunctions();

    // Remove existing dialog
    const existingDialog = document.getElementById(
      "nexa-background-image-dialog"
    );
    if (existingDialog) {
      existingDialog.remove();
    }

    // Simple but functional background image dialog
    const modalHTML = `
      <div class="nx-modal" id="nexa-background-image-dialog" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; justify-content: center; align-items: center;">
        <div class="nx-modal-dialog" style="background: white; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
          <div class="nx-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 20px; font-weight: 600;">🖼️ Background Image</h3>
            <button onclick="closeModal('nexa-background-image-dialog')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
          </div>
          <div class="nx-modal-body">
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Image URL:</label>
              <input type="url" id="backgroundImageUrl" placeholder="https://example.com/image.jpg" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Background Size:</label>
              <select id="backgroundSize" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                <option value="cover">Cover (Fill entire area)</option>
                <option value="contain">Contain (Fit within area)</option>
                <option value="auto">Auto (Original size)</option>
                <option value="100% 100%">Stretch (Fill exactly)</option>
              </select>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px;">Preview:</label>
              <div id="backgroundPreview" style="width: 100%; height: 120px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; color: #666;">
                Enter URL to preview
              </div>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <button onclick="closeModal('nexa-background-image-dialog')" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">Cancel</button>
              <button id="applyBackgroundImage" style="padding: 8px 16px; border: none; background: #007bff; color: white; border-radius: 6px; cursor: pointer;">Apply</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Open the modal
    setTimeout(() => {
      this.openModal("nexa-background-image-dialog");
    }, 100);

    this.setupBackgroundImageDialogEvents();
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

    // Apply
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        const url = urlInput.value.trim();
        const size = sizeSelect.value;

        if (this.targetElement && url) {
          this.targetElement.style.backgroundImage = `url("${url}")`;
          this.targetElement.style.backgroundSize = size;
          this.targetElement.style.backgroundPosition = "center";
          this.targetElement.style.backgroundRepeat = "no-repeat";
        }

        this.closeModal("nexa-background-image-dialog");
      });
    }
  }

  /**
   * Create texture background dialog - ASLI dari NexaInteract.js
   */
  createTextureDialog() {
    // Simple texture implementation - ORIGINAL dari NexaInteract.js
    const textures = [
      'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4" viewBox="0 0 4 4"><rect width="4" height="4" fill="%23f8f9fa"/><path d="M0,0L2,2L0,4M2,0L4,2L2,4" stroke="%23dee2e6" stroke-width="0.5" fill="none"/></svg>\')',
    ];

    if (this.targetElement) {
      this.targetElement.style.backgroundImage = textures[0];
      this.targetElement.style.backgroundSize = "20px 20px";
    }
  }

  /**
   * Create background effects dialog - ASLI dari NexaInteract.js
   */
  createEffectsDialog() {
    // Simple effects implementation - ORIGINAL dari NexaInteract.js
    const effect = prompt("Enter blur amount (0-10):", "0");
    if (effect !== null && this.targetElement) {
      this.targetElement.style.filter = `blur(${effect}px)`;
    }
  }

  /**
   * Create advanced background options dialog - ASLI dari NexaInteract.js
   */
  createAdvancedBackgroundDialog() {
    // Simple advanced options - ORIGINAL dari NexaInteract.js
    const size = prompt("Background size (cover, contain, auto):", "cover");
    if (size && this.targetElement) {
      this.targetElement.style.backgroundSize = size;
    }
  }

  // ===== COMPLETE COLOR UTILITY FUNCTIONS from NexaInteract.js =====

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

  /**
   * Setup events for solid color dialog - COMPLETE VERSION from NexaInteract.js
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
        if (opacityValue) opacityValue.textContent = currentOpacity;
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

  // ===== MODAL CONTROLS =====

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "flex";
      modal.classList.add("show");
      document.body.style.overflow = "hidden"; // Prevent body scroll
    }
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Background;
} else if (typeof window !== "undefined") {
  window.Background = Background;
}
export { Background };
