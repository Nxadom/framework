/**
 * Text Formatting -  Functionality for Elements NexaReactive.js
 */

class TextFormatting {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Initialize sortable element tracking
    this.sortableElements = new Set();

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;

    // Initialize Undo/Redo system
    this.undoStack = [];
    this.redoStack = [];
    this.maxUndoHistory = 20; // Maximum number of undo operations to keep
  }
  struktur() {
    return [
      {
        id: "text-formatting",
        icon: "type",
        text: "Text Formatting",
        action: "textFormatting",
        submenu: [
          // Basic Text Operations
          {
            id: "cut-text",
            icon: "scissors",
            text: "Cut",
            action: "cutText",
            showCondition: "hasSelectedText",
          },
          {
            id: "copy-text",
            icon: "copy",
            text: "Copy",
            action: "copyText",
            showCondition: "hasSelectedText",
          },
          {
            id: "paste-text",
            icon: "clipboard",
            text: "Paste",
            action: "pasteText",
          },
          {
            id: "separator-basic-operations",
            type: "separator",
          },
          // Undo/Redo Operations
          {
            id: "text-undo",
            icon: "rotate-ccw",
            text: "Undo Text Change",
            action: "textUndo",
            showCondition: "hasUndoHistory",
          },
          {
            id: "text-redo",
            icon: "rotate-cw",
            text: "Redo Text Change",
            action: "textRedo",
            showCondition: "hasRedoHistory",
          },
          {
            id: "separator-undo-redo",
            type: "separator",
          },
          // Text Formatting
          {
            id: "change-font-size",
            icon: "type",
            text: "Font Size",
            action: "changeTextSize",
          },
          {
            id: "change-text-color",
            icon: "droplet",
            text: "Text Color",
            action: "changeTextColor",
          },
          {
            id: "change-text-font",
            icon: "type",
            text: "Font Family",
            action: "changeTextFont",
          },
          {
            id: "text-bold",
            icon: "bold",
            text: "Bold",
            action: "textBold",
            showCondition: "hasSelectedText",
          },
          {
            id: "text-italic",
            icon: "italic",
            text: "Italic",
            action: "textItalic",
            showCondition: "hasSelectedText",
          },
          {
            id: "text-underline",
            icon: "underline",
            text: "Underline",
            action: "textUnderline",
            showCondition: "hasSelectedText",
          },
          {
            id: "remove-formatting",
            icon: "x",
            text: "Remove Formatting",
            action: "removeFormatting",
          },
          {
            id: "separator-text-align",
            type: "separator",
          },
          // Text Alignment
          {
            id: "text-align-left",
            icon: "align-left",
            text: "Align Left",
            action: "textAlignLeft",
          },
          {
            id: "text-align-center",
            icon: "align-center",
            text: "Align Center",
            action: "textAlignCenter",
          },
          {
            id: "text-align-right",
            icon: "align-right",
            text: "Align Right",
            action: "textAlignRight",
          },
          {
            id: "text-align-justify",
            icon: "align-justify",
            text: "Align Justify",
            action: "textAlignJustify",
          },
          {
            id: "separator-text-tools",
            type: "separator",
          },
          // Text Tools
          {
            id: "select-all-text",
            icon: "square",
            text: "Select All",
            action: "selectAll",
          },
          {
            id: "find-replace-text",
            icon: "search",
            text: "Find & Replace",
            action: "findReplace",
          },
          {
            id: "insert-link",
            icon: "link",
            text: "Insert Link",
            action: "insertLink",
          },
          {
            id: "insert-image",
            icon: "image",
            text: "Insert Image",
            action: "insertImage",
          },
        ],
      },
    ];
  }

  /**
   * ===== UNDO/REDO SYSTEM =====
   */

  /**
   * Save current state before making changes
   * @param {string} operationType - Type of operation (fontSize, color, font, etc.)
   * @param {HTMLElement} element - Target element
   * @param {string} description - Human readable description
   */
  saveStateBeforeChange(operationType, element, description) {
    try {
      if (!element) {
        console.warn("⚠️ No element provided for undo state save");
        return;
      }

      // Create undo state
      const undoState = {
        id: Date.now() + Math.random(), // Unique ID
        timestamp: Date.now(),
        operationType: operationType,
        description: description,
        element: {
          tagName: element.tagName,
          id: element.id,
          className: element.className,
          // Save element selector for finding it later
          selector: this.generateElementSelector(element),
        },
        // Save relevant style properties
        beforeState: {
          fontSize:
            element.style.fontSize || getComputedStyle(element).fontSize,
          fontFamily:
            element.style.fontFamily || getComputedStyle(element).fontFamily,
          color: element.style.color || getComputedStyle(element).color,
          fontWeight:
            element.style.fontWeight || getComputedStyle(element).fontWeight,
          fontStyle:
            element.style.fontStyle || getComputedStyle(element).fontStyle,
          textDecoration:
            element.style.textDecoration ||
            getComputedStyle(element).textDecoration,
          textAlign:
            element.style.textAlign || getComputedStyle(element).textAlign,
          innerHTML: element.innerHTML,
          outerHTML: element.outerHTML,
        },
        afterState: null, // Will be filled after change is applied
      };

      // Add to undo stack
      this.undoStack.push(undoState);

      // Clear redo stack when new action is performed
      this.redoStack = [];

      // Limit undo history size
      if (this.undoStack.length > this.maxUndoHistory) {
        this.undoStack.shift();
      }

      console.log(`💾 Saved undo state: ${description}`, undoState);
      return undoState;
    } catch (error) {
      console.error("❌ Error saving undo state:", error);
      return null;
    }
  }

  /**
   * Complete undo state by saving after-change state
   * @param {Object} undoState - The state object returned by saveStateBeforeChange
   * @param {HTMLElement} element - Target element after changes
   */
  completeUndoState(undoState, element) {
    try {
      if (!undoState || !element) return;

      // Save after-change state
      undoState.afterState = {
        fontSize: element.style.fontSize || getComputedStyle(element).fontSize,
        fontFamily:
          element.style.fontFamily || getComputedStyle(element).fontFamily,
        color: element.style.color || getComputedStyle(element).color,
        fontWeight:
          element.style.fontWeight || getComputedStyle(element).fontWeight,
        fontStyle:
          element.style.fontStyle || getComputedStyle(element).fontStyle,
        textDecoration:
          element.style.textDecoration ||
          getComputedStyle(element).textDecoration,
        textAlign:
          element.style.textAlign || getComputedStyle(element).textAlign,
        innerHTML: element.innerHTML,
        outerHTML: element.outerHTML,
      };

      console.log(`✅ Completed undo state: ${undoState.description}`);
    } catch (error) {
      console.error("❌ Error completing undo state:", error);
    }
  }

  /**
   * Generate a unique selector for an element
   * @param {HTMLElement} element
   * @returns {string} CSS selector
   */
  generateElementSelector(element) {
    try {
      if (!element) return "";

      // Try ID first
      if (element.id) {
        return `#${element.id}`;
      }

      // Generate path-based selector
      const path = [];
      let current = element;

      while (current && current.nodeType === Node.ELEMENT_NODE) {
        let selector = current.nodeName.toLowerCase();

        if (current.className) {
          selector += "." + current.className.trim().split(/\s+/).join(".");
        }

        // Add nth-child if needed for uniqueness
        const parent = current.parentNode;
        if (parent && parent.children.length > 1) {
          const index = Array.from(parent.children).indexOf(current) + 1;
          selector += `:nth-child(${index})`;
        }

        path.unshift(selector);
        current = current.parentNode;

        // Stop at document body
        if (current && current.nodeName.toLowerCase() === "body") {
          break;
        }
      }

      return path.join(" > ");
    } catch (error) {
      console.error("❌ Error generating element selector:", error);
      return "";
    }
  }

  /**
   * Find element by selector
   * @param {string} selector
   * @returns {HTMLElement|null}
   */
  findElementBySelector(selector) {
    try {
      if (!selector) return null;
      return document.querySelector(selector);
    } catch (error) {
      console.error("❌ Error finding element by selector:", error);
      return null;
    }
  }

  /**
   * Perform undo operation
   */
  contextTextUndo() {
    try {
      if (this.undoStack.length === 0) {
        console.warn("⚠️ No undo history available");
        return { success: false, error: "No undo history available" };
      }

      const undoState = this.undoStack.pop();
      console.log(`↶ Performing undo: ${undoState.description}`);

      // Find the element
      const element = this.findElementBySelector(undoState.element.selector);
      if (!element) {
        console.error("❌ Cannot find element for undo operation");
        return { success: false, error: "Cannot find element for undo" };
      }

      // Store current state for redo
      const redoState = {
        ...undoState,
        id: Date.now() + Math.random(),
        beforeState: undoState.afterState, // Swap before/after states
        afterState: undoState.beforeState,
      };
      this.redoStack.push(redoState);

      // Apply before-state (undo the changes)
      this.applyTextState(element, undoState.beforeState);

      console.log(`✅ Undo completed: ${undoState.description}`);
      return { success: true, message: `Undid: ${undoState.description}` };
    } catch (error) {
      console.error("❌ Error performing undo:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform redo operation
   */
  contextTextRedo() {
    try {
      if (this.redoStack.length === 0) {
        console.warn("⚠️ No redo history available");
        return { success: false, error: "No redo history available" };
      }

      const redoState = this.redoStack.pop();
      console.log(`↷ Performing redo: ${redoState.description}`);

      // Find the element
      const element = this.findElementBySelector(redoState.element.selector);
      if (!element) {
        console.error("❌ Cannot find element for redo operation");
        return { success: false, error: "Cannot find element for redo" };
      }

      // Store current state for undo
      const undoState = {
        ...redoState,
        id: Date.now() + Math.random(),
        beforeState: redoState.afterState, // Swap before/after states
        afterState: redoState.beforeState,
      };
      this.undoStack.push(undoState);

      // Apply after-state (redo the changes)
      this.applyTextState(element, redoState.afterState);

      console.log(`✅ Redo completed: ${redoState.description}`);
      return { success: true, message: `Redid: ${redoState.description}` };
    } catch (error) {
      console.error("❌ Error performing redo:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply text state to element
   * @param {HTMLElement} element
   * @param {Object} state
   */
  applyTextState(element, state) {
    try {
      if (!element || !state) return;

      // Apply styles
      if (state.fontSize) element.style.fontSize = state.fontSize;
      if (state.fontFamily) element.style.fontFamily = state.fontFamily;
      if (state.color) element.style.color = state.color;
      if (state.fontWeight) element.style.fontWeight = state.fontWeight;
      if (state.fontStyle) element.style.fontStyle = state.fontStyle;
      if (state.textDecoration)
        element.style.textDecoration = state.textDecoration;
      if (state.textAlign) element.style.textAlign = state.textAlign;

      // For innerHTML changes, we need to be careful
      if (state.innerHTML && state.innerHTML !== element.innerHTML) {
        element.innerHTML = state.innerHTML;
      }

      console.log("🎨 Applied text state to element:", element.tagName);
    } catch (error) {
      console.error("❌ Error applying text state:", error);
    }
  }

  /**
   * Check if undo history is available
   */
  hasUndoHistory() {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo history is available
   */
  hasRedoHistory() {
    return this.redoStack.length > 0;
  }

  /**
   * Get undo history info
   */
  getUndoHistory() {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      undoStack: this.undoStack.map((state) => ({
        description: state.description,
        timestamp: state.timestamp,
        operationType: state.operationType,
      })),
      redoStack: this.redoStack.map((state) => ({
        description: state.description,
        timestamp: state.timestamp,
        operationType: state.operationType,
      })),
    };
  }

  /**
   * Clear undo/redo history
   */
  clearHistory() {
    this.undoStack = [];
    this.redoStack = [];
    console.log("🧹 Cleared undo/redo history");
  }

  /**
   * ===== BASIC TEXT OPERATIONS =====
   */

  /**
   * Cut selected text
   */
  async cutText(data = null) {
    try {
      const selection = window.getSelection();
      const selectedText = selection.toString();

      if (!selectedText || selectedText.trim().length === 0) {
        return { success: false, error: "No text selected to cut" };
      }

      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(selectedText);
      }

      // Delete the selected text
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
      }

      return { success: true, message: "Text cut to clipboard" };
    } catch (error) {
      console.error("❌ Error cutting text:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Copy selected text
   */
  async copyText(data = null) {
    try {
      const selection = window.getSelection();
      const selectedText = selection.toString();

      if (!selectedText || selectedText.trim().length === 0) {
        return { success: false, error: "No text selected to copy" };
      }

      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(selectedText);
      }

      return { success: true, message: "Text copied to clipboard" };
    } catch (error) {
      console.error("❌ Error copying text:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Paste text from clipboard
   */
  async pasteText(data = null) {
    try {
      if (!this.interactions.targetElement) {
        return { success: false, error: "No target element for paste" };
      }

      // Read from clipboard
      let clipboardText = "";
      if (navigator.clipboard) {
        clipboardText = await navigator.clipboard.readText();
      }

      if (!clipboardText) {
        return { success: false, error: "No text in clipboard" };
      }

      // Get current selection or cursor position
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Insert the text
        const textNode = document.createTextNode(clipboardText);
        range.insertNode(textNode);

        // Move cursor after inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      return { success: true, message: "Text pasted from clipboard" };
    } catch (error) {
      console.error("❌ Error pasting text:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove formatting from selected text
   */
  removeFormatting(data = null) {
    try {
      const selection = window.getSelection();
      const selectedText = selection.toString();

      if (!selectedText || selectedText.trim().length === 0) {
        return {
          success: false,
          error: "No text selected to remove formatting",
        };
      }

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Extract content and create plain text node
        const content = range.extractContents();
        const plainText = content.textContent || content.innerText;
        const textNode = document.createTextNode(plainText);

        // Insert plain text
        range.insertNode(textNode);

        // Select the new plain text
        range.setStart(textNode, 0);
        range.setEnd(textNode, plainText.length);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      return {
        success: true,
        message: "Formatting removed from selected text",
      };
    } catch (error) {
      console.error("❌ Error removing formatting:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Select all text in target element
   */
  selectAll(data = null) {
    try {
      if (!this.interactions.targetElement) {
        return { success: false, error: "No target element for select all" };
      }

      const range = document.createRange();
      range.selectNodeContents(this.interactions.targetElement);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      return { success: true, message: "All text selected" };
    } catch (error) {
      console.error("❌ Error selecting all text:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Open find and replace dialog
   */
  findReplace(data = null) {
    try {
      // Use browser's native find functionality
      if (window.find) {
        window.find();
      } else {
        // Fallback: focus on target element
        if (this.interactions.targetElement) {
          this.interactions.targetElement.focus();
        }
      }

      return { success: true, message: "Find dialog opened" };
    } catch (error) {
      console.error("❌ Error opening find dialog:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Insert link at current cursor position
   */
  insertLink(data = null) {
    try {
      const url = prompt("Enter the URL:");
      if (!url) {
        return { success: false, error: "No URL provided" };
      }

      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Create link element
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";

        if (selection.isCollapsed) {
          // No selection, insert URL as text
          link.textContent = url;
          range.insertNode(link);
        } else {
          // Wrap selected text with link
          const contents = range.extractContents();
          link.appendChild(contents);
          range.insertNode(link);
        }
      }

      return { success: true, message: "Link inserted" };
    } catch (error) {
      console.error("❌ Error inserting link:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Insert image at current cursor position
   */
  insertImage(data = null) {
    try {
      const imageUrl = prompt("Enter the image URL:");
      if (!imageUrl) {
        return { success: false, error: "No image URL provided" };
      }

      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Create image element
        const img = document.createElement("img");
        img.src = imageUrl;
        img.style.maxWidth = "100%";
        img.style.height = "auto";

        range.insertNode(img);

        // Move cursor after image
        range.setStartAfter(img);
        range.setEndAfter(img);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      return { success: true, message: "Image inserted" };
    } catch (error) {
      console.error("❌ Error inserting image:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Change font size of selected text
   */
  contextChangeTextSize() {
    try {
      // Get current selection if this.selectedText is empty
      let currentSelectedText = this.interactions.selectedText;
      if (!currentSelectedText || currentSelectedText.trim().length === 0) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          currentSelectedText = selection.toString();
          this.interactions.selectedText = currentSelectedText; // Update internal state
        }
      }

      // If no text selection but we have target element, allow size change for entire element
      if (!currentSelectedText || currentSelectedText.trim().length === 0) {
        if (!this.interactions.targetElement) {
          throw new Error("No text selected and no target element found");
        }
        console.log(
          "ℹ️ No text selection, applying font size to entire element:",
          this.interactions.targetElement.tagName
        );
        // Set a placeholder text for preview
        this.interactions.selectedText =
          this.interactions.targetElement.textContent || "Element Text";
      }

      if (!this.interactions.targetElement) {
        throw new Error("No target element found");
      }

      // Create font size selection dialog
      this.createFontSizeDialog();

      return { success: true, message: "Font size dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current font size from target element
   */
  getCurrentFontSize() {
    try {
      if (!this.interactions.targetElement) {
        return 16; // Default fallback
      }

      // Get computed style of target element
      const computedStyle = window.getComputedStyle(
        this.interactions.targetElement
      );
      let fontSize = computedStyle.fontSize;

      // Parse font size (remove 'px' and convert to number)
      fontSize = parseInt(fontSize.replace("px", ""));

      // If fontSize is not valid, try parent elements
      if (!fontSize || isNaN(fontSize)) {
        let parent = this.interactions.targetElement.parentElement;
        while (parent && (!fontSize || isNaN(fontSize))) {
          const parentStyle = window.getComputedStyle(parent);
          fontSize = parseInt(parentStyle.fontSize.replace("px", ""));
          parent = parent.parentElement;
        }
      }

      // Ensure we have a valid font size
      if (!fontSize || isNaN(fontSize) || fontSize < 8) {
        fontSize = 16; // Default fallback
      }

      return fontSize;
    } catch (error) {
      return 16; // Default fallback
    }
  }

  /**
   * Context menu: Change text color of selected text
   */
  contextChangeTextColor() {
    try {
      // Get current selection if this.selectedText is empty
      let currentSelectedText = this.interactions.selectedText;
      if (!currentSelectedText || currentSelectedText.trim().length === 0) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          currentSelectedText = selection.toString();
          this.interactions.selectedText = currentSelectedText; // Update internal state
        }
      }

      // Additional fallback: try to get selection again if still empty
      if (!currentSelectedText || currentSelectedText.trim().length === 0) {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          currentSelectedText = selection.toString();
          this.interactions.selectedText = currentSelectedText;
        }
      }

      // If no text selection but we have target element, allow color change for entire element
      if (!currentSelectedText || currentSelectedText.trim().length === 0) {
        if (!this.interactions.targetElement) {
          throw new Error("No text selected and no target element found");
        }
        console.log(
          "ℹ️ No text selection, applying color to entire element:",
          this.interactions.targetElement.tagName
        );
        // Set a placeholder text for preview
        this.interactions.selectedText =
          this.interactions.targetElement.textContent || "Element Text";
      }

      if (!this.interactions.targetElement) {
        throw new Error("No target element found");
      }

      this.createTextColorDialog();
      return { success: true, message: "Text color dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Change font family of selected text
   */
  contextChangeTextFont() {
    try {
      // Get current selection if this.selectedText is empty
      let currentSelectedText = this.interactions.selectedText;
      if (!currentSelectedText || currentSelectedText.trim().length === 0) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          currentSelectedText = selection.toString();
          this.interactions.selectedText = currentSelectedText; // Update internal state
        }
      }

      // Additional fallback: try to get selection again if still empty
      if (!currentSelectedText || currentSelectedText.trim().length === 0) {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          currentSelectedText = selection.toString();
          this.interactions.selectedText = currentSelectedText;
        }
      }

      // If no text selection but we have target element, allow font change for entire element
      if (!currentSelectedText || currentSelectedText.trim().length === 0) {
        if (!this.interactions.targetElement) {
          throw new Error("No text selected and no target element found");
        }
        console.log(
          "ℹ️ No text selection, applying font family to entire element:",
          this.interactions.targetElement.tagName
        );
        // Set a placeholder text for preview
        this.interactions.selectedText =
          this.interactions.targetElement.textContent || "Element Text";
      }

      this.createTextFontDialog();
      return { success: true, message: "Font family dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current text color from target element
   */
  getCurrentTextColor() {
    try {
      if (!this.interactions.targetElement) {
        return "#000000"; // Default black
      }

      // Get computed style of target element
      const computedStyle = window.getComputedStyle(
        this.interactions.targetElement
      );
      let color = computedStyle.color;

      // Convert RGB to HEX if needed
      if (color.startsWith("rgb")) {
        const rgbMatch = color.match(/\d+/g);
        if (rgbMatch && rgbMatch.length >= 3) {
          const r = parseInt(rgbMatch[0]);
          const g = parseInt(rgbMatch[1]);
          const b = parseInt(rgbMatch[2]);
          color =
            "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
      }

      // If color is not valid, try parent elements
      if (!color || color === "rgb(0, 0, 0)" || color === "#000000") {
        let parent = this.interactions.targetElement.parentElement;
        while (
          parent &&
          (!color || color === "rgb(0, 0, 0)" || color === "#000000")
        ) {
          const parentStyle = window.getComputedStyle(parent);
          let parentColor = parentStyle.color;
          if (parentColor.startsWith("rgb")) {
            const rgbMatch = parentColor.match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
              const r = parseInt(rgbMatch[0]);
              const g = parseInt(rgbMatch[1]);
              const b = parseInt(rgbMatch[2]);
              parentColor =
                "#" +
                ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            }
          }
          if (
            parentColor &&
            parentColor !== "rgb(0, 0, 0)" &&
            parentColor !== "#000000"
          ) {
            color = parentColor;
            break;
          }
          parent = parent.parentElement;
        }
      }

      // Ensure we have a valid color
      if (!color || color === "rgb(0, 0, 0)") {
        color = "#000000"; // Default black
      }

      return color;
    } catch (error) {
      return "#000000"; // Default black
    }
  }

  /**
   * Apply bold formatting to selected text
   */
  contextTextBold() {
    try {
      const result = this.applyTextStyle("bold");

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply italic formatting to selected text
   */
  contextTextItalic() {
    try {
      const result = this.applyTextStyle("italic");

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply underline formatting to selected text
   */
  contextTextUnderline() {
    try {
      const result = this.applyTextStyle("underline");

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply left text alignment to selected text
   */
  contextTextAlignLeft() {
    try {
      const result = this.applyTextStyle("align-left");

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply center text alignment to selected text
   */
  contextTextAlignCenter() {
    try {
      const result = this.applyTextStyle("align-center");

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply right text alignment to selected text
   */
  contextTextAlignRight() {
    try {
      const result = this.applyTextStyle("align-right");

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply justify text alignment to selected text
   */
  contextTextAlignJustify() {
    try {
      const result = this.applyTextStyle("align-justify");

      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply text style (bold, italic, underline) to selected text
   */
  applyTextStyle(styleType) {
    try {
      const selection = window.getSelection();

      // Check if we have valid text selection
      const selectedText = selection.toString();
      if (!selectedText || selectedText.trim().length === 0) {
        // Direct fallback to target element
        if (this.interactions.targetElement) {
          this.applyStyleToElement(this.interactions.targetElement, styleType);

          return {
            success: true,
            message: "Text style applied to target element",
            styleType: styleType,
            element: this.interactions.targetElement,
          };
        }

        throw new Error("No text selection and no target element");
      }

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Check if range is collapsed (no actual selection)
        if (range.collapsed) {
          if (this.interactions.targetElement) {
            this.applyStyleToElement(
              this.interactions.targetElement,
              styleType
            );
            return {
              success: true,
              message: "Text style applied to target element",
              styleType: styleType,
              element: this.interactions.targetElement,
            };
          }
          throw new Error("Range is collapsed and no target element");
        }

        // Create a span element with the style
        const span = document.createElement("span");
        this.applyStyleToElement(span, styleType);

        // Apply the style to the selected text
        try {
          range.surroundContents(span);
        } catch (e) {
          // If surroundContents fails, extract and wrap the content
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
        }

        // Clear selection
        selection.removeAllRanges();

        return {
          success: true,
          message: `${styleType} style applied to selection`,
          affectedText: selectedText,
          styleType: styleType,
        };
      }

      throw new Error("No valid range found");
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Apply style to an element (helper method)
   */
  applyStyleToElement(element, styleType) {
    const currentStyles = window.getComputedStyle(element);

    switch (styleType) {
      case "bold":
        const currentWeight = currentStyles.fontWeight;
        element.style.fontWeight =
          currentWeight === "bold" || currentWeight === "700"
            ? "normal"
            : "bold";
        break;
      case "italic":
        const currentStyle = currentStyles.fontStyle;
        element.style.fontStyle =
          currentStyle === "italic" ? "normal" : "italic";
        break;
      case "underline":
        const currentDecoration = currentStyles.textDecoration;
        element.style.textDecoration = currentDecoration.includes("underline")
          ? "none"
          : "underline";
        break;
      case "align-left":
        element.style.textAlign = "left";
        break;
      case "align-center":
        element.style.textAlign = "center";
        break;
      case "align-right":
        element.style.textAlign = "right";
        break;
      case "align-justify":
        element.style.textAlign = "justify";
        break;
      default:
        throw new Error("Unknown style type: " + styleType);
    }
  }

  /**
   * Get current font family from target element
   */
  getCurrentFontFamily() {
    try {
      if (!this.interactions.targetElement) {
        return "Arial, sans-serif"; // Default font
      }

      // Get computed style of target element
      const computedStyle = window.getComputedStyle(
        this.interactions.targetElement
      );
      return computedStyle.fontFamily || "Arial, sans-serif";
    } catch (error) {
      return "Arial, sans-serif";
    }
  }

  /**
   * Create font size selection dialog using NexaUI system
   */
  createFontSizeDialog() {
    // Get current font size from target element or selected text
    const currentFontSize = this.getCurrentFontSize();
    const modalId = "nexa-font-size-dialog";

    // Use NexaUI modal system like modal.html
    const nexaUI = this.interactions.nexaUI || window.NexaUI?.();

    if (!nexaUI) {
      console.error("❌ NexaUI not available for TextFormatting modal");
      return;
    }

    // Create modal content
    const modalContent = `
      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label>Selected Text Preview</label></dt>
          <dd class="form-group-body">
            <div id="textPreview" style="
              border: 1px solid #d0d7de;
              border-radius: 6px;
              padding: 15px;
              background: #f6f8fa;
              min-height: 50px;
              word-wrap: break-word;
              font-size: ${currentFontSize}px;
            ">${this.interactions.selectedText}</div>
            <p class="note">
              Current size: ${currentFontSize}px | Target: ${
      this.interactions.targetElement?.tagName?.toLowerCase() || "unknown"
    }
            </p>
          </dd>
        </dl>
      </div>

      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label for="fontSizeSlider">Choose Font Size: <span id="sizeDisplay">${currentFontSize}</span>px</label></dt>
          <dd class="form-group-body">
            <input type="range" id="fontSizeSlider" class="form-control" min="8" max="72" value="${currentFontSize}" step="2">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px;">
              <button type="button" class="btn size-preset" data-size="12">12px</button>
              <button type="button" class="btn size-preset" data-size="14">14px</button>
              <button type="button" class="btn size-preset" data-size="16">16px</button>
              <button type="button" class="btn size-preset" data-size="18">18px</button>
              <button type="button" class="btn size-preset" data-size="20">20px</button>
              <button type="button" class="btn size-preset" data-size="24">24px</button>
              <button type="button" class="btn size-preset" data-size="32">32px</button>
              <button type="button" class="btn size-preset" data-size="48">48px</button>
            </div>
          </dd>
        </dl>
      </div>
    `;

    // Setup global apply function
    window.applyFontSizeFromModal = (modalId, data) => {
      const slider = document.getElementById("fontSizeSlider");
      if (slider) {
        const fontSize = slider.value;
        this.applyFontSizeToSelection(fontSize);
      }
      nexaUI.nexaModal.close(modalId);
    };

    // Create modal using NexaUI system
    nexaUI.modalHTML({
      elementById: modalId,
      styleClass: "w-600px",
      label: "🔤 Change Font Size",
      onclick: {
        title: "Apply",
        cancel: "Cancel",
        send: "applyFontSizeFromModal",
      },
      content: modalContent,
    });

    // Open modal
    nexaUI.nexaModal.open(modalId);

    console.log("✅ Font size modal opened using NexaUI system");

    // Setup event handlers after modal opens
    setTimeout(() => {
      this.setupFontSizeDialogEvents(modalId);
    }, 100);
  }

  /**
   * Create text color selection dialog using NexaUI system
   */
  createTextColorDialog() {
    const currentColor = this.getCurrentTextColor();
    const modalId = "nexa-text-color-dialog";

    // Use NexaUI modal system like modal.html
    const nexaUI = this.interactions.nexaUI || window.NexaUI?.();

    if (!nexaUI) {
      console.error("❌ NexaUI not available for TextFormatting modal");
      return;
    }

    // Create modal content
    const modalContent = `
      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label>Text Preview</label></dt>
          <dd class="form-group-body">
            <div id="colorTextPreview" style="
              padding: 15px;
              border: 1px solid #d0d7de;
              border-radius: 6px;
              background: #f6f8fa;
              font-size: 16px;
              min-height: 50px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${currentColor};
            ">${this.interactions.selectedText || "Selected Text Preview"}</div>
          </dd>
        </dl>
      </div>

      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label for="colorInput">Choose Color</label></dt>
          <dd class="form-group-body">
            <div class="input-group">
              <input type="color" id="colorPicker" class="form-control" value="${currentColor}" style="width: 56px; padding: 4px; flex: 0 0 auto;">
              <input type="text" id="colorInput" class="form-control" value="${currentColor}" placeholder="#000000" style="font-family: monospace;">
            </div>

            <!-- Color presets -->
            <p class="note" style="margin-top: 12px;">Quick Colors:</p>
            <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px;">
              <button type="button" class="btn color-preset" data-color="#000000" style="background: #000000; width: 32px; height: 32px;" title="Black"></button>
              <button type="button" class="btn color-preset" data-color="#ffffff" style="background: #ffffff; border: 2px solid #d0d7de; width: 32px; height: 32px;" title="White"></button>
              <button type="button" class="btn color-preset" data-color="#ff0000" style="background: #ff0000; width: 32px; height: 32px;" title="Red"></button>
              <button type="button" class="btn color-preset" data-color="#00ff00" style="background: #00ff00; width: 32px; height: 32px;" title="Green"></button>
              <button type="button" class="btn color-preset" data-color="#0000ff" style="background: #0000ff; width: 32px; height: 32px;" title="Blue"></button>
              <button type="button" class="btn color-preset" data-color="#ffff00" style="background: #ffff00; width: 32px; height: 32px;" title="Yellow"></button>
              <button type="button" class="btn color-preset" data-color="#ff00ff" style="background: #ff00ff; width: 32px; height: 32px;" title="Magenta"></button>
              <button type="button" class="btn color-preset" data-color="#00ffff" style="background: #00ffff; width: 32px; height: 32px;" title="Cyan"></button>
            </div>
          </dd>
        </dl>
      </div>
    `;

    // Setup global apply function
    window.applyTextColorFromModal = (modalId, data) => {
      const colorPicker = document.getElementById("colorPicker");
      if (colorPicker) {
        const color = colorPicker.value;
        this.applyColorToSelection(color);
      }
      nexaUI.nexaModal.close(modalId);
    };

    // Create modal using NexaUI system
    nexaUI.modalHTML({
      elementById: modalId,
      styleClass: "w-500px",
      label: "🎨 Change Text Color",
      onclick: {
        title: "Apply",
        cancel: "Cancel",
        send: "applyTextColorFromModal",
      },
      content: modalContent,
    });

    // Open modal
    nexaUI.nexaModal.open(modalId);

    console.log("✅ Text color modal opened using NexaUI system");

    // Setup event handlers after modal opens
    setTimeout(() => {
      this.setupTextColorDialogEvents(modalId);
    }, 100);
  }

  /**
   * Create text font family selection dialog using NexaUI system
   */
  createTextFontDialog() {
    const currentFont = this.getCurrentFontFamily();
    const modalId = "nexa-text-font-dialog";

    // Use NexaUI modal system like modal.html
    const nexaUI = this.interactions.nexaUI || window.NexaUI?.();

    if (!nexaUI) {
      console.error("❌ NexaUI not available for TextFormatting modal");
      return;
    }

    // Popular font families
    const popularFonts = [
      "Arial, sans-serif",
      "Helvetica, sans-serif",
      "Times New Roman, serif",
      "Georgia, serif",
      "Courier New, monospace",
      "Verdana, sans-serif",
      "Trebuchet MS, sans-serif",
      "Comic Sans MS, cursive",
      "Impact, sans-serif",
      "Tahoma, sans-serif",
    ];

    const systemFonts = [
      "-apple-system, BlinkMacSystemFont, sans-serif",
      "system-ui, sans-serif",
      "Segoe UI, sans-serif",
      "Roboto, sans-serif",
      "Inter, sans-serif",
    ];

    // Create modal content
    const modalContent = `
      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label>Text Preview</label></dt>
          <dd class="form-group-body">
            <div id="fontTextPreview" style="
              border: 1px solid #d0d7de;
              border-radius: 6px;
              padding: 15px;
              font-size: 16px;
              min-height: 40px;
              display: flex;
              align-items: center;
              background: #f6f8fa;
              color: #24292f;
              font-family: ${currentFont};
            ">${this.interactions.selectedText || "Sample text preview"}</div>
          </dd>
        </dl>
      </div>

      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label>Popular Fonts</label></dt>
          <dd class="form-group-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${popularFonts
                .map(
                  (font) => `
                <button type="button" class="btn font-preset" data-font="${font}" style="font-family: ${font}; text-align: left;">
                  ${font.split(",")[0]}
                </button>
              `
                )
                .join("")}
            </div>
          </dd>
        </dl>
      </div>

      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label>System Fonts</label></dt>
          <dd class="form-group-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${systemFonts
                .map(
                  (font) => `
                <button type="button" class="btn font-preset" data-font="${font}" style="font-family: ${font}; text-align: left;">
                  ${font.split(",")[0]}
                </button>
              `
                )
                .join("")}
            </div>
          </dd>
        </dl>
      </div>

      <div class="form-group">
        <dl>
          <dt class="form-group-header"><label for="fontInput">Custom Font</label></dt>
          <dd class="form-group-body">
            <input type="text" id="fontInput" class="form-control input-block" placeholder="Enter font family..." value="${currentFont}">
          </dd>
        </dl>
      </div>
    `;

    // Setup global apply function
    window.applyFontFamilyFromModal = (modalId, data) => {
      const fontInput = document.getElementById("fontInput");
      if (fontInput) {
        const font = fontInput.value;
        this.applyFontToSelection(font);
      }
      nexaUI.nexaModal.close(modalId);
    };

    // Create modal using NexaUI system
    nexaUI.modalHTML({
      elementById: modalId,
      styleClass: "w-700px",
      label: "🔤 Change Font Family",
      onclick: {
        title: "Apply",
        cancel: "Cancel",
        send: "applyFontFamilyFromModal",
      },
      content: modalContent,
    });

    // Open modal
    nexaUI.nexaModal.open(modalId);

    console.log("✅ Font family modal opened using NexaUI system");

    // Setup event handlers after modal opens
    setTimeout(() => {
      this.setupFontFamilyDialogEvents(modalId);
    }, 100);
  }

  /**
   * Inject modal control functions (placeholder - needs implementation based on main system)
   */
  injectModalControlFunctions() {
    // Basic modal control functions
    if (typeof window.closeModal === "undefined") {
      window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.style.display = "none";
          document.body.classList.remove("nx-modal-open");
          modal.remove();
        }
      };
    }
  }

  /**
   * Setup font size dialog event handlers
   */
  setupFontSizeDialogEvents(modalId) {
    const slider = document.getElementById("fontSizeSlider");
    const sizeDisplay = document.getElementById("sizeDisplay");
    const previewElement = document.getElementById("textPreview");
    const applyButton = document.getElementById("applyFontSize");
    const sizePresets = document.querySelectorAll(".size-preset");

    // Slider change handler
    if (slider) {
      slider.addEventListener("input", (e) => {
        const size = e.target.value;
        sizeDisplay.textContent = size;
        previewElement.style.fontSize = size + "px";
      });
    }

    // Preset button handlers
    sizePresets.forEach((preset) => {
      preset.addEventListener("click", (e) => {
        const size = e.target.dataset.size;
        slider.value = size;
        sizeDisplay.textContent = size;
        previewElement.style.fontSize = size + "px";
      });
    });

    // Apply button handler
    if (applyButton) {
      applyButton.addEventListener("click", () => {
        const fontSize = slider.value;
        this.applyFontSizeToSelection(fontSize);
        window.closeModal(modalId);
      });
    }
  }

  /**
   * Setup text color dialog event handlers
   */
  setupTextColorDialogEvents(modalId) {
    const colorPicker = document.getElementById("colorPicker");
    const colorInput = document.getElementById("colorInput");
    const previewElement = document.getElementById("colorTextPreview");
    const applyButton = document.getElementById("applyTextColor");
    const colorPresets = document.querySelectorAll(".color-preset");

    // Color picker change handler
    if (colorPicker) {
      colorPicker.addEventListener("input", (e) => {
        const color = e.target.value;
        colorInput.value = color;
        previewElement.style.color = color;
      });
    }

    // Color input change handler
    if (colorInput) {
      colorInput.addEventListener("input", (e) => {
        const color = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(color)) {
          colorPicker.value = color;
          previewElement.style.color = color;
        }
      });
    }

    // Preset button handlers
    colorPresets.forEach((preset) => {
      preset.addEventListener("click", (e) => {
        const color = e.target.dataset.color;
        colorPicker.value = color;
        colorInput.value = color;
        previewElement.style.color = color;
      });
    });

    // Apply button handler
    if (applyButton) {
      applyButton.addEventListener("click", () => {
        const color = colorPicker.value;
        this.applyColorToSelection(color);
        window.closeModal(modalId);
      });
    }
  }

  /**
   * Setup font family dialog event handlers
   */
  setupFontFamilyDialogEvents(modalId) {
    const fontInput = document.getElementById("fontInput");
    const previewElement = document.getElementById("fontTextPreview");
    const applyButton = document.getElementById("applyFontFamily");
    const fontPresets = document.querySelectorAll(".font-preset");

    // Font input change handler
    if (fontInput) {
      fontInput.addEventListener("input", (e) => {
        const font = e.target.value;
        previewElement.style.fontFamily = font;
      });
    }

    // Preset button handlers
    fontPresets.forEach((preset) => {
      preset.addEventListener("click", (e) => {
        const font = e.target.dataset.font;
        fontInput.value = font;
        previewElement.style.fontFamily = font;
      });
    });

    // Apply button handler
    if (applyButton) {
      applyButton.addEventListener("click", () => {
        const font = fontInput.value;
        this.applyFontToSelection(font);
        window.closeModal(modalId);
      });
    }
  }

  /**
   * Apply font size to selected text with undo support
   */
  applyFontSizeToSelection(fontSize) {
    try {
      const selection = window.getSelection();
      const selectedText = selection.toString();

      let targetElement = null;
      let undoState = null;

      if (!selectedText || selectedText.trim().length === 0) {
        // Apply to target element if no selection
        if (this.interactions.targetElement) {
          targetElement = this.interactions.targetElement;

          // Save state before change
          undoState = this.saveStateBeforeChange(
            "fontSize",
            targetElement,
            `Font size changed to ${fontSize}px on ${targetElement.tagName}`
          );

          targetElement.style.fontSize = fontSize + "px";

          // Complete undo state
          this.completeUndoState(undoState, targetElement);

          return {
            success: true,
            message: "Font size applied to target element",
            undoAvailable: true,
          };
        }
        throw new Error("No text selection and no target element");
      }

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Find the closest element containing the selection for undo state
        targetElement = range.commonAncestorContainer;
        if (targetElement.nodeType === Node.TEXT_NODE) {
          targetElement = targetElement.parentElement;
        }

        // Save state before change
        undoState = this.saveStateBeforeChange(
          "fontSize",
          targetElement,
          `Font size changed to ${fontSize}px on selected text`
        );

        const span = document.createElement("span");
        span.style.setProperty("font-size", fontSize + "px", "important");
        span.style.setProperty("display", "inline", "important");

        try {
          range.surroundContents(span);
        } catch (e) {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
        }

        selection.removeAllRanges();

        // Complete undo state
        this.completeUndoState(undoState, targetElement);

        return {
          success: true,
          message: "Font size applied to selection",
          undoAvailable: true,
        };
      }

      throw new Error("No valid range found");
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply color to selected text with undo support
   */
  applyColorToSelection(color) {
    try {
      const selection = window.getSelection();
      const selectedText = selection.toString();

      let targetElement = null;
      let undoState = null;

      if (!selectedText || selectedText.trim().length === 0) {
        // Apply to target element if no selection
        if (this.interactions.targetElement) {
          targetElement = this.interactions.targetElement;

          // Save state before change
          undoState = this.saveStateBeforeChange(
            "color",
            targetElement,
            `Text color changed to ${color} on ${targetElement.tagName}`
          );

          targetElement.style.color = color;

          // Complete undo state
          this.completeUndoState(undoState, targetElement);

          return {
            success: true,
            message: "Color applied to target element",
            undoAvailable: true,
          };
        }
        throw new Error("No text selection and no target element");
      }

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Find the closest element containing the selection for undo state
        targetElement = range.commonAncestorContainer;
        if (targetElement.nodeType === Node.TEXT_NODE) {
          targetElement = targetElement.parentElement;
        }

        // Save state before change
        undoState = this.saveStateBeforeChange(
          "color",
          targetElement,
          `Text color changed to ${color} on selected text`
        );

        const span = document.createElement("span");
        span.style.setProperty("color", color, "important");
        span.style.setProperty("display", "inline", "important");

        try {
          range.surroundContents(span);
        } catch (e) {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
        }

        selection.removeAllRanges();

        // Complete undo state
        this.completeUndoState(undoState, targetElement);

        return {
          success: true,
          message: "Color applied to selection",
          undoAvailable: true,
        };
      }

      throw new Error("No valid range found");
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply font family to selected text with undo support
   */
  applyFontToSelection(font) {
    try {
      const selection = window.getSelection();
      const selectedText = selection.toString();

      let targetElement = null;
      let undoState = null;

      if (!selectedText || selectedText.trim().length === 0) {
        // Apply to target element if no selection
        if (this.interactions.targetElement) {
          targetElement = this.interactions.targetElement;

          // Save state before change
          undoState = this.saveStateBeforeChange(
            "fontFamily",
            targetElement,
            `Font family changed to ${font} on ${targetElement.tagName}`
          );

          targetElement.style.fontFamily = font;
          targetElement.style.setProperty("font-family", font, "important");

          // Complete undo state
          this.completeUndoState(undoState, targetElement);

          return {
            success: true,
            message: "Font family applied to target element",
            undoAvailable: true,
          };
        }
        throw new Error("No text selection and no target element");
      }

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Find the closest element containing the selection for undo state
        targetElement = range.commonAncestorContainer;
        if (targetElement.nodeType === Node.TEXT_NODE) {
          targetElement = targetElement.parentElement;
        }

        // Check if range is collapsed
        if (range.collapsed) {
          if (this.interactions.targetElement) {
            targetElement = this.interactions.targetElement;

            // Save state before change
            undoState = this.saveStateBeforeChange(
              "fontFamily",
              targetElement,
              `Font family changed to ${font} on ${targetElement.tagName}`
            );

            targetElement.style.fontFamily = font;
            targetElement.style.setProperty("font-family", font, "important");

            // Complete undo state
            this.completeUndoState(undoState, targetElement);

            return {
              success: true,
              message: "Font family applied to target element",
              undoAvailable: true,
            };
          }
          throw new Error("Collapsed range and no target element");
        }

        // Save state before change
        undoState = this.saveStateBeforeChange(
          "fontFamily",
          targetElement,
          `Font family changed to ${font} on selected text`
        );

        try {
          // Use surroundContents first - more reliable for non-collapsed ranges
          const wrapper = document.createElement("span");
          wrapper.style.fontFamily = font;
          wrapper.style.setProperty("font-family", font, "important");

          range.surroundContents(wrapper);

          // Clear selection and re-select the new wrapper for visual feedback
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(wrapper);
          selection.addRange(newRange);

          // Complete undo state
          this.completeUndoState(undoState, targetElement);

          return {
            success: true,
            message: "Font family applied to selected text",
            font: font,
            element: wrapper,
            undoAvailable: true,
          };
        } catch (surroundError) {
          // Manual approach with span wrapping as fallback
          const span = document.createElement("span");
          span.style.fontFamily = font;
          span.style.setProperty("font-family", font, "important");

          // Extract and wrap content
          const contents = range.extractContents();

          if (contents.textContent.trim().length === 0) {
            if (this.interactions.targetElement) {
              targetElement = this.interactions.targetElement;

              // Update undo state description for target element fallback
              undoState.description = `Font family changed to ${font} on ${targetElement.tagName}`;

              targetElement.style.fontFamily = font;
              targetElement.style.setProperty("font-family", font, "important");

              // Complete undo state
              this.completeUndoState(undoState, targetElement);

              return {
                success: true,
                message: "Font family applied to target element",
                undoAvailable: true,
              };
            }
            throw new Error("No content extracted and no target element");
          }

          span.appendChild(contents);
          range.insertNode(span);

          // Clear and reselect
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          selection.addRange(newRange);

          // Complete undo state
          this.completeUndoState(undoState, targetElement);

          return {
            success: true,
            message: "Font family applied (manual wrap)",
            font: font,
            element: span,
            undoAvailable: true,
          };
        }
      }

      throw new Error("No valid range found");
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = TextFormatting;
} else if (typeof window !== "undefined") {
  window.TextFormatting = TextFormatting;
}

export { TextFormatting };
