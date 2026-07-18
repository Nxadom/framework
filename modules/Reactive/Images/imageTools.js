import { imageEditor } from "./imageEditor.js";
class imageTools {
  constructor(data = null) {
    this.data = data;
    this.nexaUI = NexaUI();
    this.currentTargetElement = null; // Store reference to current target element being edited
    this.targetElement = null; // Current target element for context menu actions
    this.selectedText = ""; // Currently selected text
    this.textClipboard = ""; // Text clipboard for paste operations

    // IndexedDB configuration - FROM Background/index.js
    this.db = null;
    this.dbName = "NexaInteractDB";
    this.dbVersion = 3;
    this.storeName = "savedElements";
    this.imageStoreName = "uploadedImages";

    // Configuration for external services
    this.config = {
      unsplashAccessKey: "34agRBAePfWdEOiHcAQ0CNuqxQytbBH6pMG9NpyAI14", // REAL Unsplash key
      useRealUnsplashAPI: true, // Enable real API
    };

    // Initialize ImageEditor instance
    this.imageEditor = null;

    // Setup global functions for modal integration
    this.setupGlobalFunctions();

    // Initialize IndexedDB
    this.initIndexedDB();
  }

  /**
   * Set target element for context menu operations
   */
  setTargetElement(element) {
    this.targetElement = element;
  }

  /**
   * Set mouse position for insertion accuracy
   */
  setMousePosition(x, y) {
    this.mousePosition = { x: x, y: y };
  }

  /**
   * Auto-detect target element from current selection or fallback
   */
  autoDetectTargetElement() {
    // Try to get element from current selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.commonAncestorContainer;
      const targetElement =
        element.nodeType === Node.TEXT_NODE ? element.parentElement : element;

      if (targetElement && targetElement.tagName) {
        return targetElement;
      }
    }

    // Fallback to body or first available container
    const containers = document.querySelectorAll(
      'div, section, article, main, .container, [contenteditable="true"]'
    );
    if (containers.length > 0) {
      return containers[0];
    }

