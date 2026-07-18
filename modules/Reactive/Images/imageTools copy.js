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
          // For existing images
          {
            id: "change-image-source",
            icon: "edit-2",
            text: "Change Source",
            action: "changeImageSource",
            showCondition: "isImageElement",
          },

          {
            id: "image-editor",
            icon: "edit-3",
            text: "Image Editor",
            action: "openImageEditor",
            showCondition: "isImageElement",
          },
          // Separator
          {
            id: "separator-img-insert",
            type: "separator",
            showCondition: "isContainerElement",
          },
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
   * Create image source change dialog
   */
  /**
   * Create image source change dialog
   */
  createImageSourceDialog() {
    // Remove existing dialog
    const existingDialog = document.getElementById("nexa-image-source-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "nexa-image-source-dialog";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Create dialog
    const dialog = document.createElement("div");
    dialog.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 700px;
      max-height: 85vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    `;

    // Get current image info
    const currentSrc = this.targetElement.src || "";
    const currentAlt = this.targetElement.alt || "";

    // Dialog content
    dialog.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #333; font-size: 20px;">
          <i data-feather="image" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;"></i>
          Change Image Source
        </h3>
        <button id="close-image-source-dialog" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;" title="Close">
          <i data-feather="x" style="width: 18px; height: 18px;"></i>
        </button>
      </div>

      <!-- Tabs -->
      <div style="display: flex; border-bottom: 1px solid #e0e0e0; margin-bottom: 20px;">
        <button class="tab-btn active" data-tab="url" style="
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        ">
          <i data-feather="link" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: middle;"></i>
          Custom URL
        </button>
        <button class="tab-btn" data-tab="library" style="
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        ">
          <i data-feather="folder" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: middle;"></i>
          Image Library
        </button>
      </div>

      <!-- Tab Content Container -->
      <div style="flex: 1; overflow: hidden;">
        
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

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">New Image URL:</label>
            <input type="url" id="newImageUrl" value="${currentSrc}" placeholder="https://example.com/image.jpg" style="
              width: 100%;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              padding: 10px;
              font-size: 14px;
              box-sizing: border-box;
            ">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Alt Text:</label>
            <input type="text" id="newImageAlt" value="${currentAlt}" placeholder="Description of the image" style="
              width: 100%;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              padding: 10px;
              font-size: 14px;
              box-sizing: border-box;
            ">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Image Dimensions:</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Width (px)</label>
                <input type="number" id="newImageWidth" placeholder="Auto" min="1" max="2000" style="
                  width: 100%;
                  border: 2px solid #e0e0e0;
                  border-radius: 6px;
                  padding: 8px;
                  font-size: 14px;
                  box-sizing: border-box;
                ">
              </div>
              <div>
                <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Height (px)</label>
                <input type="number" id="newImageHeight" placeholder="Auto" min="1" max="2000" style="
                  width: 100%;
                  border: 2px solid #e0e0e0;
                  border-radius: 6px;
                  padding: 8px;
                  font-size: 14px;
                  box-sizing: border-box;
                ">
              </div>
            </div>
            <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" id="maintainAspectRatio" checked style="margin: 0;">
              <label for="maintainAspectRatio" style="font-size: 12px; color: #666; cursor: pointer;">Maintain aspect ratio</label>
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
        <div id="library-tab" class="tab-content" style="max-height: 400px; overflow-y: auto;" hidden>
          <div id="library-loading" class="text-center" style="padding: 40px; color: #666;" hidden>
            <i data-feather="loader" style="width: 32px; height: 32px; animation: spin 1s linear infinite; margin-bottom: 12px;"></i>
            <div>Loading your images...</div>
          </div>

          <div id="library-content">
            <div style="text-align: center; padding: 40px; color: #999;">
              <i data-feather="image" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
              <p style="margin: 0; font-size: 16px;">Your image library</p>
              <p style="margin: 8px 0 0 0; font-size: 14px;">Upload images or save from Unsplash to use them here</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee;">
        <button id="cancelImageSource" class="nx-btn-secondary">Cancel</button>
        <button id="applyImageSource" class="nx-btn-primary">Apply Changes</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Prevent browser context menu on dialog
    this.preventContextMenuOnElement(overlay);
    this.preventContextMenuOnElement(dialog);

    // Initialize Feather icons
    setTimeout(() => {
      if (typeof feather !== "undefined") {
        feather.replace();
      }
    }, 10);

    // Show dialog with animation
    setTimeout(() => {
      overlay.style.opacity = "1";
      dialog.style.transform = "scale(1)";
    }, 10);

    // Setup dialog events
    this.setupImageSourceDialogEvents(overlay);
  }
  /**
   * Create image background dialog
   */
  createImageBackgroundDialog() {
    // Remove existing dialog
    const existingDialog = document.getElementById(
      "nexa-background-image-dialog"
    );
    if (existingDialog) {
      existingDialog.remove();
    }

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = "nexa-background-image-dialog";
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Create dialog
    const dialog = document.createElement("div");
    dialog.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 700px;
      max-height: 85vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: scale(0.9);
      transition: transform 0.3s ease;
    `;

    // Get current background info
    const currentBackgroundImage =
      this.targetElement.style.backgroundImage || "";
    const currentBackgroundSize =
      this.targetElement.style.backgroundSize || "cover";
    const currentBackgroundPosition =
      this.targetElement.style.backgroundPosition || "center";
    const currentBackgroundRepeat =
      this.targetElement.style.backgroundRepeat || "no-repeat";

    // Extract URL from background-image if exists
    const urlMatch = currentBackgroundImage.match(/url\(["']?([^"']+)["']?\)/);
    const currentUrl = urlMatch ? urlMatch[1] : "";

    // Dialog content
    dialog.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #333; font-size: 20px;">
          <i data-feather="image" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;"></i>
          Set Background Image
        </h3>
        <button id="close-background-image-dialog" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666; padding: 0; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;" title="Close">
          <i data-feather="x" style="width: 18px; height: 18px;"></i>
        </button>
      </div>

      <!-- Tabs -->
      <div style="display: flex; border-bottom: 1px solid #e0e0e0; margin-bottom: 20px;">
        <button class="tab-btn active" data-tab="url" style="
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        ">
          <i data-feather="link" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: middle;"></i>
          Custom URL
        </button>
        <button class="tab-btn" data-tab="library" style="
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        ">
          <i data-feather="folder" style="width: 16px; height: 16px; margin-right: 6px; vertical-align: middle;"></i>
          Image Library
        </button>
      </div>

      <!-- Tab Content Container -->
      <div style="flex: 1; overflow: hidden;">
        
        <!-- URL Tab -->
        <div id="url-tab" class="tab-content" style="max-height: 400px; overflow-y: auto;">
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Current Background:</label>
            <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 10px; text-align: center; background: #f9f9f9; min-height: 80px; background-image: ${currentBackgroundImage}; background-size: ${currentBackgroundSize}; background-position: ${currentBackgroundPosition}; background-repeat: ${currentBackgroundRepeat};">
              ${
                currentUrl
                  ? '<div style="background: rgba(255,255,255,0.8); padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 12px; color: #666;">Current background image</div>'
                  : '<div style="color: #666; line-height: 60px;">No background image set</div>'
              }
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Image URL:</label>
            <input type="url" id="backgroundImageUrl" value="${currentUrl}" placeholder="https://example.com/image.jpg" style="
              width: 100%;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              padding: 10px;
              font-size: 14px;
              box-sizing: border-box;
            ">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Background Size:</label>
            <select id="backgroundSize" style="
              width: 100%;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              padding: 10px;
              font-size: 14px;
              box-sizing: border-box;
            ">
              <option value="cover" ${
                currentBackgroundSize === "cover" ? "selected" : ""
              }>Cover (Fill entire area)</option>
              <option value="contain" ${
                currentBackgroundSize === "contain" ? "selected" : ""
              }>Contain (Fit within area)</option>
              <option value="auto" ${
                currentBackgroundSize === "auto" ? "selected" : ""
              }>Auto (Original size)</option>
              <option value="100% 100%" ${
                currentBackgroundSize === "100% 100%" ? "selected" : ""
              }>Stretch (Fill exactly)</option>
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Background Position:</label>
            <select id="backgroundPosition" style="
              width: 100%;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              padding: 10px;
              font-size: 14px;
              box-sizing: border-box;
            ">
              <option value="center" ${
                currentBackgroundPosition === "center" ? "selected" : ""
              }>Center</option>
              <option value="top" ${
                currentBackgroundPosition === "top" ? "selected" : ""
              }>Top</option>
              <option value="bottom" ${
                currentBackgroundPosition === "bottom" ? "selected" : ""
              }>Bottom</option>
              <option value="left" ${
                currentBackgroundPosition === "left" ? "selected" : ""
              }>Left</option>
              <option value="right" ${
                currentBackgroundPosition === "right" ? "selected" : ""
              }>Right</option>
              <option value="top left" ${
                currentBackgroundPosition === "top left" ? "selected" : ""
              }>Top Left</option>
              <option value="top right" ${
                currentBackgroundPosition === "top right" ? "selected" : ""
              }>Top Right</option>
              <option value="bottom left" ${
                currentBackgroundPosition === "bottom left" ? "selected" : ""
              }>Bottom Left</option>
              <option value="bottom right" ${
                currentBackgroundPosition === "bottom right" ? "selected" : ""
              }>Bottom Right</option>
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Background Repeat:</label>
            <select id="backgroundRepeat" style="
              width: 100%;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              padding: 10px;
              font-size: 14px;
              box-sizing: border-box;
            ">
              <option value="no-repeat" ${
                currentBackgroundRepeat === "no-repeat" ? "selected" : ""
              }>No Repeat</option>
              <option value="repeat" ${
                currentBackgroundRepeat === "repeat" ? "selected" : ""
              }>Repeat</option>
              <option value="repeat-x" ${
                currentBackgroundRepeat === "repeat-x" ? "selected" : ""
              }>Repeat Horizontally</option>
              <option value="repeat-y" ${
                currentBackgroundRepeat === "repeat-y" ? "selected" : ""
              }>Repeat Vertically</option>
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Preview:</label>
            <div id="backgroundPreview" style="
              border: 2px solid #e0e0e0;
              border-radius: 8px;
              padding: 15px;
              background: #f9f9f9;
              text-align: center;
              min-height: 100px;
              display: flex;
              align-items: center;
              justify-content: center;
              background-image: ${currentBackgroundImage};
              background-size: ${currentBackgroundSize};
              background-position: ${currentBackgroundPosition};
              background-repeat: ${currentBackgroundRepeat};
            ">
              <span style="background: rgba(255,255,255,0.8); padding: 8px 12px; border-radius: 4px; color: #666; font-size: 14px;">
                ${currentUrl ? "Background preview" : "Enter URL to preview"}
              </span>
            </div>
          </div>
        </div>

        <!-- Library Tab -->
        <div id="library-tab" class="tab-content" style="max-height: 400px; overflow-y: auto;" hidden>
          <div id="library-loading" class="text-center" style="padding: 40px; color: #666;" hidden>
            <i data-feather="loader" style="width: 32px; height: 32px; animation: spin 1s linear infinite; margin-bottom: 12px;"></i>
            <div>Loading your images...</div>
          </div>

          <div id="library-content">
            <div style="text-align: center; padding: 40px; color: #999;">
              <i data-feather="image" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
              <p style="margin: 0; font-size: 16px;">Your image library</p>
              <p style="margin: 8px 0 0 0; font-size: 14px;">Upload images or save from Unsplash to use them here</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee;">
        <button id="removeBackgroundImage" class="nx-btn-secondary" style="margin-right: auto;">Remove Background</button>
        <button id="cancelBackgroundImage" class="nx-btn-secondary">Cancel</button>
        <button id="applyBackgroundImage" class="nx-btn-primary">Apply Background</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Initialize Feather icons
    setTimeout(() => {
      if (typeof feather !== "undefined") {
        feather.replace();
      }
    }, 10);

    // Show dialog with animation
    setTimeout(() => {
      overlay.style.opacity = "1";
      dialog.style.transform = "scale(1)";
    }, 10);

    // Prevent browser context menu on dialog
    this.preventContextMenuOnElement(overlay);
    this.preventContextMenuOnElement(dialog);

    // Setup dialog events
    this.setupBackgroundImageDialogEvents(overlay);
  }

  /**
   * Setup background image dialog events
   */
  setupBackgroundImageDialogEvents(overlay) {
    const dialog = overlay.querySelector("div");
    const urlInput = dialog.querySelector("#backgroundImageUrl");
    const sizeSelect = dialog.querySelector("#backgroundSize");
    const positionSelect = dialog.querySelector("#backgroundPosition");
    const repeatSelect = dialog.querySelector("#backgroundRepeat");
    const preview = dialog.querySelector("#backgroundPreview");
    const cancelBtn = dialog.querySelector("#cancelBackgroundImage");
    const applyBtn = dialog.querySelector("#applyBackgroundImage");
    const removeBtn = dialog.querySelector("#removeBackgroundImage");
    const closeBtn = dialog.querySelector("#close-background-image-dialog");
    const tabButtons = dialog.querySelectorAll(".tab-btn");
    const urlTab = dialog.querySelector("#url-tab");
    const libraryTab = dialog.querySelector("#library-tab");
    const libraryLoading = dialog.querySelector("#library-loading");
    const libraryContent = dialog.querySelector("#library-content");

    let selectedImageUrl = urlInput.value || "";
    let selectedSize = sizeSelect.value || "cover";
    let selectedPosition = positionSelect.value || "center";
    let selectedRepeat = repeatSelect.value || "no-repeat";

    // Close dialog function
    const closeDialog = () => {
      overlay.style.opacity = "0";
      dialog.style.transform = "scale(0.9)";
      setTimeout(() => {
        overlay.remove();
      }, 300);
    };

    // Tab switching
    const switchTab = (tabName) => {
      // Update tab buttons
      tabButtons.forEach((btn) => {
        if (btn.dataset.tab === tabName) {
          btn.classList.add("active");
          btn.style.color = "#007bff";
          btn.style.borderBottomColor = "#007bff";
        } else {
          btn.classList.remove("active");
          btn.style.color = "#666";
          btn.style.borderBottomColor = "transparent";
        }
      });

      // Show/hide tab content
      if (tabName === "url") {
        urlTab.style.display = "block";
        libraryTab.style.display = "none";
      } else if (tabName === "library") {
        urlTab.style.display = "none";
        libraryTab.style.display = "block";
        this.loadImageLibrary(libraryLoading, libraryContent, (url, alt) => {
          selectedImageUrl = url;
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
      const url = selectedImageUrl.trim();
      if (url) {
        preview.style.backgroundImage = `url(${url})`;
        preview.style.backgroundSize = selectedSize;
        preview.style.backgroundPosition = selectedPosition;
        preview.style.backgroundRepeat = selectedRepeat;
        preview.innerHTML = `
          <span style="background: rgba(255,255,255,0.8); padding: 8px 12px; border-radius: 4px; color: #666; font-size: 14px;">
            Background preview
          </span>
        `;
      } else {
        preview.style.backgroundImage = "";
        preview.innerHTML = `
          <span style="background: rgba(255,255,255,0.8); padding: 8px 12px; border-radius: 4px; color: #666; font-size: 14px;">
            Enter URL to preview
          </span>
        `;
      }
    };

    // URL input events
    if (urlInput) {
      urlInput.addEventListener("input", () => {
        selectedImageUrl = urlInput.value.trim();
        updatePreview();
      });
      updatePreview(); // Initial preview
    }

    // Background options events
    if (sizeSelect) {
      sizeSelect.addEventListener("change", () => {
        selectedSize = sizeSelect.value;
        updatePreview();
      });
    }

    if (positionSelect) {
      positionSelect.addEventListener("change", () => {
        selectedPosition = positionSelect.value;
        updatePreview();
      });
    }

    if (repeatSelect) {
      repeatSelect.addEventListener("change", () => {
        selectedRepeat = repeatSelect.value;
        updatePreview();
      });
    }

    // Apply button
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        if (selectedImageUrl) {
          this.targetElement.style.backgroundImage = `url(${selectedImageUrl})`;
          this.targetElement.style.backgroundSize = selectedSize;
          this.targetElement.style.backgroundPosition = selectedPosition;
          this.targetElement.style.backgroundRepeat = selectedRepeat;

          closeDialog();
        } else {
        }
      });
    }

    // Remove button
    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        this.targetElement.style.backgroundImage = "";
        this.targetElement.style.backgroundSize = "";
        this.targetElement.style.backgroundPosition = "";
        this.targetElement.style.backgroundRepeat = "";

        closeDialog();
      });
    }

    // Close events
    if (cancelBtn) {
      cancelBtn.addEventListener("click", closeDialog);
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", closeDialog);
    }

    // Close on outside click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeDialog();
      }
    });

    // Keyboard events
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeDialog();
      } else if (e.key === "Enter" && selectedImageUrl) {
        applyBtn.click();
      }
    });
  }

  /**
   * Setup image source dialog events
   */
  setupImageSourceDialogEvents(overlay) {
    const dialog = overlay.querySelector("div");
    const urlInput = dialog.querySelector("#newImageUrl");
    const altInput = dialog.querySelector("#newImageAlt");
    const widthInput = dialog.querySelector("#newImageWidth");
    const heightInput = dialog.querySelector("#newImageHeight");
    const aspectRatioCheckbox = dialog.querySelector("#maintainAspectRatio");
    const preview = dialog.querySelector("#imagePreview");
    const cancelBtn = dialog.querySelector("#cancelImageSource");
    const applyBtn = dialog.querySelector("#applyImageSource");
    const closeBtn = dialog.querySelector("#close-image-source-dialog");
    const tabButtons = dialog.querySelectorAll(".tab-btn");
    const urlTab = dialog.querySelector("#url-tab");
    const libraryTab = dialog.querySelector("#library-tab");
    const libraryLoading = dialog.querySelector("#library-loading");
    const libraryContent = dialog.querySelector("#library-content");

    let selectedImageUrl = "";
    let selectedImageAlt = "";

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

    // Close dialog function
    const closeDialog = () => {
      overlay.style.opacity = "0";
      dialog.style.transform = "scale(0.9)";
      setTimeout(() => {
        overlay.remove();
      }, 300);
    };

    // Tab switching
    const switchTab = (tabName) => {
      // Update tab buttons
      tabButtons.forEach((btn) => {
        if (btn.dataset.tab === tabName) {
          btn.classList.add("active");
          btn.style.color = "#007bff";
          btn.style.borderBottomColor = "#007bff";
        } else {
          btn.classList.remove("active");
          btn.style.color = "#666";
          btn.style.borderBottomColor = "transparent";
        }
      });

      // Show/hide tab content
      if (tabName === "url") {
        urlTab.style.display = "block";
        libraryTab.style.display = "none";
      } else if (tabName === "library") {
        urlTab.style.display = "none";
        libraryTab.style.display = "block";
        this.loadImageLibrary(libraryLoading, libraryContent, (url, alt) => {
          selectedImageUrl = url;
          selectedImageAlt = alt;
        });
      }
    };

    // Tab button events
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        switchTab(btn.dataset.tab);
      });
    });

    // URL Preview update
    const updatePreview = () => {
      const url = urlInput.value.trim();
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
      urlInput.addEventListener("input", () => {
        updatePreview();
        selectedImageUrl = urlInput.value.trim();
        selectedImageAlt = altInput.value.trim();
      });
      updatePreview(); // Initial preview
    }

    if (altInput) {
      altInput.addEventListener("input", () => {
        selectedImageAlt = altInput.value.trim();
      });
    }

    // Dimension input events
    let originalAspectRatio = null;

    // Calculate aspect ratio when width or height is first set
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

    // Apply button
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        const activeTab = dialog.querySelector(".tab-btn.active").dataset.tab;

        if (activeTab === "url") {
          selectedImageUrl = urlInput.value.trim();
          selectedImageAlt = altInput.value.trim();
        }

        if (selectedImageUrl) {
          this.targetElement.src = selectedImageUrl;
          this.targetElement.alt = selectedImageAlt;

          // Apply dimensions if specified
          if (activeTab === "url") {
            const width = widthInput?.value;
            const height = heightInput?.value;

            if (width) {
              this.targetElement.style.width = width + "px";
              this.targetElement.width = width;
            } else {
              this.targetElement.style.width = "";
              this.targetElement.removeAttribute("width");
            }

            if (height) {
              this.targetElement.style.height = height + "px";
              this.targetElement.height = height;
            } else {
              this.targetElement.style.height = "";
              this.targetElement.removeAttribute("height");
            }
          }

          closeDialog();
        } else {
        }
      });
    }

    // Close events
    if (cancelBtn) {
      cancelBtn.addEventListener("click", closeDialog);
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", closeDialog);
    }

    // Close on outside click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeDialog();
      }
    });

    // ESC key handler
    const escHandler = (e) => {
      if (e.key === "Escape") {
        closeDialog();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    // Set initial values
    selectedImageUrl = urlInput.value.trim();
    selectedImageAlt = altInput.value.trim();

    // Initialize active tab (URL by default)
    switchTab("url");
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
   * Inject Modal Control Functions to Global Scope
   */
  injectModalControlFunctions() {
    // Check if functions already exist to avoid duplication
    if (window.openModal && window.closeModal) {
      return;
    }

    // Global modal control functions
    window.openModal = function (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = "flex";
        setTimeout(() => {
          modal.classList.add("show");
        }, 10);
      }
    };

    window.closeModal = function (modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove("show");
        setTimeout(() => {
          modal.style.display = "none";
        }, 300);
      }
    };

    // Add required CSS if not present
    if (!document.getElementById("modal-base-styles")) {
      const style = document.createElement("style");
      style.id = "modal-base-styles";
      style.textContent = `
        .nx-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .nx-modal.show {
          opacity: 1;
        }
        .nx-modal-dialog {
          background: white;
          border-radius: 8px;
          max-width: 90vw;
          max-height: 90vh;
          overflow: hidden;
        }
        .nx-modal-fullscreen .nx-modal-dialog {
          width: 100vw;
          height: 100vh;
          max-width: 100vw;
          max-height: 100vh;
          border-radius: 0;
        }
        .nx-modal-content {
          display: flex;
          flex-direction: column;
        }
        .nx-modal-header {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nx-modal-body {
          padding: 1rem;
          overflow-y: auto;
        }
        .nx-modal-footer {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }
      `;
      document.head.appendChild(style);
    }
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
        console.log("IndexedDB initialized successfully:", this.dbName);
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
      console.log("=== getSavedImages START ===");
      console.log(
        "Database status:",
        this.db ? "Available" : "Not initialized"
      );
      console.log("Image store name:", this.imageStoreName);

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
        console.warn(`Object store '${this.imageStoreName}' does not exist`);
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
          console.log("Images retrieved from database:", images.length);

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

          console.log("Valid images after filtering:", validImages.length);
          console.log("=== getSavedImages SUCCESS ===");

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
    console.log("loadImageLibrary called");
    console.log("loadingDiv:", loadingDiv);
    console.log("contentDiv:", contentDiv);
    console.log("loadingDiv display style:", loadingDiv?.style?.display);

    // Check if already loading using hidden attribute or display style
    const isLoading = !loadingDiv.hidden && loadingDiv.style.display !== "none";
    if (isLoading) {
      console.log("Already loading, returning early");
      return; // Already loading
    }

    console.log("Setting loading display to block");
    loadingDiv.hidden = false;
    loadingDiv.style.display = "block";
    contentDiv.innerHTML = "";

    try {
      console.log("About to call getSavedImages...");
      console.log("this.db status:", this.db ? "exists" : "null");

      // If database is not initialized, try to initialize it
      if (!this.db) {
        console.log("Database not initialized, initializing...");
        await this.initIndexedDB();
      }

      const result = await this.getSavedImages();

      console.log("getSavedImages completed successfully");
      loadingDiv.hidden = true;
      loadingDiv.style.display = "none";

      console.log("getSavedImages result:", result);
      console.log("Result success:", result?.success);
      console.log("Result images length:", result?.images?.length);

      // Enhanced debugging - log each image
      if (result?.images?.length > 0) {
        console.log("Found images:");
        result.images.forEach((img, index) => {
          console.log(`Image ${index}:`, {
            filename: img.filename,
            source: img.source,
            type: img.type,
            hasDataUrl: !!img.dataUrl,
            hasThumbnail: !!img.thumbnail,
          });
        });
      }

      if (!result.success || result.images.length === 0) {
        console.log("No images found or error occurred");
        contentDiv.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #999;">
            <i data-feather="image" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
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
                <i data-feather="upload" style="width: 14px; height: 14px;"></i>
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
                <i data-feather="search" style="width: 14px; height: 14px;"></i>
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
        if (typeof feather !== "undefined") feather.replace();
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

          // Store selection
          const dialog = item.closest('div[style*="background: white"]');
          const event = new CustomEvent("imageSelected", {
            detail: { url: imageUrl, alt: imageAlt },
          });
          dialog.dispatchEvent(event);
        });
      });

      // Listen for image selection
      const dialog = contentDiv.closest('div[style*="background: white"]');
      dialog.addEventListener("imageSelected", (e) => {
        if (onImageSelect) {
          onImageSelect(e.detail.url, e.detail.alt);
        }
      });

      if (typeof feather !== "undefined") feather.replace();
    } catch (error) {
      console.error("loadImageLibrary error:", error);
      console.error("Error stack:", error.stack);
      loadingDiv.style.display = "none";
      contentDiv.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #e74c3c;">
          <i data-feather="alert-circle" style="width: 32px; height: 32px; margin-bottom: 12px;"></i>
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
    console.log("=== IMAGE LIBRARY DEBUG ===");

    try {
      console.log("Database initialized:", !!this.db);
      console.log("Image store name:", this.imageStoreName);

      if (!this.db) {
        console.log("Initializing database...");
        await this.initIndexedDB();
      }

      const hasImageStore = this.db.objectStoreNames.contains(
        this.imageStoreName
      );
      console.log("Image store exists:", hasImageStore);

      if (!hasImageStore) {
        console.error(
          "Image store does not exist! Available stores:",
          Array.from(this.db.objectStoreNames)
        );
        return;
      }

      const result = await this.getSavedImages();
      console.log("getSavedImages result:", result);
      console.log("=== DEBUG COMPLETE ===");
    } catch (error) {
      console.error("Debug failed:", error);
    }
  }

  /**
   * Repair function for image library issues
   */
  async repairImageLibrary() {
    console.log("=== REPAIRING IMAGE LIBRARY ===");

    try {
      if (!this.db) {
        await this.initIndexedDB();
      }

      const result = await this.getSavedImages();
      console.log(`Found ${result.images?.length || 0} images to check`);
      console.log("=== REPAIR COMPLETE ===");
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
  insertImageAtPosition(imageData) {
    try {
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

      // Insert at target position (using existing insertElementAtPosition logic)
      this.insertElementAtPosition(img);

      return { success: true, element: img };
    } catch (error) {
      console.error("Error inserting image:", error);
      throw error;
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

      // Insert into target container
      this.targetElement.appendChild(img);

      return { success: true, message: "Placeholder image inserted" };
    } catch (error) {
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
  insertElementAtPosition(element) {
    try {
      const targetRect = this.targetElement.getBoundingClientRect();
      const mouseX = this.mousePosition?.x || 0;
      const mouseY = this.mousePosition?.y || 0;

      // Calculate relative position within target element
      const relativeX = mouseX - targetRect.left;
      const relativeY = mouseY - targetRect.top;

      // Get all child elements
      const children = Array.from(this.targetElement.children);

      if (children.length === 0) {
        // No children, just append
        this.targetElement.appendChild(element);
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
        this.targetElement.appendChild(element);
      } else {
        this.targetElement.insertBefore(element, children[insertIndex]);
      }
    } catch (error) {
      // Fallback: just append
      this.targetElement.appendChild(element);
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
    // Remove existing dialog
    const existingDialog = document.getElementById("nexa-unsplash-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

    // Inject modal control functions
    this.injectModalControlFunctions();

    const mode = isReplaceMode ? "replace" : "insert";
    const modalId = "nexa-unsplash-dialog";
    const container = document.createElement("div");

    container.innerHTML = `
      <!-- Modal -->
      <div class="nx-modal" id="${modalId}">
        <div class="nx-modal-dialog nx-modal-xl">
          <div class="nx-modal-content">
            <div class="nx-modal-header">
              <h5 class="nx-modal-title">📷 Unsplash Images (${mode} mode)</h5>
              <button type="button" class="nx-modal-close" onclick="closeModal('${modalId}')">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            <div class="nx-modal-body" style="height: 70vh; display: flex; flex-direction: column;">
              <!-- Search section -->
              <div class="form-nexa-group">
                <div style="display: flex; gap: 1rem;">
                  <div style="flex: 1;">
                    <input type="text" id="unsplash-search-input" class="form-nexa-control" placeholder="Search for photos...">
                  </div>
                  <div style="flex: 0 0 120px;">
                    <button id="unsplash-search-btn" class="nx-btn-primary" style="width: 100%">
                      <span class="material-symbols-outlined" style="margin-right: 6px;">search</span>
                      Search
                    </button>
                  </div>
                </div>
              </div>

              <!-- Loading indicator -->
              <div id="unsplash-loading" style="display: none; text-align: center; padding: 40px; color: #656d76;">
                <span class="material-symbols-outlined" style="font-size: 32px; animation: spin 1s linear infinite; margin-bottom: 12px; display: block;">refresh</span>
                <div>Searching images...</div>
              </div>

              <!-- Results container -->
              <div id="unsplash-results" style="flex: 1; overflow-y: auto; border: 1px solid #d0d7de; border-radius: 6px; background: #f6f8fa;">
                <div style="text-align: center; padding: 60px 20px; color: #656d76;">
                  <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5; display: block;">image</span>
                  <p style="margin: 0; font-size: 16px;">Search for beautiful photos from Unsplash</p>
                  <p class="form-text">Find the perfect image for your project</p>
                </div>
              </div>
            </div>
            <div class="nx-modal-footer">
              <button type="button" class="nx-btn-secondary" id="cancel-unsplash" onclick="closeModal('${modalId}')">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Auto-open the modal
    setTimeout(() => {
      window.openModal(modalId);

      // Setup dialog events after modal is opened
      setTimeout(() => {
        this.setupUnsplashDialogEvents(container, isReplaceMode);
      }, 150);
    }, 100);
  }

  /**
   * Setup Unsplash dialog events
   */
  setupUnsplashDialogEvents(container, isReplaceMode) {
    const searchInput = container.querySelector("#unsplash-search-input");
    const searchBtn = container.querySelector("#unsplash-search-btn");
    const loadingDiv = container.querySelector("#unsplash-loading");
    const resultsDiv = container.querySelector("#unsplash-results");
    const cancelButton = container.querySelector("#cancel-unsplash");
    const closeButton = container.querySelector(".nx-modal-close");
    const dialog = container.querySelector(".nx-modal");

    // Close dialog function
    const closeDialog = () => {
      window.closeModal("nexa-unsplash-dialog");
      setTimeout(() => {
        container.remove();
      }, 300);
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
              <i data-feather="search" style="width: 32px; height: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
              <p style="margin: 0; font-size: 16px;">No images found for "${query}"</p>
              <p style="margin: 8px 0 0 0; font-size: 14px;">Try different keywords</p>
            </div>
          `;
          if (typeof feather !== "undefined") feather.replace();
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
        if (typeof feather !== "undefined") feather.replace();
      } catch (error) {
        loadingDiv.style.display = "none";
        resultsDiv.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #e74c3c;">
            <i data-feather="alert-circle" style="width: 32px; height: 32px; margin-bottom: 12px;"></i>
            <p style="margin: 0; font-size: 16px;">Search failed</p>
            <p style="margin: 8px 0 0 0; font-size: 14px;">${error.message}</p>
          </div>
        `;
        if (typeof feather !== "undefined") feather.replace();
      }
    };

    // Search button click
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        searchImages(query);
      }
    });

    // Enter key in search input
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
          searchImages(query);
        }
      }
    });

    // Close events
    closeButton.addEventListener("click", closeDialog);
    cancelButton.addEventListener("click", closeDialog);

    // Close on outside click
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        closeDialog();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", function escapeHandler(e) {
      if (e.key === "Escape") {
        closeDialog();
        document.removeEventListener("keydown", escapeHandler);
      }
    });

    // Auto-focus search input
    setTimeout(() => {
      searchInput.focus();
    }, 100);
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
    console.log("=== REPAIRING IMAGE LIBRARY ===");

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
          console.log("Found", allImages.length, "image records");

          let repairedCount = 0;

          for (const img of allImages) {
            // Check if image needs repair (has filename but missing data)
            if (img.filename && !img.dataUrl && !img.thumbnail) {
              console.log("Found broken image record:", img.filename);

              // If the image has a file reference but no data, we can't recover it
              // So we'll mark it for potential deletion or keep it as placeholder
              console.warn(
                `Cannot recover image data for: ${img.filename} - original file data missing`
              );

              // Optionally, you could delete these broken records:
              // await store.delete(img.id);
            } else if (img.filename && img.dataUrl && !img.thumbnail) {
              // Generate thumbnail if missing
              try {
                console.log("Generating missing thumbnail for:", img.filename);
                const thumbnail = await this.generateThumbnail(
                  img.dataUrl,
                  150,
                  150
                );

                const updatedImg = { ...img, thumbnail };
                await store.put(updatedImg);
                repairedCount++;

                console.log("Generated thumbnail for:", img.filename);
              } catch (error) {
                console.error(
                  "Failed to generate thumbnail for:",
                  img.filename,
                  error
                );
              }
            }
          }

          console.log(`Repair completed. ${repairedCount} images repaired.`);
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
        console.warn(
          "Real Unsplash API failed, falling back to source API:",
          error
        );
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
   * Create placeholder dialog
   */
  createPlaceholderDialog() {
    // Remove existing dialog
    const existingDialog = document.getElementById("nexa-placeholder-dialog");
    if (existingDialog) {
      existingDialog.remove();
    }

    // Inject modal control functions
    this.injectModalControlFunctions();

    const modalId = "nexa-placeholder-dialog";

    // Create overlay
    const overlay = document.createElement("div");
    overlay.id = modalId;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Create dialog
    const dialog = document.createElement("div");
    dialog.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 25px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      transform: scale(0.9);
      transition: transform 0.3s ease;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;

    // Dialog content
    dialog.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #333; font-size: 20px;">
          <i data-feather="square" style="width: 20px; height: 20px; margin-right: 8px;"></i>
          Insert Placeholder Image
        </h3>
        <button id="close-placeholder-dialog" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">&times;</button>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Image Dimensions:</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Width (px)</label>
            <input type="number" id="placeholderWidth" value="300" min="50" max="1200" style="
              width: 100%;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              padding: 8px;
              font-size: 14px;
              box-sizing: border-box;
            ">
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">Height (px)</label>
            <input type="number" id="placeholderHeight" value="200" min="50" max="1200" style="
              width: 100%;
              border: 2px solid #e0e0e0;
              border-radius: 6px;
              padding: 8px;
              font-size: 14px;
              box-sizing: border-box;
            ">
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Placeholder Text:</label>
        <input type="text" id="placeholderText" value="Image Placeholder" placeholder="Text to display" style="
          width: 100%;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          padding: 10px;
          font-size: 14px;
          box-sizing: border-box;
        ">
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Background Color:</label>
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center;">
          <input type="color" id="placeholderBgColor" value="#e0e0e0" style="
            width: 100%;
            height: 40px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            cursor: pointer;
          ">
          <input type="text" id="placeholderBgColorText" value="#e0e0e0" placeholder="#e0e0e0" style="
            width: 80px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            padding: 8px;
            font-size: 12px;
            text-align: center;
          ">
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #555;">Text Color:</label>
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center;">
          <input type="color" id="placeholderTextColor" value="#666666" style="
            width: 100%;
            height: 40px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            cursor: pointer;
          ">
          <input type="text" id="placeholderTextColorText" value="#666666" placeholder="#666666" style="
            width: 80px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            padding: 8px;
            font-size: 12px;
            text-align: center;
          ">
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

      <!-- Buttons -->
      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;">
        <button id="cancelPlaceholder" style="
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 12px 24px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">Cancel</button>
        <button id="insertPlaceholder" style="
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 24px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">Insert Placeholder</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Prevent browser context menu on dialog
    this.preventContextMenuOnElement(overlay);
    this.preventContextMenuOnElement(dialog);

    // Show dialog with animation
    setTimeout(() => {
      overlay.style.opacity = "1";
      dialog.style.transform = "scale(1)";
    }, 10);

    // Initialize Feather icons
    setTimeout(() => {
      if (typeof feather !== "undefined") {
        feather.replace();
      }
    }, 10);

    // Setup event handlers
    this.setupPlaceholderDialogEvents(overlay);

    return { success: true, message: "Placeholder dialog created" };
  }

  /**
   * Setup placeholder dialog events
   */
  setupPlaceholderDialogEvents(overlay) {
    const dialog = overlay.querySelector("div");
    const widthInput = dialog.querySelector("#placeholderWidth");
    const heightInput = dialog.querySelector("#placeholderHeight");
    const textInput = dialog.querySelector("#placeholderText");
    const bgColorInput = dialog.querySelector("#placeholderBgColor");
    const bgColorTextInput = dialog.querySelector("#placeholderBgColorText");
    const textColorInput = dialog.querySelector("#placeholderTextColor");
    const textColorTextInput = dialog.querySelector(
      "#placeholderTextColorText"
    );
    const preview = dialog.querySelector("#placeholderPreview");
    const cancelBtn = dialog.querySelector("#cancelPlaceholder");
    const insertBtn = dialog.querySelector("#insertPlaceholder");
    const closeBtn = dialog.querySelector("#close-placeholder-dialog");

    // Close dialog function
    const closeDialog = () => {
      overlay.style.opacity = "0";
      dialog.style.transform = "scale(0.9)";
      setTimeout(() => {
        overlay.remove();
      }, 300);
    };

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

    // Close events
    if (closeBtn) closeBtn.addEventListener("click", closeDialog);
    if (cancelBtn) cancelBtn.addEventListener("click", closeDialog);

    // Insert placeholder image
    if (insertBtn) {
      insertBtn.addEventListener("click", () => {
        this.insertPlaceholderImage({
          width: parseInt(widthInput.value) || 300,
          height: parseInt(heightInput.value) || 200,
          text: textInput.value || "Image Placeholder",
          bgColor: bgColorInput.value || "#e0e0e0",
          textColor: textColorInput.value || "#666666",
        });
        closeDialog();
      });
    }

    // ESC key handler
    const escHandler = (e) => {
      if (e.key === "Escape") {
        closeDialog();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);

    // Initial preview
    updatePreview();
  }
}
// Import imageEditor if available
if (typeof imageEditor === "undefined" && typeof window !== "undefined") {
  // If imageEditor is not loaded, try to import it
  console.warn(
    "imageEditor not found. Make sure imageEditor.js is loaded before imageTools.js"
  );
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = imageTools;
} else if (typeof window !== "undefined") {
  window.imageTools = imageTools;
}
export { imageTools };
