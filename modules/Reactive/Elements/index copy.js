/**
 * Elements - Comprehensive Chart Management Class
 * Extracted from NexaInteractDev.js for better modularity
 *
 * This class handles all chart-related functionality including:
 * - Chart creation and configuration
 * - Modal management for chart setup
 * - Chart.js integration
 * - Different chart types (bar, line, pie, doughnut, radar)
 * - Chart data parsing and validation
 * - Chart insertion and rendering
 */

import { elementsNode } from "./elementsNode.js";
import { elementsForm } from "./elementsForm.js";

class Elements {
  constructor(data = null) {
    this.data = data;
    this.nexaUI = NexaUI();
    this.domAnalyzer = new elementsNode(); // Initialize elementsNode instance
    this.formGenerator = new elementsForm(); // Initialize elementsForm instance
    this.currentTargetElement = null; // Store reference to current target element being edited

    // Setup global functions for modal integration
    this.setupGlobalFunctions();
  }
  struktur() {
    return [
      {
        label: "Format Elements",
        icon: "git-pull-request",
        submenu: [
          {
            label: "Edit Element",
            icon: "edit-3",
            key: "bold",
            action: "elementsEdit",
          },
          {
            label: "Copy Element",
            icon: "copy",
            key: "bold",
            action: "elementsCopy",
          },
          {
            label: "Paste Element",
            icon: "clipboard",
            key: "bold",
            action: "elementsPaste",
          },
          {
            label: "Add Section",
            icon: "plus",
            key: "bold",
            action: "elementsSection",
          },
          {
            label: "Border Radius",
            icon: "corner-down-left",
            key: "bold",
            action: "elementsBorderRadius",
          },
          {
            label: "Delete Element",
            icon: "trash",
            key: "bold",
            action: "elementsDelete",
          },
        ],
      },
    ];
  }
  /**
   * Initialize modal dialogs
   */
  initModals(data) {
    // Ensure any existing modal is closed first
    try {
      // Close any existing modal that might be open
      const existingModals = document.querySelectorAll(
        '.modal[style*="display: block"]'
      );
      existingModals.forEach((modal) => {
        const modalId = modal.id;
        if (modalId && this.nexaUI.nexaModal) {
          this.nexaUI.nexaModal.close(modalId);
        }
      });
    } catch (error) {
      console.log("Note: No existing modal to close");
    }

    // Create fresh modal with new data
    console.log("🎭 Creating fresh modal with ID:", data.elementById);
    this.nexaUI.modalHTML(data);
    this.nexaUI.nexaModal.open(data.elementById);
  }

  /**
   * Setup global functions for modal integration
   */
  setupGlobalFunctions() {
    const elementsInstance = this;

    // Make Elements methods available globally for modal integration
    window.processElementsEdit = function (modalId, data) {
      elementsInstance.processElementsEdit(modalId, data);
    };

    window.processElementsDelete = function (modalId, data) {
      elementsInstance.processElementsDelete(modalId, data);
    };

    // Add form save handler
    window.processElementsFormSave = function (modalId, data) {
      elementsInstance.processElementsFormSave(modalId, data);
    };

    // Add form cancel handler
    window.processElementsFormCancel = function (modalId, data) {
      elementsInstance.processElementsFormCancel(modalId, data);
    };

    // Add border radius handler
    window.processElementsBorderRadius = function (modalId, data) {
      elementsInstance.processElementsBorderRadius(modalId, data);
    };
  }

  /**
   * Get form data from modal - NexaUI compatible version
   */
  getFormData(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return {};

    const formData = {};

    // Get all form controls using NexaUI class selectors
    const inputs = modal.querySelectorAll(
      ".form-nexa-control, input[type='checkbox'], input[type='radio'], input[type='color'], input[type='range'], select, textarea"
    );

    inputs.forEach((input) => {
      const fieldName = input.name || input.id;
      if (!fieldName) return;

      // Handle different input types
      switch (input.type) {
        case "checkbox":
        case "radio":
          if (input.checked) {
            formData[fieldName] = input.value;
          }
          break;
        case "file":
          formData[fieldName] = input.files;
          break;
        case "color":
        case "range":
          // Color pickers and range sliders should always return their value
          formData[fieldName] = input.value;
          break;
        default:
          formData[fieldName] = input.value.trim();
      }
    });

    console.log("📝 NexaUI Form data extracted:", formData);
    return formData;
  }

  /**
   * Process elements edit data
   */
  processElementsEdit(modalId, data = null) {
    console.log("🔄 Processing Elements Edit:", modalId, data);

    // Add your edit logic here
    // For example: update DOM elements, save to storage, etc.

    // Close modal
    this.nexaUI.nexaModal.close(modalId);
  }

  /**
   * Process elements deletion
   */
  processElementsDelete(modalId, data = null) {
    console.log("🗑️ Processing Elements Delete:", modalId, data);

    try {
      if (!this.currentTargetElement) {
        console.warn("⚠️ No target element available for deletion");
        this.nexaUI.nexaModal.close(modalId);
        return;
      }

      // Get element info before deletion
      const elementInfo = {
        tagName: this.currentTargetElement.tagName,
        id: this.currentTargetElement.id || "(no id)",
        className: this.currentTargetElement.className || "(no classes)",
      };

      console.log("🎯 Deleting element:", elementInfo);

      // Store in undo history before deletion
      const undoData = {
        element: this.currentTargetElement.cloneNode(true),
        parent: this.currentTargetElement.parentNode,
        nextSibling: this.currentTargetElement.nextSibling,
        timestamp: Date.now(),
      };

      // Remove the element from DOM
      this.currentTargetElement.parentNode.removeChild(
        this.currentTargetElement
      );

      console.log("✅ Element deleted successfully:", elementInfo);

      // Show success feedback
      this.showNotification("Element deleted successfully", "success");

      // Store undo data (could be used for future undo functionality)
      if (!window.nexaUndoHistory) {
        window.nexaUndoHistory = [];
      }
      window.nexaUndoHistory.push(undoData);

      // Keep only last 10 undo operations
      if (window.nexaUndoHistory.length > 10) {
        window.nexaUndoHistory.shift();
      }
    } catch (error) {
      console.error("❌ Error deleting element:", error);
      this.showNotification("Failed to delete element", "error");
    } finally {
      // Always close modal and cleanup
      this.nexaUI.nexaModal.close(modalId);
      this.currentTargetElement = null;
    }
  }

