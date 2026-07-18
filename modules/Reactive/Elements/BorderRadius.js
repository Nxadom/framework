/**
 * BorderRadius - Border Radius Management Class
 * Extracted from Elements/index.js for better modularity
 *
 * This class handles all border radius related functionality including:
 * - Border radius modal creation and configuration
 * - Form generation for border radius settings
 * - Processing border radius changes
 * - Visual enhancements for border radius visibility
 * - Notification system for border radius operations
 */

class BorderRadius {
  constructor(elementsInstance) {
    this.elements = elementsInstance; // Reference to main Elements instance
    this.nexaUI = elementsInstance.nexaUI;
  }

  /**
   * Main border radius action handler
   */
  elementsBorderRadius(data = null) {
    console.log("🔄 Elements Border Radius action triggered");
    console.log("🎯 Target Element:", data?.targetElement);

    if (!data?.targetElement) {
      console.warn("No target element provided for border radius");
      return;
    }

    // Store reference to current target element
    this.elements.currentTargetElement = data.targetElement;

    // Get current border radius values
    const computedStyle = getComputedStyle(data.targetElement);
    const currentBorderRadius = {
      all: data.targetElement.style.borderRadius || "",
      topLeft:
        data.targetElement.style.borderTopLeftRadius ||
        computedStyle.borderTopLeftRadius ||
        "0px",
      topRight:
        data.targetElement.style.borderTopRightRadius ||
        computedStyle.borderTopRightRadius ||
        "0px",
      bottomLeft:
        data.targetElement.style.borderBottomLeftRadius ||
        computedStyle.borderBottomLeftRadius ||
        "0px",
      bottomRight:
        data.targetElement.style.borderBottomRightRadius ||
        computedStyle.borderBottomRightRadius ||
        "0px",
    };

    console.log("📐 Current border radius values:", currentBorderRadius);

    // Create modal for border radius configuration
    this.elements.initModals({
      elementById: "elementsBorderRadiusModal",
      styleClass: "w-600px border-radius-modal",
      label: "Border Radius Settings",
      onclick: {
        title: "Apply Changes",
        cancel: "Cancel",
        send: "processElementsBorderRadius",
        titleClass: "nx-btn-primary icon-button",
        cancelClass: "nx-btn-secondary",
      },
      content: this.generateBorderRadiusForm(currentBorderRadius),
    });
  }

