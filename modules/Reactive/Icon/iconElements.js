/**
 * iconElements.js - Icon Elements Management
 * Provides complete icon functionality including insertion, replacement, and modal management
 * Supports Material Icons and Material Symbols fonts
 */

class iconElements {
  constructor(elementsInstance) {
    // Reference to parent Elements class
    this.elementsInstance = elementsInstance;
    this.interactions = elementsInstance; // For backward compatibility

    // Get configuration from elementsInstance
    this.config = elementsInstance.config;

    // Initialize icon element tracking
    this.iconReplacementTarget = null;

    // Get nexaUI reference
    this.nexaUI = elementsInstance.nexaUI;

    // Get target element reference from elementsInstance
    this.targetElement = null;
  }

  /**
   * Get menu structure for icon elements
   */
  struktur() {
    return [
      {
        id: "icon-elements",
        icon: "smile",
        text: "Icon Elements",
        action: "iconElements",
        showCondition: "hasNoSelectedText",
      },
    ];
  }

  /**
   * Initialize Feather icons safely
   */
  initializeFeatherIcons() {
    try {
      if (typeof feather !== "undefined" && feather && feather.replace) {
        // Validate all icons before replacing
        const iconElements = document.querySelectorAll("[data-feather]");
        iconElements.forEach((element) => {
          const iconName = element.getAttribute("data-feather");
          // Check if icon exists in feather.icons
          if (feather.icons && !feather.icons[iconName]) {
            element.setAttribute("data-feather", "alert-circle");
          }
        });

        feather.replace();
      }
    } catch (error) {
      // Try to identify which icon is causing the problem
      const iconElements = document.querySelectorAll("[data-feather]");
      iconElements.forEach((element, index) => {
        const iconName = element.getAttribute("data-feather");
      });
    }
  }

