/**
 * Layout.js - Sortable Functionality for Elements
 * Provides drag-and-drop sortable functionality for container elements
 * Uses jQuery UI Sortable for better stability and features
 */

// Import MediaObject class
import { MediaObject } from "./MediaObject.js";

class Layout {
  constructor(interactions, packages) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Initialize sortable element tracking
    this.sortableElements = new Set();

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;

    // Initialize MediaObject instance
    this.mediaObject = new MediaObject(interactions);
  }
  async struktur() {
    // Get MediaObject menu structure
    const mediaObjectMenu = this.mediaObject.struktur();

    return [
      {
        id: "layout-elements",
        icon: "layers",
        text: "Layout Elements",
        action: "layoutElements",
        showCondition: "hasNoSelectedText",
        submenu: [
          ...mediaObjectMenu, // Spread the MediaObject menu items into submenu
        ],
      },
    ];
  }

  // Delegate MediaObject action handlers
  insertMediaBasic() {
    return this.mediaObject.contextInsertMediaObject("basic");
  }

  insertMediaCentered() {
    return this.mediaObject.contextInsertMediaObject("centered");
  }

  insertMediaBottom() {
    return this.mediaObject.contextInsertMediaObject("bottom");
  }

  insertMediaReverse() {
    return this.mediaObject.contextInsertMediaObject("reverse");
  }

  insertMediaSmall() {
    return this.mediaObject.contextInsertMediaObject("small");
  }

  insertMediaLarge() {
    return this.mediaObject.contextInsertMediaObject("large");
  }

  insertMediaBordered() {
    return this.mediaObject.contextInsertMediaObject("bordered");
  }

  insertMediaHover() {
    return this.mediaObject.contextInsertMediaObject("hover");
  }

  insertMediaRound() {
    return this.mediaObject.contextInsertMediaObject("round");
  }

  insertMediaGrayscale() {
    return this.mediaObject.contextInsertMediaObject("grayscale");
  }

  insertMediaBlurred() {
    return this.mediaObject.contextInsertMediaObject("blurred");
  }

  insertMediaSpecific() {
    return this.mediaObject.contextInsertMediaObject("specific");
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Layout;
} else if (typeof window !== "undefined") {
  window.Layout = Layout;
}

export { Layout };
