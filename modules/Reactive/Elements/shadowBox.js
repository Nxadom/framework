/**
 * ShadowBox - Box Shadow Management Class
 * Similar to BorderRadius.js for better modularity
 *
 * This class handles all box shadow related functionality including:
 * - Shadow box modal creation and configuration
 * - Form generation for shadow settings
 * - Processing shadow changes
 * - Multiple shadow support
 * - Shadow presets and custom configurations
 */

class ShadowBox {
  constructor(elementsInstance) {
    this.elements = elementsInstance; // Reference to main Elements instance
    this.nexaUI = elementsInstance.nexaUI;

    // Store reference to this instance globally for modal callbacks
    if (typeof window !== "undefined") {
      if (!window.elementsInstance) window.elementsInstance = {};
      window.elementsInstance.shadowBox = this;
    }
  }

  /**
   * Main shadow box action handler
   */
  elementsShadowBox(data = null) {
    console.log("🌟 Elements Shadow Box action triggered");
    console.log("🎯 Target Element:", data?.targetElement);

    if (!data?.targetElement) {
      console.warn("No target element provided for shadow box");
      return;
    }

    // Store reference to current target element
    this.elements.currentTargetElement = data.targetElement;

    // Get current box shadow values
    const computedStyle = getComputedStyle(data.targetElement);
    const currentBoxShadow = {
      current:
        data.targetElement.style.boxShadow || computedStyle.boxShadow || "none",
      shadows: this.parseBoxShadow(
        data.targetElement.style.boxShadow || computedStyle.boxShadow || "none"
      ),
    };

    console.log("🌟 Current box shadow values:", currentBoxShadow);

    // Create modal for shadow configuration
    this.elements.initModals({
      elementById: "elementsShadowBoxModal",
      styleClass: "w-700px shadow-box-modal",
      label: "Box Shadow Settings",
      onclick: {
        title: "Apply Shadow",
        cancel: "Cancel",
        send: "processElementsShadowBox",
        titleClass: "nx-btn-primary icon-button",
        cancelClass: "nx-btn-secondary",
      },
      content: this.generateShadowBoxForm(currentBoxShadow),
    });
  }

