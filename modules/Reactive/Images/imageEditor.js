class imageEditor {
  constructor() {
    // Editor state
    this.imageEditorState = null;
    this.cropState = null;

    // Setup global functions for NexaUI modal integration
    this.setupGlobalModalFunctions();
  }

  /**
   * Context menu: Open Image Editor
   */
  contextOpenimageEditor(targetElement) {
    try {
      if (!this.isImageElement(targetElement)) {
        return { success: false, error: "Not an image element" };
      }

      // Check if image is loaded
      if (!targetElement.complete || targetElement.naturalWidth === 0) {
        return { success: false, error: "Image not loaded" };
      }

      // Show Image Editor modal with improved large image support
      this.createimageEditorModal(targetElement);

      // Notify about improvements for large images
      const imgWidth = targetElement.naturalWidth;
      const imgHeight = targetElement.naturalHeight;

      if (imgWidth > 1000 || imgHeight > 1000) {
        setTimeout(() => {}, 1000);
      } else if (imgWidth < 1000 && imgHeight < 1000) {
        setTimeout(() => {}, 1000);
      }

      return { success: true, message: "Image Editor opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if element is an image element
   */
  isImageElement(element) {
    return element && element.tagName === "IMG";
  }

  /**
   * Create comprehensive Image Editor modal using NexaUI
   */
  createimageEditorModal(imageElement) {
    // Initialize NexaUI
    const nexaUI = NexaUI();

    const modalId = "nexa-image-editor";

    // Create modal content
    const modalContent = `
      <div style="display: flex; height: 80vh;">
        <!-- Toolbar -->
        <div id="image-editor-toolbar" style="width: 320px; background: #f8f9fa; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; overflow-y: auto;">
          
          <!-- Basic Tools -->
          <div class="tool-section" style="padding: 1rem; border-bottom: 1px solid #e5e7eb;">
            <h6 style="margin: 0 0 0.5rem 0; font-weight: 600; color: #374151;">🔧 Basic Tools</h6>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <button class="nx-btn-primary outline is-small icon-button" id="tool-crop">
                <span class="material-symbols-outlined" style="font-size: 16px;">crop</span>
                Crop
              </button>
              <button class="nx-btn-primary outline is-small icon-button" id="tool-rotate-left">
                <span class="material-symbols-outlined" style="font-size: 16px;">rotate_left</span>
                Rotate
              </button>
              <button class="nx-btn-primary outline is-small icon-button" id="tool-flip-h">
                <span class="material-symbols-outlined" style="font-size: 16px;">flip</span>
                Flip H
              </button>
              <button class="nx-btn-primary outline is-small icon-button" id="tool-flip-v">
                <span class="material-symbols-outlined" style="font-size: 16px;">flip</span>
                Flip V
              </button>
            </div>
          </div>

          <!-- Filters & Effects -->
          <div class="tool-section" style="padding: 1rem; border-bottom: 1px solid #e5e7eb;">
            <h6 style="margin: 0 0 0.5rem 0; font-weight: 600; color: #374151;">🎨 Filters & Effects</h6>
            
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="filter-brightness">Brightness <span id="brightness-value">100%</span></label></dt>
                <dd class="form-group-body">
                  <input type="range" id="filter-brightness" class="form-control" min="0" max="200" value="100">
                </dd>
              </dl>
            </div>

            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="filter-contrast">Contrast <span id="contrast-value">100%</span></label></dt>
                <dd class="form-group-body">
                  <input type="range" id="filter-contrast" class="form-control" min="0" max="200" value="100">
                </dd>
              </dl>
            </div>

            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="filter-saturation">Saturation <span id="saturation-value">100%</span></label></dt>
                <dd class="form-group-body">
                  <input type="range" id="filter-saturation" class="form-control" min="0" max="200" value="100">
                </dd>
              </dl>
            </div>

            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="filter-blur">Blur <span id="blur-value">0px</span></label></dt>
                <dd class="form-group-body">
                  <input type="range" id="filter-blur" class="form-control" min="0" max="10" value="0" step="0.5">
                </dd>
              </dl>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
              <button class="nx-btn-secondary outline is-small" id="filter-grayscale">Grayscale</button>
              <button class="nx-btn-secondary outline is-small" id="filter-sepia">Sepia</button>
              <button class="nx-btn-secondary outline is-small" id="filter-invert">Invert</button>
              <button class="nx-btn-warning outline is-small" id="filter-reset">Reset</button>
            </div>
          </div>

          <!-- Drawing Tools -->
          <div class="tool-section" style="padding: 1rem; border-bottom: 1px solid #e5e7eb;">
            <h6 style="margin: 0 0 0.5rem 0; font-weight: 600; color: #374151;">✏️ Drawing Tools</h6>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <button class="nx-btn-success outline is-small icon-button" id="tool-brush">
                <span class="material-symbols-outlined" style="font-size: 16px;">brush</span>
                Brush
              </button>

              <button class="nx-btn-success outline is-small icon-button" id="tool-rectangle">
                <span class="material-symbols-outlined" style="font-size: 16px;">rectangle</span>
                Rect
              </button>
              <button class="nx-btn-success outline is-small icon-button" id="tool-circle">
                <span class="material-symbols-outlined" style="font-size: 16px;">circle</span>
                Circle
              </button>
            </div>
            
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="brush-size">Brush Size <span id="brush-size-value">5px</span></label></dt>
                <dd class="form-group-body">
                  <input type="range" id="brush-size" class="form-control" min="1" max="50" value="5">
                </dd>
              </dl>
            </div>

            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="brush-color">Color</label></dt>
                <dd class="form-group-body">
                  <input type="color" id="brush-color" class="form-control input-block" value="#ff0000">
                </dd>
              </dl>
            </div>
          </div>

          <!-- Zoom Controls -->
          <div class="tool-section" style="padding: 1rem; border-bottom: 1px solid #e5e7eb;">
            <h6 style="margin: 0 0 0.5rem 0; font-weight: 600; color: #374151;">🔍 Zoom</h6>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
              <button class="nx-btn-info outline is-small icon-button" id="zoom-in">
                <span class="material-symbols-outlined" style="font-size: 16px;">zoom_in</span>
                In
              </button>
              <button class="nx-btn-info outline is-small icon-button" id="zoom-out">
                <span class="material-symbols-outlined" style="font-size: 16px;">zoom_out</span>
                Out
              </button>
              <button class="nx-btn-secondary outline is-small icon-button" id="zoom-reset">
                <span class="material-symbols-outlined" style="font-size: 16px;">fit_screen</span>
                Fit
              </button>
            </div>
            
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="zoom-slider">Zoom Level <span id="zoom-value">100%</span></label></dt>
                <dd class="form-group-body">
                  <input type="range" id="zoom-slider" class="form-control" min="0.1" max="5" value="1" step="0.1">
                </dd>
              </dl>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <button class="nx-btn-primary outline is-small" id="zoom-25">25%</button>
              <button class="nx-btn-primary outline is-small" id="zoom-50">50%</button>
              <button class="nx-btn-primary outline is-small" id="zoom-100">100%</button>
              <button class="nx-btn-primary outline is-small" id="zoom-200">200%</button>
            </div>
          </div>

          <!-- Resize -->
          <div class="tool-section" style="padding: 1rem; border-bottom: 1px solid #e5e7eb;">
            <h6 style="margin: 0 0 0.5rem 0; font-weight: 600; color: #374151;">📏 Resize</h6>
            <div class="nx-row">
              <div class="nx-col-6">
                <div class="form-group">
                  <dl>
                    <dt class="form-group-header"><label for="resize-width">Width</label></dt>
                    <dd class="form-group-body">
                      <input type="number" id="resize-width" class="form-control" min="1">
                    </dd>
                  </dl>
                </div>
              </div>
              <div class="nx-col-6">
                <div class="form-group">
                  <dl>
                    <dt class="form-group-header"><label for="resize-height">Height</label></dt>
                    <dd class="form-group-body">
                      <input type="number" id="resize-height" class="form-control" min="1">
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div class="form-checkbox">
              <label><input type="checkbox" id="maintain-aspect" checked> Keep aspect ratio</label>
            </div>
            <button class="nx-btn-info outline is-small full-width" id="apply-resize">Apply Resize</button>
          </div>
        </div>

        <!-- Canvas Area -->
        <div id="image-editor-canvas-area" style="flex: 1; position: relative; background: #f8f9fa; display: flex; align-items: center; justify-content: center; overflow: auto; min-height: 400px;">
          <div id="canvas-container" style="position: relative; transform-origin: center center; transition: transform 0.2s ease; max-width: 100%; max-height: 100%;">
            <canvas id="image-editor-canvas" style="border: 1px solid #e5e7eb; display: block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 100%; max-height: 100%;"></canvas>
            <canvas id="drawing-canvas" style="position: absolute; top: 0; left: 0; cursor: crosshair; display: none;"></canvas>
          </div>
        </div>
      </div>
    `;

    // Create modal footer with buttons
    const modalFooter = `
      <button class="nx-btn-secondary outline icon-button" id="editor-reset">
        <span class="material-symbols-outlined" style="font-size: 16px;">restart_alt</span>
        Reset All
      </button>
      <button class="nx-btn-info outline icon-button" id="editor-download">
        <span class="material-symbols-outlined" style="font-size: 16px;">download</span>
        Download
      </button>
      <button class="nx-btn-primary icon-button" id="editor-apply">
        <span class="material-symbols-outlined" style="font-size: 16px;">check</span>
        Apply Changes
      </button>
    `;

    // Create NexaUI modal
    nexaUI.modalHTML({
      elementById: modalId,
      styleClass: "modal-fullscreen",
      label: `🎨 Image Editor`,
      onclick: {
        title: "Apply Changes",
        cancel: "Cancel",
        send: "applyImageEditorChanges",
      },
      content: modalContent,
      footer: modalFooter,
    });

    // Store nexaUI reference for modal control
    this.nexaUI = nexaUI;

    // Initialize the image editor
    this.initializeimageEditor(imageElement);

    // Show modal
    setTimeout(() => {
      nexaUI.nexaModal.open(modalId);
    }, 100);
  }

  /**
   * Initialize Image Editor functionality
   */
  initializeimageEditor(originalImage) {
    const canvas = document.getElementById("image-editor-canvas");
    const drawingCanvas = document.getElementById("drawing-canvas");
    const ctx = canvas.getContext("2d");
    const drawingCtx = drawingCanvas.getContext("2d");

    // Editor state
    this.imageEditorState = {
      originalImage: originalImage,
      canvas: canvas,
      ctx: ctx,
      drawingCanvas: drawingCanvas,
      drawingCtx: drawingCtx,
      currentTool: "none",
      isDrawing: false,
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        grayscale: 0,
        sepia: 0,
        invert: 0,
      },
      transforms: {
        rotation: 0,
        flipH: 1,
        flipV: 1,
      },
      brushSettings: {
        size: 5,
        color: "#ff0000",
      },
      zoom: {
        level: 1,
        minZoom: 0.1,
        maxZoom: 5,
      },
      originalImageData: null,
      history: [],
      currentHistoryIndex: -1,
    };

    // Load image to canvas
    this.loadImageToCanvas(originalImage);

    // Setup all event listeners
    this.setupimageEditorEvents();
  }

  /**
   * Load image to canvas
   */
  loadImageToCanvas(image) {
    const canvas = document.getElementById("image-editor-canvas");
    const drawingCanvas = document.getElementById("drawing-canvas");

    if (!canvas || !drawingCanvas || !image) return;

    const ctx = canvas.getContext("2d");

    // Calculate canvas size to fit the image
    const maxSize = 800;
    let canvasSize = { width: image.naturalWidth, height: image.naturalHeight };

    if (canvasSize.width > maxSize || canvasSize.height > maxSize) {
      const ratio = Math.min(
        maxSize / canvasSize.width,
        maxSize / canvasSize.height
      );
      canvasSize.width *= ratio;
      canvasSize.height *= ratio;
    }

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    drawingCanvas.width = canvasSize.width;
    drawingCanvas.height = canvasSize.height;

    // Draw image
    ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);

    // Store original image data for reset functionality
    if (this.imageEditorState) {
      this.imageEditorState.originalImageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  }

  /**
   * Setup all image editor event listeners
   */
  setupimageEditorEvents() {
    // Basic tools
    document
      .getElementById("tool-crop")
      .addEventListener("click", () => this.activateCropTool());
    document
      .getElementById("tool-rotate-left")
      .addEventListener("click", () => this.rotateImage(-90));
    document
      .getElementById("tool-flip-h")
      .addEventListener("click", () => this.flipImage("horizontal"));
    document
      .getElementById("tool-flip-v")
      .addEventListener("click", () => this.flipImage("vertical"));

    // Filters
    this.setupFilterControls();

    // Drawing tools
    document
      .getElementById("tool-brush")
      .addEventListener("click", () => this.activateDrawingTool("brush"));

    document
      .getElementById("tool-rectangle")
      .addEventListener("click", () => this.activateDrawingTool("rectangle"));
    document
      .getElementById("tool-circle")
      .addEventListener("click", () => this.activateDrawingTool("circle"));

    // Brush settings
    document.getElementById("brush-size").addEventListener("input", (e) => {
      this.imageEditorState.brushSettings.size = parseInt(e.target.value);
      document.getElementById("brush-size-value").textContent =
        e.target.value + "px";
    });

    document.getElementById("brush-color").addEventListener("change", (e) => {
      this.imageEditorState.brushSettings.color = e.target.value;
    });

    // Zoom controls
    document
      .getElementById("zoom-in")
      .addEventListener("click", () => this.zoomIn());
    document
      .getElementById("zoom-out")
      .addEventListener("click", () => this.zoomOut());
    document
      .getElementById("zoom-reset")
      .addEventListener("click", () => this.zoomReset());
    document
      .getElementById("zoom-slider")
      .addEventListener("input", (e) =>
        this.setZoom(parseFloat(e.target.value))
      );

    // Preset zoom levels
    document
      .getElementById("zoom-25")
      .addEventListener("click", () => this.setZoom(0.25));
    document
      .getElementById("zoom-50")
      .addEventListener("click", () => this.setZoom(0.5));
    document
      .getElementById("zoom-100")
      .addEventListener("click", () => this.setZoom(1));
    document
      .getElementById("zoom-200")
      .addEventListener("click", () => this.setZoom(2));

    // Resize
    document
      .getElementById("apply-resize")
      .addEventListener("click", () => this.resizeImage());
    document
      .getElementById("maintain-aspect")
      .addEventListener("change", (e) => {
        if (e.target.checked) {
          this.syncResizeDimensions();
        }
      });

    // Sync resize inputs
    document
      .getElementById("resize-width")
      .addEventListener("input", () => this.syncResizeDimensions("width"));
    document
      .getElementById("resize-height")
      .addEventListener("input", () => this.syncResizeDimensions("height"));

    // Footer buttons
    document
      .getElementById("editor-reset")
      .addEventListener("click", () => this.resetAllChanges());
    document
      .getElementById("editor-download")
      .addEventListener("click", () => this.downloadEditedImage());
    document
      .getElementById("editor-apply")
      .addEventListener("click", () => this.applyChangesToOriginal());

    // Drawing canvas events
    this.setupDrawingEvents();

    // Mouse wheel zoom
    this.setupZoomEvents();
  }

  /**
   * Setup filter controls
   */
  setupFilterControls() {
    const filters = ["brightness", "contrast", "saturation", "blur"];

    filters.forEach((filter) => {
      const slider = document.getElementById(`filter-${filter}`);
      const valueSpan = document.getElementById(`${filter}-value`);

      slider.addEventListener("input", (e) => {
        const value = parseInt(e.target.value);
        this.imageEditorState.filters[filter] = value;

        // Update display
        if (filter === "blur") {
          valueSpan.textContent = value + "px";
        } else {
          valueSpan.textContent = value + "%";
        }

        this.applyFilters();
      });
    });

    // Filter buttons
    document
      .getElementById("filter-grayscale")
      .addEventListener("click", () => this.toggleFilter("grayscale"));
    document
      .getElementById("filter-sepia")
      .addEventListener("click", () => this.toggleFilter("sepia"));
    document
      .getElementById("filter-invert")
      .addEventListener("click", () => this.toggleFilter("invert"));
    document
      .getElementById("filter-reset")
      .addEventListener("click", () => this.resetFilters());
  }

  // Rotate image
  rotateImage(degrees) {
    this.imageEditorState.transforms.rotation += degrees;
    this.applyFilters();
    this.saveToHistory();
  }

  // Flip image
  flipImage(direction) {
    if (direction === "horizontal") {
      this.imageEditorState.transforms.flipH *= -1;
    } else {
      this.imageEditorState.transforms.flipV *= -1;
    }
    this.applyFilters();
    this.saveToHistory();
  }

  // Toggle filters
  toggleFilter(filterType) {
    const button = document.getElementById(`filter-${filterType}`);
    const isActive = this.imageEditorState.filters[filterType] > 0;

    this.imageEditorState.filters[filterType] = isActive ? 0 : 100;
    button.classList.toggle("active", !isActive);

    this.applyFilters();
    this.saveToHistory();
  }

  /**
   * Apply current filters to canvas
   */
  applyFilters() {
    if (!this.imageEditorState.originalImageData) return;

    const canvas = this.imageEditorState.canvas;
    const ctx = this.imageEditorState.ctx;
    const filters = this.imageEditorState.filters;

    // Build filter string
    const filterStr = `
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      blur(${filters.blur}px)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%)
      invert(${filters.invert}%)
    `
      .replace(/\s+/g, " ")
      .trim();

    // Apply filter
    ctx.filter = filterStr;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw with transforms
    this.drawWithTransforms();

    // Reset filter for other operations
    ctx.filter = "none";
  }

  /**
   * Draw image with current transforms
   */
  drawWithTransforms() {
    const ctx = this.imageEditorState.ctx;
    const canvas = this.imageEditorState.canvas;
    const { rotation, flipH, flipV } = this.imageEditorState.transforms;
    const image = this.imageEditorState.originalImage;

    ctx.save();

    // Center the transformation
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply flips
    ctx.scale(flipH, flipV);

    // Draw image centered
    ctx.drawImage(
      image,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );

    ctx.restore();
  }

  /**
   * Reset filters to default
   */
  resetFilters() {
    this.imageEditorState.filters = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
    };

    // Update UI
    document.getElementById("filter-brightness").value = 100;
    document.getElementById("filter-contrast").value = 100;
    document.getElementById("filter-saturation").value = 100;
    document.getElementById("filter-blur").value = 0;
    document.getElementById("brightness-value").textContent = "100%";
    document.getElementById("contrast-value").textContent = "100%";
    document.getElementById("saturation-value").textContent = "100%";
    document.getElementById("blur-value").textContent = "0px";

    // Remove active states from filter buttons
    document.getElementById("filter-grayscale")?.classList.remove("active");
    document.getElementById("filter-sepia")?.classList.remove("active");
    document.getElementById("filter-invert")?.classList.remove("active");

    this.applyFilters();
  }

  /**
   * Reset all changes
   */
  resetAllChanges() {
    this.showResetConfirmationModal();
  }

  /**
   * Show professional confirmation modal for reset using NexaUI
   */
  showResetConfirmationModal() {
    const modalId = "nexa-reset-confirm";

    // Modal content with confirmation message
    const modalContent = `
      <div style="text-align: center; padding: 1rem 0;">
        <div style="font-size: 3rem; color: #dc2626; margin-bottom: 1rem;">
          <span class="material-symbols-outlined" style="font-size: inherit;">restart_alt</span>
        </div>
        <p style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">
          Are you sure you want to reset all changes?
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">
          This will restore the image to its original state and cannot be undone.
        </p>
      </div>
    `;

    // Modal footer with confirmation buttons
    const modalFooter = `
      <button class="btn btn-danger" id="confirm-reset-btn">
        <span class="material-symbols-outlined" style="font-size: 16px; margin-right: 0.25rem;">restart_alt</span>
        Reset All Changes
      </button>
    `;

    // Create confirmation modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: modalId,
      styleClass: "w-500px",
      label: `<span class="material-symbols-outlined" style="margin-right: 0.5rem; color: #dc2626;">warning</span>Reset All Changes`,
      onclick: {
        title: "Reset All Changes",
        cancel: "Cancel",
        send: "confirmResetAllChanges",
      },
      content: modalContent,
      footer: modalFooter,
    });

    // Setup confirm button event
    setTimeout(() => {
      const confirmBtn = document.getElementById("confirm-reset-btn");
      if (confirmBtn) {
        confirmBtn.addEventListener("click", () => {
          this.executeResetAllChanges();
          this.nexaUI.nexaModal.close(modalId);
        });
      }
    }, 100);

    // Show modal
    setTimeout(() => {
      this.nexaUI.nexaModal.open(modalId);
    }, 150);
  }

  // Execute the actual reset
  executeResetAllChanges() {
    this.loadImageToCanvas(this.imageEditorState.originalImage);
    this.imageEditorState.transforms = { rotation: 0, flipH: 1, flipV: 1 };
    this.resetFilters();

    // Reset zoom and pan
    this.zoomReset();
  }

  /**
   * Apply changes to original image
   */
  applyChangesToOriginal() {
    try {
      const canvas = this.imageEditorState.canvas;
      const originalImage = this.imageEditorState.originalImage;

      // FIXED: Try multiple approaches to apply changes
      // First, try the standard approach
      let dataUrl;
      try {
        dataUrl = canvas.toDataURL("image/png");
      } catch (taintError) {
        // If canvas is tainted, use alternative approach
        console.warn("Canvas tainted, using alternative update method");

        // Create a new image element with edited content
        canvas.toBlob((blob) => {
          if (blob) {
            const newImageUrl = URL.createObjectURL(blob);

            // Update image source
            originalImage.onload = () => {
              // Clean up the blob URL after image loads
              URL.revokeObjectURL(newImageUrl);
            };

            originalImage.src = newImageUrl;

            // Close modal using NexaUI
            if (this.nexaUI) {
              this.nexaUI.nexaModal.close("nexa-image-editor");
            }
          } else {
            throw new Error("Failed to create blob from canvas");
          }
        }, "image/png");
        return;
      }

      // Standard approach succeeded
      originalImage.src = dataUrl;

      // Close modal using NexaUI
      if (this.nexaUI) {
        this.nexaUI.nexaModal.close("nexa-image-editor");
      }
    } catch (error) {
      console.error("Error applying changes:", error);

      // Auto-trigger download as fallback
      setTimeout(() => {
        this.downloadEditedImage();
      }, 1000);
    }
  }

  /**
   * Download edited image
   */
  downloadEditedImage() {
    try {
      const canvas = this.imageEditorState.canvas;

      // Create download link
      const link = document.createElement("a");
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:-]/g, "");
      link.download = `edited-image-${timestamp}.png`;

      // Convert canvas to blob and create URL
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            link.href = url;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up URL
            setTimeout(() => {
              URL.revokeObjectURL(url);
            }, 100);
          } else {
            throw new Error("Failed to create image blob");
          }
        },
        "image/png",
        1.0
      );
    } catch (error) {
      console.error("Error downloading image:", error);

      // Fallback for tainted canvas
      try {
        const canvas = this.imageEditorState.canvas;
        const dataUrl = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/[:-]/g, "");
        link.download = `edited-image-${timestamp}.png`;
        link.href = dataUrl;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {}
    }
  }

  /**
   * Setup global functions for NexaUI modal integration
   */
  setupGlobalModalFunctions() {
    // Global function to handle apply changes from modal
    window.applyImageEditorChanges = (modalId) => {
      this.applyChangesToOriginal();
    };

    // Global function to handle reset confirmation
    window.confirmResetAllChanges = (modalId) => {
      this.executeResetAllChanges();
      if (this.nexaUI) {
        this.nexaUI.nexaModal.close(modalId);
      }
    };
  }

  /**
   * Activate drawing tool
   */
  activateDrawingTool(tool) {
    // Deactivate all tools first
    document.querySelectorAll("#image-editor-toolbar button").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Activate selected tool
    const toolButton = document.getElementById(`tool-${tool}`);
    if (toolButton) {
      toolButton.classList.add("active");
    }

    this.imageEditorState.currentTool = tool;

    // Show/hide drawing canvas
    const drawingCanvas = this.imageEditorState.drawingCanvas;
    if (drawingCanvas) {
      if (tool !== "none") {
        drawingCanvas.style.display = "block";
      } else {
        drawingCanvas.style.display = "none";
      }
    }
  }

  // Setup drawing events
  setupDrawingEvents() {
    const drawingCanvas = this.imageEditorState.drawingCanvas;
    let isDrawing = false;
    let startX, startY;

    drawingCanvas.addEventListener("mousedown", (e) => {
      const coords = this.getCanvasCoordinates(e, drawingCanvas);
      startX = coords.x;
      startY = coords.y;

      // Set drawing state for all tools
      isDrawing = true;

      // FIXED: Auto-merge any existing drawings to main canvas first
      if (this.hasDrawingContent()) {
        this.mergeDrawingToCanvas();
      }

      if (this.imageEditorState.currentTool === "brush") {
        this.startBrushStroke(startX, startY);
      }
    });

    drawingCanvas.addEventListener("mousemove", (e) => {
      if (!isDrawing) return;

      const coords = this.getCanvasCoordinates(e, drawingCanvas);
      const currentX = coords.x;
      const currentY = coords.y;

      if (this.imageEditorState.currentTool === "brush") {
        this.continueBrushStroke(currentX, currentY);
      }
    });

    drawingCanvas.addEventListener("mouseup", (e) => {
      if (!isDrawing) return;
      isDrawing = false;

      const coords = this.getCanvasCoordinates(e, drawingCanvas);
      const endX = coords.x;
      const endY = coords.y;

      if (this.imageEditorState.currentTool === "rectangle") {
        this.drawRectangle(startX, startY, endX, endY);
        // Merge drawing to main canvas
        this.mergeDrawingToCanvas();
      } else if (this.imageEditorState.currentTool === "circle") {
        this.drawCircle(startX, startY, endX, endY);
        // Merge drawing to main canvas
        this.mergeDrawingToCanvas();
      }
      // Note: text tool is handled in mousedown, brush strokes are merged in real-time
    });
  }

  /**
   * Get correct canvas coordinates accounting for zoom, pan, and scale factor
   */
  getCanvasCoordinates(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const zoom = this.imageEditorState.zoom?.level || 1;
    const pan = this.imageEditorState.pan || { x: 0, y: 0 };
    const scaleFactor = this.imageEditorState.scaleFactor || { x: 1, y: 1 };

    // Get mouse position relative to canvas
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Account for zoom, pan, and scale factor for large images
    const canvasX = ((mouseX - pan.x) / zoom) * scaleFactor.x;
    const canvasY = ((mouseY - pan.y) / zoom) * scaleFactor.y;

    return { x: canvasX, y: canvasY };
  }

  // Drawing functions
  startBrushStroke(x, y) {
    const ctx = this.imageEditorState.drawingCtx;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = this.imageEditorState.brushSettings.size;
    ctx.strokeStyle = this.imageEditorState.brushSettings.color;
    ctx.lineCap = "round";
  }

  continueBrushStroke(x, y) {
    const ctx = this.imageEditorState.drawingCtx;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  drawRectangle(x1, y1, x2, y2) {
    const ctx = this.imageEditorState.drawingCtx;
    ctx.strokeStyle = this.imageEditorState.brushSettings.color;
    ctx.lineWidth = this.imageEditorState.brushSettings.size;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  }

  drawCircle(x1, y1, x2, y2) {
    const ctx = this.imageEditorState.drawingCtx;
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = this.imageEditorState.brushSettings.color;
    ctx.lineWidth = this.imageEditorState.brushSettings.size;
    ctx.stroke();
  }

  mergeDrawingToCanvas() {
    const mainCtx = this.imageEditorState.ctx;
    const drawingCanvas = this.imageEditorState.drawingCanvas;

    // Draw the drawing canvas onto the main canvas
    mainCtx.drawImage(drawingCanvas, 0, 0);

    // Clear drawing canvas
    const drawingCtx = this.imageEditorState.drawingCtx;
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    this.saveToHistory();
  }

  // FIXED: Helper function to check if drawing canvas has content
  hasDrawingContent() {
    const drawingCanvas = this.imageEditorState.drawingCanvas;
    const drawingCtx = this.imageEditorState.drawingCtx;

    try {
      const imageData = drawingCtx.getImageData(
        0,
        0,
        drawingCanvas.width,
        drawingCanvas.height
      );
      const pixels = imageData.data;

      // Check if any pixel has non-zero alpha (transparency)
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] > 0) {
          return true;
        }
      }
      return false;
    } catch (e) {
      // If we can't read image data, assume there's content to be safe
      return true;
    }
  }

  // Crop tool implementation using Cropper.js
  activateCropTool() {
    if (this.cropState && this.cropState.active) {
      this.cancelCrop();
      return;
    }

    this.initializeCropperJS();
  }

  initializeCropperJS() {
    const canvas = this.imageEditorState.canvas;

    // Check if Cropper is available
    if (typeof Cropper === "undefined") {
      return;
    }

    // Create a temporary image element to use with Cropper.js
    const tempImage = document.createElement("img");
    tempImage.id = "cropper-image";
    tempImage.style.cssText = `
      display: block;
      max-width: 100%;
      max-height: 100%;
    `;

    // Convert canvas to data URL and set as image source
    tempImage.src = canvas.toDataURL();

    // Replace canvas with image temporarily
    const canvasContainer = document.getElementById("canvas-container");
    const originalCanvas = canvas.cloneNode(true);
    canvas.style.display = "none";
    canvasContainer.appendChild(tempImage);

    // Add crop controls to toolbar
    this.addCropperControlsToToolbar();

    // Initialize Cropper.js
    this.cropState = {
      active: true,
      originalCanvas: originalCanvas,
      tempImage: tempImage,
      cropper: null,
    };

    // Wait for image to load before initializing cropper
    tempImage.onload = () => {
      try {
        this.cropState.cropper = new Cropper(tempImage, {
          aspectRatio: NaN, // Free aspect ratio
          viewMode: 1,
          dragMode: "crop",
          autoCropArea: 0.8,
          restore: false,
          guides: true,
          center: true,
          highlight: true,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
          background: true,
          responsive: true,
          minCropBoxWidth: 50,
          minCropBoxHeight: 50,
          ready: () => {
            console.log("Cropper.js initialized successfully");
          },
          crop: (event) => {
            // Optional: Show crop dimensions in real-time
            const { width, height } = event.detail;
            console.log(
              `Crop area: ${Math.round(width)}×${Math.round(height)}px`
            );
          },
        });

        // Add keyboard shortcuts for cropper
        this.setupCropperKeyboardShortcuts();
      } catch (error) {
        console.error("Error initializing Cropper.js:", error);

        this.cancelCrop();
      }
    };

    // Handle image load errors
    tempImage.onerror = () => {
      this.cancelCrop();
    };

    // Update crop button state
    const cropBtn = document.getElementById("tool-crop");
    cropBtn.classList.add("active");
    cropBtn.innerHTML =
      '<span class="material-symbols-outlined" style="font-size: 16px;">close</span> Exit Crop';
  }

  applyCrop() {
    if (!this.cropState || !this.cropState.active || !this.cropState.cropper) {
      return;
    }

    const cropper = this.cropState.cropper;
    const canvas = this.imageEditorState.canvas;
    const ctx = this.imageEditorState.ctx;

    try {
      // Get cropped canvas from Cropper.js
      const croppedCanvas = cropper.getCroppedCanvas();

      if (!croppedCanvas) {
        return;
      }

      // Update main canvas with cropped image
      canvas.width = croppedCanvas.width;
      canvas.height = croppedCanvas.height;
      canvas.style.width = croppedCanvas.width + "px";
      canvas.style.height = croppedCanvas.height + "px";

      // Clear and draw cropped image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(croppedCanvas, 0, 0);

      // Update drawing canvas size
      const drawingCanvas = this.imageEditorState.drawingCanvas;
      if (drawingCanvas) {
        drawingCanvas.width = croppedCanvas.width;
        drawingCanvas.height = croppedCanvas.height;
        drawingCanvas.style.width = croppedCanvas.width + "px";
        drawingCanvas.style.height = croppedCanvas.height + "px";
      }

      // Reset zoom and pan
      this.imageEditorState.zoom.level = 1;
      this.imageEditorState.pan = { x: 0, y: 0 };
      this.updateCanvasTransform();

      // Save to history
      this.saveToHistory();

      this.cancelCrop();
    } catch (error) {
      console.error("Error applying crop:", error);
    }
  }

  cancelCrop() {
    if (!this.cropState) return;

    // Destroy Cropper instance
    if (this.cropState.cropper) {
      this.cropState.cropper.destroy();
    }

    // Remove temporary image and restore canvas
    if (this.cropState.tempImage) {
      this.cropState.tempImage.remove();
    }

    const canvas = this.imageEditorState.canvas;
    if (canvas) {
      canvas.style.display = "block";
    }

    // Remove crop controls from toolbar
    const cropControlsSection = document.getElementById(
      "cropper-controls-section"
    );
    if (cropControlsSection) {
      cropControlsSection.remove();
    }

    // Remove keyboard event listener
    if (this.cropState.keyHandler) {
      document.removeEventListener("keydown", this.cropState.keyHandler);
    }

    // Reset crop button
    const cropBtn = document.getElementById("tool-crop");
    if (cropBtn) {
      cropBtn.classList.remove("active");
      cropBtn.innerHTML =
        '<span class="material-symbols-outlined" style="font-size: 16px;">crop</span> Crop';
    }

    // Clear crop state
    this.cropState = null;
  }

  addCropperControlsToToolbar() {
    // Find the Basic Tools section
    const basicToolsSection = document.querySelector(".tool-section");
    if (!basicToolsSection) return;

    // Remove existing crop controls if any
    const existingControls = document.getElementById(
      "cropper-controls-section"
    );
    if (existingControls) {
      existingControls.remove();
    }

    // Create crop controls container
    const cropControlsContainer = document.createElement("div");
    cropControlsContainer.id = "cropper-controls-section";
    cropControlsContainer.style.cssText = `
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    `;

    // Create controls title
    const controlsTitle = document.createElement("h6");
    controlsTitle.style.cssText = `
      margin: 0 0 0.5rem 0;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
    `;
    controlsTitle.innerHTML = "✂️ Cropper.js Controls";

    // Create aspect ratio section
    const aspectRatioSection = document.createElement("div");
    aspectRatioSection.style.cssText = `margin-bottom: 1rem;`;

    const aspectRatioLabel = document.createElement("label");
    aspectRatioLabel.style.cssText = `
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 0.25rem;
    `;
    aspectRatioLabel.textContent = "Aspect Ratio:";

    const aspectRatioSelect = document.createElement("select");
    aspectRatioSelect.id = "aspect-ratio-select";
    aspectRatioSelect.className = "form-select form-select-sm";
    aspectRatioSelect.style.cssText = `
      width: 100%;
      font-size: 12px;
      padding: 0.25rem 0.5rem;
    `;

    aspectRatioSelect.innerHTML = `
      <option value="NaN">Free</option>
      <option value="1">1:1 (Square)</option>
      <option value="1.333">4:3 (Standard)</option>
      <option value="1.777">16:9 (Widescreen)</option>
      <option value="0.75">3:4 (Portrait)</option>
      <option value="1.5">3:2 (Photo)</option>
      <option value="2">2:1 (Panoramic)</option>
    `;

    aspectRatioSelect.addEventListener("change", (e) => {
      if (this.cropState && this.cropState.cropper) {
        const value = e.target.value;
        const aspectRatio = value === "NaN" ? NaN : parseFloat(value);
        this.cropState.cropper.setAspectRatio(aspectRatio);
      }
    });

    aspectRatioSection.appendChild(aspectRatioLabel);
    aspectRatioSection.appendChild(aspectRatioSelect);

    // Create preset buttons
    const presetsSection = document.createElement("div");
    presetsSection.style.cssText = `margin-bottom: 1rem;`;

    const presetsLabel = document.createElement("label");
    presetsLabel.style.cssText = `
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 0.25rem;
    `;
    presetsLabel.textContent = "Quick Actions:";

    const presetsContainer = document.createElement("div");
    presetsContainer.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.25rem;
    `;

    // Reset crop area button
    const resetBtn = document.createElement("button");
    resetBtn.className = "btn btn-sm btn-outline-primary";
    resetBtn.innerHTML =
      '<span class="material-symbols-outlined" style="font-size: 14px;">refresh</span>';
    resetBtn.title = "Reset crop area";
    resetBtn.onclick = () => {
      if (this.cropState && this.cropState.cropper) {
        this.cropState.cropper.reset();
      }
    };

    // Clear crop area button
    const clearBtn = document.createElement("button");
    clearBtn.className = "btn btn-sm btn-outline-warning";
    clearBtn.innerHTML =
      '<span class="material-symbols-outlined" style="font-size: 14px;">clear</span>';
    clearBtn.title = "Clear crop area";
    clearBtn.onclick = () => {
      if (this.cropState && this.cropState.cropper) {
        this.cropState.cropper.clear();
      }
    };

    presetsContainer.appendChild(resetBtn);
    presetsContainer.appendChild(clearBtn);
    presetsSection.appendChild(presetsLabel);
    presetsSection.appendChild(presetsContainer);

    // Create buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.style.cssText = `
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.5rem;
    `;

    // Create Apply Crop button
    const applyCropBtn = document.createElement("button");
    applyCropBtn.className = "btn btn-sm btn-success";
    applyCropBtn.id = "apply-crop-btn";
    applyCropBtn.innerHTML =
      '<span class="material-symbols-outlined" style="font-size: 16px;">crop</span> Apply Crop';
    applyCropBtn.onclick = () => this.applyCrop();

    // Create Cancel Crop button
    const cancelCropBtn = document.createElement("button");
    cancelCropBtn.className = "btn btn-sm btn-outline-secondary";
    cancelCropBtn.id = "cancel-crop-btn";
    cancelCropBtn.innerHTML =
      '<span class="material-symbols-outlined" style="font-size: 16px;">close</span> Cancel Crop';
    cancelCropBtn.onclick = () => this.cancelCrop();

    // Assemble the controls
    buttonsContainer.appendChild(applyCropBtn);
    buttonsContainer.appendChild(cancelCropBtn);

    cropControlsContainer.appendChild(controlsTitle);
    cropControlsContainer.appendChild(aspectRatioSection);
    cropControlsContainer.appendChild(presetsSection);
    cropControlsContainer.appendChild(buttonsContainer);

    // Add to Basic Tools section
    basicToolsSection.appendChild(cropControlsContainer);
  }

  // Setup keyboard shortcuts for Cropper.js
  setupCropperKeyboardShortcuts() {
    const keyHandler = (e) => {
      // Only handle shortcuts when cropper is active
      if (!this.cropState || !this.cropState.active || !this.cropState.cropper)
        return;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          this.applyCrop();
          break;
        case "Escape":
          e.preventDefault();
          this.cancelCrop();
          break;
        case "r":
        case "R":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.cropState.cropper.reset();
          }
          break;
        case "c":
        case "C":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.cropState.cropper.clear();
          }
          break;
      }
    };

    document.addEventListener("keydown", keyHandler);
    this.cropState.keyHandler = keyHandler;
  }

  // Resize image
  resizeImage() {
    const newWidth = parseInt(document.getElementById("resize-width").value);
    const newHeight = parseInt(document.getElementById("resize-height").value);

    if (newWidth < 1 || newHeight < 1) {
      return;
    }

    const canvas = this.imageEditorState.canvas;
    const ctx = this.imageEditorState.ctx;

    // Save current image data
    const currentImageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Create temporary canvas with current content
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.putImageData(currentImageData, 0, 0);

    // Resize main canvas
    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.width = newWidth + "px";
    canvas.style.height = newHeight + "px";

    // Resize drawing canvas too
    this.imageEditorState.drawingCanvas.width = newWidth;
    this.imageEditorState.drawingCanvas.height = newHeight;
    this.imageEditorState.drawingCanvas.style.width = newWidth + "px";
    this.imageEditorState.drawingCanvas.style.height = newHeight + "px";

    // Draw resized image
    ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);

    this.saveToHistory();
  }

  // Sync resize dimensions
  syncResizeDimensions(changedDimension) {
    const maintainAspect = document.getElementById("maintain-aspect").checked;
    if (!maintainAspect) return;

    const widthInput = document.getElementById("resize-width");
    const heightInput = document.getElementById("resize-height");
    const canvas = this.imageEditorState.canvas;

    const aspectRatio = canvas.width / canvas.height;

    if (changedDimension === "width") {
      heightInput.value = Math.round(parseInt(widthInput.value) / aspectRatio);
    } else {
      widthInput.value = Math.round(parseInt(heightInput.value) * aspectRatio);
    }
  }

  /**
   * Setup zoom events for image editor
   */
  setupZoomEvents() {
    const canvasArea = document.getElementById("image-editor-canvas-area");
    const canvasContainer = document.getElementById("canvas-container");

    if (!canvasArea || !canvasContainer) return;

    // Initialize zoom state if not exists
    if (!this.imageEditorState.zoom) {
      this.imageEditorState.zoom = {
        level: 1,
        minZoom: 0.1,
        maxZoom: 5.0,
      };
    }

    // Initialize pan state if not exists
    if (!this.imageEditorState.pan) {
      this.imageEditorState.pan = { x: 0, y: 0 };
    }

    // Mouse wheel zoom
    canvasArea.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(
        this.imageEditorState.zoom.minZoom,
        Math.min(
          this.imageEditorState.zoom.maxZoom,
          this.imageEditorState.zoom.level + delta
        )
      );
      this.setZoom(newZoom);
    });

    // Pan with middle mouse button or Ctrl + left mouse
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let panOffset = { x: 0, y: 0 };

    canvasArea.addEventListener("mousedown", (e) => {
      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        // Middle mouse or Ctrl + left mouse
        e.preventDefault();
        isPanning = true;
        panStart.x = e.clientX - panOffset.x;
        panStart.y = e.clientY - panOffset.y;
        canvasArea.style.cursor = "grabbing";
      }
    });

    canvasArea.addEventListener("mousemove", (e) => {
      if (isPanning) {
        e.preventDefault();
        panOffset.x = e.clientX - panStart.x;
        panOffset.y = e.clientY - panStart.y;
        this.updateCanvasTransform();
      }
    });

    canvasArea.addEventListener("mouseup", (e) => {
      if (isPanning) {
        isPanning = false;
        canvasArea.style.cursor = "default";
      }
    });

    // Store pan offset in state
    this.imageEditorState.pan = { x: 0, y: 0 };

    // Setup zoom control buttons
    this.setupZoomControls();
  }

  /**
   * Setup zoom control buttons
   */
  setupZoomControls() {
    // Zoom buttons
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    const zoomResetBtn = document.getElementById("zoom-reset");
    const zoomSlider = document.getElementById("zoom-slider");

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => this.zoomIn());
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => this.zoomOut());
    }

    if (zoomResetBtn) {
      zoomResetBtn.addEventListener("click", () => this.zoomReset());
    }

    if (zoomSlider) {
      zoomSlider.addEventListener("input", (e) => {
        this.setZoom(parseFloat(e.target.value));
      });
    }

    // Zoom preset buttons
    const presetButtons = ["zoom-25", "zoom-50", "zoom-100", "zoom-200"];
    const presetValues = [0.25, 0.5, 1, 2];

    presetButtons.forEach((buttonId, index) => {
      const button = document.getElementById(buttonId);
      if (button) {
        button.addEventListener("click", () => {
          this.setZoom(presetValues[index]);
        });
      }
    });
  }

  /**
   * Zoom in
   */
  zoomIn() {
    if (!this.imageEditorState.zoom) return;
    const newZoom = Math.min(
      this.imageEditorState.zoom.maxZoom,
      this.imageEditorState.zoom.level + 0.2
    );
    this.setZoom(newZoom);
  }

  /**
   * Zoom out
   */
  zoomOut() {
    if (!this.imageEditorState.zoom) return;
    const newZoom = Math.max(
      this.imageEditorState.zoom.minZoom,
      this.imageEditorState.zoom.level - 0.2
    );
    this.setZoom(newZoom);
  }

  /**
   * Reset zoom to 100%
   */
  zoomReset() {
    this.setZoom(1);
    // Reset pan as well
    if (this.imageEditorState.pan) {
      this.imageEditorState.pan = { x: 0, y: 0 };
      this.updateCanvasTransform();
    }
  }

  /**
   * Set zoom level
   */
  setZoom(level) {
    if (!this.imageEditorState.zoom) return;

    // Clamp zoom level
    level = Math.max(
      this.imageEditorState.zoom.minZoom,
      Math.min(this.imageEditorState.zoom.maxZoom, level)
    );

    this.imageEditorState.zoom.level = level;

    // Update UI
    const zoomSlider = document.getElementById("zoom-slider");
    const zoomValue = document.getElementById("zoom-value");

    if (zoomSlider) {
      zoomSlider.value = level;
    }

    if (zoomValue) {
      zoomValue.textContent = Math.round(level * 100) + "%";
    }

    // Update preset button states
    const presetButtons = ["zoom-25", "zoom-50", "zoom-100", "zoom-200"];
    const presetValues = [0.25, 0.5, 1, 2];

    presetButtons.forEach((buttonId, index) => {
      const button = document.getElementById(buttonId);
      if (button) {
        if (Math.abs(level - presetValues[index]) < 0.01) {
          button.classList.add("active");
        } else {
          button.classList.remove("active");
        }
      }
    });

    // Apply zoom transform
    this.updateCanvasTransform();
  }

  /**
   * Update canvas transform for zoom and pan
   */
  updateCanvasTransform() {
    const canvasContainer = document.getElementById("canvas-container");
    if (!canvasContainer || !this.imageEditorState) return;

    const zoom = this.imageEditorState.zoom?.level || 1;
    const pan = this.imageEditorState.pan || { x: 0, y: 0 };

    canvasContainer.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  }

  /**
   * Save current state to history
   */
  saveToHistory() {
    const canvas = this.imageEditorState.canvas;

    try {
      const imageData = canvas.toDataURL();

      // Remove future history if we're not at the end
      this.imageEditorState.history = this.imageEditorState.history.slice(
        0,
        this.imageEditorState.currentHistoryIndex + 1
      );

      // Add new state
      this.imageEditorState.history.push({
        imageData: imageData,
        filters: { ...this.imageEditorState.filters },
        transforms: { ...this.imageEditorState.transforms },
      });

      this.imageEditorState.currentHistoryIndex =
        this.imageEditorState.history.length - 1;

      // Limit history size
      if (this.imageEditorState.history.length > 20) {
        this.imageEditorState.history.shift();
        this.imageEditorState.currentHistoryIndex--;
      }
    } catch (error) {
      console.warn("Cannot save history due to tainted canvas:", error);
      // For tainted canvas, we skip history but continue operation
    }
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = imageEditor;
} else if (typeof window !== "undefined") {
  window.imageEditor = imageEditor;
}
export { imageEditor };