  /**
   * Process form save from dynamic form
   */
  processElementsFormSave(modalId, data = null) {
    console.log("💾 Processing Elements Form Save:", modalId, data);

    try {
      // Check if we have target element to modify
      if (!this.currentTargetElement) {
        console.error("❌ No target element available for modification");
        return;
      }

      // Extract form data
      const formData = this.formGenerator.extractFormData(modalId);
      console.log("📝 Extracted Form Data:", formData);

      // Apply changes to the actual DOM element
      console.log(
        "🔄 Applying changes to target element:",
        this.currentTargetElement.tagName
      );

      // Log element state BEFORE changes
      console.log("📋 Element state BEFORE changes:", {
        tag: this.currentTargetElement.tagName,
        id: this.currentTargetElement.id || "(no id)",
        className: this.currentTargetElement.className || "(no classes)",
        styleText:
          this.currentTargetElement.style.cssText || "(no inline styles)",
        innerHTML:
          this.currentTargetElement.innerHTML.substring(0, 100) +
          (this.currentTargetElement.innerHTML.length > 100 ? "..." : ""),
      });

      // Store original values for rollback if needed
      const originalValues = {
        id: this.currentTargetElement.id,
        className: this.currentTargetElement.className,
        style: this.currentTargetElement.style.cssText,
      };

      this.applyFormDataToElement(formData, this.currentTargetElement);

      console.log("✅ Successfully applied changes to DOM element");
      console.log("🔍 Element state AFTER changes:", {
        tag: this.currentTargetElement.tagName,
        id: this.currentTargetElement.id || "(no id)",
        className: this.currentTargetElement.className || "(no classes)",
        styleText:
          this.currentTargetElement.style.cssText || "(no inline styles)",
        innerHTML:
          this.currentTargetElement.innerHTML.substring(0, 100) +
          (this.currentTargetElement.innerHTML.length > 100 ? "..." : ""),
      });

      // Show what changed
      console.log("🔄 Changes applied:", {
        idChanged: originalValues.id !== this.currentTargetElement.id,
        classesChanged:
          originalValues.className !== this.currentTargetElement.className,
        stylesChanged:
          originalValues.style !== this.currentTargetElement.style.cssText,
      });

      // Remove preview mode indicator
      this.formGenerator.removePreviewModeIndicator(this.currentTargetElement);

      // Clean up form generator
      if (
        this.formGenerator &&
        typeof this.formGenerator.cleanup === "function"
      ) {
        this.formGenerator.cleanup();
      }

      // Close modal
      this.nexaUI.nexaModal.close(modalId);

      // Clear reference after successful save
      this.currentTargetElement = null;

      // Show success message
      console.log("🎉 Element updated successfully!");
    } catch (error) {
      console.error("❌ Error processing form save:", error);
      console.error("❌ Stack trace:", error.stack);

      // Optional: Show error notification to user
      alert("Error saving changes: " + error.message);
    }
  }

  /**
   * Find the actual element currently in the DOM that we should be working with
   * This handles cases where preview operations have detached our references
   * @returns {HTMLElement|null} - The active element in the DOM or null
   */
  findActiveElementInDOM() {
    try {
      // Strategy 1: Find element with preview indicator
      const previewElement = document.querySelector(
        '[data-nexa-preview="true"]'
      );
      if (previewElement && previewElement.isConnected) {
        console.log("🎯 Found element with preview indicator");
        return previewElement;
      }

      // Strategy 2: Find element with outline style (preview mode visual indicator)
      const outlinedElements = document.querySelectorAll('[style*="outline"]');
      for (const element of outlinedElements) {
        if (
          element.isConnected &&
          element.style.outline.includes("2px dashed #007bff")
        ) {
          console.log("🎯 Found element with preview outline");
          return element;
        }
      }

      // Strategy 3: Use stored element ID or unique identifier
      if (this.originalElementState && this.originalElementState.uniqueId) {
        const elementById = document.querySelector(
          `[data-nexa-edit-id="${this.originalElementState.uniqueId}"]`
        );
        if (elementById && elementById.isConnected) {
          console.log("🎯 Found element by unique ID");
          return elementById;
        }
      }

      // Strategy 4: Find by position and content similarity (last resort)
      if (this.lastKnownPosition && this.originalElementState) {
        const elementsAtPosition = document.elementsFromPoint(
          this.lastKnownPosition.x || 100,
          this.lastKnownPosition.y || 100
        );
        for (const element of elementsAtPosition) {
          if (this.isElementSimilar(element, this.originalElementState)) {
            console.log("🎯 Found similar element at last known position");
            return element;
          }
        }
      }

      console.warn(
        "⚠️ Could not find active element in DOM using any strategy"
      );
      return null;
    } catch (error) {
      console.error("❌ Error finding active element in DOM:", error);
      return null;
    }
  }

  /**
   * Check if an element is similar to our original element state
   * @param {HTMLElement} element - Element to check
   * @param {Object} originalState - Original element state to compare against
   * @returns {boolean} - True if elements are similar
   */
  isElementSimilar(element, originalState) {
    if (!element || !originalState) return false;

    // Check if content is similar (allowing for some variation)
    const currentText = element.textContent?.trim() || "";
    const originalText =
      originalState.innerHTML?.replace(/<[^>]*>/g, "").trim() || "";

    return currentText.length > 0 && currentText === originalText;
  }