  /**
   * Generate border radius form HTML following NexaUI standards
   */
  generateBorderRadiusForm(currentValues) {
    return `
      <div>
        <!-- Unified Border Radius Section -->
        <label class="text-secondary" style="display: flex; align-items: center; margin-bottom: 1rem;">
          <i class="material-symbols-outlined" style="margin-right: 8px;">border_all</i>
          Unified Border Radius
        </label>
        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label for="borderRadiusAll">All Corners (e.g., 10px, 50%, 1rem)</label></dt>
            <dd class="form-group-body">
              <input type="text"
                     id="borderRadiusAll"
                     name="borderRadiusAll"
                     class="form-control input-block"
                     value="${currentValues.all}">
              <p class="note">Set the same radius for all corners. Leave empty to use individual values.</p>
            </dd>
          </dl>
        </div>

        <!-- Individual Corner Settings -->
        <label class="text-secondary" style="display: flex; align-items: center; margin: 1.5rem 0 1rem;">
          <i class="material-symbols-outlined" style="margin-right: 8px;">border_style</i>
          Individual Corner Settings
        </label>
        <div class="nx-row">
          <div class="nx-col-3">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="borderTopLeft">Top Left</label></dt>
                <dd class="form-group-body">
                  <input type="text"
                         id="borderTopLeft"
                         name="borderTopLeft"
                         class="form-control"
                         value="${this.extractNumericValue(currentValues.topLeft)}">
                </dd>
              </dl>
            </div>
          </div>
          <div class="nx-col-3">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="borderTopRight">Top Right</label></dt>
                <dd class="form-group-body">
                  <input type="text"
                         id="borderTopRight"
                         name="borderTopRight"
                         class="form-control"
                         value="${this.extractNumericValue(
                           currentValues.topRight
                         )}">
                </dd>
              </dl>
            </div>
          </div>
          <div class="nx-col-3">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="borderBottomLeft">Bottom Left</label></dt>
                <dd class="form-group-body">
                  <input type="text"
                         id="borderBottomLeft"
                         name="borderBottomLeft"
                         class="form-control"
                         value="${this.extractNumericValue(
                           currentValues.bottomLeft
                         )}">
                </dd>
              </dl>
            </div>
          </div>
          <div class="nx-col-3">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="borderBottomRight">Bottom Right</label></dt>
                <dd class="form-group-body">
                  <input type="text"
                         id="borderBottomRight"
                         name="borderBottomRight"
                         class="form-control"
                         value="${this.extractNumericValue(
                           currentValues.bottomRight
                         )}">
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
        <div class="border-radius-preview" id="borderRadiusPreview">
          <div class="preview-box">
            <span>Preview</span>
          </div>
        </div>
        <small class="text-muted" style="display: block; margin-top: 0.5rem; text-align: center;">
          Real-time preview of border radius changes
        </small>

        <!-- Visibility Options Section -->
        <label class="text-secondary" style="display: flex; align-items: center; margin: 1.5rem 0 1rem;">
          <i class="material-symbols-outlined" style="margin-right: 8px;">visibility</i>
          Visibility & Color Options
        </label>

        <div class="nx-row">
          <!-- Background Options -->
          <div class="nx-col-6">
            <div class="form-checkbox">
              <label><input type="checkbox" id="addBackground" name="addBackground" /> Add background color</label>
            </div>
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="backgroundColorText">Background Color</label></dt>
                <dd class="form-group-body">
                  <div class="input-group">
                    <input type="color"
                           id="backgroundColor"
                           name="backgroundColor"
                           class="form-control"
                           value="#007bff"
                           style="width: 56px; padding: 4px; flex: 0 0 auto;">
                    <input type="text"
                           id="backgroundColorText"
                           name="backgroundColorText"
                           class="form-control"
                           value="#007bff">
                  </div>
                </dd>
              </dl>
            </div>
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="backgroundOpacity">Background Opacity (%) <span class="opacity-value">10%</span></label></dt>
                <dd class="form-group-body">
                  <input type="range"
                         id="backgroundOpacity"
                         name="backgroundOpacity"
                         class="form-control"
                         min="0"
                         max="100"
                         value="10">
                </dd>
              </dl>
            </div>
          </div>

          <!-- Border Options -->
          <div class="nx-col-6">
            <div class="form-checkbox">
              <label><input type="checkbox" id="addBorder" name="addBorder" /> Add border</label>
            </div>
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="borderColorText">Border Color</label></dt>
                <dd class="form-group-body">
                  <div class="input-group">
                    <input type="color"
                           id="borderColor"
                           name="borderColor"
                           class="form-control"
                           value="#007bff"
                           style="width: 56px; padding: 4px; flex: 0 0 auto;">
                    <input type="text"
                           id="borderColorText"
                           name="borderColorText"
                           class="form-control"
                           value="#007bff">
                  </div>
                </dd>
              </dl>
            </div>
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="borderWidth">Border Width (px) <span class="width-value">1px</span></label></dt>
                <dd class="form-group-body">
                  <input type="range"
                         id="borderWidth"
                         name="borderWidth"
                         class="form-control"
                         min="1"
                         max="10"
                         value="1">
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <small class="text-muted" style="display: block; margin-top: 1rem;">
          <i class="material-symbols-outlined" style="font-size: 1rem; vertical-align: middle;">info</i>
          Use these options to add custom background and border colors to make border radius visible.
        </small>
      </div>

      <style>
        /* NexaUI Border Radius Form Styles */
        .border-radius-preview {
          text-align: center;
          padding: 2rem;
          background: var(--nexa-bg-secondary, #f8f9fa);
          border-radius: 12px;
          border: 1px solid var(--nexa-border-light, #e1e5e9);
        }

        .opacity-value, .width-value {
          display: inline-block;
          background: var(--nexa-primary, #007bff);
          color: white;
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .preview-box {
          width: 140px;
          height: 100px;
          background: linear-gradient(135deg, var(--nexa-primary, #007bff), var(--nexa-primary-dark, #0056b3));
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: 0px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
        }

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
          .border-radius-preview {
            background: var(--nexa-bg-dark-secondary, #2d3748);
            border-color: var(--nexa-border-dark, #4a5568);
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
            width: 120px;
            height: 80px;
            font-size: 0.8rem;
          }

          .border-radius-preview {
            padding: 1.5rem;
          }
        }
      </style>

      <script>
        // Initialize NexaUI Border Radius Form
        setTimeout(() => {
          const allInput = document.getElementById('borderRadiusAll');
          const topLeftInput = document.getElementById('borderTopLeft');
          const topRightInput = document.getElementById('borderTopRight');
          const bottomLeftInput = document.getElementById('borderBottomLeft');
          const bottomRightInput = document.getElementById('borderBottomRight');
          const previewBox = document.querySelector('.preview-box');

          // Initialize color pickers and sliders
          const backgroundColorPicker = document.getElementById('backgroundColor');
          const backgroundColorText = document.getElementById('backgroundColorText');
          const borderColorPicker = document.getElementById('borderColor');
          const borderColorText = document.getElementById('borderColorText');
          const opacitySlider = document.getElementById('backgroundOpacity');
          const opacityValue = document.querySelector('.opacity-value');
          const widthSlider = document.getElementById('borderWidth');
          const widthValue = document.querySelector('.width-value');

          // Color picker synchronization
          if (backgroundColorPicker && backgroundColorText) {
            backgroundColorPicker.addEventListener('change', () => {
              backgroundColorText.value = backgroundColorPicker.value;
              updateColorPreview();
            });

            backgroundColorText.addEventListener('input', () => {
              const color = backgroundColorText.value;
              if (/^#[0-9A-F]{6}$/i.test(color)) {
                backgroundColorPicker.value = color;
                updateColorPreview();
              }
            });
          }

          if (borderColorPicker && borderColorText) {
            borderColorPicker.addEventListener('change', () => {
              borderColorText.value = borderColorPicker.value;
              updateColorPreview();
            });

            borderColorText.addEventListener('input', () => {
              const color = borderColorText.value;
              if (/^#[0-9A-F]{6}$/i.test(color)) {
                borderColorPicker.value = color;
                updateColorPreview();
              }
            });
          }

          // Slider value updates
          if (opacitySlider && opacityValue) {
            opacitySlider.addEventListener('input', () => {
              opacityValue.textContent = opacitySlider.value + '%';
              updateColorPreview();
            });
          }

          if (widthSlider && widthValue) {
            widthSlider.addEventListener('input', () => {
              widthValue.textContent = widthSlider.value + 'px';
              updateColorPreview();
            });
          }

          // Function to update color preview
          function updateColorPreview() {
            var bgColor = (backgroundColorPicker && backgroundColorPicker.value) || '#007bff';
            var bgOpacity = (opacitySlider && opacitySlider.value) || 10;
            var borderColor = (borderColorPicker && borderColorPicker.value) || '#007bff';
            var borderWidth = (widthSlider && widthSlider.value) || 1;

            // Convert hex to rgba for background
            function hexToRgba(hex, alpha) {
              var r = parseInt(hex.slice(1, 3), 16);
              var g = parseInt(hex.slice(3, 5), 16);
              var b = parseInt(hex.slice(5, 7), 16);
              return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + (alpha / 100) + ')';
            }

            // Update preview box colors if available
            if (previewBox) {
              var currentRadius = previewBox.style.borderRadius || '0px';
              var bgGradient = 'linear-gradient(135deg, ' + hexToRgba(bgColor, bgOpacity) + ', ' + hexToRgba(bgColor, bgOpacity * 0.8) + ')';
              previewBox.style.background = bgGradient;
              previewBox.style.border = borderWidth + 'px solid ' + borderColor;
              previewBox.style.borderRadius = currentRadius; // Maintain current radius
            }
          }

          function updatePreview() {
            var allValue = (allInput && allInput.value && allInput.value.trim()) || '';
            
            if (allValue) {
              // Use unified border radius
              previewBox.style.borderRadius = allValue;
              previewBox.style.setProperty('--preview-radius', allValue);
            } else {
              // Use individual corner values
              var tl = (topLeftInput && topLeftInput.value && topLeftInput.value.trim()) || '0';
              var tr = (topRightInput && topRightInput.value && topRightInput.value.trim()) || '0';
              var bl = (bottomLeftInput && bottomLeftInput.value && bottomLeftInput.value.trim()) || '0';
              var br = (bottomRightInput && bottomRightInput.value && bottomRightInput.value.trim()) || '0';
              
              // Add px unit if only number is provided
              function addUnit(val) {
                if (!val || val === '0') return '0px';
                return /^\d+$/.test(val) ? val + 'px' : val;
              }
              
              var borderRadius = addUnit(tl) + ' ' + addUnit(tr) + ' ' + addUnit(br) + ' ' + addUnit(bl);
              previewBox.style.borderRadius = borderRadius;
              previewBox.style.setProperty('--preview-radius', borderRadius);
            }
          }

          // Update preview on input change (border radius inputs)
          const radiusInputs = [allInput, topLeftInput, topRightInput, bottomLeftInput, bottomRightInput];
          radiusInputs.forEach(input => {
            if (input) {
              input.addEventListener('input', updatePreview);
              input.addEventListener('keyup', updatePreview);
              input.addEventListener('change', updatePreview);
            }
          });

          // Update preview on color/slider changes
          const colorInputs = [backgroundColorPicker, backgroundColorText, borderColorPicker, borderColorText, opacitySlider, widthSlider];
          colorInputs.forEach(input => {
            if (input) {
              input.addEventListener('input', updateColorPreview);
              input.addEventListener('change', updateColorPreview);
            }
          });

          // Clear individual inputs when unified is used
          if (allInput) {
            allInput.addEventListener('input', () => {
              if (allInput.value.trim()) {
                // Clear individual corner inputs when unified is used
                [topLeftInput, topRightInput, bottomLeftInput, bottomRightInput]
                  .forEach(input => {
                    if (input) input.value = '';
                  });
              }
            });
          }

          // Initial preview update
          updatePreview();
          updateColorPreview();

          // Initialize slider value badges
          if (opacityValue && opacitySlider) {
            opacityValue.textContent = opacitySlider.value + '%';
          }
          if (widthValue && widthSlider) {
            widthValue.textContent = widthSlider.value + 'px';
          }

        }, 300);
      </script>
    `;
  }

