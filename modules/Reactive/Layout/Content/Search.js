/**
 * Search.js - Search Component
 * Search functionality component for NexaReactive
 */

import { initData } from "./Percent/index.js";

class Search {
  constructor(interactions) {
    this.interactions = interactions;
    this.config = interactions.config;
    this.nexaUI = interactions.nexaUI;
  }

  /**
   * Create a search element
   */
  createSearch(placeholder = "Search...", buttonText = "Search") {
    const searchId = `search-${Date.now()}`;

    const searchHTML = `
      <div class="nexa-search-container" id="${searchId}" style="
        width: 100%;
        margin: 10px 0;
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background: #f8f9fa;
      ">
        <div class="nexa-search-header" style="
          margin-bottom: 15px;
          font-weight: 600;
          color: #333;
          font-size: 16px;
        ">Search</div>
        
        <div class="nexa-search-form" style="
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        ">
          <input 
            type="text" 
            class="nexa-search-input" 
            placeholder="${placeholder}"
            style="
              flex: 1;
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 4px;
              font-size: 14px;
            "
          />
          <button 
            type="button" 
            class="nexa-search-button"
            style="
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            "
          >${buttonText}</button>
        </div>
        
        <div class="nexa-search-results" style="
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          background: white;
          display: none;
        ">
          <div class="nexa-search-results-header" style="
            padding: 10px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            font-weight: 600;
            color: #333;
          ">Search Results</div>
          <div class="nexa-search-results-content" style="
            padding: 10px;
          "></div>
        </div>
        
        <div class="nexa-search-no-results" style="
          padding: 20px;
          text-align: center;
          color: #6c757d;
          display: none;
        ">No results found</div>
      </div>
    `;

    return searchHTML;
  }

  /**
   * Insert search element into target element
   */
  async insertSearch(targetElement, options = {}) {
    try {
      if (!targetElement) {
        console.error("No target element provided");
        return { success: false, error: "No target element" };
      }

      // Extract package information
      const packageKey = options.packageKey;
      const packageData = options.packageData;
      const packageType = packageData?.type || "default";
      const dataform = await initData(packageData);
      console.log(dataform);

      console.log(
        `🔍 Search component for package: ${packageKey} (${packageType})`,
        {
          packageKey,
          packageData,
          options,
        }
      );

      // Try to get additional data from database if available
      let additionalData = null;
      if (
        packageData?.store &&
        packageData?.id &&
        this.getDatabase &&
        this.isDatabaseReady()
      ) {
        try {
          const db = this.getDatabase();
          if (db && db.nexaUI && db.nexaUI.Storage) {
            additionalData = await db.nexaUI
              .Storage()
              .indexedDB.get(packageData.store, packageData.id);
            console.log(
              "📊 Additional database data loaded for search:",
              additionalData
            );
          }
        } catch (error) {
          console.warn(
            "⚠️ Failed to load additional database data for search:",
            error
          );
        }
      }

      const placeholder =
        options.placeholder || this.getSearchPlaceholderForPackage(packageType);
      const buttonText =
        options.buttonText || this.getSearchButtonTextForPackage(packageType);

      const searchHTML = this.createSearch(placeholder, buttonText);

      // Insert into target element
      targetElement.insertAdjacentHTML("beforeend", searchHTML);

      // Add package-specific styling or attributes
      const searchElement = targetElement.querySelector(
        ".nexa-search-container"
      );
      if (searchElement) {
        searchElement.setAttribute("data-package-key", packageKey || "");
        searchElement.setAttribute("data-package-type", packageType);
        searchElement.classList.add(`nexa-search-${packageType}`);
      }

      // Add event listeners
      this.addSearchEventListeners(
        searchElement,
        packageType,
        dataform,
        additionalData
      );

      console.log("✅ Search element inserted successfully");
      return {
        success: true,
        message: `Search element inserted successfully for ${
          packageKey || "default"
        }`,
        element: searchElement,
        packageInfo: { packageKey, packageType, packageData },
      };
    } catch (error) {
      console.error("❌ Error inserting search element:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get search placeholder based on package type
   */
  getSearchPlaceholderForPackage(packageType) {
    const placeholderMap = {
      petani: "Search farmers, crops, or locations...",
      transaksi: "Search transactions, amounts, or dates...",
      project: "Search projects, status, or descriptions...",
      default: "Search...",
    };
    return placeholderMap[packageType] || placeholderMap["default"];
  }

  /**
   * Get search button text based on package type
   */
  getSearchButtonTextForPackage(packageType) {
    const buttonTextMap = {
      petani: "Find Farmer",
      transaksi: "Find Transaction",
      project: "Find Project",
      default: "Search",
    };
    return buttonTextMap[packageType] || buttonTextMap["default"];
  }

  /**
   * Add event listeners to search element
   */
  addSearchEventListeners(
    searchElement,
    packageType,
    dataform,
    additionalData = null
  ) {
    const searchInput = searchElement.querySelector(".nexa-search-input");
    const searchButton = searchElement.querySelector(".nexa-search-button");
    const resultsContainer = searchElement.querySelector(
      ".nexa-search-results"
    );
    const resultsContent = searchElement.querySelector(
      ".nexa-search-results-content"
    );
    const noResultsContainer = searchElement.querySelector(
      ".nexa-search-no-results"
    );

    // Search button click event
    searchButton.addEventListener("click", () => {
      this.performSearch(
        searchInput.value,
        packageType,
        dataform,
        resultsContent,
        noResultsContainer,
        resultsContainer
      );
    });

    // Enter key press event
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.performSearch(
          searchInput.value,
          packageType,
          dataform,
          resultsContent,
          noResultsContainer,
          resultsContainer
        );
      }
    });

    // Input change event for real-time search
    searchInput.addEventListener("input", (e) => {
      if (e.target.value.length > 2) {
        this.performSearch(
          e.target.value,
          packageType,
          dataform,
          resultsContent,
          noResultsContainer,
          resultsContainer
        );
      } else {
        this.hideResults(resultsContainer, noResultsContainer);
      }
    });
  }

