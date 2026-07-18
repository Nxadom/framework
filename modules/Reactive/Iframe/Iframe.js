/**
 * chartElements.js - Sortable Functionality for Elements
 * Provides drag-and-drop sortable functionality for container elements
 * Uses jQuery UI Sortable for better stability and features
 */

class Iframe {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Initialize sortable element tracking
    this.sortableElements = new Set();

    // Get nexaUI reference or initialize if not available
    this.nexaUI =
      interactions.nexaUI || (typeof NexaUI !== "undefined" ? NexaUI() : null);
  }
  struktur() {
    return [
      {
        id: "iframe-elements",
        icon: "monitor",
        text: "Iframe Elements",
        action: "iframeElements",
        showCondition: "hasNoSelectedText",
        submenu: [
          {
            id: "iframe-pdf",
            icon: "file-text",
            text: "PDF Embed",
            action: "insertIframePdf",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "iframe-youtube",
            icon: "play",
            text: "YouTube Embed",
            action: "insertIframeYoutube",
            showCondition: "hasNoSelectedText",
          },
          {
            id: "iframe-custom",
            icon: "link",
            text: "Custom URL",
            action: "insertIframeCustom",
            showCondition: "hasNoSelectedText",
          },
        ],
      },
    ];
  }

  /**
   * Handle iframe action cases
   */
  handleAction(action, targetElement) {
    try {
      console.log(
        `🎯 Iframe handleAction called with action: ${action}`,
        targetElement
      );

      switch (action) {
        case "iframeElements":
          // Parent menu item - submenu handles the actual actions
          return { success: true, message: "Iframe menu opened" };
        case "insertIframePdf":
          return this.contextInsertIframe("pdf", targetElement);
        case "insertIframeYoutube":
          return this.contextInsertIframe("youtube", targetElement);
        case "insertIframeCustom":
          return this.contextInsertIframe("custom", targetElement);
        default:
          return { success: false, error: `Unknown iframe action: ${action}` };
      }
    } catch (error) {
      console.error(`❌ Error in Iframe handleAction:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Context menu: Insert iframe element
   */
  contextInsertIframe(iframeType, targetElement) {
    try {
      console.log(
        `🎯 contextInsertIframe called with type: ${iframeType}`,
        targetElement
      );

      // Use provided targetElement or fall back to interactions.targetElement
      const target = targetElement || this.interactions.targetElement;

      if (!target) {
        console.error("❌ No target element available for iframe insertion");
        return { success: false, error: "No target element" };
      }

      // Store the target element for later use
      this.currentTargetElement = target;

      // Show URL input modal based on iframe type
      this.showIframeUrlModal(iframeType);

      return { success: true, message: `${iframeType} iframe modal opened` };
    } catch (error) {
      console.error("❌ Error in contextInsertIframe:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Show iframe URL input modal using NexaUI standard
   */
  showIframeUrlModal(iframeType) {
    try {
      // Initialize NexaUI
      const nexaUI = this.nexaUI || (typeof NexaUI !== "undefined" ? NexaUI() : null);

      const modalId = `iframeModal-${Date.now()}`;

      let modalTitle = "";
      let placeholder = "";
      let description = "";
      let helpText = "";

      switch (iframeType) {
        case "pdf":
          modalTitle = "Insert PDF Document";
          placeholder = "https://example.com/document.pdf";
          description =
            "Enter the URL or local path of a PDF document to embed.";
          helpText = "URL (https://...) atau path lokal (file:///C:/path/to/file.pdf)";
          break;
        case "youtube":
          modalTitle = "Insert YouTube Video";
          placeholder = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
          description = "Enter a YouTube URL or video ID to embed the video.";
          helpText =
            "Supported formats: youtube.com/watch?v=ID, youtu.be/ID, or just the video ID";
          break;
        case "custom":
          modalTitle = "Insert Custom Iframe";
          placeholder = "https://example.com";
          description = "Enter any URL to embed as an iframe.";
          helpText = "Enter a valid URL starting with http:// or https://";
          break;
        default:
          modalTitle = "Insert Iframe";
          placeholder = "https://example.com";
          description = "Enter a URL to embed as an iframe.";
          helpText = "Enter a valid URL starting with http:// or https://";
      }

      // Create modal using NexaUI standard method
      nexaUI.modalHTML({
        elementById: modalId,
        styleClass: "w-600px",
        label: modalTitle,
        onclick: {
          title: "Insert Iframe",
          cancel: "Cancel",
          send: `insertIframeFromNexaModal_${iframeType}`,
        },
        content: `
          <p style="color: #6c757d; margin-bottom: 1rem">${description}</p>
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="iframeUrl-${modalId}">URL</label></dt>
              <dd class="form-group-body">
                <input type="url" id="iframeUrl-${modalId}" class="form-control input-block" required />
                <p class="note">${helpText}</p>
              </dd>
            </dl>
          </div>
        `,
      });

      // Store modalId and iframeType for callback
      this.currentModalData = { modalId, iframeType };

      // Define global callback function
      window[`insertIframeFromNexaModal_${iframeType}`] = (modalId) => {
        this.insertIframeFromNexaModal(modalId, iframeType);
      };

      // Define global close function if not exists
      if (!window.closeModal) {
        window.closeModal = function (modalId) {
          nexaUI.nexaModal.close(modalId);
        };
      }

      // Open modal
      nexaUI.nexaModal.open(modalId);
    } catch (error) {
      console.error("Error showing iframe modal:", error);
    }
  }

  /**
   * Insert iframe from NexaUI modal
   */
  async insertIframeFromNexaModal(modalId, iframeType) {
    try {
      const urlInput = document.getElementById(`iframeUrl-${modalId}`);
      const url = urlInput ? urlInput.value.trim() : "";

      if (!url) {
        alert("Please enter a valid URL");
        return;
      }

      // Close the modal using NexaUI
      const nexaUI = this.nexaUI || (typeof NexaUI !== "undefined" ? NexaUI() : null);
      nexaUI?.nexaModal?.close(modalId);

      // Create and insert the iframe
      const result = await this.createAndInsertIframe(iframeType, url);

      // Clean up global function
      delete window[`insertIframeFromNexaModal_${iframeType}`];

      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("❌ Error inserting iframe from modal:", error);
      alert(`Error inserting iframe: ${error.message}`);
    }
  }

  /**
   * Create and insert iframe element
   */
  async createAndInsertIframe(iframeType, url) {
    try {
      let processedUrl = url;
      let displayName = "";

      // Process URL based on iframe type
      switch (iframeType) {
        case "pdf":
          processedUrl = url;
          displayName = "PDF Embed";
          break;

        case "youtube":
          processedUrl = await this.convertToYouTubeEmbed(url);
          displayName = "YouTube Embed";
          break;

        case "custom":
          processedUrl = url;
          displayName = "Custom Iframe";
          break;

        default:
          processedUrl = url;
          displayName = "Iframe";
      }

      console.log(`📺 Processed URL: ${processedUrl}`);

      // Create iframe element
      const iframe = this.createIframeElement(processedUrl, iframeType);
      console.log(`✅ Iframe element created:`, iframe);

      // Use the stored target element or fallback
      const targetElement =
        this.currentTargetElement || this.interactions.targetElement;

      if (!targetElement) {
        throw new Error("No target element available for insertion");
      }

      console.log(`🎯 Target element for insertion:`, targetElement);

      if (this.interactions?.insertElementAtPosition) {
        this.interactions.targetElement = targetElement;
        this.interactions.insertElementAtPosition(iframe);
      } else if (targetElement.parentNode) {
        targetElement.parentNode.insertBefore(iframe, targetElement.nextSibling);
      } else {
        targetElement.appendChild(iframe);
      }

      // Clear stored target element
      this.currentTargetElement = null;

      // Add visual feedback
      this.showSuccessMessage(`${displayName} inserted successfully!`);

      console.log(`🎉 ${displayName} inserted successfully`);
      return { success: true, message: `${displayName} inserted` };
    } catch (error) {
      console.error(`❌ Error creating/inserting iframe:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert YouTube URL to embed format — async karena butuh server URL via IPC
   */
  async convertToYouTubeEmbed(url) {
    try {
      let videoId = "";

      if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1].split("&")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      } else if (url.includes("youtube.com/embed/") || url.includes("youtube-nocookie.com/embed/")) {
        const m = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
        videoId = m ? m[1] : null;
        if (!videoId) return url;
      } else if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
        videoId = url;
      } else {
        throw new Error("Invalid YouTube URL format");
      }

      // Ambil server URL via IPC — lebih reliable dari window.NEXA.url di konteks Office
      let base = 'http://127.0.0.1:4130';
      try {
        const serverUrl = await window.electronAPI?.getServerUrl?.();
        if (serverUrl) base = serverUrl.replace(/\/$/, '');
      } catch { /* pakai fallback */ }

      return `${base}/nx-embed/youtube?v=${videoId}`;
    } catch (error) {
      throw new Error(
        "Invalid YouTube URL. Please use a valid YouTube URL or video ID."
      );
    }
  }

  /**
   * Create webview element (Electron native — bypasses CSP frame-src and X-Frame-Options)
   */
  createIframeElement(src, type) {
    const container = document.createElement("div");
    container.className = "nexa-iframe-container";
    container.setAttribute("contenteditable", "false");
    container.style.cssText = `
      position: relative;
      width: 100%;
      margin: 1rem 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;

    const height = type === "youtube" ? "315px" : "500px";

    // Gunakan <webview> Electron agar bypass CSP frame-src & X-Frame-Options
    const webview = document.createElement("webview");
    webview.setAttribute("src", src);
    webview.setAttribute("allowpopups", "");
    webview.style.cssText = `
      display: inline-flex;
      width: 100%;
      height: ${height};
      border: none;
      border-radius: 8px;
    `;

    if (type === "youtube") {
      webview.setAttribute("allowfullscreen", "");
      // Gunakan UA browser agar YouTube tidak blokir embed di Electron
      webview.setAttribute("useragent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    }

    // Loading indicator
    const loadingDiv = document.createElement("div");
    loadingDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #6c757d;
      font-size: 14px;
    `;
    loadingDiv.textContent = "Loading...";

    webview.addEventListener("did-finish-load", () => {
      loadingDiv.style.display = "none";
    });

    container.appendChild(loadingDiv);
    container.appendChild(webview);

    return container;
  }

  /**
   * Show success message to user
   */
  showSuccessMessage(message) {
    // Create a temporary success notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    // Add CSS animation
    if (!document.getElementById("iframe-success-styles")) {
      const style = document.createElement("style");
      style.id = "iframe-success-styles";
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Iframe;
} else if (typeof window !== "undefined") {
  window.Iframe = Iframe;
}

export { Iframe };