  /**
   * Parse box-shadow CSS value into individual shadows
   */
  parseBoxShadow(boxShadowValue) {
    if (!boxShadowValue || boxShadowValue === "none") {
      return [
        {
          offsetX: 0,
          offsetY: 0,
          blurRadius: 0,
          spreadRadius: 0,
          color: "#000000",
          inset: false,
        },
      ];
    }

    // Simple parsing - for complex shadows this could be enhanced
    const shadows = [];
    const shadowParts = boxShadowValue.split(",");

    shadowParts.forEach((shadow) => {
      const parts = shadow.trim().split(/\s+/);
      const isInset = parts.includes("inset");
      const colorMatch = shadow.match(
        /(rgb|rgba|hsl|hsla|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/
      );

      shadows.push({
        offsetX: parseInt(parts[isInset ? 1 : 0]) || 0,
        offsetY: parseInt(parts[isInset ? 2 : 1]) || 0,
        blurRadius: parseInt(parts[isInset ? 3 : 2]) || 0,
        spreadRadius: parseInt(parts[isInset ? 4 : 3]) || 0,
        color: colorMatch ? colorMatch[0] : "#000000",
        inset: isInset,
      });
    });

    return shadows.length > 0
      ? shadows
      : [
          {
            offsetX: 0,
            offsetY: 0,
            blurRadius: 0,
            spreadRadius: 0,
            color: "#000000",
            inset: false,
          },
        ];
  }

  /**
   * Generate shadow box form HTML following NexaUI standards
   */
  generateShadowBoxForm(currentValues) {
    const firstShadow = currentValues.shadows[0] || {
      offsetX: 0,
      offsetY: 0,
      blurRadius: 0,
      spreadRadius: 0,
      color: "#000000",
      inset: false,
    };

    return `
      <div>
        <!-- Shadow Presets Section -->
        <div class="shadow-presets">
          <button type="button" class="btn preset-btn" data-preset="none">None</button>
          <button type="button" class="btn preset-btn" data-preset="subtle">Subtle</button>
          <button type="button" class="btn preset-btn" data-preset="medium">Medium</button>
          <button type="button" class="btn preset-btn" data-preset="strong">Strong</button>
          <button type="button" class="btn preset-btn" data-preset="glow">Glow</button>
          <button type="button" class="btn preset-btn" data-preset="inset">Inset</button>
        </div>

        <!-- Custom Shadow Settings -->
        <label class="text-secondary" style="display: flex; align-items: center; margin: 1.5rem 0 1rem;">
          <i class="material-symbols-outlined" style="margin-right: 8px;">tune</i>
          Custom Shadow Settings
        </label>

        <div class="form-checkbox">
          <label><input type="checkbox" id="shadowInset" name="shadowInset" ${
            firstShadow.inset ? "checked" : ""
          } /> Inset Shadow (inner shadow)</label>
        </div>

        <div class="nx-row">
          <div class="nx-col-3">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="offsetX">Horizontal Offset (px) <span class="slider-value">${
                  firstShadow.offsetX
                }px</span></label></dt>
                <dd class="form-group-body">
                  <input type="range"
                         id="offsetX"
                         name="offsetX"
                         class="form-control"
                         min="-50"
                         max="50"
                         value="${firstShadow.offsetX}">
                </dd>
              </dl>
            </div>
          </div>
          <div class="nx-col-3">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="offsetY">Vertical Offset (px) <span class="slider-value">${
                  firstShadow.offsetY
                }px</span></label></dt>
                <dd class="form-group-body">
                  <input type="range"
                         id="offsetY"
                         name="offsetY"
                         class="form-control"
                         min="-50"
                         max="50"
                         value="${firstShadow.offsetY}">
                </dd>
              </dl>
            </div>
          </div>
          <div class="nx-col-3">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="blurRadius">Blur Radius (px) <span class="slider-value">${
                  firstShadow.blurRadius
                }px</span></label></dt>
                <dd class="form-group-body">
                  <input type="range"
                         id="blurRadius"
                         name="blurRadius"
                         class="form-control"
                         min="0"
                         max="100"
                         value="${firstShadow.blurRadius}">
                </dd>
              </dl>
            </div>
          </div>
          <div class="nx-col-3">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="spreadRadius">Spread Radius (px) <span class="slider-value">${
                  firstShadow.spreadRadius
                }px</span></label></dt>
                <dd class="form-group-body">
                  <input type="range"
                         id="spreadRadius"
                         name="spreadRadius"
                         class="form-control"
                         min="-20"
                         max="20"
                         value="${firstShadow.spreadRadius}">
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="nx-row">
          <!-- Shadow Color -->
          <div class="nx-col-6">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="shadowColorText">Shadow Color</label></dt>
                <dd class="form-group-body">
                  <div class="input-group">
                    <input type="color"
                           id="shadowColor"
                           name="shadowColor"
                           class="form-control"
                           value="${firstShadow.color}"
                           style="width: 56px; padding: 4px; flex: 0 0 auto;">
                    <input type="text"
                           id="shadowColorText"
                           name="shadowColorText"
                           class="form-control"
                           value="${firstShadow.color}">
                  </div>
                </dd>
              </dl>
            </div>
          </div>

          <!-- Shadow Opacity -->
          <div class="nx-col-6">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="shadowOpacity">Shadow Opacity (%) <span class="opacity-value">50%</span></label></dt>
                <dd class="form-group-body">
                  <input type="range"
                         id="shadowOpacity"
                         name="shadowOpacity"
                         class="form-control"
                         min="0"
                         max="100"
                         value="50">
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <label class="text-secondary" style="display: flex; align-items: center; margin: 1.5rem 0 1rem;">
          <i class="material-symbols-outlined" style="margin-right: 8px;">preview</i>
          Live Preview
        </label>
        <div class="shadow-preview" id="shadowPreview">
          <div class="preview-box">
            <span>Shadow Preview</span>
          </div>
        </div>
        <small class="text-muted" style="display: block; margin-top: 0.5rem; text-align: center;">
          Real-time preview of shadow effects
        </small>

        <!-- Quick Actions -->
        <label class="text-secondary" style="display: flex; align-items: center; margin: 1.5rem 0 1rem;">
          <i class="material-symbols-outlined" style="margin-right: 8px;">flash_on</i>
          Quick Actions
        </label>
        <div class="quick-actions">
          <button type="button" class="btn action-btn" id="copyShadow">
            <i class="material-symbols-outlined">content_copy</i>
            Copy CSS
          </button>
          <button type="button" class="btn action-btn" id="resetShadow">
            <i class="material-symbols-outlined">refresh</i>
            Reset
          </button>
          <button type="button" class="btn action-btn" id="removeShadow">
            <i class="material-symbols-outlined">clear</i>
            Remove
          </button>
        </div>

        <!-- Tips Section -->
        <div class="nexa-alert nexa-alert-info" style="margin-top: 1.5rem;">
          <i class="material-symbols-outlined">lightbulb</i>
          <div class="nexa-alert-content">
            <strong>Shadow Tips:</strong>
            <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
              <li>Positive X/Y values move shadow right/down, negative values move left/up</li>
              <li>Higher blur radius creates softer shadows</li>
              <li>Spread radius makes shadow larger (positive) or smaller (negative)</li>
              <li>Inset shadows appear inside the element</li>
              <li>Use subtle shadows for elegant designs</li>
            </ul>
          </div>
        </div>
      </div>

      <style>
        /* NexaUI Shadow Box Form Styles */
        .shadow-preview {
          text-align: center;
          padding: 3rem;
          background: var(--nexa-bg-secondary, #f8f9fa);
          border-radius: 12px;
          border: 1px solid var(--nexa-border-light, #e1e5e9);
        }

        .preview-box {
          width: 180px;
          height: 120px;
          background: linear-gradient(135deg, #ffffff, #f0f0f0);
          color: #333;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1rem;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #ddd;
          box-shadow: none;
        }

        /* Shadow Presets */
        .shadow-presets {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .preset-btn.active {
          background: var(--nexa-primary, #007bff);
          color: white;
        }

        /* Quick Actions */
        .quick-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .slider-value, .opacity-value {
          display: inline-block;
          background: var(--nexa-primary, #007bff);
          color: white;
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        /* Alert Styles */
        .nexa-alert {
          display: flex;
          align-items: flex-start;
          padding: 1rem;
          border-radius: 8px;
          margin: 0;
        }

        .nexa-alert-info {
          background-color: var(--nexa-info-bg, #e3f2fd);
          border: 1px solid var(--nexa-info-border, #bbdefb);
          color: var(--nexa-info-text, #0d47a1);
        }

        .nexa-alert i {
          margin-right: 0.75rem;
          margin-top: 2px;
          font-size: 1.25rem;
          opacity: 0.8;
        }

        .nexa-alert-content {
          flex: 1;
        }

        .nexa-alert ul {
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .nexa-alert li {
          margin-bottom: 0.25rem;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .shadow-preview {
            background: var(--nexa-bg-dark-secondary, #2d3748);
            border-color: var(--nexa-border-dark, #4a5568);
          }

          .preview-box {
            background: linear-gradient(135deg, #4a5568, #2d3748);
            color: #e2e8f0;
            border-color: #4a5568;
          }

          .nexa-alert-info {
            background-color: var(--nexa-info-bg-dark, #1a202c);
            border-color: var(--nexa-info-border-dark, #2d3748);
            color: var(--nexa-info-text-dark, #90cdf4);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .preview-box {
            width: 160px;
            height: 100px;
            font-size: 0.875rem;
          }

          .shadow-preview {
            padding: 2rem;
          }

          .shadow-presets, .quick-actions {
            justify-content: center;
          }
        }
      </style>

      <script>
        // Initialize NexaUI Shadow Box Form
        setTimeout(() => {
          const offsetXSlider = document.getElementById('offsetX');
          const offsetYSlider = document.getElementById('offsetY');
          const blurRadiusSlider = document.getElementById('blurRadius');
          const spreadRadiusSlider = document.getElementById('spreadRadius');
          const shadowColorPicker = document.getElementById('shadowColor');
          const shadowColorText = document.getElementById('shadowColorText');
          const shadowOpacitySlider = document.getElementById('shadowOpacity');
          const shadowInsetCheck = document.getElementById('shadowInset');
          const previewBox = document.querySelector('.preview-box');

          // Shadow presets
          const presets = {
            none: { offsetX: 0, offsetY: 0, blur: 0, spread: 0, color: '#000000', opacity: 0, inset: false },
            subtle: { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: '#000000', opacity: 10, inset: false },
            medium: { offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: '#000000', opacity: 15, inset: false },
            strong: { offsetX: 0, offsetY: 8, blur: 16, spread: 0, color: '#000000', opacity: 20, inset: false },
            glow: { offsetX: 0, offsetY: 0, blur: 20, spread: 5, color: '#007bff', opacity: 30, inset: false },
            inset: { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: '#000000', opacity: 15, inset: true }
          };

          // Update slider values display
          function updateSliderValues() {
            if (offsetXSlider) {
              const valueSpan = offsetXSlider.parentNode.querySelector('.slider-value');
              if (valueSpan) valueSpan.textContent = offsetXSlider.value + 'px';
            }
            if (offsetYSlider) {
              const valueSpan = offsetYSlider.parentNode.querySelector('.slider-value');
              if (valueSpan) valueSpan.textContent = offsetYSlider.value + 'px';
            }
            if (blurRadiusSlider) {
              const valueSpan = blurRadiusSlider.parentNode.querySelector('.slider-value');
              if (valueSpan) valueSpan.textContent = blurRadiusSlider.value + 'px';
            }
            if (spreadRadiusSlider) {
              const valueSpan = spreadRadiusSlider.parentNode.querySelector('.slider-value');
              if (valueSpan) valueSpan.textContent = spreadRadiusSlider.value + 'px';
            }
            if (shadowOpacitySlider) {
              const valueSpan = document.querySelector('.opacity-value');
              if (valueSpan) valueSpan.textContent = shadowOpacitySlider.value + '%';
            }
          }

          // Update shadow preview
          function updatePreview() {
            if (!previewBox) return;
            
            const offsetX = offsetXSlider ? offsetXSlider.value : 0;
            const offsetY = offsetYSlider ? offsetYSlider.value : 0;
            const blur = blurRadiusSlider ? blurRadiusSlider.value : 0;
            const spread = spreadRadiusSlider ? spreadRadiusSlider.value : 0;
            const color = shadowColorPicker ? shadowColorPicker.value : '#000000';
            const opacity = shadowOpacitySlider ? shadowOpacitySlider.value : 50;
            const inset = shadowInsetCheck ? shadowInsetCheck.checked : false;

            // Convert hex to rgba
            function hexToRgba(hex, alpha) {
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (alpha / 100) + ')';
            }

            const shadowColor = hexToRgba(color, opacity);
            const insetText = inset ? 'inset ' : '';
            const boxShadow = offsetX == 0 && offsetY == 0 && blur == 0 && spread == 0 && opacity == 0 
              ? 'none' 
              : insetText + offsetX + 'px ' + offsetY + 'px ' + blur + 'px ' + spread + 'px ' + shadowColor;

            previewBox.style.boxShadow = boxShadow;
            previewBox.setAttribute('data-shadow-css', boxShadow);
          }

          // Color picker synchronization
          if (shadowColorPicker && shadowColorText) {
            shadowColorPicker.addEventListener('change', () => {
              shadowColorText.value = shadowColorPicker.value;
              updatePreview();
            });

            shadowColorText.addEventListener('input', () => {
              const color = shadowColorText.value;
              if (/^#[0-9A-F]{6}$/i.test(color)) {
                shadowColorPicker.value = color;
                updatePreview();
              }
            });
          }

          // Slider event listeners
          [offsetXSlider, offsetYSlider, blurRadiusSlider, spreadRadiusSlider, shadowOpacitySlider].forEach(slider => {
            if (slider) {
              slider.addEventListener('input', () => {
                updateSliderValues();
                updatePreview();
              });
            }
          });

          // Checkbox event listener
          if (shadowInsetCheck) {
            shadowInsetCheck.addEventListener('change', updatePreview);
          }

          // Preset buttons
          document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const presetName = btn.getAttribute('data-preset');
              const preset = presets[presetName];
              
              if (preset) {
                if (offsetXSlider) offsetXSlider.value = preset.offsetX;
                if (offsetYSlider) offsetYSlider.value = preset.offsetY;
                if (blurRadiusSlider) blurRadiusSlider.value = preset.blur;
                if (spreadRadiusSlider) spreadRadiusSlider.value = preset.spread;
                if (shadowColorPicker) shadowColorPicker.value = preset.color;
                if (shadowColorText) shadowColorText.value = preset.color;
                if (shadowOpacitySlider) shadowOpacitySlider.value = preset.opacity;
                if (shadowInsetCheck) shadowInsetCheck.checked = preset.inset;
                
                // Update active preset
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                updateSliderValues();
                updatePreview();
              }
            });
          });

          // Quick action buttons
          const copyShadowBtn = document.getElementById('copyShadow');
          const resetShadowBtn = document.getElementById('resetShadow');
          const removeShadowBtn = document.getElementById('removeShadow');

          if (copyShadowBtn) {
            copyShadowBtn.addEventListener('click', () => {
              const shadowCSS = previewBox.getAttribute('data-shadow-css') || 'none';
              navigator.clipboard.writeText('box-shadow: ' + shadowCSS + ';').then(() => {
                console.log('✅ Shadow CSS copied to clipboard');
              }).catch(() => {
                console.log('❌ Failed to copy shadow CSS');
              });
            });
          }

          if (resetShadowBtn) {
            resetShadowBtn.addEventListener('click', () => {
              // Reset to none preset
              const nonePreset = presets.none;
              if (offsetXSlider) offsetXSlider.value = nonePreset.offsetX;
              if (offsetYSlider) offsetYSlider.value = nonePreset.offsetY;
              if (blurRadiusSlider) blurRadiusSlider.value = nonePreset.blur;
              if (spreadRadiusSlider) spreadRadiusSlider.value = nonePreset.spread;
              if (shadowColorPicker) shadowColorPicker.value = nonePreset.color;
              if (shadowColorText) shadowColorText.value = nonePreset.color;
              if (shadowOpacitySlider) shadowOpacitySlider.value = nonePreset.opacity;
              if (shadowInsetCheck) shadowInsetCheck.checked = nonePreset.inset;
              
              updateSliderValues();
              updatePreview();
            });
          }

          if (removeShadowBtn) {
            removeShadowBtn.addEventListener('click', () => {
              if (previewBox) {
                previewBox.style.boxShadow = 'none';
                previewBox.setAttribute('data-shadow-css', 'none');
              }
            });
          }

          // Initialize
          updateSliderValues();
          updatePreview();

          // Expose processElementsShadowBox function globally for modal callback
          if (typeof window !== 'undefined') {
            // Get reference to current ShadowBox instance through elements
            const shadowBoxInstance = window.elementsInstance?.shadowBox || this;
            window.processElementsShadowBox = function(modalId, data) {
              if (shadowBoxInstance && typeof shadowBoxInstance.processElementsShadowBox === 'function') {
                shadowBoxInstance.processElementsShadowBox(modalId, data);
              } else {
                console.error('❌ ShadowBox instance not available for processElementsShadowBox');
              }
            };
          }

        }, 300);
      </script>
    `;
  }

  /**
   * Process shadow box changes
   */
  processElementsShadowBox(modalId, data = null) {
    console.log("🌟 Processing Shadow Box Changes:", modalId, data);

    try {
      // Enhanced element validation and recovery
      let targetElement = this.elements.currentTargetElement;

      console.log("🔍 Target Element Debug Info:", {
        currentTargetElement: this.elements.currentTargetElement,
        isConnected: this.elements.currentTargetElement?.isConnected,
        tagName: this.elements.currentTargetElement?.tagName,
        id: this.elements.currentTargetElement?.id,
        className: this.elements.currentTargetElement?.className,
      });

      if (!targetElement || !targetElement.isConnected) {
        console.warn(
          "⚠️ Current target element is not connected, trying to recover..."
        );

        // Try to find the element using various recovery methods
        targetElement = this.elements.findActiveElementInDOM();

        if (!targetElement) {
          console.error(
            "❌ No target element available for shadow box modification"
          );
          // Close modal even if target element not found
          this.closeShadowModal(modalId);
          return;
        } else {
          console.log("✅ Recovered target element:", targetElement.tagName);
          this.elements.currentTargetElement = targetElement;
        }
      }

      // Get form data
      const formData = this.elements.getFormData(modalId);
      console.log("🌟 Shadow box form data extracted:", formData);

      // Build shadow CSS from form data
      const shadowCSS = this.buildShadowCSS(formData);
      console.log("🌟 Built shadow CSS:", shadowCSS);

      // Apply shadow to element
      if (shadowCSS === "none") {
        targetElement.style.boxShadow = "";
        console.log("🌟 Removed box shadow from element");
      } else {
        targetElement.style.boxShadow = shadowCSS;
        console.log("🌟 Applied box shadow to element:", shadowCSS);
      }

      console.log("✅ Shadow box changes applied successfully");
    } catch (error) {
      console.error("❌ Error applying shadow box:", error);
      console.error("❌ Error stack:", error.stack);
    }

    // Always close modal after processing - following NexaUI pattern from modal.html
    this.closeShadowModal(modalId);
  }

  /**
   * Close shadow modal using correct NexaUI pattern
   */
  closeShadowModal(modalId) {
    try {
      // Use the correct modal ID if not provided
      const shadowModalId = modalId || "elementsShadowBoxModal";

      // Method 1: Try using nexaUI instance from elements
      if (this.nexaUI && this.nexaUI.nexaModal) {
        this.nexaUI.nexaModal.close(shadowModalId);
        console.log("✅ Modal closed using nexaUI instance");
      }
      // Method 2: Try using global NexaUI if available
      else if (typeof window !== "undefined" && window.NexaUI) {
        const nexaUI = window.NexaUI();
        if (nexaUI && nexaUI.nexaModal) {
          nexaUI.nexaModal.close(shadowModalId);
          console.log("✅ Modal closed using global NexaUI");
        }
      }
      // Method 3: Try using elements nexaUI reference
      else if (
        this.elements &&
        this.elements.nexaUI &&
        this.elements.nexaUI.nexaModal
      ) {
        this.elements.nexaUI.nexaModal.close(shadowModalId);
        console.log("✅ Modal closed using elements nexaUI instance");
      } else {
        console.warn("⚠️ Could not find nexaUI modal instance to close");
      }

      // Clear reference after operation
      setTimeout(() => {
        this.elements.currentTargetElement = null;
      }, 500);
    } catch (error) {
      console.error("❌ Error closing shadow modal:", error);
    }
  }

  /**
   * Build box-shadow CSS from form data
   */
  buildShadowCSS(formData) {
    const offsetX = formData.offsetX || 0;
    const offsetY = formData.offsetY || 0;
    const blurRadius = formData.blurRadius || 0;
    const spreadRadius = formData.spreadRadius || 0;
    const shadowColor =
      formData.shadowColor || formData.shadowColorText || "#000000";
    const shadowOpacity = formData.shadowOpacity || 50;
    const isInset =
      formData.shadowInset === "on" || formData.shadowInset === true;

    // If all values are zero and opacity is zero, return none
    if (
      offsetX == 0 &&
      offsetY == 0 &&
      blurRadius == 0 &&
      spreadRadius == 0 &&
      shadowOpacity == 0
    ) {
      return "none";
    }

    // Convert hex to rgba
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
    };

    const color = hexToRgba(shadowColor, shadowOpacity);
    const insetText = isInset ? "inset " : "";

    return `${insetText}${offsetX}px ${offsetY}px ${blurRadius}px ${spreadRadius}px ${color}`;
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = ShadowBox;
} else if (typeof window !== "undefined") {
  window.ShadowBox = ShadowBox;
}

export { ShadowBox };
