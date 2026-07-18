/**
 * LeafletMaps.js - Leaflet Maps Integration for Interactive Elements
 * Provides interactive mapping functionality using Leaflet.js
 * Includes various map types, markers, controls, and styling options
 */

class LeafletMaps {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Initialize maps element tracking
    this.mapElements = new Set();

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;

    // Get target element reference
    this.targetElement = null;
  }
  struktur() {
    return [
      {
        id: "leaflet-maps",
        icon: "map-pin",
        text: "Leaflet Maps",
        action: "leafletMaps",
        showCondition: "hasNoSelectedText",
        submenu: [
          {
            id: "basic-maps",
            icon: "map",
            text: "Basic Maps",
            action: "basicMaps",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "simple-map",
                icon: "map",
                text: "Simple Map",
                action: "insertSimpleMap",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "street-map",
                icon: "navigation",
                text: "Street Map",
                action: "insertStreetMap",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "satellite-map",
                icon: "globe",
                text: "Satellite View",
                action: "insertSatelliteMap",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "terrain-map",
                icon: "mountain",
                text: "Terrain Map",
                action: "insertTerrainMap",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "dark-map",
                icon: "moon",
                text: "Dark Mode Map",
                action: "insertDarkMap",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
          {
            id: "interactive-features",
            icon: "mouse-pointer",
            text: "Interactive Features",
            action: "interactiveFeatures",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "map-markers",
                icon: "map-pin",
                text: "Markers & Pins",
                action: "mapMarkers",
                showCondition: "hasNoSelectedText",
                submenu: [
                  {
                    id: "single-marker",
                    icon: "map-pin",
                    text: "Single Marker",
                    action: "insertSingleMarker",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "multiple-markers",
                    icon: "target",
                    text: "Multiple Markers",
                    action: "insertMultipleMarkers",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "custom-markers",
                    icon: "star",
                    text: "Custom Icons",
                    action: "insertCustomMarkers",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "animated-markers",
                    icon: "zap",
                    text: "Animated Markers",
                    action: "insertAnimatedMarkers",
                    showCondition: "hasNoSelectedText",
                  },
                ],
              },
              {
                id: "map-popups",
                icon: "message-square",
                text: "Popup Windows",
                action: "mapPopups",
                showCondition: "hasNoSelectedText",
                submenu: [
                  {
                    id: "simple-popup",
                    icon: "message-square",
                    text: "Simple Popup",
                    action: "insertSimplePopup",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "rich-popup",
                    icon: "file-text",
                    text: "Rich Content Popup",
                    action: "insertRichPopup",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "tooltip",
                    icon: "help-circle",
                    text: "Tooltips",
                    action: "insertTooltip",
                    showCondition: "hasNoSelectedText",
                  },
                ],
              },
              {
                id: "map-controls",
                icon: "sliders",
                text: "Map Controls",
                action: "mapControls",
                showCondition: "hasNoSelectedText",
                submenu: [
                  {
                    id: "zoom-controls",
                    icon: "zoom-in",
                    text: "Zoom Controls",
                    action: "insertZoomControls",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "layer-control",
                    icon: "layers",
                    text: "Layer Control",
                    action: "insertLayerControl",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "scale-control",
                    icon: "ruler",
                    text: "Scale Control",
                    action: "insertScaleControl",
                    showCondition: "hasNoSelectedText",
                  },
                ],
              },
              {
                id: "map-events",
                icon: "mouse-pointer",
                text: "Map Events",
                action: "mapEvents",
                showCondition: "hasNoSelectedText",
                submenu: [
                  {
                    id: "click-events",
                    icon: "mouse-pointer",
                    text: "Click Events",
                    action: "insertClickEvents",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "drag-events",
                    icon: "move",
                    text: "Drag Events",
                    action: "insertDragEvents",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "zoom-events",
                    icon: "zoom-in",
                    text: "Zoom Events",
                    action: "insertZoomEvents",
                    showCondition: "hasNoSelectedText",
                  },
                ],
              },
            ],
          },
          {
            id: "data-visualization",
            icon: "bar-chart-2",
            text: "Data Visualization",
            action: "dataVisualization",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "heatmap",
                icon: "activity",
                text: "Heatmaps",
                action: "insertHeatmap",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "choropleth-map",
                icon: "layers",
                text: "Choropleth Maps",
                action: "insertChoroplethMap",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "geojson-layer",
                icon: "map",
                text: "GeoJSON Layers",
                action: "insertGeoJSONLayer",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "cluster-markers",
                icon: "grid",
                text: "Data Clustering",
                action: "insertClusterMarkers",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "route-planning",
                icon: "navigation",
                text: "Route Planning",
                action: "insertRoutePlanning",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "measurement-tools",
                icon: "ruler",
                text: "Measurement Tools",
                action: "insertMeasurementTools",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
          {
            id: "map-styling",
            icon: "palette",
            text: "Map Styling",
            action: "mapStyling",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "map-themes",
                icon: "palette",
                text: "Map Themes",
                action: "mapThemes",
                showCondition: "hasNoSelectedText",
                submenu: [
                  {
                    id: "light-theme",
                    icon: "sun",
                    text: "Light Theme",
                    action: "applyLightTheme",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "dark-theme",
                    icon: "moon",
                    text: "Dark Theme",
                    action: "applyDarkTheme",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "retro-theme",
                    icon: "archive",
                    text: "Retro Style",
                    action: "applyRetroTheme",
                    showCondition: "hasNoSelectedText",
                  },
                  {
                    id: "custom-theme",
                    icon: "settings",
                    text: "Custom Theme",
                    action: "applyCustomTheme",
                    showCondition: "hasNoSelectedText",
                  },
                ],
              },
              {
                id: "custom-tiles",
                icon: "layers",
                text: "Custom Tile Layers",
                action: "insertCustomTiles",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "map-filters",
                icon: "filter",
                text: "Visual Filters",
                action: "insertMapFilters",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
          {
            id: "location-services",
            icon: "locate",
            text: "Location Services",
            action: "locationServices",
            showCondition: "hasNoSelectedText",
            submenu: [
              {
                id: "geolocation",
                icon: "locate",
                text: "User Geolocation",
                action: "enableGeolocation",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "address-search",
                icon: "search",
                text: "Address Search",
                action: "insertAddressSearch",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "geocoding",
                icon: "map-pin",
                text: "Geocoding",
                action: "insertGeocoding",
                showCondition: "hasNoSelectedText",
              },
              {
                id: "real-time-tracking",
                icon: "navigation",
                text: "Real-time Tracking",
                action: "insertRealTimeTracking",
                showCondition: "hasNoSelectedText",
              },
            ],
          },
        ],
      },
    ];
  }

  /**
   * Handle action execution for Leaflet Maps
   */
  handleAction(action, targetElement) {
    this.targetElement = targetElement;

    switch (action) {
      // Leaflet Maps Actions
      case "leafletMaps":
      case "basicMaps":
      case "interactiveFeatures":
      case "mapMarkers":
      case "mapPopups":
      case "mapControls":
      case "mapEvents":
      case "dataVisualization":
      case "mapStyling":
      case "mapThemes":
      case "locationServices":
        // Parent menu items - submenu handles the actual actions
        break;

      // Basic Maps
      case "insertSimpleMap":
        this.contextInsertLeafletMap("simple");
        break;
      case "insertStreetMap":
        this.contextInsertLeafletMap("street");
        break;
      case "insertSatelliteMap":
        this.contextInsertLeafletMap("satellite");
        break;
      case "insertTerrainMap":
        this.contextInsertLeafletMap("terrain");
        break;
      case "insertDarkMap":
        this.contextInsertLeafletMap("dark");
        break;

      // Interactive Features - Markers
      case "insertSingleMarker":
        this.contextInsertLeafletMap("single-marker");
        break;
      case "insertMultipleMarkers":
        this.contextInsertLeafletMap("multiple-markers");
        break;
      case "insertCustomMarkers":
        this.contextInsertLeafletMap("custom-markers");
        break;
      case "insertAnimatedMarkers":
        this.contextInsertLeafletMap("animated-markers");
        break;

      // Interactive Features - Popups
      case "insertSimplePopup":
        this.contextInsertLeafletMap("simple-popup");
        break;
      case "insertRichPopup":
        this.contextInsertLeafletMap("rich-popup");
        break;
      case "insertTooltip":
        this.contextInsertLeafletMap("tooltip");
        break;

      // Interactive Features - Controls
      case "insertZoomControls":
        this.contextInsertLeafletMap("zoom-controls");
        break;
      case "insertLayerControl":
        this.contextInsertLeafletMap("layer-control");
        break;
      case "insertScaleControl":
        this.contextInsertLeafletMap("scale-control");
        break;

      // Interactive Features - Events
      case "insertClickEvents":
        this.contextInsertLeafletMap("click-events");
        break;
      case "insertDragEvents":
        this.contextInsertLeafletMap("drag-events");
        break;
      case "insertZoomEvents":
        this.contextInsertLeafletMap("zoom-events");
        break;

      // Data Visualization
      case "insertHeatmap":
        this.contextInsertLeafletMap("heatmap");
        break;
      case "insertChoroplethMap":
        this.contextInsertLeafletMap("choropleth");
        break;
      case "insertGeoJSONLayer":
        this.contextInsertLeafletMap("geojson");
        break;
      case "insertClusterMarkers":
        this.contextInsertLeafletMap("cluster");
        break;
      case "insertRoutePlanning":
        this.contextInsertLeafletMap("routing");
        break;
      case "insertMeasurementTools":
        this.contextInsertLeafletMap("measurement");
        break;

      // Map Styling
      case "applyLightTheme":
        this.contextInsertLeafletMap("theme-light");
        break;
      case "applyDarkTheme":
        this.contextInsertLeafletMap("theme-dark");
        break;
      case "applyRetroTheme":
        this.contextInsertLeafletMap("theme-retro");
        break;
      case "applyCustomTheme":
        this.contextInsertLeafletMap("theme-custom");
        break;
      case "insertCustomTiles":
        this.contextInsertLeafletMap("custom-tiles");
        break;
      case "insertMapFilters":
        this.contextInsertLeafletMap("filters");
        break;

      // Location Services
      case "enableGeolocation":
        this.contextInsertLeafletMap("geolocation");
        break;
      case "insertAddressSearch":
        this.contextInsertLeafletMap("address-search");
        break;
      case "insertGeocoding":
        this.contextInsertLeafletMap("geocoding");
        break;
      case "insertRealTimeTracking":
        this.contextInsertLeafletMap("real-time-tracking");
        break;

      default:
        return false;
    }
    return true;
  }

  /**
   * Context menu: Insert Leaflet map element
   */
  contextInsertLeafletMap(mapType) {
    try {
      console.log("🗺️ contextInsertLeafletMap called:", {
        mapType: mapType,
        targetElement: this.targetElement,
      });

      if (!this.targetElement) {
        console.error("❌ No target element available");
        return { success: false, error: "No target element" };
      }

      // Check if Leaflet is available, if not, include it
      this.ensureLeafletLibrary(() => {
        console.log("📚 Leaflet library ready, showing modal for:", mapType);
        // Show map configuration modal
        this.showLeafletMapConfigModal(mapType);
      });

      // Return success since modal will be shown
      console.log("✅ Modal scheduled to show");
      return { success: true, message: `${mapType} map modal opening...` };
    } catch (error) {
      console.error("❌ Error in contextInsertLeafletMap:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Ensure Leaflet library is loaded
   */
  ensureLeafletLibrary(callback) {
    if (typeof L !== "undefined") {
      // Leaflet is already loaded
      callback();
      return;
    }

    // Check if already being loaded
    if (
      document.querySelector('link[href*="leaflet"]') &&
      document.querySelector('script[src*="leaflet"]')
    ) {
      // Wait for loading
      const checkInterval = setInterval(() => {
        if (typeof L !== "undefined") {
          clearInterval(checkInterval);
          callback();
        }
      }, 100);
      return;
    }

    // Load Leaflet CSS
    const leafletCSS = document.createElement("link");
    leafletCSS.rel = "stylesheet";
    leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    leafletCSS.integrity =
      "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    leafletCSS.crossOrigin = "";
    document.head.appendChild(leafletCSS);

    // Load Leaflet JS
    const leafletJS = document.createElement("script");
    leafletJS.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletJS.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    leafletJS.crossOrigin = "";

    leafletJS.onload = () => {
      callback();
    };

    leafletJS.onerror = () => {};

    document.head.appendChild(leafletJS);
  }

  /**
   * Show Leaflet map configuration modal using NexaUI
   */
  showLeafletMapConfigModal(mapType) {
    try {
      console.log("📊 showLeafletMapConfigModal called for:", mapType);

      // Get NexaUI instance
      if (!this.nexaUI) {
        console.log("🔧 Initializing NexaUI instance");
        this.nexaUI = NexaUI();
      }

      // Generate unique modal ID
      const modalId = `mapModal-${Date.now()}`;
      console.log("🆔 Modal ID generated:", modalId);

      // Get modal title and description
      let modalTitle = "";
      let description = "";

      switch (mapType) {
        case "simple":
          modalTitle = "Insert Simple Map";
          description = "A basic interactive map with default styling";
          break;
        case "single-marker":
          modalTitle = "Insert Map with Single Marker";
          description = "Map with a single location marker";
          break;
        case "street":
          modalTitle = "Insert Street Map";
          description = "Street map with detailed road information";
          break;
        default:
          modalTitle = "Insert Leaflet Map";
          description = "Interactive map with Leaflet.js";
      }

      // Create modal content
      const modalContent = this.createMapConfigForm(modalId, mapType);
      console.log("📋 Modal content created");

      // Create modal using NexaUI
      this.nexaUI.modalHTML({
        elementById: modalId,
        styleClass: "w-800px", // Wide modal for map config
        label: modalTitle,
        onclick: {
          title: "Insert Map",
          cancel: "Cancel",
          send: "insertLeafletMapFromNexaModal",
        },
        content: `
          <div style="margin-bottom: 1rem;">
            <p style="color: #666; margin: 0;">${description}</p>
          </div>
          ${modalContent}
        `,
      });

      console.log("✅ NexaUI modal created");

      // Store mapType for later use
      window[`mapType_${modalId}`] = mapType;
      window[`leafletMapsInstance_${modalId}`] = this;

      // Setup global function for modal action
      window.insertLeafletMapFromNexaModal = (modalId, data) => {
        console.log("🗺️ insertLeafletMapFromNexaModal called:", {
          modalId,
          data,
        });

        const mapType = window[`mapType_${modalId}`];
        const instance = window[`leafletMapsInstance_${modalId}`];

        if (instance && mapType) {
          instance.insertLeafletMapFromNexaModal(modalId, mapType);
        }
      };

      // Open modal using NexaUI
      setTimeout(() => {
        console.log("🚀 Opening NexaUI modal:", modalId);
        this.nexaUI.nexaModal.open(modalId);
        console.log("✅ NexaUI modal opened successfully");
      }, 100);
    } catch (error) {
      console.error("❌ Error in showLeafletMapConfigModal:", error);
    }
  }

  /**
   * Create map configuration form content
   */
  createMapConfigForm(modalId, mapType) {
    const defaultLat = "-6.175";
    const defaultLng = "106.865";
    const defaultZoom = "13";

    return `
      <div class="nx-row">
        <div class="nx-col-6">
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="mapTitle-${modalId}">Map Title (Optional)</label></dt>
              <dd class="form-group-body">
                <input type="text" class="form-control input-block" id="mapTitle-${modalId}"
                       value="${
                         mapType.charAt(0).toUpperCase() + mapType.slice(1)
                       } Map"
                       placeholder="Enter map title...">
              </dd>
            </dl>
          </div>

          <div class="nx-row">
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="mapLat-${modalId}">Latitude</label></dt>
                  <dd class="form-group-body">
                    <input type="number" class="form-control" id="mapLat-${modalId}"
                           value="${defaultLat}" step="0.000001" placeholder="-6.175" required>
                    <p class="note">Default: Jakarta, Indonesia</p>
                  </dd>
                </dl>
              </div>
            </div>
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="mapLng-${modalId}">Longitude</label></dt>
                  <dd class="form-group-body">
                    <input type="number" class="form-control" id="mapLng-${modalId}"
                           value="${defaultLng}" step="0.000001" placeholder="106.865" required>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="nx-row">
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="mapZoom-${modalId}">Zoom Level</label></dt>
                  <dd class="form-group-body">
                    <input type="number" class="form-control" id="mapZoom-${modalId}"
                           value="${defaultZoom}" min="1" max="20" required>
                    <p class="note">1-20 (1=World, 20=Building)</p>
                  </dd>
                </dl>
              </div>
            </div>
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="mapStyle-${modalId}">Map Style</label></dt>
                  <dd class="form-group-body">
                    <select class="form-select" id="mapStyle-${modalId}">
                      <option value="osm" ${
                        mapType === "street" ? "selected" : ""
                      }>OpenStreetMap</option>
                      <option value="satellite" ${
                        mapType === "satellite" ? "selected" : ""
                      }>Satellite</option>
                      <option value="terrain" ${
                        mapType === "terrain" ? "selected" : ""
                      }>Terrain</option>
                      <option value="dark" ${
                        mapType === "dark" ? "selected" : ""
                      }>Dark Mode</option>
                    </select>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="nx-col-6">
          <div class="nx-row">
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="mapWidth-${modalId}">Width</label></dt>
                  <dd class="form-group-body">
                    <input type="text" class="form-control" id="mapWidth-${modalId}"
                           value="100%" placeholder="400px or 100%">
                  </dd>
                </dl>
              </div>
            </div>
            <div class="nx-col-6">
              <div class="form-group">
                <dl>
                  <dt class="form-group-header"><label for="mapHeight-${modalId}">Height</label></dt>
                  <dd class="form-group-body">
                    <input type="text" class="form-control" id="mapHeight-${modalId}"
                           value="400px" placeholder="400px" required>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Map Controls</label>
            <div class="form-checkbox">
              <label><input type="checkbox" id="showZoomControl-${modalId}" checked> Zoom Controls</label>
            </div>
            <div class="form-checkbox">
              <label><input type="checkbox" id="enableScrollZoom-${modalId}" checked> Scroll Wheel Zoom</label>
            </div>
            <div class="form-checkbox">
              <label><input type="checkbox" id="enableDragging-${modalId}" checked> Dragging</label>
            </div>
          </div>

          ${
            mapType.includes("marker")
              ? `
          <div class="form-group">
            <dl>
              <dt class="form-group-header"><label for="markerData-${modalId}">Marker Data (Optional)</label></dt>
              <dd class="form-group-body">
                <textarea class="form-control input-block" id="markerData-${modalId}" rows="3"
                          placeholder="Latitude,Longitude,Title,Description&#10;-6.175,106.865,Jakarta,Capital of Indonesia"></textarea>
                <p class="note">Format: lat,lng,title,description (one per line)</p>
              </dd>
            </dl>
          </div>
          `
              : ""
          }
        </div>
      </div>
    `;
  }

  /**
   * Insert Leaflet map from NexaUI modal
   */
  insertLeafletMapFromNexaModal(modalId, mapType) {
    try {
      console.log("🗺️ insertLeafletMapFromNexaModal called:", {
        modalId,
        mapType,
      });

      const config = this.getMapConfigFromNexaModal(modalId, mapType);
      console.log("📋 Map config retrieved:", config);

      if (!config) {
        console.error("❌ No config retrieved from modal");
        return;
      }

      // Close the modal using NexaUI
      console.log("🔒 Closing NexaUI modal:", modalId);
      if (this.nexaUI && this.nexaUI.nexaModal) {
        this.nexaUI.nexaModal.close(modalId);
        console.log("✅ NexaUI modal closed");
      }

      // Clean up global references
      delete window[`mapType_${modalId}`];
      delete window[`leafletMapsInstance_${modalId}`];

      // Create and insert the map
      console.log("🔄 About to create and insert map:", { mapType, config });
      const result = this.createAndInsertLeafletMap(mapType, config);
      console.log("✅ Map creation result:", result);

      return result;
    } catch (error) {
      console.error("❌ Error in insertLeafletMapFromNexaModal:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get map configuration from NexaUI modal form
   */
  getMapConfigFromNexaModal(modalId, mapType) {
    try {
      const titleInput = document.getElementById(`mapTitle-${modalId}`);
      const latInput = document.getElementById(`mapLat-${modalId}`);
      const lngInput = document.getElementById(`mapLng-${modalId}`);
      const zoomInput = document.getElementById(`mapZoom-${modalId}`);
      const widthInput = document.getElementById(`mapWidth-${modalId}`);
      const heightInput = document.getElementById(`mapHeight-${modalId}`);
      const styleSelect = document.getElementById(`mapStyle-${modalId}`);
      const markerDataInput = document.getElementById(`markerData-${modalId}`);

      // Get checkbox values
      const zoomControlCheckbox = document.getElementById(
        `showZoomControl-${modalId}`
      );
      const scrollZoomCheckbox = document.getElementById(
        `enableScrollZoom-${modalId}`
      );
      const draggingCheckbox = document.getElementById(
        `enableDragging-${modalId}`
      );

      const title = titleInput ? titleInput.value.trim() : "";
      const lat = latInput ? parseFloat(latInput.value) : -6.175;
      const lng = lngInput ? parseFloat(lngInput.value) : 106.865;
      const zoom = zoomInput ? parseInt(zoomInput.value) : 13;
      const width = widthInput ? widthInput.value.trim() : "100%";
      const height = heightInput ? heightInput.value.trim() : "400px";
      const style = styleSelect ? styleSelect.value : "osm";
      const markerData = markerDataInput ? markerDataInput.value.trim() : "";

      const controls = {
        zoom: zoomControlCheckbox ? zoomControlCheckbox.checked : true,
        scale: false,
        scrollZoom: scrollZoomCheckbox ? scrollZoomCheckbox.checked : true,
        dragging: draggingCheckbox ? draggingCheckbox.checked : true,
      };

      // Validate required fields
      if (isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
        throw new Error("Invalid coordinates or zoom level");
      }

      // Parse marker data if provided
      let markers = [];
      if (markerData) {
        const lines = markerData.split("\n").filter((line) => line.trim());
        markers = lines
          .map((line) => {
            const parts = line.split(",").map((part) => part.trim());
            if (parts.length >= 2) {
              return {
                lat: parseFloat(parts[0]),
                lng: parseFloat(parts[1]),
                title: parts[2] || "",
                description: parts[3] || "",
              };
            }
            return null;
          })
          .filter(
            (marker) => marker && !isNaN(marker.lat) && !isNaN(marker.lng)
          );
      }

      return {
        title,
        lat,
        lng,
        zoom,
        width,
        height,
        style,
        customTileUrl: "",
        border: "1px solid #ccc",
        controls,
        markers,
        mapType,
      };
    } catch (error) {
      console.error("Error getting map config:", error);
      return null;
    }
  }

  /**
   * Direct insert map with default config (fallback when modal fails)
   */
  directInsertMap(mapType) {
    try {
      console.log("🗺️ directInsertMap called for:", mapType);

      // Default configuration
      const defaultConfig = {
        title: `${mapType.charAt(0).toUpperCase() + mapType.slice(1)} Map`,
        lat: -6.175,
        lng: 106.865,
        zoom: 13,
        width: "100%",
        height: "400px",
        style: "osm",
        customTileUrl: "",
        border: "1px solid #ccc",
        controls: {
          zoom: true,
          scale: false,
          scrollZoom: true,
          dragging: true,
        },
        markers: [],
        mapType: mapType,
      };

      console.log("🔧 Using default config:", defaultConfig);

      // Ensure Leaflet library is loaded before creating map
      return new Promise((resolve) => {
        this.ensureLeafletLibrary(() => {
          console.log("📚 Leaflet loaded for direct insert");
          // Create and insert the map directly
          const result = this.createAndInsertLeafletMap(mapType, defaultConfig);
          console.log("✅ Direct insert result:", result);
          resolve(result);
        });
      });
    } catch (error) {
      console.error("❌ Error in directInsertMap:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Inject modal control functions
   */
  injectModalControlFunctions() {
    // Use the interactions class method if available
    if (this.interactions && this.interactions.injectModalControlFunctions) {
      this.interactions.injectModalControlFunctions();
    } else {
      // Fallback: create basic modal functions
      console.log("🔧 Creating fallback modal functions");

      if (typeof window.openModal === "undefined") {
        window.openModal = function (modalId) {
          console.log("📖 openModal fallback called for:", modalId);
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
            console.log("✅ Modal opened with fallback");
          } else {
            console.error("❌ Modal not found:", modalId);
          }
        };
      }

      if (typeof window.closeModal === "undefined") {
        window.closeModal = function (modalId) {
          console.log("📕 closeModal fallback called for:", modalId);
          const modal = document.getElementById(modalId);
          if (modal) {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
            console.log("✅ Modal closed with fallback");
          }
        };
      }
    }
  }

  /**
   * Insert element at position
   */
  insertElementAtPosition(element) {
    try {
      console.log("🗺️ LeafletMaps insertElementAtPosition called:", {
        element: element,
        targetElement: this.targetElement,
        hasInteractions: !!this.interactions,
        hasInsertMethod: !!(
          this.interactions && this.interactions.insertElementAtPosition
        ),
      });

      // Use the interactions class method if available
      const tgt = this.targetElement;
      if (this.interactions?.insertElementAtPosition) {
        if (tgt) this.interactions.targetElement = tgt;
        this.interactions.insertElementAtPosition(element);
      } else if (tgt?.parentNode) {
        tgt.parentNode.insertBefore(element, tgt.nextSibling);
      } else {
        console.warn("❌ No valid target for LeafletMaps insertion");
      }
    } catch (error) {
      console.error("❌ Error inserting LeafletMaps element:", error);
      if (this.targetElement?.parentNode) {
        this.targetElement.parentNode.insertBefore(element, this.targetElement.nextSibling);
      }
    }
  }

  /**
   * Create Leaflet map configuration modal (DEPRECATED - replaced with NexaUI)
   */
  createLeafletMapConfigModal(mapType) {
    // This method is deprecated and replaced with NexaUI modal system
    // All functionality moved to createMapConfigForm() and showLeafletMapConfigModal()
    console.warn(
      "createLeafletMapConfigModal is deprecated - using NexaUI modal system"
    );
    return document.createElement("div"); // Return empty div for compatibility
  } // End of deprecated method

  /**
   * Insert Leaflet map from modal form
   */
  insertLeafletMapFromModal(modalId, mapType) {
    try {
      console.log("🗺️ insertLeafletMapFromModal called:", { modalId, mapType });

      const config = this.getMapConfigFromModal(modalId, mapType);
      console.log("📋 Map config retrieved:", config);

      if (!config) {
        console.error("❌ No config retrieved from modal");
        return;
      }

      // Close the modal
      console.log("🔒 Closing modal:", modalId);
      if (typeof window.closeModal === "function") {
        window.closeModal(modalId);
        console.log("✅ Modal closed");
      } else {
        console.error("❌ window.closeModal function not available");
      }

      // Remove modal from DOM after close animation
      setTimeout(() => {
        const modalElement = document.getElementById(modalId);
        if (modalElement && modalElement.parentNode) {
          modalElement.parentNode.remove();
          console.log("🗑️ Modal element removed from DOM");
        }
      }, 300);

      // Create and insert the map
      console.log("🔄 About to create and insert map:", { mapType, config });
      const result = this.createAndInsertLeafletMap(mapType, config);
      console.log("✅ Map creation result:", result);

      return result;
    } catch (error) {
      console.error("❌ Error in insertLeafletMapFromModal:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Preview Leaflet map in modal
   */
  previewLeafletMap(modalId, mapType) {
    try {
      const config = this.getMapConfigFromModal(modalId, mapType);

      if (!config) {
        return;
      }

      // Create preview area if not exists
      let previewArea = document.getElementById(`preview-${modalId}`);
      if (!previewArea) {
        previewArea = document.createElement("div");
        previewArea.id = `preview-${modalId}`;
        previewArea.style.cssText = `
          margin-top: 1rem;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #f9f9f9;
        `;

        // Insert after form
        const form = document.getElementById(`mapForm-${modalId}`);
        if (form && form.parentNode) {
          form.parentNode.insertBefore(previewArea, form.nextSibling);
        }
      }

      // Clear previous preview
      previewArea.innerHTML = `
        <h6>Map Preview</h6>
        <div id="map-preview-${modalId}" style="width: 100%; height: 200px; border: 1px solid #ccc; border-radius: 4px;"></div>
      `;

      // Create mini map for preview
      setTimeout(() => {
        const previewContainer = document.getElementById(
          `map-preview-${modalId}`
        );
        if (previewContainer && typeof L !== "undefined") {
          const previewMap = L.map(previewContainer).setView(
            [config.lat, config.lng],
            config.zoom
          );

          // Add appropriate tile layer based on style
          this.addTileLayer(previewMap, config.style, config.customTileUrl);

          // Add sample marker if it's a marker-type map
          if (mapType.includes("marker")) {
            L.marker([config.lat, config.lng])
              .addTo(previewMap)
              .bindPopup(config.title || "Sample Location");
          }
        }
      }, 100);
    } catch (error) {}
  }

  /**
   * Get map configuration from modal form
   */
  getMapConfigFromModal(modalId, mapType) {
    try {
      const titleInput = document.getElementById(`mapTitle-${modalId}`);
      const latInput = document.getElementById(`mapLat-${modalId}`);
      const lngInput = document.getElementById(`mapLng-${modalId}`);
      const zoomInput = document.getElementById(`mapZoom-${modalId}`);
      const widthInput = document.getElementById(`mapWidth-${modalId}`);
      const heightInput = document.getElementById(`mapHeight-${modalId}`);
      const styleSelect = document.getElementById(`mapStyle-${modalId}`);
      const customTileInput = document.getElementById(
        `customTileUrl-${modalId}`
      );
      const borderSelect = document.getElementById(`mapBorder-${modalId}`);
      const markerDataInput = document.getElementById(`markerData-${modalId}`);

      // Get checkbox values
      const zoomControlCheckbox = document.getElementById(
        `showZoomControl-${modalId}`
      );
      const scaleControlCheckbox = document.getElementById(
        `showScaleControl-${modalId}`
      );
      const scrollZoomCheckbox = document.getElementById(
        `enableScrollZoom-${modalId}`
      );
      const draggingCheckbox = document.getElementById(
        `enableDragging-${modalId}`
      );

      const title = titleInput ? titleInput.value.trim() : "";
      const lat = latInput ? parseFloat(latInput.value) : -6.175;
      const lng = lngInput ? parseFloat(lngInput.value) : 106.865;
      const zoom = zoomInput ? parseInt(zoomInput.value) : 13;
      const width = widthInput ? widthInput.value.trim() : "100%";
      const height = heightInput ? heightInput.value.trim() : "400px";
      const style = styleSelect ? styleSelect.value : "osm";
      const customTileUrl = customTileInput ? customTileInput.value.trim() : "";
      const border = borderSelect ? borderSelect.value : "1px solid #ccc";
      const markerData = markerDataInput ? markerDataInput.value.trim() : "";

      const controls = {
        zoom: zoomControlCheckbox ? zoomControlCheckbox.checked : true,
        scale: scaleControlCheckbox ? scaleControlCheckbox.checked : false,
        scrollZoom: scrollZoomCheckbox ? scrollZoomCheckbox.checked : true,
        dragging: draggingCheckbox ? draggingCheckbox.checked : true,
      };

      // Validate required fields
      if (isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
        throw new Error("Invalid coordinates or zoom level");
      }

      // Parse marker data if provided
      let markers = [];
      if (markerData) {
        const lines = markerData.split("\n").filter((line) => line.trim());
        markers = lines
          .map((line) => {
            const parts = line.split(",").map((part) => part.trim());
            if (parts.length >= 2) {
              return {
                lat: parseFloat(parts[0]),
                lng: parseFloat(parts[1]),
                title: parts[2] || "",
                description: parts[3] || "",
              };
            }
            return null;
          })
          .filter(
            (marker) => marker && !isNaN(marker.lat) && !isNaN(marker.lng)
          );
      }

      return {
        title,
        lat,
        lng,
        zoom,
        width,
        height,
        style,
        customTileUrl,
        border,
        controls,
        markers,
        mapType,
      };
    } catch (error) {
      console.error("Error getting map config:", error);
      return null;
    }
  }

  /**
   * Create and insert Leaflet map element
   */
  createAndInsertLeafletMap(mapType, config) {
    try {
      console.log("🗺️ createAndInsertLeafletMap called:", {
        mapType: mapType,
        config: config,
        targetElement: this.targetElement,
      });

      // Create map container
      const container = document.createElement("div");
      container.className = "nexa-map-container";
      console.log("📦 Created map container:", container);

      // Create unique ID for the map
      const mapId = `map-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      container.style.cssText = `
        position: relative;
        width: ${config.width};
        height: ${config.height};
        margin: 1rem auto;
        padding: 0;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        background: white;
        border: ${config.border !== "none" ? config.border : "none"};
        overflow: hidden;
      `;

      // Add title if provided
      if (config.title) {
        const titleElement = document.createElement("div");
        titleElement.className = "nexa-map-title";
        titleElement.style.cssText = `
          padding: 10px 15px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          font-weight: 600;
          color: #495057;
          font-size: 14px;
        `;
        titleElement.textContent = config.title;
        container.appendChild(titleElement);
      }

      // Create map element
      const mapElement = document.createElement("div");
      mapElement.id = mapId;
      mapElement.style.cssText = `
        width: 100%;
        height: ${config.title ? "calc(100% - 45px)" : "100%"};
        position: relative;
      `;

      container.appendChild(mapElement);

      // Insert container into target element
      console.log("🔄 About to insert container via insertElementAtPosition");
      this.insertElementAtPosition(container);
      console.log("✅ Container insertion completed");

      // Initialize Leaflet map after a short delay to ensure DOM is ready
      console.log("⏰ Scheduling Leaflet map initialization for mapId:", mapId);
      setTimeout(() => {
        console.log("🗺️ Initializing Leaflet map now:", mapId);
        this.initializeLeafletMap(mapId, config);
      }, 100);

      const displayName =
        config.title ||
        `${mapType.charAt(0).toUpperCase() + mapType.slice(1)} Map`;

      return { success: true, message: `${displayName} inserted` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize Leaflet map with configuration
   */
  initializeLeafletMap(mapId, config) {
    try {
      console.log("🗺️ initializeLeafletMap called:", { mapId, config });

      const mapElement = document.getElementById(mapId);
      console.log("🔍 Map element found:", mapElement);

      if (!mapElement) {
        console.error("❌ Map element not found for ID:", mapId);
        return;
      }

      if (typeof L === "undefined") {
        console.error("❌ Leaflet library not loaded");
        return;
      }

      console.log("✅ Both map element and Leaflet library are available");

      // Create map with options
      const mapOptions = {
        zoomControl: config.controls.zoom,
        scrollWheelZoom: config.controls.scrollZoom,
        dragging: config.controls.dragging,
      };
      console.log("⚙️ Map options:", mapOptions);

      const map = L.map(mapId, mapOptions).setView(
        [config.lat, config.lng],
        config.zoom
      );
      console.log("🗺️ Leaflet map created successfully:", map);

      // Add tile layer based on style
      console.log("🌍 Adding tile layer with style:", config.style);
      this.addTileLayer(map, config.style, config.customTileUrl);
      console.log("✅ Tile layer added");

      // Add scale control if enabled
      if (config.controls.scale) {
        console.log("📏 Adding scale control");
        L.control.scale().addTo(map);
      }

      // Add markers based on map type
      console.log("📍 Adding markers for map type:", config.mapType);
      this.addMapMarkers(map, config);
      console.log("✅ Markers added");

      // Store map reference for potential future use
      if (!window.nexaMaps) {
        window.nexaMaps = {};
      }
      window.nexaMaps[mapId] = map;
      console.log("💾 Map stored globally with ID:", mapId);

      console.log("🎉 Map initialization completed successfully!");
    } catch (error) {
      console.error("❌ Error initializing map:", error);
    }
  }

  /**
   * Add appropriate tile layer to map
   */
  addTileLayer(map, style, customTileUrl) {
    let tileLayer;

    switch (style) {
      case "satellite":
        tileLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
            maxZoom: 18,
          }
        );
        break;
      case "terrain":
        tileLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
            maxZoom: 18,
          }
        );
        break;
      case "dark":
        tileLayer = L.tileLayer(
          "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
            maxZoom: 20,
          }
        );
        break;
      case "custom":
        if (customTileUrl) {
          tileLayer = L.tileLayer(customTileUrl, {
            attribution: "Custom Tiles",
            maxZoom: 18,
          });
        } else {
          // Fallback to OSM if custom URL is invalid
          tileLayer = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }
          );
        }
        break;
      default: // 'osm'
        tileLayer = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }
        );
    }

    tileLayer.addTo(map);
  }

  /**
   * Add markers to map based on configuration
   */
  addMapMarkers(map, config) {
    try {
      // Add main marker if no custom markers provided
      if (config.markers.length === 0 && config.mapType.includes("marker")) {
        const marker = L.marker([config.lat, config.lng]).addTo(map);
        if (config.title) {
          marker.bindPopup(config.title);
        }
      }

      // Add custom markers if provided
      config.markers.forEach((markerData) => {
        const marker = L.marker([markerData.lat, markerData.lng]).addTo(map);

        let popupContent = "";
        if (markerData.title) {
          popupContent += `<strong>${markerData.title}</strong>`;
        }
        if (markerData.description) {
          popupContent += markerData.title
            ? `<br>${markerData.description}`
            : markerData.description;
        }

        if (popupContent) {
          marker.bindPopup(popupContent);
        }
      });

      // Special handling for different map types
      if (config.mapType === "cluster" && config.markers.length > 1) {
        // For clustering, we would need markercluster plugin
        // This is a basic implementation
        console.log(
          "Clustering requires additional plugin: leaflet.markercluster"
        );
      }

      if (config.mapType === "heatmap") {
        // For heatmap, we would need heatmap plugin
        console.log("Heatmap requires additional plugin: leaflet-heat");
      }
    } catch (error) {
      console.error("Error adding markers:", error);
    }
  }
}

// Export for both CommonJS and ES6 modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = LeafletMaps;
} else if (typeof window !== "undefined") {
  window.LeafletMaps = LeafletMaps;
}

export { LeafletMaps };
