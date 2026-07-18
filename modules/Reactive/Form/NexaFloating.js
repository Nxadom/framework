export class NexaFloating {
  constructor(config, options = {}) {
    this.config = config;
    this.options = {
      formById: true, // Default: tampilkan footer/submit button
      footer: true, // Default: tampilkan footer/submit button
      ...options, // Merge with user options
    };
    this.formId = this.options.formById;
    this.init();
  }

  init() {
    this.generateForm();
  }



  generateForm() {
    const formHTML = this.buildFormHTML();
    this.formElement = this.createFormElement(formHTML);
    this.attachEventListeners();
  }

  buildFormHTML() {
    const { formStyele } = this.config;
    const isGrid = formStyele.layout?.startsWith("grid");

    const formClass = formStyele.floating
      ? "form-nexa nexa-floating-form"
      : "form-nexa";
    let formHTML = `<form id="${this.formId}" class="${formClass}">`;

    if (isGrid) {
      formHTML += `<div class="nx-row">`;
    }

    // Generate form fields
    for (const [fieldName, fieldType] of Object.entries(
      this.config.formTypes
    )) {
      const fieldHTML = this.generateField(fieldName, fieldType);
      formHTML += fieldHTML;
    }

    if (isGrid) {
      formHTML += `</div>`;
    }

    // Generate submit button (only if footer is enabled)
    if (this.options.footer) {
      formHTML += this.generateSubmitButton();
    }
    formHTML += `</form>`;

    return formHTML;
  }

  generateField(fieldName, fieldType) {
    const { formStyele } = this.config;
    const placeholder = this.getPlaceholder(fieldName);
    const icon = this.getIcon(fieldName);
    const gridClass = this.getGridClass(fieldName);
    const isFloating = formStyele.floating;
    const size = formStyele.size || "form-nexa-control";

    let fieldHTML = "";

    if (gridClass) {
      fieldHTML += `<div class="${gridClass}">`;
    }

    // Special handling for checkbox, radio, switch, and file - only use grid, no floating or icon wrapper
    if (
      fieldType === "checkbox" ||
      fieldType === "radio" ||
      fieldType === "switch" ||
      fieldType === "file"
    ) {
      let inputHTML = "";

      if (fieldType === "checkbox") {
        inputHTML = this.generateCheckboxInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
      } else if (fieldType === "radio") {
        inputHTML = this.generateRadioInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
      } else if (fieldType === "switch") {
        inputHTML = this.generateSwitchInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
      } else if (fieldType === "file") {
        inputHTML = this.generateFileInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
      }

      fieldHTML += inputHTML;

      if (gridClass) {
        fieldHTML += `</div>`; // Close grid column
      }

      return fieldHTML;
    }

    // Wrapper for floating or regular form (for non-checkbox inputs)
    const wrapperClass = isFloating ? "form-nexa-floating" : "form-nexa-group";
    fieldHTML += `<div class="${wrapperClass}">`;

    // For floating mode, add icon container here
    if (isFloating && icon) {
      fieldHTML += `<div class="form-nexa-icon">`;
    }

    // Generate input based on type
    let inputHTML = "";
    switch (fieldType) {
      case "text":
        inputHTML = this.generateTextInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "email":
        inputHTML = this.generateEmailInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "password":
        inputHTML = this.generatePasswordInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "number":
        inputHTML = this.generateNumberInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "tel":
        inputHTML = this.generateTelInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "url":
        inputHTML = this.generateUrlInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "date":
        inputHTML = this.generateDateInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "datetime-local":
        inputHTML = this.generateDateTimeInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "time":
        inputHTML = this.generateTimeInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "month":
        inputHTML = this.generateMonthInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "week":
        inputHTML = this.generateWeekInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "color":
        inputHTML = this.generateColorInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "range":
        inputHTML = this.generateRangeInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;

      case "textarea":
        inputHTML = this.generateTextareaInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "hidden":
        inputHTML = this.generateHiddenInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "select":
        inputHTML = this.generateSelectInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      case "search":
        inputHTML = this.generateSearchInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
        break;
      default:
        inputHTML = this.generateTextInput(
          fieldName,
          placeholder,
          size,
          isFloating
        );
    }

    // Add label and input with correct structure based on floating mode
    if (isFloating) {
      // Floating labels: input first, then label inside icon container
      if (icon) {
        fieldHTML += inputHTML;
        fieldHTML += `<i class="material-symbols-outlined">${icon}</i>`;
        fieldHTML += `<label for="${fieldName}">${placeholder}</label>`;
        fieldHTML += `</div>`; // Close form-nexa-icon
      } else {
        fieldHTML += inputHTML;
        fieldHTML += `<label for="${fieldName}">${placeholder}</label>`;
      }
    } else {
      // Non-floating: label first, then input (label outside icon container)
      fieldHTML += `<label for="${fieldName}">${placeholder}</label>`;
      if (icon) {
        fieldHTML += `<div class="form-nexa-icon">`;
        fieldHTML += inputHTML;
        fieldHTML += `<i class="material-symbols-outlined">${icon}</i>`;
        fieldHTML += `</div>`; // Close form-nexa-icon
      } else {
        fieldHTML += inputHTML;
      }
    }

    // Add validation error container
    // if (formStyele.validation) {
    //   fieldHTML += `<small id="errors_${fieldName}" class="error-message"></small>`;
    // }

    fieldHTML += `</div>`; // Close form-nexa-floating/form-nexa

    if (gridClass) {
      fieldHTML += `</div>`; // Close grid column
    }

    return fieldHTML;
  }

  generateTextInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="text" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateSelectInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    let selectHTML = `<select id="${fieldName}" name="${fieldName}" class="${size}">`;

    // Always use "Pilihan" as default option text
    selectHTML += `<option value="">Pilihan</option>`;

    if (options) {
      options.forEach((option) => {
        selectHTML += `<option value="${option.value}">${option.label}</option>`;
      });
    }

    selectHTML += `</select>`;
    return selectHTML;
  }

  generateSearchInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    let searchHTML = `<div class="form-nexa-search">`;
    searchHTML += `<div class="form-nexa-search-container">`;
    searchHTML += `<input type="text" id="${fieldName}" name="${fieldName}" class="form-nexa-control ${size}" ${placeholderAttr} autocomplete="off" />`;
    searchHTML += `<div class="form-nexa-search-dropdown">`;
    searchHTML += `<div class="form-nexa-search-items">`;

    const options = this.getOptions(fieldName);
    if (options) {
      options.forEach((option) => {
        searchHTML += `<div class="form-nexa-search-item" data-value="${option.value}">${option.label}</div>`;
      });
    }

    searchHTML += `</div></div></div></div>`;
    return searchHTML;
  }

  generateEmailInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="email" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generatePasswordInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="password" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateNumberInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    const options = this.getOptions(fieldName);
    let attributes = "";

    if (options) {
      if (options.min !== undefined) attributes += ` min="${options.min}"`;
      if (options.max !== undefined) attributes += ` max="${options.max}"`;
      if (options.step !== undefined) attributes += ` step="${options.step}"`;
    }

    return `<input type="number" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr}${attributes} />`;
  }

  generateTelInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="tel" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateUrlInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="url" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateDateInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="date" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateDateTimeInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="datetime-local" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateTimeInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="time" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateMonthInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="month" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateWeekInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    return `<input type="week" id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr} />`;
  }

  generateColorInput(fieldName, placeholder, size, isFloating) {
    return `<input type="color" id="${fieldName}" name="${fieldName}" class="${size}" />`;
  }

  generateRangeInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    let attributes = "";

    if (options) {
      if (options.min !== undefined) attributes += ` min="${options.min}"`;
      if (options.max !== undefined) attributes += ` max="${options.max}"`;
      if (options.step !== undefined) attributes += ` step="${options.step}"`;
      if (options.value !== undefined)
        attributes += ` value="${options.value}"`;
    }

    return `<input type="range" id="${fieldName}" name="${fieldName}" class="form-nexa-range"${attributes} />`;
  }

  generateFileInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    console.log('aaaaaaaaaaaaaaaaaaaaaaaxxxxxxxxxxxxxxxxxxxxxx', this.config)
    let acceptAttribute = "";
    let multipleAttribute = "";

    if (options) {
      if (options.accept) acceptAttribute = options.accept;
      if (options.multiple) multipleAttribute = "multiple";
    }
    let fileHTML = `
    <div class="nx-media nx-fileupload" id="fileUpload-${fieldName}">
      <img
        style="height: 50px; width: 50px"
        src=""
        alt="Casey Horner"
        class="nx-media-img"
        id="preview-image"
      />
      <i
        id="fa-icon"
        class="fas fa-file"
        style="
          display: none;
          height: 50px;
          width: 50px;
          font-size: 32px;
          color: #666;
          align-items: center;
          justify-content: center;
        "
      ></i>
      <input type="file" id="${fieldName}" name="${fieldName}" class="form-nexa-file-input" ${multipleAttribute} />
      <div class="nx-media-body">
        <h5>File Upload</h5>
        <p id="nx-file-type">All file types supported</p>
        <small id="file-name" style="color: #666"></small>
      </div>
    </div>`;

    // Schedule fileUpload to run after DOM is updated
    setTimeout(() => {
      this.fileUpload(
        this.config.fileUpload[fieldName],
        fieldName
      );
    }, 0);

    return fileHTML;
  }
  fileUpload(data, fieldName) {
    const forImages = "http://localhost/dev/assets/images/500px.png";
    const fileInput = document.getElementById(fieldName);
    const previewImage = document.getElementById("preview-image");
    if (previewImage) {
      previewImage.src = forImages;
    }
    const faIcon = document.getElementById("fa-icon");
    const fileName = document.getElementById("file-name");
    const fileTypeDisplay = document.getElementById("nx-file-type");
    const defaultSrc = forImages;

    // Set accept attribute from data parameter
    if (data && data.accept) {
      if (fileInput) {
        fileInput.setAttribute("accept", data.accept);
      }
      // Display accepted file types
      if (fileTypeDisplay) {
        fileTypeDisplay.textContent = `Type ${data.accept}`;
      }
    } else {
      if (fileTypeDisplay) {
        fileTypeDisplay.textContent = "All file types supported";
      }
    }

    // Validation function for file types
    function validateFileType(file) {
      if (!data || !data.accept) {
        return true; // Allow all files if no accept specified
      }

      const allowedExtensions = data.accept
        .split(",")
        .map((ext) => ext.trim().toLowerCase());
      const fileName = file.name.toLowerCase();
      const fileExtension = "." + fileName.split(".").pop();

      return allowedExtensions.includes(fileExtension);
    }
    // File type to FontAwesome icon mapping
    const fileIcons = {
      // Images
      jpg: "fas fa-file-image",
      jpeg: "fas fa-file-image",
      png: "fas fa-file-image",
      gif: "fas fa-file-image",
      webp: "fas fa-file-image",
      bmp: "fas fa-file-image",
      svg: "fas fa-file-image",

      // Documents
      pdf: "fas fa-file-pdf",
      doc: "fas fa-file-word",
      docx: "fas fa-file-word",
      xls: "fas fa-file-excel",
      xlsx: "fas fa-file-excel",
      ppt: "fas fa-file-powerpoint",
      pptx: "fas fa-file-powerpoint",
      txt: "fas fa-file-alt",
      rtf: "fas fa-file-alt",

      // Data & Config
      xml: "fas fa-file-code",
      yaml: "fas fa-file-code",
      yml: "fas fa-file-code",
      json: "fas fa-file-code",
      csv: "fas fa-file-csv",

      // Archives
      zip: "fas fa-file-archive",
      rar: "fas fa-file-archive",
      "7z": "fas fa-file-archive",
      tar: "fas fa-file-archive",
      gz: "fas fa-file-archive",

      // Audio
      mp3: "fas fa-file-audio",
      wav: "fas fa-file-audio",
      flac: "fas fa-file-audio",
      aac: "fas fa-file-audio",
      ogg: "fas fa-file-audio",

      // Video
      mp4: "fas fa-file-video",
      avi: "fas fa-file-video",
      mov: "fas fa-file-video",
      wmv: "fas fa-file-video",
      flv: "fas fa-file-video",
      mkv: "fas fa-file-video",
      webm: "fas fa-file-video",
    };

    // Color mapping for file types
    const fileColors = {
      // Images
      jpg: "#4CAF50",
      jpeg: "#4CAF50",
      png: "#4CAF50",
      gif: "#4CAF50",
      webp: "#4CAF50",
      bmp: "#4CAF50",
      svg: "#4CAF50",

      // Documents
      pdf: "#F44336",
      doc: "#2196F3",
      docx: "#2196F3",
      xls: "#4CAF50",
      xlsx: "#4CAF50",
      ppt: "#FF9800",
      pptx: "#FF9800",
      txt: "#9E9E9E",
      rtf: "#9E9E9E",

      // Data & Config
      xml: "#FF5722",
      yaml: "#FF5722",
      yml: "#FF5722",
      json: "#FFC107",
      csv: "#4CAF50",

      // Archives
      zip: "#795548",
      rar: "#795548",
      "7z": "#795548",
      tar: "#795548",
      gz: "#795548",

      // Audio
      mp3: "#E91E63",
      wav: "#E91E63",
      flac: "#E91E63",
      aac: "#E91E63",
      ogg: "#E91E63",

      // Video
      mp4: "#9C27B0",
      avi: "#9C27B0",
      mov: "#9C27B0",
      wmv: "#9C27B0",
      flv: "#9C27B0",
      mkv: "#9C27B0",
      webm: "#9C27B0",
    };

    function showImage() {
      if (previewImage) {
        previewImage.style.display = "block";
      }
      if (faIcon) {
        faIcon.style.display = "none";
      }
    }

    function showIcon(iconClass, extension) {
      if (previewImage) {
        previewImage.style.display = "none";
      }
      if (faIcon) {
        faIcon.style.display = "flex";
        faIcon.className = iconClass;

        // Apply color based on file type
        const color = fileColors[extension] || "#666";
        faIcon.style.color = color;
      }
    }
    if (!fileInput) {
      console.warn(`File input element with ID "${fieldName}" not found`);
      return;
    }

    fileInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        // Validate file type
        if (!validateFileType(file)) {
          // Show error message in nx-file-type
          if (fileTypeDisplay) {
            fileTypeDisplay.textContent = `❌ File type not allowed. Only ${data.accept} files are permitted.`;
            fileTypeDisplay.style.color = "#F44336";
          }

          // Reset input
          fileInput.value = "";
          if (fileName) {
            fileName.textContent = "";
          }
          if (previewImage) {
            previewImage.src = defaultSrc;
            previewImage.alt = "Casey Horner";
          }
          showImage();

          // Reset error message after 3 seconds
          setTimeout(() => {
            if (fileTypeDisplay) {
              fileTypeDisplay.textContent = `Type ${data.accept}`;
              fileTypeDisplay.style.color = "";
            }
          }, 3000);

          return;
        }

        if (fileName) {
          fileName.textContent = file.name;
        }

        // Get file extension
        const extension = file.name.split(".").pop().toLowerCase();

        if (file.type.startsWith("image/")) {
          // Show image preview
          const reader = new FileReader();
          reader.onload = function (e) {
            if (previewImage) {
              previewImage.src = e.target.result;
              previewImage.alt = file.name;
            }
            showImage();
          };
          reader.readAsDataURL(file);
        } else if (fileIcons[extension]) {
          // Show FontAwesome icon
          showIcon(fileIcons[extension], extension);
        } else {
          // Show default file icon
          showIcon("fas fa-file", "default");
        }
      } else {
        // Reset to default
        if (previewImage) {
          previewImage.src = defaultSrc;
          previewImage.alt = "Casey Horner";
        }
        if (fileName) {
          fileName.textContent = "";
        }
        showImage();
      }
    });
    // Click handlers
    if (previewImage) {
      previewImage.addEventListener("click", function () {
        if (fileInput) {
          fileInput.click();
        }
      });
    }

    if (faIcon) {
      faIcon.addEventListener("click", function () {
        if (fileInput) {
          fileInput.click();
        }
      });
    }
  }

  generateCheckboxInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    let checkboxHTML = "";

    // Add group label/title outside the grid
    checkboxHTML += `<div class="form-nexa-group">
      <label>${placeholder}</label>
    </div>`;
    checkboxHTML += `<div class="nx-checkbox-grid">`;

    if (options && Array.isArray(options)) {
      // Multiple checkboxes for single selection behavior
      options.forEach((option, index) => {
        const checkboxId = `${fieldName}_${index}`;
        checkboxHTML += `<div class="nx-checkbox-item">`;
        checkboxHTML += `<input type="checkbox" id="${checkboxId}" name="${fieldName}" value="${option.value}" data-label="${option.value}" class="single-select-checkbox" />`;
        checkboxHTML += `<label for="${checkboxId}">`;
        checkboxHTML += `<span class="nx-checkmark"></span>`;
        checkboxHTML += `<span class="nx-checkbox-text">${option.label}</span>`;
        checkboxHTML += `</label>`;
        checkboxHTML += `<small id="errors_${checkboxId}" class="error-message"></small>`;
        checkboxHTML += `</div>`;
      });
    } else {
      // Single checkbox (fallback)
      const value = options?.value || fieldName;
      const label = options?.label || placeholder;
      checkboxHTML += `<div class="nx-checkbox-item">`;
      checkboxHTML += `<input type="checkbox" id="${fieldName}" name="${fieldName}" value="${value}" data-label="${value}" />`;
      checkboxHTML += `<label for="${fieldName}">`;
      checkboxHTML += `<span class="nx-checkmark"></span>`;
      checkboxHTML += `<span class="nx-checkbox-text">${placeholder}</span>`;
      checkboxHTML += `</label>`;
      checkboxHTML += `<small id="errors_${fieldName}" class="error-message"></small>`;
      checkboxHTML += `</div>`;
    }

    checkboxHTML += `</div>`; // Close nx-checkbox-grid
    return checkboxHTML;
  }

  generateRadioInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    let radioHTML = "";

    // Add group label/title outside the grid
    radioHTML += `<div class="form-nexa-group">
      <label>${placeholder}</label>
    </div>`;
    radioHTML += `<div class="nx-radio-grid">`;

    if (options) {
      options.forEach((option, index) => {
        const radioId = `${fieldName}_${index}`;
        radioHTML += `<div class="nx-radio-item">`;
        radioHTML += `<input type="radio" id="${radioId}" name="${fieldName}" value="${option.value}" data-label="${option.value}" />`;
        radioHTML += `<label for="${radioId}">`;
        radioHTML += `<span class="nx-radio-mark"></span>`;
        radioHTML += `<span class="nx-radio-text">${option.label}</span>`;
        radioHTML += `</label>`;
        radioHTML += `<small id="errors_${fieldName}" class="error-message"></small>`;
        radioHTML += `</div>`;
      });
    }

    radioHTML += `</div>`; // Close nx-radio-grid
    return radioHTML;
  }

  generateSwitchInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    let switchHTML = "";

    // Add group label/title outside the grid
    switchHTML += `<div class="form-nexa-group">
      <label>${placeholder}</label>
    </div>`;
    switchHTML += `<div class="nx-switch-grid">`;

    if (options && Array.isArray(options)) {
      // Multiple switches for single selection - use radio behavior
      options.forEach((option, index) => {
        const switchId = `${fieldName}_${index}`;
        const isChecked = option.checked ? "checked" : "";
        switchHTML += `<div class="nx-switch-item">`;
        // Use radio type but styled as switch for single selection
        switchHTML += `<input type="checkbox" id="${switchId}" name="${fieldName}" value="${option.value}" data-label="${option.value}" class="single-select-switch" ${isChecked} />`;
        switchHTML += `<label for="${switchId}">`;
        switchHTML += `<span class="nx-switch"></span>`;
        switchHTML += `<span class="nx-switch-text">${option.label}</span>`;
        switchHTML += `</label>`;
        switchHTML += `<small id="errors_${switchId}" class="error-message"></small>`;
        switchHTML += `</div>`;
      });
    } else {
      // Single switch (fallback)
      const value = options?.value || fieldName;
      const label = options?.label || placeholder;
      const isChecked = options?.checked ? "checked" : "";
      switchHTML += `<div class="nx-switch-item">`;
      switchHTML += `<input type="checkbox" id="${fieldName}" name="${fieldName}" value="${value}" data-label="${value}" ${isChecked} />`;
      switchHTML += `<label for="${fieldName}">`;
      switchHTML += `<span class="nx-switch"></span>`;
      switchHTML += `<span class="nx-switch-text">${placeholder}</span>`;
      switchHTML += `</label>`;
      switchHTML += `<small id="errors_${fieldName}" class="error-message"></small>`;
      switchHTML += `</div>`;
    }

    switchHTML += `</div>`; // Close nx-switch-grid
    return switchHTML;
  }

  generateTextareaInput(fieldName, placeholder, size, isFloating) {
    const placeholderAttr = isFloating
      ? 'placeholder=" "'
      : `placeholder="${placeholder}"`;
    const options = this.getOptions(fieldName);
    let attributes = "";

    if (options) {
      if (options.rows) attributes += ` rows="${options.rows}"`;
      if (options.cols) attributes += ` cols="${options.cols}"`;
    }

    return `<textarea id="${fieldName}" name="${fieldName}" class="${size}" ${placeholderAttr}${attributes}></textarea>`;
  }

  generateHiddenInput(fieldName, placeholder, size, isFloating) {
    const options = this.getOptions(fieldName);
    const value = options?.value || "";
    return `<input type="hidden" id="${fieldName}" name="${fieldName}" value="${value}" />`;
  }

  generateSubmitButton() {
    const { formStyele } = this.config;
    const buttonType = formStyele.buttonType || "nx-btn-primary";
    const isGrid = formStyele.layout?.startsWith("grid");

    let buttonHTML = "";

    if (isGrid) {
      buttonHTML += `<div class="nx-col-12">`;
    }

    buttonHTML += `<div class="form-nexa-group" style="margin-top: 1rem;">`;
    buttonHTML += `<button type="submit" class="${buttonType} icon-button">`;
    buttonHTML += `<i class="material-symbols-outlined">save</i>`;
    buttonHTML += `<span>Simpan</span>`;
    buttonHTML += `</button>`;
    buttonHTML += `</div>`;

    if (isGrid) {
      buttonHTML += `</div>`;
    }

    return buttonHTML;
  }

  getPlaceholder(fieldName) {
    const placeholderObj = this.config.placeholder?.find(
      (p) => p.key === fieldName
    );
    return placeholderObj?.placeholder || fieldName;
  }

  getIcon(fieldName) {
    return this.config.icons?.[fieldName];
  }

  getOptions(fieldName) {
    return this.config.options?.[fieldName];
  }

  getGridClass(fieldName) {
    return this.config.formStyele?.grid?.[fieldName];
  }

  createFormElement(htmlString) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    return tempDiv.firstElementChild;
  }

  attachEventListeners() {
    if (!this.formElement) return;

    // Handle search inputs
    const searchInputs = this.formElement.querySelectorAll(
      ".form-nexa-search-input"
    );
    searchInputs.forEach((input) => {
      this.attachSearchEvents(input);
    });

    // Handle form submission
    this.formElement.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Handle floating labels for all inputs
    const inputs = this.formElement.querySelectorAll(
      'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]), select, textarea'
    );
    inputs.forEach((input) => {
      this.handleFloatingLabel(input);
    });

    // File upload is now handled directly in generateFileInput with setTimeout

    // Handle range inputs
    const rangeInputs = this.formElement.querySelectorAll(
      'input[type="range"]'
    );
    rangeInputs.forEach((rangeInput) => {
      this.attachRangeEvents(rangeInput);
    });

    // Handle checkbox and radio inputs
    const checkboxInputs = this.formElement.querySelectorAll(
      'input[type="checkbox"], input[type="radio"]'
    );
    checkboxInputs.forEach((input) => {
      this.attachCheckboxRadioEvents(input);
    });

    // Handle single-select behavior for checkboxes and switches
    this.attachSingleSelectBehavior();

 
  }

  attachSearchEvents(input) {
    const container = input.closest(".form-nexa-search-container");
    const dropdown = container.querySelector(".form-nexa-search-dropdown");
    const items = container.querySelectorAll(".form-nexa-search-item");

    input.addEventListener("focus", () => {
      container.classList.add("active");
    });

    input.addEventListener("blur", (e) => {
      // Delay hiding to allow click on items
      setTimeout(() => {
        container.classList.remove("active");
      }, 200);
    });

    input.addEventListener("input", (e) => {
      const value = e.target.value.toLowerCase();
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(value) ? "block" : "none";
      });
    });

    items.forEach((item) => {
      item.addEventListener("click", () => {
        input.value = item.textContent;
        input.setAttribute("data-value", item.getAttribute("data-value"));
        container.classList.remove("active");
        this.triggerFloatingLabel(input);
      });
    });
  }

  handleFloatingLabel(element) {
    const updateLabel = () => {
      // Smart label detection for different input structures
      let label = this.findLabelForElement(element);

      if (label && label.tagName === "LABEL") {
        if (element.value && element.value !== "") {
          label.classList.add("active");
        } else {
          label.classList.remove("active");
        }
      } else {
        console.log(`[DEBUG] No label found for element: ${element.name}`);
      }
    };

    // console.log(
    //   `[DEBUG] Setting up floating label for: ${element.name || element.id}`
    // );

    element.addEventListener("change", updateLabel);
    element.addEventListener("blur", updateLabel);
    element.addEventListener("focus", updateLabel);
    element.addEventListener("input", updateLabel); // ✅ Added input event for real-time
    element.addEventListener("keyup", updateLabel); // Additional event for safety

    // Initial check
    updateLabel();
  }

  // Smart label finder for different input structures
  findLabelForElement(element) {
    // Method 1: Standard structure - label is nextElementSibling
    let label = element.nextElementSibling;

    // If next sibling is icon, get the sibling after icon
    if (label && label.tagName === "I") {
      label = label.nextElementSibling;
    }

    // Method 2: If label found and is LABEL, return it
    if (label && label.tagName === "LABEL") {
      return label;
    }

    // Method 3: For search inputs, look for label in parent container
    const isSearchInput = element.closest(".form-nexa-search-container");
    if (isSearchInput) {
      // For search inputs, the label is typically after the entire search structure
      const searchWrapper = element.closest(".form-nexa-search");
      if (searchWrapper && searchWrapper.nextElementSibling) {
        let nextElement = searchWrapper.nextElementSibling;

        // If there's an icon after search wrapper, label is after icon
        if (nextElement && nextElement.tagName === "I") {
          nextElement = nextElement.nextElementSibling;
        }

        if (nextElement && nextElement.tagName === "LABEL") {
          return nextElement;
        }
      }

      // Alternative: look in parent floating container
      const floatingContainer = element.closest(".form-nexa-floating");
      if (floatingContainer) {
        const labelInContainer = floatingContainer.querySelector(
          `label[for="${element.name}"]`
        );
        if (labelInContainer) {
          return labelInContainer;
        }
      }
    }

    // Method 4: Generic fallback - find by 'for' attribute
    const formElement = element.closest("form") || document;
    return (
      formElement.querySelector(`label[for="${element.name}"]`) ||
      formElement.querySelector(`label[for="${element.id}"]`)
    );
  }

  triggerFloatingLabel(input) {
    // Use smart label finder for consistency
    let label = this.findLabelForElement(input);

    if (label && label.tagName === "LABEL") {
      if (input.value && input.value !== "") {
        label.classList.add("active");
      } else {
        label.classList.remove("active");
      }
    }
  }

  attachRangeEvents(rangeInput) {
    // Create value display
    const valueDisplay = document.createElement("div");
    valueDisplay.className = "form-nexa-range-value";
    valueDisplay.textContent = rangeInput.value;
    rangeInput.parentNode.insertBefore(valueDisplay, rangeInput.nextSibling);

    rangeInput.addEventListener("input", (e) => {
      valueDisplay.textContent = e.target.value;
    });

    rangeInput.addEventListener("change", (e) => {
      valueDisplay.textContent = e.target.value;
    });
  }

 

  attachCheckboxRadioEvents(input) {
    // Add change event for data handling
    input.addEventListener("change", (e) => {
      // Trigger custom validation or events
      const event = new CustomEvent("nexaInputChange", {
        detail: {
          name: input.name,
          value: input.type === "checkbox" ? input.checked : input.value,
          type: input.type,
        },
      });
      document.dispatchEvent(event);
    });

    // Ensure proper click handling
    input.addEventListener("click", (e) => {
      // Let the default behavior work
      e.stopPropagation();
    });
  }

  attachSingleSelectBehavior() {
    if (!this.formElement) {
      console.warn("No form element found for single select behavior");
      return;
    }

  
    // Handle single-select checkboxes
    const singleSelectCheckboxes = this.formElement.querySelectorAll(
      ".single-select-checkbox"
    );
  

    singleSelectCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        if (e.target.checked) {
          // Uncheck all other checkboxes with the same name
          const sameName = this.formElement.querySelectorAll(
            `input[name="${e.target.name}"].single-select-checkbox`
          );
        
          sameName.forEach((other) => {
            if (other !== e.target) {
             
              other.checked = false;
            }
          });
        }
      });
    });

    // Handle single-select switches
    const singleSelectSwitches = this.formElement.querySelectorAll(
      ".single-select-switch"
    );
   
    singleSelectSwitches.forEach((switchEl) => {
      switchEl.addEventListener("change", (e) => {
        if (e.target.checked) {
          // Uncheck all other switches with the same name
          const sameName = this.formElement.querySelectorAll(
            `input[name="${e.target.name}"].single-select-switch`
          );
        }
      });
    });
  }

  handleSubmit() {
    const formData = this.getFormData();

    if (this.config.formStyele?.validation) {
      const validation = this.validateForm(formData);
      if (!validation.isValid) {
        this.displayErrors(validation.errors);
        return;
      }
    }

    // Clear any existing errors
    this.clearErrors();

    // console.log("Form submitted:", formData);

    // Trigger custom event
    const event = new CustomEvent("nexaFormSubmit", {
      detail: { formData, formId: this.formId },
    });
    document.dispatchEvent(event);
  }

  getFormData() {
    const formData = {};
    const inputs = this.formElement.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      if (!input.name) return; // Skip inputs without names

      switch (input.type) {
        case "checkbox":
          // Handle checkboxes
          if (input.checked) {
            // Use label from data-label attribute if available, otherwise use value for checked state
            const value = input.getAttribute("data-label") || input.value;
            console.log(
              `📋 Checkbox processed: name="${input.name}", value="${
                input.value
              }", label="${input.getAttribute("data-label")}", final="${value}"`
            );

            // For single-select checkboxes and switches, store the selected value
            if (
              input.classList.contains("single-select-checkbox") ||
              input.classList.contains("single-select-switch")
            ) {
              formData[input.name] = value;
              console.log(
                `✅ Single-select stored: ${input.name} = "${value}"`
              );
            } else {
              // For regular checkboxes, use boolean or collect multiple values
              if (input.name.endsWith("[]")) {
                const fieldName = input.name.slice(0, -2); // Remove '[]' from name
                if (!formData[fieldName]) {
                  formData[fieldName] = [];
                }
                formData[fieldName].push(value);
              } else {
                formData[input.name] = input.checked;
              }
            }
          }
          break;

        case "radio":
          if (input.checked) {
            // Use label from data-label attribute if available, otherwise use value
            const value = input.getAttribute("data-label") || input.value;
            formData[input.name] = value;
            console.log(
              `📻 Radio processed: name="${input.name}", value="${
                input.value
              }", label="${input.getAttribute("data-label")}", final="${value}"`
            );
          }
          break;

        case "file":
          if (input.files.length > 0) {
            formData[input.name] = input.multiple
              ? Array.from(input.files)
              : input.files[0];
          } else {
            formData[input.name] = null;
          }
          break;

        case "text":
          if (input.classList.contains("form-nexa-search-input")) {
            formData[input.name] = {
              value: input.getAttribute("data-value") || input.value,
              label: input.value,
            };
          } else {
            formData[input.name] = input.value;
          }
          break;

        case "number":
          formData[input.name] = input.value ? parseFloat(input.value) : null;
          break;

        case "range":
          formData[input.name] = parseFloat(input.value);
          break;

        case "color":
          formData[input.name] = input.value;
          break;

        case "date":
        case "datetime-local":
        case "time":
        case "month":
        case "week":
          formData[input.name] = input.value ? new Date(input.value) : null;
          break;

        case "hidden":
          formData[input.name] = input.value;
          break;

        default:
          // Handle select, email, password, tel, url, textarea, etc.
          if (input.tagName.toLowerCase() === "select") {
            // For select elements, try to get the label of selected option
            const selectedOption = input.options[input.selectedIndex];
            const finalValue = selectedOption
              ? selectedOption.text
              : input.value;
            formData[input.name] = finalValue;
            console.log(
              `📝 Select processed: name="${input.name}", selectedValue="${input.value}", selectedText="${selectedOption?.text}", final="${finalValue}"`
            );
          } else {
            formData[input.name] = input.value;
          }
      }
    });

    return formData;
  }

  validateForm(formData) {
    const errors = {};
    let isValid = true;

    for (const [fieldName, fieldType] of Object.entries(
      this.config.formTypes
    )) {
      const value = formData[fieldName];

      if (!value || (typeof value === "object" && !value.value)) {
        errors[fieldName] = `${this.getPlaceholder(fieldName)} is required`;
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  displayErrors(errors) {
    for (const [fieldName, errorMessage] of Object.entries(errors)) {
      const errorElement = document.getElementById(`errors_${fieldName}`);
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.style.display = "block";
      }

      // Add error class to form container
      const input = document.getElementById(fieldName);
      if (input) {
        const formContainer = input.closest(".form-nexa-floating, .form-nexa");
        if (formContainer) {
          formContainer.classList.add("form-error");
        }
      }
    }
  }

  clearErrors() {
    const errorElements = this.formElement.querySelectorAll('[id^="errors_"]');
    errorElements.forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });

    const formContainers = this.formElement.querySelectorAll(".form-error");
    formContainers.forEach((container) => {
      container.classList.remove("form-error");
    });
  }

  // NOTE: File uploads are now handled by inline scripts in generateFileInput()
  // This method is no longer needed since each field has its own script
  // initializeFileUploads() - REMOVED

  // Public methods
  render(container) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }

    if (container && this.formElement) {
      container.appendChild(this.formElement);

      // Initialize file uploads after form is added to DOM (like search.html approach)
      setTimeout(() => {
        this.initializeFileUploads();
      }, 100);
    }

    return this.formElement;
  }

  destroy() {
    if (this.formElement && this.formElement.parentNode) {
      this.formElement.parentNode.removeChild(this.formElement);
    }
  }

  reset(modalId = null) {
    // If modalId provided, find form inside modal
    if (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        // Find form inside modal
        const form =
          modal.querySelector("form") || modal.querySelector(`#${this.formId}`);
        if (form && typeof form.reset === "function") {
          form.reset();
          // Reset floating labels in modal
          const activeLabels = modal.querySelectorAll(
            ".form-nexa-floating label.active"
          );
          activeLabels.forEach((label) => label.classList.remove("active"));
          // console.log(
          //   `✅ Reset form and ${activeLabels.length} floating labels in modal: ${modalId}`
          // );
          return;
        }
      }
    }

    // Default reset for this.formElement
    if (this.formElement) {
      this.formElement.reset();
      this.clearErrors();

      // Reset floating labels
      const labels = this.formElement.querySelectorAll("label.active");
      labels.forEach((label) => label.classList.remove("active"));
      //console.log(`✅ Reset form and ${labels.length} floating labels`);
    }
  }

  setData(data) {
    if (!this.formElement) return;

    for (const [fieldName, value] of Object.entries(data)) {
      const input = this.formElement.querySelector(`[name="${fieldName}"]`);
      if (!input) continue;

      switch (input.type) {
        case "checkbox":
          // Handle multiple checkboxes
          const checkboxes = this.formElement.querySelectorAll(
            `[name="${fieldName}"], [name="${fieldName}[]"]`
          );

          if (checkboxes.length > 1 && Array.isArray(value)) {
            // Multiple checkboxes with array values
            checkboxes.forEach((checkbox) => {
              checkbox.checked = value.includes(checkbox.value);
            });
          } else if (checkboxes.length === 1) {
            // Single checkbox
            checkboxes[0].checked = Boolean(value);
          } else {
            // Fallback for single input found
            input.checked = Boolean(value);
          }
          break;

        case "radio":
          const radioButtons = this.formElement.querySelectorAll(
            `[name="${fieldName}"]`
          );
          radioButtons.forEach((radio) => {
            radio.checked = radio.value === value;
          });
          break;

        case "file":
          // File inputs cannot be programmatically set for security reasons
          console.warn(`Cannot set value for file input: ${fieldName}`);
          break;

        case "text":
          if (
            input.classList.contains("form-nexa-search-input") &&
            typeof value === "object"
          ) {
            input.value = value.label || "";
            input.setAttribute("data-value", value.value || "");
          } else {
            input.value = value || "";
          }
          this.triggerFloatingLabel(input);
          break;

        case "number":
        case "range":
          input.value = value !== null && value !== undefined ? value : "";
          this.triggerFloatingLabel(input);
          break;

        case "color":
          input.value = value || "#000000";
          break;

        case "date":
        case "datetime-local":
        case "time":
        case "month":
        case "week":
          if (value instanceof Date) {
            if (input.type === "date") {
              input.value = value.toISOString().split("T")[0];
            } else if (input.type === "datetime-local") {
              input.value = value.toISOString().slice(0, 16);
            } else if (input.type === "time") {
              input.value = value.toTimeString().slice(0, 5);
            } else if (input.type === "month") {
              input.value = value.toISOString().slice(0, 7);
            } else if (input.type === "week") {
              const year = value.getFullYear();
              const week = Math.ceil(
                ((value - new Date(year, 0, 1)) / 86400000 + 1) / 7
              );
              input.value = `${year}-W${week.toString().padStart(2, "0")}`;
            }
          } else if (typeof value === "string") {
            input.value = value;
          }
          this.triggerFloatingLabel(input);
          break;

        default:
          // Handle select, email, password, tel, url, textarea, hidden, etc.
          input.value = value || "";
          this.triggerFloatingLabel(input);
      }
    }
  }

  getData() {
    return this.getFormData();
  }

  html() {
    const formHTML = this.formElement
      ? this.formElement.outerHTML
      : this.buildFormHTML();

    // Jika floating labels enabled, tambahkan inline JavaScript
    if (this.config.formStyele?.floating) {
       setTimeout(() => {
         this.generateFloatingLabelsScript()
       }, 0);
   
      return formHTML;
    }

    return formHTML;
  }

  htmlString() {
    return this.buildFormHTML();
  }

  // Generate inline JavaScript untuk floating labels (auto-execute)
  generateFloatingLabelsScript() {
    const formId = this.formId;

  
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingLabels);
  } else {
    initFloatingLabels();
  }
  
  function initFloatingLabels() {
    // Find the form
    const form = document.getElementById('${formId}') || document.querySelector('form.nexa-floating-form');
    if (!form) {
      console.warn('[NexaFloating] Form not found for floating labels');
      return;
    }
    
    // Find all inputs that support floating labels
    const inputs = form.querySelectorAll(
      'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]), select, textarea'
    );
    
    // Setup floating for each input
    inputs.forEach(function(input, index) {
      setupFloatingForInput(input);
    });
  }
  
  function setupFloatingForInput(input) {
    // Smart label finder
    function findLabel(input) {
      // Method 1: Find by 'for' attribute
      let label = document.querySelector('label[for="' + input.name + '"]') || 
                  document.querySelector('label[for="' + input.id + '"]');
      if (label) return label;
      
      // Method 2: Find in floating container
      const container = input.closest('.form-nexa-floating');
      if (container) {
        label = container.querySelector('label');
        if (label) return label;
      }
      
      // Method 3: Sibling search
      label = input.nextElementSibling;
      if (label && label.tagName === 'I') {
        label = label.nextElementSibling; // Skip icon
      }
      if (label && label.tagName === 'LABEL') return label;
      
      // Method 4: Parent search
      const parent = input.parentElement;
      if (parent) {
        label = parent.querySelector('label');
        if (label) return label;
      }
      
      return null;
    }
    
    // Floating handler function
    function handleFloating() {
      const label = findLabel(input);
      if (label && label.tagName === 'LABEL') {
        if (input.value && input.value.trim() !== '') {
          label.classList.add('active');
        } else {
          label.classList.remove('active');
        }
      }
    }
    
    // Attach event listeners
    input.addEventListener('input', handleFloating);
    input.addEventListener('change', handleFloating);
    input.addEventListener('focus', handleFloating);
    input.addEventListener('blur', handleFloating);
    input.addEventListener('keyup', handleFloating);
    
    // Initial check
    handleFloating();
    
    // Auto-reset floating labels ketika input kosong (simple solution)
    input.addEventListener('input', function() {
      if (!input.value || input.value.trim() === '') {
        setTimeout(function() {
          const label = findLabel(input);
          if (label) label.classList.remove('active');
        }, 50);
      }
    });
  }
  
  // Add single-select behavior for checkboxes and switches
  function initSingleSelectBehavior() {
 
    // Handle single-select checkboxes
    const singleSelectCheckboxes = document.querySelectorAll('.single-select-checkbox');
  
    
    singleSelectCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function(e) {
     
        if (e.target.checked) {
          // Uncheck all other checkboxes with the same name
          const sameName = document.querySelectorAll('input[name="' + e.target.name + '"].single-select-checkbox');
         
          sameName.forEach(function(other) {
            if (other !== e.target) {
              console.log('Unchecking other checkbox: ' + other.id);
              other.checked = false;
            }
          });
        }
      });
    });

    // Handle single-select switches
    const singleSelectSwitches = document.querySelectorAll('.single-select-switch');
   
    singleSelectSwitches.forEach(function(switchEl) {
      switchEl.addEventListener('change', function(e) {
       
        if (e.target.checked) {
          // Uncheck all other switches with the same name
          const sameName = document.querySelectorAll('input[name="' + e.target.name + '"].single-select-switch');
       
          sameName.forEach(function(other) {
            if (other !== e.target) {
              console.log('Unchecking other switch: ' + other.id);
              other.checked = false;
            }
          });
        }
      });
    });
  }
  
  // Initialize everything
  initFloatingLabels();
  initSingleSelectBehavior();
  
 
  

  }

  // Method khusus untuk initialize floating labels setelah HTML di-insert ke DOM
  initializeFloatingLabels(containerSelector) {

    // Find the container
    const container =
      typeof containerSelector === "string"
        ? document.querySelector(containerSelector)
        : containerSelector;

    if (!container) {
      console.error("[DEBUG] Container not found:", containerSelector);
      return;
    }

    // Find the form inside container
    this.formElement =
      container.querySelector(`#${this.formId}`) ||
      container.querySelector("form") ||
      container; // If container is the form itself

    if (!this.formElement) {
      console.error("[DEBUG] Form not found in container");
      return;
    }

    // Attach event listeners for floating labels
    this.attachFloatingLabelEvents();

    // Attach other events
    this.attachEventListeners();

    // Attach single select behavior for HTML mode
    this.attachSingleSelectBehavior();



    return this;
  }

 

  // Dedicated method for floating label events only
  attachFloatingLabelEvents() {
    if (!this.formElement) return;

 
    // Handle floating labels for all inputs
    const inputs = this.formElement.querySelectorAll(
      'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]), select, textarea'
    );

    
    inputs.forEach((input, index) => {
   
      this.handleFloatingLabel(input);
    });
  }

  // Quick method untuk manual floating setup (emergency)
  setupFloatingLabelsManual(containerSelector) {
   
    const container =
      typeof containerSelector === "string"
        ? document.querySelector(containerSelector)
        : containerSelector;

    if (!container) {
      console.error("[DEBUG] Container not found");
      return;
    }

    // Find all inputs in container
    const inputs = container.querySelectorAll(
      'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"]), select, textarea'
    );

   

    inputs.forEach((input, index) => {
     

      // Universal floating label handler
      const handleFloating = () => {
        // Find label for this input
        let label = this.findLabelForInput(input);

        if (label && label.tagName === "LABEL") {
          if (input.value && input.value.trim() !== "") {
            label.classList.add("active");
            
          } else {
            label.classList.remove("active");
           
          }
        } else {
         
        }
      };

      // Attach events
      input.addEventListener("input", handleFloating);
      input.addEventListener("change", handleFloating);
      input.addEventListener("focus", handleFloating);
      input.addEventListener("blur", handleFloating);
      input.addEventListener("keyup", handleFloating);

      // Initial check
      handleFloating();
    });

   
  }

  // Simplified label finder for manual mode
  findLabelForInput(input) {
    // Method 1: Find by 'for' attribute (most reliable)
    const container = input.closest("form") || document;
    let label =
      container.querySelector(`label[for="${input.name}"]`) ||
      container.querySelector(`label[for="${input.id}"]`);

    if (label) return label;

    // Method 2: Find in same floating container
    const floatingContainer = input.closest(".form-nexa-floating");
    if (floatingContainer) {
      label = floatingContainer.querySelector("label");
      if (label) return label;
    }

    // Method 3: Standard sibling search
    label = input.nextElementSibling;
    if (label && label.tagName === "I") {
      label = label.nextElementSibling; // Skip icon
    }
    if (label && label.tagName === "LABEL") return label;

    // Method 4: Search in parent
    const parent = input.parentElement;
    if (parent) {
      label = parent.querySelector("label");
      if (label) return label;
    }

    return null;
  }

 

  // Reset all floating labels
  resetFloatingLabels() {
    const allLabels = this.formElement.querySelectorAll(
      ".form-nexa-floating label"
    );
    allLabels.forEach((label) => {
      label.classList.remove("active");
    });
  
  }

  // Force activate all floating labels (for testing)
  forceActivateAllLabels() {
   
    const allLabels = this.formElement.querySelectorAll(
      ".form-nexa-floating label"
    );
    allLabels.forEach((label, index) => {
      label.classList.add("active");
     
    });

    // Test if CSS is applied
    setTimeout(() => {
      allLabels.forEach((label, index) => {
        const styles = window.getComputedStyle(label);
      
      });
    }, 200);
  }

  // Global debug functions for single select
  

}