  /**
   * Apply form data changes to DOM element
   * @param {Object} formData - Form data extracted from modal
   * @param {HTMLElement} targetElement - Target DOM element to modify
   */
  applyFormDataToElement(formData, targetElement) {
    console.log("🔧 Applying form data to element:", targetElement.tagName);

    // Find the actual element in the DOM (robust element recovery)
    let workingElement =
      this.findActiveElementInDOM() ||
      this.currentTargetElement ||
      targetElement;

    console.log("🔍 Save operation element validation:", {
      targetElementTag: targetElement.tagName,
      targetHasParent: !!targetElement.parentNode,
      currentTargetTag: this.currentTargetElement?.tagName,
      currentHasParent: !!this.currentTargetElement?.parentNode,
      workingElementTag: workingElement.tagName,
      workingHasParent: !!workingElement.parentNode,
      workingElementConnected: workingElement.isConnected,
      workingElementInDocument: document.contains(workingElement),
    });

    // If we found a better element, update our reference
    if (
      workingElement !== this.currentTargetElement &&
      workingElement.isConnected
    ) {
      console.log("🔄 Updating currentTargetElement to active DOM element");
      this.currentTargetElement = workingElement;
    }

    // 1. Update Element Tag (if changed)
    if (formData.basic && formData.basic.tag) {
      const newTag = formData.basic.tag.toLowerCase().trim();
      const currentTag = workingElement.tagName.toLowerCase();

      if (newTag && newTag !== currentTag) {
        console.log(
          `🏷️ Updating element tag: "${currentTag.toUpperCase()}" → "${newTag.toUpperCase()}"`
        );

        try {
          // Validate element has a parent
          if (!workingElement.parentNode) {
            console.error(
              `❌ Working element has no parent node, cannot replace during save`
            );
            console.error("Element debug info:", {
              tagName: workingElement.tagName,
              isConnected: workingElement.isConnected,
              parentNode: workingElement.parentNode,
              isInDocument: document.contains(workingElement),
            });
            return;
          }

          // Create new element with new tag
          const newElement = document.createElement(newTag);

          // Copy all attributes from old element
          Array.from(workingElement.attributes).forEach((attr) => {
            try {
              newElement.setAttribute(attr.name, attr.value);
            } catch (attrError) {
              console.warn(
                `⚠️ Could not copy attribute ${attr.name}: ${attrError.message}`
              );
            }
          });

          // Copy innerHTML (content)
          newElement.innerHTML = workingElement.innerHTML;

          // Replace the element in DOM
          const parentNode = workingElement.parentNode;
          parentNode.replaceChild(newElement, workingElement);

          // Update current target element reference
          this.currentTargetElement = newElement;

          // Update all references to point to the new element
          targetElement = newElement;
          workingElement = newElement; // This line doesn't actually update the const, but shows intent

          console.log(
            `✅ Tag changed successfully to "${newTag.toUpperCase()}" during save`
          );
        } catch (error) {
          console.error(
            `❌ Failed to change tag during save: ${error.message}`
          );
          console.error("Save operation element details:", {
            originalTag: workingElement.tagName,
            hasParent: !!workingElement.parentNode,
            currentTargetExists: !!this.currentTargetElement,
            workingElementConnected: workingElement.isConnected,
            newTag: newTag,
          });
        }
      }
    }

    // 2. Update Element ID
    if (formData.basic && formData.basic.id !== undefined) {
      const newId = formData.basic.id.trim();
      if (newId !== this.currentTargetElement.id) {
        console.log(
          `🆔 Updating element ID: "${this.currentTargetElement.id}" → "${newId}"`
        );
        this.currentTargetElement.id = newId;
      }
    }

    // 3. Update Classes
    if (formData.classes && Array.isArray(formData.classes)) {
      const newClasses = formData.classes.filter((cls) => cls && cls.trim()); // Remove empty classes
      const newClassName = newClasses.join(" ");
      if (newClassName !== this.currentTargetElement.className) {
        console.log(
          `📝 Updating element classes: "${this.currentTargetElement.className}" → "${newClassName}"`
        );
        this.currentTargetElement.className = newClassName;
      }
    }

    // 4. Update Inline Styles
    if (formData.styles && typeof formData.styles === "object") {
      console.log("🎨 Updating inline styles:");
      Object.entries(formData.styles).forEach(([property, value]) => {
        if (value && value.trim()) {
          console.log(`  - ${property}: ${value}`);
          this.currentTargetElement.style.setProperty(property, value.trim());
        } else {
          // Remove property if value is empty
          console.log(`  - Removing ${property}`);
          this.currentTargetElement.style.removeProperty(property);
        }
      });
    }

    // 5. Update Attributes (non-standard attributes)
    if (formData.attributes && typeof formData.attributes === "object") {
      console.log("🔧 Updating attributes:");
      Object.entries(formData.attributes).forEach(([attrName, attrValue]) => {
        // Skip standard attributes that are handled elsewhere
        if (["id", "class", "style"].includes(attrName.toLowerCase())) return;

        if (attrValue && attrValue.trim()) {
          console.log(`  - ${attrName}: ${attrValue}`);
          this.currentTargetElement.setAttribute(attrName, attrValue.trim());
        } else {
          console.log(`  - Removing ${attrName}`);
          this.currentTargetElement.removeAttribute(attrName);
        }
      });
    }

    // 6. Update Text Content (direct text nodes)
    if (
      formData.content &&
      formData.content.textNodes &&
      Array.isArray(formData.content.textNodes)
    ) {
      console.log("📄 Updating text content:");

      // Get direct text nodes from current target element
      const textNodes = [];
      for (let i = 0; i < this.currentTargetElement.childNodes.length; i++) {
        const node = this.currentTargetElement.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node);
        }
      }

