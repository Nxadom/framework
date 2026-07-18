export class toolBarTextFormatting {
  constructor(selector, options = {}) {
    this.element =
      typeof selector === "string"
        ? document.querySelector(selector)
        : selector;

    // Generate unique ID for this toolbar instance
    this.instanceId = `toolbar-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    this.options = {
      toolbar: [
        "bold",
        "italic",
        "underline",
        "formatselect",
        "bullist",
        "numlist",
        "alignleft",
        "aligncenter",
        "alignright",
        "alignjustify",
        "undo",
        "redo",
        "|",
        "zoomInElement",
        "zoomOutElement",
        "zoomElementTo100",
        "|",
        "print",
        "save",
        "toggleEditView",
      ],
      formats: ["p", "h1", "h2", "h3", "h4", "h5", "h6"],
      onToolbarAction: null, // Callback function for toolbar actions
      isExternalToolbar: false, // Flag to indicate if this is an external toolbar
      showTextFormatting: true, // Show text formatting tools
      showElementTools: true, // Show element tools (zoom, etc.)
      showLayoutTools: false, // Show layout tools
      compact: false, // Compact mode
      ...options,
    };

    // Track edit/view mode state
    this.isEditMode = true; // Default to edit mode

    this.init();
  }

  init() {
    if (!this.element) {
      return;
    }

    // Check if toolbar already exists and remove it
    this.removeExistingToolbar();

    // Note: contentEditable should be managed by NexaInteract, not NexaToolbar
    // NexaToolbar only provides UI menu interface

    // Determine if this is an external toolbar (element is the target container)
    this.options.isExternalToolbar = this.options.onToolbarAction !== null;

    // Buat container toolbar
    this.toolbarContainer = document.createElement("div");
    this.toolbarContainer.className = "nexa-editor-toolbar";

    // Add unique identifier to prevent duplicates
    this.toolbarContainer.setAttribute("data-nexa-toolbar", "true");
    this.toolbarContainer.setAttribute("data-toolbar-id", this.instanceId);

    if (this.options.isExternalToolbar) {
      // For external toolbar, insert at the beginning of target element
      this.element.insertBefore(this.toolbarContainer, this.element.firstChild);
    } else {
      // For inline toolbar, insert at the beginning of target element
      this.element.insertBefore(this.toolbarContainer, this.element.firstChild);
    }

    this.createToolbar();
    this.attachEditorEvents();
  }

  /**
   * Remove existing toolbar to prevent duplicates
   */
  removeExistingToolbar() {
    // Look for existing toolbar in this element
    const existingToolbar = this.element.querySelector(
      '[data-nexa-toolbar="true"]'
    );
    if (existingToolbar) {
      existingToolbar.remove();
    }

    // Also remove any toolbar with class name
    const existingToolbarByClass = this.element.querySelector(
      ".nexa-editor-toolbar"
    );
    if (existingToolbarByClass) {
      existingToolbarByClass.remove();
    }
  }

  createToolbar() {
    // Filter toolbar based on options
    let toolbar = this.options.toolbar;

    // Apply filtering based on options
    if (!this.options.showTextFormatting) {
      toolbar = toolbar.filter(
        (item) =>
          ![
            "bold",
            "italic",
            "underline",
            "formatselect",
            "bullist",
            "numlist",
            "alignleft",
            "aligncenter",
            "alignright",
            "alignjustify",
            "undo",
            "redo",
          ].includes(item)
      );
    }

    if (!this.options.showElementTools) {
      toolbar = toolbar.filter(
        (item) =>
          !["zoomInElement", "zoomOutElement", "zoomElementTo100", "print"].includes(
            item
          )
      );
    }

    if (this.options.compact) {
      // Remove separators and some tools in compact mode
      toolbar = toolbar.filter((item) => item !== "|");
    }

    toolbar.forEach((item, index) => {
      if (item === "|") {
        const separator = document.createElement("span");
        separator.className = "nexa-editor-separator";
        separator.innerHTML = "|";
        this.toolbarContainer.appendChild(separator);
      } else if (item === "formatselect") {
        this.createFormatSelect();
      } else if (item === "toggleEditView") {
        this.createToggleEditViewButton();
      } else {
        this.createToolbarButton(item);
      }
    });

    // Listen for edit/view mode changes
    this.attachEditViewModeListener();

  }

  createToolbarButton(command) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "nexa-editor-btn";
    button.dataset.command = command;

    const icons = {
      bold: '<span class="material-symbols-outlined">format_bold</span>',
      italic: '<span class="material-symbols-outlined">format_italic</span>',
      underline: '<span class="material-symbols-outlined">format_underlined</span>',
      bullist: '<span class="material-symbols-outlined">format_list_bulleted</span>',
      numlist: '<span class="material-symbols-outlined">format_list_numbered</span>',
      link: '<span class="material-symbols-outlined">link</span>',
      alignleft: '<span class="material-symbols-outlined">format_align_left</span>',
      aligncenter: '<span class="material-symbols-outlined">format_align_center</span>',
      alignright: '<span class="material-symbols-outlined">format_align_right</span>',
      alignjustify: '<span class="material-symbols-outlined">format_align_justify</span>',
      undo: '<span class="material-symbols-outlined">undo</span>',
      redo: '<span class="material-symbols-outlined">redo</span>',
      zoomInElement: '<span class="material-symbols-outlined">zoom_in</span>',
      zoomOutElement: '<span class="material-symbols-outlined">zoom_out</span>',
      zoomElementTo100: '<span class="material-symbols-outlined">aspect_ratio</span>',
      print: '<span class="material-symbols-outlined">print</span>',
      save: '<span class="material-symbols-outlined">save</span>',
      toggleEditView: '<span class="material-symbols-outlined">edit</span>',
    };

    button.innerHTML = icons[command] || command;
    button.title = command.charAt(0).toUpperCase() + command.slice(1);

    // Execute editor command
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.executeCommand(command);
    });

    this.toolbarContainer.appendChild(button);
  }

  createFormatSelect() {
    const select = document.createElement("select");
    select.className = "nexa-editor-format-select";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Format";
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    this.options.formats.forEach((format) => {
      const option = document.createElement("option");
      option.value = format;
      option.textContent = format.toUpperCase();
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      if (e.target.value) {
        this.executeCommand("formatBlock", e.target.value);
        e.target.selectedIndex = 0;
      }
    });

    this.toolbarContainer.appendChild(select);
  }

  /**
   * Create toggle edit/view button
   */
  createToggleEditViewButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "nexa-editor-btn nexa-toggle-edit-view";
    button.dataset.command = "toggleEditView";
    button.id = `toggle-edit-view-${this.instanceId}`;

    // Get current mode from NexaReactive if available
    if (
      typeof window !== "undefined" &&
      window.nexaNexaReactiveInstance &&
      typeof window.nexaNexaReactiveInstance.getEditViewMode === "function"
    ) {
      this.isEditMode = window.nexaNexaReactiveInstance.getEditViewMode();
    }

    // Update icon based on current mode
    this.updateToggleEditViewIcon(button);

    button.title = this.isEditMode ? "Switch to View Mode" : "Switch to Edit Mode";

    // Execute toggle command
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.executeToggleEditView();
    });

    this.toolbarContainer.appendChild(button);
  }

  /**
   * Update toggle edit/view button icon based on mode
   */
  updateToggleEditViewIcon(button) {
    if (!button) {
      button = this.toolbarContainer.querySelector(".nexa-toggle-edit-view");
    }
    
    if (button) {
      // If edit mode: show edit icon (already in edit mode, menu aktif)
      // If view mode: show eye icon (already in view mode, menu tidak aktif)
      if (this.isEditMode) {
        button.innerHTML = '<span class="material-symbols-outlined">edit</span>';
        button.title = "Edit Mode (Menu Aktif) - Klik untuk View Mode";
      } else {
        button.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
        button.title = "View Mode (Menu Tidak Aktif) - Klik untuk Edit Mode";
      }
    }
  }

  /**
   * Execute toggle edit/view command
   */
  executeToggleEditView() {
    // Check if NexaReactive instance is available
    if (
      typeof window !== "undefined" &&
      window.nexaNexaReactiveInstance &&
      typeof window.nexaNexaReactiveInstance.toggleEditViewMode === "function"
    ) {
      // Toggle mode via NexaReactive
      this.isEditMode = window.nexaNexaReactiveInstance.toggleEditViewMode();
    } else {
      // Fallback: toggle local state
      this.isEditMode = !this.isEditMode;
    }

    // Update button icon
    this.updateToggleEditViewIcon();

    // Enable/disable other toolbar buttons based on mode
    this.updateToolbarButtonsState();
  }

  /**
   * Update toolbar buttons state based on edit/view mode
   */
  updateToolbarButtonsState() {
    const buttons = this.toolbarContainer.querySelectorAll(".nexa-editor-btn");
    const formatSelect = this.toolbarContainer.querySelector(".nexa-editor-format-select");

    buttons.forEach((button) => {
      const command = button.dataset.command;
      
      // Skip toggle button itself
      if (command === "toggleEditView") {
        return;
      }

      // Disable/enable buttons based on mode
      if (this.isEditMode) {
        button.disabled = false;
        button.style.opacity = "1";
        button.style.cursor = "pointer";
      } else {
        button.disabled = true;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
      }
    });

    // Update format select
    if (formatSelect) {
      formatSelect.disabled = !this.isEditMode;
      formatSelect.style.opacity = this.isEditMode ? "1" : "0.5";
      formatSelect.style.cursor = this.isEditMode ? "pointer" : "not-allowed";
    }
  }

  /**
   * Attach listener for edit/view mode changes from NexaReactive
   */
  attachEditViewModeListener() {
    this.boundEditViewModeHandler = (e) => {
      if (e.detail && typeof e.detail.isEditMode !== "undefined") {
        this.isEditMode = e.detail.isEditMode;
        this.updateToggleEditViewIcon();
        this.updateToolbarButtonsState();
      }
    };

    document.addEventListener("nexaEditViewModeChanged", this.boundEditViewModeHandler);

    // Initialize toolbar state
    if (
      typeof window !== "undefined" &&
      window.nexaNexaReactiveInstance &&
      typeof window.nexaNexaReactiveInstance.getEditViewMode === "function"
    ) {
      this.isEditMode = window.nexaNexaReactiveInstance.getEditViewMode();
      this.updateToggleEditViewIcon();
      this.updateToolbarButtonsState();
    }
  }

  /**
   * Execute editor commands
   */
  executeCommand(command, value = null) {
    // Check if NexaInteract callback is available
    if (
      this.options.onToolbarAction &&
      typeof this.options.onToolbarAction === "function"
    ) {
      // Khusus untuk command "save", kita hanya memanggil handleSaveCommand()
      // karena save memerlukan akses ke elemen yang sedang diedit
      // handleSaveCommand sudah mengirim custom event yang bisa didengarkan
      if (command === "save") {
        this.handleSaveCommand();
        return;
      }
      
      // Let NexaInteract handle the command untuk command lainnya
      this.options.onToolbarAction(command, value);
      return;
    }

    // Fallback: Execute command directly (standalone mode)
    // Focus the editable element first
    this.element.focus();

    try {
      // Map commands to execCommand
      const commandMap = {
        bold: "bold",
        italic: "italic",
        underline: "underline",
        bullist: "insertUnorderedList",
        numlist: "insertOrderedList",
        alignleft: "justifyLeft",
        aligncenter: "justifyCenter",
        alignright: "justifyRight",
        alignjustify: "justifyFull",
        undo: "undo",
        redo: "redo",
        zoomInElement: "zoomInElement",
        zoomOutElement: "zoomOutElement",
        zoomElementTo100: "zoomElementTo100",
      };

      const execCommand = commandMap[command] || command;

      if (command === "formatBlock") {
        document.execCommand("formatBlock", false, `<${value}>`);
      } else if (command === "link") {
        this.showUrlInputModal("Insert Link", "https://", (url) => {
          if (url) document.execCommand("createLink", false, url);
        });
      } else if (command === "image") {
        this.showUrlInputModal("Insert Image", "https://", (imageUrl) => {
          if (imageUrl) document.execCommand("insertImage", false, imageUrl);
        });
      } else if (command === "zoomInElement") {
        this.handleZoomCommand("zoomInElement");
      } else if (command === "zoomOutElement") {
        this.handleZoomCommand("zoomOutElement");
      } else if (command === "zoomElementTo100") {
        this.handleZoomCommand("zoomElementTo100");
      } else if (command === "toggleEditView") {
        this.executeToggleEditView();
        return;
      } else if (command === "print") {
        // Let NexaInteract handle the print command
        if (
          this.options.onToolbarAction &&
          typeof this.options.onToolbarAction === "function"
        ) {
          this.options.onToolbarAction(command);
        } else {
          // Fallback: use window.print()
          window.print();
        }
        return;
      } else if (command === "save") {
        this.handleSaveCommand();
      } else {
        document.execCommand(execCommand, false, value);
      }

      // Trigger custom event
      this.element.dispatchEvent(
        new CustomEvent("nexaToolbarCommand", {
          detail: { command, value },
        })
      );
    } catch (error) {
      // Error executing command
    }
  }

  /**
   * Modal input URL (pengganti window.prompt) untuk fallback standalone Insert Link/Image.
   * Menyimpan selection sebelum modal dibuka lalu me-restore-nya sebelum execCommand,
   * karena membuka modal memindahkan fokus browser dan menghilangkan selection asli.
   */
  showUrlInputModal(title, defaultValue, onConfirm) {
    const nexaUI = window.NexaUI?.();
    if (!nexaUI) {
      // Fallback terakhir jika NexaUI benar-benar tidak tersedia di halaman ini
      const url = window.prompt(`${title}:`, defaultValue);
      onConfirm(url);
      return;
    }

    const savedRange =
      window.getSelection()?.rangeCount > 0
        ? window.getSelection().getRangeAt(0).cloneRange()
        : null;

    const modalId = `nexa-toolbar-url-modal-${Date.now()}`;
    const inputId = `${modalId}-input`;

    window[`_toolbarUrlConfirm_${modalId}`] = () => {
      const input = document.getElementById(inputId);
      const url = input?.value?.trim() || "";

      this.element.focus();
      if (savedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedRange);
      }

      onConfirm(url);
      delete window[`_toolbarUrlConfirm_${modalId}`];
    };

    nexaUI.modalHTML({
      elementById: modalId,
      styleClass: "w-500px",
      label: title,
      onclick: {
        title: "Insert",
        cancel: "Cancel",
        send: `_toolbarUrlConfirm_${modalId}`,
      },
      content: `
        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label for="${inputId}">URL</label></dt>
            <dd class="form-group-body">
              <input type="url" id="${inputId}" class="form-control input-block" value="${defaultValue}" placeholder="${defaultValue}">
            </dd>
          </dl>
        </div>
      `,
    });

    nexaUI.nexaModal.open(modalId);
  }

  /**
   * Handle save command
   * Mengambil konten dari elemen yang sedang diedit dengan mengikuti alur dari NexaReactive.js
   */
  handleSaveCommand() {
    try {
      // Mengikuti prioritas dari NexaReactive.js getTargetEditableElement()
      let targetElement = null;
      let elementId = null;
      let elementToken = null;
      let foundByPriority = null;

      // Priority 1: Cari elemen contenteditable yang sedang focused (active editing)
      // Ini adalah cara paling akurat untuk mendapatkan elemen yang sedang diedit
      const activeElement = document.activeElement;

      if (
        activeElement &&
        activeElement.isConnected &&
        (activeElement.contentEditable === "true" ||
          activeElement.getAttribute("contenteditable") === "true")
      ) {
        targetElement = activeElement;
        elementId = activeElement.id || null;
        foundByPriority = "Priority 1: activeElement";
        // Extract token dari ID jika formatnya seperti "NX_xxx.txt"
        if (elementId && elementId.endsWith(".txt")) {
          elementToken = elementId.replace(".txt", "");
        }
      }

      // Priority 2: Cari elemen contenteditable yang memiliki selection aktif
      // Mengikuti logika dari NexaReactive.js yang mengecek selection range
      if (!targetElement) {
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer;

          // Cari parent element yang contenteditable
          targetElement =
            container.nodeType === Node.ELEMENT_NODE
              ? container
              : container.parentElement;

          while (
            targetElement &&
            targetElement.getAttribute("contenteditable") !== "true" &&
            targetElement.contentEditable !== "true"
          ) {
            targetElement = targetElement.parentElement;
          }

          if (targetElement && targetElement.isConnected) {
            elementId = targetElement.id || null;
            foundByPriority = "Priority 2: selection range";
            if (elementId && elementId.endsWith(".txt")) {
              elementToken = elementId.replace(".txt", "");
            }
          } else {
            targetElement = null;
          }
        }
      }

      // Priority 3: Cari elemen dengan class nexa-context-target (mengikuti NexaReactive.js)
      // Elemen yang sudah ditandai oleh NexaReactive sebagai target editing
      if (!targetElement) {
        const contextTarget = document.querySelector(
          ".nexa-context-target[contenteditable='true']"
        );
        if (contextTarget && contextTarget.isConnected) {
          targetElement = contextTarget;
          elementId = contextTarget.id || null;
          foundByPriority = "Priority 3: nexa-context-target";
          if (elementId && elementId.endsWith(".txt")) {
            elementToken = elementId.replace(".txt", "");
          }
        }
      }

      // Priority 4: Cari elemen contenteditable di dalam target container (untuk external toolbar)
      // Mengikuti logika dari NexaReactive.js yang mengecek targetContainer
      if (!targetElement && this.options.isExternalToolbar) {
        // Jika toolbar external, cari elemen contenteditable di dalam element toolbar
        const contentElement = this.element.querySelector(
          '[contenteditable="true"]'
        );
        if (contentElement && contentElement.isConnected) {
          targetElement = contentElement;
          elementId = contentElement.id || null;
          foundByPriority = "Priority 4: external toolbar container";
          if (elementId && elementId.endsWith(".txt")) {
            elementToken = elementId.replace(".txt", "");
          }
        }
      }

      // Priority 5: Cari elemen contenteditable berdasarkan selector umum (fallback)
      // Mengikuti pattern dari NexaReactive.js yang mencari di document
      if (!targetElement) {
        const contentElement =
          document.querySelector('[contenteditable="true"]') ||
          document.querySelector(".ex-explorer-content") ||
          document.querySelector("#file-viewercontent-edit-sdk");
        if (contentElement && contentElement.isConnected) {
          targetElement = contentElement;
          elementId = contentElement.id || null;
          foundByPriority = "Priority 5: general selector";
          if (elementId && elementId.endsWith(".txt")) {
            elementToken = elementId.replace(".txt", "");
          }
        }
      }

      // Priority 6: Fallback ke element toolbar itu sendiri jika contenteditable
      if (!targetElement && this.element) {
        if (
          this.element.isConnected &&
          (this.element.contentEditable === "true" ||
            this.element.getAttribute("contenteditable") === "true")
        ) {
          targetElement = this.element;
          elementId = targetElement.id || null;
          foundByPriority = "Priority 6: toolbar element itself";
          if (elementId && elementId.endsWith(".txt")) {
            elementToken = elementId.replace(".txt", "");
          }
        }
      }

      if (!targetElement) {
        // Show notification to user
        this.showSaveNotification("No editable content found", "error");
        return;
      }

      // Get the content to save
      // Menggunakan innerHTML untuk mempertahankan formatting, dan innerText sebagai fallback
      const content = targetElement.innerHTML || targetElement.innerText || "";
      const textContent = targetElement.innerText || targetElement.textContent || "";

      // Prepare save data dengan informasi lengkap (mengikuti pattern dari NexaReactive.js)
      const saveData = {
        command: "save",
        content: content,
        textContent: textContent,
        element: targetElement,
        elementId: elementId,
        elementToken: elementToken,
        timestamp: Date.now(),
        foundByPriority: foundByPriority,
      };

      // Trigger custom event for save action on target element (mengikuti pattern dari NexaReactive.js)
      // Menggunakan bubbles: true dan cancelable: true untuk memungkinkan event propagation
      targetElement.dispatchEvent(
        new CustomEvent("nexaToolbarSave", {
          detail: saveData,
          bubbles: true,
          cancelable: true,
        })
      );

      // Also trigger on the toolbar element itself
      this.element.dispatchEvent(
        new CustomEvent("nexaToolbarSave", {
          detail: saveData,
          bubbles: true,
          cancelable: true,
        })
      );

      // Trigger on document level untuk global handlers (mengikuti pattern dari NexaReactive.js)
      document.dispatchEvent(
        new CustomEvent("nexaToolbarSave", {
          detail: saveData,
          bubbles: true,
          cancelable: true,
        })
      );

      // Show success notification
      this.showSaveNotification("Content saved successfully", "success");
    } catch (error) {
      this.showSaveNotification(`Error: ${error.message}`, "error");
    }
  }

  /**
   * Show save notification
   * Mengikuti pattern dari NexaReactive.js showNotification()
   */
  showSaveNotification(message, type = "info") {
    // Remove existing notification
    // const existingNotification = document.getElementById("nexa-save-notification");
    // if (existingNotification) {
    //   existingNotification.remove();
    // }

    // // Create notification (mengikuti style dari NexaReactive.js)
    // const notification = document.createElement("div");
    // notification.id = "nexa-save-notification";
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

    // // Auto remove after 3 seconds (mengikuti pattern dari NexaReactive.js)
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

  /**
   * Handle zoom commands for element manipulation
   */
  handleZoomCommand(command) {
    try {
      // For external toolbar, we need to find the actual target element
      let targetElement = this.element;

      // If this is an external toolbar, find the actual content element
      if (this.options.isExternalToolbar) {
        // Look for contenteditable element or the main target
        const contentElement =
          document.querySelector('[contenteditable="true"]') ||
          document.querySelector(".ex-explorer-content") ||
          document.querySelector("#file-viewercontent-edit-sdk");
        if (contentElement) {
          targetElement = contentElement;
        }
      }

      if (!targetElement) {
        return;
      }

      // Get current transform scale
      const currentTransform = targetElement.style.transform || "";
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
      targetElement.style.transform = newTransform.trim();

      // Add transition for smooth animation
      targetElement.style.transition = "transform 0.2s ease";

      // Remove transition after animation completes
      setTimeout(() => {
        targetElement.style.transition = "";
      }, 200);

      // Trigger custom event
      targetElement.dispatchEvent(
        new CustomEvent("nexaToolbarZoom", {
          detail: {
            command,
            scale: newScale,
            percentage: Math.round(newScale * 100),
          },
        })
      );
    } catch (error) {
      // Error executing zoom command
    }
  }

  /**
   * Attach editor events
   */
  attachEditorEvents() {
    // Store bound functions for proper cleanup
    this.boundUpdateToolbarState = () => this.updateToolbarState();

    if (this.options.isExternalToolbar) {
      // For external toolbar, listen to document-wide events
      document.addEventListener(
        "selectionchange",
        this.boundUpdateToolbarState
      );
      document.addEventListener("keyup", this.boundUpdateToolbarState);
      document.addEventListener("mouseup", this.boundUpdateToolbarState);
    } else {
      // For inline toolbar, listen to element-specific events
      this.element.addEventListener("keyup", this.boundUpdateToolbarState);
      this.element.addEventListener("mouseup", this.boundUpdateToolbarState);
      this.element.addEventListener("focus", this.boundUpdateToolbarState);
    }
  }

  /**
   * Update toolbar button states
   */
  updateToolbarState() {
    const buttons = this.toolbarContainer.querySelectorAll(".nexa-editor-btn");

    buttons.forEach((button) => {
      const command = button.dataset.command;
      const isActive = document.queryCommandState(command);

      if (isActive) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });
  }

  /**
   * Destroy toolbar
   */
  destroy() {
    // Remove toolbar container
    if (this.toolbarContainer) {
      this.toolbarContainer.remove();
      this.toolbarContainer = null;
    }

    // Remove all toolbar instances from element (safety cleanup)
    if (this.element) {
      const allToolbars = this.element.querySelectorAll(
        '.nexa-editor-toolbar, [data-nexa-toolbar="true"]'
      );
      allToolbars.forEach((toolbar) => {
        toolbar.remove();
      });

      // Note: Do not remove contentEditable - it should be managed by NexaInteract
      // NexaToolbar only manages toolbar UI, not editing state

      // Remove event listeners with proper references
      if (this.boundUpdateToolbarState) {
        if (this.options.isExternalToolbar) {
          // Remove document-wide event listeners for external toolbar
          document.removeEventListener(
            "selectionchange",
            this.boundUpdateToolbarState
          );
          document.removeEventListener("keyup", this.boundUpdateToolbarState);
          document.removeEventListener("mouseup", this.boundUpdateToolbarState);
        } else {
          // Remove element-specific event listeners for inline toolbar
          this.element.removeEventListener(
            "keyup",
            this.boundUpdateToolbarState
          );
          this.element.removeEventListener(
            "mouseup",
            this.boundUpdateToolbarState
          );
          this.element.removeEventListener(
            "focus",
            this.boundUpdateToolbarState
          );
        }
        this.boundUpdateToolbarState = null;
      }

      // Remove edit/view mode listener
      if (this.boundEditViewModeHandler) {
        document.removeEventListener(
          "nexaEditViewModeChanged",
          this.boundEditViewModeHandler
        );
        this.boundEditViewModeHandler = null;
      }
    }
  }

  /**
   * Static method to cleanup all toolbars from an element
   */
  static cleanupAllToolbarsFromElement(element) {
    if (!element) return;

    const allToolbars = element.querySelectorAll(
      '.nexa-editor-toolbar, [data-nexa-toolbar="true"]'
    );
    if (allToolbars.length > 0) {
      allToolbars.forEach((toolbar) => toolbar.remove());

      // Note: Do not remove contentEditable - it should be managed by NexaInteract
      // NexaToolbar only manages toolbar UI, not editing state
    }
  }
}