  /**
   * Perform search operation
   */
  performSearch(
    query,
    packageType,
    dataform,
    resultsContent,
    noResultsContainer,
    resultsContainer
  ) {
    if (!query.trim()) {
      this.hideResults(resultsContainer, noResultsContainer);
      return;
    }

    console.log(`🔍 Searching for: "${query}" in ${packageType}`);

    // Get search data based on package type
    const searchData = this.getSearchDataForPackage(packageType, dataform);

    // Perform search
    const results = this.searchInData(query, searchData, packageType);

    // Display results
    this.displaySearchResults(
      results,
      resultsContent,
      noResultsContainer,
      resultsContainer
    );
  }

  /**
   * Get search data based on package type
   */
  getSearchDataForPackage(packageType, dataform) {
    const dataMap = {
      petani: [
        {
          name: "Ahmad Susanto",
          location: "Surabaya",
          crop: "Padi",
          status: "Aktif",
        },
        {
          name: "Siti Rahayu",
          location: "Malang",
          crop: "Jagung",
          status: "Aktif",
        },
        {
          name: "Budi Santoso",
          location: "Sidoarjo",
          crop: "Kedelai",
          status: "Non-Aktif",
        },
        {
          name: "Rina Wijaya",
          location: "Gresik",
          crop: "Cabai",
          status: "Aktif",
        },
        {
          name: "Dedi Kurniawan",
          location: "Mojokerto",
          crop: "Tomat",
          status: "Aktif",
        },
      ],
      transaksi: [
        {
          id: "TXN001",
          amount: 1500000,
          date: "2024-01-15",
          status: "Lunas",
          description: "Pembelian benih padi",
        },
        {
          id: "TXN002",
          amount: 750000,
          date: "2024-01-16",
          status: "Pending",
          description: "Pembelian pupuk",
        },
        {
          id: "TXN003",
          amount: 2000000,
          date: "2024-01-17",
          status: "Lunas",
          description: "Pembelian alat pertanian",
        },
        {
          id: "TXN004",
          amount: 500000,
          date: "2024-01-18",
          status: "Lunas",
          description: "Pembelian pestisida",
        },
        {
          id: "TXN005",
          amount: 1200000,
          date: "2024-01-19",
          status: "Pending",
          description: "Pembelian bibit jagung",
        },
      ],
      project: [
        {
          name: "Project Alpha",
          status: "Active",
          progress: "75%",
          deadline: "2024-02-15",
          description: "Development of new farming system",
        },
        {
          name: "Project Beta",
          status: "Pending",
          progress: "25%",
          deadline: "2024-03-01",
          description: "Implementation of irrigation system",
        },
        {
          name: "Project Gamma",
          status: "Completed",
          progress: "100%",
          deadline: "2024-01-30",
          description: "Market analysis and research",
        },
        {
          name: "Project Delta",
          status: "Active",
          progress: "50%",
          deadline: "2024-04-15",
          description: "Training program for farmers",
        },
        {
          name: "Project Epsilon",
          status: "On Hold",
          progress: "10%",
          deadline: "2024-05-01",
          description: "Equipment procurement",
        },
      ],
      default: [
        { name: "Sample Item 1", category: "Category A", status: "Active" },
        { name: "Sample Item 2", category: "Category B", status: "Inactive" },
        { name: "Sample Item 3", category: "Category A", status: "Active" },
      ],
    };

    // Use database data if available, otherwise use default data
    return dataform && dataform.length > 0
      ? dataform
      : dataMap[packageType] || dataMap["default"];
  }