      // Update existing text nodes or create new ones
      formData.content.textNodes.forEach((newText, index) => {
        if (newText && newText.trim()) {
          if (textNodes[index]) {
            console.log(
              `  - Text node ${index}: "${textNodes[
                index
              ].textContent.trim()}" → "${newText.trim()}"`
            );
            textNodes[index].textContent = newText.trim();
          } else {
            console.log(`  - Creating new text node: "${newText.trim()}"`);
            const newTextNode = document.createTextNode(newText.trim());
            this.currentTargetElement.appendChild(newTextNode);
          }
        }
      });
    }

    console.log("✅ Form data successfully applied to DOM element");
  }

  /**
   * Process form cancel - restore original element state
   * @param {string} modalId - Modal ID
   * @param {*} data - Optional data
   */
  processElementsFormCancel(modalId, data = null) {
    console.log("❌ Processing Elements Form Cancel:", modalId, data);

    try {
      // Check if we have target element to restore
      if (!this.currentTargetElement) {
        console.warn("⚠️ No target element available for restoration");
      } else if (this.formGenerator.originalElementState) {
        console.log("🔄 Restoring element to original state...");
        const restoredElement = this.formGenerator.restoreOriginalElementState(
          this.currentTargetElement
        );

        // Update reference if element was replaced during restoration
        if (restoredElement !== this.currentTargetElement) {
          this.currentTargetElement = restoredElement;
          console.log(
            "🔄 Updated target element reference after tag restoration"
          );
        }

        console.log("✅ Element restored to original state successfully");
      } else {
        console.warn("⚠️ No original state stored for restoration");
        // Still remove preview indicator even if no state to restore
        this.formGenerator.removePreviewModeIndicator(
          this.currentTargetElement
        );
      }

      // Clean up form generator
      if (
        this.formGenerator &&
        typeof this.formGenerator.cleanup === "function"
      ) {
        this.formGenerator.cleanup();
      }

      // Close modal
      this.nexaUI.nexaModal.close(modalId);

      // Clear reference
      this.currentTargetElement = null;

      console.log("🚪 Modal closed and references cleared");
    } catch (error) {
      console.error("❌ Error processing form cancel:", error);
      console.error("❌ Stack trace:", error.stack);

      // Still try to close modal
      try {
        this.nexaUI.nexaModal.close(modalId);
      } catch (closeError) {
        console.error("❌ Error closing modal:", closeError);
      }
    }
  }

  /**
   * Set target element for chart insertion
   * @param {HTMLElement} element - The target element
   */

  elementsEdit(data = null) {
    console.log("✏️ Elements Edit action triggered");
    console.log("🎯 Target Element:", data?.targetElement);
    console.log("📋 Target Element Details:");
    console.log("  - Tag Name:", data?.targetElement?.tagName);
    console.log("  - Element ID:", data?.targetElement?.id);
    console.log("  - Classes:", data?.targetElement?.className);
    console.log("  - Has inline styles:", !!data?.targetElement?.style?.length);

    if (!data?.targetElement) {
      console.warn("No target element provided for editing");
      return;
    }

    // Store reference to current target element for later use in save operation
    this.currentTargetElement = data.targetElement;
    console.log("💾 Stored target element reference for editing");

    // Store element position for recovery purposes
    const rect = data.targetElement.getBoundingClientRect();
    this.lastKnownPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    // Add unique identifier for recovery
    const uniqueId =
      "nexa-edit-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    data.targetElement.setAttribute("data-nexa-edit-id", uniqueId);
    console.log("🔖 Added unique identifier for element recovery:", uniqueId);

    // Analyze DOM element to get data array (fresh analysis every time)
    console.log("🔄 Starting fresh DOM analysis for:", data.targetElement);
    const analysis = this.domAnalyzer.analyzeDOMElement(data.targetElement);

    if (!analysis || !analysis.elementDataArray) {
      console.warn("Failed to analyze DOM element");
      return;
    }

    // Log the analysis for debugging
    console.log(
      "📊 Fresh analysis completed, data array length:",
      analysis.elementDataArray.length
    );
    this.domAnalyzer.logDOMAnalysis(data.targetElement);

    // Generate dynamic form based on element data
    const targetId =
      data.targetId || data.targetElement.id || data.targetElement.tagName;
    console.log("🆔 Target ID for modal:", targetId);

    const modalConfig = this.formGenerator.generateModalForm(
      analysis.elementDataArray,
      targetId
    );

    console.log("🎭 Generated modal config with ID:", modalConfig.elementById);

    // Show modal with dynamic form
    this.initModals(modalConfig);

    // Initialize form interactions after modal is opened
    setTimeout(() => {
      this.formGenerator.initializeFormInteractions(
        modalConfig.elementById,
        this.currentTargetElement
      );
    }, 100);
  }

  // Store for copy/paste functionality
  static copiedElementData = null;

  elementsCopy(data = null) {
    console.log("📋 Elements Copy action triggered");
    console.log("🎯 Target Element:", data?.targetElement);

    if (!data?.targetElement) {
      console.warn("No target element provided for copying");
      return;
    }

    try {
      // Store the element data for pasting
      const elementToCopy = data.targetElement;

      // Create a deep copy of the element
      const clonedElement = elementToCopy.cloneNode(true);

      // Remove any temporary IDs or classes that shouldn't be copied
      this.cleanCopiedElement(clonedElement);

      // Store the copied element data
      Elements.copiedElementData = {
        outerHTML: clonedElement.outerHTML,
        tagName: clonedElement.tagName,
        timestamp: Date.now(),
      };

      console.log("✅ Element copied successfully:", {
        tag: Elements.copiedElementData.tagName,
        timestamp: Elements.copiedElementData.timestamp,
      });

      // Show success feedback
      this.showNotification("Element copied to clipboard", "success");
    } catch (error) {
      console.error("❌ Error copying element:", error);
      this.showNotification("Failed to copy element", "error");
    }
  }

  elementsPaste(data = null) {
    console.log("📋 Elements Paste action triggered");
    console.log("🎯 Target Element:", data?.targetElement);

    if (!Elements.copiedElementData) {
      console.warn("No element data in clipboard");
      this.showNotification("No element to paste", "warning");
      return;
    }

    if (!data?.targetElement) {
      console.warn("No target element provided for pasting");
      return;
    }

    try {
      // Create element from stored HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = Elements.copiedElementData.outerHTML;
      const elementToPaste = tempDiv.firstElementChild;

      if (!elementToPaste) {
        throw new Error("Invalid element data in clipboard");
      }

      // Generate unique IDs for the pasted element
      this.generateUniqueIds(elementToPaste);

      // Insert the element after the target element
      const targetElement = data.targetElement;
      targetElement.parentNode.insertBefore(
        elementToPaste,
        targetElement.nextSibling
      );

      console.log("✅ Element pasted successfully:", {
        tag: elementToPaste.tagName,
        id: elementToPaste.id || "(no id)",
      });

      // Show success feedback
      this.showNotification("Element pasted successfully", "success");
    } catch (error) {
      console.error("❌ Error pasting element:", error);
      this.showNotification("Failed to paste element", "error");
    }
  }

  elementsSection(data = null) {
    console.log("➕ Elements Add Section action triggered");
    console.log("🎯 Target Element:", data?.targetElement);

    if (!data?.targetElement) {
      console.warn("No target element provided for adding section");
      return;
    }

    try {
      // Create a new section container
      const newSection = document.createElement("div");
      newSection.className = "nexa-section";
      newSection.style.cssText = `
        padding: 20px;
        margin: 10px 0;
        border: 2px dashed #ddd;
        min-height: 100px;
        background-color: #f9f9f9;
        position: relative;
      `;

      // Add some placeholder content
      const placeholder = document.createElement("p");
      placeholder.textContent = "New section - Click to edit content";
      placeholder.style.cssText = `
        margin: 0;
        color: #999;
        text-align: center;
        font-style: italic;
      `;
      newSection.appendChild(placeholder);

      // Generate unique ID
      const uniqueId =
        "nexa-section-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substr(2, 9);
      newSection.id = uniqueId;

      // Insert the section after the target element
      const targetElement = data.targetElement;
      targetElement.parentNode.insertBefore(
        newSection,
        targetElement.nextSibling
      );

      console.log("✅ Section added successfully:", {
        id: uniqueId,
        tag: newSection.tagName,
      });

      // Show success feedback
      this.showNotification("Section added successfully", "success");
    } catch (error) {
      console.error("❌ Error adding section:", error);
      this.showNotification("Failed to add section", "error");
    }
  }

  elementsDelete(data = null) {
    console.log("🗑️ Elements Delete action triggered");
    console.log("🎯 Target Element:", data?.targetElement);

    if (!data?.targetElement) {
      console.warn("No target element provided for deletion");
      return;
    }

    try {
      const targetElement = data.targetElement;

      // Get element info before deletion
      const elementInfo = {
        tagName: targetElement.tagName,
        id: targetElement.id || "(no id)",
        className: targetElement.className || "(no classes)",
      };

      console.log("🎯 Deleting element:", elementInfo);

      // Store in undo history before deletion
      const undoData = {
        element: targetElement.cloneNode(true),
        parent: targetElement.parentNode,
        nextSibling: targetElement.nextSibling,
        timestamp: Date.now(),
      };

      // Remove the element from DOM
      targetElement.parentNode.removeChild(targetElement);

      console.log("✅ Element deleted successfully:", elementInfo);

      // Show success feedback
      this.showNotification("Element deleted successfully", "success");

      // Store undo data (could be used for future undo functionality)
      if (!window.nexaUndoHistory) {
        window.nexaUndoHistory = [];
      }
      window.nexaUndoHistory.push(undoData);

      // Keep only last 10 undo operations
      if (window.nexaUndoHistory.length > 10) {
        window.nexaUndoHistory.shift();
      }
    } catch (error) {
      console.error("❌ Error deleting element:", error);
      this.showNotification("Failed to delete element", "error");
    }
  }

  elementsBorderRadius(data = null) {
    console.log("🔄 Elements Border Radius action triggered");
    console.log("🎯 Target Element:", data?.targetElement);

    if (!data?.targetElement) {
      console.warn("No target element provided for border radius");
      return;
    }

    // Store reference to current target element
    this.currentTargetElement = data.targetElement;

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
    this.initModals({
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
      <div class="form-nexa">
        <!-- Unified Border Radius Section -->
        <div class="nx-row">
          <div class="nx-col-12">
            <label class="text-secondary" style="display: flex; align-items: center; margin-bottom: 1rem;">
              <i class="material-symbols-outlined" style="margin-right: 8px;">border_all</i>
              Unified Border Radius
            </label>
          </div>
          <div class="nx-col-12">
            <div class="form-nexa-floating form-nexa-icon">
              <input type="text" 
                     id="borderRadiusAll" 
                     name="borderRadiusAll" 
                     class="form-nexa-control" 
                     placeholder=" "
                     value="${currentValues.all}">
              <i class="material-symbols-outlined">crop_square</i>
              <label>All Corners (e.g., 10px, 50%, 1rem)</label>
            </div>
            <small class="text-muted" style="display: block; margin-top: 0.5rem;">
              Set the same radius for all corners. Leave empty to use individual values.
            </small>
          </div>
        </div>

        <!-- Individual Corner Settings -->
        <div class="nx-row" style="margin-top: 2rem;">
          <div class="nx-col-12">
            <label class="text-secondary" style="display: flex; align-items: center; margin-bottom: 1rem;">
              <i class="material-symbols-outlined" style="margin-right: 8px;">border_style</i>
              Individual Corner Settings
            </label>
          </div>
          
          <div class="nx-col-6">
            <div class="form-nexa-floating form-nexa-icon">
              <input type="text" 
                     id="borderTopLeft" 
                     name="borderTopLeft" 
                     class="form-nexa-control" 
                     placeholder=" "
                     value="${this.extractNumericValue(currentValues.topLeft)}">
              <i class="material-symbols-outlined">north_west</i>
              <label>Top Left</label>
            </div>
          </div>
          
          <div class="nx-col-6">
            <div class="form-nexa-floating form-nexa-icon">
              <input type="text" 
                     id="borderTopRight" 
                     name="borderTopRight" 
                     class="form-nexa-control" 
                     placeholder=" "
                     value="${this.extractNumericValue(
                       currentValues.topRight
                     )}">
              <i class="material-symbols-outlined">north_east</i>
              <label>Top Right</label>
            </div>
          </div>
          
          <div class="nx-col-6">
            <div class="form-nexa-floating form-nexa-icon">
              <input type="text" 
                     id="borderBottomLeft" 
                     name="borderBottomLeft" 
                     class="form-nexa-control" 
                     placeholder=" "
                     value="${this.extractNumericValue(
                       currentValues.bottomLeft
                     )}">
              <i class="material-symbols-outlined">south_west</i>
              <label>Bottom Left</label>
            </div>
          </div>
          
          <div class="nx-col-6">
            <div class="form-nexa-floating form-nexa-icon">
              <input type="text" 
                     id="borderBottomRight" 
                     name="borderBottomRight" 
                     class="form-nexa-control" 
                     placeholder=" "
                     value="${this.extractNumericValue(
                       currentValues.bottomRight
                     )}">
              <i class="material-symbols-outlined">south_east</i>
              <label>Bottom Right</label>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="nx-row" style="margin-top: 2rem;">
          <div class="nx-col-12">
            <label class="text-secondary" style="display: flex; align-items: center; margin-bottom: 1rem;">
              <i class="material-symbols-outlined" style="margin-right: 8px;">preview</i>
              Live Preview
            </label>
          </div>
          <div class="nx-col-12">
            <div class="border-radius-preview" id="borderRadiusPreview">
              <div class="preview-box">
                <span>Preview</span>
              </div>
            </div>
            <small class="text-muted" style="display: block; margin-top: 0.5rem; text-align: center;">
              Real-time preview of border radius changes
            </small>
          </div>
        </div>

        <!-- Visibility Options Section -->
        <div class="nx-row" style="margin-top: 2rem;">
          <div class="nx-col-12">
            <label class="text-secondary" style="display: flex; align-items: center; margin-bottom: 1rem;">
              <i class="material-symbols-outlined" style="margin-right: 8px;">visibility</i>
              Visibility & Color Options
            </label>
          </div>
          
          <!-- Background Options -->
          <div class="nx-col-12 nx-md-6">
            <div class="nx-checkbox-grid">
              <div class="nx-checkbox-item">
                <input type="checkbox" id="addBackground" name="addBackground" />
                <label for="addBackground">
                  <span class="nx-checkmark"></span>
                  Add background color
                </label>
              </div>
            </div>
            <div class="form-nexa-floating form-nexa-input-group-icon" style="margin-top: 1rem;">
              <div class="form-nexa-input-group">
                <span class="form-nexa-input-group-text">
                  <input type="color" 
                         id="backgroundColor" 
                         name="backgroundColor" 
                         class="form-nexa-color-picker" 
                         value="#007bff">
                </span>
                <input type="text" 
                       id="backgroundColorText" 
                       name="backgroundColorText" 
                       class="form-nexa-control" 
                       placeholder=" " 
                       value="#007bff">
              </div>
              <label>Background Color</label>
            </div>
            <div class="form-nexa-floating" style="margin-top: 1rem;">
              <input type="range" 
                     id="backgroundOpacity" 
                     name="backgroundOpacity" 
                     class="form-nexa-control opacity-slider" 
                     min="0" 
                     max="100" 
                     value="10" 
                     placeholder=" ">
              <label>Background Opacity (%)</label>
              <span class="opacity-value">10%</span>
            </div>
          </div>

          <!-- Border Options -->
          <div class="nx-col-12 nx-md-6">
            <div class="nx-checkbox-grid">
              <div class="nx-checkbox-item">
                <input type="checkbox" id="addBorder" name="addBorder" />
                <label for="addBorder">
                  <span class="nx-checkmark"></span>
                  Add border
                </label>
              </div>
            </div>
            <div class="form-nexa-floating form-nexa-input-group-icon" style="margin-top: 1rem;">
              <div class="form-nexa-input-group">
                <span class="form-nexa-input-group-text">
                  <input type="color" 
                         id="borderColor" 
                         name="borderColor" 
                         class="form-nexa-color-picker" 
                         value="#007bff">
                </span>
                <input type="text" 
                       id="borderColorText" 
                       name="borderColorText" 
                       class="form-nexa-control" 
                       placeholder=" " 
                       value="#007bff">
              </div>
              <label>Border Color</label>
            </div>
            <div class="form-nexa-floating" style="margin-top: 1rem;">
              <input type="range" 
                     id="borderWidth" 
                     name="borderWidth" 
                     class="form-nexa-control width-slider" 
                     min="1" 
                     max="10" 
                     value="1" 
                     placeholder=" ">
              <label>Border Width (px)</label>
              <span class="width-value">1px</span>
            </div>
          </div>

          <div class="nx-col-12">
            <small class="text-muted" style="display: block; margin-top: 1rem;">
              <i class="material-symbols-outlined" style="font-size: 1rem; vertical-align: middle;">info</i>
              Use these options to add custom background and border colors to make border radius visible.
            </small>
          </div>
        </div>

        <!-- Tips Section -->
        <div class="nx-row" style="margin-top: 2rem;">
          <div class="nx-col-12">
            <div class="nexa-alert nexa-alert-info">
              <i class="material-symbols-outlined">lightbulb</i>
              <div class="nexa-alert-content">
                <strong>Tips:</strong>
                <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
                  <li>Use px, em, rem, or % units for precise control</li>
                  <li>Unified setting overrides individual corners</li>
                  <li>Use 50% for perfect circles/ovals</li>
                  <li>Border radius only visible on elements with background or border</li>
                  <li>Use visibility options above for transparent elements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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

        /* NexaUI Checkbox Styles */
        .nx-checkbox-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .nx-checkbox-item {
          position: relative;
        }

        .nx-checkbox-item input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .nx-checkbox-item label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: 0.9rem;
          line-height: 1.4;
          padding-left: 2rem;
          position: relative;
          color: var(--nexa-text-primary, #333);
        }

        .nx-checkmark {
          position: absolute;
          left: 0;
          top: 2px;
          height: 18px;
          width: 18px;
          background-color: var(--nexa-checkbox-bg, #fff);
          border: 2px solid var(--nexa-checkbox-border, #ddd);
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .nx-checkbox-item input[type="checkbox"]:checked ~ label .nx-checkmark {
          background-color: var(--nexa-checkbox-checked, #007bff);
          border-color: var(--nexa-checkbox-checked, #007bff);
        }

        .nx-checkmark:after {
          content: "";
          position: absolute;
          display: none;
          left: 5px;
          top: 2px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .nx-checkbox-item input[type="checkbox"]:checked ~ label .nx-checkmark:after {
          display: block;
        }

        .nx-checkbox-item label:hover .nx-checkmark {
          border-color: var(--nexa-checkbox-hover, #007bff);
        }

        /* Color Picker & Slider Styles */
        .form-nexa-color-picker {
          width: 40px;
          height: 40px;
          padding: 0;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          background: transparent;
        }

        .form-nexa-color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
          border-radius: 6px;
          overflow: hidden;
        }

        .form-nexa-color-picker::-webkit-color-swatch {
          border: none;
          border-radius: 6px;
        }

        .form-nexa-input-group {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .form-nexa-input-group-text {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          margin-right: -1px;
          background-color: var(--nexa-input-group-bg, #f8f9fa);
          border: 1px solid var(--nexa-input-group-border, #ddd);
          border-radius: 8px 0 0 8px;
          border-right: none;
        }

        .form-nexa-input-group .form-nexa-control {
          border-radius: 0 8px 8px 0;
          border-left: none;
        }

        .opacity-slider, .width-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          background: var(--nexa-slider-bg, #ddd);
          outline: none;
          transition: background 0.3s ease;
        }

        .opacity-slider::-webkit-slider-thumb, 
        .width-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--nexa-primary, #007bff);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }

        .opacity-slider::-webkit-slider-thumb:hover, 
        .width-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .opacity-slider::-moz-range-thumb, 
        .width-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--nexa-primary, #007bff);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .opacity-value, .width-value {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          background: var(--nexa-primary, #007bff);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          min-width: 40px;
          text-align: center;
        }

        .form-nexa-floating {
          position: relative;
        }

        .form-nexa-floating:has(.opacity-slider), 
        .form-nexa-floating:has(.width-slider) {
          padding-right: 60px;
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

          // Initialize floating labels for the form
          const floatingInputs = document.querySelectorAll('.form-nexa-floating input');
          floatingInputs.forEach(input => {
            const label = input.parentNode.querySelector('label');
            
            // Activate label if input has value
            if (input.value && input.value.trim() !== '') {
              label?.classList.add('active');
            }

            // Handle focus/blur events for floating labels
            input.addEventListener('focus', () => {
              label?.classList.add('active');
            });

            input.addEventListener('blur', () => {
              if (!input.value || input.value.trim() === '') {
                label?.classList.remove('active');
              }
            });

            input.addEventListener('input', () => {
              if (input.value && input.value.trim() !== '') {
                label?.classList.add('active');
              }
            });
          });

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
                    if (input) {
                      input.value = '';
                      const label = input.parentNode.querySelector('label');
                      label?.classList.remove('active');
                    }
                  });
              }
            });
          }

          // Initial preview update and floating label activation
          updatePreview();
          updateColorPreview();
          
          // Activate labels for inputs that have values (including color inputs)
          setTimeout(() => {
            floatingInputs.forEach(input => {
              if (input.value && input.value.trim() !== '') {
                const label = input.parentNode.querySelector('label');
                label?.classList.add('active');
              }
            });

            // Activate labels for input groups
            const inputGroups = document.querySelectorAll('.form-nexa-input-group-icon');
            inputGroups.forEach(group => {
              const input = group.querySelector('input.form-nexa-control');
              const label = group.querySelector('label');
              if (input && label && input.value && input.value.trim() !== '') {
                label.classList.add('active');
              }
            });

            // Initialize slider values
            if (opacityValue && opacitySlider) {
              opacityValue.textContent = opacitySlider.value + '%';
            }
            if (widthValue && widthSlider) {
              widthValue.textContent = widthSlider.value + 'px';
            }
          }, 100);

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
      let targetElement = this.currentTargetElement;

      // Debug current state
      console.log("🔍 Target Element Debug Info:", {
        currentTargetElement: this.currentTargetElement,
        isConnected: this.currentTargetElement?.isConnected,
        tagName: this.currentTargetElement?.tagName,
        id: this.currentTargetElement?.id,
        className: this.currentTargetElement?.className,
      });

      if (!targetElement || !targetElement.isConnected) {
        console.warn(
          "⚠️ Current target element is not connected, trying to recover..."
        );

        // Try to find the element using various recovery methods
        targetElement = this.findActiveElementInDOM();

        if (!targetElement) {
          console.error(
            "❌ No target element available for border radius modification"
          );
          this.showNotification(
            "Target element not found. Please try again.",
            "error"
          );
          return;
        } else {
          console.log("✅ Recovered target element:", targetElement.tagName);
          this.currentTargetElement = targetElement;
        }
      }

      // Get form data with enhanced debugging
      const formData = this.getFormData(modalId);
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
        this.showNotification("Please enter border radius values", "warning");
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
      this.showNotification(
        `Border radius applied successfully (${appliedCount} properties set)`,
        "success"
      );

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

      // Warn user if border radius might not be visible
      if (!userRequestedStyling && !hasVisibleStyling) {
        this.showNotification(
          "Border radius applied! Tip: Check 'Add background color' or 'Add border' to make it more visible.",
          "info"
        );
      }

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
      this.showNotification(
        "Failed to apply border radius: " + error.message,
        "error"
      );
    } finally {
      // Close modal and cleanup
      if (this.nexaUI && this.nexaUI.nexaModal) {
        this.nexaUI.nexaModal.close(modalId);
      }

      // Don't immediately clear currentTargetElement to allow for visual verification
      setTimeout(() => {
        this.currentTargetElement = null;
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
        console.log("🧨 NUCLEAR: Element classes:", element.className);
        console.log("🧨 NUCLEAR: Element tag:", element.tagName);

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

            this.showNotification(
              `✅ Border applied: ${finalVerification.borderWidth} ${finalVerification.borderStyle} ${finalVerification.borderColor}${radiusMessage}`,
              "success"
            );
          } else {
            console.log("❌ FAILED: Border not applied correctly!");
            console.log("❌ Expected border:", borderStyle);
            console.log(
              "❌ Current computed border:",
              finalVerification.border
            );
            this.showNotification(
              `❌ Border failed to apply. Expected: ${borderStyle}, Got: ${finalVerification.border}`,
              "error"
            );

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

        // Immediate check after application
        console.log("🔍 IMMEDIATE check after border application:", {
          elementBorder: element.style.border,
          computedBorder: getComputedStyle(element).border,
          expectedBorder: borderStyle,
        });

        // Comprehensive debugging and verification
        setTimeout(() => {
          const finalComputedStyle = getComputedStyle(element);

          console.log("✅ Final border result:", {
            computedBorder: finalComputedStyle.border,
            computedBorderWidth: finalComputedStyle.borderWidth,
            computedBorderStyle: finalComputedStyle.borderStyle,
            computedBorderColor: finalComputedStyle.borderColor,
            computedBorderTop: finalComputedStyle.borderTop,
            computedBorderRight: finalComputedStyle.borderRight,
            computedBorderBottom: finalComputedStyle.borderBottom,
            computedBorderLeft: finalComputedStyle.borderLeft,
          });

          // VERIFY border-radius is still intact
          console.log("🔄 VERIFY border-radius after border application:", {
            borderRadius: finalComputedStyle.borderRadius,
            borderTopLeftRadius: finalComputedStyle.borderTopLeftRadius,
            borderTopRightRadius: finalComputedStyle.borderTopRightRadius,
            borderBottomLeftRadius: finalComputedStyle.borderBottomLeftRadius,
            borderBottomRightRadius: finalComputedStyle.borderBottomRightRadius,
          });

          // Check inline styles
          console.log("🔍 Element inline styles:", {
            inlineBorder: element.style.border,
            inlineBorderWidth: element.style.borderWidth,
            inlineBorderStyle: element.style.borderStyle,
            inlineBorderColor: element.style.borderColor,
            inlineBorderRadius: element.style.borderRadius,
            inlineBorderTopLeftRadius: element.style.borderTopLeftRadius,
            inlineBorderTopRightRadius: element.style.borderTopRightRadius,
            inlineBorderBottomLeftRadius: element.style.borderBottomLeftRadius,
            inlineBorderBottomRightRadius:
              element.style.borderBottomRightRadius,
            styleAttribute: element.getAttribute("style"),
          });

          // Check for conflicting CSS rules
          const allComputedStyles = window.getComputedStyle(element);
          const borderAndRadiusRules = {};
          for (let i = 0; i < allComputedStyles.length; i++) {
            const prop = allComputedStyles[i];
            if (prop.includes("border")) {
              borderAndRadiusRules[prop] =
                allComputedStyles.getPropertyValue(prop);
            }
          }
          console.log(
            "🔍 All computed border & border-radius styles:",
            borderAndRadiusRules
          );
        }, 100);
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

      this.showBorderRadiusVisibilityNotification(
        element,
        originalStyles,
        addedStyles,
        wasUserRequested,
        hasCustomColors
      );
    } else {
      console.log(
        "ℹ️ No custom styling requested by user - border radius will only be visible if element already has background/border styling"
      );
    }
  }

  /**
   * Show notification about border radius visibility enhancement
   */
  showBorderRadiusVisibilityNotification(
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
      this.showNotification("Original styling restored", "info");
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

  /**
   * Clean copied element by removing temporary attributes
   */
  cleanCopiedElement(element) {
    // Remove temporary attributes that shouldn't be copied
    const attributesToRemove = [
      "data-nexa-edit-id",
      "data-nexa-preview",
      "data-nexa-target",
    ];

    attributesToRemove.forEach((attr) => {
      element.removeAttribute(attr);
    });

    // Remove temporary styles that shouldn't be copied
    if (element.style.outline) {
      element.style.removeProperty("outline");
    }

    // Recursively clean child elements
    const children = element.querySelectorAll("*");
    children.forEach((child) => {
      attributesToRemove.forEach((attr) => {
        child.removeAttribute(attr);
      });
      if (child.style.outline) {
        child.style.removeProperty("outline");
      }
    });
  }

  /**
   * Generate unique IDs for pasted elements
   */
  generateUniqueIds(element) {
    // Generate unique ID for the main element if it has an ID
    if (element.id) {
      element.id = element.id + "-copy-" + Date.now();
    }

    // Generate unique IDs for child elements
    const children = element.querySelectorAll("[id]");
    children.forEach((child) => {
      if (child.id) {
        child.id = child.id + "-copy-" + Date.now();
      }
    });
  }

  /**
   * Show notification to user - NexaUI compatible
   */
  showNotification(message, type = "info") {
    // Enhanced notification system for NexaUI
    const icon =
      type === "success"
        ? "check_circle"
        : type === "error"
        ? "error"
        : type === "warning"
        ? "warning"
        : "info";

    const iconText =
      type === "success"
        ? "✅"
        : type === "error"
        ? "❌"
        : type === "warning"
        ? "⚠️"
        : "ℹ️";

    console.log(`${iconText} ${message}`);

    // Create visual notification using NexaUI styles
    this.createVisualNotification(message, type, icon);
  }

  /**
   * Create visual notification toast - NexaUI style
   */
  createVisualNotification(message, type, icon) {
    // Remove existing notifications
    const existingNotifications =
      document.querySelectorAll(".nexa-notification");
    existingNotifications.forEach((notification) => notification.remove());

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `nexa-notification nexa-notification-${type}`;
    notification.innerHTML = `
      <div class="nexa-notification-content">
        <i class="material-symbols-outlined nexa-notification-icon">${icon}</i>
        <span class="nexa-notification-message">${message}</span>
        <button class="nexa-notification-close" onclick="this.parentElement.parentElement.remove()">
          <i class="material-symbols-outlined">close</i>
        </button>
      </div>
    `;

    // Add notification styles
    const style = document.createElement("style");
    style.textContent = `
      .nexa-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        border-radius: 8px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .nexa-notification.show {
        opacity: 1;
        transform: translateX(0);
      }

      .nexa-notification-content {
        display: flex;
        align-items: center;
        padding: 1rem;
        gap: 0.75rem;
      }

      .nexa-notification-success {
        background: var(--nexa-success-bg, #d4edda);
        border: 1px solid var(--nexa-success-border, #c3e6cb);
        color: var(--nexa-success-text, #155724);
      }

      .nexa-notification-error {
        background: var(--nexa-error-bg, #f8d7da);
        border: 1px solid var(--nexa-error-border, #f5c6cb);
        color: var(--nexa-error-text, #721c24);
      }

      .nexa-notification-warning {
        background: var(--nexa-warning-bg, #fff3cd);
        border: 1px solid var(--nexa-warning-border, #ffeaa7);
        color: var(--nexa-warning-text, #856404);
      }

      .nexa-notification-info {
        background: var(--nexa-info-bg, #e3f2fd);
        border: 1px solid var(--nexa-info-border, #bbdefb);
        color: var(--nexa-info-text, #0d47a1);
      }

      .nexa-notification-icon {
        font-size: 1.25rem;
        opacity: 0.8;
      }

      .nexa-notification-message {
        flex: 1;
        font-weight: 500;
        font-size: 0.9rem;
        line-height: 1.4;
      }

      .nexa-notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        opacity: 0.6;
        transition: opacity 0.2s ease;
      }

      .nexa-notification-close:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.1);
      }

      .nexa-notification-close i {
        font-size: 1.1rem;
      }

      @media (prefers-color-scheme: dark) {
        .nexa-notification-success {
          background: var(--nexa-success-bg-dark, #1b5e20);
          border-color: var(--nexa-success-border-dark, #2e7d32);
          color: var(--nexa-success-text-dark, #c8e6c9);
        }

        .nexa-notification-error {
          background: var(--nexa-error-bg-dark, #b71c1c);
          border-color: var(--nexa-error-border-dark, #d32f2f);
          color: var(--nexa-error-text-dark, #ffcdd2);
        }

        .nexa-notification-warning {
          background: var(--nexa-warning-bg-dark, #e65100);
          border-color: var(--nexa-warning-border-dark, #f57c00);
          color: var(--nexa-warning-text-dark, #ffe0b2);
        }

        .nexa-notification-info {
          background: var(--nexa-info-bg-dark, #0d47a1);
          border-color: var(--nexa-info-border-dark, #1976d2);
          color: var(--nexa-info-text-dark, #bbdefb);
        }
      }

      @media (max-width: 768px) {
        .nexa-notification {
          left: 20px;
          right: 20px;
          min-width: auto;
        }
      }
    `;

    // Add styles to head if not already present
    if (!document.querySelector(".nexa-notification-styles")) {
      style.className = "nexa-notification-styles";
      document.head.appendChild(style);
    }

    // Add notification to body
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 4000);
  }

  elementsModal(data = null) {
    console.log("🗑️ Elements Delete action triggered:", data);

    this.initModals({
      elementById: "elementsDeleteModal",
      styleClass: "w-400px",
      label: "Delete Elements",
      onclick: {
        title: "Delete",
        cancel: "Cancel",
        send: "processElementsDelete",
      },
      content: `
        <div class="modal-form text-center">
          <div class="alert alert-warning mb-3">
            <i data-feather="alert-triangle" style="color: #ff9800;"></i>
            <strong>Warning!</strong>
          </div>
          <p>Are you sure you want to delete this element?</p>
          <p class="text-muted">This action cannot be undone.</p>
        </div>
      `,
    });
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Elements;
} else if (typeof window !== "undefined") {
  window.Elements = Elements;
}
export { Elements };
