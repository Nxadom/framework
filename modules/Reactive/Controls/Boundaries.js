/**
 * Resizable.js - Sortable Functionality for Elements
 * Provides drag-and-drop sortable functionality for container elements
 * Uses jQuery UI Sortable for better stability and features
 */

class Boundaries {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Initialize sortable element tracking
    this.sortableElements = new Set();

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = Boundaries;
} else if (typeof window !== "undefined") {
  window.Boundaries = Boundaries;
}

export { Resizable };