  /**
   * Extract numeric value from CSS value (e.g., "10px" -> "10")
   */
  extractNumericValue(cssValue) {
    if (!cssValue || cssValue === "0px") return "";
    return cssValue.replace(/px|em|rem|%/, "");
  }

  /**
   * Process border radius changes - Enhanced with better debugging
   */
  processElementsBorderRadius(modalId, data = null) {
    console.log("💾 Processing Border Radius Changes:", modalId, data);

    try {
      // Enhanced element validation and recovery
      let targetElement = this.elements.currentTargetElement;

      // Debug current state
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
            "❌ No target element available for border radius modification"
          );
          // this.elements.showNotification(

          return;
        } else {
          console.log("✅ Recovered target element:", targetElement.tagName);
          this.elements.currentTargetElement = targetElement;
        }
      }

      // Get form data with enhanced debugging
      const formData = this.elements.getFormData(modalId);
      console.log("📝 Border radius form data extracted:", formData);

      // Validate we have some data to apply
      const hasUnifiedData =
        formData.borderRadiusAll && formData.borderRadiusAll.trim();
      const hasIndividualData = [
        "borderTopLeft",
        "borderTopRight",
        "borderBottomLeft",
        "borderBottomRight",
      ].some((key) => formData[key] && formData[key].trim());

      if (!hasUnifiedData && !hasIndividualData) {
        console.warn("⚠️ No border radius data provided");

        return;
      }

      // Debug element before applying changes
      console.log("🎯 Target element before changes:", {
        tagName: targetElement.tagName,
        id: targetElement.id || "(no id)",
        className: targetElement.className || "(no classes)",
        currentBorderRadius: targetElement.style.borderRadius || "(not set)",
        computedBorderRadius: getComputedStyle(targetElement).borderRadius,
      });

      // Apply border radius based on form input
      if (hasUnifiedData) {
        const unifiedRadius = formData.borderRadiusAll.trim();

        // Apply unified border radius
        targetElement.style.borderRadius = unifiedRadius;

        // Clear individual properties to avoid conflicts
        targetElement.style.borderTopLeftRadius = "";
        targetElement.style.borderTopRightRadius = "";
        targetElement.style.borderBottomLeftRadius = "";
        targetElement.style.borderBottomRightRadius = "";

        console.log(`🔄 Applied unified border radius: ${unifiedRadius}`);
      } else if (hasIndividualData) {
        // Clear unified setting first
        targetElement.style.borderRadius = "";

        // Helper function to add units
        const addUnit = (val) => {
          if (!val || val.trim() === "") return "";
          val = val.trim();
          // Add px unit if only number is provided (fixed regex)
          return /^\d+$/.test(val) ? val + "px" : val;
        };

        // Process individual corner values
        const corners = {
          topLeft: addUnit(formData.borderTopLeft),
          topRight: addUnit(formData.borderTopRight),
          bottomLeft: addUnit(formData.borderBottomLeft),
          bottomRight: addUnit(formData.borderBottomRight),
        };

        // Apply individual corner styles
        if (corners.topLeft)
          targetElement.style.borderTopLeftRadius = corners.topLeft;
        if (corners.topRight)
          targetElement.style.borderTopRightRadius = corners.topRight;
        if (corners.bottomLeft)
          targetElement.style.borderBottomLeftRadius = corners.bottomLeft;
        if (corners.bottomRight)
          targetElement.style.borderBottomRightRadius = corners.bottomRight;

        console.log(`🔄 Applied individual border radius:`, corners);
      }

      // Force style update and validate changes
      targetElement.style.display = targetElement.style.display; // Trigger reflow

      // Verify changes were applied
      const appliedStyles = {
        borderRadius: targetElement.style.borderRadius,
        borderTopLeftRadius: targetElement.style.borderTopLeftRadius,
        borderTopRightRadius: targetElement.style.borderTopRightRadius,
        borderBottomLeftRadius: targetElement.style.borderBottomLeftRadius,
        borderBottomRightRadius: targetElement.style.borderBottomRightRadius,
      };

      console.log("✅ Applied styles verification:", appliedStyles);

      // Debug element after applying changes
      console.log("🎯 Target element after changes:", {
        newBorderRadius: targetElement.style.borderRadius || "(not set)",
        newComputedBorderRadius: getComputedStyle(targetElement).borderRadius,
        allStyles: targetElement.style.cssText,
      });

      // Show success notification with details
      const appliedCount = Object.values(appliedStyles).filter(
        (style) => style && style.trim()
      ).length;

      console.log("✅ Border radius changes applied successfully");

      // Check if user might need styling to see border radius
      const userRequestedStyling =
        formData.addBackground === "on" || formData.addBorder === "on";
      const computedStyle = getComputedStyle(targetElement);
      const hasVisibleStyling =
        (computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)" &&
          computedStyle.backgroundColor !== "transparent") ||
        (computedStyle.borderWidth !== "0px" &&
          computedStyle.borderStyle !== "none") ||
        computedStyle.boxShadow !== "none";

      // Make border radius visible by adding background/border if needed
      console.log("🔄 Calling makeBorderRadiusVisible with:", {
        element: targetElement.tagName,
        elementId: targetElement.id || "(no id)",
        formData: formData,
      });
      this.makeBorderRadiusVisible(targetElement, formData);

      // Add visual indicator temporarily
      this.addTemporaryVisualIndicator(targetElement);
    } catch (error) {
      console.error("❌ Error applying border radius:", error);
      console.error("❌ Error stack:", error.stack);
    } finally {
      // Close modal and cleanup
      if (this.nexaUI && this.nexaUI.nexaModal) {
        this.nexaUI.nexaModal.close(modalId);
      }

      // Don't immediately clear currentTargetElement to allow for visual verification
      setTimeout(() => {
        this.elements.currentTargetElement = null;
      }, 2000);
    }
  }

  /**
   * Make border radius visible by adding background/border if needed
   */
  makeBorderRadiusVisible(element, formData = {}) {
    if (!element) return;

    console.log("🎨 makeBorderRadiusVisible called with formData:", formData);

    const computedStyle = getComputedStyle(element);

    // Check if element has visible styling
    const hasBackground =
      computedStyle.backgroundColor !== "rgba(0, 0, 0, 0)" &&
      computedStyle.backgroundColor !== "transparent";
    const hasBorder =
      computedStyle.borderWidth !== "0px" &&
      computedStyle.borderStyle !== "none";
    const hasBoxShadow = computedStyle.boxShadow !== "none";

    console.log("🎨 Element visibility check:", {
      hasBackground,
      hasBorder,
      hasBoxShadow,
      backgroundColor: computedStyle.backgroundColor,
      borderWidth: computedStyle.borderWidth,
      borderStyle: computedStyle.borderStyle,
      formData: {
        addBackground: formData.addBackground,
        addBorder: formData.addBorder,
      },
    });

    // Check if user explicitly requested to add styling via form options
    const userWantsBackground =
      formData.addBackground === "on" || formData.addBackground === true;
    const userWantsBorder =
      formData.addBorder === "on" || formData.addBorder === true;

    // Only add styling if user explicitly requests it
    const shouldAddStyling = userWantsBackground || userWantsBorder;

    if (shouldAddStyling) {
      // Store original styles for potential restoration
      const originalStyles = {
        backgroundColor: element.style.backgroundColor,
        border: element.style.border,
        padding: element.style.padding,
        minHeight: element.style.minHeight,
      };

      let addedStyles = [];

      // Get user-selected colors and settings
      console.log("🎨 Color form data received:", {
        backgroundColor: formData.backgroundColor,
        backgroundColorText: formData.backgroundColorText,
        backgroundOpacity: formData.backgroundOpacity,
        borderColor: formData.borderColor,
        borderColorText: formData.borderColorText,
        borderWidth: formData.borderWidth,
        addBackground: formData.addBackground,
        addBorder: formData.addBorder,
      });

      // Prioritize color picker value over text input, fallback to text input if color picker empty
      const backgroundColor =
        formData.backgroundColor || formData.backgroundColorText || "#007bff";
      const backgroundOpacity = parseInt(formData.backgroundOpacity || 10);
      const borderColor =
        formData.borderColor || formData.borderColorText || "#007bff";
      const borderWidth = formData.borderWidth || 1;

      console.log("🎨 Final colors to be applied:", {
        backgroundColor,
        backgroundOpacity,
        borderColor,
        borderWidth,
      });

      // Helper function to convert hex to rgba
      const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
      };

      // Apply styling ONLY if user explicitly requests it
      if (userWantsBackground) {
        const bgColor = hexToRgba(backgroundColor, backgroundOpacity);

        // Clear any existing background properties to ensure clean application
        element.style.backgroundImage = "";
        element.style.backgroundGradient = "";

        // Apply user's selected background with !important to override any CSS rules
        element.style.setProperty("background-color", bgColor, "important");
        addedStyles.push("custom background color");
        console.log(
          `🎨 Applied user-selected background color with !important: ${bgColor}`
        );
      }

      if (userWantsBorder) {
        const borderStyle = `${borderWidth}px solid ${borderColor}`;

        // Debug: Show existing border properties before clearing
        console.log("🧹 Clearing existing border properties:", {
          borderTop: element.style.borderTop,
          borderRight: element.style.borderRight,
          borderBottom: element.style.borderBottom,
          borderLeft: element.style.borderLeft,
          borderWidth: element.style.borderWidth,
          borderStyle: element.style.borderStyle,
          borderColor: element.style.borderColor,
          border: element.style.border,
        });

        // PRESERVE border-radius before nuclear cleanup
        const currentBorderRadius = {
          borderRadius: element.style.borderRadius,
          borderTopLeftRadius: element.style.borderTopLeftRadius,
          borderTopRightRadius: element.style.borderTopRightRadius,
          borderBottomLeftRadius: element.style.borderBottomLeftRadius,
          borderBottomRightRadius: element.style.borderBottomRightRadius,
        };
        console.log(
          "🔄 PRESERVING border-radius before cleanup:",
          currentBorderRadius
        );

        // NUCLEAR: Clear border properties but NOT border-radius
        const borderPropertiesToClear = [
          "border",
          "border-top",
          "border-right",
          "border-bottom",
          "border-left",
          "border-width",
          "border-style",
          "border-color",
          "border-top-width",
          "border-right-width",
          "border-bottom-width",
          "border-left-width",
          "border-top-style",
          "border-right-style",
          "border-bottom-style",
          "border-left-style",
          "border-top-color",
          "border-right-color",
          "border-bottom-color",
          "border-left-color",
          "outline",
          "outline-width",
          "outline-style",
          "outline-color",
          "outline-offset",
          "box-shadow",
          "filter",
        ];

        // Remove border properties but preserve border-radius
        borderPropertiesToClear.forEach((prop) => {
          element.style.removeProperty(prop);
        });

        // NUCLEAR: Clear inline style attribute completely and rebuild
        const currentStyleAttr = element.getAttribute("style") || "";
        console.log("🧨 NUCLEAR: Current style attribute:", currentStyleAttr);

        // Remove border properties but PRESERVE border-radius from style attribute manually
        let cleanStyleAttr = currentStyleAttr
          .replace(/border(?!-radius)[^;]*;?/gi, "") // Exclude border-radius
          .replace(/outline[^;]*;?/gi, "")
          .replace(/box-shadow[^;]*;?/gi, "")
          .replace(/filter[^;]*;?/gi, "")
          .replace(/;+/g, ";") // Clean up multiple semicolons
          .replace(/^;|;$/g, ""); // Remove leading/trailing semicolons

        element.setAttribute("style", cleanStyleAttr);
        console.log(
          "🧨 NUCLEAR: Cleaned style attribute (preserved border-radius):",
          cleanStyleAttr
        );

        // Also try the old way as backup (but preserve border-radius)
        element.style.borderTop = "";
        element.style.borderRight = "";
        element.style.borderBottom = "";
        element.style.borderLeft = "";
        element.style.borderWidth = "";
        element.style.borderStyle = "";
        element.style.borderColor = "";
        element.style.border = "";
        element.style.outline = "";
        element.style.boxShadow = "";

        // RESTORE border-radius after cleanup
        Object.entries(currentBorderRadius).forEach(([property, value]) => {
          if (value && value.trim()) {
            element.style[property] = value;
            console.log(`🔄 RESTORED ${property}: ${value}`);
          }
        });

        // TRIPLE APPLICATION: Apply border in 3 different ways to ensure it works

        // Method 1: setProperty with !important
        element.style.setProperty("border", borderStyle, "important");

        // Method 2: Direct style attribute manipulation (NUCLEAR)
        const baseStyleAttr = element.getAttribute("style") || "";
        const borderDeclaration = `border: ${borderStyle} !important;`;
        const newStyleAttr = baseStyleAttr
          ? `${baseStyleAttr}; ${borderDeclaration}`
          : borderDeclaration;
        element.setAttribute("style", newStyleAttr);
        console.log("🧨 NUCLEAR: Force set style attribute:", newStyleAttr);

        // Method 3: Add a temporary class to force the border with high specificity
        const tempClass = "nexa-border-override-" + Date.now();
        const styleSheet = document.createElement("style");

        // Build border-radius CSS from preserved values
        let borderRadiusCSS = "";
        Object.entries(currentBorderRadius).forEach(([property, value]) => {
          if (value && value.trim()) {
            const cssProperty = property
              .replace(/([A-Z])/g, "-$1")
              .toLowerCase();
            borderRadiusCSS += `${cssProperty}: ${value} !important;\n`;
          }
        });

        styleSheet.textContent = `
          .${tempClass} {
            border: ${borderStyle} !important;
            border-top: ${borderStyle} !important;
            border-right: ${borderStyle} !important;
            border-bottom: ${borderStyle} !important;
            border-left: ${borderStyle} !important;
            outline: none !important;
            box-shadow: none !important;
            ${borderRadiusCSS}
          }
        `;
        document.head.appendChild(styleSheet);
        element.classList.add(tempClass);
        console.log(
          "🔄 CSS class with preserved border-radius:",
          borderRadiusCSS
        );

        // Method 4: Force reflow to ensure changes are applied
        element.offsetHeight; // Force reflow
        element.style.display = element.style.display; // Force style recalculation

        addedStyles.push("custom border");
        console.log(
          `🎨 Applied CLEAN user-selected border with NUCLEAR methods: ${borderStyle}`
        );

        // IMMEDIATE visual verification
        setTimeout(() => {
          const finalVerification = getComputedStyle(element);

          // More robust success detection - check if border exists and is not default
          const hasValidWidth =
            finalVerification.borderWidth !== "0px" &&
            parseFloat(finalVerification.borderWidth) > 0;
          const hasValidStyle =
            finalVerification.borderStyle !== "none" &&
            finalVerification.borderStyle === "solid";
          const hasValidColor =
            finalVerification.borderColor !== "rgba(0, 0, 0, 0)" &&
            finalVerification.borderColor !== "transparent" &&
            finalVerification.borderColor !== "rgb(0, 0, 0)";

          const isSuccess = hasValidWidth && hasValidStyle && hasValidColor;

          console.log("🔍 SUCCESS CHECK:", {
            hasValidWidth,
            hasValidStyle,
            hasValidColor,
            borderWidth: finalVerification.borderWidth,
            borderStyle: finalVerification.borderStyle,
            borderColor: finalVerification.borderColor,
            overallSuccess: isSuccess,
          });

          if (isSuccess) {
            console.log("✅ SUCCESS: Border successfully applied!");
            console.log(
              `✅ Applied border: ${finalVerification.borderWidth} ${finalVerification.borderStyle} ${finalVerification.borderColor}`
            );

            // Check if border-radius is preserved
            const hasPreservedRadius =
              finalVerification.borderRadius !== "0px" ||
              finalVerification.borderTopLeftRadius !== "0px" ||
              finalVerification.borderTopRightRadius !== "0px" ||
              finalVerification.borderBottomLeftRadius !== "0px" ||
              finalVerification.borderBottomRightRadius !== "0px";

            const radiusMessage = hasPreservedRadius
              ? " (border-radius preserved ✅)"
              : "";
          } else {
            // Only show debugging alert for actual failures
            setTimeout(() => {
              console.error("🔧 DETAILED DEBUGGING INFO:");
              console.error("Expected border:", borderStyle);
              console.error("Computed border:", finalVerification.border);
              console.error("Element tag:", element.tagName);
              console.error("Element classes:", element.className);
              console.error("Style attribute:", element.getAttribute("style"));
            }, 500);
          }
        }, 200);
      }

      // Add some padding and min-height if element is very small
      if (
        !element.style.padding &&
        (element.offsetHeight < 20 || element.offsetWidth < 20)
      ) {
        element.style.padding = "10px";
        addedStyles.push("padding");
      }

      if (!element.style.minHeight && element.offsetHeight < 20) {
        element.style.minHeight = "40px";
        addedStyles.push("min-height");
      }

      console.log(
        `✨ Added styling to make border radius visible: ${addedStyles.join(
          ", "
        )}`
      );

      // Show enhanced notification with details about applied styling
      const wasUserRequested = userWantsBackground || userWantsBorder;
      const hasCustomColors =
        (userWantsBackground &&
          (backgroundColor !== "#007bff" || backgroundOpacity !== 10)) ||
        (userWantsBorder && (borderColor !== "#007bff" || borderWidth !== 1));

      // Notification system removed - check console for border radius styling details
    } else {
      console.log(
        "ℹ️ No custom styling requested by user - border radius will only be visible if element already has background/border styling"
      );
    }
  }

  // showBorderRadiusVisibilityNotification method removed
  removedShowBorderRadiusVisibilityNotification(
    element,
    originalStyles,
    addedStyles = [],
    wasUserRequested = false,
    hasCustomColors = false
  ) {
    // Create enhanced notification with undo option
    const notification = document.createElement("div");
    notification.className =
      "nexa-notification nexa-notification-success border-radius-visibility";

    const stylesText =
      addedStyles.length > 0 ? addedStyles.join(", ") : "styling";

    let actionText = "";
    if (wasUserRequested) {
      actionText = hasCustomColors ? "with your custom colors" : "as requested";
    } else {
      actionText = "to make border radius visible";
    }

    const colorInfo = hasCustomColors ? " 🎨 Using your selected colors!" : "";

    notification.innerHTML = `
      <div class="nexa-notification-content">
        <i class="material-symbols-outlined nexa-notification-icon">palette</i>
        <div class="nexa-notification-message">
          <strong>Border radius styling applied!</strong><br>
          <small>Added ${stylesText} ${actionText}.${colorInfo} 
          <a href="#" class="undo-visibility-styling">Click to undo styling</a></small>
        </div>
        <button class="nexa-notification-close" onclick="this.parentElement.parentElement.remove()">
          <i class="material-symbols-outlined">close</i>
        </button>
      </div>
    `;

    // Add click handler for undo functionality
    const undoLink = notification.querySelector(".undo-visibility-styling");
    undoLink.addEventListener("click", (e) => {
      e.preventDefault();

      // Restore original styles
      Object.entries(originalStyles).forEach(([property, value]) => {
        if (value) {
          element.style[property] = value;
        } else {
          element.style.removeProperty(
            property.replace(/([A-Z])/g, "-$1").toLowerCase()
          );
        }
      });

      console.log("🔄 Restored original element styling");
      notification.remove();

      // Show confirmation
      // this.elements.showNotification("Original styling restored", "info");
    });

    // Add to page with enhanced styles
    const style = document.createElement("style");
    style.textContent = `
      .border-radius-visibility .nexa-notification-message {
        line-height: 1.4;
      }
      .border-radius-visibility .undo-visibility-styling {
        color: #0066cc;
        text-decoration: underline;
        font-weight: 500;
      }
      .border-radius-visibility .undo-visibility-styling:hover {
        color: #0052a3;
      }
    `;

    if (!document.querySelector(".border-radius-visibility-styles")) {
      style.className = "border-radius-visibility-styles";
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => notification.classList.add("show"), 10);

    // Auto remove after 8 seconds (longer than normal due to interaction option)
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(100%)";
        setTimeout(() => notification.remove(), 300);
      }
    }, 8000);
  }

  /**
   * Add temporary visual indicator to show which element was modified
   */
  addTemporaryVisualIndicator(element) {
    if (!element) return;

    // Add temporary outline to show the element was modified
    const originalOutline = element.style.outline;
    element.style.outline = "2px solid #28a745";
    element.style.outlineOffset = "2px";

    // Remove indicator after 3 seconds
    setTimeout(() => {
      if (element.style.outline === "2px solid #28a745") {
        element.style.outline = originalOutline || "";
        element.style.outlineOffset = "";
      }
    }, 3000);
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = BorderRadius;
} else if (typeof window !== "undefined") {
  window.BorderRadius = BorderRadius;
}

export { BorderRadius };