  /**
   * Context menu: Show icon elements modal
   */
  contextIconElements() {
    try {
      if (!this.targetElement) {
        return { success: false, error: "No target element" };
      }

      const cursorSaved = this.saveCursorPosition();

      this.createIconElementsModal();
      return { success: true, message: "Icon elements modal opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Save cursor position (placeholder - should be implemented by parent class)
   */
  saveCursorPosition() {
    // This method should be implemented by the parent Interactions class
    if (this.interactions && this.interactions.saveCursorPosition) {
      return this.interactions.saveCursorPosition();
    }
    return null;
  }

  /**
   * Open Icon Elements modal for replacing a specific icon
   */
  openIconElementsForReplacement(targetIcon, containerElement) {
    try {
      // Store references to the target elements
      this.iconReplacementTarget = {
        iconElement: targetIcon,
        containerElement: containerElement,
        originalIcon: targetIcon.textContent,
      };

      // Create and show the Icon Elements modal
      this.createIconElementsModalForReplacement();

      return { success: true, message: "Icon replacement modal opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Replace the feature icon with a new one
   */
  replaceFeatureIcon(newIconName) {
    try {
      if (!this.iconReplacementTarget) {
        return;
      }

      const { iconElement, containerElement } = this.iconReplacementTarget;

      // Update the icon
      iconElement.textContent = newIconName;

      // Add brief highlight effect
      const originalBackground = containerElement.style.background;
      containerElement.style.background = "#10b981";
      containerElement.style.transform = "scale(1.1)";

      setTimeout(() => {
        containerElement.style.background = originalBackground;
        containerElement.style.transform = "scale(1)";
      }, 300);

      // Clear the target reference
      this.iconReplacementTarget = null;
    } catch (error) {}
  }

  /**
   * Load Material Symbols font if not already loaded
   */
  loadMaterialSymbolsFont() {
    // Check if font is already loaded
    const existingLink = document.querySelector(
      'link[href*="material-symbols"]'
    );
    if (existingLink) return;

    // Add Material Symbols font
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0";
    document.head.appendChild(link);
  }

  /**
   * Load Material Icons font if not already loaded
   */
  loadMaterialIconsFont() {
    // Check if font is already loaded
    const existingLink = document.querySelector(
      'link[href*="material-icons"], link[href*="Material+Icons"]'
    );
    if (existingLink) return;

    // Add Material Icons font
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    document.head.appendChild(link);
  }

  /**
   * Get Material Icons data
   * Comprehensive list of Material Icons and Material Symbols
   */
  getMaterialIconsData() {
    return [
      // Popular Feature Icons
      "star",
      "auto_awesome",
      "diamond",
      "bolt",
      "check_circle",
      "assignment",
      "schedule",
      "image",
      "view_stream",
      "favorite",
      "lightbulb",
      "security",
      "speed",
      "trending_up",
      "analytics",
      "psychology",
      "emoji_objects",
      "workspace_premium",
      "verified",
      "extension",
      "settings",
      "build",
      "code",
      "design_services",

      // Actions
      "home",
      "search",
      "menu",
      "close",
      "add",
      "remove",
      "edit",
      "delete",
      "save",
      "share",
      "bookmark",
      "thumb_up",
      "thumb_down",
      "visibility",
      "help",
      "info",
      "warning",
      "error",
      "cancel",
      "refresh",
      "sync",

      // Navigation
      "arrow_back",
      "arrow_forward",
      "arrow_upward",
      "arrow_downward",
      "expand_more",
      "expand_less",
      "chevron_left",
      "chevron_right",
      "keyboard_arrow_up",
      "keyboard_arrow_down",
      "first_page",
      "last_page",
      "fullscreen",
      "fullscreen_exit",
      "zoom_in",
      "zoom_out",

      // Communication
      "email",
      "phone",
      "chat",
      "message",
      "send",
      "reply",
      "forward",
      "call",
      "videocam",
      "notifications",
      "campaign",
      "announcement",
      "contact_mail",
      "contact_phone",

      // Content
      "content_copy",
      "content_cut",
      "content_paste",
      "undo",
      "redo",
      "select_all",
      "text_format",
      "format_bold",
      "format_italic",
      "format_underlined",
      "format_color_text",
      "insert_link",
      "photo",
      "video_library",
      "music_note",
      "file_download",
      "file_upload",

      // Device
      "computer",
      "phone_android",
      "phone_iphone",
      "tablet",
      "watch",
      "tv",
      "speaker",
      "headset",
      "mouse",
      "keyboard",
      "camera",
      "print",
      "scanner",
      "wifi",
      "bluetooth",

      // Places
      "place",
      "map",
      "directions",
      "location_on",
      "location_off",
      "my_location",
      "navigation",
      "store",
      "restaurant",
      "hotel",
      "local_airport",
      "local_hospital",
      "school",

      // Social
      "person",
      "people",
      "group",
      "account_circle",
      "face",
      "mood",
      "public",
      "language",
      "accessibility",

      // Shopping
      "shopping_cart",
      "shopping_bag",
      "local_offer",
      "redeem",
      "card_giftcard",
      "payment",
      "credit_card",
      "account_balance",
      "monetization_on",
      "attach_money",

      // Weather
      "wb_sunny",
      "wb_cloudy",
      "cloud",
      "umbrella",
      "ac_unit",
      "beach_access",
      "landscape",
      "nature",
      "park",
      "eco",
      "recycling",

      // Business
      "business",
      "work",
      "briefcase",
      "folder",
      "folder_open",
      "description",
      "event",
      "today",
      "date_range",
      "access_time",
      "timer",
      "hourglass_empty",

      // Technology
      "developer_mode",
      "bug_report",
      "widgets",
      "data_usage",
      "storage",
      "cloud",
      "backup",
      "download",
      "upload",
      "sync_alt",
    ];
  }

  /**
   * Create icon elements modal specifically for replacement
   */
  createIconElementsModalForReplacement() {
    // Remove existing modal
    const existingModal = document.getElementById(
      "nexa-icon-replacement-modal"
    );
    if (existingModal) {
      existingModal.remove();
    }

    // Load both Material Symbols and Material Icons fonts
    this.loadMaterialSymbolsFont();
    this.loadMaterialIconsFont();

    const overlay = document.createElement("div");
    overlay.id = "nexa-icon-replacement-modal";
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center; justify-content: center;
      z-index: 10000; animation: fadeIn 0.3s ease;
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
      background: white; border-radius: 12px; padding: 0;
      max-width: 90vw; max-height: 90vh; width: 800px; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;

    // Create modal content
    modal.innerHTML = `
      <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">Replace Icon - Choose New Icon</h3>
        <button id="close-replacement-modal" class="btn" style="background: none; border: none; font-size: 24px; color: #6b7280; cursor: pointer;" aria-label="Close modal">
          <i class="material-symbols-outlined">close</i>
        </button>
      </div>
      <div style="padding: 20px 24px; max-height: 60vh; overflow-y: auto;">
        <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
          Choose from these popular icons:<br>
          <small style="color: #4f46e5; font-weight: 500;">Using Material Icons</small>
        </p>
        <div id="replacement-icons-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 12px; margin-top: 16px;"></div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Populate icons
    const iconsGrid = modal.querySelector("#replacement-icons-grid");
    const popularIcons = this.getMaterialIconsData();

    popularIcons.forEach((iconName) => {
      const iconButton = document.createElement("button");
      iconButton.style.cssText = `
        width: 60px; height: 60px; border: 2px solid #e5e7eb; border-radius: 8px;
        background: white; display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.2s ease;
      `;

      const icon = document.createElement("span");
      const targetIconClass =
        this.iconReplacementTarget?.iconElement?.className || "material-icons";
      icon.className = targetIconClass.includes("material-symbols-outlined")
        ? "material-symbols-outlined"
        : "material-icons";
      icon.textContent = iconName;
      icon.style.cssText = "font-size: 24px; color: #4f46e5;";

      iconButton.appendChild(icon);
      iconButton.addEventListener("click", () => {
        this.replaceFeatureIcon(iconName);
        overlay.remove();
      });

      iconsGrid.appendChild(iconButton);
    });

    // Event handlers
    modal
      .querySelector("#close-replacement-modal")
      .addEventListener("click", () => overlay.remove());
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    const style = document.createElement("style");
    style.textContent = `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
    document.head.appendChild(style);
  }

  /**
   * Create main icon elements modal
   */
  createIconElementsModal() {
    // Remove existing modal
    const existingModal = document.getElementById("nexa-icon-elements-modal");
    if (existingModal) {
      existingModal.remove();
    }

    this.loadMaterialSymbolsFont();

    const overlay = document.createElement("div");
    overlay.id = "nexa-icon-elements-modal";
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
    `;

    const modal = document.createElement("div");
    modal.style.cssText = `
      background: white; border-radius: 12px; padding: 0;
      max-width: 800px; width: 90vw; max-height: 90vh; overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    `;

    // Create modal content with simplified version
    modal.innerHTML = `
      <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">Choose Icon</h3>
        <button id="close-icon-modal" class="btn" style="background: none; border: none; font-size: 24px; color: #6b7280; cursor: pointer;" aria-label="Close modal">
          <i class="material-symbols-outlined">close</i>
        </button>
      </div>
      <div style="padding: 20px 24px;">
        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label for="icon-search">Search Icons</label></dt>
            <dd class="form-group-body">
              <input type="text" id="icon-search" placeholder="Search icons..." class="form-control input-block">
            </dd>
          </dl>
        </div>

        <div class="nx-row" style="margin-bottom: 16px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
          <div class="nx-col-6">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="icon-color-text">Color</label></dt>
                <dd class="form-group-body">
                  <div class="input-group">
                    <input type="color" id="icon-color-picker" value="#4f46e5" class="form-control" style="width: 56px; padding: 4px; flex: 0 0 auto;">
                    <input type="text" id="icon-color-text" class="form-control" value="#4f46e5" placeholder="Color Code">
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          <div class="nx-col-6">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="simple-icon-size">Size: <span id="simple-size-value">24px</span></label></dt>
                <dd class="form-group-body">
                  <input type="range" id="simple-icon-size" class="form-control" min="16" max="48" value="24" oninput="updateSimpleSizeValue(this.value)" />
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div id="icons-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(50px, 1fr)); gap: 8px; max-height: 300px; overflow-y: auto; margin-bottom: 16px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;"></div>

        <div style="display: flex; justify-content: space-between;">
          <button id="cancel-icon-selection" class="btn">Cancel</button>
          <button id="insert-selected-icon" class="btn btn-primary">Insert Icon</button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    this.setupIconElementsModalEvents(overlay);
  }

  /**
   * Setup modal event handlers (simplified version)
   */
  setupIconElementsModalEvents(overlay) {
    const iconsGrid = overlay.querySelector("#icons-grid");
    const searchInput = overlay.querySelector("#icon-search");
    const colorPicker = overlay.querySelector("#icon-color-picker");
    const sizeSelect = overlay.querySelector("#icon-size-select");
    let selectedIcon = "star";
    let selectedColor = "#4f46e5";
    let selectedSize = 24;

    // Populate icons
    const materialIcons = this.getMaterialIconsData();
    materialIcons.forEach((iconName) => {
      const iconItem = document.createElement("div");
      iconItem.className = "icon-item";
      iconItem.dataset.icon = iconName;
      iconItem.style.cssText = `
        display: flex; align-items: center; justify-content: center;
        width: 50px; height: 50px; border: 1px solid transparent; border-radius: 6px;
        background: #f8f9fa; cursor: pointer; transition: all 0.2s;
      `;

      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined";
      icon.textContent = iconName;
      icon.style.cssText = "font-size: 20px; color: #4f46e5;";

      iconItem.appendChild(icon);
      iconItem.addEventListener("click", () => {
        selectedIcon = iconName;
        overlay
          .querySelectorAll(".icon-item")
          .forEach((i) => (i.style.backgroundColor = "#f8f9fa"));
        iconItem.style.backgroundColor = "#eef2ff";
      });

      iconsGrid.appendChild(iconItem);
    });

    // Event handlers
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        overlay.querySelectorAll(".icon-item").forEach((item) => {
          const iconName = item.dataset.icon.toLowerCase();
          item.style.display = iconName.includes(searchTerm) ? "flex" : "none";
        });
      });
    }

    // Color picker and text sync for simple modal
    const simpleColorPicker = overlay.querySelector("#icon-color-picker");
    const simpleColorText = overlay.querySelector("#icon-color-text");

    if (simpleColorPicker && simpleColorText) {
      simpleColorPicker.addEventListener("input", (e) => {
        selectedColor = e.target.value;
        simpleColorText.value = e.target.value;
      });

      simpleColorText.addEventListener("input", (e) => {
        const colorValue = e.target.value;
        if (
          /^#[0-9A-F]{6}$/i.test(colorValue) ||
          /^#[0-9A-F]{3}$/i.test(colorValue)
        ) {
          selectedColor = colorValue;
          simpleColorPicker.value = colorValue;
        }
      });
    }

    // Range slider for simple modal
    const simpleRangeSlider = overlay.querySelector("#simple-icon-size");
    if (simpleRangeSlider) {
      simpleRangeSlider.addEventListener("input", (e) => {
        selectedSize = parseInt(e.target.value);
        window.updateSimpleSizeValue(e.target.value);
      });
    }

    if (sizeSelect)
      sizeSelect.addEventListener("change", (e) => {
        selectedSize = parseInt(e.target.value);
      });

    // Close and action buttons
    const closeModal = () => overlay.remove();
    overlay
      .querySelector("#close-icon-modal")
      .addEventListener("click", closeModal);
    overlay
      .querySelector("#cancel-icon-selection")
      .addEventListener("click", closeModal);
    overlay
      .querySelector("#insert-selected-icon")
      .addEventListener("click", () => {
        this.insertIconAtPosition(selectedIcon, selectedColor, selectedSize);
        closeModal();
      });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  /**
   * Insert icon at position (simplified version)
   */
  insertIconAtPosition(iconName, color = "#4f46e5", size = 24) {
    try {
      const iconElement = document.createElement("span");
      iconElement.className = "material-symbols-outlined nexa-inserted-icon";
      iconElement.textContent = iconName;
      iconElement.style.cssText = `
        font-family: 'Material Symbols Outlined'; font-size: ${size}px; color: ${color};
        display: inline-block; margin: 0 0.25rem; vertical-align: middle;
        cursor: pointer; transition: all 0.2s;
      `;

      // Try to insert at target element or body
      if (this.targetElement) {
        this.targetElement.appendChild(iconElement);
      } else {
        document.body.appendChild(iconElement);
      }

      return {
        success: true,
        message: `Icon "${iconName}" inserted successfully`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Main icon elements method for Elements class integration
   */
  elementsIcon(data = null) {
    console.log("⭐ Icon Elements action triggered");
    console.log("🎯 Target Element:", data?.targetElement);

    if (!data?.targetElement) {
      console.warn("No target element provided for icon integration");
      return;
    }

    // Store reference to current target element
    this.elementsInstance.currentTargetElement = data.targetElement;
    this.targetElement = data.targetElement;

    console.log("💾 Stored target element reference for icon integration");

    // Use consistent modal ID instead of timestamp-based ID to prevent multiple modals
    const targetId =
      data.targetId || data.targetElement.id || data.targetElement.tagName;
    const modalId = `iconElementsModal_${targetId}`; // Removed Date.now() for consistency
    console.log("🆔 Using consistent modal ID:", modalId);

    // Clean up any existing modals with same ID first
    this.cleanupExistingModal(modalId);

    // Generate icon selection modal using the enhanced version
    const modalConfig = this.generateIconModalForElements(targetId, modalId);
    console.log(
      "🎭 Generated icon modal config with ID:",
      modalConfig.elementById
    );

    // Setup global functions setiap kali modal akan dibuka
    this.addGlobalIconFunctions();

    // Setup event listener untuk modal open (untuk reopen cases)
    this.setupModalOpenListener(modalConfig.elementById);

    // Open modal using NexaUI standard method
    this.elementsInstance.nexaUI.nexaModal.open(modalConfig.elementById);

    // Initialize modal interactions after modal is opened with longer delay
    setTimeout(() => {
      this.initializeIconModalForElements(modalConfig.elementById);
    }, 150);

    // Additional strong fallback to ensure icons always load - multiple attempts
    const fallbackAttempts = [300, 600, 1000];
    fallbackAttempts.forEach((delay, index) => {
      setTimeout(() => {
        const iconGrid = document.getElementById("iconGrid");
        if (iconGrid) {
          console.log(
            `🔄 Fallback attempt ${index + 1} - Grid has`,
            iconGrid.children.length,
            "icons"
          );
          if (iconGrid.children.length === 0) {
            console.log(
              `🚨 Icons missing on attempt ${index + 1}! Force reload...`
            );
            this.manualLoadIcons(iconGrid);
          }
        }
      }, delay);
    });
  }

  /**
   * Clean up existing modal to prevent conflicts
   */
  cleanupExistingModal(modalId) {
    console.log("🧹 Cleaning up existing modal:", modalId);

    // Stop and remove existing observer
    const existingObserver = window[`modalObserver_${modalId}`];
    if (existingObserver) {
      existingObserver.disconnect();
      delete window[`modalObserver_${modalId}`];
      console.log("🛑 Disconnected existing observer for:", modalId);
    }

    // Remove existing modal from DOM if it exists
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
      console.log("🗑️ Removed existing modal from DOM:", modalId);
    }

    // Clear any iconGrid elements that might be floating
    const orphanIconGrids = document.querySelectorAll('[id="iconGrid"]');
    orphanIconGrids.forEach((grid, index) => {
      if (!grid.closest(`#${modalId}`)) {
        console.log(`🧹 Removing orphan iconGrid ${index + 1}`);
        grid.remove();
      }
    });
  }

  /**
   * Generate icon selection modal configuration for Elements class - NexaUI Standard
   */
  generateIconModalForElements(targetId, modalId = null) {
    // Use provided modalId or generate consistent one (without timestamp)
    const finalModalId = modalId || `iconElementsModal_${targetId}`;

    // Create modal using NexaUI standard format
    this.elementsInstance.nexaUI.modalHTML({
      elementById: finalModalId,
      styleClass: "w-700px",
      label: "Icon Elements",
      onclick: {
        title: "Apply Icon",
        titleClass: "nx-btn-primary",
        cancel: "Cancel",
        cancelClass: "nx-btn-secondary",
        send: "processElementsIcon",
      },
      content: this.generateIconFormForElements(),
    });

    console.log("✅ Modal HTML created with ID:", finalModalId);

    return {
      elementById: finalModalId,
      modalCreated: true,
    };
  }

  /**
   * Generate icon selection form HTML for Elements class - NexaUI Standard
   */
  generateIconFormForElements() {
    return `
      <div>
        <!-- Search Bar -->
        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label for="iconSearch">Search Icons</label></dt>
            <dd class="form-group-body">
              <input type="text"
                     id="iconSearch"
                     name="iconSearch"
                     class="form-control input-block"
                     onkeyup="filterIcons(this.value)">
            </dd>
          </dl>
        </div>

        <!-- Icon Grid Container -->
        <div class="icon-grid-container">
          <div class="icon-grid" id="iconGrid">
            <!-- Icons will be populated by initializeIconModalForElements -->
          </div>
        </div>

        <!-- Selected Icon Preview -->
        <div class="selected-icon-preview">
          <label class="text-secondary">Selected Icon</label>
          <div class="preview-container">
            <div class="icon-preview" id="iconPreview">
              <span class="placeholder">No icon selected</span>
            </div>
            <div class="preview-details">
              <input type="hidden" id="selectedIcon" name="selectedIcon" />
              <span class="icon-name" id="iconName">-</span>
            </div>
          </div>
        </div>

        <!-- Icon Styling Options -->
        <label class="text-secondary" style="display: block; margin: 1.5rem 0 1rem;">Icon Styling</label>

        <div class="nx-row">
          <div class="nx-col-6">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="iconSize">Icon Size: <span id="sizeValue">24px</span></label></dt>
                <dd class="form-group-body">
                  <input
                    type="range"
                    id="iconSize"
                    name="iconSize"
                    class="form-control"
                    min="12"
                    max="72"
                    value="24"
                    oninput="updateSizeValue(this.value)" />
                </dd>
              </dl>
            </div>
          </div>

          <div class="nx-col-6">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="iconColorText">Icon Color</label></dt>
                <dd class="form-group-body">
                  <div class="input-group">
                    <input type="color"
                           id="iconColor"
                           name="iconColor"
                           class="form-control"
                           value="#4f46e5"
                           onchange="syncColorInputs(this.value)"
                           style="width: 56px; padding: 4px; flex: 0 0 auto;">
                    <input type="text"
                           id="iconColorText"
                           name="iconColorText"
                           class="form-control"
                           value="#4f46e5"
                           placeholder="Color Code"
                           onchange="syncColorInputs(this.value)">
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- Position Options -->
        <label class="text-secondary" style="display: block; margin: 1rem 0;">Icon Position</label>
        <div class="radio-group">
          <input class="radio-input" id="position-prepend" type="radio" name="iconPosition" value="prepend" checked>
          <label class="radio-label" for="position-prepend">Before text</label>
          <input class="radio-input" id="position-append" type="radio" name="iconPosition" value="append">
          <label class="radio-label" for="position-append">After text</label>
          <input class="radio-input" id="position-replace" type="radio" name="iconPosition" value="replace">
          <label class="radio-label" for="position-replace">Replace content</label>
        </div>
      </div>

      ${this.generateIconModalStylesForElements()}
    `;
  }

  /**
   * Generate CSS styles for Elements icon modal
   */
  generateIconModalStylesForElements() {
    return `
      <style>
        /* Icon Grid Container */
        .icon-grid-container {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 1rem;
          background: #f8f9fa;
        }

        .icon-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          gap: 0.5rem;
        }

        .icon-item {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid transparent;
          border-radius: 8px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 1.5rem;
        }

        .icon-item:hover {
          border-color: #4f46e5;
          background: #eef2ff;
        }

        .icon-item.selected {
          border-color: #4f46e5 !important;
          background: #eef2ff !important;
          color: #4f46e5 !important;
        }

        .selected-icon-preview {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 1rem;
          background: #f8f9fa;
          margin-top: 1rem;
        }

        .preview-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }

        .icon-preview {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          background: #ffffff;
          font-size: 2rem;
        }

        .icon-preview .placeholder {
          font-size: 0.8rem;
          color: #6b7280;
          text-align: center;
        }

        .preview-details {
          flex: 1;
        }

        .icon-name {
          font-weight: 600;
          color: #374151;
          font-size: 1rem;
          margin-top: 0.25rem;
        }

        
      </style>
    `;
  }

  /**
   * Setup modal open listener untuk handle reopen cases
   */
  setupModalOpenListener(modalId) {
    console.log("👂 Setting up modal listener for:", modalId);

    // Stop existing observer to prevent duplicates
    const existingObserver = window[`modalObserver_${modalId}`];
    if (existingObserver) {
      existingObserver.disconnect();
      console.log("🛑 Disconnected existing observer for:", modalId);
    }

    // Create MutationObserver for modal visibility changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          const addedNodes = Array.from(mutation.addedNodes);
          addedNodes.forEach((node) => {
            if (
              node.id === modalId ||
              (node.querySelector && node.querySelector(`#${modalId}`))
            ) {
              console.log("📺 Modal visible detected:", modalId);
              setTimeout(() => {
                // Target specific modal's iconGrid to avoid conflicts
                const modal = document.getElementById(modalId);
                const iconGrid = modal
                  ? modal.querySelector("#iconGrid")
                  : null;
                if (iconGrid) {
                  console.log(
                    "🔄 Auto-reloading icons for visible modal",
                    modalId
                  );
                  console.log(
                    "📊 Current icon count:",
                    iconGrid.children.length
                  );
                  this.manualLoadIcons(iconGrid);
                } else {
                  console.warn("⚠️ IconGrid not found in modal:", modalId);
                }
              }, 100);
            }
          });
        }

        // Also check for attribute changes (like display:block)
        if (mutation.type === "attributes" && mutation.target.id === modalId) {
          const modal = mutation.target;
          if (modal.style.display !== "none" && modal.offsetParent !== null) {
            console.log("📺 Modal shown via attribute change:", modalId);
            setTimeout(() => {
              // Target specific modal's iconGrid
              const iconGrid = modal.querySelector("#iconGrid");
              if (iconGrid) {
                console.log(
                  "📊 Icons in grid after show:",
                  iconGrid.children.length
                );
                if (iconGrid.children.length === 0) {
                  console.log("🔄 Reloading icons after modal show");
                  this.manualLoadIcons(iconGrid);
                }
              } else {
                console.warn(
                  "⚠️ IconGrid not found after modal show:",
                  modalId
                );
              }
            }, 100);
          }
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Store observer reference
    window[`modalObserver_${modalId}`] = observer;

    console.log("✅ Modal visibility observer setup completed for:", modalId);
  }

  /**
   * Add global functions for icon modal interaction - NexaUI Standard
   */
  addGlobalIconFunctions() {
    // Store reference to this instance
    const iconElementsInstance = this;

    // Global function for icon selection
    window.selectIconElement = (iconName, element) => {
      console.log("🎯 Icon selection triggered:", iconName);

      // Find the modal that contains this icon element
      const modal = element.closest('[id*="iconElementsModal"]');
      if (!modal) {
        console.error("❌ Could not find modal container for icon element");
        return;
      }

      console.log("📋 Found modal container:", modal.id);

      // Remove previous selection within this modal only
      modal.querySelectorAll(".icon-item.selected").forEach((item) => {
        item.classList.remove("selected");
      });

      // Add selection to clicked item
      element.classList.add("selected");
      console.log("✅ Added selection class to icon element");

      // Update form inputs - search within the modal
      const selectedIconInput = modal.querySelector("#selectedIcon");
      const iconNameSpan = modal.querySelector("#iconName");
      const iconPreview = modal.querySelector("#iconPreview");

      console.log("🔍 Form elements found:", {
        selectedIconInput: !!selectedIconInput,
        iconNameSpan: !!iconNameSpan,
        iconPreview: !!iconPreview,
      });

      if (selectedIconInput) {
        selectedIconInput.value = iconName;
        selectedIconInput.dispatchEvent(new Event("change", { bubbles: true }));
        console.log("📝 Updated selectedIcon input:", iconName);
      } else {
        console.warn("⚠️ selectedIcon input not found");
      }

      if (iconNameSpan) {
        iconNameSpan.textContent = iconName;
        console.log("📝 Updated iconName span:", iconName);
      } else {
        console.warn("⚠️ iconName span not found");
      }

      if (iconPreview) {
        iconPreview.innerHTML =
          '<i class="material-symbols-outlined">' + iconName + "</i>";
        console.log("🖼️ Updated iconPreview with icon HTML");

        // Update preview styling immediately
        iconElementsInstance.updateIconPreviewInModal(modal);
      } else {
        console.warn("⚠️ iconPreview element not found");
      }

      console.log("✅ Icon selection completed:", iconName);
    };

    // Global function for filtering icons
    window.filterIcons = (searchTerm) => {
      // Find the active modal to filter icons within that specific modal
      let activeModal = document.querySelector(
        '[id*="iconElementsModal"][style*="block"], [id*="iconElementsModal"]:not([style*="none"])'
      );

      // Fallback: find any visible modal with iconElementsModal in ID
      if (!activeModal) {
        const allModals = document.querySelectorAll(
          '[id*="iconElementsModal"]'
        );
        for (const modal of allModals) {
          if (modal.offsetParent !== null || modal.style.display !== "none") {
            activeModal = modal;
            break;
          }
        }
      }

      if (activeModal) {
        const iconItems = activeModal.querySelectorAll(".icon-item");
        console.log(
          `🔍 Filtering ${iconItems.length} icons with term: "${searchTerm}" in modal: ${activeModal.id}`
        );

        iconItems.forEach((item) => {
          const iconName = item.dataset.icon.toLowerCase();
          if (iconName.includes(searchTerm.toLowerCase())) {
            item.style.display = "flex";
          } else {
            item.style.display = "none";
          }
        });
      } else {
        console.warn("⚠️ No active modal found for filtering icons");
      }
    };

    // Global function for size value update
    window.updateSizeValue = (value) => {
      // Find the active modal
      const activeModal = document.querySelector(
        '[id*="iconElementsModal"][style*="block"], [id*="iconElementsModal"]:not([style*="none"])'
      );
      if (activeModal) {
        const sizeValue = activeModal.querySelector("#sizeValue");
        if (sizeValue) {
          sizeValue.textContent = value + "px";
          console.log("📏 Updated size value:", value + "px");
        }
        iconElementsInstance.updateIconPreviewInModal(activeModal);
      } else {
        console.warn("⚠️ No active modal found for updating size value");
      }
    };

    // Global function for simple modal size update
    window.updateSimpleSizeValue = (value) => {
      const sizeValue = document.querySelector("#simple-size-value");
      if (sizeValue) {
        sizeValue.textContent = value + "px";
        console.log("📏 Updated simple size value:", value + "px");
      }
    };

    // Global function for color sync
    window.syncColorInputs = (color) => {
      // Find the active modal
      const activeModal = document.querySelector(
        '[id*="iconElementsModal"][style*="block"], [id*="iconElementsModal"]:not([style*="none"])'
      );
      if (activeModal) {
        const colorPicker = activeModal.querySelector("#iconColor");
        const colorText = activeModal.querySelector("#iconColorText");

        // Also check for simple modal color inputs
        const simpleColorPicker = document.querySelector("#icon-color-picker");
        const simpleColorText = document.querySelector("#icon-color-text");

        console.log("🎨 Syncing color inputs:", color);
        if (colorPicker && colorText) {
          colorPicker.value = color;
          colorText.value = color;
          console.log("✅ Color inputs synced in main modal");
        }

        if (simpleColorPicker && simpleColorText) {
          simpleColorPicker.value = color;
          simpleColorText.value = color;
          console.log("✅ Color inputs synced in simple modal");
        }

        iconElementsInstance.updateIconPreviewInModal(activeModal);
      } else {
        console.warn("⚠️ No active modal found for syncing color inputs");
      }
    };

    // Global function for processing icon from modal (NexaUI modal callback)
    window.processElementsIcon = (modalId, data) => {
      console.log("🔄 Global processElementsIcon called with:", modalId, data);
      return iconElementsInstance.processElementsIcon(modalId, data);
    };
  }

  /**
   * Update icon preview with current styling
   */
  updateIconPreview() {
    const iconPreview = document.getElementById("iconPreview");
    const iconSize = document.getElementById("iconSize");
    const iconColor = document.getElementById("iconColor");

    if (iconPreview) {
      const iconElement = iconPreview.querySelector("i");
      if (iconElement) {
        const size = iconSize ? iconSize.value + "px" : "24px";
        const color = iconColor ? iconColor.value : "#4f46e5";

        iconElement.style.fontSize = size;
        iconElement.style.color = color;
      }
    }
  }

  /**
   * Update icon preview with current styling in specific modal
   */
  updateIconPreviewInModal(modal) {
    if (!modal) {
      console.warn("⚠️ No modal provided to updateIconPreviewInModal");
      return;
    }

    const iconPreview = modal.querySelector("#iconPreview");
    const iconSize = modal.querySelector("#iconSize");
    const iconColor = modal.querySelector("#iconColor");

    console.log("🎨 Updating icon preview in modal:", modal.id);
    console.log("🔍 Preview elements found:", {
      iconPreview: !!iconPreview,
      iconSize: !!iconSize,
      iconColor: !!iconColor,
    });

    if (iconPreview) {
      const iconElement = iconPreview.querySelector("i");
      if (iconElement) {
        const size = iconSize ? iconSize.value + "px" : "24px";
        const color = iconColor ? iconColor.value : "#4f46e5";

        iconElement.style.fontSize = size;
        iconElement.style.color = color;

        console.log("✅ Updated icon preview styling:", { size, color });
      } else {
        console.warn("⚠️ Icon element not found in preview");
      }
    } else {
      console.warn("⚠️ Icon preview element not found in modal");
    }
  }

  /**
   * Initialize icon modal interactions for Elements class - NexaUI Standard
   */
  initializeIconModalForElements(modalId) {
    console.log("🚀 Initializing icon modal interactions for:", modalId);

    // Enhanced icon loading with multiple attempts and better targeting
    const loadIconsWithRetry = (attempt = 1, maxAttempts = 5) => {
      console.log(`📋 Icon loading attempt ${attempt}/${maxAttempts}`);

      // Target the specific modal's iconGrid to avoid conflicts
      const modal = document.getElementById(modalId);
      if (!modal) {
        console.warn(`⚠️ Modal ${modalId} not found for attempt ${attempt}`);
        if (attempt < maxAttempts) {
          setTimeout(
            () => loadIconsWithRetry(attempt + 1, maxAttempts),
            100 * attempt
          );
        }
        return;
      }

      const iconGrid = modal.querySelector("#iconGrid");
      if (iconGrid) {
        console.log(
          `📊 Attempt ${attempt} - Found iconGrid with ${iconGrid.children.length} icons in modal ${modalId}`
        );

        // Always reload icons to ensure fresh content
        this.manualLoadIcons(iconGrid);

        // Verify loading was successful
        setTimeout(() => {
          if (iconGrid.children.length > 0) {
            console.log(
              `✅ Icons loaded successfully on attempt ${attempt}: ${iconGrid.children.length} icons`
            );
          } else if (attempt < maxAttempts) {
            console.log(
              `🔄 Icons still missing after attempt ${attempt}, retrying...`
            );
            setTimeout(() => loadIconsWithRetry(attempt + 1, maxAttempts), 200);
          }
        }, 50);
      } else {
        console.warn(
          `⚠️ IconGrid not found in modal ${modalId} on attempt ${attempt}`
        );
        if (attempt < maxAttempts) {
          setTimeout(
            () => loadIconsWithRetry(attempt + 1, maxAttempts),
            100 * attempt
          );
        }
      }
    };

    // Start icon loading with delay to ensure modal is ready
    setTimeout(() => loadIconsWithRetry(), 100);
  }

  /**
   * Manual icon loading - Always loads fresh icons
   */
  manualLoadIcons(iconGrid) {
    if (!iconGrid) {
      console.error("IconGrid not provided to manualLoadIcons");
      return;
    }

    console.log(
      "🔄 Loading icons to grid (clearing existing:",
      iconGrid.children.length,
      ")"
    );

    const materialIcons = [
      // Popular Feature Icons
      "star",
      "auto_awesome",
      "diamond",
      "bolt",
      "check_circle",
      "assignment",
      "schedule",
      "image",
      "view_stream",
      "favorite",
      "lightbulb",
      "security",
      "speed",
      "trending_up",
      "analytics",
      "psychology",
      "emoji_objects",
      "workspace_premium",
      "verified",
      "extension",
      "settings",
      "build",
      "code",
      "design_services",

      // Actions
      "home",
      "search",
      "menu",
      "close",
      "add",
      "remove",
      "edit",
      "delete",
      "save",
      "share",
      "bookmark",
      "thumb_up",
      "thumb_down",
      "visibility",
      "help",
      "info",
      "warning",
      "error",
      "cancel",
      "refresh",
      "sync",

      // Navigation
      "arrow_back",
      "arrow_forward",
      "arrow_upward",
      "arrow_downward",
      "expand_more",
      "expand_less",
      "chevron_left",
      "chevron_right",
      "keyboard_arrow_up",
      "keyboard_arrow_down",
      "first_page",
      "last_page",
      "fullscreen",
      "fullscreen_exit",
      "zoom_in",
      "zoom_out",

      // Communication
      "email",
      "phone",
      "chat",
      "message",
      "send",
      "reply",
      "forward",
      "call",
      "videocam",
      "notifications",
      "campaign",
      "announcement",
      "contact_mail",
      "contact_phone",
    ];

    // Always clear existing icons first
    iconGrid.innerHTML = "";
    console.log(
      "✅ Grid cleared, loading",
      materialIcons.length,
      "fresh icons..."
    );

    materialIcons.forEach((iconName) => {
      const iconItem = document.createElement("div");
      iconItem.className = "icon-item";
      iconItem.dataset.icon = iconName;
      iconItem.style.cssText =
        "aspect-ratio: 1;" +
        "display: flex;" +
        "align-items: center;" +
        "justify-content: center;" +
        "border: 2px solid transparent;" +
        "border-radius: 8px;" +
        "background: var(--nexa-bg-white, #fff);" +
        "cursor: pointer;" +
        "transition: all 0.2s ease;" +
        "font-size: 1.5rem;";

      const iconElement = document.createElement("i");
      iconElement.className = "material-symbols-outlined";
      iconElement.textContent = iconName;
      iconElement.style.color = "#4f46e5";

      iconItem.appendChild(iconElement);

      iconItem.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("🖱️ Icon clicked:", iconName);

        // Use global function for consistency
        if (window.selectIconElement) {
          console.log("✅ Calling selectIconElement for:", iconName);
          window.selectIconElement(iconName, iconItem);
        } else {
          console.error("❌ selectIconElement function not available globally");
        }
      });

      iconGrid.appendChild(iconItem);
    });

    console.log(
      "🎉 Loading complete:",
      iconGrid.children.length,
      "icons now in grid"
    );
    console.log("✅ Icon grid ready for interaction");
  }

  /**
   * Process icon application from modal for Elements class
   */
  processElementsIcon(modalId, data = null) {
    console.log("⭐ Processing Elements Icon:", modalId, data);

    try {
      // Check if we have target element to modify
      if (!this.elementsInstance.currentTargetElement) {
        console.error("❌ No target element available for icon integration");
        return;
      }

      // Extract form data
      const formData = this.elementsInstance.getFormData(modalId);
      console.log("📝 Extracted Icon Form Data:", formData);

      // Validate required data - NexaUI form validation pattern
      if (!formData.selectedIcon) {
        console.warn("⚠️ No icon selected");
        console.log(
          "💡 Please select an icon first by clicking on one from the grid"
        );
        console.log("🔍 Available form data:", Object.keys(formData));

        // Add NexaUI form error styling to icon grid container
        const iconGrid = document.getElementById("iconGrid");
        const iconGridContainer = iconGrid?.closest(".icon-grid-container");

        if (iconGridContainer) {
          // Add form-error class following NexaUI pattern
          iconGridContainer.classList.add("form-error");
          iconGridContainer.style.borderColor = "#ef4444";
          iconGridContainer.style.boxShadow =
            "0 0 0 3px rgba(239, 68, 68, 0.1)";

          // Add error message following NexaUI pattern
          let errorMessage = iconGridContainer.querySelector(".error-message");
          if (!errorMessage) {
            errorMessage = document.createElement("small");
            errorMessage.className = "error-message";
            errorMessage.style.cssText = `
              color: #ef4444;
              font-size: 0.875rem;
              margin-top: 0.5rem;
              display: block;
            `;
            iconGridContainer.parentNode.appendChild(errorMessage);
          }
          errorMessage.textContent =
            "Please select an icon from the grid above";

          // Remove error after timeout
          setTimeout(() => {
            iconGridContainer.classList.remove("form-error");
            iconGridContainer.style.borderColor = "#e1e5e9";
            iconGridContainer.style.boxShadow = "";
            if (errorMessage) {
              errorMessage.remove();
            }
          }, 3000);
        }

        // Don't close modal, let user select an icon
        return;
      }

      // Apply icon to the element
      this.applyIconToElementForElements(
        formData,
        this.elementsInstance.currentTargetElement
      );

      console.log("✅ Successfully applied icon to DOM element");

      // Show success feedback - NexaUI success pattern
      console.log('Icon "' + formData.selectedIcon + '" applied successfully!');

      // Add temporary visual indicator to the element - NexaUI success styling
      if (this.elementsInstance.currentTargetElement) {
        const targetElement = this.elementsInstance.currentTargetElement; // Store reference
        const originalOutline = targetElement.style.outline;
        const originalTransition = targetElement.style.transition;

        // Apply NexaUI success styling
        targetElement.style.outline = "2px solid #22c55e";
        targetElement.style.outlineOffset = "2px";
        targetElement.style.transition = "all 0.3s ease";
        targetElement.style.transform = "scale(1.02)";

        setTimeout(() => {
          if (targetElement && targetElement.style) {
            targetElement.style.outline = originalOutline || "";
            targetElement.style.outlineOffset = "";
            targetElement.style.transform = "scale(1)";
            targetElement.style.transition = originalTransition || "";
          }
        }, 2000);
      }

      // Close modal
      this.elementsInstance.nexaUI.nexaModal.close(modalId);

      // Clear reference after successful application
      this.elementsInstance.currentTargetElement = null;
      this.targetElement = null;
    } catch (error) {
      console.error("❌ Error processing icon application:", error);
      console.error("❌ Stack trace:", error.stack);

      // Log error for debugging
      console.log(
        "💡 Please check if target element is still available and icon is properly selected"
      );
    }
  }

  /**
   * Apply icon to the target element for Elements class
   */
  applyIconToElementForElements(formData, targetElement) {
    console.log("⭐ Applying icon to element:", targetElement.tagName);

    const icon = formData.selectedIcon;
    const position = formData.iconPosition || "prepend";
    const size = formData.iconSize || "24";
    const color = formData.iconColor || formData.iconColorText || "#4f46e5";

    console.log("🎨 Icon configuration:", {
      icon,
      position,
      size,
      color,
      targetElementId: targetElement.id || "no-id",
      targetElementClass: targetElement.className || "no-class",
    });

    // Generate icon HTML with better spacing
    let iconHTML = "";
    const spacing =
      position === "prepend"
        ? "margin-right: 0.5rem;"
        : position === "append"
        ? "margin-left: 0.5rem;"
        : "";

    iconHTML =
      '<i class="material-symbols-outlined" style="font-size: ' +
      size +
      "px; color: " +
      color +
      "; " +
      spacing +
      '">' +
      icon +
      "</i>";

    // Store original content for logging
    const originalContent = targetElement.innerHTML.substring(0, 50) + "...";

    // Apply icon based on position
    switch (position) {
      case "prepend":
        // Add icon before existing content
        targetElement.innerHTML = iconHTML + targetElement.innerHTML;
        console.log("Icon prepended to element");
        break;
      case "append":
        // Add icon after existing content
        targetElement.innerHTML = targetElement.innerHTML + iconHTML;
        console.log("Icon appended to element");
        break;
      case "replace":
        // Replace entire content with icon
        targetElement.innerHTML = iconHTML;
        console.log("Element content replaced with icon");
        break;
      default:
        // Default to prepend
        targetElement.innerHTML = iconHTML + targetElement.innerHTML;
        console.log("Icon prepended to element (default)");
    }

    console.log("Content change:", {
      original: originalContent,
      new: targetElement.innerHTML.substring(0, 50) + "...",
    });

    console.log("Icon applied successfully to element");
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = iconElements;
} else if (typeof window !== "undefined") {
  window.iconElements = iconElements;
}

export { iconElements };
