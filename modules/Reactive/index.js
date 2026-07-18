/**
 * NexaReactive.js - Lightweight Context Menu System
 * Provides right-click context menu functionality with content editing features
 * Includes text editing, formatting, and basic menu operations
 *
 * PERBAIKAN PENTING:
 * - Memastikan klik kanan tidak diblokir ketika menu context tidak tampil
 * - Hanya mencegah context menu default browser ketika event terjadi dalam target area
 * - Memberikan kontrol penuh untuk enable/disable custom context menu
 * - Menambahkan debug logging untuk troubleshooting
 */
import { Elements } from "./Elements/index.js";
import { Interactions } from "./Controls/index.js";
import { Background } from "./Background/index.js";
import { imageTools } from "./Images/imageTools.js";
import { CreateTable } from "./Tabel/index.js";
import { createForm } from "./Form/createForm.js";
import { chartElements } from "./Chart/chartElements.js";
import { chartElements as chartElementsApplications } from "./Program/Applications/chart.js";
import { LeafletMaps } from "./Maps/LeafletMaps.js";
import { Iframe } from "./Iframe/Iframe.js";
import { Layout } from "./Layout/index.js";
import { TextFormatting } from "./Text/TextFormatting.js";
import { toolBarTextFormatting } from "./Text/toolBarTextFormatting.js";
import { ProgramFiles } from "./Program/index.js";
// import { Prind } from "./Prind/Prind.js";
// import { NexaStore } from "./Store/NexaStore.js";

class NexaReactive {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      target: options.target || ".ex-explorer-content", // Target container selector
      folderSelector: options.folderSelector || ".ex-folder",
      fileSelector: options.fileSelector || ".ex-file",
      nameSelector: options.nameSelector || ".ex-folder-name",
      autoInit: options.autoInit !== false, // Auto initialize by default
      enableKeyboardShortcuts: options.enableKeyboardShortcuts !== false,
      enableFeatherIcons: options.enableFeatherIcons !== false,
      enableMaterialSymbols: options.enableMaterialSymbols !== false, // Enable Google Material Symbols and Icons
      enableContentEditing: options.enableContentEditing !== false, // Enable content editing support
      customFileTypes: options.customFileTypes || [],
      customMenuItems: options.customMenuItems || {},
      disabledMenu: options.disabledMenu || [], // Array of menu names to disable
      position: options.position || "auto", // 'auto', 'fixed', 'relative'
      onCustomAction: options.onCustomAction || null, // Custom action handler function
      onSave: options.onSave || null, // Save callback handler function

