/**
 * createFormContinuation.js - Additional methods for createForm class
 * This file contains the large methods that continue the createForm functionality
 */

/**
 * Setup events for Form Builder Modal
 */
export function setupFormBuilderEvents() {
  const modal = document.getElementById("nexa-form-builder-modal");
  if (!modal) return;

  // Use state from parent instance
  let selectedElements = this.formBuilderState.selectedElements; // Array of {id, instanceId, name, elementInfo}
  let instanceCounters = new Map(); // Track instance count per element type
  let elementCustomIcons = this.formBuilderState.elementCustomIcons; // Store individual custom icons per element instance
  let elementCustomProperties = this.formBuilderState.elementCustomProperties; // Store custom properties (name, placeholder, label) per instance

  // Helper function to update UI
  const updateUI = () => {
    // Update counter (count only non-removed elements)
    const activeElements = selectedElements.filter((item) => !item.removed);
    document.getElementById("selected-count").textContent =
      activeElements.length;

    // Update selected elements list
    const listContainer = document.getElementById("selected-elements-list");
    const noSelection = document.getElementById("no-selection");
    const batchConfig = document.getElementById("batch-config");

    if (activeElements.length === 0) {
      noSelection.style.display = "block";
      batchConfig.style.display = "none";

      // Clear any previous list items
      const existingItems = listContainer.querySelectorAll(".selected-item");
      existingItems.forEach((item) => item.remove());
    } else {
      noSelection.style.display = "none";
      batchConfig.style.display = "block";

      // Clear and rebuild list
      const existingItems = listContainer.querySelectorAll(".selected-item");
      existingItems.forEach((item) => item.remove());

      activeElements.forEach((element) => {
        const elementInfo = element.elementInfo;

        if (elementInfo) {
          const itemElement = document.createElement("div");
          itemElement.className = "selected-item";
          itemElement.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            border: 1px solid #e1e5e9;
            border-radius: 6px;
            background: #f8f9fa;
            margin-bottom: 8px;
          `;

          const isIconBasedInput = element.id.includes("-icon");
          const currentCustomIcon = elementCustomIcons.get(element.instanceId);
          const iconToShow = currentCustomIcon || elementInfo.icon;

          itemElement.innerHTML = `
            <span class="material-symbols-outlined" style="font-size: 16px; color: #007bff;">${iconToShow}</span>
            <span style="flex: 1; font-size: 14px; color: #333;">${
              element.name
            }</span>
            <div style="display: flex; gap: 4px; align-items: center;">
              <button class="element-settings-btn" data-instance-id="${
                element.instanceId
              }" style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 4px 6px;
                font-size: 10px;
                color: #6c757d;
                cursor: pointer;
                transition: all 0.2s ease;
              " title="Edit properties">
                <span class="material-symbols-outlined" style="font-size: 12px;">settings</span>
              </button>
              ${
                isIconBasedInput
                  ? `<button class="individual-icon-btn" data-instance-id="${element.instanceId}" style="
                      background: #e3f2fd;
                      border: 1px solid #2196f3;
                      border-radius: 4px;
                      padding: 2px 6px;
                      font-size: 10px;
                      color: #1976d2;
                      cursor: pointer;" title="Choose custom icon">
                      <span class="material-symbols-outlined" style="font-size: 12px;">edit</span>
                    </button>`
                  : ""
              }
              <button class="remove-btn" data-instance-id="${
                element.instanceId
              }" style="
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 2px 6px;
                font-size: 12px;
                cursor: pointer;
              ">×</button>
            </div>
          `;

          listContainer.appendChild(itemElement);
        }
      });
    }

    // Update visual state of cards
    document.querySelectorAll(".form-element-card").forEach((card) => {
      const elementId = card.dataset.elementId;
      const activeCount = activeElements.filter(
        (el) => el.id === elementId
      ).length;
      const isSelected = activeCount > 0;
      const checkbox = card.querySelector(".selection-checkbox");
      const checkIcon = card.querySelector(".selection-checkbox i");

      if (isSelected) {
        // Card styling
        card.style.borderColor = "#28a745";
        card.style.borderWidth = "3px";
        card.style.background =
          "linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%)";
        card.style.boxShadow = "0 8px 16px rgba(40, 167, 69, 0.3)";

        // Checkbox styling
        if (checkbox) {
          checkbox.style.display = "flex";
          checkbox.style.background =
            "linear-gradient(135deg, #28a745 0%, #20c997 100%)";
          checkbox.style.borderColor = "#28a745";
          checkbox.style.borderWidth = "3px";
          checkbox.style.transform = "scale(1.2)";
          checkbox.style.boxShadow = "0 4px 8px rgba(40, 167, 69, 0.4)";
        }

        // Check icon styling - show count if multiple
        if (checkIcon) {
          checkIcon.style.display = "block";
          checkIcon.style.color = "white";
          checkIcon.style.fontWeight = "700";
          checkIcon.style.fontSize = activeCount > 1 ? "14px" : "18px";
          checkIcon.textContent = activeCount > 1 ? activeCount : "done";
          checkIcon.style.textShadow = "0 2px 4px rgba(0,0,0,0.3)";
        }
      } else {
        // Reset card styling
        card.style.borderColor = "#e1e5e9";
        card.style.borderWidth = "2px";
        card.style.background = "white";
        card.style.boxShadow = "none";

        // Reset checkbox styling
        if (checkbox) {
          checkbox.style.display = "none";
          checkbox.style.transform = "scale(1)";
        }
        if (checkIcon) {
          checkIcon.style.display = "none";
        }
      }
    });
  };

  // Category tab switching
  document.querySelectorAll(".form-builder-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;

      // Update tab styles
      document.querySelectorAll(".form-builder-tab").forEach((t) => {
        t.style.background = "transparent";
        t.style.color = "#666";
      });
      tab.style.background = "#007bff";
      tab.style.color = "white";

      // Show/hide categories
      document.querySelectorAll(".form-elements-category").forEach((cat) => {
        cat.style.display =
          cat.dataset.category === category ? "block" : "none";
      });
    });
  });

  // Helper function to get element info by ID
  const getElementInfoById = (elementId) => {
    const allCategories = {
      basicInputs: {
        items: [
          { id: "text", name: "Text Input", icon: "edit" },
          { id: "email", name: "Email Input", icon: "email" },
          { id: "password", name: "Password Input", icon: "lock" },
          { id: "number", name: "Number Input", icon: "tag" },
          { id: "tel", name: "Phone Input", icon: "phone" },
          { id: "url", name: "URL Input", icon: "link" },
          { id: "search", name: "Search Input", icon: "search" },
          { id: "textarea", name: "Textarea", icon: "notes" },
        ],
      },
      choices: {
        items: [
          { id: "select", name: "Select Dropdown", icon: "arrow_drop_down" },
          { id: "checkbox-group", name: "Checkbox Group", icon: "check_box" },
          {
            id: "radio-group",
            name: "Radio Group",
            icon: "radio_button_checked",
          },
          { id: "switch", name: "Toggle Switch", icon: "toggle_on" },
        ],
      },
      dateTime: {
        items: [
          { id: "date", name: "Date Picker", icon: "event" },
          { id: "datetime-local", name: "DateTime Picker", icon: "schedule" },
          { id: "time", name: "Time Picker", icon: "access_time" },
          { id: "month", name: "Month Picker", icon: "calendar_month" },
          { id: "week", name: "Week Picker", icon: "date_range" },
        ],
      },
      files: {
        items: [
          { id: "file", name: "File Upload", icon: "upload_file" },
          { id: "image-upload", name: "Image Upload", icon: "image" },
          { id: "multiple-file", name: "Multiple Files", icon: "cloud_upload" },
        ],
      },
      inputWithIcons: {
        items: [
          { id: "text-icon", name: "Text with Icon", icon: "edit" },
          { id: "email-icon", name: "Email with Icon", icon: "email" },
          { id: "password-icon", name: "Password with Icon", icon: "lock" },
          { id: "search-icon", name: "Search with Icon", icon: "search" },
          { id: "phone-icon", name: "Phone with Icon", icon: "phone" },
          { id: "url-icon", name: "URL with Icon", icon: "link" },
        ],
      },
      advanced: {
        items: [
          { id: "range", name: "Range Slider", icon: "tune" },
          { id: "color", name: "Color Picker", icon: "palette" },
          { id: "input-group", name: "Input Group", icon: "layers" },
        ],
      },
    };

    let elementInfo = null;
    Object.values(allCategories).forEach((category) => {
      const found = category.items.find((item) => item.id === elementId);
      if (found) elementInfo = found;
    });
    return elementInfo;
  };

  // Element selection logic
  document.addEventListener("click", (e) => {
    if (e.target.closest(".form-element-card")) {
      const card = e.target.closest(".form-element-card");
      const elementId = card.dataset.elementId;
      const elementInfo = getElementInfoById(elementId);

      if (elementInfo) {
        if (e.shiftKey) {
          // Remove latest instance
          const lastIndex = selectedElements
            .map((el) => el.id)
            .lastIndexOf(elementId);
          if (lastIndex >= 0) {
            selectedElements[lastIndex].removed = true;
          }
        } else {
          // Add new instance
          const instanceCount = (instanceCounters.get(elementId) || 0) + 1;
          instanceCounters.set(elementId, instanceCount);

          const instanceId = `${elementId}-${instanceCount}`;
          const displayName =
            instanceCount > 1
              ? `${elementInfo.name} (${instanceCount})`
              : elementInfo.name;

          selectedElements.push({
            id: elementId,
            instanceId: instanceId,
            name: displayName,
            elementInfo: elementInfo,
            removed: false,
          });
        }
      }
      updateUI();
    }

    // Handle button clicks
    if (e.target.classList.contains("remove-btn")) {
      const instanceId = e.target.dataset.instanceId;
      const elementIndex = selectedElements.findIndex(
        (el) => el.instanceId === instanceId
      );
      if (elementIndex >= 0) {
        selectedElements[elementIndex].removed = true;
        elementCustomIcons.delete(instanceId);
        elementCustomProperties.delete(instanceId);
      }
      updateUI();
    }

    // Individual icon selection button
    if (e.target.closest(".individual-icon-btn")) {
      const btn = e.target.closest(".individual-icon-btn");
      const instanceId = btn.dataset.instanceId;

      this.openIconSelectionForFormBuilder((iconName) => {
        elementCustomIcons.set(instanceId, iconName);
        updateUI();
      });
    }

    // Element settings button
    if (e.target.closest(".element-settings-btn")) {
      const btn = e.target.closest(".element-settings-btn");
      const instanceId = btn.dataset.instanceId;
      const element = selectedElements.find(
        (el) => el.instanceId === instanceId
      );

      if (element) {
        this.openElementPropertiesModal(
          element,
          elementCustomProperties,
          selectedElements,
          () => {
            updateUI();
          }
        );
      }
    }
  });

  // Template buttons
  const templateConfigs = {
    "template-contact": ["text", "email", "tel", "textarea"],
    "template-login": ["email", "password"],
    "template-survey": ["text", "email", "select", "radio-group", "textarea"],
    "template-registration": [
      "text",
      "email",
      "password",
      "tel",
      "date",
      "checkbox-group",
    ],
  };

  Object.entries(templateConfigs).forEach(([buttonId, elements]) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", () => {
        selectedElements.length = 0;
        instanceCounters.clear();
        elementCustomIcons.clear();

        elements.forEach((elementId) => {
          const elementInfo = getElementInfoById(elementId);
          if (elementInfo) {
            const instanceCount = (instanceCounters.get(elementId) || 0) + 1;
            instanceCounters.set(elementId, instanceCount);

            const instanceId = `${elementId}-${instanceCount}`;
            const displayName =
              instanceCount > 1
                ? `${elementInfo.name} (${instanceCount})`
                : elementInfo.name;

            selectedElements.push({
              id: elementId,
              instanceId: instanceId,
              name: displayName,
              elementInfo: elementInfo,
              removed: false,
            });
          }
        });
        updateUI();
      });
    }
  });

  // Note: Generate form button is now handled by modal onclick.title button

  // Select all and clear buttons
  document.getElementById("select-all-btn").addEventListener("click", () => {
    // Get current active category
    const activeTab =
      document.querySelector(
        '.form-builder-tab[style*="background: rgb(0, 123, 255)"]'
      ) ||
      document.querySelector(
        '.form-builder-tab[style*="background:#007bff"]'
      ) ||
      document.querySelector(".form-builder-tab.active");

    if (activeTab) {
      const category = activeTab.dataset.category;
      const categoryElements = document.querySelectorAll(
        `[data-category="${category}"] .form-element-card`
      );

      categoryElements.forEach((card) => {
        const elementId = card.dataset.elementId;
        const elementInfo = getElementInfoById(elementId);

        if (elementInfo) {
          const instanceCount = (instanceCounters.get(elementId) || 0) + 1;
          instanceCounters.set(elementId, instanceCount);

          const instanceId = `${elementId}-${instanceCount}`;
          const displayName =
            instanceCount > 1
              ? `${elementInfo.name} (${instanceCount})`
              : elementInfo.name;

          selectedElements.push({
            id: elementId,
            instanceId: instanceId,
            name: displayName,
            elementInfo: elementInfo,
            removed: false,
          });
        }
      });
      updateUI();
    }
  });

  document
    .getElementById("clear-selection-btn")
    .addEventListener("click", () => {
      selectedElements.length = 0;
      instanceCounters.clear();
      elementCustomIcons.clear();
      elementCustomProperties.clear();
      updateUI();
    });

  // Initialize UI
  updateUI();

  // Add keyboard shortcuts
  modal.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      window.closeModal("nexa-form-builder-modal");
    } else if (
      e.key === "Enter" &&
      selectedElements.filter((el) => !el.removed).length > 0
    ) {
      e.preventDefault();
      this.generateFormFromSelection(
        selectedElements,
        elementCustomIcons,
        elementCustomProperties
      );
    }
  });
}