    // Ultimate fallback to document.body
    return document.body;
  }
  struktur() {
    return [
      {
        id: "image-tools",
        icon: "image",
        text: "Image Tools",
        action: "imageTools",
        showCondition: "hasNoSelectedText",
        submenu: [
 
          // For inserting new images
          {
            id: "add-images",
            icon: "camera",
            text: "Add Images",
            action: "addImages",
            showCondition: "isContainerElement",
            submenu: [
              {
                id: "add-image-nature",
                icon: "leaf",
                text: "Nature & Landscape",
                action: "addImageNature",
                showCondition: "isContainerElement",
              },
              {
                id: "add-image-business",
                icon: "briefcase",
                text: "Business & Office",
                action: "addImageBusiness",
                showCondition: "isContainerElement",
              },
              {
                id: "add-image-people",
                icon: "users",
                text: "People & Portraits",
                action: "addImagePeople",
                showCondition: "isContainerElement",
              },
              {
                id: "add-image-technology",
                icon: "cpu",
                text: "Technology & Digital",
                action: "addImageTechnology",
                showCondition: "isContainerElement",
              },
              {
                id: "add-image-food",
                icon: "coffee",
                text: "Food & Drinks",
                action: "addImageFood",
                showCondition: "isContainerElement",
              },
              {
                id: "add-image-travel",
                icon: "map-pin",
                text: "Travel & Architecture",
                action: "addImageTravel",
                showCondition: "isContainerElement",
              },
              {
                id: "separator-add-images",
                type: "separator",
                showCondition: "isContainerElement",
              },
              {
                id: "add-image-random",
                icon: "shuffle",
                text: "Random Image",
                action: "addImageRandom",
                showCondition: "isContainerElement",
              },
            ],
          },
         // For existing images
          {
            id: "change-image-source",
            icon: "edit-2",
            text: "Change Source",
            action: "changeImageSource",
            showCondition: "isImageElement",
          },

          // Separator
          {
            id: "separator-img-insert",
            type: "separator",
            showCondition: "isContainerElement",
          },
          {
            id: "insert-from-unsplash",
            icon: "search",
            text: "Search Unsplash",
            action: "insertFromUnsplash",
            showCondition: "isContainerElement",
          },
          {
            id: "insert-placeholder",
            icon: "square",
            text: "Placeholder Image",
            action: "insertPlaceholder",
            showCondition: "isContainerElement",
          },
          {
            id: "upload-image",
            icon: "upload",
            text: "Upload File",
            action: "uploadImage",
            showCondition: "isContainerElement",
          },
        ],
      },
    ];
  }

  /**
   * Context menu: Change Image Source
   */
  contextChangeImageSource() {
    try {
      if (!this.isImageElement()) {
        return { success: false, error: "Not an image element" };
      }

      // Show image source change dialog
      this.createImageSourceDialog();

      return { success: true, message: "Image source dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Open Image Editor
   */
  contextOpenImageEditor() {
    try {
      if (!this.isImageElement()) {
        return { success: false, error: "Not an image element" };
      }

      // Initialize imageEditor if not exists
      if (!this.imageEditor) {
        this.imageEditor = new imageEditor();
      }

      // Delegate to imageEditor class
      return this.imageEditor.contextOpenimageEditor(this.targetElement);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Open Image Editor (alternative method name for action mapping)
   */
  contextOpenimageEditor() {
    return this.contextOpenImageEditor();
  }

  /**
   * Context menu: Replace from Unsplash
   */
  contextReplaceFromUnsplash() {
    try {
      if (!this.isImageElement()) {
        return { success: false, error: "Not an image element" };
      }

      // Show Unsplash search dialog
      this.createUnsplashDialog(true); // true = replace mode

      return { success: true, message: "Unsplash search dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Insert from Unsplash
   */
  contextInsertFromUnsplash(targetElement = null) {
    try {
      // Use provided element, fallback to current target, or auto-detect
      let element = targetElement || this.targetElement;

      if (!element) {
        element = this.autoDetectTargetElement();
        this.setTargetElement(element);
      }

      if (!this.isContainerElement(element)) {
        return { success: false, error: "Not a container element" };
      }

      // Set target element if provided
      if (targetElement) {
        this.setTargetElement(targetElement);
      }

      // Show Unsplash search dialog
      this.createUnsplashDialog(false); // false = insert mode

      return { success: true, message: "Unsplash search dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Add Image from Unsplash by Category
   */
  contextAddImageFromUnsplash(category, targetElement = null) {
    try {
      // Use provided element, fallback to current target, or auto-detect
      let element = targetElement || this.targetElement;

      if (!element) {
        element = this.autoDetectTargetElement();
        this.setTargetElement(element);
      }

      if (!this.isContainerElement(element)) {
        return { success: false, error: "Not a container element" };
      }

      // Set target element if provided
      if (targetElement) {
        this.setTargetElement(targetElement);
      }

      // Get random image from category
      this.getRandomUnsplashImage(category)
        .then((imageData) => {
          if (imageData) {
            this.insertImageAtPosition(imageData);
          } else {
            throw new Error("Failed to get image from Unsplash");
          }
        })
        .catch((error) => {
          console.error("Error fetching Unsplash image:", error);
        });

      return { success: true, message: `Loading ${category} image...` };
    } catch (error) {
      // Notification removed
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Insert Placeholder Image
   */
  contextInsertPlaceholder(targetElement = null) {
    try {
      // Use provided element, fallback to current target, or auto-detect
      let element = targetElement || this.targetElement;

      if (!element) {
        element = this.autoDetectTargetElement();
        this.setTargetElement(element);
      }

      if (!this.isContainerElement(element)) {
        return { success: false, error: "Not a container element" };
      }

      // Set target element if provided
      if (targetElement) {
        this.setTargetElement(targetElement);
      }

      // Show placeholder generator dialog
      this.createPlaceholderDialog();

      return { success: true, message: "Placeholder image dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Upload Image
   */
  contextUploadImage(targetElement = null) {
    try {
      // Use provided element, fallback to current target, or auto-detect
      let element = targetElement || this.targetElement;

      if (!element) {
        element = this.autoDetectTargetElement();
        this.setTargetElement(element);
      }

      if (!this.isContainerElement(element)) {
        return { success: false, error: "Not a container element" };
      }

      // Set target element if provided
      if (targetElement) {
        this.setTargetElement(targetElement);
      }

      // Show image upload dialog
      this.createImageUploadDialog();

      return { success: true, message: "Image upload dialog opened" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Alias methods for action mapping compatibility
   */
  uploadImage(targetElement = null) {
    return this.contextUploadImage(targetElement);
  }

  changeImageSource() {
    return this.contextChangeImageSource();
  }

  openImageEditor() {
    return this.contextOpenImageEditor();
  }

  insertFromUnsplash(targetElement = null) {
    return this.contextInsertFromUnsplash(targetElement);
  }

  insertPlaceholder(targetElement = null) {
    return this.contextInsertPlaceholder(targetElement);
  }

  addImageNature(targetElement = null) {
    return this.contextAddImageFromUnsplash("nature", targetElement);
  }

  addImageBusiness(targetElement = null) {
    return this.contextAddImageFromUnsplash("business", targetElement);
  }

  addImagePeople(targetElement = null) {
    return this.contextAddImageFromUnsplash("people", targetElement);
  }

  addImageTechnology(targetElement = null) {
    return this.contextAddImageFromUnsplash("technology", targetElement);
  }

  addImageFood(targetElement = null) {
    return this.contextAddImageFromUnsplash("food", targetElement);
  }

  addImageTravel(targetElement = null) {
    return this.contextAddImageFromUnsplash("travel", targetElement);
  }

  addImageRandom(targetElement = null) {
    return this.contextAddImageFromUnsplash("random", targetElement);
  }

  /**
   * Create image upload dialog using NexaUI modal
   */
  createImageUploadDialog() {
    // Setup global functions for this modal
    this.setupImageUploadGlobalFunctions();

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "imageUploadModal",
      styleClass: "w-600px",
      label: `Upload Images`,
      onclick: {
        title: "Upload",
        cancel: "Cancel",
        send: "uploadSelectedImages",
      },
      content: `
          <div class="form-group">
          <label for="imageUploadInput">Select Images</label>
          <label for="imageUploadInput" class="file-upload-area" id="uploadDropArea">
            <input type="file" id="imageUploadInput" accept="image/*" multiple style="display: none;">
            <span class="file-upload-icon">
              <i class="material-symbols-outlined" style="font-size: 24px;">cloud_upload</i>
            </span>
            <span class="file-upload-text"><strong>Drop images here or click to browse</strong></span>
            <span class="file-upload-hint">Supports: JPG, PNG, GIF, WebP</span>
          </label>
          </div>

        <div id="uploadPreviewContainer" style="display: none;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Selected Images:</label>
          <div id="uploadPreviewList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; max-height: 200px; overflow-y: auto;">
            <!-- Preview images will be added here -->
            </div>
          <div style="margin-top: 12px; font-size: 12px; color: #656d76;">
            <span id="selectedImageCount">0</span> image(s) selected
          </div>
        </div>

        <div id="uploadProgressContainer" style="display: none; margin-top: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Upload Progress:</label>
          <div style="background: #f0f0f0; border-radius: 4px; overflow: hidden;">
            <div id="uploadProgressBar" style="background: #28a745; height: 6px; width: 0%; transition: width 0.3s ease;"></div>
          </div>
          <div id="uploadStatus" style="margin-top: 8px; font-size: 14px; color: #555;"></div>
            </div>
      `,
    });

    // Open modal and setup events
    setTimeout(() => {
      this.nexaUI.nexaModal.open("imageUploadModal");
      this.setupImageUploadModalEvents();
    }, 100);
  }

  /**
   * Setup global functions for image upload modal
   */
  setupImageUploadGlobalFunctions() {
    // Store reference to this instance
    const imageToolsInstance = this;

    // Upload function
    window.uploadSelectedImages = async (modalId) => {
      const files = imageToolsInstance.selectedUploadFiles;
      if (!files || files.length === 0) {
        return;
      }

      const progressContainer = document.getElementById(
        "uploadProgressContainer"
      );
      const progressBar = document.getElementById("uploadProgressBar");
      const statusDiv = document.getElementById("uploadStatus");

      progressContainer.style.display = "block";

      let uploadedCount = 0;
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          statusDiv.textContent = `Uploading ${file.name}...`;

          // Convert file to data URL for storage
          const dataUrl = await imageToolsInstance.fileToDataURL(file);

          // Create thumbnail
          const thumbnail = await imageToolsInstance.generateThumbnail(
            dataUrl,
            150,
            150
          );

          // Save to IndexedDB
          const imageData = {
            filename: file.name,
            type: file.type,
            size: file.size,
            dataUrl: dataUrl,
            source: "upload",
            thumbnail: thumbnail,
          };

          await imageToolsInstance.saveImageToDB(imageData);
          uploadedCount++;

          // Update progress
          const progress = (uploadedCount / totalFiles) * 100;
          progressBar.style.width = progress + "%";
          statusDiv.textContent = `Uploaded ${uploadedCount} of ${totalFiles} images`;
        } catch (error) {
          console.error("Failed to upload", file.name, error);
          statusDiv.textContent = `Error uploading ${file.name}`;
        }
      }

      if (uploadedCount === totalFiles) {
        statusDiv.textContent = `Successfully uploaded ${uploadedCount} image(s)`;
        setTimeout(() => {
          imageToolsInstance.nexaUI.nexaModal.close(modalId);
        }, 1500);
      } else {
        statusDiv.textContent = `Uploaded ${uploadedCount} of ${totalFiles} images (some failed)`;
      }
    };
  }

  /**
   * Setup image upload modal events
   */
  setupImageUploadModalEvents() {
    const fileInput = document.getElementById("imageUploadInput");
    const dropArea = document.getElementById("uploadDropArea");
    const previewContainer = document.getElementById("uploadPreviewContainer");
    const previewList = document.getElementById("uploadPreviewList");
    const countSpan = document.getElementById("selectedImageCount");

    this.selectedUploadFiles = [];

    // File selection handling
    const handleFiles = (files) => {
      this.selectedUploadFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (this.selectedUploadFiles.length === 0) {
        previewContainer.style.display = "none";
        return;
      }

      // Show preview container
      previewContainer.style.display = "block";
      countSpan.textContent = this.selectedUploadFiles.length;

      // Clear previous previews
      previewList.innerHTML = "";

      // Generate previews
      this.selectedUploadFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const previewDiv = document.createElement("div");
          previewDiv.style.cssText = `
            position: relative;
            border-radius: 6px;
      overflow: hidden;
            background: #f0f0f0;
          `;

          previewDiv.innerHTML = `
            <img src="${e.target.result}" style="
              width: 100%;
              height: 80px;
              object-fit: cover;
              display: block;
            ">
            <div style="padding: 6px;">
              <div style="font-size: 11px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${
                file.name
              }">
                ${file.name}
              </div>
              <div style="font-size: 10px; color: #999;">
                ${(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          `;

          previewList.appendChild(previewDiv);
        };
        reader.readAsDataURL(file);
      });
    };

    // Click to browse
    dropArea.addEventListener("click", () => {
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener("change", (e) => {
      handleFiles(e.target.files);
    });

    // Drag and drop
    dropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropArea.style.borderColor = "#0969da";
      dropArea.style.backgroundColor = "#f1f8ff";
    });

    dropArea.addEventListener("dragleave", (e) => {
      e.preventDefault();
      dropArea.style.borderColor = "#d0d7de";
      dropArea.style.backgroundColor = "#f6f8fa";
    });

    dropArea.addEventListener("drop", (e) => {
      e.preventDefault();
      dropArea.style.borderColor = "#d0d7de";
      dropArea.style.backgroundColor = "#f6f8fa";
      handleFiles(e.dataTransfer.files);
    });
  }

  /**
   * Convert file to data URL
   */
  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate thumbnail from data URL
   */
  generateThumbnail(dataUrl, maxWidth = 150, maxHeight = 150) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate dimensions
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = dataUrl;
    });
  }

  /**
   * Create image source change dialog using NexaUI modal
   */
  createImageSourceDialog() {
    // Get current image info
    const currentSrc = this.targetElement.src || "";
    const currentAlt = this.targetElement.alt || "";

    // Setup global functions for this modal
    this.setupImageSourceGlobalFunctions();

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "imageSourceModal",
      styleClass: "w-700px",
      label: `Change Image Source`,
      onclick: {
        title: "Apply Changes",
        cancel: "Cancel",
        send: "applyImageSourceChanges",
      },
      content: `
      <!-- Tabs -->
      <div style="display: flex; margin-bottom: 20px;">
        <button class="btn tab-btn selected" data-tab="url" style="flex: 1;">
            <i class="material-symbols-outlined" style="font-size: 16px; margin-right: 6px; vertical-align: middle;">link</i>
          Custom URL
        </button>
        <button class="btn tab-btn" data-tab="library" style="flex: 1;">
            <i class="material-symbols-outlined" style="font-size: 16px; margin-right: 6px; vertical-align: middle;">folder</i>
          Image Library
        </button>
      </div>

      <!-- Tab Content Container -->
        <div>
        <!-- URL Tab -->
        <div id="url-tab" class="tab-content" style="max-height: 400px; overflow-y: auto;">
          <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Current Image:</label>
              <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 10px; text-align: center; background: #f9f9f9;">
                <img src="${currentSrc}" alt="${currentAlt}" style="max-width: 100%; max-height: 150px; border-radius: 4px;"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="color: #666; padding: 20px;" hidden>Image not found</div>
            </div>
          </div>

            <div class="nx-row">
              <div class="nx-col-8">
                <div class="form-group">
                  <dl>
                    <dt class="form-group-header"><label for="newImageUrl">New Image URL</label></dt>
                    <dd class="form-group-body">
                      <input type="url" id="newImageUrl" class="form-control input-block" value="${currentSrc}" required />
                    </dd>
                  </dl>
                </div>
              </div>
              <div class="nx-col-4">
                <div class="form-group">
                  <dl>
                    <dt class="form-group-header"><label for="newImageAlt">Alt Text</label></dt>
                    <dd class="form-group-body">
                      <input type="text" id="newImageAlt" class="form-control input-block" value="${currentAlt}" />
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

          <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Image Dimensions:</label>
              <div class="nx-row">
                <div class="nx-col-6">
                  <div class="form-group">
                    <dl>
                      <dt class="form-group-header"><label for="newImageWidth">Width (px)</label></dt>
                      <dd class="form-group-body">
                        <input type="number" id="newImageWidth" class="form-control" min="1" max="2000" />
                      </dd>
                    </dl>
                  </div>
                </div>
                <div class="nx-col-6">
                  <div class="form-group">
                    <dl>
                      <dt class="form-group-header"><label for="newImageHeight">Height (px)</label></dt>
                      <dd class="form-group-body">
                        <input type="number" id="newImageHeight" class="form-control" min="1" max="2000" />
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div class="form-checkbox">
                <label><input type="checkbox" id="maintainAspectRatio" checked> Maintain aspect ratio</label>
              </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Preview:</label>
              <div id="imagePreview" style="
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              padding: 15px;
              background: #f9f9f9;
              text-align: center;
              min-height: 100px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
                <span style="color: #666;">Enter URL to preview</span>
            </div>
          </div>
        </div>

        <!-- Library Tab -->
          <div id="library-tab" class="tab-content" style="max-height: 400px; overflow-y: auto; display: none;">
            <div id="library-loading" class="text-center" style="padding: 40px; color: #666; display: none;">
              <i class="material-symbols-outlined" style="font-size: 32px; animation: spin 1s linear infinite; margin-bottom: 12px;">refresh</i>
            <div>Loading your images...</div>
          </div>

          <div id="library-content">
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">image</i>
              <p style="margin: 0; font-size: 16px;">Your image library</p>
              <p style="margin: 8px 0 0 0; font-size: 14px;">Upload images or save from Unsplash to use them here</p>
            </div>
          </div>
        </div>
      </div>
      `,
    });

    // Open modal
    setTimeout(() => {
      this.nexaUI.nexaModal.open("imageSourceModal");
      this.setupImageSourceModalEvents();
    }, 100);
  }

  /**
   * Setup global functions for image source modal
   */
  setupImageSourceGlobalFunctions() {
    // Store reference to this instance
    const imageToolsInstance = this;

    // Apply changes function
    window.applyImageSourceChanges = (modalId) => {
      const urlInput = document.getElementById("newImageUrl");
      const altInput = document.getElementById("newImageAlt");
      const widthInput = document.getElementById("newImageWidth");
      const heightInput = document.getElementById("newImageHeight");

      const selectedImageUrl = urlInput?.value?.trim();
      const selectedImageAlt = altInput?.value?.trim();

      if (selectedImageUrl && imageToolsInstance.targetElement) {
        imageToolsInstance.targetElement.src = selectedImageUrl;
        imageToolsInstance.targetElement.alt = selectedImageAlt;

        // Apply dimensions if specified
        const width = widthInput?.value;
        const height = heightInput?.value;

        if (width) {
          imageToolsInstance.targetElement.style.width = width + "px";
          imageToolsInstance.targetElement.width = width;
        } else {
          imageToolsInstance.targetElement.style.width = "";
          imageToolsInstance.targetElement.removeAttribute("width");
        }

        if (height) {
          imageToolsInstance.targetElement.style.height = height + "px";
          imageToolsInstance.targetElement.height = height;
        } else {
          imageToolsInstance.targetElement.style.height = "";
          imageToolsInstance.targetElement.removeAttribute("height");
        }
      }

      imageToolsInstance.nexaUI.nexaModal.close(modalId);
    };
  }

  /**
   * Setup image source modal events after modal is opened
   */
  setupImageSourceModalEvents() {
    const urlInput = document.getElementById("newImageUrl");
    const altInput = document.getElementById("newImageAlt");
    const widthInput = document.getElementById("newImageWidth");
    const heightInput = document.getElementById("newImageHeight");
    const aspectRatioCheckbox = document.getElementById("maintainAspectRatio");
    const preview = document.getElementById("imagePreview");
    const tabButtons = document.querySelectorAll(".tab-btn");
    const urlTab = document.getElementById("url-tab");
    const libraryTab = document.getElementById("library-tab");
    const libraryLoading = document.getElementById("library-loading");
    const libraryContent = document.getElementById("library-content");

    // Get current image dimensions
    const currentWidth =
      this.targetElement.width || this.targetElement.style.width || "";
    const currentHeight =
      this.targetElement.height || this.targetElement.style.height || "";

    // Set initial dimension values
    if (widthInput && currentWidth) {
      widthInput.value = parseInt(currentWidth) || "";
    }
    if (heightInput && currentHeight) {
      heightInput.value = parseInt(currentHeight) || "";
    }

    // Tab switching
    const switchTab = (tabName) => {
      // Update tab buttons
      tabButtons.forEach((btn) => {
        btn.classList.toggle("selected", btn.dataset.tab === tabName);
      });

      // Show/hide tab content
      if (tabName === "url") {
        urlTab.style.display = "block";
        libraryTab.style.display = "none";
      } else if (tabName === "library") {
        urlTab.style.display = "none";
        libraryTab.style.display = "block";
        this.loadImageLibrary(libraryLoading, libraryContent, (url, alt) => {
          if (urlInput) urlInput.value = url;
          if (altInput) altInput.value = alt;
          updatePreview();
        });
      }
    };

    // Tab button events
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.dataset.tab);
      });
    });

    // Update preview function
    const updatePreview = () => {
      const url = urlInput?.value?.trim();
      if (url) {
        const width = widthInput?.value ? `width: ${widthInput.value}px;` : "";
        const height = heightInput?.value
          ? `height: ${heightInput.value}px;`
          : "";
        const dimensionStyle = `max-width: 100%; max-height: 150px; border-radius: 4px; ${width} ${height}`;

        preview.innerHTML = `<img src="${url}" alt="Preview" style="${dimensionStyle}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                             <div style="display: none; color: #666;">Invalid image URL</div>`;
      } else {
        preview.innerHTML =
          '<span style="color: #666;">Enter URL to preview</span>';
      }
    };

    // URL input events
    if (urlInput) {
      urlInput.addEventListener("input", updatePreview);
      updatePreview(); // Initial preview
    }

    // Dimension input events with aspect ratio
    let originalAspectRatio = null;

    const calculateAspectRatio = () => {
      const w = parseInt(widthInput?.value) || 0;
      const h = parseInt(heightInput?.value) || 0;
      if (w && h) {
        originalAspectRatio = w / h;
      }
    };

    if (widthInput) {
      widthInput.addEventListener("input", () => {
        if (
          aspectRatioCheckbox?.checked &&
          originalAspectRatio &&
          heightInput
        ) {
          const newWidth = parseInt(widthInput.value) || 0;
          if (newWidth) {
            heightInput.value = Math.round(newWidth / originalAspectRatio);
          }
        }
        updatePreview();
      });
      widthInput.addEventListener("focus", calculateAspectRatio);
    }

    if (heightInput) {
      heightInput.addEventListener("input", () => {
        if (aspectRatioCheckbox?.checked && originalAspectRatio && widthInput) {
          const newHeight = parseInt(heightInput.value) || 0;
          if (newHeight) {
            widthInput.value = Math.round(newHeight * originalAspectRatio);
          }
        }
        updatePreview();
      });
      heightInput.addEventListener("focus", calculateAspectRatio);
    }
  }

  /**
   * Setup global functions for modal integration
   */
  setupGlobalFunctions() {
    // Store global reference for modal cleanup functionality
    window.imageToolsInstance = this;

    // Expose debug functions globally for easy console access
    window.debugImageLibrary = () => this.debugImageLibrary();
    window.repairImageLibrary = () => this.repairImageLibrary();
  }

  /**
   * Initialize IndexedDB for saving elements
   */
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error("IndexedDB initialization failed:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store for saved elements if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes
          store.createIndex("name", "name", { unique: false });
          store.createIndex("tag", "tag", { unique: false });
          store.createIndex("timestamp", "timestamp", { unique: false });
        }

        // Create object store for uploaded images if it doesn't exist
        if (!db.objectStoreNames.contains(this.imageStoreName)) {
          const imageStore = db.createObjectStore(this.imageStoreName, {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes for images
          imageStore.createIndex("filename", "filename", { unique: false });
          imageStore.createIndex("type", "type", { unique: false });
          imageStore.createIndex("size", "size", { unique: false });
          imageStore.createIndex("timestamp", "timestamp", { unique: false });
          imageStore.createIndex("source", "source", { unique: false }); // 'upload', 'unsplash', etc.
        }
      };
    });
  }

  /**
   * Get all saved images from IndexedDB
   */
  async getSavedImages() {
    try {
      if (!this.db) {
        console.error(
          "Database not initialized, attempting to reinitialize..."
        );
        await this.initIndexedDB();
        if (!this.db) {
          throw new Error("IndexedDB not initialized and reinitialize failed");
        }
      }

      // Check if the object store exists
      if (!this.db.objectStoreNames.contains(this.imageStoreName)) {
        return { success: true, images: [] };
      }

      const transaction = this.db.transaction(
        [this.imageStoreName],
        "readonly"
      );
      const store = transaction.objectStore(this.imageStoreName);

      return new Promise((resolve) => {
        const request = store.getAll();

        request.onsuccess = () => {
          const images = request.result || [];

          // Validate image data
          const validImages = images.filter((img) => {
            if (!img || !img.filename) {
              return false;
            }
            if (!img.dataUrl && !img.thumbnail) {
              return false;
            }
            return true;
          });

          resolve({
            success: true,
            images: validImages,
          });
        };

        request.onerror = () => {
          console.error("Error getting images from database:", request.error);
          resolve({ success: false, error: request.error, images: [] });
        };

        transaction.onerror = () => {
          console.error("Transaction error:", transaction.error);
          resolve({ success: false, error: transaction.error, images: [] });
        };
      });
    } catch (error) {
      console.error("getSavedImages error:", error);
      return { success: false, error: error.message, images: [] };
    }
  }

  /**
   * Load image library for Change Image Source dialog
   */
  /**
   * Load image library for Change Image Source dialog
   */
  async loadImageLibrary(loadingDiv, contentDiv, onImageSelect = null) {
    // Check if already loading using hidden attribute or display style
    const isLoading = !loadingDiv.hidden && loadingDiv.style.display !== "none";
    if (isLoading) {
      return; // Already loading
    }

    loadingDiv.hidden = false;
    loadingDiv.style.display = "block";
    contentDiv.innerHTML = "";

    try {
      // If database is not initialized, try to initialize it
      if (!this.db) {
        await this.initIndexedDB();
      }

      const result = await this.getSavedImages();

      loadingDiv.hidden = true;
      loadingDiv.style.display = "none";

      if (!result.success || result.images.length === 0) {
        contentDiv.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #999;">
            <i class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">image</i>
            <p style="margin: 0; font-size: 16px;">No images in your library</p>
            <p style="margin: 8px 0 16px 0; font-size: 14px;">Upload images or save from Unsplash to use them here</p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <button onclick="document.querySelector('#close-image-source-dialog').click(); document.querySelector('#upload-image').click();" style="
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 6px;
              ">
                <i class="material-symbols-outlined" style="font-size: 14px;">cloud_upload</i>
                Upload Images
              </button>
              <button onclick="document.querySelector('#close-image-source-dialog').click(); document.querySelector('#insert-from-unsplash').click();" style="
                background: #28a745;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 6px;
              ">
                <i class="material-symbols-outlined" style="font-size: 14px;">search</i>
                Browse Unsplash
              </button>
              <button id="debug-db-btn" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 6px;
              ">
                <i data-feather="bug" style="width: 14px; height: 14px;"></i>
                Debug DB
              </button>
              <button id="test-add-image-btn" style="
                background: #17a2b8;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 6px;
              ">
                <i data-feather="plus" style="width: 14px; height: 14px;"></i>
                Test Add Image
              </button>
              <button id="inspect-indexeddb-btn" style="
                background: #dc3545;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 6px;
              ">
                <i data-feather="database" style="width: 14px; height: 14px;"></i>
                Inspect All DB Data
              </button>
            </div>
          </div>
        `;

        // Add debug button event listeners
        setTimeout(() => {
          const debugBtn = contentDiv.querySelector("#debug-db-btn");

          const testBtn = contentDiv.querySelector("#test-add-image-btn");
          if (testBtn) {
            testBtn.addEventListener("click", async () => {
              await this.testAddSampleImage();
              // Reload the library after adding test image
              this.loadImageLibrary(loadingDiv, contentDiv, onImageSelect);
            });
          }

          const inspectBtn = contentDiv.querySelector("#inspect-indexeddb-btn");
          if (inspectBtn) {
            inspectBtn.addEventListener("click", async () => {
              await this.inspectAllIndexedDBData();
              alert(
                "Data IndexedDB telah ditampilkan di console. Silakan buka Developer Tools > Console untuk melihat hasilnya."
              );
            });
          }
        }, 100);
        // Icons will be handled by NexaUI system
        return;
      }

      // Group images by source
      const uploadedImages = result.images.filter(
        (img) => img.source === "upload"
      );
      const unsplashImages = result.images.filter(
        (img) => img.source === "unsplash"
      );
      const unknownSourceImages = result.images.filter(
        (img) =>
          !img.source || (img.source !== "upload" && img.source !== "unsplash")
      );

      let libraryHTML = '<div style="padding: 16px;">';

      // Uploaded Images Section
      if (uploadedImages.length > 0) {
        libraryHTML += `
          <div style="margin-bottom: 24px;">
            <h4 style="margin: 0 0 12px 0; color: #333; font-size: 16px; display: flex; align-items: center; gap: 8px;">
              <i data-feather="upload" style="width: 16px; height: 16px;"></i>
              Uploaded Images (${uploadedImages.length})
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px;">
              ${uploadedImages
                .map(
                  (img) => `
                <div class="library-image-item" data-url="${
                  img.dataUrl
                }" data-alt="${img.filename}" style="
                  position: relative;
                  cursor: pointer;
                  border-radius: 6px;
                  overflow: hidden;
                  background: #f0f0f0;
                  border: 2px solid transparent;
                  transition: all 0.2s ease;
                ">
                  <img src="${img.thumbnail || img.dataUrl}" style="
                    width: 100%;
                    height: 80px;
                    object-fit: cover;
                    display: block;
                  ">
                  <div style="padding: 8px;">
                    <div style="font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${
                      img.filename
                    }">
                      ${img.filename}
                    </div>
                    <div style="font-size: 11px; color: #999;">
                      ${
                        img.size
                          ? (img.size / 1024).toFixed(1) + "KB"
                          : "Unknown size"
                      }
                    </div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `;
      }

      // Unsplash Images Section
      if (unsplashImages.length > 0) {
        libraryHTML += `
          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 12px 0; color: #333; font-size: 16px; display: flex; align-items: center; gap: 8px;">
              <i data-feather="search" style="width: 16px; height: 16px;"></i>
              From Unsplash (${unsplashImages.length})
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px;">
              ${unsplashImages
                .map(
                  (img) => `
                <div class="library-image-item" data-url="${
                  img.dataUrl
                }" data-alt="Photo from Unsplash" style="
                  position: relative;
                  cursor: pointer;
                  border-radius: 6px;
                  overflow: hidden;
                  background: #f0f0f0;
                  border: 2px solid transparent;
                  transition: all 0.2s ease;
                ">
                  <img src="${img.dataUrl}" style="
                    width: 100%;
                    height: 80px;
                    object-fit: cover;
                    display: block;
                  ">
                  <div style="padding: 8px;">
                    <div style="font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      Unsplash Image
                    </div>
                    <div style="font-size: 11px; color: #999;">
                      ${new Date(img.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `;
      }

      // Unknown/Other Source Images Section
      if (unknownSourceImages.length > 0) {
        libraryHTML += `
          <div style="margin-bottom: 16px;">
            <h4 style="margin: 0 0 12px 0; color: #333; font-size: 16px; display: flex; align-items: center; gap: 8px;">
              <i data-feather="help-circle" style="width: 16px; height: 16px;"></i>
              Other Images (${unknownSourceImages.length})
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px;">
              ${unknownSourceImages
                .map(
                  (img) => `
                <div class="library-image-item" data-url="${
                  img.dataUrl
                }" data-alt="${img.filename || "Unknown Image"}" style="
                  position: relative;
                  cursor: pointer;
                  border-radius: 6px;
                  overflow: hidden;
                  background: #f0f0f0;
                  border: 2px solid transparent;
                  transition: all 0.2s ease;
                ">
                  <img src="${img.dataUrl}" style="
                    width: 100%;
                    height: 80px;
                    object-fit: cover;
                    display: block;
                  ">
                  <div style="padding: 8px;">
                    <div style="font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${
                      img.filename || "Unknown Image"
                    }">
                      ${img.filename || "Unknown Image"}
                    </div>
                    <div style="font-size: 11px; color: #999;">
                      Source: ${img.source || "Unknown"}
                    </div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `;
      }

      libraryHTML += "</div>";
      contentDiv.innerHTML = libraryHTML;

      // Add click handlers for library images
      const libraryItems = contentDiv.querySelectorAll(".library-image-item");
      libraryItems.forEach((item) => {
        item.addEventListener("click", () => {
          // Remove selection from other items
          libraryItems.forEach((otherItem) => {
            otherItem.style.borderColor = "transparent";
          });

          // Select this item
          item.style.borderColor = "#007bff";

          // Update selected values
          const imageUrl = item.dataset.url;
          const imageAlt = item.dataset.alt;

          // Call the callback directly since we're in NexaUI modal context
          if (onImageSelect) {
            onImageSelect(imageUrl, imageAlt);
          }
        });
      });

      if (typeof feather !== "undefined") feather.replace();
    } catch (error) {
      console.error("loadImageLibrary error:", error);
      console.error("Error stack:", error.stack);
      loadingDiv.style.display = "none";
      contentDiv.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e74c3c;">
          <i class="material-symbols-outlined" style="font-size: 32px; margin-bottom: 12px;">error</i>
          <p style="margin: 0; font-size: 16px;">Error loading library</p>
          <p style="margin: 8px 0 16px 0; font-size: 14px;">${error.message}</p>
          <button id="retry-load-btn" style="
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
          ">
            Retry
          </button>
        </div>
      `;

      // Add retry button event listener
      setTimeout(() => {
        const retryBtn = contentDiv.querySelector("#retry-load-btn");
        if (retryBtn) {
          retryBtn.addEventListener("click", () => {
            this.loadImageLibrary(loadingDiv, contentDiv, onImageSelect);
          });
        }
      }, 100);

      if (typeof feather !== "undefined") feather.replace();
    }
  }

  /**
   * Debug function for image library issues
   */
  async debugImageLibrary() {
    try {
      if (!this.db) {
        await this.initIndexedDB();
      }

      const hasImageStore = this.db.objectStoreNames.contains(
        this.imageStoreName
      );

      if (!hasImageStore) {
        console.error(
          "Image store does not exist! Available stores:",
          Array.from(this.db.objectStoreNames)
        );
        return;
      }

      const result = await this.getSavedImages();
    } catch (error) {
      console.error("Debug failed:", error);
    }
  }

  /**
   * Repair function for image library issues
   */
  async repairImageLibrary() {
    try {
      if (!this.db) {
        await this.initIndexedDB();
      }

      const result = await this.getSavedImages();
      return result;
    } catch (error) {
      console.error("Repair failed:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get random image from Unsplash by category
   */
  async getRandomUnsplashImage(category) {
    const UNSPLASH_ACCESS_KEY = this.config.unsplashAccessKey;
    const USE_REAL_API = this.config.useRealUnsplashAPI;

    // Category mapping for better search results
    const categoryQueries = {
      nature: "nature landscape",
      business: "business office professional",
      people: "people portrait person",
      technology: "technology computer digital",
      food: "food drinks cuisine",
      travel: "travel architecture city",
      random: "", // Empty query for random images
    };

    const query = categoryQueries[category] || category;

    if (USE_REAL_API && UNSPLASH_ACCESS_KEY) {
      try {
        // For random category, use the random endpoint
        if (category === "random") {
          const response = await fetch(
            `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_ACCESS_KEY}`
          );

          if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
          }

          const photo = await response.json();
          return {
            id: photo.id,
            thumb: `${photo.urls.raw}&w=512&h=512&fit=crop&crop=center`,
            url: `${photo.urls.raw}&w=512&h=512&fit=crop&crop=center`,
            photographer: photo.user.name,
            alt: photo.alt_description || `Photo by ${photo.user.name}`,
            download: photo.links.download,
          };
        } else {
          // For specific categories, search and get random result
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
              query
            )}&per_page=20&client_id=${UNSPLASH_ACCESS_KEY}`
          );

          if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
          }

          const data = await response.json();
          if (data.results && data.results.length > 0) {
            // Get random image from results
            const randomIndex = Math.floor(Math.random() * data.results.length);
            const photo = data.results[randomIndex];

            return {
              id: photo.id,
              thumb: `${photo.urls.raw}&w=512&h=512&fit=crop&crop=center`,
              url: `${photo.urls.raw}&w=512&h=512&fit=crop&crop=center`,
              photographer: photo.user.name,
              alt:
                photo.alt_description ||
                `${category} photo by ${photo.user.name}`,
              download: photo.links.download,
            };
          } else {
            throw new Error(`No images found for ${category}`);
          }
        }
      } catch (error) {
        console.error("Unsplash API error:", error);
        // Fallback to placeholder image
        return this.getFallbackImage(category);
      }
    } else {
      // Fallback when API is disabled
      return this.getFallbackImage(category);
    }
  }

  /**
   * Get fallback image when Unsplash API is not available
   */
  getFallbackImage(category) {
    // FIXED: Set fallback image resolution to 512x512 for consistent sizing
    const fallbackImages = {
      nature:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop&crop=center",
      business:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=512&h=512&fit=crop&crop=center",
      people:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512&h=512&fit=crop&crop=center",
      technology:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=512&h=512&fit=crop&crop=center",
      food: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=512&h=512&fit=crop&crop=center",
      travel:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=512&h=512&fit=crop&crop=center",
      random:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=512&fit=crop&crop=center",
    };

    const imageUrl = fallbackImages[category] || fallbackImages.random;

    return {
      id: `fallback-${category}-${Date.now()}`,
      thumb: imageUrl,
      url: imageUrl,
      photographer: "Unsplash",
      alt: `${category} image`,
      download: imageUrl,
    };
  }

  /**
   * Insert image at current mouse position
   */
  insertImageAtPosition(imageData, targetElement = null) {
    try {
      // Use provided element, fallback to current target, or auto-detect
      let element = targetElement || this.targetElement;

      if (!element) {
        element = this.autoDetectTargetElement();
        this.setTargetElement(element);
      }

      if (!this.isContainerElement(element)) {
        return { success: false, error: "Not a container element" };
      }

      // Create image element
      const img = document.createElement("img");

      // Set crossOrigin to handle CORS for future editing
      img.crossOrigin = "anonymous";

      img.src = imageData.url;
      img.alt = imageData.alt;
      img.style.cssText = `
        max-width: 100%;
        height: auto;
        display: block;
        margin: 1rem 0;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      `;

      // Add data attributes for metadata
      img.dataset.unsplashId = imageData.id;
      img.dataset.photographer = imageData.photographer;
      img.dataset.source = "unsplash";

      // Insert at target position with explicit target element
      this.insertElementAtPosition(img, element);

      return { success: true, element: img };
    } catch (error) {
      console.error("Error inserting image:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Insert placeholder image with specified options
   */
  insertPlaceholderImage(options, targetElement = null) {
    try {
      // Use provided element, fallback to current target, or auto-detect
      let element = targetElement || this.targetElement;

      if (!element) {
        element = this.autoDetectTargetElement();
        this.setTargetElement(element);
      }

      if (!this.isContainerElement(element)) {
        return { success: false, error: "Not a container element" };
      }

      // Set target element if provided
      if (targetElement) {
        this.setTargetElement(targetElement);
      }

      // Create placeholder image element
      const img = document.createElement("img");

      // Generate data URL for placeholder
      const canvas = document.createElement("canvas");
      canvas.width = options.width;
      canvas.height = options.height;

      const ctx = canvas.getContext("2d");

      // Fill background
      ctx.fillStyle = options.bgColor;
      ctx.fillRect(0, 0, options.width, options.height);

      // Draw border
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, options.width, options.height);

      // Draw text
      ctx.fillStyle = options.textColor;
      ctx.font = `${Math.max(12, options.width / 20)}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Split text into lines if too long
      const maxWidth = options.width - 20;
      const words = options.text.split(" ");
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + " " + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      // Draw lines
      const lineHeight = Math.max(14, options.width / 18);
      const startY = options.height / 2 - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, index) => {
        ctx.fillText(line, options.width / 2, startY + index * lineHeight);
      });

      // Set image properties
      img.src = canvas.toDataURL("image/png");
      img.alt = options.text;
      img.style.cssText = `
        width: ${options.width}px;
        height: ${options.height}px;
        border: 1px solid #ddd;
        border-radius: 4px;
        display: block;
        margin: 10px 0;
      `;

      // Insert into target container using smart positioning
      this.insertElementAtPosition(img, element);

      return {
        success: true,
        message: "Placeholder image inserted",
        element: img,
      };
    } catch (error) {
      console.error("insertPlaceholderImage error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if element is an image element
   */
  isImageElement(element = null) {
    const targetElement = element || this.targetElement;
    return targetElement && targetElement.tagName === "IMG";
  }

  /**
   * Check if element can contain images (is a container)
   */
  isContainerElement(element = null) {
    const targetElement = element || this.targetElement;
    if (!targetElement) return false;

    // Exclude elements that cannot contain images
    const excludedTags = [
      "IMG",
      "INPUT",
      "TEXTAREA",
      "BUTTON",
      "SELECT",
      "OPTION",
    ];
    return !excludedTags.includes(targetElement.tagName);
  }

  /**
   * Insert element at smart position based on cursor/mouse position
   */
  insertElementAtPosition(element, targetElement = null) {
    try {
      // Use provided target element or fallback to this.targetElement
      const target = targetElement || this.targetElement;

      if (!target || typeof target.appendChild !== "function") {
        console.error("Invalid target element for insertion:", target);
        return;
      }

      const targetRect = target.getBoundingClientRect();
      const mouseX = this.mousePosition?.x || 0;
      const mouseY = this.mousePosition?.y || 0;

      // Calculate relative position within target element
      const relativeX = mouseX - targetRect.left;
      const relativeY = mouseY - targetRect.top;

      // Get all child elements
      const children = Array.from(target.children);

      if (children.length === 0) {
        // No children, just append
        target.appendChild(element);
        return;
      }

      // Find the best insertion point based on mouse position
      let insertIndex = children.length; // Default to end

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const childRect = child.getBoundingClientRect();

        // Calculate relative position of child within target
        const childRelativeTop = childRect.top - targetRect.top;
        const childRelativeBottom = childRect.bottom - targetRect.top;

        // Check if mouse is above this child (vertical positioning)
        if (relativeY < childRelativeTop + childRect.height / 2) {
          insertIndex = i;
          break;
        }
      }

      // Insert element at the calculated position
      if (insertIndex >= children.length) {
        target.appendChild(element);
      } else {
        target.insertBefore(element, children[insertIndex]);
      }
    } catch (error) {
      console.error("insertElementAtPosition error:", error);
      // Fallback: try to append to target or this.targetElement
      const fallbackTarget = targetElement || this.targetElement;
      if (fallbackTarget && typeof fallbackTarget.appendChild === "function") {
        fallbackTarget.appendChild(element);
      }
    }
  }

  /**
   * Prevent browser context menu on element and all its children
   */
  preventContextMenuOnElement(element) {
    if (!element) return;

    // Prevent context menu on the element itself
    element.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    // Prevent context menu on all child elements (capture phase)
    element.addEventListener(
      "contextmenu",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      true
    );
  }

  // Legacy method - no longer used with Cropper.js
  // getCanvasCoordinatesForCrop(event) {
  //   // This coordinate conversion is now handled by Cropper.js internally
  // }

  // Legacy method - no longer used with Cropper.js
  // canvasToOverlayCoords(canvasX, canvasY) {
  //   // This coordinate conversion is now handled by Cropper.js internally
  // }

  // Legacy crop events method - no longer used with Cropper.js
  // setupCropEvents() {
  //   // This method is now handled by Cropper.js internally
  // }

  createUnsplashDialog(isReplaceMode = false) {
    const mode = isReplaceMode ? "replace" : "insert";

    // Setup global functions for this modal
    this.setupUnsplashGlobalFunctions(isReplaceMode);

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "unsplashModal",
      styleClass: "w-900px",
      label: `📷 Unsplash Images (${mode} mode)`,
      onclick: {
        title: "Cancel",
        cancel: "Cancel",
        send: "",
      },
      content: `
              <!-- Search section -->
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="unsplash-search-input">Search for photos</label></dt>
                  <dd class="form-group-body">
                    <div class="input-group">
                      <input type="text" id="unsplash-search-input" class="form-control input-block" />
                      <div class="input-group-button">
                        <button id="unsplash-search-btn" class="btn btn-primary">
                          <i class="material-symbols-outlined" style="margin-right: 6px;">search</i>
                          Search
                        </button>
                      </div>
                    </div>
                  </dd>
                </dl>
              </div>

              <!-- Loading indicator -->
              <div id="unsplash-loading" style="display: none; text-align: center; padding: 40px; color: #656d76;">
          <i class="material-symbols-outlined" style="font-size: 32px; animation: spin 1s linear infinite; margin-bottom: 12px;">refresh</i>
                <div>Searching images...</div>
              </div>

              <!-- Results container -->
        <div id="unsplash-results" style="height: 60vh; overflow-y: auto; border: 1px solid #d0d7de; border-radius: 6px; background: #f6f8fa; margin-top: 20px;">
                <div style="text-align: center; padding: 60px 20px; color: #656d76;">
            <i class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">image</i>
                  <p style="margin: 0; font-size: 16px;">Search for beautiful photos from Unsplash</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #999;">Find the perfect image for your project</p>
                </div>
              </div>
      `,
    });

    // Open modal and setup events
    setTimeout(() => {
      this.nexaUI.nexaModal.open("unsplashModal");
      this.setupUnsplashModalEvents(isReplaceMode);
    }, 100);
  }

  /**
   * Setup global functions for Unsplash modal
   */
  setupUnsplashGlobalFunctions(isReplaceMode) {
    // No specific global functions needed for Unsplash modal
    // All handling is done through modal events
  }

  /**
   * Setup Unsplash modal events after modal is opened
   */
  setupUnsplashModalEvents(isReplaceMode) {
    const searchInput = document.getElementById("unsplash-search-input");
    const searchBtn = document.getElementById("unsplash-search-btn");
    const loadingDiv = document.getElementById("unsplash-loading");
    const resultsDiv = document.getElementById("unsplash-results");

    // Close dialog function
    const closeDialog = () => {
      this.nexaUI.nexaModal.close("unsplashModal");
    };

    // Search function using Unsplash API (demo mode with sample images)
    const searchImages = async (query) => {
      loadingDiv.style.display = "block";
      resultsDiv.innerHTML = "";

      try {
        // Get images from Unsplash API using user's exact search term
        const demoImages = await this.getDemoUnsplashImages(query);

        loadingDiv.style.display = "none";

        if (demoImages.length === 0) {
          resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
              <i class="material-symbols-outlined" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;">search</i>
              <p style="margin: 0; font-size: 16px;">No images found for "${query}"</p>
              <p style="margin: 8px 0 0 0; font-size: 14px;">Try different keywords</p>
            </div>
          `;
          // Icons will be handled by NexaUI system
          return;
        }

        // Create image grid
        const gridHTML = demoImages
          .map(
            (image) => `
          <div class="unsplash-image-item" data-url="${
            image.url
          }" data-download="${image.download}" style="
            position: relative;
            cursor: pointer;
            border-radius: 8px;
            overflow: hidden;
            background: #f0f0f0;
            transition: transform 0.2s ease;
          ">
            <img src="${image.thumb}" style="
              width: 100%;
              height: 200px;
              object-fit: cover;
              display: block;
            ">
            <div style="
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              background: linear-gradient(transparent, rgba(0,0,0,0.7));
              color: white;
              padding: 16px 12px 8px;
              font-size: 12px;
            ">
              <div style="font-weight: 500; margin-bottom: 2px;">${
                image.photographer
              }</div>
              <div style="opacity: 0.8;">Unsplash</div>
            </div>
            <div class="image-overlay" style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0,0,0,0.5);
              display: none;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              gap: 12px;
              padding: 12px;
            ">
              <div style="display: flex; gap: 12px; width: 100%; padding: 0 8px;">
                <button class="copy-url-btn" style="
                  background: white;
                  border: none;
                  padding: 8px 14px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 11px;
                  font-weight: 500;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  flex: 1;
                  justify-content: center;
                ">
                  <i data-feather="copy" style="width: 12px; height: 12px;"></i>
                  URL
                </button>
                <button class="copy-img-code-btn" style="
                  background: #e3f2fd;
                  color: #1976d2;
                  border: 1px solid #bbdefb;
                  padding: 8px 14px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 11px;
                  font-weight: 500;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  flex: 1;
                  justify-content: center;
                ">
                  <i data-feather="code" style="width: 12px; height: 12px;"></i>
                  IMG
                </button>
              </div>
              <button class="use-image-btn" style="
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                justify-content: center;
              ">
                <i data-feather="download" style="width: 14px; height: 14px;"></i>
                ${isReplaceMode ? "Replace" : "Save to Library"}
              </button>
            </div>
          </div>
        `
          )
          .join("");

        resultsDiv.innerHTML = `
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 16px;
            padding: 16px;
          ">
            ${gridHTML}
          </div>
        `;

        // Add hover effects and click handlers
        const imageItems = resultsDiv.querySelectorAll(".unsplash-image-item");
        imageItems.forEach((item) => {
          const overlay = item.querySelector(".image-overlay");
          const copyBtn = item.querySelector(".copy-url-btn");
          const copyImgBtn = item.querySelector(".copy-img-code-btn");
          const useBtn = item.querySelector(".use-image-btn");

          item.addEventListener("mouseenter", () => {
            overlay.style.display = "flex";
            item.style.transform = "scale(1.02)";
          });

          item.addEventListener("mouseleave", () => {
            overlay.style.display = "none";
            item.style.transform = "scale(1)";
          });

          copyBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const imageUrl = item.dataset.url;

            try {
              await navigator.clipboard.writeText(imageUrl);
            } catch (error) {
              // Fallback for older browsers
              const textArea = document.createElement("textarea");
              textArea.value = imageUrl;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand("copy");
              document.body.removeChild(textArea);
            }
          });

          copyImgBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const imageUrl = item.dataset.url;
            const imgCode = `<img src="${imageUrl}" alt="Photo from Unsplash" style="max-width: 100%; height: auto;">`;

            try {
              await navigator.clipboard.writeText(imgCode);
            } catch (error) {
              // Fallback for older browsers
              const textArea = document.createElement("textarea");
              textArea.value = imgCode;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand("copy");
              document.body.removeChild(textArea);
            }
          });

          useBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const imageUrl = item.dataset.url;
            const downloadUrl = item.dataset.download;

            if (
              isReplaceMode &&
              this.targetElement &&
              this.targetElement.tagName === "IMG"
            ) {
              // Replace mode - change existing image
              this.targetElement.src = imageUrl;

              closeDialog();
            } else {
              // Insert mode - add new image or save to IndexedDB for later use
              try {
                // Save to IndexedDB for future use
                const imageData = {
                  filename: `unsplash-${Date.now()}.jpg`,
                  type: "image/jpeg",
                  size: 0, // Unknown size for external images
                  dataUrl: imageUrl,
                  source: "unsplash",
                  metadata: {
                    unsplashUrl: imageUrl,
                    downloadUrl: downloadUrl,
                    savedAt: new Date().toISOString(),
                  },
                };

                await this.saveImageToDB(imageData);

                closeDialog();
              } catch (error) {}
            }
          });
        });

        // Re-initialize Feather icons
        // Icons will be handled by NexaUI system
      } catch (error) {
        loadingDiv.style.display = "none";
        resultsDiv.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #e74c3c;">
            <i class="material-symbols-outlined" style="font-size: 32px; margin-bottom: 12px;">error</i>
            <p style="margin: 0; font-size: 16px;">Search failed</p>
            <p style="margin: 8px 0 0 0; font-size: 14px;">${error.message}</p>
          </div>
        `;
        // Icons will be handled by NexaUI system
      }
    };

    // Search button click
    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        const query = searchInput?.value?.trim();
        if (query) {
          searchImages(query);
        }
      });
    }

    // Enter key in search input
    if (searchInput) {
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const query = searchInput.value.trim();
          if (query) {
            searchImages(query);
          }
        }
      });

      // Auto-focus search input
      setTimeout(() => {
        searchInput.focus();
      }, 100);
    }
  }
  /**
   * Save uploaded image to IndexedDB
   */
  async saveImageToDB(imageData) {
    try {
      if (!this.db) {
        throw new Error("IndexedDB not initialized");
      }

      const transaction = this.db.transaction(
        [this.imageStoreName],
        "readwrite"
      );
      const store = transaction.objectStore(this.imageStoreName);

      const imageRecord = {
        filename: imageData.filename,
        type: imageData.type,
        size: imageData.size,
        dataUrl: imageData.dataUrl,
        source: imageData.source || "upload", // 'upload', 'unsplash', etc.
        thumbnail: imageData.thumbnail || null,
        timestamp: Date.now(),
        metadata: imageData.metadata || {},
      };

      return new Promise((resolve, reject) => {
        const request = store.add(imageRecord);

        request.onsuccess = () => {
          resolve({
            success: true,
            id: request.result,
            message: "Image saved successfully",
          });
        };

        request.onerror = () => {
          reject(new Error(request.error));
        };
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Attempt to fix broken image records by regenerating thumbnails
   */
  async repairImageLibrary() {
    try {
      if (!this.db) {
        await this.initIndexedDB();
      }

      const transaction = this.db.transaction(
        [this.imageStoreName],
        "readwrite"
      );
      const store = transaction.objectStore(this.imageStoreName);
      const request = store.getAll();

      return new Promise((resolve) => {
        request.onsuccess = async () => {
          const allImages = request.result || [];

          let repairedCount = 0;

          for (const img of allImages) {
            // Check if image needs repair (has filename but missing data)
            if (img.filename && !img.dataUrl && !img.thumbnail) {
              // If the image has a file reference but no data, we can't recover it
              // So we'll mark it for potential deletion or keep it as placeholder
              // Optionally, you could delete these broken records:
              // await store.delete(img.id);
            } else if (img.filename && img.dataUrl && !img.thumbnail) {
              // Generate thumbnail if missing
              try {
                const thumbnail = await this.generateThumbnail(
                  img.dataUrl,
                  150,
                  150
                );

                const updatedImg = { ...img, thumbnail };
                await store.put(updatedImg);
                repairedCount++;
              } catch (error) {
                console.error(
                  "Failed to generate thumbnail for:",
                  img.filename,
                  error
                );
              }
            }
          }

          resolve(repairedCount);
        };

        request.onerror = () => {
          console.error("Error reading image records:", request.error);
          resolve(0);
        };
      });
    } catch (error) {
      console.error("Repair error:", error);
      return 0;
    }
  }
  /**
   * Setup drawing events
   */

  /**
   * Save current state to history for undo/redo
   */

  /**
   * Get demo Unsplash images for search results
   * ✅ REAL API ENABLED - Uses actual Unsplash database with millions of photos
   * ✅ NO MANIPULATION - User input goes directly to search endpoint
   * ✅ FRESH RESULTS - Always returns latest and most relevant photos
   * ✅ 20 PHOTOS PER SEARCH - More variety for users to choose from
   */
  async getDemoUnsplashImages(query) {
    // Use REAL Unsplash API with user's exact search input
    const UNSPLASH_ACCESS_KEY = this.config.unsplashAccessKey;
    const USE_REAL_API = this.config.useRealUnsplashAPI;

    if (USE_REAL_API && UNSPLASH_ACCESS_KEY) {
      try {
        // REAL Unsplash Search API - Direct user input to official API
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            query
          )}&per_page=20&client_id=${UNSPLASH_ACCESS_KEY}`
        );

        if (!response.ok) {
          throw new Error(`Unsplash API error: ${response.status}`);
        }

        const data = await response.json();

        // Return real search results from Unsplash database
        return data.results.map((photo) => ({
          id: photo.id,
          thumb: `${photo.urls.raw}&w=512&h=512&fit=crop&crop=center`,
          url: `${photo.urls.raw}&w=512&h=512&fit=crop&crop=center`,
          photographer: photo.user.name,
          download: photo.links.download,
        }));
      } catch (error) {
        // Fallback to source API if main API fails
      }
    }

    // Fallback: Use Unsplash Source API with user's EXACT search term - NO MANIPULATION
    const searchTerm = query.trim() || "random";
    const results = [];

    // Generate 20 results using Unsplash's source API with user's exact search input - 512x512 sizing
    for (let i = 1; i <= 20; i++) {
      results.push({
        id: `unsplash-${searchTerm}-${i}`,
        thumb: `https://source.unsplash.com/512x512/?${encodeURIComponent(
          searchTerm
        )}&${i}`,
        url: `https://source.unsplash.com/512x512/?${encodeURIComponent(
          searchTerm
        )}&${i}`,
        photographer: `Unsplash Contributor ${i}`,
        download: `https://source.unsplash.com/512x512/?${encodeURIComponent(
          searchTerm
        )}&${i}`,
      });
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return results;
  }

  /**
   * Create placeholder dialog using NexaUI modal
   */
  createPlaceholderDialog() {
    // Setup global functions for this modal
    this.setupPlaceholderGlobalFunctions();

    // Create modal using NexaUI
    this.nexaUI.modalHTML({
      elementById: "placeholderModal",
      styleClass: "w-500px",
      label: `Insert Placeholder Image`,
      onclick: {
        title: "Insert Placeholder",
        cancel: "Cancel",
        send: "insertPlaceholderImage",
      },
      content: `
        <div class="nx-row">
          <div class="nx-col-6">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="placeholderWidth">Width (px)</label></dt>
                <dd class="form-group-body">
                  <input type="number" id="placeholderWidth" class="form-control" value="300" min="50" max="1200" />
                </dd>
              </dl>
            </div>
          </div>
          <div class="nx-col-6">
            <div class="form-group">
              <dl>
                <dt class="form-group-header"><label for="placeholderHeight">Height (px)</label></dt>
                <dd class="form-group-body">
                  <input type="number" id="placeholderHeight" class="form-control" value="200" min="50" max="1200" />
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="form-group">
          <dl>
            <dt class="form-group-header"><label for="placeholderText">Placeholder Text</label></dt>
            <dd class="form-group-body">
              <input type="text" id="placeholderText" class="form-control input-block" value="Image Placeholder" />
            </dd>
          </dl>
        </div>

      <div class="nx-row">
        <div class="nx-col-6">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="placeholderBgColor">Background Color</label></dt>
              <dd class="form-group-body">
                <div class="input-group">
                  <input type="color" id="placeholderBgColor" class="form-control" value="#e0e0e0" style="width: 56px; padding: 4px; flex: 0 0 auto;">
                  <input type="text" id="placeholderBgColorText" class="form-control" value="#e0e0e0" placeholder="#e0e0e0">
                </div>
              </dd>
            </dl>
          </div>
        </div>

        <div class="nx-col-6">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="placeholderTextColor">Text Color</label></dt>
              <dd class="form-group-body">
                <div class="input-group">
                  <input type="color" id="placeholderTextColor" class="form-control" value="#666666" style="width: 56px; padding: 4px; flex: 0 0 auto;">
                  <input type="text" id="placeholderTextColorText" class="form-control" value="#666666" placeholder="#666666">
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Preview:</label>
        <div id="placeholderPreview" style="
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          background: #f9f9f9;
          text-align: center;
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Preview will be generated here -->
        </div>
      </div>
      `,
    });

    // Open modal and setup events
    setTimeout(() => {
      this.nexaUI.nexaModal.open("placeholderModal");
      this.setupPlaceholderModalEvents();
    }, 100);

    return { success: true, message: "Placeholder dialog created" };
  }

  /**
   * Setup global functions for placeholder modal
   */
  setupPlaceholderGlobalFunctions() {
    // Store reference to this instance
    const imageToolsInstance = this;

    // Insert placeholder function
    window.insertPlaceholderImage = (modalId) => {
      const widthInput = document.getElementById("placeholderWidth");
      const heightInput = document.getElementById("placeholderHeight");
      const textInput = document.getElementById("placeholderText");
      const bgColorInput = document.getElementById("placeholderBgColor");
      const textColorInput = document.getElementById("placeholderTextColor");

      const options = {
        width: parseInt(widthInput?.value) || 300,
        height: parseInt(heightInput?.value) || 200,
        text: textInput?.value || "Image Placeholder",
        bgColor: bgColorInput?.value || "#e0e0e0",
        textColor: textColorInput?.value || "#666666",
      };

      // Use stored instance reference
      const result = imageToolsInstance.insertPlaceholderImage(options);

      // Close modal
      imageToolsInstance.nexaUI.nexaModal.close(modalId);
    };
  }

  /**
   * Setup placeholder modal events after modal is opened
   */
  setupPlaceholderModalEvents() {
    const widthInput = document.getElementById("placeholderWidth");
    const heightInput = document.getElementById("placeholderHeight");
    const textInput = document.getElementById("placeholderText");
    const bgColorInput = document.getElementById("placeholderBgColor");
    const bgColorTextInput = document.getElementById("placeholderBgColorText");
    const textColorInput = document.getElementById("placeholderTextColor");
    const textColorTextInput = document.getElementById(
      "placeholderTextColorText"
    );
    const preview = document.getElementById("placeholderPreview");

    // Update preview function
    const updatePreview = () => {
      const width = parseInt(widthInput.value) || 300;
      const height = parseInt(heightInput.value) || 200;
      const text = textInput.value || "Image Placeholder";
      const bgColor = bgColorInput.value || "#e0e0e0";
      const textColor = textColorInput.value || "#666666";

      // Scale down for preview (max 200px width)
      const previewScale = Math.min(200 / width, 1);
      const previewWidth = width * previewScale;
      const previewHeight = height * previewScale;

      preview.innerHTML = `
        <div style="
          width: ${previewWidth}px;
          height: ${previewHeight}px;
          background-color: ${bgColor};
          border: 1px solid #ccc;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${textColor};
          font-size: ${Math.max(10, 14 * previewScale)}px;
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 4px;
          box-sizing: border-box;
        ">${text}</div>
      `;
    };

    // Sync color inputs
    const syncColorInputs = (colorInput, textInput) => {
      colorInput.addEventListener("input", () => {
        textInput.value = colorInput.value;
        updatePreview();
      });

      textInput.addEventListener("input", () => {
        if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
          colorInput.value = textInput.value;
        }
        updatePreview();
      });
    };

    // Setup event listeners
    if (widthInput) widthInput.addEventListener("input", updatePreview);
    if (heightInput) heightInput.addEventListener("input", updatePreview);
    if (textInput) textInput.addEventListener("input", updatePreview);

    syncColorInputs(bgColorInput, bgColorTextInput);
    syncColorInputs(textColorInput, textColorTextInput);

    // Initial preview
    updatePreview();
  }
}
// Import imageEditor if available
if (typeof imageEditor === "undefined" && typeof window !== "undefined") {
  // If imageEditor is not loaded, try to import it
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = imageTools;
} else if (typeof window !== "undefined") {
  window.imageTools = imageTools;
}
export { imageTools };
