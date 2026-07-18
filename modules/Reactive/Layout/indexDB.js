/**
 * Contoh Class JavaScript Sederhana
 * Hanya 2 method saja
 */
//import { setStandaloneForm } from "./Standalone/inisiasi.js";
// import { setCrossJoin } from "./crossJoin/inisiasi.js";

// Class Person dengan 2 method
export class NexaFactory {
  constructor(data, method, contentID) {
    try {
      this.nexaUI = NexaUI();

      if (!this.nexaUI) {
        console.error("Failed to initialize NexaUI instance");
      }
    } catch (error) {
      console.error("Error initializing NexaUI:", error);
      this.nexaUI = null;
    }

    this.data = data;
    this.contentID = contentID;
    this.db = data.submenu[0];
    this.id = data.id;
    this.method = method;
    this.dbNamekey = "NexaStoreDB";
    this.dbVersionkey = 7; // Updated to match existing database version
    this.storedTables = []; // Initialize as empty array
    this.dataLoadPromise = null; // Track loading state

    this.initializeDatabase();
    // Load data in constructor and track the promise
    this.dataLoadPromise = this.loadStoredData().then((dataset) => {
      this.storedTables = dataset;
      // Trigger refresh if needed
      this.onDataLoaded();
      return dataset;
    });
  }

  async initializeDatabase() {
    try {
      // Only NXUI.ref will be set globally to avoid confusion
      const detectedVersion = await this.detectDatabaseVersion();
      if (detectedVersion && detectedVersion > this.dbVersionkey) {
        this.dbVersionkey = detectedVersion;
      }

      // Initialize database reference with required stores
      try {
        NXUI.ref = await NXUI.Storage().indexedDB.init(
          this.dbNamekey,
          this.dbVersionkey,
          ["nexaStore"] // Include required stores
        );
      } catch (versionError) {
        if (
          versionError.name === "VersionError" ||
          versionError.message.includes("version")
        ) {
          console.log("🔄 Version conflict detected, trying auto-fix...");
          // Try to get the actual version and retry
          const actualVersion = await this.detectDatabaseVersion();
          if (actualVersion) {
            this.dbVersionkey = actualVersion;

            // Retry with correct version
            NXUI.ref = await NXUI.Storage().indexedDB.init(
              this.dbNamekey,
              this.dbVersionkey,
              ["nexaStore"]
            );
          } else {
            throw versionError;
          }
        } else {
          throw versionError;
        }
      }
      return NXUI.ref;
    } catch (error) {
      console.error("❌ Failed to initialize database reference:", error);
      NXUI.ref = null;
      return null;
    }
  }

  /**
   * Detect existing database version to avoid version conflicts
   */
  async detectDatabaseVersion() {
    return new Promise((resolve) => {
      try {
        // Open database without specifying version to get current version
        const request = indexedDB.open(this.dbNamekey);

        request.onsuccess = (event) => {
          const db = event.target.result;
          const currentVersion = db.version;
          db.close();
          resolve(currentVersion);
        };

        request.onerror = () => {
          console.log("🔍 No existing database found, using default version");
          resolve(null);
        };
      } catch (error) {
        console.warn("⚠️ Could not detect database version:", error);
        resolve(null);
      }
    });
  }

  /**
   * Get current database information
   */
  getDatabaseInfo() {
    return {
      name: this.dbNamekey,
      version: this.dbVersionkey,
      isConnected: !!NXUI.ref,
      ref: NXUI.ref,
    };
  }

  /**
   * Wait for data to be loaded if not already loaded
   */
  async waitForDataLoad() {
    if (this.dataLoadPromise) {
      await this.dataLoadPromise;
    }
    return this.storedTables;
  }

  async loadStoredData() {
    try {
      // Check if nexaUI is available
      if (!this.nexaUI) {
        console.error("NexaUI instance not available in loadStoredData");
        this.storedTables = [];
        return [];
      }

      // Use existing NXUI.ref if available, otherwise initialize new one
      let db = NXUI.ref;
      if (!db) {
        db = await this.nexaUI
          .Storage()
          .indexedDB.init(this.dbNamekey, this.dbVersionkey, ["nexaStore"]);

        // Store for future use
        NXUI.ref = db;
      }

      // Get all stored data
      const indexedDBData = await db.getAll("nexaStore");

      // Store data for later use
      this.storedTables = indexedDBData.data || [];

      // Return the data
      return this.storedTables;
    } catch (error) {
      console.error("Failed to load stored data:", error);
      this.storedTables = [];
      return [];
    }
  }

  isStoredDataLoaded() {
    if (!this.storedTables || this.storedTables.length === 0) {
      return false;
    }

    // Check if first item has expected stored table properties
    const firstTable = this.storedTables[0];

    // More flexible check - table is valid if it has id and basic info
    return !!(
      firstTable &&
      firstTable.id &&
      (firstTable.label || firstTable.className || firstTable.tableName)
    );
  }

  /**
   * Called when stored data is loaded
   */
  onDataLoaded() {
    // You can trigger UI refresh here if needed
    if (window.nexaStoreDataLoadedCallback) {
      window.nexaStoreDataLoadedCallback(this.storedTables);
    }
  }
}
