/**
 * createFormBuilderModal.js - Form Builder Functionality for Elements
 * Provides comprehensive form builder modal with element selection and configuration
 * Includes drag-and-drop functionality and dynamic form generation
 */
import { setupFormBuilderEvents as setupFormBuilderEventsExtended } from "./createFormContinuation.js";
class createForm {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Initialize sortable element tracking
    this.sortableElements = new Set();

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;

    // Get target element from interactions
    this.targetElement = interactions.targetElement;

    // Form builder state management
    this.formBuilderState = {
      selectedElements: [],
      elementCustomIcons: new Map(),
      elementCustomProperties: new Map(),
    };
  }
  struktur() {
    return [
      {
        icon: "grid",
        text: "Create Form",
        action: "createFormBuilderModal",
      },
    ];
  }

  /**
   * Create Form Builder Modal with Group Selection using NexaUI
   */
  createFormBuilderModal() {
    // Initialize NexaUI sesuai standar
    if (!this.nexaUI) {
      this.nexaUI = NexaUI();
    }

    if (!this.nexaUI) {
      console.error("NexaUI not available");
      return;
    }

    // Form element categories and their items
    const formCategories = {
      basicInputs: {
        name: "Basic",
        icon: "edit",
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
        name: "Elements",
        icon: "check_box",
        items: [
          { id: "select", name: "Select Dropdown", icon: "arrow_drop_down" },
          {
            id: "checkbox-group",
            name: "Checkbox Group",
            icon: "check_box",
          },
          {
            id: "radio-group",
            name: "Radio Group",
            icon: "radio_button_checked",
          },
          { id: "switch", name: "Toggle Switch", icon: "toggle_on" },
        ],
      },
      dateTime: {
        name: "Date",
        icon: "event",
        items: [
          { id: "date", name: "Date Picker", icon: "event" },
          { id: "datetime-local", name: "DateTime Picker", icon: "schedule" },
          { id: "time", name: "Time Picker", icon: "access_time" },
          { id: "month", name: "Month Picker", icon: "calendar_month" },
          { id: "week", name: "Week Picker", icon: "date_range" },
        ],
      },
      files: {
        name: "File",
        icon: "cloud_upload",
        items: [
          { id: "file", name: "File Upload", icon: "upload_file" },
          { id: "image-upload", name: "Image Upload", icon: "image" },
          { id: "multiple-file", name: "Multiple Files", icon: "cloud_upload" },
        ],
      },
      inputWithIcons: {
        name: "With Icons",
        icon: "star",
        items: [
          { id: "text-icon", name: "Text with Icon", icon: "person" },
          { id: "email-icon", name: "Email with Icon", icon: "email" },
          { id: "password-icon", name: "Password with Icon", icon: "lock" },
          { id: "search-icon", name: "Search with Icon", icon: "search" },
          { id: "phone-icon", name: "Phone with Icon", icon: "phone" },
          { id: "url-icon", name: "URL with Icon", icon: "link" },
        ],
      },
      advanced: {
        name: "Advanced",
        icon: "tune",
        items: [
          { id: "range", name: "Range Slider", icon: "tune" },
          { id: "color", name: "Color Picker", icon: "palette" },
          { id: "input-group", name: "Input Group", icon: "layers" },
        ],
      },
    };

    // Create modal content
    const modalContent = `
      <!-- Main Grid Layout -->
      <div style="display: grid; grid-template-columns: 1fr 350px; gap: 2rem; min-height: 500px;">
        
        <!-- Left Column: Element Selection -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          
          <!-- Category Tabs -->
          <div style="display: flex; gap: 4px; border-bottom: 2px solid #f1f3f4; margin-bottom: 1rem;">
            ${Object.entries(formCategories)
              .map(
                ([key, category], index) => `
              <button class="form-builder-tab ${index === 0 ? "active" : ""}" 
                      data-category="${key}"
                      style="
                        padding: 12px 16px;
                        border: none;
                        background: ${index === 0 ? "#007bff" : "transparent"};
                        color: ${index === 0 ? "white" : "#666"};
                        border-radius: 8px 8px 0 0;
                        font-weight: 600;
                        font-size: 13px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                      ">
                <i class="material-symbols-outlined" style="font-size: 16px;">${
                  category.icon
                }</i>
                ${category.name}
              </button>
            `
              )
              .join("")}
          </div>

          <!-- Form Elements Grid for each category -->
          ${Object.entries(formCategories)
            .map(
              ([categoryKey, category], index) => `
            <div class="form-elements-category ${index === 0 ? "active" : ""}" 
                 data-category="${categoryKey}" 
                 style="display: ${index === 0 ? "block" : "none"};">
              <div style="
                display: grid; 
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
                gap: 12px;
              ">
                ${category.items
                  .map(
                    (item) => `
                  <div class="form-element-card" data-element-id="${item.id}" 
                       style="
                         border: 2px solid #e1e5e9;
                         border-radius: 12px;
                         padding: 16px;
                         cursor: pointer;
                         transition: all 0.2s ease;
                         background: white;
                         text-align: center;
                         position: relative;
                         user-select: none;
                       "
                       onmouseover="this.style.borderColor='#007bff'; this.style.transform='translateY(-2px)';"
                       onmouseout="this.style.borderColor='#e1e5e9'; this.style.transform='translateY(0)';">
                    <!-- Selection Checkbox -->
                    <div class="selection-checkbox" style="
                      position: absolute;
                      top: 8px;
                      right: 8px;
                      width: 24px;
                      height: 24px;
                      border: 2px solid #ccc;
                      border-radius: 6px;
                      background: white;
                      display: none;
                      align-items: center;
                      justify-content: center;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                      transition: all 0.3s ease;
                      z-index: 10;
                    ">
                      <i class="material-symbols-outlined" style="
                        font-size: 16px; 
                        color: white; 
                        display: none;
                        font-weight: 600;
                        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                        line-height: 1;
                      ">done</i>
                    </div>
                    
                    <!-- Element Icon -->
                    <div style="
                      width: 48px;
                      height: 48px;
                      background: linear-gradient(135deg, #007bff, #0056b3);
                      border-radius: 12px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      margin: 0 auto 12px auto;
                    ">
                      <i class="material-symbols-outlined" style="color: white; font-size: 24px;">${item.icon}</i>
                    </div>
                    
                    <!-- Element Name -->
                    <h6 style="margin: 0 0 8px 0; font-weight: 600; color: #333;">${item.name}</h6>
                    
                    <!-- Element Type Badge -->
                    <span style="
                      background: #f8f9fa;
                      color: #666;
                      padding: 4px 8px;
                      border-radius: 12px;
                      font-size: 11px;
                      font-weight: 500;
                    ">${item.id}</span>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        <!-- Right Column: Configuration Panel -->
        <div style="
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          position: sticky;
          top: 0;
          height: fit-content;
        ">
          
          <!-- Selected Elements Counter -->
          <div style="
            background: white;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            text-align: center;
            border: 2px solid #e1e5e9;
          ">
            <h6 style="margin: 0 0 8px 0; color: #333;">Selected Elements</h6>
            <div id="selected-count" style="
              font-size: 24px;
              font-weight: 700;
              color: #007bff;
            ">0</div>
            <div style="font-size: 13px; color: #666; margin-top: 4px;">
              Click elements to add instances • Shift+Click to remove latest instance<br>
              <small style="font-size: 11px; color: #007bff;">Icon inputs: click edit button for custom icons</small>
            </div>
          </div>

          <!-- Selected Elements List -->
          <div id="selected-elements-list" style="
            background: white;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            max-height: 200px;
            overflow-y: auto;
            border: 2px solid #e1e5e9;
          ">
            <div id="no-selection" style="
              text-align: center;
              color: #999;
              font-style: italic;
              padding: 20px;
            ">
              No elements selected yet<br>
              <small>Select form elements from the left panel</small>
            </div>
          </div>

          <!-- Batch Configuration -->
          <div id="batch-config" hidden>
            <h6 style="margin: 0 0 16px 0; color: #333; font-weight: 600;"><i class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px; font-size: 18px;">settings</i>Batch Configuration</h6>
            
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="batch-size">Size for All</label></dt>
                <dd class="form-group-body">
                  <select id="batch-size" class="form-select">
                    <option value="">Default Size</option>
                    <option value="input-sm">Small</option>
                    <option value="">Medium</option>
                    <option value="input-lg">Large</option>
                  </select>
                </dd>
              </dl>
            </div>

            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="batch-layout">Layout Style</label></dt>
                <dd class="form-group-body">
                  <select id="batch-layout" class="form-select">
                    <option value="vertical">Vertical Stack</option>
                    <option value="horizontal">Horizontal Row</option>
                    <option value="grid-2">2-Column Grid</option>
                    <option value="grid-3">3-Column Grid</option>
                    <option value="inline">Inline Form</option>
                  </select>
                </dd>
              </dl>
            </div>

            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="batch-spacing">Spacing</label></dt>
                <dd class="form-group-body">
                  <select id="batch-spacing" class="form-select">
                    <option value="normal">Normal Spacing</option>
                    <option value="compact">Compact</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </dd>
              </dl>
            </div>

            <div class="form-checkbox">
              <label><input type="checkbox" id="batch-floating"> Use Floating Labels</label>
            </div>

            <div class="form-checkbox">
              <label><input type="checkbox" id="batch-validation"> Add Validation Styles</label>
            </div>
          </div>

          <!-- Template Management -->
          <div style="
            background: white;
            border-radius: 8px;
            padding: 16px;
            border: 2px solid #e1e5e9;
          ">
            <h6 style="margin: 0 0 12px 0; color: #333; font-weight: 600;"><i class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px; font-size: 18px;">bookmark</i>Quick Templates</h6>
            
            <div class="nx-row">
              <div class="nx-col-12" style="margin-bottom: 8px;">
                <button id="template-contact" class="nx-btn-outline-primary" style="font-size: 13px; padding: 8px 12px; width: 100%;">
                  <i class="material-symbols-outlined" style="vertical-align: middle; margin-right: 6px; font-size: 16px;">contact_phone</i>Contact Form
                </button>
              </div>
              <div class="nx-col-12" style="margin-bottom: 8px;">
                <button id="template-login" class="nx-btn-outline-primary" style="font-size: 13px; padding: 8px 12px; width: 100%;">
                  <i class="material-symbols-outlined" style="vertical-align: middle; margin-right: 6px; font-size: 16px;">login</i>Login Form  
                </button>
              </div>
              <div class="nx-col-12" style="margin-bottom: 8px;">
                <button id="template-survey" class="nx-btn-outline-primary" style="font-size: 13px; padding: 8px 12px; width: 100%;">
                  <i class="material-symbols-outlined" style="vertical-align: middle; margin-right: 6px; font-size: 16px;">quiz</i>Survey Form
                </button>
              </div>
              <div class="nx-col-12">
                <button id="template-registration" class="nx-btn-outline-primary" style="font-size: 13px; padding: 8px 12px; width: 100%;">
                  <i class="material-symbols-outlined" style="vertical-align: middle; margin-right: 6px; font-size: 16px;">person_add</i>Registration Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


    `;

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "nexa-form-builder-modal",
      styleClass: "w-90vw max-w-6xl",
      label: `Form Builder - Multi-Select & Batch Configuration`,
      onclick: {
        title: "Generate Form",
        cancel: "Close",
        send: "generateFormFromModal",
      },
      content: modalContent,
      footer: `
        <button id="select-all-btn" class="nx-btn-outline-primary">Select All in Category</button>
        <button id="clear-selection-btn" class="nx-btn-outline-secondary">Clear Selection</button>
      `,
    });

    // Setup global function for modal close
    window.closeFormBuilderModal = (modalId) => {
      this.nexaUI.nexaModal.close(modalId);
    };

    // Setup global function for generate form
    window.generateFormFromModal = (modalId) => {
      // Check if there are selected elements
      const activeElements = this.formBuilderState.selectedElements.filter(
        (el) => !el.removed
      );
      if (activeElements.length === 0) {
        console.warn("No form elements selected for generation");
        return;
      }

      // Generate form using current state
      this.generateFormFromSelection(
        this.formBuilderState.selectedElements,
        this.formBuilderState.elementCustomIcons,
        this.formBuilderState.elementCustomProperties
      );
    };

    // Open the modal
    this.nexaUI.nexaModal.open("nexa-form-builder-modal");

    // Setup form builder events after modal is opened
    setTimeout(() => {
      this.setupFormBuilderEvents();
    }, 100);

    return true; // Return success indication
  }

  /**
   * Open Element Properties Modal for customizing name, placeholder, label using NexaUI
   */
  openElementPropertiesModal(
    element,
    elementCustomProperties,
    selectedElements,
    onUpdate
  ) {
    // Initialize NexaUI sesuai standar
    if (!this.nexaUI) {
      this.nexaUI = NexaUI();
    }

    if (!this.nexaUI) {
      console.error("NexaUI not available");
      return;
    }

    // Get existing custom properties or defaults
    const existingProps = elementCustomProperties.get(element.instanceId) || {};
    const defaultLabel = this.getDefaultLabelForElement(element.id);
    const defaultPlaceholder = this.getDefaultPlaceholderForElement(element.id);

    // Create modal content
    const modalContent = `
      <!-- Element Info -->
      <div class="alert alert-info" style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <i class="material-symbols-outlined" style="color: #0969da; font-size: 18px;">${
            element.elementInfo.icon
          }</i>
          <strong>${element.name}</strong>
          <span style="font-size: 12px; background: #0969da; color: white; padding: 2px 6px; border-radius: 4px;">${
            element.id
          }</span>
        </div>
      </div>

      <form id="element-properties-form">
        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label for="custom-name">Display Name</label></dt>
            <dd class="form-group-body">
              <input type="text" id="custom-name" class="form-control input-block"
                     value="${
                       existingProps.customName || element.elementInfo.name
                     }"
                     required>
              <p class="note">This will be shown as the label in the form</p>
            </dd>
          </dl>
        </div>

        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label for="custom-placeholder">Placeholder Text</label></dt>
            <dd class="form-group-body">
              <input type="text" id="custom-placeholder" class="form-control input-block"
                     value="${
                       existingProps.customPlaceholder || defaultPlaceholder
                     }">
              <p class="note">Text shown inside the input field when empty</p>
            </dd>
          </dl>
        </div>

        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label for="custom-label">Field Label</label></dt>
            <dd class="form-group-body">
              <input type="text" id="custom-label" class="form-control input-block"
                     value="${existingProps.customLabel || defaultLabel}">
              <p class="note">Label text displayed above the input field</p>
            </dd>
          </dl>
        </div>

        <div class="form-checkbox">
          <label>
            <input type="checkbox" id="field-required" ${
              existingProps.required ? "checked" : ""
            }>
            Required Field
            <span class="note">Mark this field as required for form validation</span>
          </label>
        </div>

        ${
          element.id === "select" ||
          element.id === "checkbox-group" ||
          element.id === "radio-group"
            ? `
        <!-- Options Configuration for Select/Checkbox/Radio -->
        <div class="form-group" id="options-config-section">
          <dl>
            <dt class="form-group-header"><label>Options Configuration</label></dt>
            <dd class="form-group-body"></dd>
          </dl>
          <div id="options-container" style="
            border: 1px solid #d0d7de;
            border-radius: 6px;
            padding: 16px;
            background: #f8f9fa;
            margin-bottom: 12px;
          ">
            <div id="options-list">
              <!-- Options will be dynamically added here -->
            </div>
            <button type="button" id="add-option-btn" class="nx-btn-secondary" style="font-size: 12px; padding: 6px 12px;">
              <i class="material-symbols-outlined" style="vertical-align: middle; margin-right: 4px; font-size: 14px;">add</i>
              Add Option
            </button>
          </div>
          <div class="form-text">Configure the options that will appear in the ${
            element.id === "select" ? "dropdown" : element.id.replace("-", " ")
          }</div>
        </div>
        `
            : ""
        }
      </form>
    `;

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "element-properties-modal",
      styleClass: "w-500px",
      label: `Element Properties`,
      onclick: {
        title: "Save Properties",
        cancel: "Cancel",
        send: "saveElementProperties",
      },
      content: modalContent,
    });

    // Setup global function for saving properties
    window.saveElementProperties = (modalId) => {
      const customName = document.getElementById("custom-name").value.trim();
      const customPlaceholder = document
        .getElementById("custom-placeholder")
        .value.trim();
      const customLabel = document.getElementById("custom-label").value.trim();
      const required = document.getElementById("field-required").checked;

      // Collect options for select/checkbox/radio elements
      let options = null;
      if (
        element.id === "select" ||
        element.id === "checkbox-group" ||
        element.id === "radio-group"
      ) {
        options = [];
        const optionRows = document.querySelectorAll(".option-row");
        optionRows.forEach((row) => {
          const text = row.querySelector(".option-text").value.trim();
          const value = row.querySelector(".option-value").value.trim();
          if (text || value) {
            // Only add if not empty
            options.push({
              text: text || value, // Use value as text if text is empty
              value: value || text, // Use text as value if value is empty
            });
          }
        });
      }

      // Save properties
      const propertiesToSave = {
        customName: customName || element.elementInfo.name,
        customPlaceholder: customPlaceholder || defaultPlaceholder,
        customLabel: customLabel || defaultLabel,
        required: required,
      };

      // Add options if applicable
      if (options !== null) {
        propertiesToSave.options = options;
      }

      elementCustomProperties.set(element.instanceId, propertiesToSave);

      // Update element name in selectedElements array
      const elementIndex = selectedElements.findIndex(
        (el) => el.instanceId === element.instanceId
      );
      if (elementIndex >= 0) {
        selectedElements[elementIndex].name =
          customName || element.elementInfo.name;
      }

      // Close modal
      this.nexaUI.nexaModal.close(modalId);
      onUpdate();
    };

    // Setup reset button functionality
    window.resetElementProperties = () => {
      document.getElementById("custom-name").value = element.elementInfo.name;
      document.getElementById("custom-placeholder").value = defaultPlaceholder;
      document.getElementById("custom-label").value = defaultLabel;
      document.getElementById("field-required").checked = false;
    };

    // Open the modal
    this.nexaUI.nexaModal.open("element-properties-modal");

    // Setup additional functionality after modal opens
    setTimeout(() => {
      // Add reset button manually since NexaUI doesn't have this built-in
      const modalFooter = document.querySelector(
        "#element-properties-modal .modal-footer"
      );
      if (modalFooter) {
        const resetBtn = document.createElement("button");
        resetBtn.type = "button";
        resetBtn.className = "nx-btn-secondary";
        resetBtn.innerHTML = `<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 6px; font-size: 16px;">refresh</span>Reset to Default`;
        resetBtn.onclick = () => window.resetElementProperties();
        modalFooter.insertBefore(resetBtn, modalFooter.firstChild);
      }

      // Initialize options management for select elements
      if (
        element.id === "select" ||
        element.id === "checkbox-group" ||
        element.id === "radio-group"
      ) {
        this.initializeOptionsManagement(element, existingProps);
      }

      // Focus first input
      document.getElementById("custom-name")?.focus();
    }, 100);
  }

  /**
   * Get default label for element type (Enhanced based on NexaInteract.js)
   */
  getDefaultLabelForElement(elementId) {
    const labelMap = {
      // Basic inputs
      text: "Text Input",
      email: "Email Address",
      password: "Password",
      number: "Number",
      tel: "Phone Number",
      url: "Website URL",
      search: "Search",
      textarea: "Message",

      // Choice elements
      select: "Select Option",
      "checkbox-group": "Choose Options",
      "radio-group": "Select One",
      switch: "Toggle Option",

      // Date/Time elements
      date: "Date",
      "datetime-local": "Date & Time",
      time: "Time",
      month: "Month",
      week: "Week",

      // File elements
      file: "Choose File",
      "image-upload": "Upload Image",
      "multiple-file": "Choose Files",

      // Icon inputs
      "text-icon": "Name",
      "email-icon": "Email Address",
      "password-icon": "Password",
      "search-icon": "Search",
      "phone-icon": "Phone Number",
      "url-icon": "Website URL",

      // Advanced elements
      range: "Range Value",
      color: "Color",
      "input-group": "Input Group",
    };

    return labelMap[elementId] || "Field Label";
  }

  /**
   * Get default placeholder for element type (Enhanced based on NexaInteract.js)
   */
  getDefaultPlaceholderForElement(elementId) {
    const placeholderMap = {
      // Basic inputs
      text: "Enter text",
      email: "Enter email address",
      password: "Enter password",
      number: "Enter number",
      tel: "Enter phone number",
      url: "Enter URL",
      search: "Search...",
      textarea: "Enter your message here...",

      // Choice elements
      select: "Choose option...",
      "checkbox-group": "Select one or more options",
      "radio-group": "Select one option",
      switch: "Toggle on/off",

      // Date/Time elements
      date: "Select date",
      "datetime-local": "Select date and time",
      time: "Select time",
      month: "Select month",
      week: "Select week",

      // File elements
      file: "Choose file...",
      "image-upload": "Choose image...",
      "multiple-file": "Choose files...",

      // Icon inputs
      "text-icon": "Enter your name",
      "email-icon": "Enter email address",
      "password-icon": "Enter password",
      "search-icon": "Search...",
      "phone-icon": "Enter phone number",
      "url-icon": "Enter website URL",

      // Advanced elements
      range: "Adjust value",
      color: "Pick a color",
      "input-group": "Enter value",
    };

    return placeholderMap[elementId] || "Enter value";
  }

  /**
   * Initialize options management for select, checkbox, and radio elements
   */
  initializeOptionsManagement(element, existingProps) {
    const optionsList = document.getElementById("options-list");
    const addOptionBtn = document.getElementById("add-option-btn");

    // Get existing options or create defaults
    const existingOptions =
      existingProps.options || this.getDefaultOptionsForElement(element.id);

    // Render existing options
    existingOptions.forEach((option, index) => {
      this.addOptionRow(optionsList, option.text, option.value, index);
    });

    // Add option button event
    addOptionBtn.addEventListener("click", () => {
      const currentOptions = optionsList.children.length;
      this.addOptionRow(optionsList, "", "", currentOptions);
    });
  }

  /**
   * Get default options for element types
   */
  getDefaultOptionsForElement(elementId) {
    const defaultOptions = {
      select: [
        { text: "Choose option...", value: "" },
        { text: "Option 1", value: "option1" },
        { text: "Option 2", value: "option2" },
        { text: "Option 3", value: "option3" },
      ],
      "checkbox-group": [
        { text: "Option 1", value: "option1" },
        { text: "Option 2", value: "option2" },
        { text: "Option 3", value: "option3" },
      ],
      "radio-group": [
        { text: "Option 1", value: "option1" },
        { text: "Option 2", value: "option2" },
        { text: "Option 3", value: "option3" },
      ],
    };
    return defaultOptions[elementId] || [];
  }

  /**
   * Add option row to the options list
   */
  addOptionRow(container, text = "", value = "", index = 0) {
    const optionRow = document.createElement("div");
    optionRow.className = "option-row";
    optionRow.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 12px;
      padding: 12px;
      border: 1px solid #e1e5e9;
      border-radius: 6px;
      background: white;
    `;

    optionRow.innerHTML = `
      <div style="flex: 1;">
        <input type="text" class="form-control option-text"
               placeholder="Option Text"
               value="${text}"
               style="margin-bottom: 6px;">
        <input type="text" class="form-control option-value"
               placeholder="Option Value"
               value="${value}">
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <button type="button" class="nx-btn-secondary move-up-btn" 
                style="font-size: 10px; padding: 4px 6px; min-width: auto;" 
                title="Move Up">
          <span class="material-symbols-outlined" style="font-size: 12px;">keyboard_arrow_up</span>
        </button>
        <button type="button" class="nx-btn-secondary move-down-btn" 
                style="font-size: 10px; padding: 4px 6px; min-width: auto;" 
                title="Move Down">
          <span class="material-symbols-outlined" style="font-size: 12px;">keyboard_arrow_down</span>
        </button>
        <button type="button" class="nx-btn-danger remove-option-btn" 
                style="font-size: 10px; padding: 4px 6px; min-width: auto;" 
                title="Remove Option">
          <span class="material-symbols-outlined" style="font-size: 12px;">delete</span>
        </button>
      </div>
    `;

    container.appendChild(optionRow);

    // Add event listeners for this row
    this.setupOptionRowEvents(optionRow, container);
  }

  /**
   * Setup event listeners for option row
   */
  setupOptionRowEvents(optionRow, container) {
    const moveUpBtn = optionRow.querySelector(".move-up-btn");
    const moveDownBtn = optionRow.querySelector(".move-down-btn");
    const removeBtn = optionRow.querySelector(".remove-option-btn");

    // Move up
    moveUpBtn.addEventListener("click", () => {
      const prevSibling = optionRow.previousElementSibling;
      if (prevSibling) {
        container.insertBefore(optionRow, prevSibling);
      }
    });

    // Move down
    moveDownBtn.addEventListener("click", () => {
      const nextSibling = optionRow.nextElementSibling;
      if (nextSibling) {
        container.insertBefore(nextSibling, optionRow);
      }
    });

    // Remove
    removeBtn.addEventListener("click", () => {
      if (container.children.length > 1) {
        // Keep at least one option
        optionRow.remove();
      } else {
        // Leave empty - do nothing if only one option
      }
    });
  }

  /**
   * Generate HTML form from selected elements
   */
  generateFormFromSelection(
    selectedElements,
    elementCustomIcons,
    elementCustomProperties
  ) {
    try {
      console.log("🚀 Generating form from selection:", selectedElements);

      // Enhanced validation - check target element first
      if (!this.interactions?.targetElement && !this.targetElement) {
        console.warn("⚠️ No target element found for form insertion");
        return;
      }

      // Filter out removed elements
      const activeElements = selectedElements.filter((el) => !el.removed);

      if (activeElements.length === 0) {
        console.warn("No form elements selected for generation");
        return;
      }

      console.log(`✅ Generating form with ${activeElements.length} elements`);

      // Get modal reference for configuration
      const modal = document.getElementById("nexa-form-builder-modal");
      if (!modal) {
        console.warn("⚠️ Form builder modal not found");
        return;
      }

      // Get batch configuration from modal elements
      const batchSize = modal.querySelector("#batch-size")?.value || "";
      const batchLayout =
        modal.querySelector("#batch-layout")?.value || "vertical";
      const batchSpacing =
        modal.querySelector("#batch-spacing")?.value || "normal";
      const batchFloating =
        modal.querySelector("#batch-floating")?.checked || false;
      const batchValidation =
        modal.querySelector("#batch-validation")?.checked || false;

      console.log("📋 Form configuration:", {
        size: batchSize,
        layout: batchLayout,
        spacing: batchSpacing,
        floating: batchFloating,
        validation: batchValidation,
      });

      // Generate form HTML using improved method
      let formHTML = this.generateFormHTML(
        activeElements,
        elementCustomIcons,
        elementCustomProperties,
        {
          size: batchSize,
          layout: batchLayout,
          spacing: batchSpacing,
          floating: batchFloating,
          validation: batchValidation,
        }
      );

      // Insert form into target element
      this.insertGeneratedForm(formHTML);

      // Close modal using NexaUI
      if (this.nexaUI && this.nexaUI.nexaModal) {
        this.nexaUI.nexaModal.close("nexa-form-builder-modal");
      }

      // Show success notification
      console.log("✅ Form generated and inserted successfully!");

      // Enhanced notification handling
      if (this.interactions?.showNotification) {
        this.interactions.showNotification(
          "Form generated successfully!",
          "success"
        );
      } else if (window.nexaNexaReactiveInstance?.showNotification) {
        window.nexaNexaReactiveInstance.showNotification(
          "Form generated successfully!",
          "success"
        );
      }
    } catch (error) {
      console.error("❌ Error generating form:", error);
    }
  }

  /**
   * Generate HTML for the form based on selected elements
   */
  generateFormHTML(elements, customIcons, customProperties, config) {
    console.log("🏗️ Building form HTML with config:", config);

    // Generate form container with inline styles based on layout
    let formHTML = '<form class="nexa-generated-form"';

    // Apply layout styles directly (following NexaInteract.js pattern)
    switch (config.layout) {
      case "horizontal":
        formHTML += ' style="display: flex; gap: 1rem; flex-wrap: wrap;"';
        break;
      case "grid-2":
        formHTML +=
          ' style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;"';
        break;
      case "grid-3":
        formHTML +=
          ' style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;"';
        break;
      case "inline":
        formHTML += ' style="display: flex; gap: 0.5rem; align-items: end;"';
        break;
      default: // vertical
        const spacing =
          config.spacing === "compact"
            ? "0.5rem"
            : config.spacing === "spacious"
            ? "2rem"
            : "1rem";
        formHTML += ` style="display: flex; flex-direction: column; gap: ${spacing};"`;
    }

    formHTML += ">";

    // Generate each selected element
    elements.forEach((element, index) => {
      const elementHTML = this.generateElementHTML(
        element,
        customIcons,
        customProperties,
        config,
        index
      );
      formHTML += elementHTML;
    });

    // Add submit button with consistent styling
    const submitSpacing =
      config.spacing === "compact"
        ? "0.5rem"
        : config.spacing === "spacious"
        ? "2rem"
        : "1rem";

    formHTML += `
      <div class="form-group" style="margin-top: ${submitSpacing};">
        <button type="submit" class="nx-btn-primary ${config.size || ""}">
          <i class="material-symbols-outlined" style="font-size: 18px;">send</i>
          Submit Form
        </button>
      </div>
    `;

    formHTML += "</form>";

    console.log("✅ Form HTML generated successfully");
    return formHTML;
  }

  /**
   * Generate HTML for individual form element
   */
  generateElementHTML(element, customIcons, customProperties, config, index) {
    const props = customProperties.get(element.instanceId) || {};
    const customIcon = customIcons.get(element.instanceId);

    const label =
      props.customLabel || this.getDefaultLabelForElement(element.id);
    const placeholder =
      props.customPlaceholder ||
      this.getDefaultPlaceholderForElement(element.id);
    const required = props.required ? "required" : "";
    const fieldId = `field_${element.id}_${index}`;

    let elementHTML = "";

    // Form group wrapper
    elementHTML += `<div class="form-group">`;

    // Label (if not floating)
    if (!config.floating) {
      elementHTML += `<label for="${fieldId}" class="form-label">${label}${
        required ? ' <span class="text-danger">*</span>' : ""
      }</label>`;
    }

    // Generate input based on element type
    switch (element.id) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "tel":
      case "url":
      case "search":
        elementHTML += this.generateInputElement(
          element.id,
          fieldId,
          placeholder,
          required,
          config,
          customIcon
        );
        break;
      case "textarea":
        elementHTML += this.generateTextareaElement(
          fieldId,
          placeholder,
          required,
          config
        );
        break;
      case "select":
        elementHTML += this.generateSelectElement(
          fieldId,
          required,
          config,
          props.options
        );
        break;
      case "checkbox-group":
        elementHTML += this.generateCheckboxGroup(
          fieldId,
          required,
          props.options
        );
        break;
      case "radio-group":
        elementHTML += this.generateRadioGroup(
          fieldId,
          required,
          props.options
        );
        break;
      case "date":
      case "datetime-local":
      case "time":
      case "month":
      case "week":
        elementHTML += this.generateDateTimeElement(
          element.id,
          fieldId,
          required,
          config
        );
        break;
      case "file":
      case "image-upload":
      case "multiple-file":
        elementHTML += this.generateFileElement(
          element.id,
          fieldId,
          required,
          config
        );
        break;
      case "range":
        elementHTML += this.generateRangeElement(fieldId, required, config);
        break;
      case "color":
        elementHTML += this.generateColorElement(fieldId, required, config);
        break;
      // Icon input elements
      case "text-icon":
        elementHTML += this.generateInputElement(
          "text",
          fieldId,
          placeholder,
          required,
          config,
          customIcon || "person"
        );
        break;
      case "email-icon":
        elementHTML += this.generateInputElement(
          "email",
          fieldId,
          placeholder,
          required,
          config,
          customIcon || "email"
        );
        break;
      case "password-icon":
        elementHTML += this.generateInputElement(
          "password",
          fieldId,
          placeholder,
          required,
          config,
          customIcon || "lock"
        );
        break;
      case "search-icon":
        elementHTML += this.generateInputElement(
          "search",
          fieldId,
          placeholder,
          required,
          config,
          customIcon || "search"
        );
        break;
      case "phone-icon":
        elementHTML += this.generateInputElement(
          "tel",
          fieldId,
          placeholder,
          required,
          config,
          customIcon || "phone"
        );
        break;
      case "url-icon":
        elementHTML += this.generateInputElement(
          "url",
          fieldId,
          placeholder,
          required,
          config,
          customIcon || "link"
        );
        break;
      default:
        elementHTML += this.generateInputElement(
          "text",
          fieldId,
          placeholder,
          required,
          config,
          customIcon
        );
    }

    // Validation message placeholder
    if (config.validation) {
      elementHTML += `<div class="invalid-feedback" id="${fieldId}_feedback"></div>`;
    }

    elementHTML += "</div>";

    return elementHTML;
  }

  /**
   * Generate input element HTML
   */
  generateInputElement(type, id, placeholder, required, config, customIcon) {
    const sizeClass = config.size || "form-control";

    if (customIcon) {
      return `
        <div class="input-group" style="display: flex; align-items: center; border: 1px solid #ced4da; border-radius: 6px; overflow: hidden;">
          <span class="input-group-text" style="
            background: #f8f9fa;
            border: none;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-right: 1px solid #dee2e6;
            color: #6c757d;
          ">
            <span class="material-symbols-outlined" style="font-size: 18px;">${customIcon}</span>
          </span>
          <input type="${type}" id="${id}" name="${id}" 
                 style="
                   flex: 1;
                   border: none;
                   padding: 12px 16px;
                   outline: none;
                   font-size: 14px;
                   color: #495057;
                   background: white;
                 "
                 placeholder="${placeholder}" ${required}>
        </div>`;
    } else {
      return `<input type="${type}" id="${id}" name="${id}" 
               style="
                 width: 100%;
                 padding: 12px 16px;
                 border: 1px solid #ced4da;
                 border-radius: 6px;
                 outline: none;
                 font-size: 14px;
                 color: #495057;
                 transition: border-color 0.2s ease;
               " 
               onFocus="this.style.borderColor='#007bff'; this.style.boxShadow='0 0 0 2px rgba(0,123,255,.25)'" 
               onBlur="this.style.borderColor='#ced4da'; this.style.boxShadow='none'"
               placeholder="${placeholder}" ${required}>`;
    }
  }

  /**
   * Generate textarea element HTML
   */
  generateTextareaElement(id, placeholder, required, config) {
    return `<textarea id="${id}" name="${id}" rows="4" 
             style="
               width: 100%;
               padding: 12px 16px;
               border: 1px solid #ced4da;
               border-radius: 6px;
               outline: none;
               font-size: 14px;
               color: #495057;
               resize: vertical;
               transition: border-color 0.2s ease;
               font-family: inherit;
             "
             onFocus="this.style.borderColor='#007bff'; this.style.boxShadow='0 0 0 2px rgba(0,123,255,.25)'" 
             onBlur="this.style.borderColor='#ced4da'; this.style.boxShadow='none'"
             placeholder="${placeholder}" ${required}></textarea>`;
  }

  /**
   * Generate select element HTML
   */
  generateSelectElement(id, required, config, options) {
    let selectHTML = `<select id="${id}" name="${id}" ${required}
      style="
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        outline: none;
        font-size: 14px;
        color: #495057;
        background: white;
        cursor: pointer;
        transition: border-color 0.2s ease;
      "
      onFocus="this.style.borderColor='#007bff'; this.style.boxShadow='0 0 0 2px rgba(0,123,255,.25)'" 
      onBlur="this.style.borderColor='#ced4da'; this.style.boxShadow='none'">`;

    if (options && options.length > 0) {
      options.forEach((option) => {
        selectHTML += `<option value="${option.value}">${option.text}</option>`;
      });
    } else {
      selectHTML += `<option value="">Choose option...</option>`;
      selectHTML += `<option value="option1">Option 1</option>`;
      selectHTML += `<option value="option2">Option 2</option>`;
      selectHTML += `<option value="option3">Option 3</option>`;
    }

    selectHTML += "</select>";
    return selectHTML;
  }

  /**
   * Generate checkbox group HTML
   */
  generateCheckboxGroup(id, required, options) {
    let checkboxHTML = "";
    const checkboxOptions = options || [
      { text: "Option 1", value: "option1" },
      { text: "Option 2", value: "option2" },
      { text: "Option 3", value: "option3" },
    ];

    checkboxOptions.forEach((option, index) => {
      const checkboxId = `${id}_${index}`;
      checkboxHTML += `
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
        ">
          <input type="checkbox" id="${checkboxId}" name="${id}[]" 
                value="${option.value}" 
                style="
                  width: 16px;
                  height: 16px;
                  cursor: pointer;
                  accent-color: #007bff;
                " ${required && index === 0 ? "required" : ""}>
          <label for="${checkboxId}" style="
            font-size: 14px;
            color: #495057;
            cursor: pointer;
            user-select: none;
          ">${option.text}</label>
        </div>`;
    });

    return checkboxHTML;
  }

  /**
   * Generate radio group HTML
   */
  generateRadioGroup(id, required, options) {
    let radioHTML = "";
    const radioOptions = options || [
      { text: "Option 1", value: "option1" },
      { text: "Option 2", value: "option2" },
      { text: "Option 3", value: "option3" },
    ];

    radioOptions.forEach((option, index) => {
      const radioId = `${id}_${index}`;
      radioHTML += `
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
        ">
          <input type="radio" id="${radioId}" name="${id}" 
                value="${option.value}" 
                style="
                  width: 16px;
                  height: 16px;
                  cursor: pointer;
                  accent-color: #007bff;
                " ${required}>
          <label for="${radioId}" style="
            font-size: 14px;
            color: #495057;
            cursor: pointer;
            user-select: none;
          ">${option.text}</label>
        </div>`;
    });

    return radioHTML;
  }

  /**
   * Generate date/time element HTML
   */
  generateDateTimeElement(type, id, required, config) {
    return `<input type="${type}" id="${id}" name="${id}" ${required}
      style="
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        outline: none;
        font-size: 14px;
        color: #495057;
        transition: border-color 0.2s ease;
        cursor: pointer;
      "
      onFocus="this.style.borderColor='#007bff'; this.style.boxShadow='0 0 0 2px rgba(0,123,255,.25)'" 
      onBlur="this.style.borderColor='#ced4da'; this.style.boxShadow='none'">`;
  }

  /**
   * Generate file element HTML
   */
  generateFileElement(type, id, required, config) {
    const multiple = type === "multiple-file" ? "multiple" : "";
    const accept = type === "image-upload" ? 'accept="image/*"' : "";

    return `<input type="file" id="${id}" name="${id}" ${multiple} ${accept} ${required}
      style="
        width: 100%;
        padding: 12px 16px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        outline: none;
        font-size: 14px;
        color: #495057;
        background: white;
        cursor: pointer;
        transition: border-color 0.2s ease;
      "
      onFocus="this.style.borderColor='#007bff'; this.style.boxShadow='0 0 0 2px rgba(0,123,255,.25)'" 
      onBlur="this.style.borderColor='#ced4da'; this.style.boxShadow='none'">`;
  }

  /**
   * Generate range element HTML
   */
  generateRangeElement(id, required, config) {
    return `<input type="range" id="${id}" name="${id}" min="0" max="100" ${required}
      style="
        width: 100%;
        height: 6px;
        background: #ddd;
        border-radius: 3px;
        outline: none;
        cursor: pointer;
        accent-color: #007bff;
      ">`;
  }

  /**
   * Generate color element HTML
   */
  generateColorElement(id, required, config) {
    return `<input type="color" id="${id}" name="${id}" ${required}
      style="
        width: 60px;
        height: 40px;
        border: 1px solid #ced4da;
        border-radius: 6px;
        outline: none;
        cursor: pointer;
        background: white;
      ">`;
  }

  /**
   * Get layout CSS class based on configuration
   */
  getLayoutClass(layout) {
    const layoutClasses = {
      vertical: "form-vertical",
      horizontal: "form-horizontal row",
      "grid-2": "form-grid form-grid-2",
      "grid-3": "form-grid form-grid-3",
      inline: "form-inline",
    };
    return layoutClasses[layout] || "form-vertical";
  }

  /**
   * Get spacing CSS class based on configuration
   */
  getSpacingClass(spacing) {
    const spacingClasses = {
      compact: "form-spacing-compact",
      normal: "form-spacing-normal",
      spacious: "form-spacing-spacious",
    };
    return spacingClasses[spacing] || "form-spacing-normal";
  }

  /**
   * Insert generated form into target element (Following NexaInteract.js pattern)
   */
  insertGeneratedForm(formHTML) {
    try {
      // Get target element with priority order
      const targetElement =
        this.interactions?.targetElement ||
        this.targetElement ||
        document.querySelector(".ex-explorer-content") ||
        document.body;

      console.log("🎯 Target element for form insertion:", targetElement);

      if (!targetElement) {
        throw new Error("No valid target element found for form insertion");
      }

      // Simple and direct insertion following NexaInteract.js pattern
      if (targetElement.isConnected) {
        // Direct insertion using insertAdjacentHTML (more reliable)
        targetElement.insertAdjacentHTML("beforeend", formHTML);
        console.log(
          "✅ Form inserted successfully into target element:",
          targetElement.tagName
        );

        // Add some visual feedback
        const insertedForm = targetElement.querySelector(
          ".nexa-generated-form:last-child"
        );
        if (insertedForm) {
          // Add a subtle animation to show the form was inserted
          insertedForm.style.opacity = "0";
          insertedForm.style.transform = "translateY(20px)";
          insertedForm.style.transition =
            "opacity 0.3s ease, transform 0.3s ease";

          // Trigger animation
          setTimeout(() => {
            insertedForm.style.opacity = "1";
            insertedForm.style.transform = "translateY(0)";
          }, 10);
        }
      } else {
        throw new Error("Target element is not connected to DOM");
      }
    } catch (error) {
      console.error("❌ Error inserting form:", error);

      // Enhanced fallback with user notification
      try {
        document.body.insertAdjacentHTML("beforeend", formHTML);
        console.warn("⚠️ Form inserted into document.body as fallback");

        // Show user notification about fallback insertion
        if (window.nexaNexaReactiveInstance?.showNotification) {
          window.nexaNexaReactiveInstance.showNotification(
            "Form inserted at page bottom due to target element issue",
            "warning"
          );
        }
      } catch (fallbackError) {
        console.error("❌ Even fallback insertion failed:", fallbackError);
      }
    }
  }

  /**
   * Open Icon Selection Modal for Form Builder using NexaUI
   */
  openIconSelectionForFormBuilder(callback) {
    // Initialize NexaUI sesuai standar
    if (!this.nexaUI) {
      this.nexaUI = NexaUI();
    }

    if (!this.nexaUI) {
      console.error("NexaUI not available");
      return;
    }

    // Popular icons for form inputs
    const formIcons = [
      // User & Personal
      "person",
      "account_circle",
      "face",
      "badge",
      "contact_page",
      // Communication
      "email",
      "phone",
      "call",
      "message",
      "chat",
      // Location & Places
      "location_on",
      "place",
      "home",
      "business",
      "apartment",
      // Actions
      "search",
      "visibility",
      "edit",
      "lock",
      "lock_open",
      // Content
      "title",
      "text_fields",
      "notes",
      "description",
      "article",
      // Time & Calendar
      "event",
      "schedule",
      "access_time",
      "date_range",
      "calendar_month",
      // Files & Upload
      "upload_file",
      "cloud_upload",
      "attach_file",
      "folder",
      "image",
      // Business & Commerce
      "payment",
      "credit_card",
      "shopping_cart",
      "receipt",
      "account_balance",
      // Settings & Tools
      "settings",
      "tune",
      "build",
      "palette",
      "category",
      // Social & Communication
      "share",
      "link",
      "public",
      "language",
      "web",
      // Security
      "security",
      "verified",
      "key",
      "password",
      "shield",
    ];

    // Create icon grid HTML
    const iconGridHTML = formIcons
      .map(
        (iconName) => `
        <button type="button" class="icon-select-btn" data-icon="${iconName}" style="
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1;
          min-height: 50px;
        " onmouseover="this.style.borderColor='#007bff'; this.style.background='#f0f8ff';" 
           onmouseout="this.style.borderColor='#e5e7eb'; this.style.background='white';">
          <span class="material-symbols-outlined" style="font-size: 20px; color: #374151;">${iconName}</span>
        </button>
      `
      )
      .join("");

    // Create modal content
    const modalContent = `
      <p style="margin-bottom: 16px; color: #6b7280;">Select an icon for your form elements:</p>
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
        gap: 8px;
        max-height: 60vh;
        overflow-y: auto;
      ">
        ${iconGridHTML}
      </div>
    `;

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "nexa-icon-selection-modal",
      styleClass: "w-700px max-w-90vw",
      label: "Choose Icon for Form Elements",
      onclick: {
        title: "Close",
        cancel: "Cancel",
        send: "closeIconSelection",
      },
      content: modalContent,
    });

    // Setup global function for closing
    window.closeIconSelection = (modalId) => {
      this.nexaUI.nexaModal.close(modalId);
    };

    // Open the modal
    this.nexaUI.nexaModal.open("nexa-icon-selection-modal");

    // Setup icon selection event handlers after modal opens
    setTimeout(() => {
      const iconButtons = document.querySelectorAll(
        "#nexa-icon-selection-modal .icon-select-btn"
      );
      iconButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const iconName = button.getAttribute("data-icon");
          callback(iconName);
          this.nexaUI.nexaModal.close("nexa-icon-selection-modal");
        });
      });
    }, 100);

    console.log("✅ Icon selection modal opened with NexaUI");
  }

  /**
   * Setup events for Form Builder Modal
   * This method uses the imported functionality
   */
  setupFormBuilderEvents() {
    try {
      // Call the imported function with this context
      setupFormBuilderEventsExtended.call(this);

      console.log("Form Builder Events Setup Complete");
    } catch (error) {
      console.error("Error in form builder events:", error);
    }
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = createForm;
} else if (typeof window !== "undefined") {
  window.createForm = createForm;
}

export { createForm };
