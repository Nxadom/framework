/**
 * MediaObject.js - Sortable Functionality for Elements
 * Provides drag-and-drop sortable functionality for container elements
 * Uses jQuery UI Sortable for better stability and features
 */

class contentObject {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Initialize sortable element tracking
    this.sortableElements = new Set();

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;
    console.log(this.config?.packages?.data)
  }
  /**
   * Get lightweight Unsplash images for grid (curated selection)
   */

  struktur() {
   const keys = Object.keys(this.config?.packages?.data || {}); 
    return keys.map((key, i) => ({
      id: `content-${i}`,
      icon: "archive",
      text: key,            // tampilkan nama key di sini
      action: "mediaObject",
      showCondition: "hasNoSelectedText",
       submenu: [
              {
                id: "content-Progres",
                icon: "file-text",
                text: "Progres",
                action: "insertMediaBasic",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "content-Percentage",
                icon: "file-text",
                text: "Percentage",
                action: "insertMediaBasic",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "content-Narasi",
                icon: "file-text",
                text: "Narasi",
                action: "insertMediaBasic",
                showCondition: "hasNoSelectedText",
              },
      ]
    }));
  }
}


export { contentObject };