      ...options,
    };

    this.nexaUI = NexaUI();
    this.storage = this.config?.storage || null; // Initialize Elements instance
    this.packages = this.config?.packages || null; // Initialize Elements instance
    this.elements = new Elements(); // Initialize Elements instance
    this.background = new Background(); // Initialize Background instance
    this.imageTools = new imageTools(); // Initialize imageTools instance
    this.ProgramFiles = new ProgramFiles(); // Initialize ProgramFiles instance
    // Initialize CreateTable after Interactions so it can use the proper interactions reference
    this.CreateTable = null; // Will be initialized after Interactions
    this.createForm = null; // Will be initialized after Interactions
    this.chartElements = null; // Will be initialized after Interactions
    this.LeafletMaps = null; // Will be initialized after Interactions
    this.Iframe = null; // Will be initialized after Interactions
    this.Layout = null; // Will be initialized after Interactions
    // Initialize Interactions with configuration
    this.Interactions = new Interactions({
      enabledIds: this.config.enabledIds || options.enabledIds || [], // Pass enabled IDs for interaction scope
      enabledClasses:
        this.config.enabledClasses || options.enabledClasses || [],
      enableGlobal: this.config.enableGlobal || options.enableGlobal || false,
    });

    // Initialize toolbar if enabled
    if (this.config.toolbar) {
      this.initToolbar();
    }

    // Add missing properties and methods to Interactions for CreateTable compatibility
    this.Interactions.config = this.config;
    this.Interactions.nexaUI = this.nexaUI;
    this.Interactions.injectModalControlFunctions = () => {
      // Inject modal control functions if not already present
      if (typeof window.openModal === "undefined") {
        window.openModal = function (modalId) {
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
          }
        };
      }

      if (typeof window.closeModal === "undefined") {
        window.closeModal = function (modalId) {
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
          }
        };
      }
    };

    // Initialize CreateTable with proper interactions reference
    this.CreateTable = new CreateTable(this.Interactions);

    // Initialize createForm with proper interactions reference
    this.createForm = new createForm(this.Interactions);

    // Initialize chartElements with proper interactions reference
    this.chartElements = new chartElements(this.Interactions);

    // Initialize LeafletMaps with proper interactions reference
    this.LeafletMaps = new LeafletMaps(this.Interactions);

    // Initialize Iframe with proper interactions reference
    this.Iframe = new Iframe(this.Interactions);

    // Initialize Layout with proper interactions reference
    this.Layout = new Layout(this.Interactions);

    // Initialize TextFormatting with proper interactions reference
    this.textFormatting = new TextFormatting(this.Interactions);

    // Initialize Prind with proper interactions reference
    this.Prind = null;

    // Initialize NexaStore with proper interactions reference
    // this.nexaStore = new NexaStore(this.Interactions);

    // // Set global reference for use in static methods
    // window.nexaStoreInstance = this.nexaStore;

    this.contextMenu = null;
    this.currentTarget = null;
    this.currentTextSelection = null; // Store current text selection for content editing
    this.savedSelectionText = ""; // Save selected text before context menu
    this.hasTextSelection = false; // Flag to track if there was text selected
    this.savedSelectionRange = null; // Store range info for precise operations
    this.currentEditableElement = null; // Store the actual editable element from context menu
    this.savedCursorPosition = null; // Store cursor position for table insertion
    this.isVisible = false;
    this.targetContainer = null;
    this.lastMousePosition = null; // Store mouse position for table insertion
    this.isCustomContextDisabled = false; // Flag untuk disable custom context menu sementara
    this.isPrinting = false; // Flag untuk mencegah multiple print calls
    this.isEditMode = true; // Flag untuk track edit/view mode (true = edit mode, false = view mode)

    // Build context menu structure
    this.buildContextMenuStructure();

    if (this.config.autoInit) {
      this.init();
    }

    // Make instance globally available
    window.nexaNexaReactiveInstance = this;

    // Setup global functions when class is instantiated
    NexaReactive.setupGlobalFunctions();

    // Store global instance for refresh after save
    window.nexaNexaReactiveInstance = this;
  }

  /**
   * Build context menu structure
   */
  buildContextMenuStructure() {
    try {
      // Update context menu structure without Element Interactions (added later in showContextMenu)
      this.contextMenuStructure = {
        menu: [
          {
            label: "Refresh",
            icon: "refresh-cw",
            action: "refresh",
            shortcut: "F5",
          },
        ],
      };
    } catch (error) {
      console.error("Failed to build context menu structure:", error);
    }
  }

  /**
   * Filter menu items based on disabledMenu configuration
   */
  filterDisabledMenus(menuItems) {
    if (!this.config.disabledMenu || this.config.disabledMenu.length === 0) {
      return menuItems;
    }
    const filteredItems = menuItems.filter((item) => {
      // Check if this menu item should be disabled
      const itemIdentifier = item.label || item.action || item.key;
      const isDisabled = this.config.disabledMenu.includes(itemIdentifier);

      if (isDisabled) {
        return false;
      }

      // Recursively filter submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        item.submenu = this.filterDisabledMenus(item.submenu);
      }

      return true;
    });

    return filteredItems;
  }

  /**
   * Initialize the context menu system
   */
  async init() {
    // Load internal reactive styles
    try {
      // await NXUI.NexaStylesheet.Dom([
      //   'NexaReactive.css',
      // ]);
    } catch (error) {
      console.warn('⚠️ Failed to load NexaReactive.css:', error);
    }
    
    this.setTargetContainer();
    this.createContextMenuHTML();
    this.bindEvents();
    if (this.config.enableFeatherIcons) {
      this.loadFeatherIcons();
    }

    
    // Initialize charts after DOM is ready
    this.initializeCharts();
  }

  /**
   * Initialize all charts in the DOM
   * Called automatically after init() and can be called manually after content changes
   */
  initializeCharts() {
    try {
      // Wait a bit for DOM to be ready
      setTimeout(() => {
        chartElementsApplications.initializeCharts();
        console.log('✅ Charts initialized by NexaReactive');
      }, 300);
    } catch (error) {
      console.error('❌ Error initializing charts:', error);
    }
  }

  /**
   * Initialize toolbar functionality
   */
  initToolbar() {
    try {
      let toolbarContainer;

      // Check if specific toolbar container is provided
      if (this.config.toolbar && typeof this.config.toolbar === "string") {
        toolbarContainer = document.querySelector(this.config.toolbar);
      } else {
        // Create toolbar in separate container
        const toolbarTargetId = `toolbar-${this.config.target.replace(
          "#",
          ""
        )}`;
        toolbarContainer = document.getElementById(toolbarTargetId);
      }

      if (toolbarContainer) {
        // Initialize toolbar in separate container only
        this.initToolbarInContainer(toolbarContainer);
      } else {
        // Fallback: Initialize toolBarTextFormatting for each enabled element
        this.initToolbarForElements();
      }
    } catch (error) {
      console.error("❌ Error initializing toolbar:", error);
    }
  }

  /**
   * Initialize toolbar in separate container
   */
  initToolbarInContainer(toolbarContainer) {
    try {
      // Check if toolbar already exists
      if (toolbarContainer.querySelector('[data-nexa-toolbar="true"]')) {
        return;
      }

      // Initialize TextFormatting for toolbar
      const textFormatting = new TextFormatting(this.Interactions);

      // Get target element for toolbar
      const targetElement = this.targetContainer;

      // Create toolbar directly in the toolbar container
      const toolbar = new toolBarTextFormatting(toolbarContainer, {
        isExternalToolbar: true,
        showTextFormatting: true,
        showElementTools: true,
        showLayoutTools: true,
        compact: false,
        onToolbarAction: (command, value) => {
          // Map toolbar commands to TextFormatting methods
          this.handleToolbarCommand(
            command,
            value,
            targetElement,
            textFormatting
          );
        },
      });
    } catch (error) {
      console.error("❌ Error creating toolbar in container:", error);
    }
  }

  /**
   * Initialize toolbar for enabled elements
   */
  initToolbarForElements() {
    // Initialize toolbar for enabled IDs
    if (Array.isArray(this.config.enabledIds)) {
      this.config.enabledIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          this.activateToolbarForElement(element);
        }
      });
    }

    // Initialize toolbar for enabled classes
    if (Array.isArray(this.config.enabledClasses)) {
      this.config.enabledClasses.forEach((className) => {
        document.querySelectorAll(`.${className}`).forEach((element) => {
          this.activateToolbarForElement(element);
        });
      });
    }
  }

  /**
   * Activate toolbar for specific element
   */
  activateToolbarForElement(element) {
    try {
      // Initialize TextFormatting for this element
      const textFormatting = new TextFormatting(this.Interactions);

      // Initialize toolBarTextFormatting with callback to TextFormatting
      const toolbar = new toolBarTextFormatting(element, {
        isExternalToolbar: true,
        showTextFormatting: true,
        showElementTools: true,
        showLayoutTools: true,
        compact: false,
        onToolbarAction: (command, value) => {
          // Map toolbar commands to TextFormatting methods
          this.handleToolbarCommand(command, value, element, textFormatting);
        },
      });
    } catch (error) {
      console.error("❌ Error activating toolbar for element:", error);
    }
  }

  /**
   * Handle toolbar command by mapping to TextFormatting methods
   */
  handleToolbarCommand(command, value, element, textFormatting) {
    try {
      // Skip command "save" - it's handled separately by handleSaveCommand
      if (command === "save") {
        return;
      }

      // Set target element for TextFormatting - use enabled element if element is null
      if (!element) {
        // Handle both selector string and Element object
        if (typeof this.config.target === "string") {
          element = document.querySelector(this.config.target);
        } else if (this.config.target instanceof Element) {
          element = this.config.target;
        } else {
          element = this.targetContainer; // Fallback to targetContainer
        }
      }
      
      // Safety check: ensure Interactions exists before setting targetElement
      if (this.Interactions) {
        this.Interactions.targetElement = element;
      }

      // Map toolbar commands to TextFormatting methods
      switch (command) {
        case "bold":
          textFormatting.contextTextBold();
          break;
        case "italic":
          textFormatting.contextTextItalic();
          break;
        case "underline":
          textFormatting.contextTextUnderline();
          break;
        case "alignleft":
          textFormatting.contextTextAlignLeft();
          break;
        case "aligncenter":
          textFormatting.contextTextAlignCenter();
          break;
        case "alignright":
          textFormatting.contextTextAlignRight();
          break;
        case "alignjustify":
          textFormatting.contextTextAlignJustify();
          break;
        case "undo":
          textFormatting.contextTextUndo();
          break;
        case "redo":
          textFormatting.contextTextRedo();
          break;
        case "formatBlock":
          // Handle format block (h1, h2, etc.)
          if (value) {
            element.style.fontSize = this.getFontSizeForFormat(value);
            element.style.fontWeight = this.getFontWeightForFormat(value);
          }
          break;
        case "zoomInElement":
          this.handleZoomCommand("zoomInElement", element);
          break;
        case "zoomOutElement":
          this.handleZoomCommand("zoomOutElement", element);
          break;
        case "zoomElementTo100":
          this.handleZoomCommand("zoomElementTo100", element);
          break;
        case "print":
          // Handle print command (async)
          this.handlePrintCommand(element).catch((error) => {
            console.error("❌ Error executing print command:", error);
            this.showNotification(`Error: ${error.message}`, "error");
          });
          break;
        case "bullist":
          // Handle unordered list
          this.createList(element, "ul");
          break;
        case "numlist":
          // Handle ordered list
          this.createList(element, "ol");
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`❌ Error executing toolbar command ${command}:`, error);
    }
  }

  /**
   * Get font size for format block
   */
  getFontSizeForFormat(format) {
    const sizes = {
      h1: "32px",
      h2: "28px",
      h3: "24px",
      h4: "20px",
      h5: "18px",
      h6: "16px",
      p: "16px",
    };
    return sizes[format] || "16px";
  }

  /**
   * Get font weight for format block
   */
  getFontWeightForFormat(format) {
    const weights = {
      h1: "bold",
      h2: "bold",
      h3: "bold",
      h4: "bold",
      h5: "bold",
      h6: "bold",
      p: "normal",
    };
    return weights[format] || "normal";
  }

  /**
   * Create list for element
   */
  createList(element, listType) {
    try {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const list = document.createElement(listType);
        const li = document.createElement("li");

        if (selection.toString()) {
          li.textContent = selection.toString();
        } else {
          li.textContent = "List item";
        }

        list.appendChild(li);
        range.deleteContents();
        range.insertNode(list);
        selection.removeAllRanges();
      }
    } catch (error) {
      console.error("❌ Error creating list:", error);
    }
  }

  /**
   * Handle print command
   */
  async handlePrintCommand(element) {
    // Cegah multiple calls dengan flag yang lebih ketat
    if (this.isPrinting) {
      console.log("NexaReactive: Print already in progress, skipping duplicate call...");
      return;
    }

    // Set flag SEBELUM async operations untuk mencegah race condition
    this.isPrinting = true;
    console.log("NexaReactive: Starting print command");

    try {
      // Cek apakah NXUI.NexaPrind tersedia
      if (typeof NXUI === "undefined" || typeof NXUI.NexaPrind === "undefined") {
        this.showNotification("Print functionality not available", "error");
        this.isPrinting = false;
        return;
      }

      // Langsung gunakan data.id untuk targetId, tidak ambil dari targetElement
      let data = NXUI.dataReactive;
      
      if (!data || !data.id) {
        this.showNotification("No data found to print", "error");
        this.isPrinting = false;
        return;
      }

      // Gunakan ID langsung dari data.id
      const targetId = "content_" + data.id;
      console.log("NexaReactive: Target ID for print:", targetId);
      
      // Pastikan element dengan ID tersebut ada
      const elementToPrint = document.getElementById(targetId);
      if (!elementToPrint) {
        this.showNotification(`Element with ID '${targetId}' not found`, "error");
        this.isPrinting = false;
        return;
      }

      // Print dengan opsi yang memastikan halaman full, tidak terpotong
      console.log("NexaReactive: Calling NexaPrind.printById");
      const printResult = NXUI.NexaPrind.printById(targetId, {
        title: document.title || 'Print Document',
        paperSize: 'A4',
        orientation: 'portrait',
        marginTop: '10mm', // Margin lebih kecil untuk halaman lebih full
        marginRight: '10mm',
        marginBottom: '10mm',
        marginLeft: '10mm',
        fontSize: '11pt',
        lineHeight: '1.3',
        newWindow: true, // Print di window baru
        preserveLayout: true, // Preserve layout untuk mencegah terpotong
        captureDynamicStyles: true, // Capture semua style
        forceBackgrounds: true, // Force backgrounds
      });

      if (printResult === false) {
        console.log("NexaReactive: Print was blocked (already in progress)");
        this.isPrinting = false;
        return;
      }

      this.showNotification("Print dialog opened", "success");

      // Reset flag setelah delay yang lebih pendek
      setTimeout(() => {
        this.isPrinting = false;
        console.log("NexaReactive: Print flag reset");
      }, 2000); // Kurangi menjadi 2 detik
    } catch (error) {
      console.error("❌ Error executing print command:", error);
      this.showNotification(`Error: ${error.message}`, "error");
      // Reset flag on error dengan delay juga
      setTimeout(() => {
        this.isPrinting = false;
      }, 500);
    }
  }

  /**
   * Handle zoom commands for element manipulation
   */
  handleZoomCommand(command, element) {
    try {
      if (!element) {
        return;
      }

      // Get current transform scale
      const currentTransform = element.style.transform || "";
      const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
      let currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;

      // Apply zoom based on command
      let newScale = currentScale;
      switch (command) {
        case "zoomInElement":
          newScale = Math.min(currentScale * 1.25, 3); // Max 300%
          break;
        case "zoomOutElement":
          newScale = Math.max(currentScale / 1.25, 0.25); // Min 25%
          break;
        case "zoomElementTo100":
          newScale = 1; // Reset to 100%
          break;
        default:
          return;
      }

      // Apply the new scale
      const newTransform =
        currentTransform.replace(/scale\([^)]+\)/, "") + ` scale(${newScale})`;
      element.style.transform = newTransform.trim();

      // Add transition for smooth animation
      element.style.transition = "transform 0.2s ease";

      // Remove transition after animation completes
      setTimeout(() => {
        element.style.transition = "";
      }, 200);

      // Show notification
      this.showNotification(`Zoom ${Math.round(newScale * 100)}%`, "success");

      // Trigger custom event
      element.dispatchEvent(
        new CustomEvent("nexaToolbarZoom", {
          detail: {
            command,
            scale: newScale,
            percentage: Math.round(newScale * 100),
          },
        })
      );
    } catch (error) {
      console.error(`❌ Error executing zoom command ${command}:`, error);
      this.showNotification(`Error: ${error.message}`, "error");
    }
  }

  /**
   * Set target container based on configuration
   */
  setTargetContainer() {
    if (typeof this.config.target === "string") {
      this.targetContainer = document.querySelector(this.config.target);
    } else if (this.config.target instanceof Element) {
      this.targetContainer = this.config.target;
    } else {
      this.targetContainer = document.querySelector(".ex-explorer-content");
    }

    if (!this.targetContainer) {
      // Target container not found
    } else {
      // Add NexaContext class untuk scoped styling jika contenteditable sudah ada
      this.addNexaContextClass(this.targetContainer);
    }
  }

  /**
   * Load Material Symbols (replacing Feather icons)
   */
  loadFeatherIcons() {
    // Material Symbols sudah di-load via <link> di HTML, tidak perlu inisialisasi
    this.feather = null;
  }



  /**
   * Generate new file submenu based on file types
   */

  /**
   * Create context menu HTML structure
   */
  createContextMenuHTML() {
    this.contextMenu = document.createElement("div");
    this.contextMenu.className = "nexa-context-menu";
    this.contextMenu.style.display = "none";
    document.body.appendChild(this.contextMenu);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Bind methods to preserve 'this' context for later removal
    this.boundHandleContextMenu = (e) => this.handleContextMenu(e);
    this.boundHandleClickOutside = (e) => this.handleClickOutside(e);
    this.boundHandleKeyDown = (e) => {
      if (e.key === "Escape" && this.isVisible) {
        this.hideContextMenu();
      }
    };

    // Right-click event
    document.addEventListener("contextmenu", this.boundHandleContextMenu);

    // Click outside to close
    document.addEventListener("click", this.boundHandleClickOutside);

    // Escape key to close
    if (this.config.enableKeyboardShortcuts) {
      document.addEventListener("keydown", this.boundHandleKeyDown);
    }

    // Bind save event handler if onSave callback is provided
    if (this.config.onSave && typeof this.config.onSave === "function") {
      this.boundHandleSave = (e) => this.handleSave(e);
      document.addEventListener("nexaToolbarSave", this.boundHandleSave);
    }

    // Prevent default context menu on the custom context menu
    this.contextMenu.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  /**
   * Handle right-click context menu
   */
  async handleContextMenu(e) {
    // Cek jika custom context menu sedang di-disable (misalnya untuk inspect mode atau view mode)
    if (this.isCustomContextDisabled || !this.isEditMode) {
      return; // Biarkan browser context menu default muncul
    }
    // Store mouse position for table insertion
    this.lastMousePosition = {
      x: e.clientX,
      y: e.clientY,
      target: e.target,
    };

    const target = e.target.closest(
      `${this.config.folderSelector}, ${this.config.fileSelector}`
    );
    
    // Handle both selector string and Element object for target
    let explorerContent = null;
    if (typeof this.config.target === "string") {
      explorerContent = e.target.closest(this.config.target);
    } else if (this.config.target instanceof Element) {
      // If target is Element, check if event target is within that element
      if (this.config.target.contains(e.target) || this.config.target === e.target) {
        explorerContent = this.config.target;
      }
    }

    // Check if the event happened within our target container
    // For contenteditable support, also check if event is within target even if no explorerContent
    const isWithinTarget =
      (explorerContent &&
        (this.targetContainer === explorerContent ||
          this.targetContainer.contains(e.target))) ||
      (this.targetContainer && this.targetContainer.contains(e.target));

    // PENTING: Hanya prevent default dan tampilkan menu jika benar-benar dalam target area
    if (isWithinTarget) {
      // Only prevent default context menu when we're within our target area
      e.preventDefault();
      e.stopPropagation(); // Mencegah event bubbling
      this.currentTarget = target;

      // Store current text selection for content editing BEFORE it gets lost
      if (this.config.enableContentEditing) {
        this.currentTextSelection = window.getSelection();

        if (
          this.currentTextSelection &&
          !this.currentTextSelection.isCollapsed
        ) {
          this.savedSelectionText = this.currentTextSelection.toString().trim();
          this.hasTextSelection = this.savedSelectionText.length > 0;

          // Store range and container info for precise cut operation
          if (this.currentTextSelection.rangeCount > 0) {
            const range = this.currentTextSelection.getRangeAt(0);
            this.savedSelectionRange = {
              startContainer: range.startContainer,
              startOffset: range.startOffset,
              endContainer: range.endContainer,
              endOffset: range.endOffset,
              commonAncestor: range.commonAncestorContainer,
            };
          }
        } else {
          this.savedSelectionText = "";
          this.hasTextSelection = false;
          this.savedSelectionRange = null;
        }

        // Store the actual editable element that was right-clicked
        this.currentEditableElement =
          e.target.closest(
            '[contenteditable="true"], [contenteditable=""], [contenteditable]'
          ) ||
          (e.target.contentEditable === "true" ? e.target : null) ||
          this.targetContainer;

        // Store cursor position for table insertion (even if no text is selected)
        this.savedCursorPosition = null;
        if (
          this.currentTextSelection &&
          this.currentTextSelection.rangeCount > 0
        ) {
          const range = this.currentTextSelection.getRangeAt(0);
          this.savedCursorPosition = {
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset,
            isCollapsed: range.collapsed,
          };
        }
      }

      let menuType = "empty";

      // Check if target is contenteditable or within contenteditable element
      const editableElement = e.target.closest(
        '[contenteditable="true"], [contenteditable=""], [contenteditable]'
      );

      // Also check if target itself is contenteditable
      const isContentEditable =
        e.target.contentEditable === "true" ||
        e.target.getAttribute("contenteditable") === "true" ||
        e.target.getAttribute("contenteditable") === "";

      // Also check if we're within the target container for content editing
      const isWithinEditTarget =
        this.config.enableContentEditing &&
        this.targetContainer &&
        this.targetContainer.contains(e.target);

      if (
        this.config.enableContentEditing &&
        (editableElement || isContentEditable || isWithinEditTarget)
      ) {
        menuType = "contenteditable";

        // Make sure target container is contenteditable if not already
        if (isWithinEditTarget && this.targetContainer) {
          if (!this.targetContainer.hasAttribute("contenteditable")) {
            this.targetContainer.setAttribute("contenteditable", "true");
            // Add NexaContext specific class untuk scoped styling
            this.targetContainer.classList.add("nexa-context-target");
          }
        }
      } else if (target) {
        menuType = target.classList.contains(
          this.config.folderSelector.replace(".", "")
        )
          ? "folder"
          : "file";
      }

      await this.showContextMenu(e.clientX, e.clientY, menuType);
    } else {
      // PENTING: Jika tidak dalam target area, biarkan browser context menu default muncul
      // Tidak melakukan preventDefault() atau apapun, sehingga klik kanan normal
      return;
    }
  }

  /**
   * Handle click outside context menu
   */
  handleClickOutside(e) {
    if (this.isVisible && !this.contextMenu.contains(e.target)) {
      this.hideContextMenu();
    }
  }

  /**
   * Handle save event from toolbar
   */
  handleSave(e) {
    try {
      // Prevent event from being processed multiple times
      if (e.detail._processed) {
        return;
      }

      // Get save data from event detail
      const saveData = e.detail;
      
      // Check if this event is relevant to this instance
      // Only process if elementId matches enabledIds or if no specific target is set
      if (this.config.enabledIds && Array.isArray(this.config.enabledIds) && this.config.enabledIds.length > 0) {
        const elementId = saveData.elementId || null;
        if (elementId) {
          // Check if elementId matches any of the enabledIds
          // Support both exact match and partial match
          // e.g., "file_96owpy" should match "content_file_96owpy" or vice versa
          const isRelevant = this.config.enabledIds.some(id => {
            // Remove "content_" prefix for comparison if exists
            const cleanId = id.replace(/^content_/, '');
            const cleanElementId = elementId.replace(/^content_/, '');
            return elementId === id || 
                   id === elementId || 
                   cleanId === cleanElementId ||
                   elementId.includes(cleanId) || 
                   id.includes(cleanElementId);
          });
          
          if (!isRelevant) {
            return; // Skip this event, it's not for this instance
          }
        }
      } else if (this.targetContainer && saveData.element) {
        // If no enabledIds, check if element is within targetContainer
        if (!this.targetContainer.contains(saveData.element)) {
          return; // Skip this event, element is not in this instance's target
        }
      }
      
      // Mark event as processed to prevent duplicate handling
      e.detail._processed = true;
      
      // Prepare data for onSave callback
      const data = {
        content: saveData.content || "",
        textContent: saveData.textContent || "",
        element: saveData.element || null,
        elementId: saveData.elementId || null,
        elementToken: saveData.elementToken || null,
        timestamp: saveData.timestamp || Date.now(),
        fileName: this.config.fileName || null,
      };

      // Call onSave callback if provided
      if (this.config.onSave && typeof this.config.onSave === "function") {
        this.config.onSave(data);
      }
      
      // Re-initialize charts after save (in case new charts were added)
      setTimeout(() => {
        this.initializeCharts();
      }, 500);
    } catch (error) {
      console.error("❌ Error handling save event:", error);
    }
  }

  /**
   * Show context menu at specified position
   */
  async showContextMenu(x, y, menuType) {
    // ALWAYS use main menu structure as base - create a DEEP COPY to avoid mutation
    let menuItems = JSON.parse(JSON.stringify(this.contextMenuStructure.menu));

    // Only enhance with content editing if in contenteditable context
    if (menuType === "contenteditable" && this.config.enableContentEditing) {
      // Get Elements menu from external module and convert properties
      const elementsMenuStructureRaw = this.elements.struktur();

      const elementsMenuStructure = this.convertElementsMenu(
        elementsMenuStructureRaw
      );

      // Get Element Interactions menu structure and convert properties
      const InteractionsMenuRaw = this.Interactions.struktur();
      const InteractionsMenu =
        this.convertInteractionsMenu(InteractionsMenuRaw);

      // Get Background menu structure and convert properties
      const BackgroundMenuRaw = this.background.struktur();
      const BackgroundMenu = this.convertBackgroundMenu(BackgroundMenuRaw);

      // Get Image Tools menu structure and convert properties
      const ImageToolsMenuRaw = this.imageTools.struktur();
      const ImageToolsMenu = this.convertImageToolsMenu(ImageToolsMenuRaw);

      // Get CreateTable menu structure and convert properties
      const CreateTableMenuRaw = this.CreateTable.struktur();
      const CreateTableMenu = this.convertCreateTableMenu(CreateTableMenuRaw);

      // Get createForm menu structure and convert properties
      const createFormMenuRaw = this.createForm.struktur();
      const createFormMenu = this.convertCreateFormMenu(createFormMenuRaw);

      // Get chartElements menu structure and convert properties
      const chartElementsMenuRaw = this.chartElements.struktur();
      const chartElementsMenu =
        this.convertChartElementsMenu(chartElementsMenuRaw);

      // Get LeafletMaps menu structure and convert properties
      const LeafletMapsMenuRaw = this.LeafletMaps.struktur();
      const LeafletMapsMenu = this.convertLeafletMapsMenu(LeafletMapsMenuRaw);

      // Get Iframe menu structure and convert properties
      const IframeMenuRaw = this.Iframe.struktur();
      const IframeMenu = this.convertIframeMenu(IframeMenuRaw);

      // Get Program Files menu structure and convert properties
      const ProgramFilesMenuRaw = await this.ProgramFiles.struktur();
      const ProgramFilesMenu = this.convertProgramFilesMenu(ProgramFilesMenuRaw);

      // Get Layout menu structure and convert properties
      const LayoutMenuRaw = await this.Layout.struktur();
      const LayoutMenu = this.convertLayoutMenu(LayoutMenuRaw);

      // Get TextFormatting menu structure and convert properties
      const TextFormattingMenuRaw = this.textFormatting.struktur();

      const TextFormattingMenu = this.convertTextFormattingMenu(
        TextFormattingMenuRaw
      );

      // Get NexaStore menu structure and convert properties
      const NexaStoreMenuRaw = null;

      const NexaStoreMenu = this.convertNexaStoreMenu(NexaStoreMenuRaw);

      // Find Refresh menu index and insert before it
      const refreshIndex = menuItems.findIndex(
        (item) => item.action === "refresh"
      );

      if (refreshIndex !== -1) {
        // Prepare all menu items
        const allMenuItems = [
          ...elementsMenuStructure, // Format Elements (menu terpisah)
          ...TextFormattingMenu, // Text Formatting (menu terpisah)
          ...BackgroundMenu, // Background Elements (menu terpisah)
          ...ImageToolsMenu, // Image Tools (menu terpisah)
          ...CreateTableMenu, // Create Table (menu terpisah)
          ...createFormMenu, // Create Form (menu terpisah)
          ...chartElementsMenu, // Chart Elements (menu terpisah)
          ...LeafletMapsMenu, // Leaflet Maps (menu terpisah)
          ...IframeMenu, // Iframe (menu terpisah)
          ...ProgramFilesMenu, // Program Files (menu terpisah)
          ...LayoutMenu, // Layout Elements (menu terpisah)
          ...NexaStoreMenu, // NexaStore (menu terpisah)
          { type: "separator" },
          ...InteractionsMenu, // Element Interactions (menu terpisah)
          { type: "separator" },
        ];

        // Filter disabled menus
        const filteredMenuItems = this.filterDisabledMenus(allMenuItems);

        // Insert dalam urutan yang sudah difilter
        menuItems.splice(refreshIndex, 0, ...filteredMenuItems);
      }
    }

    this.renderContextMenu(menuItems);

    // Position the menu
    this.contextMenu.style.left = `${x}px`;
    this.contextMenu.style.top = `${y}px`;
    this.contextMenu.style.display = "block";
    this.isVisible = true;

    // Adjust position if menu goes off screen
    this.adjustMenuPosition();
  }

  /**
   * Hide context menu
   */
  hideContextMenu() {
    this.contextMenu.style.display = "none";
    this.isVisible = false;
    this.currentTarget = null;
  }

  /**
   * Render context menu items
   */
  renderContextMenu(items) {
    this.contextMenu.innerHTML = "";

    items.forEach((item) => {
      if (item.type === "separator") {
        const separator = document.createElement("div");
        separator.className = "nexa-context-separator";
        this.contextMenu.appendChild(separator);
      } else {
        const menuItem = this.createMenuItem(item);
        this.contextMenu.appendChild(menuItem);
      }
    });

    // Material Symbols — tidak perlu replace icons, langsung tampil
  }

  /**
   * Create individual menu item
   */
  createMenuItem(item) {
    const menuItem = document.createElement("div");

    menuItem.className = `nexa-context-item ${
      item.submenu && item.submenu.length > 0 ? "has-submenu" : ""
    } ${item.disabled ? "disabled" : ""}`;

    // Feather → Material Symbols icon mapping
    const featherToMaterial = {
      // Text formatting
      bold: 'format_bold', italic: 'format_italic', underline: 'format_underlined',
      type: 'text_fields', hash: 'tag', list: 'format_list_bulleted',
      indent: 'format_indent_increase', 'align-left': 'format_align_left',
      'align-center': 'format_align_center', 'align-right': 'format_align_right',
      'align-justify': 'format_align_justify', minus: 'horizontal_rule',
      // Operations
      scissors: 'content_cut', copy: 'content_copy', clipboard: 'content_paste',
      'rotate-ccw': 'undo', 'rotate-cw': 'redo', 'edit-3': 'edit',
      edit: 'edit_note', search: 'search', globe: 'language', link: 'link',
      'percent': 'percent',
      // Elements / Objects
      grid: 'grid_view', square: 'crop_square', circle: 'circle',
      image: 'image', layers: 'layers', layout: 'dashboard',
      code: 'code', plus: 'add', 'delete': 'delete',
      'trash-2': 'delete', eye: 'visibility', 'eye-off': 'visibility_off',
      move: 'open_with', 'mouse-pointer': 'touch_app',
      settings: 'settings', sliders: 'tune', smile: 'mood',
      // Zoom & sizing
      'maximize-2': 'fit_screen', maximize: 'aspect_ratio',
      'minimize-2': 'minimize', 'zoom-in': 'zoom_in', 'zoom-out': 'zoom_out',
      'plus-circle': 'add_circle', 'minus-circle': 'remove_circle',
      // Navigation
      'chevrons-up': 'keyboard_arrow_up', 'chevrons-down': 'keyboard_arrow_down',
      'chevron-right': 'chevron_right',
      // Charts
      'pie-chart': 'pie_chart', 'bar-chart-2': 'bar_chart',
      'trending-up': 'trending_up', activity: 'show_chart',
      database: 'storage',
      // Files & save
      save: 'save', folder: 'folder', 'folder-open': 'folder_open',
      upload: 'upload', 'upload-cloud': 'cloud_upload', download: 'download',
      printer: 'print', file: 'description', 'file-text': 'article',
      // Media
      monitor: 'desktop_windows', wind: 'air', user: 'person', users: 'people',
      archive: 'archive', inbox: 'inbox', 'camera': 'camera_alt',
      // Maps
      'map-pin': 'location_on', navigation: 'navigation',
      triangle: 'change_history', mountain: 'terrain',
      // Tables
      table: 'table', 'git-merge': 'merge_type', 'git-branch': 'call_split',
      'git-pull-request': 'fork_right',
      // Forms
      'check-square': 'check_box', 'edit-3': 'edit_note',
      // Miscellaneous
      apps: 'apps', box: 'inventory_2', palette: 'palette',
      'x-circle': 'cancel', 'help-circle': 'help',
      ruler: 'straighten', refresh: 'refresh',
      crop: 'crop', filter: 'filter_alt', columns: 'view_column',
      'alert-triangle': 'warning', 'alert-circle': 'error',
      bug: 'bug_report', loader: 'sync',
    };

    // Support Material Symbols (default) 
    let icon = "";
    if (item.icon) {
      let iconName;
      // If explicitly marked as material, use icon value as-is
      if (item.iconType === 'material') {
        iconName = item.icon;
      } else {
        // Otherwise, try to convert from feather name to material symbol
        iconName = featherToMaterial[item.icon] || item.icon.replace(/-/g, '_');
      }
      icon = `<span class="material-symbols-outlined">${iconName}</span>`;
    }
    
    const shortcut = item.shortcut
      ? `<span class="shortcut">${item.shortcut}</span>`
      : "";

    // Submenu arrow - Material Symbols
    const submenuArrow = item.submenu && item.submenu.length > 0
      ? '<span class="material-symbols-outlined submenu-arrow">chevron_right</span>'
      : "";

    menuItem.innerHTML = `
      <span class="menu-icon">${icon}</span>
      <span class="menu-label">${item.label}</span>
      ${shortcut}
      ${submenuArrow}
    `;

    // Add click handler only if not disabled AND no submenu
    if (
      item.action &&
      !item.disabled &&
      !(item.submenu && item.submenu.length > 0)
    ) {
      menuItem.addEventListener("click", (e) => {
        e.stopPropagation();
        // Pass all item data including label, key, icon, action, and any additional data
        const itemData = {
          label: item.label,
          key: item.key,
          icon: item.icon,
          action: item.action,
          ...item, // Include any additional properties
        };
        
        this.executeAction(item.action, itemData);
        this.hideContextMenu();
      });
    }

    // Add submenu
    if (item.submenu && item.submenu.length > 0) {
      const submenu = this.createSubmenu(item.submenu);
      menuItem.appendChild(submenu);

      // Show/hide submenu on hover
      let hideTimeout;

      menuItem.addEventListener("mouseenter", () => {
        // Clear any pending hide timeout
        clearTimeout(hideTimeout);

        // Hide other submenus at the same level
        const parentMenu = menuItem.closest(
          ".nexa-context-menu, .nexa-context-submenu"
        );
        const siblingSubmenus = parentMenu.querySelectorAll(
          ":scope > .nexa-context-item > .nexa-context-submenu"
        );
        siblingSubmenus.forEach((other) => {
          if (other !== submenu) {
            other.style.display = "none";
          }
        });

        submenu.style.display = "block";

        // Use setTimeout to ensure DOM is updated before positioning
        setTimeout(() => {
          this.adjustSubmenuPosition(submenu, menuItem);
        }, 10);
      });

      const hideSubmenu = () => {
        hideTimeout = setTimeout(() => {
          if (!submenu.matches(":hover") && !menuItem.matches(":hover")) {
            submenu.style.display = "none";
            // Also hide any nested submenus
            const nestedSubmenus = submenu.querySelectorAll(
              ".nexa-context-submenu"
            );
            nestedSubmenus.forEach((nested) => {
              nested.style.display = "none";
            });
          }
        }, 150);
      };

      menuItem.addEventListener("mouseleave", hideSubmenu);

      // Keep submenu visible when hovering over it
      submenu.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
        submenu.style.display = "block";
      });

      submenu.addEventListener("mouseleave", hideSubmenu);
    }

    return menuItem;
  }

  /**
   * Create submenu
   */
  createSubmenu(items) {
    const submenu = document.createElement("div");
    submenu.className = "nexa-context-submenu";
    submenu.style.display = "none";

    items.forEach((item) => {
      if (item.type === "separator") {
        const separator = document.createElement("div");
        separator.className = "nexa-context-separator";
        submenu.appendChild(separator);
      } else {
        const submenuItem = this.createMenuItem(item);
        submenu.appendChild(submenuItem);
      }
    });

    return submenu;
  }

  /**
   * Adjust menu position to stay within viewport
   */
  adjustMenuPosition() {
    const rect = this.contextMenu.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    let { left, top } = this.contextMenu.style;
    left = parseInt(left);
    top = parseInt(top);

    // Adjust horizontal position
    if (rect.right > viewportWidth) {
      left = viewportWidth - rect.width - 10;
    }

    // Adjust vertical position
    if (rect.bottom > viewportHeight) {
      top = viewportHeight - rect.height - 10;
    }

    this.contextMenu.style.left = `${Math.max(10, left)}px`;
    this.contextMenu.style.top = `${Math.max(10, top)}px`;
  }

  /**
   * Adjust submenu position
   */
  adjustSubmenuPosition(submenu, parentItem) {
    // Reset classes first
    submenu.classList.remove("position-left", "position-up");

    const parentRect = parentItem.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    // Force a layout recalculation to get accurate submenu dimensions
    submenu.style.display = "block";
    submenu.style.visibility = "hidden";
    const submenuRect = submenu.getBoundingClientRect();
    submenu.style.visibility = "visible";

    // Calculate best horizontal position
    let leftPosition = "100%"; // Default: to the right

    // Check if submenu would go off-screen to the right
    if (parentRect.right + submenuRect.width > viewportWidth - 10) {
      // Position to the left of parent
      leftPosition = `-${submenuRect.width}px`;
      submenu.classList.add("position-left");
    }

    // Calculate best vertical position
    let topPosition = "0"; // Default: aligned with parent top

    // Check if submenu would go off-screen at the bottom
    if (parentRect.top + submenuRect.height > viewportHeight - 10) {
      // Position submenu to align with bottom of parent or viewport
      const availableSpace = viewportHeight - parentRect.bottom - 10;
      if (availableSpace >= submenuRect.height) {
        topPosition = `${parentRect.height - submenuRect.height}px`;
      } else {
        // Position to fit within viewport
        topPosition = `${
          viewportHeight - parentRect.top - submenuRect.height - 10
        }px`;
      }
      submenu.classList.add("position-up");
    }

    // Apply calculated positions
    submenu.style.left = leftPosition;
    submenu.style.top = topPosition;
  }

  /**
   * Execute context menu action
   */
  executeAction(action, data = null) {
    // Log all individual properties
    if (data) {
      // Log any additional properties
      const knownProps = ["label", "key", "icon", "action"];
      const additionalProps = Object.keys(data).filter(
        (key) => !knownProps.includes(key)
      );
    }

    switch (action) {
      case "refresh":
        this.refresh(data);
        break;
      case "Inspect":
        this.enableBrowserInspect(data);
        break;

      // Elements actions — edit/delete/copy/borderRadius/shadowBox pakai elemen yang diklik;
      // section/paste/icon/grid pakai insertTarget (child editableEl)
      case "elementsEdit":
        { const _et = this.lastMousePosition?.target || this.currentTarget;
          this.elements.elementsEdit({ ...data, targetElement: _et, actualClickedElement: _et, mousePosition: this.lastMousePosition, currentTarget: this.currentTarget }); }
        break;
      case "elementsCode":
        { const _ec = this.lastMousePosition?.target || this.currentTarget;
          this.elements.elementsCode({ ...data, targetElement: _ec, actualClickedElement: _ec, mousePosition: this.lastMousePosition, currentTarget: this.currentTarget }); }
        break;
      case "elementsDelete":
        { const _ed = this.lastMousePosition?.target || this.currentTarget;
          this.elements.elementsDelete({ ...data, targetElement: _ed, actualClickedElement: _ed, mousePosition: this.lastMousePosition, currentTarget: this.currentTarget }); }
        break;
      case "elementsCopy":
        { const _ecp = this.lastMousePosition?.target || this.currentTarget;
          this.elements.elementsCopy({ ...data, targetElement: _ecp, actualClickedElement: _ecp, mousePosition: this.lastMousePosition, currentTarget: this.currentTarget }); }
        break;
      case "elementsPaste":
        { const _epi = this._resolveInsertTarget();
          this._syncInsertTarget(_epi);
          this.elements.elementsPaste({ ...data, targetElement: _epi, actualClickedElement: _epi, mousePosition: this.lastMousePosition, currentTarget: this.currentTarget }); }
        break;
      case "elementsSection":
        { const _esi = this._resolveInsertTarget();
          this._syncInsertTarget(_esi);
          this.elements.elementsSection({ ...data, targetElement: _esi, actualClickedElement: _esi, mousePosition: this.lastMousePosition, currentTarget: this.currentTarget }); }
        break;
      case "elementsBorderRadius":
        { const _ebr = this.lastMousePosition?.target || this.currentTarget;
          this.elements.elementsBorderRadius({ ...data, targetElement: _ebr, actualClickedElement: _ebr, mousePosition: this.lastMousePosition, currentTarget: this.currentTarget }); }
        break;
      case "elementsShadowBox":
        { const _esb = this.lastMousePosition?.target || this.currentTarget;
          this.elements.elementsShadowBox({ ...data, targetElement: _esb, actualClickedElement: _esb, mousePosition: this.lastMousePosition, currentTarget: this.currentTarget }); }
        break;
      case "elementsIcon":
        { const _eic = this._resolveInsertTarget();
          this._syncInsertTarget(_eic);
          this.elements.elementsIcon({ ...data, targetElement: _eic, actualClickedElement: _eic, mousePosition: this.lastMousePosition, currentTarget: this.currentTarget }); }
        break;

      // Grid System Actions — semua pakai insertTarget (child editableEl)
      case "gridElement":
      case "addGridColumn1":
      case "addGridColumn2":
      case "addGridColumn3":
      case "addGridColumn4":
      case "addGridColumn5":
      case "addGridColumn6":
      case "addGridColumn7":
      case "addGridColumn8":
      case "addGridColumn9":
      case "addGridColumn10":
      case "addGridColumn11":
      case "addGridColumn12":
        { const _gt = this._resolveInsertTarget();
          this._syncInsertTarget(_gt);
          const _gd = { ...data, targetElement: _gt, actualClickedElement: _gt, mousePosition: this.lastMousePosition, currentTarget: this.currentTarget };
          this.elements[action](_gd); }
        break;

      // Background Elements actions
      case "backgroundSolidColors":
        this.handleBackgroundAction("contextBackgroundSolidColors", data);
        break;
      case "backgroundGradients":
        this.handleBackgroundAction("contextBackgroundGradients", data);
        break;
      case "backgroundPatterns":
        this.handleBackgroundAction("contextBackgroundPatterns", data);
        break;
      case "backgroundImages":
        this.handleBackgroundAction("contextBackgroundImages", data);
        break;
      case "backgroundTextures":
        this.handleBackgroundAction("contextBackgroundTextures", data);
        break;
      case "backgroundEffects":
        this.handleBackgroundAction("contextBackgroundEffects", data);
        break;
      case "backgroundAdvanced":
        this.handleBackgroundAction("contextBackgroundAdvanced", data);
        break;
      case "backgroundReset":
        this.handleBackgroundAction("contextBackgroundReset", data);
        break;

      // Element Interactions actions
      case "toggleSortable":
        this.handleElementInteractionAction("toggleSortable", data);
        break;
      case "toggleDraggable":
        this.handleElementInteractionAction("toggleDraggable", data);
        break;
      case "toggleResizable":
        this.handleElementInteractionAction("toggleResizable", data);
        break;
      case "disableAllInteractions":
        this.handleElementInteractionAction("disableAllInteractions", data);
        break;
      case "toggleGridSnap":
        this.handleElementInteractionAction("toggleGridSnap", data);
        break;
      case "gridSnapSettings":
        this.handleElementInteractionAction("gridSnapSettings", data);
        break;
      case "toFront":
        this.handleElementInteractionAction("toFront", data);
        break;
      case "toBack":
        this.handleElementInteractionAction("toBack", data);
        break;
      case "toggleHoverBoundaries":
        this.handleElementInteractionAction("toggleHoverBoundaries", data);
        break;
      case "toggleAllBoundaries":
        this.handleElementInteractionAction("toggleAllBoundaries", data);
        break;
      case "setBoundaryStyleSubtle":
        this.handleElementInteractionAction("setBoundaryStyleSubtle", data);
        break;
      case "setBoundaryStyleVisible":
        this.handleElementInteractionAction("setBoundaryStyleVisible", data);
        break;
      case "setBoundaryStyleHighlight":
        this.handleElementInteractionAction("setBoundaryStyleHighlight", data);
        break;
      case "zoomInElement":
        this.handleElementInteractionAction("zoomInElement", data);
        break;
      case "zoomOutElement":
        this.handleElementInteractionAction("zoomOutElement", data);
        break;
      case "zoomElementTo50":
        this.handleElementInteractionAction("zoomElementTo50", data);
        break;
      case "zoomElementTo75":
        this.handleElementInteractionAction("zoomElementTo75", data);
        break;
      case "zoomElementTo100":
        this.handleElementInteractionAction("zoomElementTo100", data);
        break;
      case "zoomElementTo125":
        this.handleElementInteractionAction("zoomElementTo125", data);
        break;
      case "zoomElementTo150":
        this.handleElementInteractionAction("zoomElementTo150", data);
        break;
      case "zoomFitToContainer":
        this.handleElementInteractionAction("zoomFitToContainer", data);
        break;
      case "toggleWheelZoom":
        this.handleElementInteractionAction("toggleWheelZoom", data);
        break;
      case "fullscreenPercentage50":
        this.handleElementInteractionAction("fullscreenPercentage50", data);
        break;
      case "fullscreenPercentage75":
        this.handleElementInteractionAction("fullscreenPercentage75", data);
        break;
      case "fullscreenPercentage90":
        this.handleElementInteractionAction("fullscreenPercentage90", data);
        break;
      case "fullscreenPercentage100":
        this.handleElementInteractionAction("fullscreenPercentage100", data);
        break;
      case "fullscreenDesktopHD":
        this.handleElementInteractionAction("fullscreenDesktopHD", data);
        break;
      case "fullscreenDesktopFHD":
        this.handleElementInteractionAction("fullscreenDesktopFHD", data);
        break;
      case "fullscreenDesktop2K":
        this.handleElementInteractionAction("fullscreenDesktop2K", data);
        break;
      case "fullscreenDesktop4K":
        this.handleElementInteractionAction("fullscreenDesktop4K", data);
        break;
      case "fullscreenIPad":
        this.handleElementInteractionAction("fullscreenIPad", data);
        break;
      case "fullscreenIPadPro":
        this.handleElementInteractionAction("fullscreenIPadPro", data);
        break;
      case "fullscreenAndroidTablet":
        this.handleElementInteractionAction("fullscreenAndroidTablet", data);
        break;
      case "fullscreenIPhoneSE":
        this.handleElementInteractionAction("fullscreenIPhoneSE", data);
        break;
      case "fullscreenIPhone12":
        this.handleElementInteractionAction("fullscreenIPhone12", data);
        break;
      case "fullscreenIPhoneProMax":
        this.handleElementInteractionAction("fullscreenIPhoneProMax", data);
        break;
      case "fullscreenAndroidMobile":
        this.handleElementInteractionAction("fullscreenAndroidMobile", data);
        break;
      case "exitFullscreen":
        this.handleElementInteractionAction("exitFullscreen", data);
        break;

      // Image Tools actions
      case "changeImageSource":
        this.handleImageToolsAction("contextChangeImageSource", data);
        break;
      case "openImageEditor":
        this.handleImageToolsAction("contextOpenImageEditor", data);
        break;
      case "replaceFromUnsplash":
        this.handleImageToolsAction("contextReplaceFromUnsplash", data);
        break;
      case "insertFromUnsplash":
        this.handleImageToolsAction("contextInsertFromUnsplash", data);
        break;
      case "addImageNature":
        this.handleImageToolsAction("contextAddImageFromUnsplash", {
          ...data,
          category: "nature",
        });
        break;
      case "addImageBusiness":
        this.handleImageToolsAction("contextAddImageFromUnsplash", {
          ...data,
          category: "business",
        });
        break;
      case "addImagePeople":
        this.handleImageToolsAction("contextAddImageFromUnsplash", {
          ...data,
          category: "people",
        });
        break;
      case "addImageTechnology":
        this.handleImageToolsAction("contextAddImageFromUnsplash", {
          ...data,
          category: "technology",
        });
        break;
      case "addImageFood":
        this.handleImageToolsAction("contextAddImageFromUnsplash", {
          ...data,
          category: "food",
        });
        break;
      case "addImageTravel":
        this.handleImageToolsAction("contextAddImageFromUnsplash", {
          ...data,
          category: "travel",
        });
        break;
      case "addImageRandom":
        this.handleImageToolsAction("contextAddImageFromUnsplash", {
          ...data,
          category: "random",
        });
        break;
      case "insertPlaceholder":
        this.handleImageToolsAction("contextInsertPlaceholder", data);
        break;
      case "uploadImage":
        this.handleImageToolsAction("contextUploadImage", data);
        break;

      // Create Table actions
      case "createTable":
        this.handleCreateTableAction("contextCreateTable", data);
        break;

      // Create Form actions
      case "createFormBuilderModal":
        this.handleCreateFormAction("createFormBuilderModal", data);
        break;

      // Chart Elements actions
      case "chartElements":
      case "insertBarChart":
      case "insertLineChart":
      case "insertPieChart":
      case "insertDoughnutChart":
      case "insertRadarChart":
        this.handleChartElementsAction(action, data);
        break;

      // Leaflet Maps actions - Basic Maps
      case "leafletMaps":
      case "basicMaps":
      case "insertSimpleMap":
      case "insertStreetMap":
      case "insertSatelliteMap":
      case "insertTerrainMap":
      case "insertDarkMap":
        this.handleLeafletMapsAction(action, data);
        break;

      // Leaflet Maps actions - Interactive Features
      case "interactiveFeatures":
      case "mapMarkers":
      case "insertSingleMarker":
      case "insertMultipleMarkers":
      case "insertCustomMarkers":
      case "insertAnimatedMarkers":
      case "mapPopups":
      case "insertSimplePopup":
      case "insertRichPopup":
      case "insertTooltip":
      case "mapControls":
      case "insertZoomControls":
      case "insertLayerControl":
      case "insertScaleControl":
      case "mapEvents":
      case "insertClickEvents":
      case "insertDragEvents":
      case "insertZoomEvents":
        this.handleLeafletMapsAction(action, data);
        break;

      // Leaflet Maps actions - Data Visualization
      case "dataVisualization":
      case "insertHeatmap":
      case "insertChoroplethMap":
      case "insertGeoJSONLayer":
      case "insertClusterMarkers":
      case "insertRoutePlanning":
      case "insertMeasurementTools":
        this.handleLeafletMapsAction(action, data);
        break;

      // Leaflet Maps actions - Map Styling
      case "mapStyling":
      case "mapThemes":
      case "applyLightTheme":
      case "applyDarkTheme":
      case "applyRetroTheme":
      case "applyCustomTheme":
      case "insertCustomTiles":
      case "insertMapFilters":
        this.handleLeafletMapsAction(action, data);
        break;

      // Leaflet Maps actions - Location Services
      case "locationServices":
      case "enableGeolocation":
      case "insertAddressSearch":
      case "insertGeocoding":
      case "insertRealTimeTracking":
        this.handleLeafletMapsAction(action, data);
        break;

      // Iframe actions
      case "iframeElements":
      case "insertIframePdf":
      case "insertIframeYoutube":
      case "insertIframeCustom":
        this.handleIframeAction(action, data);
        break;

      // Layout actions
      case "layoutElements":
      case "insertMediaBasic":
      case "insertMediaCentered":
      case "insertMediaBottom":
      case "insertMediaReverse":
      case "insertMediaSmall":
      case "insertMediaLarge":
      case "insertMediaBordered":
      case "insertMediaHover":
      case "insertMediaRound":
      case "insertMediaGrayscale":
      case "insertMediaBlurred":
      case "insertMediaSpecific":
        this.handleLayoutAction(action, data);
        break;
      case "insertProgressBar":
        this.handleLayoutAction(action, data);
        break;

      // Content Object actions
      case "contentElements":
      case "contentProgress":
      case "contentPercentage":
      case "contentProgres":
      case "contentNarasi":
      case "contentForm":
      case "contentTabel":
      case "contentSearch":
        this.handleContentObjectAction(action, data).catch((error) => {
          console.error(`❌ Error executing content action ${action}:`, error);
          this.showNotification(`Error: ${error.message}`, "error");
        });
        break;

      // Text Formatting Actions — pakai currentEditableElement agar
      // execCommand dan updateTextFormattingContext bekerja di dalam contenteditable
      case "textFormatting":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        break;
      case "changeTextSize":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextChangeTextSize();
        break;
      case "changeTextColor":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextChangeTextColor();
        break;
      case "changeTextFont":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextChangeTextFont();
        break;
      case "textBold":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextTextBold();
        break;
      case "textItalic":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextTextItalic();
        break;
      case "textUnderline":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextTextUnderline();
        break;
      case "textAlignLeft":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextTextAlignLeft();
        break;
      case "textAlignCenter":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextTextAlignCenter();
        break;
      case "textAlignRight":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextTextAlignRight();
        break;
      case "textAlignJustify":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextTextAlignJustify();
        break;
      case "textUndo":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextTextUndo();
        break;
      case "textRedo":
        this.updateTextFormattingContext({ ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target });
        this.textFormatting.contextTextRedo();
        break;

      // Basic Text Operations
      case "cutText":
        { const _ctd = { ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target };
          this.updateTextFormattingContext(_ctd);
          this.textFormatting.cutText(_ctd); }
        break;
      case "copyText":
        { const _cpd = { ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target };
          this.updateTextFormattingContext(_cpd);
          this.textFormatting.copyText(_cpd); }
        break;
      case "pasteText":
        { const _ptd = { ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target };
          this.updateTextFormattingContext(_ptd);
          this.textFormatting.pasteText(_ptd); }
        break;
      case "removeFormatting":
        { const _rfd = { ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target };
          this.updateTextFormattingContext(_rfd);
          this.textFormatting.removeFormatting(_rfd); }
        break;
      case "selectAll":
        { const _sad = { ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target };
          this.updateTextFormattingContext(_sad);
          this.textFormatting.selectAll(_sad); }
        break;
      case "print":
        this.handlePrintCommand().catch((error) => {
          console.error("❌ Error printing:", error);
          this.showNotification(`Error: ${error.message}`, "error");
        });
        break;
      case "findReplace":
        { const _frd = { ...data, targetElement: this.currentEditableElement || this.lastMousePosition?.target };
          this.updateTextFormattingContext(_frd);
          this.textFormatting.findReplace(_frd); }
        break;
      case "insertLink":
        { const _ild = { ...data, targetElement: this._resolveInsertTarget() };
          this._syncInsertTarget(_ild.targetElement);
          this.updateTextFormattingContext(_ild);
          this.textFormatting.insertLink(_ild); }
        break;
      case "insertImage":
        { const _iid = { ...data, targetElement: this._resolveInsertTarget() };
          this._syncInsertTarget(_iid.targetElement);
          this.updateTextFormattingContext(_iid);
          this.textFormatting.insertImage(_iid); }
        break;

      // NexaStore actions - handle all NexaStore actions
      case "newTabel":
      case "openStoredTable":
      case "dataTabel":
      case "editTable":
      case "deleteTable":
      case "settingsTable":
      case "settingsForm":
      case "settingsChart":
      case "settingsCount":
      case "settingsJoin":
      case "settingsGroup":
      case "infoTable":
        // Handle async NexaStore actions
        this.handleNexaStoreAction(action, data).catch((error) => {
          console.error(
            `❌ Error executing NexaStore action ${action}:`,
            error
          );
          this.showNotification(`Error: ${error.message}`, "error");
        });
        break;

      default:
        // Check if this is an Applications action (from controllers.js)
        // Action format: {type}Applications (contoh: "dataApplications", "petirApplications")
        if (action && action.endsWith("Applications")) {
          this.handleContentObjectAction(action, data).catch((error) => {
            console.error(`❌ Error executing Applications action ${action}:`, error);
            this.showNotification(`Error: ${error.message}`, "error");
          });
          break;
        }
        
        // Check if this is a data_* action from NexaStore
        if (action.startsWith("data_")) {
          this.handleNexaStoreAction(action, data).catch((error) => {
            console.error(
              `❌ Error executing NexaStore data action ${action}:`,
              error
            );
            this.showNotification(`Error: ${error.message}`, "error");
          });
          break;
        }
        // Call custom action handler if available
        if (
          this.config.onCustomAction &&
          typeof this.config.onCustomAction === "function"
        ) {
          this.config.onCustomAction(action, data);
        }
    }
  }

  /**
   * Resolve the correct insert target element.
   * Returns a CHILD of the editable container so that insertBefore/insertAdjacentElement
   * places new content INSIDE the contenteditable, not after it in the document.
   *
   * Priority:
   * 1. lastMousePosition.target  — jika merupakan child dari editableEl → pakai langsung
   * 2. editableEl.lastElementChild — child terakhir editableEl sebagai fallback
   * 3. currentTarget / lastMousePosition.target — tanpa filter (bukan di Office context)
   */
  _resolveInsertTarget() {
    const raw = this.lastMousePosition?.target || this.currentTarget;
    const editable = this.currentEditableElement;
    if (editable && editable.isConnected) {
      if (raw && raw !== editable && editable.contains(raw)) return raw;
      return editable.lastElementChild || editable;
    }
    return raw;
  }

  /**
   * Sync insertTarget ke semua sub-module sekaligus.
   * Dipanggil sebelum setiap handler action agar target konsisten.
   */
  _syncInsertTarget(insertTarget) {
    if (!insertTarget) return;
    if (this.elements) {
      this.elements.targetElement        = insertTarget;
      this.elements.currentTargetElement = insertTarget;
      if (this.elements.Interactions) this.elements.Interactions.targetElement = insertTarget;
    }
    if (this.Interactions) this.Interactions.targetElement = insertTarget;
    if (this.chartElements?.interactions) this.chartElements.interactions.targetElement = insertTarget;
    if (this.LeafletMaps) {
      this.LeafletMaps.targetElement = insertTarget;
      if (this.LeafletMaps.interactions) this.LeafletMaps.interactions.targetElement = insertTarget;
    }
    if (this.Iframe) {
      this.Iframe.targetElement = insertTarget;
      this.Iframe.currentTargetElement = insertTarget;
      if (this.Iframe.interactions) this.Iframe.interactions.targetElement = insertTarget;
    }
    if (this.Layout) {
      if (this.Layout.interactions) this.Layout.interactions.targetElement = insertTarget;
      this.Layout.targetElement = insertTarget;
    }
    if (this.CreateTable?.interactions) this.CreateTable.interactions.targetElement = insertTarget;
    if (this.createForm?.interactions) this.createForm.interactions.targetElement = insertTarget;
    if (this.background) this.background.targetElement = insertTarget;
    // imageTools.insertElementAtPosition pakai target sebagai PARENT container
    // dan mencari posisi berdasarkan koordinat mouse di antara childrennya.
    // Jadi harus pakai editableEl (container), bukan child-nya.
    if (this.imageTools) {
      this.imageTools.targetElement = (this.currentEditableElement?.isConnected ? this.currentEditableElement : insertTarget);
    }
  }

  /**
   * Handle Element Interactions actions
   */
  handleElementInteractionAction(action, data) {
    try {
      // Set target element for Interactions
      const targetElement = this._resolveInsertTarget();

      this.Interactions.setTargetElement(targetElement);

      // Call the appropriate method on Interactions
      const result = this.Interactions[action](data);

      // Show user feedback
      if (result && result.message) {
        this.showNotification(
          result.message,
          result.success ? "success" : "error"
        );
      }

      return result;
    } catch (error) {
      console.error(
        `❌ Failed to execute ElementInteraction action ${action}:`,
        error
      );
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Background actions
   */
  handleBackgroundAction(action, data) {
    try {
      // Background menerapkan style ke elemen yang diklik, bukan insert baru
      const targetElement = this.lastMousePosition?.target || this.currentTarget;
      if (this.background) this.background.targetElement = targetElement;

      // Call the appropriate method on Background
      const result = this.background[action](data);

      // Show user feedback
      if (result && result.message) {
        this.showNotification(
          result.message,
          result.success ? "success" : "error"
        );
      }

      return result;
    } catch (error) {
      console.error(`❌ Failed to execute Background action ${action}:`, error);
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Image Tools actions
   */
  handleImageToolsAction(action, data) {
    try {
      const targetElement = this._resolveInsertTarget();
      this._syncInsertTarget(targetElement);

      // Action yang butuh elemen <img> yang diklik langsung (bukan container)
      const imgActions = ["contextChangeImageSource", "contextOpenImageEditor", "contextOpenimageEditor", "contextReplaceFromUnsplash"];
      // rawClickTarget = elemen asli yang diklik kanan (sebelum di-resolve ke insertTarget)
      const rawClickTarget = this.rawClickTarget || this.lastMousePosition?.target || this.currentTarget;

      // imageTools butuh editableEl sebagai container, bukan child-nya
      const imgContainer = this.currentEditableElement?.isConnected
        ? this.currentEditableElement
        : targetElement;

      let result;
      if (imgActions.includes(action)) {
        // Cari <img> terdekat: rawClickTarget sendiri, closest ancestor, atau img pertama di dalamnya
        const imgEl = (rawClickTarget?.tagName === 'IMG')
          ? rawClickTarget
          : (rawClickTarget?.closest?.('img') || rawClickTarget?.querySelector?.('img') || rawClickTarget);
        this.imageTools.targetElement = imgEl;
        result = this.imageTools[action](data);
      } else if (action === "contextAddImageFromUnsplash" && data && data.category) {
        result = this.imageTools[action](data.category);
      } else if (
        action === "contextInsertPlaceholder" ||
        action === "contextUploadImage" ||
        action === "contextInsertFromUnsplash"
      ) {
        result = this.imageTools[action](imgContainer);
      } else {
        result = this.imageTools[action](data);
      }

      // Show user feedback
      if (result && result.message) {
        this.showNotification(
          result.message,
          result.success ? "success" : "error"
        );
      }

      return result;
    } catch (error) {
      console.error(
        `❌ Failed to execute Image Tools action ${action}:`,
        error
      );
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Create Table actions
   */
  handleCreateTableAction(action, data) {
    try {
      const targetElement = this._resolveInsertTarget();
      this._syncInsertTarget(targetElement);

      // Call the appropriate method on CreateTable
      const result = this.CreateTable[action](data);

      // Show user feedback
      if (result && result.message) {
        this.showNotification(
          result.message,
          result.success ? "success" : "error"
        );
      }

      return result;
    } catch (error) {
      console.error(
        `❌ Failed to execute Create Table action ${action}:`,
        error
      );
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Create Form actions
   */
  handleCreateFormAction(action, data) {
    try {
      const targetElement = this._resolveInsertTarget();
      this._syncInsertTarget(targetElement);

      // Call the appropriate method on createForm
      const result = this.createForm[action](data);

      // Show user feedback
      if (result && result.message) {
        this.showNotification(
          result.message,
          result.success ? "success" : "error"
        );
      }

      return result;
    } catch (error) {
      console.error(
        `❌ Failed to execute Create Form action ${action}:`,
        error
      );
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Chart Elements actions
   */
  handleChartElementsAction(action, data) {
    try {
      const targetElement = this._resolveInsertTarget();
      this._syncInsertTarget(targetElement);

      // Call the handleChartActions method on chartElements
      const result = this.chartElements.handleChartActions(action);

      // Show user feedback
      if (result && result.message) {
        this.showNotification(
          result.message,
          result.success ? "success" : "error"
        );
      } else if (result === true) {
        // Action was handled successfully but no specific result
        this.showNotification(
          `Chart action ${action} executed successfully`,
          "success"
        );
      } else if (result === false) {
        // Action was not recognized
      }

      return result;
    } catch (error) {
      console.error(
        `❌ Failed to execute Chart Elements action ${action}:`,
        error
      );
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Leaflet Maps actions
   */
  handleLeafletMapsAction(action, data) {
    try {
      const targetElement = this._resolveInsertTarget();
      this._syncInsertTarget(targetElement);

      // Call the handleAction method on LeafletMaps
      const result = this.LeafletMaps.handleAction(action, targetElement);

      // Show user feedback
      if (result && result.message) {
        this.showNotification(
          result.message,
          result.success ? "success" : "error"
        );
      } else if (result === true) {
        // Action was handled successfully but no specific result
        this.showNotification(
          `Leaflet Maps action ${action} executed successfully`,
          "success"
        );
      } else if (result === false) {
        // Action was not recognized
      }

      return result;
    } catch (error) {
      console.error(
        `❌ Failed to execute Leaflet Maps action ${action}:`,
        error
      );
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Iframe actions
   */
  handleIframeAction(action, data) {
    try {
      const targetElement = this._resolveInsertTarget();
      this._syncInsertTarget(targetElement);

      // Call the handleAction method on Iframe
      const result = this.Iframe.handleAction(action, targetElement);

      // Show user feedback
      if (result && result.message) {
        this.showNotification(
          result.message,
          result.success ? "success" : "error"
        );
      } else if (result === true) {
        // Action was handled successfully but no specific result
        this.showNotification(
          `Iframe action ${action} executed successfully`,
          "success"
        );
      } else if (result === false) {
        // Action was not recognized
      }

      return result;
    } catch (error) {
      console.error(`❌ Failed to execute Iframe action ${action}:`, error);
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Layout actions
   */
  handleLayoutAction(action, data) {
    try {
      const targetElement = this._resolveInsertTarget();
      this._syncInsertTarget(targetElement);

      // Call the appropriate method on Layout
      let result;
      switch (action) {
        case "insertMediaBasic":
          result = this.Layout.insertMediaBasic();
          break;
        case "insertMediaCentered":
          result = this.Layout.insertMediaCentered();
          break;
        case "insertMediaBottom":
          result = this.Layout.insertMediaBottom();
          break;
        case "insertMediaReverse":
          result = this.Layout.insertMediaReverse();
          break;
        case "insertMediaSmall":
          result = this.Layout.insertMediaSmall();
          break;
        case "insertMediaLarge":
          result = this.Layout.insertMediaLarge();
          break;
        case "insertMediaBordered":
          result = this.Layout.insertMediaBordered();
          break;
        case "insertMediaHover":
          result = this.Layout.insertMediaHover();
          break;
        case "insertMediaRound":
          result = this.Layout.insertMediaRound();
          break;
        case "insertMediaGrayscale":
          result = this.Layout.insertMediaGrayscale();
          break;
        case "insertMediaBlurred":
          result = this.Layout.insertMediaBlurred();
          break;
        case "insertMediaSpecific":
          result = this.Layout.insertMediaSpecific();
          break;
        default:
          return false;
      }

      // Show user feedback
      if (result && result.message) {
        this.showNotification(
          result.message,
          result.success ? "success" : "error"
        );
      } else if (result === true || result) {
        // Action was handled successfully
        this.showNotification(
          `Layout action ${action} executed successfully`,
          "success"
        );
      } else if (result === false) {
        // Action was not recognized
      }

      return result;
    } catch (error) {
      console.error(`❌ Failed to execute Layout action ${action}:`, error);
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle Content Object actions
   */
  async handleContentObjectAction(action, data) {
    try {
      // Set target element for Content Object
      const targetElement =
        this.lastMousePosition?.target || this.currentTarget;

      // Check if this is an Applications action (should be handled by ProgramFiles)
      if (action && action.endsWith("Applications")) {
        const baseType = action.replace("Applications", "");
        
        // Handle through ProgramFiles
        if (this.ProgramFiles && this.ProgramFiles.handleApplicationsAction) {
          const result = await this.ProgramFiles.handleApplicationsAction(baseType, targetElement, {
            targetElement,
            ...data,
          });
          
          // Show user feedback
          if (result && result.message) {
            this.showNotification(
              result.message,
              result.success ? "success" : "error"
            );
          } else if (result === true) {
            this.showNotification(
              `Action ${action} executed successfully`,
              "success"
            );
          }
          
          return result;
        }
      }

      // For other actions, try ContentObject if available
      if (this.Layout && this.Layout.contentObject) {
        // Update the target element in the Layout instance
        this.Layout.contentObject.interactions.targetElement = targetElement;

        // Call the appropriate method on ContentObject
        const result = await this.Layout.contentObject.handleContentAction(action, {
          targetElement,
          ...data,
        });

        // Show user feedback
        if (result && result.message) {
          this.showNotification(
            result.message,
            result.success ? "success" : "error"
          );
        } else if (result === true) {
          // Action was handled successfully but no specific result
          this.showNotification(
            `Content action ${action} executed successfully`,
            "success"
          );
        } else if (result === false) {
          // Action was not recognized
        }

        return result;
      }

      return { success: false, error: "ContentObject not available" };
    } catch (error) {
      console.error(
        `❌ Failed to execute Content Object action ${action}:`,
        error
      );
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle NexaStore actions
   */
  async handleNexaStoreAction(action, data) {
    try {
      // Set target element for NexaStore
      const targetElement =
        this.lastMousePosition?.target || this.currentTarget;

      // Set the target element on the nexaStore instance if needed
      if (this.nexaStore.targetElement !== undefined) {
        this.nexaStore.targetElement = targetElement;
      }

      // Use NexaStore's handleAction method which has all the logic
      const result = await this.nexaStore.handleAction(action, data);

      // Show user feedback
      if (result && result.message) {
        this.showNotification(
          result.message,
          result.success ? "success" : "error"
        );
      } else if (result === true) {
        // Action was handled successfully but no specific result
        this.showNotification(
          `NexaStore action ${action} executed successfully`,
          "success"
        );
      } else if (result === false) {
        // Action was not recognized
      }

      return result;
    } catch (error) {
      console.error(`❌ Failed to execute NexaStore action ${action}:`, error);
      this.showNotification(
        `Failed to execute ${action}: ${error.message}`,
        "error"
      );
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert Interactions menu structure to match NexaReactive format
   */
  convertInteractionsMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label: typeof item.text === "function" ? item.text() : item.text, // Convert text to label, handle functions
      };

      // Remove Interactions-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertInteractionsMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Convert Background menu structure to match NexaReactive format
   */
  convertBackgroundMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label: typeof item.text === "function" ? item.text() : item.text, // Convert text to label, handle functions
      };

      // Remove Background-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertBackgroundMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Convert Image Tools menu structure to match NexaReactive format
   */
  convertImageToolsMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label: typeof item.text === "function" ? item.text() : item.text, // Convert text to label, handle functions
      };

      // Remove Image Tools-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertImageToolsMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Convert Elements menu structure to match NexaReactive format with showCondition support
   */
  convertElementsMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems
      .map((item) => {
        // Evaluate showCondition if present
        let shouldShow = true;

        if (item.showCondition) {
          switch (item.showCondition) {
            case "hasUndoHistory":
              shouldShow = false; // Elements no longer handles TextFormatting
              break;
            case "hasRedoHistory":
              shouldShow = false; // Elements no longer handles TextFormatting
              break;
            case "hasSelectedText":
              shouldShow = false; // Elements no longer handles TextFormatting
              break;
            default:
              shouldShow = true;
          }
        }

        // Skip this item if condition is not met
        if (!shouldShow) {
          return null;
        }

        // Create converted item
        const convertedItem = {
          ...item,
          label:
            typeof item.text === "function"
              ? item.text()
              : item.text || item.label, // Convert text to label, handle functions
        };

        // Remove Elements-specific properties
        delete convertedItem.text;
        delete convertedItem.id;
        delete convertedItem.showCondition;

        // Recursively convert submenu items
        if (item.submenu && Array.isArray(item.submenu)) {
          const convertedSubmenu = this.convertElementsMenu(item.submenu);
          // Filter out null items (items that don't meet showCondition)
          convertedItem.submenu = convertedSubmenu.filter(
            (subitem) => subitem !== null
          );
        }

        return convertedItem;
      })
      .filter((item) => item !== null); // Filter out null items at top level
  }

  /**
   * Convert TextFormatting menu structure to match NexaReactive format with showCondition support
   */
  convertTextFormattingMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems
      .map((item) => {
        // Evaluate showCondition if present
        let shouldShow = true;

        if (item.showCondition) {
          switch (item.showCondition) {
            case "hasUndoHistory":
              shouldShow =
                this.textFormatting && this.textFormatting.hasUndoHistory
                  ? this.textFormatting.hasUndoHistory()
                  : false;

              break;
            case "hasRedoHistory":
              shouldShow =
                this.textFormatting && this.textFormatting.hasRedoHistory
                  ? this.textFormatting.hasRedoHistory()
                  : false;

              break;
            case "hasSelectedText":
              // More permissive: show if there's actual text selection OR if target element has text content
              const actualSelection =
                window.getSelection()?.toString().trim().length > 0;
              const hasTargetWithText =
                this.Interactions?.targetElement?.textContent?.trim().length >
                0;
              shouldShow = actualSelection || hasTargetWithText || false;

              break;
            default:
              shouldShow = true;
          }
        }

        // Return null if item should not be shown
        if (!shouldShow) {
          return null;
        }

        // Convert TextFormatting format to NexaReactive format
        const convertedItem = {
          label: item.text || item.label, // TextFormatting uses 'text', NexaReactive uses 'label'
          icon: item.icon,
          action: item.action,
        };

        // Remove properties that are not needed in the converted format
        delete convertedItem.id;
        delete convertedItem.showCondition;

        // Recursively convert submenu items
        if (item.submenu && Array.isArray(item.submenu)) {
          const convertedSubmenu = this.convertTextFormattingMenu(item.submenu);
          // Filter out null items (items that don't meet showCondition)
          convertedItem.submenu = convertedSubmenu.filter(
            (subitem) => subitem !== null
          );
        }

        // Handle separator items
        if (item.type === "separator") {
          convertedItem.type = "separator";
          delete convertedItem.label;
          delete convertedItem.icon;
          delete convertedItem.action;
        }

        return convertedItem;
      })
      .filter((item) => item !== null); // Filter out null items at top level
  }

  /**
   * Convert Create Table menu structure to match NexaReactive format
   */
  convertCreateTableMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label: typeof item.text === "function" ? item.text() : item.text, // Convert text to label, handle functions
      };

      // Remove Create Table-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertCreateTableMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Convert Create Form menu structure to match NexaReactive format
   */
  convertCreateFormMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label: typeof item.text === "function" ? item.text() : item.text, // Convert text to label, handle functions
      };

      // Remove Create Form-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertCreateFormMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Convert Chart Elements menu structure to match NexaReactive format
   */
  convertChartElementsMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label: typeof item.text === "function" ? item.text() : item.text, // Convert text to label, handle functions
      };

      // Remove Chart Elements-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertChartElementsMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Convert Leaflet Maps menu structure to match NexaReactive format
   */
  convertLeafletMapsMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label: typeof item.text === "function" ? item.text() : item.text, // Convert text to label, handle functions
      };

      // Remove Leaflet Maps-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertLeafletMapsMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Convert Iframe menu structure to match NexaReactive format
   */
  convertIframeMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label: typeof item.text === "function" ? item.text() : item.text, // Convert text to label, handle functions
      };

      // Remove Iframe-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertIframeMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Convert Layout menu structure to match NexaReactive format
   */
  convertLayoutMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label: typeof item.text === "function" ? item.text() : item.text, // Convert text to label, handle functions
      };

      // Remove Layout-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertLayoutMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Convert Program Files menu structure to match NexaReactive format
   */
  convertProgramFilesMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label:
          typeof item.text === "function"
            ? item.text()
            : item.text || item.label, // Convert text to label, handle functions
      };

      // Remove Program Files-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertProgramFilesMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Convert NexaStore menu structure to match NexaReactive format
   */
  convertNexaStoreMenu(menuItems) {
    if (!menuItems || !Array.isArray(menuItems)) {
      return [];
    }

    return menuItems.map((item) => {
      // Create converted item
      const convertedItem = {
        ...item,
        label:
          typeof item.text === "function"
            ? item.text()
            : item.text || item.label, // Convert text to label, handle functions
      };

      // Remove NexaStore-specific properties
      delete convertedItem.text;
      delete convertedItem.id;
      delete convertedItem.showCondition;

      // Recursively convert submenu items
      if (item.submenu && Array.isArray(item.submenu)) {
        convertedItem.submenu = this.convertNexaStoreMenu(item.submenu);
      }

      return convertedItem;
    });
  }

  /**
   * Update TextFormatting interactions with current context
   */
  updateTextFormattingContext(data = null) {
    try {
      // Update target element if provided
      if (data?.targetElement) {
        this.Interactions.targetElement = data.targetElement;
        this.Interactions.currentTargetElement = data.targetElement;
      }

      // Get current text selection
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        this.Interactions.selectedText = selection.toString();
        this.hasTextSelection = true;
      } else {
        this.Interactions.selectedText = "";
        this.hasTextSelection = false;
      }
    } catch (error) {
      console.error("❌ Error updating TextFormatting context:", error);
      this.Interactions.selectedText = "";
      this.hasTextSelection = false;
    }
  }

  /**
   * Show notification to user
   */
  showNotification(message, type = "info") {
    console.log('showNotification:', message);
    // Remove existing notification
    // const existingNotification = document.getElementById("nexa-notification");
    // if (existingNotification) {
    //   existingNotification.remove();
    // }

    // // Create notification
    // const notification = document.createElement("div");
    // notification.id = "nexa-notification";
    // notification.style.cssText = `
    //   position: fixed;
    //   top: 20px;
    //   right: 20px;
    //   padding: 12px 20px;
    //   border-radius: 6px;
    //   color: white;
    //   font-size: 14px;
    //   font-family: 'Segoe UI', system-ui, sans-serif;
    //   z-index: 10000;
    //   max-width: 300px;
    //   box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    //   transition: all 0.3s ease;
    //   background: ${
    //     type === "success"
    //       ? "#28a745"
    //       : type === "error"
    //       ? "#dc3545"
    //       : "#007bff"
    //   };
    // `;

    // notification.textContent = message;
    // document.body.appendChild(notification);

    // // Auto remove after 3 seconds
    // setTimeout(() => {
    //   if (notification && notification.parentNode) {
    //     notification.style.opacity = "0";
    //     notification.style.transform = "translateX(100%)";
    //     setTimeout(() => {
    //       if (notification.parentNode) {
    //         notification.remove();
    //       }
    //     }, 300);
    //   }
    // }, 3000);
  }

  // Essential action implementations

  // Helper method to add NexaContext class to contenteditable elements
  addNexaContextClass(element) {
    if (
      element &&
      element.hasAttribute &&
      element.hasAttribute("contenteditable")
    ) {
      element.classList.add("nexa-context-target");
    }
  }

  // Helper method to get the correct editable element for operations
  getTargetEditableElement() {
    // Priority order:
    // 1. Current editable element from context menu (most accurate)
    // 2. Target container if contenteditable
    // 3. Any contenteditable element in document
    if (
      this.currentEditableElement &&
      this.currentEditableElement.isConnected
    ) {
      // Ensure NexaContext class is added untuk scoped styling
      this.addNexaContextClass(this.currentEditableElement);
      return this.currentEditableElement;
    }

    if (
      this.targetContainer &&
      this.targetContainer.hasAttribute("contenteditable")
    ) {
      // Ensure NexaContext class is added untuk scoped styling
      this.addNexaContextClass(this.targetContainer);
      return this.targetContainer;
    }

    const editableElement = document.querySelector('[contenteditable="true"]');
    if (editableElement) {
      // Add class jika elemen ditemukan tapi bukan dari NexaContext
      this.addNexaContextClass(editableElement);
    }
    return editableElement;
  }

  // Helper method to re-select saved text
  reSelectSavedText(editableElement) {
    if (!this.savedSelectionText || !editableElement) {
      return false;
    }

    try {
      const walker = document.createTreeWalker(
        editableElement,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        const textContent = node.textContent;
        const index = textContent.indexOf(this.savedSelectionText);

        if (index !== -1) {
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + this.savedSelectionText.length);

          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);

          return true;
        }
      }
    } catch (error) {
      console.error("Failed to re-select text:", error);
    }

    return false;
  }

  refresh(data = null) {
    // Refresh context menu
    this.buildContextMenuStructure();
  }

  /**
   * Enable browser inspect mode - temporarily disable custom context menu
   */
  enableBrowserInspect(data = null) {
    // Hide current context menu
    this.hideContextMenu();

    // Temporarily disable custom context menu
    this.disableCustomContextMenu();

    // Show notification to user
    this.showInspectNotification();

    // Auto re-enable after 10 seconds
    setTimeout(() => {
      this.enableCustomContextMenu();
    }, 10000);
  }

  /**
   * Disable custom context menu temporarily
   */
  disableCustomContextMenu() {
    if (this.boundHandleContextMenu) {
      // Check if listener is already removed
      const hasListener = document.addEventListener.toString().includes('contextmenu');
      // Remove listener if it exists
      try {
        document.removeEventListener("contextmenu", this.boundHandleContextMenu);
      } catch (e) {
        // Listener might not be attached, ignore
      }
      this.isCustomContextDisabled = true;
    }
  }

  /**
   * Re-enable custom context menu
   */
  enableCustomContextMenu() {
    if (this.boundHandleContextMenu) {
      // Only add listener if not already added
      if (this.isCustomContextDisabled) {
        document.addEventListener("contextmenu", this.boundHandleContextMenu);
        this.isCustomContextDisabled = false;

        // Remove notification if exists
        const notification = document.getElementById("inspect-notification");
        if (notification) {
          notification.remove();
        }
      }
    }
  }

  /**
   * Toggle between edit and view mode
   * Edit mode: context menu aktif, semua fitur berjalan
   * View mode: context menu nonaktif, hanya melihat
   */
  toggleEditViewMode() {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      // Enable edit mode: enable context menu
      // Ensure listener is attached
      if (this.boundHandleContextMenu && this.isCustomContextDisabled) {
        document.addEventListener("contextmenu", this.boundHandleContextMenu);
        this.isCustomContextDisabled = false;
      }
      
      // Enable contenteditable on target container if exists
      if (this.targetContainer) {
        this.targetContainer.setAttribute("contenteditable", "true");
        this.targetContainer.classList.add("nexa-context-target");
      }
    } else {
      // Enable view mode: disable context menu
      // Remove listener if attached
      if (this.boundHandleContextMenu && !this.isCustomContextDisabled) {
        try {
          document.removeEventListener("contextmenu", this.boundHandleContextMenu);
        } catch (e) {
          // Ignore if listener not attached
        }
        this.isCustomContextDisabled = true;
      }
      
      // Disable contenteditable on target container if exists
      if (this.targetContainer) {
        this.targetContainer.setAttribute("contenteditable", "false");
      }
    }

    // Trigger custom event untuk update toolbar UI
    document.dispatchEvent(
      new CustomEvent("nexaEditViewModeChanged", {
        detail: {
          isEditMode: this.isEditMode,
        },
        bubbles: true,
        cancelable: true,
      })
    );

    return this.isEditMode;
  }

  /**
   * Get current edit/view mode
   */
  getEditViewMode() {
    return this.isEditMode;
  }

  /**
   * Show notification about inspect mode
   */
  showInspectNotification() {
    // Remove existing notification if any
    const existingNotification = document.getElementById(
      "inspect-notification"
    );
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.id = "inspect-notification";
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2c3e50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        max-width: 350px;
       
      ">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="margin-right: 8px;">🔍</span>
          <strong>Browser Inspect Mode Active</strong>
        </div>
        <div style="font-size: 12px; color: #bdc3c7; line-height: 1.4;">
          Right-click browser menu is now available.<br>
          Custom context menu temporarily disabled.
          <div style="margin-top: 8px;">
            <button onclick="window.nexaNexaReactiveInstance.enableCustomContextMenu()" 
                    style="background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">
              Re-enable Custom Menu
            </button>
            <span style="margin-left: 10px; font-size: 11px;">Auto re-enable in 10s</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove notification after 12 seconds
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.remove();
      }
    }, 12000);
  }

  /**
   * Temporarily disable custom context menu (misalnya untuk debugging atau inspect mode)
   */
  temporarilyDisableCustomMenu(duration = 10000) {
    this.disableCustomContextMenu();

    // Auto re-enable setelah durasi tertentu
    setTimeout(() => {
      this.enableCustomContextMenu();
    }, duration);
  }

  // Setup global functions (simplified for context menu only)
  static setupGlobalFunctions() {
    // No additional global functions needed for basic context menu
  }

  /**
   * Destroy the context menu and clean up event listeners
   */
  destroy() {
    // Remove event listeners using bound methods
    if (this.boundHandleContextMenu) {
      document.removeEventListener("contextmenu", this.boundHandleContextMenu);
    }
    if (this.boundHandleClickOutside) {
      document.removeEventListener("click", this.boundHandleClickOutside);
    }
    if (this.config.enableKeyboardShortcuts && this.boundHandleKeyDown) {
      document.removeEventListener("keydown", this.boundHandleKeyDown);
    }
    if (this.boundHandleSave) {
      document.removeEventListener("nexaToolbarSave", this.boundHandleSave);
    }

    // Clean up NexaContext classes from elements
    if (this.targetContainer) {
      this.targetContainer.classList.remove("nexa-context-target");
    }
    if (this.currentEditableElement) {
      this.currentEditableElement.classList.remove("nexa-context-target");
    }

    // Remove NexaContext classes from all contenteditable elements that might have been affected
    const editableElements = document.querySelectorAll(
      ".nexa-context-target[contenteditable]"
    );
    editableElements.forEach((element) => {
      element.classList.remove("nexa-context-target");
    });

    // Remove context menu from DOM
    if (this.contextMenu && this.contextMenu.parentNode) {
      this.contextMenu.parentNode.removeChild(this.contextMenu);
    }

    // Clear references
    this.contextMenu = null;
    this.currentTarget = null;
    this.targetContainer = null;
    this.isVisible = false;
    this.boundHandleContextMenu = null;
    this.boundHandleClickOutside = null;
    this.boundHandleKeyDown = null;

    // Clean up Interactions
    if (this.Interactions) {
      // Clean up any Interactions state if needed
      this.Interactions = null;
    }

    // Clean up Background
    if (this.background) {
      // Clean up any Background state if needed
      this.background = null;
    }

    // Clean up Image Tools
    if (this.imageTools) {
      // Clean up any Image Tools state if needed
      this.imageTools = null;
    }

    // Clean up Create Form
    if (this.createForm) {
      // Clean up any Create Form state if needed
      this.createForm = null;
    }

    // Clean up Chart Elements
    if (this.chartElements) {
      // Clean up any Chart Elements state if needed
      this.chartElements = null;
    }

    // Clean up Leaflet Maps
    if (this.LeafletMaps) {
      // Clean up any Leaflet Maps state if needed
      this.LeafletMaps = null;
    }

    // Clean up Iframe
    if (this.Iframe) {
      // Clean up any Iframe state if needed
      this.Iframe = null;
    }

    // Clean up Layout
    if (this.Layout) {
      // Clean up any Layout state if needed
      this.Layout = null;
    }

    // Clean up Prind
    if (this.Prind) {
      // Clean up any Prind state if needed
      this.Prind = null;
    }

    // Clean up NexaStore
    if (this.nexaStore) {
      // Clean up any NexaStore state if needed
      this.nexaStore = null;
    }
  }
}

/*
 * NOTE: Styles have been moved to NexaReactive.css
 * Include NexaReactive.css in your HTML to style the context menu
 */

// Export for use - Support both ES6 modules and global
if (typeof module !== "undefined" && module.exports) {
  // Node.js/CommonJS environment
  module.exports = { NexaReactive };
} else {
  // Browser environment - make available globally
  globalThis.NexaReactive = NexaReactive;
}

// ES6 module export
export { NexaReactive };
// window.NexaPrind = nexaUI.NexaPrind;
// window.printKuwitansi = function () {
//   NexaPrind.printById("prindKuwitansi", {
//     title: "Print",
//     captureDynamicStyles: true,
//     forceBackgrounds: true,
//     preserveLayout: true,
//     skipBrokenResources: true,
//     useFallbackFonts: true,
//     paperSize: "A4",
//     optimizePerformance: true,
//     newWindow: false, // Tidak membuka window baru
//     removeAfterPrint: false,
//     fontSize: "10px",
//     padding: "10px", // Font sedang
//     fontFamily: "Montserrat, Arial, sans-serif", // Font serif
//     lineHeight: "1.2",
//     marginTop: "10mm",
//     marginLeft: "20mm",
//     marginRight: "20mm",

//   });
// };