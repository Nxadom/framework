/**
 * NexaReactive.js - Lightweight Context Menu System
 * Provides right-click context menu functionality with content editing features
 * Includes text editing, formatting, and basic menu operations
 */

class Interactions {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      enabledIds: [],
      enabledClasses: [],
      enableGlobal: false,
      ...options,
    };

    this.nexaUI = NexaUI();

    // Initialize element interaction states
    this.sortableElements = new Set();
    this.draggableElements = new Set();
    this.resizableElements = new Set();
    this.boundaryElements = new Set();

    // Interaction settings
    this.hoverBoundariesEnabled = false;
    this.allBoundariesEnabled = false;
    this.boundaryStyle = "subtle";
    this.wheelZoomEnabled = false;
    this.currentZoomLevel = 100;
    this.isFullscreenActive = false;

    // Store original styles for fullscreen
    this.originalBodyStyles = null;
    this.originalContainerParent = null;
    this.originalContainerPosition = null;
    this.originalContainerStyles = null;
    this.fullscreenContainer = null;

    // Target element for context menu operations
    this.targetElement = null;
  }

  /**
   * Generate content editing menu structure
   */
  struktur() {
    // Use saved selection info since selection is lost when context menu appears
    const hasSelection = this.hasTextSelection;

    return [
      {
        id: "element-interactions",
        icon: "globe",
        text: "Interactions",
        showCondition: "hasNoSelectedText",
        submenu: [
          {
            id: "toggle-sortable",
            icon: "move",
            text: "Enable Sortable",
            action: "toggleSortable",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "toggle-draggable",
            icon: "move",
            text: "Enable Draggable",
            action: "toggleDraggable",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "toggle-resizable",
            icon: "maximize-2",
            text: "Enable Resizable",
            action: "toggleResizable",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "separator-zindex",
            type: "separator",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "to-front",
            icon: "chevrons-up",
            text: "To Front",
            action: "toFront",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "to-back",
            icon: "chevrons-down",
            text: "To Back",
            action: "toBack",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "separator-element-boundaries",
            type: "separator",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "element-boundaries",
            icon: "eye",
            text: "Boundaries",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "toggle-hover-boundaries",
                icon: "mouse-pointer",
                text: "Hover Highlighting",
                action: "toggleHoverBoundaries",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "separator-boundary-preview",
                type: "separator",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "toggle-all-boundaries",
                icon: "layers",
                text: "Show All Boundaries",
                action: "toggleAllBoundaries",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "separator-boundary-styles",
                type: "separator",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "boundary-style-subtle",
                icon: "circle",
                text: "Subtle Style",
                action: "setBoundaryStyleSubtle",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "boundary-style-visible",
                icon: "square",
                text: "Visible Style",
                action: "setBoundaryStyleVisible",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "boundary-style-highlight",
                icon: "octagon",
                text: "Highlight Style",
                action: "setBoundaryStyleHighlight",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
          {
            id: "separator-zoom-element",
            type: "separator",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "zoom-element",
            icon: "zoom-in",
            text: "Zoom Element",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "zoom-in-element",
                icon: "zoom-in",
                text: "Zoom In (125%)",
                action: "zoomInElement",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "zoom-out-element",
                icon: "zoom-out",
                text: "Zoom Out (75%)",
                action: "zoomOutElement",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "separator-zoom-presets",
                type: "separator",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "zoom-50-element",
                icon: "minimize-2",
                text: "50% Zoom",
                action: "zoomElementTo50",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "zoom-75-element",
                icon: "minus",
                text: "75% Zoom",
                action: "zoomElementTo75",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "zoom-100-element",
                icon: "square",
                text: "100% (Reset)",
                action: "zoomElementTo100",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "zoom-125-element",
                icon: "plus",
                text: "125% Zoom",
                action: "zoomElementTo125",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "zoom-150-element",
                icon: "maximize-2",
                text: "150% Zoom",
                action: "zoomElementTo150",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "separator-zoom-fit",
                type: "separator",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "zoom-fit-container",
                icon: "maximize",
                text: "Fit to Container",
                action: "zoomFitToContainer",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "separator-wheel-zoom",
                type: "separator",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "toggle-wheel-zoom",
                icon: "mouse-pointer",
                text: () =>
                  this.wheelZoomEnabled
                    ? "Disable Ctrl+Wheel Zoom"
                    : "Enable Ctrl+Wheel Zoom",
                action: "toggleWheelZoom",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
          {
            id: "separator-fullscreen-mode",
            type: "separator",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "fullscreen-mode",
            icon: "monitor",
            text: "Fullscreen Mode",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "fullscreen-percentage",
                icon: "maximize",
                text: "Percentage Modes",
                showCondition: "hasNoSelectedText",
                submenu: [
                  {
                    id: "fullscreen-50",
                    icon: "square",
                    text: "50% Fullscreen",
                    action: "fullscreenPercentage50",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-75",
                    icon: "square",
                    text: "75% Fullscreen",
                    action: "fullscreenPercentage75",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-90",
                    icon: "square",
                    text: "90% Fullscreen",
                    action: "fullscreenPercentage90",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-100",
                    icon: "maximize-2",
                    text: "100% Fullscreen",
                    action: "fullscreenPercentage100",
                    showCondition: "hasNoSelectedText",
                  },
                ],
              },
              {
                id: "fullscreen-desktop",
                icon: "monitor",
                text: "Desktop Modes",
                showCondition: "hasNoSelectedText",
                submenu: [
                  {
                    id: "fullscreen-desktop-hd",
                    icon: "monitor",
                    text: "HD (1366x768)",
                    action: "fullscreenDesktopHD",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-desktop-fhd",
                    icon: "monitor",
                    text: "Full HD (1920x1080)",
                    action: "fullscreenDesktopFHD",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-desktop-2k",
                    icon: "monitor",
                    text: "2K (2560x1440)",
                    action: "fullscreenDesktop2K",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-desktop-4k",
                    icon: "monitor",
                    text: "4K (3840x2160)",
                    action: "fullscreenDesktop4K",
                    showCondition: "hasNoSelectedText",
                  },
                ],
              },
              {
                id: "fullscreen-tablet",
                icon: "tablet",
                text: "Tablet Modes",
                showCondition: "hasNoSelectedText",
                submenu: [
                  {
                    id: "fullscreen-ipad",
                    icon: "tablet",
                    text: "iPad (768x1024)",
                    action: "fullscreenIPad",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-ipad-pro",
                    icon: "tablet",
                    text: "iPad Pro (1024x1366)",
                    action: "fullscreenIPadPro",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-android-tablet",
                    icon: "tablet",
                    text: "Android Tablet (800x1280)",
                    action: "fullscreenAndroidTablet",
                    showCondition: "hasNoSelectedText",
                  },
                ],
              },
              {
                id: "fullscreen-mobile",
                icon: "smartphone",
                text: "Mobile Modes",
                showCondition: "hasNoSelectedText",
                submenu: [
                  {
                    id: "fullscreen-iphone-se",
                    icon: "smartphone",
                    text: "iPhone SE (375x667)",
                    action: "fullscreenIPhoneSE",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-iphone-12",
                    icon: "smartphone",
                    text: "iPhone 12 (390x844)",
                    action: "fullscreenIPhone12",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-iphone-pro-max",
                    icon: "smartphone",
                    text: "iPhone Pro Max (428x926)",
                    action: "fullscreenIPhoneProMax",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "fullscreen-android-mobile",
                    icon: "smartphone",
                    text: "Android Mobile (360x640)",
                    action: "fullscreenAndroidMobile",
                    showCondition: "hasNoSelectedText",
                  },
                ],
              },
              {
                id: "separator-fullscreen-controls",
                type: "separator",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "exit-fullscreen",
                icon: "minimize-2",
                text: "Exit Fullscreen",
                action: "exitFullscreen",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
        ],
      },
    ];
  }

  /**
   * Context menu: Toggle sortable
   */
  contextToggleSortable() {
    try {
      console.log(
        "🎯 contextToggleSortable called with targetElement:",
        this.targetElement
      );

      if (!this.targetElement) {
        throw new Error("No target element selected");
      }

      // Find the appropriate container for sortable using the smart finder
      let sortableContainer = this.findSortableContainer(this.targetElement);
      console.log("🔍 Found sortable container:", sortableContainer);

      // Final check if container is suitable for sortable
      if (sortableContainer.children.length === 0) {
        throw new Error("No suitable container with children found");
      }

      const isCurrentlySortable = this.sortableElements.has(sortableContainer);
      console.log("📊 Is currently sortable:", isCurrentlySortable);

      if (isCurrentlySortable) {
        // Disable sortable
        console.log("🔽 Disabling sortable...");
        this.disableSortable(sortableContainer);
      } else {
        // Enable sortable
        console.log("🔼 Enabling sortable...");
        this.enableSortable(sortableContainer);
      }

      return {
        success: true,
        message: `Sortable ${isCurrentlySortable ? "disabled" : "enabled"}`,
        container: sortableContainer,
      };
    } catch (error) {
      console.error("❌ contextToggleSortable error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enable sortable functionality for an element
   */
  enableSortable(element) {
    console.log(
      "🔧 FIXED: Enabling sortable for container using jQuery UI:",
      element
    );
    console.log("📊 Container children count:", element.children.length);

    // Check if jQuery UI is available
    if (typeof $ === "undefined" || !$.ui || !$.ui.sortable) {
      console.error(
        "❌ jQuery UI Sortable not available! Please include jQuery UI library."
      );
      return { success: false, error: "jQuery UI Sortable not available" };
    }

    if (this.sortableElements.has(element)) {
      return; // Already enabled
    }

    // Add to tracking set
    this.sortableElements.add(element);

    // Add visual indicator
    element.style.position = element.style.position || "relative";
    element.setAttribute("data-nexa-sortable", "true");

    console.log("✅ Added data-nexa-sortable attribute to container");

    // Add sortable styling
    const originalBorder = element.style.border;
    const originalBackgroundColor = element.style.backgroundColor;

    // Apply visual indicators based on configuration
    const visualStyle = this.getVisualIndicatorStyle();
    element.style.border = visualStyle.border;
    element.style.backgroundColor = visualStyle.backgroundColor;

    // Store original styles
    element._nexaSortableOriginalStyles = {
      border: originalBorder,
      backgroundColor: originalBackgroundColor,
    };

    // Configure jQuery UI Sortable options
    const sortableOptions = {
      containment: element,
      cursor: "move",
      opacity: 0.8,
      tolerance: "pointer",
      placeholder: "sortable-placeholder",
      forcePlaceholderSize: true,
      helper: "original",
      scroll: true,
      distance: 5, // Prevents accidental sorting
      start: (event, ui) => {
        console.log("🟢 jQuery UI Sortable: Start event", ui.item[0]);
        ui.placeholder.css({
          height: ui.item.outerHeight(),
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          border: "2px dashed #007bff",
          margin: ui.item.css("margin"),
        });
      },
      sort: (event, ui) => {
        console.log("🔄 jQuery UI Sortable: Sort event", ui.item[0]);
      },
      stop: (event, ui) => {
        console.log("🛑 jQuery UI Sortable: Stop event", ui.item[0]);
        this.updateDragIndices(element);
      },
    };

    console.log("🎯 FIXED: Applying jQuery UI Sortable to container...");
    const $element = $(element);
    $element.sortable(sortableOptions);
    $element.addClass("nexa-sortable-jquery");

    // Add CSS styles if not already added
    this.addSortableStyles();

    // Update children styling for visual feedback
    this.updateChildrenSortableJQuery(element);

    console.log("✅ FIXED: jQuery UI Sortable enabled successfully!");
  }
  getVisualIndicatorStyle() {
    if (!this.config.showVisualIndicators) {
      return {
        outline: "none",
        border: "none",
        backgroundColor: "transparent",
      };
    }

    switch (this.config.visualIndicatorStyle) {
      case "none":
        return {
          outline: "none",
          border: "none",
          backgroundColor: "transparent",
        };

      case "subtle":
        return {
          outline: "none",
          border: "1px solid rgba(0, 123, 255, 0.2)",
          backgroundColor: "rgba(0, 123, 255, 0.02)",
        };

      case "visible":
        return {
          outline: "2px dashed #007bff",
          border: "2px dashed #007bff",
          backgroundColor: "rgba(0, 123, 255, 0.05)",
        };

      default:
        return {
          outline: "none",
          border: "1px solid rgba(0, 123, 255, 0.2)",
          backgroundColor: "rgba(0, 123, 255, 0.02)",
        };
    }
  }

  // REMOVED: updateChildrenSortable (HTML5 version) - no longer needed, using updateChildrenSortableJQuery

  /**
   * Update children for jQuery UI Sortable - NEW METHOD
   */
  updateChildrenSortableJQuery(element) {
    console.log(
      "👶 FIXED: Setting up children for jQuery UI sortable:",
      element.children.length,
      "children"
    );
    Array.from(element.children).forEach((child, index) => {
      // Set data attribute for identification
      child.setAttribute("data-nexa-sort-index", index);
      console.log(
        `✅ Child ${index}: data-nexa-sort-index=${child.getAttribute(
          "data-nexa-sort-index"
        )}`
      );

      // Store original styles
      if (!child._nexaSortOriginalStyles) {
        child._nexaSortOriginalStyles = {
          cursor: child.style.cursor,
          transition: child.style.transition,
          backgroundColor: child.style.backgroundColor,
          border: child.style.border,
        };
      }

      // Apply visual feedback styling
      child.style.cursor = "move";
      child.style.transition = "all 0.2s ease";

      // Add subtle border to indicate sortable items
      if (!child.style.border) {
        child.style.border = "1px solid rgba(0, 123, 255, 0.2)";
      }

      // Add hover effect using CSS classes
      child.classList.add("nexa-sortable-item");
    });
  }

  // REMOVED: enableNativeSortable - no longer needed, using jQuery UI Sortable only

  /**
   * Disable sortable functionality for an element
   */
  disableSortable(element) {
    if (!this.sortableElements.has(element)) {
      return; // Not enabled
    }

    console.log(
      "🔄 CLEANUP: Disabling sortable for container (following Draggable pattern):",
      element
    );

    // Check if it's jQuery UI Sortable and disable it properly
    const $element = $(element);
    if (
      $element.hasClass("nexa-sortable-jquery") &&
      typeof $.ui !== "undefined" &&
      $.ui.sortable
    ) {
      console.log("🔄 CLEANUP: Destroying jQuery UI Sortable...");

      // Disable jQuery UI Sortable
      if ($element.hasClass("ui-sortable")) {
        $element.sortable("destroy");
      }

      $element.removeClass("nexa-sortable-jquery");

      // Clean up all children with thorough style restoration (ikuti pola disableAllDraggable)
      Array.from(element.children).forEach((child) => {
        console.log(`🧹 CLEANUP: Restoring child ${child.tagName} styles...`);

        // Remove sortable classes
        child.classList.remove("nexa-sortable-item");
        child.removeAttribute("data-nexa-sort-index");

        // Restore original styles completely (sama seperti disableAllDraggable)
        if (child._nexaSortOriginalStyles) {
          const original = child._nexaSortOriginalStyles;
          child.style.cursor = original.cursor || "";
          child.style.transition = original.transition || "";
          child.style.backgroundColor = original.backgroundColor || "";
          child.style.border = original.border || "";

          // Clean up stored styles
          delete child._nexaSortOriginalStyles;
        }

        // Force clean any leftover sortable styles (seperti pattern draggable)
        if (child.style.cursor === "move") {
          child.style.removeProperty("cursor");
        }
        if (
          child.style.border &&
          child.style.border.includes("rgba(0, 123, 255")
        ) {
          child.style.removeProperty("border");
        }
        if (
          child.style.backgroundColor &&
          child.style.backgroundColor.includes("rgba(0, 123, 255")
        ) {
          child.style.removeProperty("backgroundColor");
        }
        if (child.style.transition && child.style.transition.includes("ease")) {
          child.style.removeProperty("transition");
        }
      });

      console.log(
        "✅ CLEANUP: jQuery UI Sortable destroyed and children cleaned"
      );
    }

    // Remove from tracking set
    this.sortableElements.delete(element);

    // Restore container original styles completely (ikuti pola Draggable)
    if (element._nexaSortableOriginalStyles) {
      const original = element._nexaSortableOriginalStyles;
      element.style.border = original.border || "";
      element.style.backgroundColor = original.backgroundColor || "";
      delete element._nexaSortableOriginalStyles;
    }

    // Remove sortable attributes
    element.removeAttribute("data-nexa-sortable");

    // Force clean any leftover container styles
    if (
      element.style.border &&
      element.style.border.includes("rgba(0, 123, 255")
    ) {
      element.style.removeProperty("border");
    }
    if (
      element.style.backgroundColor &&
      element.style.backgroundColor.includes("rgba(0, 123, 255")
    ) {
      element.style.removeProperty("backgroundColor");
    }

    console.log(
      "✅ CLEANUP: Sortable disabled and all styles cleaned completely (like Draggable)"
    );
  }
  // REMOVED: handleDragStart - no longer needed, using jQuery UI Sortable

  // REMOVED: handleDragOver - no longer needed, using jQuery UI Sortable

  // REMOVED: handleDrop - no longer needed, using jQuery UI Sortable

  // REMOVED: handleDragEnd - no longer needed, using jQuery UI Sortable

  // REMOVED: updateDragIndices - no longer needed, using jQuery UI Sortable
  // REMOVED: getDragAfterElement - no longer needed, using jQuery UI Sortable

  /**
   * Find the best sortable container for the given element
   */
  findSortableContainer(element) {
    if (!element) {
      return null;
    }

    // Start with the current element
    let current = element;

    // If current element has children and is allowed, use it
    if (
      current.children.length > 0 &&
      (this.isContextMenuAllowed(current) ||
        this.isElementInAllowedContainer(current))
    ) {
      return current;
    }

    // Otherwise, traverse up to find the best parent container
    let parent = element.parentElement;
    while (parent) {
      // Check if this parent has children and is allowed
      if (parent.children.length > 0) {
        if (
          this.isContextMenuAllowed(parent) ||
          this.isElementInAllowedContainer(parent)
        ) {
          return parent;
        }
      }

      // Move to next parent
      parent = parent.parentElement;

      // Stop at body to avoid going too high
      if (parent && parent.tagName === "BODY") {
        break;
      }
    }

    // If no suitable parent found, return current element
    return element;
  }
  /**
   * Check if element is inside an allowed container for sortable
   */
  isElementInAllowedContainer(element) {
    if (!element) {
      return false;
    }

    let currentElement = element;
    while (currentElement) {
      // Check enabledIds
      if (this.config.enabledIds.length > 0) {
        if (
          currentElement.id &&
          this.config.enabledIds.includes(currentElement.id)
        ) {
          console.log(`✅ Element is within enabled ID: ${currentElement.id}`);
          return true;
        }
      }

      // Check enabledClasses
      if (this.config.enabledClasses.length > 0) {
        if (currentElement.classList) {
          for (const className of this.config.enabledClasses) {
            if (currentElement.classList.contains(className)) {
              console.log(`✅ Element is within enabled class: ${className}`);
              return true;
            }
          }
        }
      }

      currentElement = currentElement.parentElement;

      // Stop at document body to prevent infinite loop
      if (currentElement === document.body) {
        break;
      }
    }

    const result = this.config.enableGlobal;
    if (result) {
      console.log(`✅ Element allowed via enableGlobal`);
    } else {
      console.log(`❌ Element not in allowed container`, {
        enabledIds: this.config.enabledIds,
        enabledClasses: this.config.enabledClasses,
        enableGlobal: this.config.enableGlobal,
        elementId: element.id,
        elementClasses: Array.from(element.classList || []),
      });
    }
    return result;
  }

  /**
   * Check if context menu is allowed for element
   */
  isContextMenuAllowed(element) {
    if (!element) {
      console.log(`❌ Context menu not allowed: no element`);
      return false;
    }

    // Check enabledIds - direct match
    if (this.config.enabledIds.length > 0) {
      if (element.id && this.config.enabledIds.includes(element.id)) {
        console.log(
          `✅ Context menu allowed: element ID '${element.id}' is in enabledIds`
        );
        return true;
      }
    }

    // Check enabledClasses - direct match
    if (this.config.enabledClasses.length > 0) {
      if (element.classList) {
        for (const className of this.config.enabledClasses) {
          if (element.classList.contains(className)) {
            console.log(
              `✅ Context menu allowed: element has enabled class '${className}'`
            );
            return true;
          }
        }
      }
    }

    // Check if element is within allowed containers (traverse up)
    const isWithinAllowed = this.isElementInAllowedContainer(element);
    if (isWithinAllowed) {
      console.log(
        `✅ Context menu allowed: element is within allowed container`
      );
      return true;
    }

    const result = this.config.enableGlobal;
    if (result) {
      console.log(`✅ Context menu allowed: enableGlobal is true`);
    } else {
      console.log(`❌ Context menu not allowed for element`, {
        elementId: element.id || "no-id",
        elementTag: element.tagName,
        elementClasses: Array.from(element.classList || []),
        enabledIds: this.config.enabledIds,
        enabledClasses: this.config.enabledClasses,
        enableGlobal: this.config.enableGlobal,
      });
    }
    return result;
  }

  // REMOVED: Duplicate disableSortable method - using improved version above

  /**
   * Apply visual styling to sortable container for better visibility
   */
  applySortableVisualStyle(container) {
    if (!container) return;

    console.log(
      "🎯 Applying SAFE sortable visual indicators (preserving existing layout)"
    );

    // Store ONLY visual indicator styles (NOT position/layout related!)
    container._nexaSortableOriginalStyles = {
      border: container.style.border,
      outline: container.style.outline,
      backgroundColor: container.style.backgroundColor,
      boxShadow: container.style.boxShadow,
      // DO NOT STORE: position, width, height, top, left, transform, zIndex, order
    };

    // Apply ONLY visual indicators - DO NOT touch position/layout
    container.style.border = "2px dashed #fd7e14"; // Orange dashed border
    container.style.outline = "1px solid rgba(253, 126, 20, 0.3)"; // Light orange outline
    container.style.backgroundColor = "rgba(253, 126, 20, 0.05)"; // Very light orange background
    container.style.boxShadow = "0 0 0 2px rgba(253, 126, 20, 0.2)"; // Subtle orange glow

    // DO NOT SET: position, width, height, top, left, transform, zIndex, order
    // These should be managed ONLY by jQuery UI and user interactions

    console.log(
      "✅ Applied SAFE sortable visual indicators - layout preserved"
    );
  }

  /**
   * Remove visual styling from sortable container
   */
  removeSortableVisualStyle(container) {
    if (!container) {
      console.warn("⚠️ removeSortableVisualStyle: No container provided");
      return;
    }

    console.log(
      "🎯 SELECTIVE CLEANUP: Removing ONLY visual indicators, preserving layout"
    );
    console.log("🔍 Before cleanup styles:", container.style.cssText);

    // FIXED: More robust approach - restore from stored original styles first
    if (container._nexaSortableOriginalStyles) {
      const original = container._nexaSortableOriginalStyles;

      console.log("💾 Restoring from stored original styles:", original);

      // Restore original styles
      container.style.border = original.border || "";
      container.style.outline = original.outline || "";
      container.style.backgroundColor = original.backgroundColor || "";
      container.style.boxShadow = original.boxShadow || "";

      console.log("✅ Restored original styles from stored data");

      // Clean up stored data
      delete container._nexaSortableOriginalStyles;
    } else {
      // FALLBACK: Force remove sortable styles if no original styles stored
      console.log("⚠️ No original styles stored, using fallback cleanup");

      // Check and remove orange border if it matches our sortable colors
      const currentBorder = container.style.border;
      if (currentBorder && this.containsSortableColors(currentBorder)) {
        container.style.removeProperty("border");
        console.log("🎯 Removed sortable border indicator");
      }

      const currentOutline = container.style.outline;
      if (currentOutline && this.containsSortableColors(currentOutline)) {
        container.style.removeProperty("outline");
        console.log("🎯 Removed sortable outline indicator");
      }

      const currentBackground = container.style.backgroundColor;
      if (currentBackground && this.containsSortableColors(currentBackground)) {
        container.style.removeProperty("backgroundColor");
        console.log("🎯 Removed sortable background indicator");
      }

      const currentBoxShadow = container.style.boxShadow;
      if (currentBoxShadow && this.containsSortableColors(currentBoxShadow)) {
        container.style.removeProperty("boxShadow");
        console.log("🎯 Removed sortable box-shadow indicator");
      }

      // EMERGENCY: Force clean if still has sortable colors
      if (this.containerHasSortableColors(container)) {
        console.log("🚨 EMERGENCY: Force cleaning remaining sortable colors");
        this.forceCleanSortableColors(container);
      }
    }

    // Remove classes
    container.classList.remove("nexa-sortable", "nexa-sorting-active");

    console.log("✅ SELECTIVE sortable cleanup completed - layout PRESERVED");
    console.log("🔍 After cleanup styles:", container.style.cssText);
  }

  /**
   * Check if style value contains sortable colors
   */
  containsSortableColors(value) {
    if (!value) return false;

    const sortableColors = [
      "#fd7e14",
      "rgba(253, 126, 20",
      "rgb(253, 126, 20",
      "rgba(253,126,20", // Handle no spaces
      "rgb(253,126,20", // Handle no spaces
    ];

    // Also check for color names that might be converted
    const sortablePatterns = [
      "dashed", // Our sortable border is dashed
      "2px.*#fd7e14", // Specific pattern
      "rgba\\(253,?\\s*126,?\\s*20", // Regex for rgba
    ];

    // String includes check
    const hasColorMatch = sortableColors.some((color) => value.includes(color));

    // Pattern check for more complex detection
    const hasPatternMatch = sortablePatterns.some((pattern) => {
      const regex = new RegExp(pattern, "i");
      return regex.test(value);
    });

    const result = hasColorMatch || hasPatternMatch;
    console.log(`🔍 containsSortableColors check: "${value}" → ${result}`);
    return result;
  }

  /**
   * Check if container has any sortable colors in any of its style properties
   */
  containerHasSortableColors(container) {
    if (!container) return false;

    const styles = container.style;
    const properties = ["border", "outline", "backgroundColor", "boxShadow"];

    for (const prop of properties) {
      const value = styles.getPropertyValue(prop) || styles[prop];
      if (value && this.containsSortableColors(value)) {
        console.log(
          `🚨 Container still has sortable color in ${prop}: ${value}`
        );
        return true;
      }
    }

    return false;
  }

  // REMOVED: enableNativeSortable and disableNativeSortable - no longer needed, using jQuery UI Sortable only

  // ========================================
  // DRAGGABLE FUNCTIONALITY
  // ========================================

  /**
   * Context menu: Toggle jQuery UI Draggable functionality for ALL elements in container
   */
  contextToggleDraggable() {
    try {
      // Check if jQuery is available
      if (typeof $ === "undefined") {
        return { success: false, error: "jQuery not found" };
      }

      if (!this.targetElement) {
        throw new Error("No target element selected");
      }

      // Find the appropriate container for draggable using the same logic as sortable
      let draggableContainer = this.findSortableContainer(this.targetElement);

      // Final check if container is suitable for draggable
      if (!draggableContainer || draggableContainer.children.length === 0) {
        throw new Error("No suitable container with children found");
      }

      // Check if container already has draggable children
      const hasAnyDraggable =
        $(draggableContainer).find(".nexa-draggable").length > 0;

      if (hasAnyDraggable) {
        // DISABLE draggable for ALL children in container
        this.disableAllDraggable(draggableContainer);
        // Also DISABLE resizable for ALL children in container
      } else {
        // ENABLE draggable for ALL children in container
        this.enableAllDraggable(draggableContainer);
        // Also ENABLE resizable for ALL children in container
      }

      return {
        success: true,
        message: "Draggable and Resizable toggled for container",
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enable draggable for ALL children in container (like sortable)
   */
  enableAllDraggable(container) {
    if (typeof $ === "undefined") return;

    Array.from(container.children).forEach((child) => {
      // Skip essential elements
      if (["SCRIPT", "STYLE", "META", "LINK"].includes(child.tagName)) return;

      const $child = $(child);

      // Skip if already draggable
      if ($child.hasClass("ui-draggable")) return;

      // Store original styles before applying draggable visual feedback
      if (!child._nexaDraggableOriginalStyles) {
        child._nexaDraggableOriginalStyles = {
          border: child.style.border,
          outline: child.style.outline,
          backgroundColor: child.style.backgroundColor,
          boxShadow: child.style.boxShadow,
        };
      }

      // Apply visual feedback (blue border like hover highlighting)
      child.style.border = "2px solid #007bff";
      child.style.outline = "1px solid #007bff";
      child.style.backgroundColor = "rgba(0, 123, 255, 0.1)";

      const options = {
        containment: container,
        cursor: "move",
        opacity: 0.8,
        scroll: false,
        zIndex: 1000,
      };

      // Add grid snap if enabled
      if (this.gridSnapEnabled) {
        options.grid = [this.gridSnapSize, this.gridSnapSize];
      }

      $child.draggable(options);
      $child.addClass("nexa-draggable");
      this.draggableElements.add(child);
    });
  }

  /**
   * Disable draggable for ALL children in container
   */
  disableAllDraggable(container) {
    if (typeof $ === "undefined") return;

    $(container)
      .find(".nexa-draggable")
      .each((index, element) => {
        const $element = $(element);
        if ($element.hasClass("ui-draggable")) {
          $element.draggable("destroy");
        }

        // Restore original styles if they were stored
        if (element._nexaDraggableOriginalStyles) {
          const original = element._nexaDraggableOriginalStyles;
          element.style.border = original.border;
          element.style.outline = original.outline;
          element.style.backgroundColor = original.backgroundColor;
          element.style.boxShadow = original.boxShadow;

          // Clean up stored styles
          delete element._nexaDraggableOriginalStyles;
        }

        $element.removeClass("nexa-draggable");
        this.draggableElements.delete(element);
      });
  }

  /**
   * Enable resizable for ALL children in container (like sortable)
   */

  /**
   * Check if element still has draggable colors in its styling
   */
  elementHasDraggableColors(element) {
    if (!element) return false;

    const styleText = element.style.cssText;
    const draggableColors = ["#007bff", "rgba(0, 123, 255", "rgb(0, 123, 255"];

    const hasColors = draggableColors.some((color) =>
      styleText.includes(color)
    );
    console.log(
      `🔍 Element ${element.tagName} has draggable colors:`,
      hasColors,
      styleText
    );
    return hasColors;
  }

  /**
   * Debug helper: Check and fix element positioning for draggable
   */
  debugDraggablePosition(element) {
    if (!element) return;

    console.log("🔍 DEBUG: Checking draggable element positioning...");

    const computed = window.getComputedStyle(element);
    const inline = element.style;

    console.log("📊 Position Debug Info:", {
      tagName: element.tagName,
      className: element.className,
      id: element.id || "(no id)",
      computed: {
        position: computed.position,
        left: computed.left,
        top: computed.top,
        transform: computed.transform,
      },
      inline: {
        position: inline.position,
        left: inline.left,
        top: inline.top,
        transform: inline.transform,
      },
      isDraggable: element.classList.contains("nexa-draggable"),
      hasJQueryUI: element.classList.contains("ui-draggable"),
    });

    // Auto-fix common positioning issues
    if (computed.position === "static" && (inline.left || inline.top)) {
      element.style.position = "relative";
      console.log("🔧 AUTO-FIX: Set position to relative");
    }

    return {
      element: element,
      needsPositioning: computed.position === "static",
      hasInlinePosition: !!(inline.left || inline.top),
      recommendations:
        computed.position === "static"
          ? ["Set position to relative or absolute"]
          : [],
    };
  }

  /**
   * Apply visual styling to draggable elements for better visibility
   */
  applyDraggableVisualStyle(element) {
    if (!element) return;

    console.log(
      "🎯 Applying SAFE draggable visual indicators (preserving existing position/size)"
    );

    // Store ONLY visual indicator styles (NOT position/size related!)
    element._nexaDraggableOriginalStyles = {
      border: element.style.border,
      outline: element.style.outline,
      backgroundColor: element.style.backgroundColor,
      cursor: element.style.cursor,
      boxShadow: element.style.boxShadow,
      // DO NOT STORE: position, width, height, top, left, transform, zIndex
    };

    // FIXED: Ensure element positioning is set before applying visual styles
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === "static") {
      element.style.position = "relative";
      console.log("🎯 Set position to relative for draggable element");
    }

    // Apply ONLY visual indicators - DO NOT touch position/size
    element.style.border = "2px dashed #007bff"; // Blue dashed border
    element.style.outline = "1px solid rgba(0, 123, 255, 0.3)"; // Light blue outline
    element.style.backgroundColor = "rgba(0, 123, 255, 0.05)"; // Very light blue background
    element.style.cursor = "move"; // Move cursor indicator
    element.style.boxShadow = "0 0 0 2px rgba(0, 123, 255, 0.2)"; // Subtle blue glow

    // DO NOT SET: width, height, top, left, transform, zIndex during visual styling
    // These should be managed ONLY by jQuery UI and user interactions

    console.log(
      "✅ Applied SAFE draggable visual indicators - position/size preserved"
    );
  }

  /**
   * Remove visual styling from draggable elements
   */
  removeDraggableVisualStyle(element) {
    if (!element) {
      console.warn("⚠️ removeDraggableVisualStyle: No element provided");
      return;
    }

    console.log(
      "🎯 SELECTIVE CLEANUP: Removing ONLY visual indicators, preserving user position"
    );
    console.log("🔍 Before cleanup styles:", element.style.cssText);

    // 🎯 SMART APPROACH: Only remove visual indicators, PRESERVE position changes from dragging
    // CRITICAL: DO NOT TOUCH: width, height, top, left, position, transform, zIndex

    const currentBorder = element.style.border;
    if (currentBorder && this.containsDraggableColors(currentBorder)) {
      element.style.removeProperty("border");
      console.log("🎯 Removed draggable border indicator");
    }

    const currentOutline = element.style.outline;
    if (currentOutline && this.containsDraggableColors(currentOutline)) {
      element.style.removeProperty("outline");
      console.log("🎯 Removed draggable outline indicator");
    }

    const currentBackground = element.style.backgroundColor;
    if (currentBackground && this.containsDraggableColors(currentBackground)) {
      element.style.removeProperty("backgroundColor");
      console.log("🎯 Removed draggable background indicator");
    }

    const currentBoxShadow = element.style.boxShadow;
    if (currentBoxShadow && this.containsDraggableColors(currentBoxShadow)) {
      element.style.removeProperty("boxShadow");
      console.log("🎯 Removed draggable box-shadow indicator");
    }

    // Only remove cursor if it's our 'move' indicator
    if (element.style.cursor === "move") {
      element.style.removeProperty("cursor");
      console.log("🎯 Removed draggable cursor indicator");
    }

    // Clean stored data and classes - but KEEP position-related styles intact
    if (element._nexaDraggableOriginalStyles) {
      delete element._nexaDraggableOriginalStyles;
    }

    // FIXED: Only remove draggable classes, preserve jQuery UI positioning
    element.classList.remove("nexa-draggable", "nexa-dragging-active");

    // CRITICAL: Do NOT remove "ui-draggable" class or position properties
    // These are needed to maintain the final dragged position

    console.log(
      "✅ SELECTIVE draggable cleanup completed - position PRESERVED"
    );
    console.log("🔍 After cleanup styles:", element.style.cssText);
  }

  /**
   * Force remove draggable styling without original values
   */
  forceRemoveDraggableStyles(element) {
    console.log("🧹 Force removing draggable styles...");

    const properties = [
      "border",
      "outline",
      "backgroundColor",
      "cursor",
      "position",
      "boxShadow",
    ];

    properties.forEach((prop) => {
      const currentValue = element.style.getPropertyValue(prop);
      console.log(`🔍 Checking ${prop}:`, currentValue);

      if (this.isDraggableStyle(prop, currentValue)) {
        // Try multiple ways to remove the property
        element.style.removeProperty(prop);
        element.style.setProperty(prop, "", "important");
        element.style[prop] = "";

        console.log(`🧹 Force removed draggable ${prop}: ${currentValue}`);
        console.log(
          `✅ ${prop} after removal:`,
          element.style.getPropertyValue(prop)
        );
      } else if (currentValue && this.containsDraggableColors(currentValue)) {
        // Force remove if contains our colors even if pattern doesn't match exactly
        element.style.removeProperty(prop);
        element.style.setProperty(prop, "", "important");
        element.style[prop] = "";
        console.log(
          `🧹 Force removed draggable-colored ${prop}: ${currentValue}`
        );
      }
    });

    // Final cleanup - remove all inline styles that contain our draggable colors
    this.forceCleanDraggableColors(element);
  }

  /**
   * Check if value contains draggable colors
   */
  containsDraggableColors(value) {
    const draggableColors = ["#007bff", "rgba(0, 123, 255", "rgb(0, 123, 255"];
    return draggableColors.some((color) => value.includes(color));
  }

  /**
   * Final cleanup - aggressively remove draggable colors from all style properties
   */
  forceCleanDraggableColors(element) {
    console.log("🧽 Final cleanup of draggable colors...");

    // Get all style properties
    const style = element.style;
    const properties = [];

    // Collect all properties that might contain our colors
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      const value = style.getPropertyValue(prop);

      if (this.containsDraggableColors(value)) {
        properties.push(prop);
      }
    }

    // Remove all properties containing draggable colors
    properties.forEach((prop) => {
      style.removeProperty(prop);
      console.log(`🧽 Final cleanup removed ${prop}`);
    });
  }

  // ========================================
  // RESIZABLE FUNCTIONALITY
  // ========================================

  /**
   * Context menu: Toggle jQuery UI Resizable functionality for ALL elements in container
   */
  contextToggleResizable() {
    try {
      if (!this.targetElement) {
        throw new Error("No target element selected");
      }

      // Find the appropriate container for resizable using the same logic as sortable
      let resizableContainer = this.findSortableContainer(this.targetElement);

      // Final check if container is suitable for resizable
      if (!resizableContainer || resizableContainer.children.length === 0) {
        throw new Error("No suitable container with children found");
      }

      // Check if container already has resizable children
      const hasAnyResizable =
        resizableContainer.querySelectorAll(".nexa-resizable").length > 0;

      if (hasAnyResizable) {
        // DISABLE resizable for ALL children in container
        this.disableAllResizable(resizableContainer);
      } else {
        // ENABLE resizable for ALL children in container
        this.enableAllResizable(resizableContainer);
      }

      return { success: true, message: "Resizable toggled for container" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enable resizable for ALL children in container (like sortable)
   */
  enableAllResizable(container) {
    Array.from(container.children).forEach((child) => {
      // Skip essential elements
      if (["SCRIPT", "STYLE", "META", "LINK"].includes(child.tagName)) {
        return;
      }

      // Skip if already resizable
      if (child.classList.contains("nexa-resizable")) {
        return;
      }

      // Store original styles before applying resizable visual feedback (if not already stored by draggable)
      if (
        !child._nexaDraggableOriginalStyles &&
        !child._nexaResizableOriginalStyles
      ) {
        child._nexaResizableOriginalStyles = {
          border: child.style.border,
          outline: child.style.outline,
          backgroundColor: child.style.backgroundColor,
          boxShadow: child.style.boxShadow,
        };
      }

      // Apply visual feedback (blue border like draggable) only if not already applied by draggable
      if (!child.classList.contains("nexa-draggable")) {
        child.style.border = "2px solid #007bff";
        child.style.outline = "1px solid #007bff";
        child.style.backgroundColor = "rgba(0, 123, 255, 0.1)";
      }

      try {
        this.makeElementResizable(child, container);
        child.classList.add("nexa-resizable");
        this.resizableElements.add(child);
      } catch (error) {
        console.error("Error making element resizable:", error);
      }
    });
  }

  /**
   * Disable resizable for ALL children in container
   */
  disableAllResizable(container) {
    const resizableElements = container.querySelectorAll(".nexa-resizable");

    resizableElements.forEach((element) => {
      this.removeElementResizable(element);

      // Restore original styles if they were stored by resizable (and not by draggable)
      if (
        element._nexaResizableOriginalStyles &&
        !element.classList.contains("nexa-draggable")
      ) {
        const original = element._nexaResizableOriginalStyles;
        element.style.border = original.border;
        element.style.outline = original.outline;
        element.style.backgroundColor = original.backgroundColor;
        element.style.boxShadow = original.boxShadow;

        // Clean up stored styles
        delete element._nexaResizableOriginalStyles;
      }

      element.classList.remove("nexa-resizable");
      this.resizableElements.delete(element);
    });
  }

  /**
   * Remove resizable functionality from element
   */
  removeElementResizable(element) {
    // Try to destroy jQuery UI resizable first
    if (typeof $ !== "undefined" && $(element).hasClass("ui-resizable")) {
      try {
        $(element).resizable("destroy");
        $(element).removeClass("nexa-resizing");
      } catch (error) {
        console.warn("Error destroying jQuery UI resizable:", error);
      }
    }

    const isImage = element.tagName === "IMG";

    // Remove all resize handles from element or its wrapper (for vanilla fallback)
    if (
      isImage &&
      element.parentElement.classList.contains("nexa-resize-wrapper")
    ) {
      // Remove handles from wrapper
      const handles = element.parentElement.querySelectorAll(
        ".nexa-resize-handle"
      );
      handles.forEach((handle) => handle.remove());

      // Unwrap the image
      this.unwrapImageFromResize(element);
    } else {
      // Remove handles from element
      const handles = element.querySelectorAll(".nexa-resize-handle");
      handles.forEach((handle) => handle.remove());
    }

    // Restore original styles for IMG elements
    if (element._nexaResizableData && element._nexaResizableData.isImage) {
      const data = element._nexaResizableData;
      if (data.originalMaxWidth !== undefined) {
        element.style.maxWidth = data.originalMaxWidth;
      }
      if (data.originalMaxHeight !== undefined) {
        element.style.maxHeight = data.originalMaxHeight;
      }
      if (data.originalObjectFit !== undefined) {
        element.style.objectFit = data.originalObjectFit;
      }
    }

    // Clean up outline
    element.style.outline = "";

    // Remove stored data
    delete element._nexaResizableData;
  }
  /**
   * Create resize handles for element
   */
  createResizeHandles(element) {
    const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
    const isImage = element.tagName === "IMG";

    // For IMG elements, create a wrapper container
    if (
      isImage &&
      !element.parentElement.classList.contains("nexa-resize-wrapper")
    ) {
      this.wrapImageForResize(element);
    }

    handles.forEach((direction) => {
      const handle = document.createElement("div");
      handle.className = `nexa-resize-handle nexa-resize-${direction}`;
      handle.dataset.direction = direction;

      // Base styles for all handles
      handle.style.cssText = `
        position: absolute;
        background: rgba(0, 123, 255, 0.8);
        border: 1px solid #007bff;
        z-index: 9999;
        cursor: ${this.getResizeCursor(direction)};
        pointer-events: auto;
      `;

      // Position specific handles
      this.positionResizeHandle(handle, direction);

      // Add event listeners
      this.addResizeHandleEvents(handle, element);

      // For IMG, append to wrapper; for others, append to element
      if (
        isImage &&
        element.parentElement.classList.contains("nexa-resize-wrapper")
      ) {
        element.parentElement.appendChild(handle);
      } else {
        element.appendChild(handle);
      }
    });
  }
  /**
   * Make element resizable using jQuery UI resizable for better stability
   */
  makeElementResizable(element, container) {
    // Check if jQuery and jQuery UI are available
    if (typeof $ === "undefined" || typeof $.fn.resizable === "undefined") {
      console.warn(
        "jQuery UI resizable not available, falling back to basic resizable"
      );
      this.makeElementResizableVanilla(element, container);
      return;
    }

    // Ensure element has proper positioning
    if (getComputedStyle(element).position === "static") {
      element.style.position = "relative";
    }

    // Special handling for IMG elements
    const isImage = element.tagName === "IMG";
    if (isImage) {
      // Ensure IMG has explicit dimensions for proper resizing
      const computedStyle = getComputedStyle(element);
      if (!element.style.width) {
        element.style.width = computedStyle.width;
      }
      if (!element.style.height) {
        element.style.height = computedStyle.height;
      }

      // Prevent default image behaviors that interfere with resize
      element.style.maxWidth = "none";
      element.style.maxHeight = "none";
      element.style.objectFit = "fill"; // Allow distortion for manual resize
    }

    // Store original styles
    element._nexaResizableData = {
      originalPosition: element.style.position,
      originalWidth: element.style.width,
      originalHeight: element.style.height,
      originalMaxWidth: element.style.maxWidth,
      originalMaxHeight: element.style.maxHeight,
      originalObjectFit: element.style.objectFit,
      minWidth: isImage ? 30 : 50,
      minHeight: isImage ? 30 : 50,
      container: container,
      isImage: isImage,
    };

    // Configure jQuery UI resizable
    const resizableOptions = {
      minWidth: element._nexaResizableData.minWidth,
      minHeight: element._nexaResizableData.minHeight,
      handles: "n, ne, e, se, s, sw, w, nw", // All resize handles

      // Add grid snap if enabled
      grid: this.gridSnapEnabled
        ? [this.gridSnapSize, this.gridSnapSize]
        : false,

      // Visual feedback during resize
      start: (event, ui) => {
        $(element).addClass("nexa-resizing");
        element.style.outline = "2px dashed #007bff";
      },

      // Handle resize with aspect ratio for images
      resize: (event, ui) => {
        // For images, maintain aspect ratio when Shift is held
        if (isImage && event.shiftKey) {
          const originalWidth =
            parseFloat(element._nexaResizableData.originalWidth) ||
            ui.originalSize.width;
          const originalHeight =
            parseFloat(element._nexaResizableData.originalHeight) ||
            ui.originalSize.height;
          const aspectRatio = originalWidth / originalHeight;

          // Determine which dimension changed more and adjust the other
          const widthChange = Math.abs(ui.size.width - ui.originalSize.width);
          const heightChange = Math.abs(
            ui.size.height - ui.originalSize.height
          );

          if (widthChange > heightChange) {
            // Width changed more, adjust height
            ui.size.height = ui.size.width / aspectRatio;
          } else {
            // Height changed more, adjust width
            ui.size.width = ui.size.height * aspectRatio;
          }
        }
      },

      // Clean up after resize
      stop: (event, ui) => {
        $(element).removeClass("nexa-resizing");
        element.style.outline = "";

        // Ensure position stays within container bounds
        this.constrainElementToContainer(element, container);
      },
    };

    // Apply containment to keep element within container if specified
    if (container && container !== document.body) {
      resizableOptions.containment = container;
    }

    // Initialize jQuery UI resizable
    $(element).resizable(resizableOptions);

    // Add custom CSS for better handle visibility
    this.addResizableStyles();
  }
  /**
   * Fallback vanilla JavaScript resizable implementation (more stable than original)
   */
  makeElementResizableVanilla(element, container) {
    // Ensure element has proper positioning
    if (getComputedStyle(element).position === "static") {
      element.style.position = "relative";
    }

    // Special handling for IMG elements
    const isImage = element.tagName === "IMG";
    if (isImage) {
      // Ensure IMG has explicit dimensions for proper resizing
      const computedStyle = getComputedStyle(element);
      if (!element.style.width) {
        element.style.width = computedStyle.width;
      }
      if (!element.style.height) {
        element.style.height = computedStyle.height;
      }

      // Prevent default image behaviors that interfere with resize
      element.style.maxWidth = "none";
      element.style.maxHeight = "none";
      element.style.objectFit = "fill"; // Allow distortion for manual resize
    }

    // Store original styles and current position info
    const rect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    element._nexaResizableData = {
      originalPosition: element.style.position,
      originalWidth: element.style.width,
      originalHeight: element.style.height,
      originalMaxWidth: element.style.maxWidth,
      originalMaxHeight: element.style.maxHeight,
      originalObjectFit: element.style.objectFit,
      minWidth: isImage ? 30 : 50,
      minHeight: isImage ? 30 : 50,
      container: container,
      isImage: isImage,
      // Store initial positioning relative to container
      initialLeft: rect.left - containerRect.left,
      initialTop: rect.top - containerRect.top,
      initialWidth: rect.width,
      initialHeight: rect.height,
    };

    // Create resize handles with improved positioning
    this.createResizeHandlesImproved(element);
  }
  /**
   * Improved vanilla resize handles with better position stability
   */
  createResizeHandlesImproved(element) {
    const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
    const isImage = element.tagName === "IMG";

    // For IMG elements, create a wrapper container
    if (
      isImage &&
      !element.parentElement.classList.contains("nexa-resize-wrapper")
    ) {
      this.wrapImageForResize(element);
    }

    handles.forEach((direction) => {
      const handle = document.createElement("div");
      handle.className = `nexa-resize-handle nexa-resize-${direction}`;
      handle.dataset.direction = direction;

      // Base styles for all handles
      handle.style.cssText = `
        position: absolute;
        background: rgba(0, 123, 255, 0.8);
        border: 1px solid #007bff;
        z-index: 9999;
        cursor: ${this.getResizeCursor(direction)};
        pointer-events: auto;
      `;

      // Position specific handles
      this.positionResizeHandle(handle, direction);

      // Add improved event listeners
      this.addImprovedResizeHandleEvents(handle, element);

      // For IMG, append to wrapper; for others, append to element
      if (
        isImage &&
        element.parentElement.classList.contains("nexa-resize-wrapper")
      ) {
        element.parentElement.appendChild(handle);
      } else {
        element.appendChild(handle);
      }
    });
  }

  /**
   * Constrain element to stay within container bounds
   */
  constrainElementToContainer(element, container) {
    if (!container || container === document.body) {
      return;
    }

    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const computedStyle = getComputedStyle(element);
    const currentLeft = parseFloat(computedStyle.left) || 0;
    const currentTop = parseFloat(computedStyle.top) || 0;

    // Calculate constraints
    const maxLeft = containerRect.width - elementRect.width;
    const maxTop = containerRect.height - elementRect.height;

    // Apply constraints
    if (currentLeft < 0) {
      element.style.left = "0px";
    } else if (currentLeft > maxLeft) {
      element.style.left = maxLeft + "px";
    }

    if (currentTop < 0) {
      element.style.top = "0px";
    } else if (currentTop > maxTop) {
      element.style.top = maxTop + "px";
    }
  }

  /**
   * Add CSS styles for sortable functionality
   */
  addSortableStyles() {
    const styleId = "nexa-sortable-styles";
    if (document.getElementById(styleId)) return; // Already added

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .nexa-sortable-item {
        position: relative;
        transition: all 0.2s ease !important;
      }
      
      .nexa-sortable-item:hover {
        background-color: rgba(0, 123, 255, 0.1) !important;
        border-color: #007bff !important;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
      }
      
      .sortable-placeholder {
        background-color: rgba(0, 123, 255, 0.2) !important;
        border: 2px dashed #007bff !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      .ui-sortable-helper {
        opacity: 0.8 !important;
        transform: rotate(5deg);
        z-index: 1000 !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
      }
      
      .nexa-sortable-jquery {
        min-height: 50px;
      }
    `;
    document.head.appendChild(style);
    console.log("✅ Added sortable CSS styles");
  }

  /**
   * Add custom CSS styles for resizable elements
   */
  addResizableStyles() {
    const styleId = "nexa-resizable-styles";
    if (document.getElementById(styleId)) {
      return; // Styles already added
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .nexa-resizing {
        user-select: none;
        pointer-events: auto;
      }
      
      .ui-resizable-handle {
        background: rgba(0, 123, 255, 0.8) !important;
        border: 1px solid #007bff !important;
        opacity: 0.8;
        transition: opacity 0.2s ease;
      }
      
      .ui-resizable-handle:hover {
        opacity: 1;
        background: rgba(0, 123, 255, 1) !important;
      }
      
      .ui-resizable-n, .ui-resizable-s {
        height: 4px !important;
        width: 100% !important;
      }
      
      .ui-resizable-e, .ui-resizable-w {
        width: 4px !important;
        height: 100% !important;
      }
      
      .ui-resizable-nw, .ui-resizable-ne, 
      .ui-resizable-sw, .ui-resizable-se {
        width: 8px !important;
        height: 8px !important;
        border-radius: 2px;
      }
      
      .ui-resizable-nw { top: -4px !important; left: -4px !important; }
      .ui-resizable-ne { top: -4px !important; right: -4px !important; }
      .ui-resizable-sw { bottom: -4px !important; left: -4px !important; }
      .ui-resizable-se { bottom: -4px !important; right: -4px !important; }
      
      .ui-resizable-n { top: -2px !important; left: 0 !important; }
      .ui-resizable-s { bottom: -2px !important; left: 0 !important; }
      .ui-resizable-e { right: -2px !important; top: 0 !important; }
      .ui-resizable-w { left: -2px !important; top: 0 !important; }
    `;

    document.head.appendChild(style);
  }

  /**
   * Remove visual styling from resizable elements
   */
  removeResizableVisualStyle(element) {
    if (!element) {
      console.warn("⚠️ removeResizableVisualStyle: No element provided");
      return;
    }

    console.log(
      "🎯 SELECTIVE CLEANUP: Removing ONLY visual indicators, preserving user changes"
    );
    console.log("🔍 Before cleanup styles:", element.style.cssText);

    // 🎯 SMART APPROACH: Only remove visual indicators, PRESERVE position/size changes
    // DO NOT TOUCH: width, height, top, left, position, transform, zIndex

    const currentBorder = element.style.border;
    if (currentBorder && this.containsResizableColors(currentBorder)) {
      element.style.removeProperty("border");
      console.log("🎯 Removed resizable border indicator");
    }

    const currentOutline = element.style.outline;
    if (currentOutline && this.containsResizableColors(currentOutline)) {
      element.style.removeProperty("outline");
      console.log("🎯 Removed resizable outline indicator");
    }

    const currentBackground = element.style.backgroundColor;
    if (currentBackground && this.containsResizableColors(currentBackground)) {
      element.style.removeProperty("backgroundColor");
      console.log("🎯 Removed resizable background indicator");
    }

    const currentBoxShadow = element.style.boxShadow;
    if (currentBoxShadow && this.containsResizableColors(currentBoxShadow)) {
      element.style.removeProperty("boxShadow");
      console.log("🎯 Removed resizable box-shadow indicator");
    }

    // Only remove cursor if it's our 'move' indicator
    if (element.style.cursor === "move") {
      element.style.removeProperty("cursor");
      console.log("🎯 Removed resizable cursor indicator");
    }

    // Clean stored data and classes
    if (element._nexaResizableOriginalStyles) {
      delete element._nexaResizableOriginalStyles;
    }
    element.classList.remove("nexa-resizable", "nexa-resizing-active");

    console.log(
      "✅ SELECTIVE resizable cleanup completed - position/size PRESERVED"
    );
    console.log("🔍 After cleanup styles:", element.style.cssText);
  }

  /**
   * Helper method to restore individual style property
   */
  restoreStyleProperty(element, property, originalValue) {
    console.log(`🔍 Restoring ${property}:`, {
      originalValue: originalValue,
      currentValue: element.style.getPropertyValue(property),
      isEmpty:
        originalValue === "" ||
        originalValue === null ||
        originalValue === undefined,
    });

    if (
      originalValue === "" ||
      originalValue === null ||
      originalValue === undefined
    ) {
      // Remove property completely if original was empty
      element.style.removeProperty(property);
      console.log(`🔄 Removed ${property} property (was empty originally)`);
    } else {
      // Set back to original value
      element.style.setProperty(property, originalValue, "important");
      console.log(`🔄 Restored ${property}: ${originalValue} !important`);
    }

    // Verify the restoration worked
    const newValue = element.style.getPropertyValue(property);
    console.log(`✅ ${property} after restoration:`, newValue);
  }

  /**
   * Force remove resizable styling without original values
   */
  forceRemoveResizableStyles(element) {
    console.log("🧹 Force removing resizable styles...");

    // Force remove all resizable-related styles
    const properties = [
      "border",
      "outline",
      "backgroundColor",
      "cursor",
      "position",
      "boxShadow",
    ];

    properties.forEach((prop) => {
      const currentValue = element.style.getPropertyValue(prop);
      console.log(`🔍 Checking resizable ${prop}:`, currentValue);

      // Check if current style looks like our resizable styling
      if (this.isResizableStyle(prop, currentValue)) {
        // Try multiple ways to remove the property
        element.style.removeProperty(prop);
        element.style.setProperty(prop, "", "important");
        element.style[prop] = "";

        console.log(`🧹 Force removed resizable ${prop}: ${currentValue}`);
        console.log(
          `✅ ${prop} after removal:`,
          element.style.getPropertyValue(prop)
        );
      } else if (currentValue && this.containsResizableColors(currentValue)) {
        // Force remove if contains our colors
        element.style.removeProperty(prop);
        element.style.setProperty(prop, "", "important");
        element.style[prop] = "";
        console.log(
          `🧹 Force removed resizable-colored ${prop}: ${currentValue}`
        );
      }
    });

    // Final cleanup - remove all inline styles that contain our resizable colors
    this.forceCleanResizableColors(element);
  }

  /**
   * Check if value contains resizable colors
   */
  containsResizableColors(value) {
    const resizableColors = ["#28a745", "rgba(40, 167, 69", "rgb(40, 167, 69"];
    return resizableColors.some((color) => value.includes(color));
  }

  /**
   * Final cleanup - aggressively remove resizable colors from all style properties
   */
  forceCleanResizableColors(element) {
    console.log("🧽 Final cleanup of resizable colors...");

    const style = element.style;
    const properties = [];

    // Collect all properties that might contain our colors
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      const value = style.getPropertyValue(prop);

      if (this.containsResizableColors(value)) {
        properties.push(prop);
      }
    }

    // Remove all properties containing resizable colors
    properties.forEach((prop) => {
      style.removeProperty(prop);
      console.log(`🧽 Final resizable cleanup removed ${prop}`);
    });
  }

  /**
   * Check if style value is from our resizable styling
   */
  isResizableStyle(property, value) {
    if (!value) return false;

    const resizablePatterns = {
      border: "#28a745",
      outline: "rgba(40, 167, 69",
      backgroundColor: "rgba(40, 167, 69",
      boxShadow: "rgba(40, 167, 69",
      cursor: "move",
    };

    const pattern = resizablePatterns[property];
    return pattern && value.includes(pattern);
  }

  // ========================================
  // Z-INDEX FUNCTIONALITY
  // ========================================

  /**
   * Context menu: Bring element to front (increase z-index)
   */
  contextToFront() {
    try {
      if (!this.targetElement) {
        console.error("Error: No target element");
        return;
      }

      // Find the enabled container (like formcontainer)
      let enabledContainer = null;
      if (this.config.enabledIds.length > 0) {
        let element = this.targetElement;
        while (element) {
          if (element.id && this.config.enabledIds.includes(element.id)) {
            enabledContainer = element;
            break;
          }
          element = element.parentElement;
        }
      }

      if (!enabledContainer) {
        console.error("Error: Not in enabled container");
        return;
      }

      // Find all child elements within the container
      const allElements = Array.from(enabledContainer.children);

      // Get current highest z-index among siblings
      let highestZIndex = 0;
      allElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const zIndex = parseInt(computedStyle.zIndex);
        if (!isNaN(zIndex) && zIndex > highestZIndex) {
          highestZIndex = zIndex;
        }
      });

      // Set target element to highest z-index + 1 (minimum 1)
      const newZIndex = Math.max(highestZIndex + 1, 1);
      this.targetElement.style.zIndex = newZIndex;

      // Ensure element has proper positioning
      if (getComputedStyle(this.targetElement).position === "static") {
        this.targetElement.style.position = "relative";
      }

      console.log(`✅ Z-index set to ${newZIndex}`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Context menu: Send element to back (decrease z-index)
   */
  contextToBack() {
    try {
      if (!this.targetElement) {
        console.error("Error: No target element");
        return;
      }

      // Find the enabled container (like formcontainer)
      let enabledContainer = null;
      if (this.config.enabledIds.length > 0) {
        let element = this.targetElement;
        while (element) {
          if (element.id && this.config.enabledIds.includes(element.id)) {
            enabledContainer = element;
            break;
          }
          element = element.parentElement;
        }
      }

      if (!enabledContainer) {
        console.error("Error: Not in enabled container");
        return;
      }

      // Find all child elements within the container
      const allElements = Array.from(enabledContainer.children);

      // Get current lowest z-index among siblings
      let lowestZIndex = 0;
      allElements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        const zIndex = parseInt(computedStyle.zIndex);
        if (!isNaN(zIndex) && zIndex < lowestZIndex) {
          lowestZIndex = zIndex;
        }
      });

      // Set target element to lowest z-index - 1
      const newZIndex = lowestZIndex - 1;
      this.targetElement.style.zIndex = newZIndex;

      // Ensure element has proper positioning
      if (getComputedStyle(this.targetElement).position === "static") {
        this.targetElement.style.position = "relative";
      }

      console.log(`✅ Z-index set to ${newZIndex}`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  // ========================================
  // BOUNDARY FUNCTIONALITY
  // ========================================

  /**
   * Toggle hover boundary highlighting
   */
  contextToggleHoverBoundaries() {
    try {
      this.hoverBoundariesEnabled = !this.hoverBoundariesEnabled;

      if (this.hoverBoundariesEnabled) {
        this.attachHoverBoundaryListeners();
      } else {
        this.detachHoverBoundaryListeners();
      }

      console.log(
        `✅ ${
          this.hoverBoundariesEnabled
            ? "Hover boundaries enabled"
            : "Hover boundaries disabled"
        }`
      );
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Toggle show all boundaries functionality
   */
  contextToggleAllBoundaries() {
    try {
      this.allBoundariesEnabled = !this.allBoundariesEnabled;

      if (this.allBoundariesEnabled) {
        this.showAllElementBoundaries();
      } else {
        this.hideAllElementBoundaries();
      }

      console.log(
        `✅ ${
          this.allBoundariesEnabled
            ? "All boundaries shown"
            : "All boundaries hidden"
        }`
      );
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Set boundary style
   */
  contextSetBoundaryStyle(style) {
    try {
      this.boundaryStyle = style;

      // Update all active boundaries with new style
      this.boundaryElements.forEach((element) => {
        this.applyBoundaryStyle(element);
      });

      console.log(`✅ Boundary style set to ${style}`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Set boundary style to subtle
   */
  setBoundaryStyleSubtle() {
    return this.contextSetBoundaryStyle("subtle");
  }

  /**
   * Set boundary style to visible
   */
  setBoundaryStyleVisible() {
    return this.contextSetBoundaryStyle("visible");
  }

  /**
   * Set boundary style to highlight
   */
  setBoundaryStyleHighlight() {
    return this.contextSetBoundaryStyle("highlight");
  }

  // Menu action shortcuts
  toggleSortable() {
    console.log("🔄 Interactions.toggleSortable called");
    return this.contextToggleSortable();
  }

  toggleDraggable() {
    console.log("🔄 Interactions.toggleDraggable called");
    return this.contextToggleDraggable();
  }

  toggleResizable() {
    console.log("🔄 Interactions.toggleResizable called");
    return this.contextToggleResizable();
  }

  toFront() {
    console.log("🔄 Interactions.toFront called");
    return this.contextToFront();
  }

  toBack() {
    console.log("🔄 Interactions.toBack called");
    return this.contextToBack();
  }

  toggleHoverBoundaries() {
    return this.contextToggleHoverBoundaries();
  }

  toggleAllBoundaries() {
    return this.contextToggleAllBoundaries();
  }

  setBoundaryStyleSubtle() {
    return this.contextSetBoundaryStyle("subtle");
  }

  setBoundaryStyleVisible() {
    return this.contextSetBoundaryStyle("visible");
  }

  setBoundaryStyleHighlight() {
    return this.contextSetBoundaryStyle("highlight");
  }

  toggleWheelZoom() {
    return this.contextToggleWheelZoom();
  }

  exitFullscreen() {
    return this.contextExitFullscreen();
  }

  /**
   * EMERGENCY method shortcuts - accessible from console
   */
  emergencyCleanElement(element) {
    console.log("🚨 EMERGENCY: Cleaning element via shortcut method");
    this.forceCleanAllStyles(element);
    return "Emergency cleanup completed!";
  }

  emergencyCleanAllInContainer(containerId) {
    console.log(
      "🚨 EMERGENCY: Cleaning all elements in container:",
      containerId
    );
    const container = document.getElementById(containerId);
    if (!container) {
      console.error("Container not found:", containerId);
      return "Container not found!";
    }

    // Clean container itself
    this.forceCleanAllStyles(container);

    // Clean all children
    const children = Array.from(container.querySelectorAll("*"));
    children.forEach((child) => {
      this.forceCleanAllStyles(child);
    });

    return `Emergency cleanup completed for ${children.length + 1} elements!`;
  }

  /**
   * DEBUG: Show current styling info for elements with colors
   */
  debugElementsWithColors(containerId = "file-viewercontent-edit-sdk") {
    console.log("🔍 DEBUG: Scanning for elements with Interactions colors...");

    const container = document.getElementById(containerId);
    if (!container) {
      console.error("Container not found:", containerId);
      return "Container not found!";
    }

    const allElements = Array.from(container.querySelectorAll("*"));
    allElements.push(container); // Include container itself

    const problematicElements = [];

    allElements.forEach((element, index) => {
      const styleText = element.style.cssText;
      const hasDraggable = this.elementHasDraggableColors(element);
      const hasResizable = this.elementHasResizableColors(element);

      if (hasDraggable || hasResizable) {
        const info = {
          element: element,
          tagName: element.tagName,
          className: element.className || "(no class)",
          id: element.id || "(no id)",
          styleText: styleText,
          hasDraggable: hasDraggable,
          hasResizable: hasResizable,
        };

        problematicElements.push(info);
        console.log(`🚨 Element ${index + 1}:`, info);
      }
    });

    if (problematicElements.length === 0) {
      console.log("✅ No elements with problematic colors found!");
      return "All clean!";
    } else {
      console.log(
        `⚠️ Found ${problematicElements.length} elements with Interactions colors`
      );
      return problematicElements;
    }
  }

  /**
   * DEBUG: Specifically check sortable colors in container
   */
  debugSortableColors(containerId = "file-viewercontent-edit-sdk") {
    console.log("🔍 DEBUG: Checking specifically for sortable colors...");

    const container = document.getElementById(containerId);
    if (!container) {
      console.error("Container not found:", containerId);
      return "Container not found!";
    }

    const allElements = Array.from(container.querySelectorAll("*"));
    allElements.push(container);

    const sortableElements = [];

    allElements.forEach((element, index) => {
      if (this.containerHasSortableColors(element)) {
        const info = {
          element: element,
          tagName: element.tagName,
          className: element.className || "(no class)",
          id: element.id || "(no id)",
          border: element.style.border,
          outline: element.style.outline,
          backgroundColor: element.style.backgroundColor,
          boxShadow: element.style.boxShadow,
          fullStyle: element.style.cssText,
        };

        sortableElements.push(info);
        console.log(`🟠 Sortable Element ${index + 1}:`, info);
      }
    });

    if (sortableElements.length === 0) {
      console.log("✅ No elements with sortable colors found!");
      return "All clean!";
    } else {
      console.log(
        `🟠 Found ${sortableElements.length} elements with sortable colors`
      );
      return sortableElements;
    }
  }

  /**
   * QUICK FIX: Remove all sortable colors (orange) from container
   */
  quickFixRemoveOrangeBorders(containerId = "file-viewercontent-edit-sdk") {
    console.log("🩹 QUICK FIX: Removing all orange sortable borders...");

    const container = document.getElementById(containerId);
    if (!container) return "Container not found!";

    const allElements = Array.from(container.querySelectorAll("*"));
    allElements.push(container);

    let fixedCount = 0;

    allElements.forEach((element) => {
      const hasSortableProblem = this.containerHasSortableColors(element);

      if (hasSortableProblem) {
        console.log(
          "🩹 Quick fixing sortable element:",
          element.tagName,
          element.className
        );

        // Force clean sortable colors
        this.forceCleanSortableColors(element);

        // Remove sortable classes
        element.classList.remove("nexa-sortable", "nexa-sorting-active");

        fixedCount++;
      }
    });

    console.log(`🩹 Quick fix completed for ${fixedCount} sortable elements`);
    return `Fixed ${fixedCount} sortable elements!`;
  }

  /**
   * QUICK FIX: Remove all green borders (resizable colors) from container
   */
  quickFixRemoveGreenBorders(containerId = "file-viewercontent-edit-sdk") {
    console.log("🩹 QUICK FIX: Removing all green borders...");

    const container = document.getElementById(containerId);
    if (!container) return "Container not found!";

    const allElements = Array.from(container.querySelectorAll("*"));
    allElements.push(container);

    let fixedCount = 0;

    allElements.forEach((element) => {
      const hasProblem =
        this.elementHasResizableColors(element) ||
        this.elementHasDraggableColors(element);

      if (hasProblem) {
        console.log(
          "🩹 Quick fixing element:",
          element.tagName,
          element.className
        );

        // Brute force remove all our styling
        const badProperties = [
          "border",
          "outline",
          "backgroundColor",
          "boxShadow",
        ];
        badProperties.forEach((prop) => {
          element.style.removeProperty(prop);
          element.style.setProperty(prop, "", "important");
        });

        // Remove classes
        element.classList.remove(
          "nexa-draggable",
          "nexa-resizable",
          "nexa-sortable"
        );

        fixedCount++;
      }
    });

    console.log(`🩹 Quick fix completed for ${fixedCount} elements`);
    return `Fixed ${fixedCount} elements!`;
  }

  /**
   * Attach hover boundary event listeners
   */
  attachHoverBoundaryListeners() {
    this.hoverBoundaryMouseOver = (e) => {
      if (!this.isInPrintMode && this.shouldShowBoundary(e.target)) {
        this.showElementBoundary(e.target);
      }
    };

    this.hoverBoundaryMouseOut = (e) => {
      if (!this.isInPrintMode) {
        this.hideElementBoundary(e.target);
      }
    };

    document.addEventListener("mouseover", this.hoverBoundaryMouseOver);
    document.addEventListener("mouseout", this.hoverBoundaryMouseOut);
  }

  /**
   * Detach hover boundary event listeners
   */
  detachHoverBoundaryListeners() {
    if (this.hoverBoundaryMouseOver) {
      document.removeEventListener("mouseover", this.hoverBoundaryMouseOver);
    }
    if (this.hoverBoundaryMouseOut) {
      document.removeEventListener("mouseout", this.hoverBoundaryMouseOut);
    }
  }

  /**
   * Check if element should show boundary
   */
  shouldShowBoundary(element) {
    // Skip if element is context menu or its children
    if (element.closest("#nexa-context-menu")) {
      return false;
    }

    // Skip if element is script, style, or meta
    if (
      ["script", "style", "meta", "head", "title"].includes(
        element.tagName.toLowerCase()
      )
    ) {
      return false;
    }

    // IMPORTANT: Check if element is within enabled containers
    if (!this.isElementInAllowedContainer(element)) {
      return false;
    }

    return true;
  }

  /**
   * Show boundary for a single element
   */
  showElementBoundary(element) {
    if (!element || !this.shouldShowBoundary(element)) return;

    // Store original styles if not already stored
    if (!element._nexaBoundaryOriginalStyles) {
      element._nexaBoundaryOriginalStyles = {
        border: element.style.border,
        outline: element.style.outline,
        backgroundColor: element.style.backgroundColor,
        boxShadow: element.style.boxShadow,
      };
    }

    this.applyBoundaryStyle(element);
    this.boundaryElements.add(element);
  }

  /**
   * Hide boundary for a single element
   */
  hideElementBoundary(element) {
    if (!element || !element._nexaBoundaryOriginalStyles) return;

    // Restore original styles
    const original = element._nexaBoundaryOriginalStyles;
    element.style.border = original.border;
    element.style.outline = original.outline;
    element.style.backgroundColor = original.backgroundColor;
    element.style.boxShadow = original.boxShadow;

    // Clean up
    delete element._nexaBoundaryOriginalStyles;
    this.boundaryElements.delete(element);
  }

  /**
   * Apply boundary style to element
   */
  applyBoundaryStyle(element) {
    const styles = this.getBoundaryStyleConfig();
    const style = styles[this.boundaryStyle] || styles.subtle;

    element.style.border = style.border;
    element.style.outline = style.outline;
    element.style.backgroundColor = style.backgroundColor;
    if (style.boxShadow) {
      element.style.boxShadow = style.boxShadow;
    }
  }

  /**
   * Get boundary style configuration
   */
  getBoundaryStyleConfig() {
    return {
      subtle: {
        border: "1px solid rgba(0, 123, 255, 0.3)",
        outline: "none",
        backgroundColor: "rgba(0, 123, 255, 0.05)",
      },
      visible: {
        border: "2px dashed #007bff",
        outline: "1px solid #007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
      },
      highlight: {
        border: "2px solid #007bff",
        outline: "2px solid #ffffff",
        backgroundColor: "rgba(0, 123, 255, 0.15)",
        boxShadow: "0 0 0 4px rgba(0, 123, 255, 0.3)",
      },
    };
  }

  /**
   * Show boundaries for all interactive elements
   */
  showAllElementBoundaries() {
    const elements = this.getAllInteractiveElements();
    elements.forEach((element) => {
      this.showElementBoundary(element);
    });
  }

  /**
   * Hide all element boundaries
   */
  hideAllElementBoundaries() {
    this.boundaryElements.forEach((element) => {
      this.hideElementBoundary(element);
    });
    this.boundaryElements.clear();
  }

  /**
   * Get all interactive elements
   */
  getAllInteractiveElements() {
    const allElements = [];

    // Get elements based on configuration - prioritize enabledIds (like formcontainer)
    if (this.config.enabledIds.length > 0) {
      this.config.enabledIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          // Add the container itself and all its children
          allElements.push(element);
          allElements.push(...element.querySelectorAll("*"));
        }
      });
    }
    // Check for enabledClasses
    else if (this.config.enabledClasses.length > 0) {
      this.config.enabledClasses.forEach((className) => {
        const elements = document.querySelectorAll(`.${className}`);
        elements.forEach((element) => {
          allElements.push(element);
          allElements.push(...element.querySelectorAll("*"));
        });
      });
    }
    // Only if global is enabled and no specific containers
    else if (this.config.enableGlobal) {
      allElements.push(...document.querySelectorAll("body *"));
    }

    return allElements.filter((element) => this.shouldShowBoundary(element));
  }

  // ========================================
  // ZOOM FUNCTIONALITY
  // ========================================

  /**
   * Zoom in element (increase by 25%)
   */
  contextZoomInElement() {
    try {
      const newZoomLevel = Math.min(this.currentZoomLevel + 25, 200); // Max 200%
      return this.contextZoomElementTo(newZoomLevel);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Zoom out element (decrease by 25%)
   */
  contextZoomOutElement() {
    try {
      const newZoomLevel = Math.max(this.currentZoomLevel - 25, 25); // Min 25%
      return this.contextZoomElementTo(newZoomLevel);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Zoom element to specific percentage
   */
  contextZoomElementTo(zoomLevel) {
    try {
      // Find the enabled container (like formcontainer)
      const targetContainer = this.getEnabledContainer();
      if (!targetContainer) {
        throw new Error("No enabled container found for zoom");
      }

      this.currentZoomLevel = zoomLevel;
      this.applyZoomToContainer(targetContainer, zoomLevel);

      console.log(`✅ Zoom set to ${zoomLevel}%`);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Zoom element to 50%
   */
  contextZoomElementTo50() {
    return this.contextZoomElementTo(50);
  }

  /**
   * Zoom element to 75%
   */
  contextZoomElementTo75() {
    return this.contextZoomElementTo(75);
  }

  /**
   * Zoom element to 100%
   */
  contextZoomElementTo100() {
    return this.contextZoomElementTo(100);
  }

  /**
   * Zoom element to 125%
   */
  contextZoomElementTo125() {
    return this.contextZoomElementTo(125);
  }

  /**
   * Zoom element to 150%
   */
  contextZoomElementTo150() {
    return this.contextZoomElementTo(150);
  }

  // Zoom shortcuts for menu actions
  zoomInElement() {
    return this.contextZoomInElement();
  }

  zoomOutElement() {
    return this.contextZoomOutElement();
  }

  zoomElementTo50() {
    return this.contextZoomElementTo(50);
  }

  zoomElementTo75() {
    return this.contextZoomElementTo(75);
  }

  zoomElementTo100() {
    return this.contextZoomElementTo(100);
  }

  zoomElementTo125() {
    return this.contextZoomElementTo(125);
  }

  zoomElementTo150() {
    return this.contextZoomElementTo(150);
  }

  zoomFitToContainer() {
    return this.contextZoomFitToContainer();
  }

  /**
   * Zoom to fit container
   */
  contextZoomFitToContainer() {
    try {
      const targetContainer = this.getEnabledContainer();
      if (!targetContainer) {
        throw new Error("No enabled container found for zoom fit");
      }

      // Calculate optimal zoom level to fit container in viewport
      const containerRect = targetContainer.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const scaleX = (viewportWidth * 0.9) / containerRect.width; // 90% of viewport
      const scaleY = (viewportHeight * 0.9) / containerRect.height;
      const optimalScale = Math.min(scaleX, scaleY, 1); // Don't zoom beyond 100%

      const zoomLevel = Math.round(optimalScale * 100);
      return this.contextZoomElementTo(zoomLevel);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Get the enabled container for operations
   */
  getEnabledContainer() {
    // Priority: enabledIds first
    if (this.config.enabledIds.length > 0) {
      for (const id of this.config.enabledIds) {
        const element = document.getElementById(id);
        if (element) {
          return element;
        }
      }
    }

    // Then enabledClasses
    if (this.config.enabledClasses.length > 0) {
      for (const className of this.config.enabledClasses) {
        const element = document.querySelector(`.${className}`);
        if (element) {
          return element;
        }
      }
    }

    // Fallback to body if global enabled
    return this.config.enableGlobal ? document.body : null;
  }

  /**
   * Apply zoom transformation to container
   */
  applyZoomToContainer(container, zoomLevel) {
    const scale = zoomLevel / 100;

    // Apply smooth transition
    container.style.transition = "transform 0.3s ease-in-out";

    // Set transform origin to center
    container.style.transformOrigin = "center center";

    // Apply scale transformation
    container.style.transform = `scale(${scale})`;

    // Adjust container overflow for better UX
    if (scale !== 1) {
      // When zoomed, allow scrolling
      const parentElement = container.parentElement || document.body;
      parentElement.style.overflow = "auto";
    } else {
      // Reset overflow when back to 100%
      const parentElement = container.parentElement || document.body;
      if (
        this.originalContainerStyles &&
        this.originalContainerStyles.overflow
      ) {
        parentElement.style.overflow = this.originalContainerStyles.overflow;
      }
    }
  }

  /**
   * Reset zoom to 100%
   */
  resetZoom() {
    try {
      return this.contextZoomElementTo(100);
    } catch (error) {
      console.error("Error resetting zoom:", error);
    }
  }

  /**
   * Toggle wheel zoom functionality
   */
  contextToggleWheelZoom() {
    try {
      this.wheelZoomEnabled = !this.wheelZoomEnabled;

      if (this.wheelZoomEnabled) {
        this.attachWheelZoomListeners();
      } else {
        this.detachWheelZoomListeners();
      }

      console.log(
        `✅ Wheel zoom ${this.wheelZoomEnabled ? "enabled" : "disabled"}`
      );
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Attach wheel zoom listeners
   */
  attachWheelZoomListeners() {
    this.wheelZoomHandler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10; // Zoom out/in by 10%
        const newZoomLevel = Math.min(
          Math.max(this.currentZoomLevel + delta, 25),
          200
        );
        this.contextZoomElementTo(newZoomLevel);
      }
    };

    const targetContainer = this.getEnabledContainer();
    if (targetContainer) {
      targetContainer.addEventListener("wheel", this.wheelZoomHandler, {
        passive: false,
      });
    }
  }

  /**
   * Detach wheel zoom listeners
   */
  detachWheelZoomListeners() {
    if (this.wheelZoomHandler) {
      const targetContainer = this.getEnabledContainer();
      if (targetContainer) {
        targetContainer.removeEventListener("wheel", this.wheelZoomHandler);
      }
    }
  }

  // ========================================
  // FULLSCREEN FUNCTIONALITY
  // ========================================

  /**
   * Enter fullscreen mode with percentage of viewport
   */
  contextFullscreenPercentage(percentage) {
    try {
      const targetContainer = this.getEnabledContainer();
      if (!targetContainer) {
        throw new Error("No enabled container found for fullscreen");
      }

      const viewportWidth = window.innerWidth * (percentage / 100);
      const viewportHeight = window.innerHeight * (percentage / 100);

      this.enterFullscreenMode(
        targetContainer,
        viewportWidth,
        viewportHeight,
        `${percentage}% Viewport`
      );

      console.log(
        `✅ Fullscreen mode activated: ${percentage}% of viewport (${Math.round(
          viewportWidth
        )}x${Math.round(viewportHeight)})`
      );
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Enter fullscreen mode with specific viewport dimensions
   */
  contextFullscreenViewport(width, height, deviceName) {
    try {
      const targetContainer = this.getEnabledContainer();
      if (!targetContainer) {
        throw new Error("No enabled container found for fullscreen");
      }

      this.enterFullscreenMode(targetContainer, width, height, deviceName);

      console.log(
        `✅ Fullscreen mode activated: ${deviceName} (${width}x${height})`
      );
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  /**
   * Exit fullscreen mode
   */
  contextExitFullscreen() {
    try {
      if (!this.isFullscreenActive) {
        console.error("Error: Not in fullscreen mode");
        return;
      }

      this.exitFullscreenMode();

      console.log("✅ Exited fullscreen mode");
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  // Fullscreen percentage shortcuts
  fullscreenPercentage50() {
    return this.contextFullscreenPercentage(50);
  }

  fullscreenPercentage75() {
    return this.contextFullscreenPercentage(75);
  }

  fullscreenPercentage90() {
    return this.contextFullscreenPercentage(90);
  }

  fullscreenPercentage100() {
    return this.contextFullscreenPercentage(100);
  }

  // Desktop fullscreen shortcuts
  fullscreenDesktopHD() {
    return this.contextFullscreenViewport(1366, 768, "HD Desktop");
  }

  fullscreenDesktopFHD() {
    return this.contextFullscreenViewport(1920, 1080, "Full HD Desktop");
  }

  fullscreenDesktop2K() {
    return this.contextFullscreenViewport(2560, 1440, "2K Desktop");
  }

  fullscreenDesktop4K() {
    return this.contextFullscreenViewport(3840, 2160, "4K Desktop");
  }

  // Tablet fullscreen shortcuts
  fullscreenIPad() {
    return this.contextFullscreenViewport(768, 1024, "iPad");
  }

  fullscreenIPadPro() {
    return this.contextFullscreenViewport(1024, 1366, "iPad Pro");
  }

  fullscreenAndroidTablet() {
    return this.contextFullscreenViewport(800, 1280, "Android Tablet");
  }

  // Mobile fullscreen shortcuts
  fullscreenIPhoneSE() {
    return this.contextFullscreenViewport(375, 667, "iPhone SE");
  }

  fullscreenIPhone12() {
    return this.contextFullscreenViewport(390, 844, "iPhone 12");
  }

  fullscreenIPhoneProMax() {
    return this.contextFullscreenViewport(428, 926, "iPhone Pro Max");
  }

  fullscreenAndroidMobile() {
    return this.contextFullscreenViewport(360, 640, "Android Mobile");
  }

  /**
   * Enter fullscreen mode implementation
   */
  enterFullscreenMode(container, width, height, modeName) {
    // Exit existing fullscreen if active
    if (this.isFullscreenActive) {
      this.exitFullscreenMode();
    }

    // Store original styles
    this.originalBodyStyles = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      overflow: document.body.style.overflow,
      height: document.body.style.height,
      width: document.body.style.width,
    };

    // Store original parent before moving container
    this.originalContainerParent = container.parentElement;

    this.originalContainerPosition = {
      position: container.style.position,
      top: container.style.top,
      left: container.style.left,
      width: container.style.width,
      height: container.style.height,
      zIndex: container.style.zIndex,
      margin: container.style.margin,
      padding: container.style.padding,
      transform: container.style.transform,
    };

    // Apply fullscreen styles to body
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.width = "100vw";

    // Apply fullscreen styles to container
    container.style.position = "fixed";
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.transform = "translate(-50%, -50%)";
    container.style.zIndex = "9999";
    container.style.margin = "0";
    container.style.padding = "20px";
    container.style.backgroundColor = "white";
    container.style.boxShadow = "0 0 50px rgba(0,0,0,0.5)";

    // Move container to body if it's not already there
    if (container.parentElement !== document.body) {
      document.body.appendChild(container);
    }

    this.fullscreenContainer = container;
    this.isFullscreenActive = true;
    this.attachFullscreenKeyHandlers();
  }

  /**
   * Exit fullscreen mode implementation
   */
  exitFullscreenMode() {
    if (!this.isFullscreenActive) return;

    // Restore container to original position using stored parent
    if (this.originalContainerParent && this.fullscreenContainer) {
      console.log(
        "🔄 Restoring container to original parent:",
        this.originalContainerParent
      );
      this.originalContainerParent.appendChild(this.fullscreenContainer);

      // Restore container styles
      const container = this.fullscreenContainer;
      const original = this.originalContainerPosition;

      container.style.position = original.position;
      container.style.top = original.top;
      container.style.left = original.left;
      container.style.width = original.width;
      container.style.height = original.height;
      container.style.zIndex = original.zIndex;
      container.style.margin = original.margin;
      container.style.padding = original.padding;
      container.style.transform = original.transform;
      container.style.backgroundColor = "";
      container.style.boxShadow = "";
    }

    // Restore body styles
    if (this.originalBodyStyles) {
      document.body.style.margin = this.originalBodyStyles.margin;
      document.body.style.padding = this.originalBodyStyles.padding;
      document.body.style.overflow = this.originalBodyStyles.overflow;
      document.body.style.height = this.originalBodyStyles.height;
      document.body.style.width = this.originalBodyStyles.width;
    }

    // Clean up
    this.isFullscreenActive = false;
    this.fullscreenContainer = null;
    this.originalContainerParent = null;
    this.originalContainerPosition = null;
    this.originalBodyStyles = null;
    this.detachFullscreenKeyHandlers();
  }

  /**
   * Attach fullscreen keyboard handlers
   */
  attachFullscreenKeyHandlers() {
    this.fullscreenKeyHandler = (e) => {
      if (e.key === "Escape") {
        this.exitFullscreenMode();
      }
    };
    document.addEventListener("keydown", this.fullscreenKeyHandler);
  }

  /**
   * Detach fullscreen keyboard handlers
   */
  detachFullscreenKeyHandlers() {
    if (this.fullscreenKeyHandler) {
      document.removeEventListener("keydown", this.fullscreenKeyHandler);
    }
  }

  // ========================================
  // DRAG AND DROP HANDLERS (Native HTML5)
  // ========================================

  handleDragStartGeneral(e) {
    // Validate target element
    if (!e.target || !this.isElement(e.target)) {
      console.warn("Invalid drag target - not a valid DOM element");
      e.preventDefault();
      return;
    }

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.target.style.opacity = "0.5";
    this._draggedElement = e.target;
  }

  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = "move";
    return false;
  }

  handleDrop(e) {
    e.preventDefault();
  }

  /**
   * Handle drag end event (General)
   */
  handleDragEndGeneral(e) {
    // Validate target element
    if (!e.target || !e.target.style) {
      console.warn("Invalid drag end target");
      return;
    }

    // Restore all original styles
    if (e.target._nexaDragOriginalStyles) {
      const originalStyles = e.target._nexaDragOriginalStyles;
      e.target.style.opacity = originalStyles.opacity;
      e.target.style.transform = originalStyles.transform;
      e.target.style.transition = originalStyles.transition;
      e.target.style.boxShadow = originalStyles.boxShadow;
      e.target.style.border = originalStyles.border;
      e.target.style.backgroundColor = originalStyles.backgroundColor;
      e.target.style.zIndex = originalStyles.zIndex;

      // Clean up stored styles
      delete e.target._nexaDragOriginalStyles;
    } else {
      // Fallback: reset opacity if no original styles were stored
      e.target.style.opacity = "";
    }

    // Update drag indices after reordering
    if (e.target.parentElement) {
      this.updateDragIndices(e.target.parentElement);
    }

    // Clear throttle timer if it exists
    if (this._dragThrottle) {
      clearTimeout(this._dragThrottle);
      this._dragThrottle = null;
    }

    // Clear drag references
    this._draggedElement = null;
    this._draggedFromContainer = null;
  }

  /**
   * Update indices for all children after reordering (supports both sortable and draggable)
   */
  updateDragIndices(container) {
    if (!container) return;

    Array.from(container.children).forEach((child, index) => {
      // Update sortable index (jQuery UI)
      if (child.hasAttribute("data-nexa-sort-index")) {
        child.setAttribute("data-nexa-sort-index", index);
      }
      // Update draggable index (for compatibility)
      if (child.hasAttribute("data-nexa-drag-index")) {
        child.setAttribute("data-nexa-drag-index", index);
      }
    });
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Check if object is a DOM element
   */
  isElement(obj) {
    try {
      // Using the DOM4 method when available
      return obj instanceof Element;
    } catch (e) {
      // Fallback for older browsers
      return (
        typeof obj === "object" &&
        obj.nodeType === 1 &&
        typeof obj.style === "object" &&
        typeof obj.ownerDocument === "object"
      );
    }
  }

  /**
   * EMERGENCY: Force clean all Interactions styles from element
   * Use this when normal disable methods don't work
   */
  forceCleanAllStyles(element) {
    console.log(
      "🚨 EMERGENCY: Force cleaning all Interactions styles from:",
      element.tagName,
      element.className
    );

    if (!element) return;

    // Remove all stored original styles
    delete element._nexaDraggableOriginalStyles;
    delete element._nexaResizableOriginalStyles;
    delete element._nexaSortableOriginalStyles;

    // Remove all CSS classes
    element.classList.remove(
      "nexa-draggable",
      "nexa-resizable",
      "nexa-sortable"
    );

    // Force clean all our colors
    this.forceCleanDraggableColors(element);
    this.forceCleanResizableColors(element);
    this.forceCleanSortableColors(element);

    // Final brute force cleanup
    const dangerousColors = [
      "#007bff",
      "rgba(0, 123, 255",
      "rgb(0, 123, 255)", // Blue (draggable)
      "#28a745",
      "rgba(40, 167, 69",
      "rgb(40, 167, 69)", // Green (resizable)
      "#fd7e14",
      "rgba(253, 126, 20",
      "rgb(253, 126, 20)", // Orange (sortable)
    ];

    const style = element.style;
    const propsToRemove = [];

    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      const value = style.getPropertyValue(prop);

      if (dangerousColors.some((color) => value.includes(color))) {
        propsToRemove.push(prop);
      }
    }

    propsToRemove.forEach((prop) => {
      style.removeProperty(prop);
      style.setProperty(prop, "", "important");
      style[prop] = "";
      console.log(`🧽 EMERGENCY removed ${prop}`);
    });

    console.log("🚨 EMERGENCY cleanup completed!");
  }

  /**
   * Force clean sortable colors (enhanced version)
   */
  forceCleanSortableColors(container) {
    if (!container) return;

    console.log("🧽 EMERGENCY: Final cleanup of sortable colors...");

    const style = container.style;
    const properties = [];

    // Enhanced color detection including various formats
    const sortableColors = [
      "#fd7e14",
      "rgba(253, 126, 20",
      "rgb(253, 126, 20",
      "rgba(253,126,20", // No spaces
      "rgb(253,126,20", // No spaces
      "dashed", // Our border style
    ];

    // Collect all properties that might contain our colors
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      const value = style.getPropertyValue(prop);

      if (this.containsSortableColors(value)) {
        properties.push(prop);
      }
    }

    // AGGRESSIVE: Also check specific properties directly
    const criticalProps = ["border", "outline", "backgroundColor", "boxShadow"];
    criticalProps.forEach((prop) => {
      const value = style.getPropertyValue(prop) || style[prop];
      if (value && this.containsSortableColors(value)) {
        if (!properties.includes(prop)) {
          properties.push(prop);
        }
      }
    });

    // Remove all properties containing sortable colors
    properties.forEach((prop) => {
      // Multiple removal methods for stubborn styles
      const currentValue = style.getPropertyValue(prop);
      console.log(`🧽 Removing ${prop}: ${currentValue}`);

      style.removeProperty(prop);
      style.setProperty(prop, "", "important");
      style[prop] = "";

      console.log(`🧽 Final sortable cleanup removed ${prop}`);
    });

    // FINAL CHECK: Brute force removal of exact sortable styles
    const exactStyles = {
      border: ["2px dashed #fd7e14"],
      outline: ["1px solid rgba(253, 126, 20, 0.3)"],
      backgroundColor: ["rgba(253, 126, 20, 0.05)"],
      boxShadow: ["0 0 0 2px rgba(253, 126, 20, 0.2)"],
    };

    Object.entries(exactStyles).forEach(([prop, values]) => {
      const current = style.getPropertyValue(prop);
      if (
        current &&
        values.some((val) => current.includes(val.replace(/\s/g, "")))
      ) {
        console.log(`🚨 FINAL: Force removing exact match ${prop}: ${current}`);
        style.removeProperty(prop);
        style.setProperty(prop, "", "important");
      }
    });

    console.log("🧽 EMERGENCY sortable cleanup completed!");
  }

  /**
   * Set target element for context menu operations
   */
  setTargetElement(element) {
    console.log("🎯 Interactions.setTargetElement called:", {
      element: element,
      elementTag: element?.tagName,
      elementId: element?.id,
      elementClasses: Array.from(element?.classList || []),
      isAllowed: element ? this.isContextMenuAllowed(element) : false,
    });
    this.targetElement = element;
  }

  /**
   * Get current target element
   */
  getTargetElement() {
    return this.targetElement;
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Interactions;
} else if (typeof window !== "undefined") {
  window.Interactions = Interactions;
}
export { Interactions };
