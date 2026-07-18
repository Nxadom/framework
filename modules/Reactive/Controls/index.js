/**
 * NexaReactive.js - Lightweight Context Menu System
 * Provides right-click context menu functionality with content editing features
 * Includes text editing, formatting, and basic menu operations
 */

// Import all interaction classes
import { Sortable } from "./Sortable.js";
import { Draggable } from "./Draggable.js";
import { Resizable } from "./Resizable.js";

class Interactions {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      enabledIds: [],
      enabledClasses: [],
      enableGlobal: false,
      ...options,
    };

    this.nexaUI = typeof NexaUI !== "undefined" ? NexaUI() : null;

    // Initialize element interaction states
    this.boundaryElements = new Set();

    // Initialize all interaction instances
    this.sortable = new Sortable(this);
    this.draggable = new Draggable(this);
    this.resizable = new Resizable(this);

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
        icon: "settings",
        text: "Element Controls",
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
            id: "disable-all-interactions",
            icon: "x-circle",
            text: "Disable All",
            action: "disableAllInteractions",
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
   * Context menu: Toggle sortable (delegated to Sortable class)
   */
  contextToggleSortable() {
    return this.sortable.contextToggleSortable();
  }

  // Sortable functionality moved to Sortable.js
  // getVisualIndicatorStyle moved to Sortable.js

  // REMOVED: updateChildrenSortable (HTML5 version) - no longer needed, using updateChildrenSortableJQuery

  // updateChildrenSortableJQuery moved to Sortable.js

  // REMOVED: enableNativeSortable - no longer needed, using jQuery UI Sortable only

  // disableSortable moved to Sortable.js
  // REMOVED: handleDragStart - no longer needed, using jQuery UI Sortable

  // REMOVED: handleDragOver - no longer needed, using jQuery UI Sortable

  // REMOVED: handleDrop - no longer needed, using jQuery UI Sortable

  // REMOVED: handleDragEnd - no longer needed, using jQuery UI Sortable

  // REMOVED: updateDragIndices - no longer needed, using jQuery UI Sortable
  // REMOVED: getDragAfterElement - no longer needed, using jQuery UI Sortable

  // findSortableContainer moved to Sortable.js
  /**
   * Check if element is inside an allowed container for sortable
   */
  isElementInAllowedContainer(element) {
    if (!element) return false;
    const cfg = this.config || {};
    const enabledIds = cfg.enabledIds || [];
    const enabledClasses = cfg.enabledClasses || [];
    const enableGlobal = cfg.enableGlobal || false;

    if (!enabledIds.length && !enabledClasses.length && !enableGlobal) return true;

    let currentElement = element;
    while (currentElement) {
      if (enabledIds.length > 0) {
        if (currentElement.id && enabledIds.includes(currentElement.id)) return true;
      }
      if (enabledClasses.length > 0 && currentElement.classList) {
        for (const className of enabledClasses) {
          if (currentElement.classList.contains(className)) return true;
        }
      }
      currentElement = currentElement.parentElement;
      if (currentElement === document.body) break;
    }

    return enableGlobal;
  }

  /**
   * Check if context menu is allowed for element
   */
  _cfg() {
    return this.config || (this.config = { enabledIds: [], enabledClasses: [], enableGlobal: false });
  }

  isContextMenuAllowed(element) {
    if (!element) return false;
    const cfg = this.config || {};
    const enabledIds = cfg.enabledIds || [];
    const enabledClasses = cfg.enabledClasses || [];
    const enableGlobal = cfg.enableGlobal || false;

    if (!enabledIds.length && !enabledClasses.length && !enableGlobal) return true;

    if (enabledIds.length > 0 && element.id && enabledIds.includes(element.id)) return true;

    if (enabledClasses.length > 0 && element.classList) {
      for (const className of enabledClasses) {
        if (element.classList.contains(className)) return true;
      }
    }

    return this.isElementInAllowedContainer(element) || enableGlobal;
  }

  // REMOVED: Duplicate disableSortable method - using improved version above

  // applySortableVisualStyle moved to Sortable.js

  // removeSortableVisualStyle moved to Sortable.js

  // containsSortableColors moved to Sortable.js

  // containerHasSortableColors moved to Sortable.js

  // REMOVED: enableNativeSortable and disableNativeSortable - no longer needed, using jQuery UI Sortable only

  // ========================================
  // DRAGGABLE FUNCTIONALITY
  // ========================================

  /**
   * Context menu: Toggle jQuery UI Draggable functionality for ALL elements in container (delegated to Draggable class)
   */
  contextToggleDraggable() {
    return this.draggable.contextToggleDraggable();
  }

  // OLD CODE BELOW - TO BE REMOVED:
  /*
  contextToggleDraggable_OLD() {
    try {
      // Check if jQuery is available
      if (typeof $ === "undefined") {
        return { success: false, error: "jQuery not found" };
      }

      if (!this.targetElement) {
        throw new Error("No target element selected");
      }

      // Find the appropriate container for draggable using the same logic as sortable
      let draggableContainer = this.sortable.findSortableContainer(
        this.targetElement
      );

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

  // enableAllDraggable moved to Draggable.js (delegated)
  enableAllDraggable(container) {
    return this.draggable.enableAllDraggable(container);
  }

  // OLD CODE BELOW - TO BE REMOVED:
  /*
  enableAllDraggable_OLD(container) {
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

  // disableAllDraggable moved to Draggable.js (delegated)
  disableAllDraggable(container) {
    return this.draggable.disableAllDraggable(container);
  }

  // OLD CODE BELOW - TO BE REMOVED:
  /*
  disableAllDraggable_OLD(container) {
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

  // elementHasDraggableColors moved to Draggable.js (delegated)
  elementHasDraggableColors(element) {
    return this.draggable.elementHasDraggableColors(element);
  }

  // debugDraggablePosition moved to Draggable.js (delegated)
  debugDraggablePosition(element) {
    return this.draggable.debugDraggablePosition(element);
  }

  // applyDraggableVisualStyle moved to Draggable.js (delegated)
  applyDraggableVisualStyle(element) {
    return this.draggable.applyDraggableVisualStyle(element);
  }

  // removeDraggableVisualStyle moved to Draggable.js (delegated)
  removeDraggableVisualStyle(element) {
    return this.draggable.removeDraggableVisualStyle(element);
  }

  // forceRemoveDraggableStyles moved to Draggable.js (delegated)
  forceRemoveDraggableStyles(element) {
    return this.draggable.forceRemoveDraggableStyles(element);
  }

  // containsDraggableColors moved to Draggable.js (delegated)
  containsDraggableColors(value) {
    return this.draggable.containsDraggableColors(value);
  }

  // forceCleanDraggableColors moved to Draggable.js (delegated)
  forceCleanDraggableColors(element) {
    return this.draggable.forceCleanDraggableColors(element);
  }

  // OLD CODE BELOW - TO BE REMOVED:
  /*
  forceCleanDraggableColors_OLD(element) {
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
   * Context menu: Toggle jQuery UI Resizable functionality for ALL elements in container (delegated to Resizable class)
   */
  contextToggleResizable() {
    return this.resizable.contextToggleResizable();
  }

  // OLD CODE BELOW - TO BE REMOVED:
  /*
  contextToggleResizable_OLD() {
    try {
      if (!this.targetElement) {
        throw new Error("No target element selected");
      }

      // Find the appropriate container for resizable using the same logic as sortable
      let resizableContainer = this.sortable.findSortableContainer(
        this.targetElement
      );

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

  // enableAllResizable moved to Resizable.js (delegated)
  enableAllResizable(container) {
    return this.resizable.enableAllResizable(container);
  }

  // disableAllResizable moved to Resizable.js (delegated)
  disableAllResizable(container) {
    return this.resizable.disableAllResizable(container);
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

  // addSortableStyles moved to Sortable.js

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
    if (
      currentBorder &&
      this.resizable.containsResizableColors(currentBorder)
    ) {
      element.style.removeProperty("border");
      console.log("🎯 Removed resizable border indicator");
    }

    const currentOutline = element.style.outline;
    if (
      currentOutline &&
      this.resizable.containsResizableColors(currentOutline)
    ) {
      element.style.removeProperty("outline");
      console.log("🎯 Removed resizable outline indicator");
    }

    const currentBackground = element.style.backgroundColor;
    if (
      currentBackground &&
      this.resizable.containsResizableColors(currentBackground)
    ) {
      element.style.removeProperty("backgroundColor");
      console.log("🎯 Removed resizable background indicator");
    }

    const currentBoxShadow = element.style.boxShadow;
    if (
      currentBoxShadow &&
      this.resizable.containsResizableColors(currentBoxShadow)
    ) {
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

  // forceRemoveResizableStyles moved to Resizable.js (delegated)
  forceRemoveResizableStyles(element) {
    return this.resizable.forceRemoveResizableStyles(element);
  }

  // containsResizableColors moved to Resizable.js (delegated)
  containsResizableColors(value) {
    return this.resizable.containsResizableColors(value);
  }

  // forceCleanResizableColors moved to Resizable.js (delegated)
  forceCleanResizableColors(element) {
    return this.resizable.forceCleanResizableColors(element);
  }

  // OLD CODE BELOW - TO BE REMOVED:
  /*
  forceCleanResizableColors_OLD(element) {
    console.log("🧽 Final cleanup of resizable colors...");

    const style = element.style;
    const properties = [];

    // Collect all properties that might contain our colors
    for (let i = 0; i < style.length; i++) {
      const prop = style[i];
      const value = style.getPropertyValue(prop);

      if (this.resizable.containsResizableColors(value)) {
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
      if (!this.targetElement) return;
      const el = this.targetElement;
      // Cari container — coba enabledIds dulu, fallback ke parentElement
      let container = el.parentElement;
      const ids = this.config?.enabledIds || [];
      if (ids.length > 0) {
        let cur = el;
        while (cur) {
          if (cur.id && ids.includes(cur.id)) { container = cur; break; }
          cur = cur.parentElement;
        }
      }
      if (!container) return;
      let highest = 0;
      Array.from(container.children).forEach(c => {
        const z = parseInt(getComputedStyle(c).zIndex);
        if (!isNaN(z) && z > highest) highest = z;
      });
      el.style.zIndex = Math.max(highest + 1, 1);
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      return { success: true, message: 'Moved to front' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  /**
   * Context menu: Send element to back (decrease z-index)
   */
  contextToBack() {
    try {
      if (!this.targetElement) return;
      const el = this.targetElement;
      let container = el.parentElement;
      const ids = this.config?.enabledIds || [];
      if (ids.length > 0) {
        let cur = el;
        while (cur) {
          if (cur.id && ids.includes(cur.id)) { container = cur; break; }
          cur = cur.parentElement;
        }
      }
      if (!container) return;
      let lowest = 0;
      Array.from(container.children).forEach(c => {
        const z = parseInt(getComputedStyle(c).zIndex);
        if (!isNaN(z) && z < lowest) lowest = z;
      });
      el.style.zIndex = lowest - 1;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      return { success: true, message: 'Moved to back' };
    } catch (e) {
      return { success: false, error: e.message };
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

      if (this.allBoundariesEnabled) {
        // Refresh semua — hide dulu lalu show ulang dengan style baru
        this.hideAllElementBoundaries();
        this.showAllElementBoundaries();
      } else if (this.hoverBoundariesEnabled && this.boundaryElements.size > 0) {
        // Update elemen yang sedang aktif di hover mode
        this.boundaryElements.forEach((element) => {
          this.applyBoundaryStyle(element);
        });
      } else {
        // Tidak ada mode aktif — aktifkan Show All agar style langsung terlihat
        this.allBoundariesEnabled = true;
        this.showAllElementBoundaries();
      }

      return { success: true, message: `Boundary style: ${style}` };
    } catch (error) {
      return { success: false, error: error.message };
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
    return this.sortable.toggleSortable();
  }

  toggleDraggable() {
    return this.draggable.toggleDraggable();
  }

  toggleResizable() {
    return this.resizable.toggleResizable();
  }

  disableAllInteractions() {
    // 1. Sortable
    [...this.sortable.sortableElements].forEach(c => this.sortable._disable(c));

    // 2. Draggable
    [...this.draggable.draggableElements].forEach(el => this.draggable._disable(el));
    // Restore container contenteditable jika masih tertahan
    document.querySelectorAll('[contenteditable="false"]').forEach(el => {
      if (el._nxDragCE !== undefined) {
        if (el._nxDragCE === null) el.removeAttribute('contenteditable');
        else el.setAttribute('contenteditable', el._nxDragCE);
        delete el._nxDragCE;
      }
    });

    // 3. Resizable
    [...this.resizable.resizableElements].forEach(el => this.resizable._disable(el));

    // 4. Hover Boundaries — detach listener langsung, reset flag
    try {
      this.detachHoverBoundaryListeners();
      this.hoverBoundariesEnabled = false;
    } catch(e) {}

    // 5. All Boundaries — hide langsung, reset flag
    try {
      this.hideAllElementBoundaries();
      this.allBoundariesEnabled = false;
    } catch(e) {}

    return { success: true, message: "Semua Element Controls dinonaktifkan" };
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
      const hasDraggable = this.draggable.elementHasDraggableColors(element);
      const hasResizable = this.resizable.containsResizableColors(
        element.style.cssText
      );

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

  // debugSortableColors moved to Sortable.js (delegated)
  debugSortableColors(containerId = "file-viewercontent-edit-sdk") {
    return this.sortable.debugSortableColors(containerId);
  }

  // OLD CODE BELOW - TO BE REMOVED:
  /*
  debugSortableColors_OLD(containerId = "file-viewercontent-edit-sdk") {
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
      if (this.sortable.containerHasSortableColors(element)) {
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

  // quickFixRemoveOrangeBorders moved to Sortable.js (delegated)
  quickFixRemoveOrangeBorders(containerId = "file-viewercontent-edit-sdk") {
    return this.sortable.quickFixRemoveOrangeBorders(containerId);
  }

  // OLD CODE BELOW - TO BE REMOVED:
  /*
  quickFixRemoveOrangeBorders_OLD(containerId = "file-viewercontent-edit-sdk") {
    console.log("🩹 QUICK FIX: Removing all orange sortable borders...");

    const container = document.getElementById(containerId);
    if (!container) return "Container not found!";

    const allElements = Array.from(container.querySelectorAll("*"));
    allElements.push(container);

    let fixedCount = 0;

    allElements.forEach((element) => {
      const hasSortableProblem = this.sortable.containerHasSortableColors(element);

      if (hasSortableProblem) {
        console.log(
          "🩹 Quick fixing sortable element:",
          element.tagName,
          element.className
        );

        // Force clean sortable colors
        this.sortable.forceCleanSortableColors(element);

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
        this.resizable.containsResizableColors(element.style.cssText) ||
        this.draggable.elementHasDraggableColors(element);

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

    if (!element._nexaBoundaryOriginalStyles) {
      element._nexaBoundaryOriginalStyles = {
        border:          element.style.border          || '',
        outline:         element.style.outline         || '',
        backgroundColor: element.style.backgroundColor || '',
        boxShadow:       element.style.boxShadow       || '',
      };
    }

    this.applyBoundaryStyle(element);
    this.boundaryElements.add(element);
  }

  /**
   * Hide boundary for a single element
   */
  hideElementBoundary(element) {
    if (!element) return;

    const original = element._nexaBoundaryOriginalStyles;
    if (original) {
      element.style.border          = original.border;
      element.style.outline         = original.outline;
      element.style.backgroundColor = original.backgroundColor;
      element.style.boxShadow       = original.boxShadow;
      delete element._nexaBoundaryOriginalStyles;
    } else {
      // Tidak ada original tersimpan — hapus style boundary langsung
      element.style.removeProperty('border');
      element.style.removeProperty('outline');
      element.style.removeProperty('box-shadow');
    }

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
    const ids     = this.config?.enabledIds     || [];
    const classes = this.config?.enabledClasses || [];
    const global  = this.config?.enableGlobal   || false;

    if (ids.length > 0) {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          allElements.push(el);
          allElements.push(...el.querySelectorAll('*'));
        }
      });
    } else if (classes.length > 0) {
      classes.forEach((cls) => {
        document.querySelectorAll(`.${cls}`).forEach((el) => {
          allElements.push(el);
          allElements.push(...el.querySelectorAll('*'));
        });
      });
    } else if (global) {
      allElements.push(...document.querySelectorAll('body *'));
    } else {
      // Fallback: cari editor aktif — Office docx/pptx editor atau contenteditable pertama
      const root = document.querySelector('#docxEditor, #slideContent, [contenteditable="true"], [contenteditable=""]')
        || document.body;
      allElements.push(root);
      allElements.push(...root.querySelectorAll('*'));
    }

    return allElements.filter((el) => this.shouldShowBoundary(el));
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
    const ids     = this.config?.enabledIds     || [];
    const classes = this.config?.enabledClasses || [];

    if (ids.length > 0) {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) return el;
      }
    }

    if (classes.length > 0) {
      for (const cls of classes) {
        const el = document.querySelector(`.${cls}`);
        if (el) return el;
      }
    }

    if (this.config?.enableGlobal) return document.body;

    // Fallback untuk Office editor — targetElement punya parent yang dikenal,
    // atau cari editor contenteditable aktif
    if (this.targetElement) {
      const ce = this.targetElement.closest('[contenteditable="true"],[contenteditable=""]');
      if (ce) return ce;
      return this.targetElement.parentElement || this.targetElement;
    }

    return document.querySelector('#docxEditor, #slideContent, [contenteditable="true"], [contenteditable=""]')
      || document.body;
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
    this.draggable.forceCleanDraggableColors(element);
    this.resizable.forceCleanResizableColors(element);
    this.sortable.forceCleanSortableColors(element);

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

  // forceCleanSortableColors moved to Sortable.js (delegated)
  forceCleanSortableColors(container) {
    return this.sortable.forceCleanSortableColors(container);
  }

  /**
   * Set target element for context menu operations
   */
  setTargetElement(element) {
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