  /**
   * Search in data
   */
  searchInData(query, data, packageType) {
    const searchFields = this.getSearchFieldsForPackage(packageType);
    const lowerQuery = query.toLowerCase();

    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(lowerQuery);
      });
    });
  }

  /**
   * Get search fields based on package type
   */
  getSearchFieldsForPackage(packageType) {
    const fieldsMap = {
      petani: ["name", "location", "crop", "status"],
      transaksi: ["id", "amount", "date", "status", "description"],
      project: ["name", "status", "progress", "deadline", "description"],
      default: ["name", "category", "status"],
    };
    return fieldsMap[packageType] || fieldsMap["default"];
  }

  /**
   * Display search results
   */
  displaySearchResults(
    results,
    resultsContent,
    noResultsContainer,
    resultsContainer
  ) {
    if (results.length === 0) {
      this.showNoResults(noResultsContainer, resultsContainer);
      return;
    }

    // Clear previous results
    resultsContent.innerHTML = "";

    // Create result items
    results.forEach((item, index) => {
      const resultItem = document.createElement("div");
      resultItem.className = "nexa-search-result-item";
      resultItem.style.cssText = `
        padding: 10px;
        border-bottom: 1px solid #e9ecef;
        cursor: pointer;
        transition: background-color 0.2s;
      `;

      // Create result content based on item structure
      const itemContent = this.createResultItemContent(item);
      resultItem.innerHTML = itemContent;

      // Add hover effect
      resultItem.addEventListener("mouseenter", () => {
        resultItem.style.backgroundColor = "#f8f9fa";
      });
      resultItem.addEventListener("mouseleave", () => {
        resultItem.style.backgroundColor = "transparent";
      });

      // Add click event
      resultItem.addEventListener("click", () => {
        this.selectResult(item);
      });

      resultsContent.appendChild(resultItem);
    });

    // Show results
    resultsContainer.style.display = "block";
    noResultsContainer.style.display = "none";
  }

  /**
   * Create result item content
   */
  createResultItemContent(item) {
    const keys = Object.keys(item);
    let content = "";

    keys.forEach((key) => {
      const value = item[key];
      if (value !== null && value !== undefined) {
        content += `<div style="margin: 2px 0;"><strong>${key}:</strong> ${value}</div>`;
      }
    });

    return content;
  }

  /**
   * Show no results message
   */
  showNoResults(noResultsContainer, resultsContainer) {
    resultsContainer.style.display = "none";
    noResultsContainer.style.display = "block";
  }

  /**
   * Hide results
   */
  hideResults(resultsContainer, noResultsContainer) {
    resultsContainer.style.display = "none";
    noResultsContainer.style.display = "none";
  }

  /**
   * Handle result selection
   */
  selectResult(item) {
    console.log("✅ Selected result:", item);
    // You can add custom logic here for handling result selection
    alert(`Selected: ${JSON.stringify(item, null, 2)}`);
  }
}

export { Search };
