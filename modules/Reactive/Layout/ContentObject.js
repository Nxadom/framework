/**
 * ContentObject.js - Content Components for Layout
 * Provides various content components like Progress, Percentage, Narasi
 * Integrates with NexaReactive context menu system
 */

// Import Content components
import { Progress } from "./Content/Progress.js";
import { Percentage } from "./Content/Percentage.js";
import { Narasi } from "./Content/Narasi.js";
import { Form } from "./Content/form.js";
import { Tabel } from "./Content/tabel.js";
import { Search } from "./Content/Search.js";

// Import Database component
import { NexaFactory } from "./indexDB.js";


class contentObject {
  constructor(interactions) {
    // Reference to parent Interactions class
    this.interactions = interactions;

    // Get configuration from interactions
    this.config = interactions.config;

    // Get nexaUI reference
    this.nexaUI = interactions.nexaUI;

    // Initialize Content components with database access
    this.progress = new Progress(interactions);
    this.percentage = new Percentage(interactions);

    this.narasi = new Narasi(interactions);
    this.form = new Form(interactions);
    this.tabel = new Tabel(interactions);
    this.search = new Search(interactions);
    this.chartElements = new chartElements(interactions);

    // Initialize Database connection
    this.db = null;
    this.initializeDatabase().then(() => {
      // Add database reference to each component after database is ready
      this.addDatabaseToComponents();
    });
  }

  /**
   * Initialize database connection
   */
  async initializeDatabase() {
    try {
      // Check if NXUI is available globally
      if (typeof window !== "undefined" && window.NXUI) {
        // Create database instance with packages data
        const dbData = {
          id: "content-object-db",
          submenu: [this.config?.packages?.data || {}],
        };

        this.db = new NexaFactory(dbData, "content", "content-object");

        // Wait for database to be ready
        await this.db.waitForDataLoad();
      } else {
        this.db = null;
      }
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
      this.db = null;
    }
  }

  /**
   * Generate menu structure based on available packages
   */
  async struktur() {
    const keys = Object.keys(this.config?.packages?.data || {});

    // If no packages data, return default content menu
    if (keys.length === 0) {
      return this.getDefaultContentSubmenu();
    }

    // Generate menu based on packages data
    return keys.map((key, i) => {
      const packageData = this.config.packages.data[key];
      const packageType = packageData?.type || "default";

      return {
        id: `content-${key.toLowerCase()}-${i}`,
        icon: this.getIconForPackageType(packageType),
        text: key,
        action: "contentElements",
        showCondition: "hasNoSelectedText",
        packageKey: key, // Store the original key for reference
        packageData: packageData, // Store package data for components
        submenu: this.getContentSubmenuForPackage(key, packageData),
      };
    });
  }

  /**
   * Get default content submenu
   */
  getDefaultContentSubmenu() {
    return [
      {
        id: "content-progress",
        icon: "trending-up",
        text: "Progress Bar",
        action: "contentProgress",
        showCondition: "hasNoSelectedText",
      },
      {
        id: "content-percentage",
        icon: "percent",
        text: "Percentage",
        action: "contentPercentage",
        showCondition: "hasNoSelectedText",
      },
      {
        id: "content-narasi",
        icon: "file-text",
        text: "Narasi",
        action: "contentNarasi",
        showCondition: "hasNoSelectedText",
      },
      {
        id: "content-form",
        icon: "edit-3",
        text: "Form",
        action: "contentForm",
        showCondition: "hasNoSelectedText",
      },
      {
        id: "content-tabel",
        icon: "grid",
        text: "Table",
        action: "contentTabel",
        showCondition: "hasNoSelectedText",
      },
      {
        id: "content-search",
        icon: "search",
        text: "Search",
        action: "contentSearch",
        showCondition: "hasNoSelectedText",
      },
    ];
  }

  /**
   * Get content submenu for specific package
   */
  getContentSubmenuForPackage(packageKey, packageData) {
    const baseSubmenu = this.getDefaultContentSubmenu();

    // Add package-specific content based on package type
    const packageType = packageData?.type || "default";

    if (packageType === "petani") {
      return [
        ...baseSubmenu,
        {
          id: `content-${packageKey}-progress`,
          icon: "trending-up",
          text: `${packageKey} Progress`,
          action: "contentProgress",
          showCondition: "hasNoSelectedText",
          packageKey: packageKey,
          packageData: packageData,
        },
        {
          id: `content-${packageKey}-tabel`,
          icon: "grid",
          text: `${packageKey} Data`,
          action: "contentTabel",
          showCondition: "hasNoSelectedText",
          packageKey: packageKey,
          packageData: packageData,
        },
        {
          id: `content-${packageKey}-search`,
          icon: "search",
          text: `${packageKey} Search`,
          action: "contentSearch",
          showCondition: "hasNoSelectedText",
          packageKey: packageKey,
          packageData: packageData,
        },
      ];
    } else if (packageType === "transaksi") {
      return [
        ...baseSubmenu,
        {
          id: `content-${packageKey}-tabel`,
          icon: "grid",
          text: `${packageKey} Table`,
          action: "contentTabel",
          showCondition: "hasNoSelectedText",
          packageKey: packageKey,
          packageData: packageData,
        },
        {
          id: `content-${packageKey}-form`,
          icon: "edit-3",
          text: `${packageKey} Form`,
          action: "contentForm",
          showCondition: "hasNoSelectedText",
          packageKey: packageKey,
          packageData: packageData,
        },
        {
          id: `content-${packageKey}-search`,
          icon: "search",
          text: `${packageKey} Search`,
          action: "contentSearch",
          showCondition: "hasNoSelectedText",
          packageKey: packageKey,
          packageData: packageData,
        },
      ];
    }

    // Default submenu for other package types
    return baseSubmenu.map((item) => ({
      ...item,
      packageKey: packageKey,
      packageData: packageData,
    }));
  }

  /**
   * Get icon for package type
   */
  getIconForPackageType(packageType) {
    const iconMap = {
      petani: "users",
      transaksi: "credit-card",
      project: "folder",
      default: "archive",
    };
    return iconMap[packageType] || "archive";
  }

  /**
   * Handle Applications action (dari controllers.js)
   * Action format: {type}Applications (contoh: "dataApplications", "petirApplications")
   */
  async handleApplicationsAction(baseType, targetElement, data = {}) {
    // Pastikan type ada di data untuk appControllers
    const appData = {
      ...data,
      type: baseType, // Tambahkan type dari baseType
      baseType: baseType,
      targetElement: targetElement,
      // Pastikan applications dan token ada (dari submenu atau data)
      applications: data.applications,
      token: data.token,
      // Pastikan chartType ada jika ini adalah action chart
      chartType: data.chartType
    };
    
    console.log('📦 ContentObject - handleApplicationsAction dipanggil:', {
      baseType: baseType,
      hasTargetElement: !!targetElement,
      hasApplications: !!appData.applications,
      hasToken: !!appData.token,
      hasChartType: !!appData.chartType,
      chartType: appData.chartType,
      appDataKeys: Object.keys(appData)
    });
    
    // Panggil appControllers dengan data lengkap
    return await appControllers(appData);
  }

  /**
   * Handle content element actions
   */
  async handleContentAction(action, data = {}) {
    // Log action untuk debugging
    console.log('🔍 ContentObject - Action diterima:', {
      action: action,
      hasTargetElement: !!data.targetElement,
      hasApplications: !!data.applications,
      hasToken: !!data.token,
      dataKeys: Object.keys(data),
      fullData: data
    });

    const targetElement = data.targetElement || this.interactions.targetElement;

    if (!targetElement) {
      return { success: false, error: "No target element found" };
    }

    // Extract package information from data
    const packageKey = data.packageKey;
    const packageData = data.packageData;
    const packageType = packageData?.type || "default";

    try {
      console.log('🔍 Memeriksa action:', {
        action: action,
        actionType: typeof action,
        endsWithApplications: action && action.endsWith ? action.endsWith("Applications") : false,
        startsWithAppChartData: action && action.startsWith ? action.startsWith("appChartData") : false
      });
      
      // Handle action chart yang dimulai dengan "appChartData" (dari submenu chart) - PRIORITAS PERTAMA
      if (action && typeof action === 'string' && action.startsWith("appChartData")) {
        // Ekstrak chartType dari action (appChartDataInsertBar -> "bar")
        const chartTypeMap = {
          "appChartDataInsertBar": "bar",
          "appChartDataInsertLine": "line",
          "appChartDataInsertPie": "pie",
          "appChartDataInsertDoughnut": "doughnut",
          "appChartDataInsertRadar": "radar"
        };
        const chartType = chartTypeMap[action] || "bar";
        const baseType = "chart"; // Set baseType ke "chart"
        
        console.log('📊 Chart action terdeteksi, akan diproses melalui Applications:', {
          action: action,
          chartType: chartType,
          baseType: baseType,
          hasApplications: !!data.applications,
          hasToken: !!data.token,
          receivedData: data
        });
        
        // Handler untuk action chart melalui Applications
        console.log('✅ Memanggil handleApplicationsAction untuk chart...');
        return await this.handleApplicationsAction(baseType, targetElement, {
          packageKey: packageKey,
          packageData: packageData,
          chartType: chartType, // Tambahkan chartType ke data
          ...data // Spread semua data termasuk applications dan token dari submenu
        });
      }
      
      // Handle action yang berakhiran "Applications" (dari controllers.js)
      if (action && typeof action === 'string' && action.endsWith("Applications")) {
        const baseType = action.replace("Applications", "");
        
        // Jika baseType adalah "chart", ekstrak chartType dari data.chartType (dari submenu)
        if (baseType === "chart" && data.chartType) {
          console.log('📊 Chart Applications terdeteksi dengan chartType:', {
            originalAction: action,
            baseType: baseType,
            chartType: data.chartType,
            hasApplications: !!data.applications,
            hasToken: !!data.token
          });
        } else {
          console.log('📦 Action Applications terdeteksi:', {
            originalAction: action,
            baseType: baseType,
            packageKey: packageKey,
            packageData: packageData
          });
        }
        
        // Handler untuk action Applications (termasuk chart)
        return await this.handleApplicationsAction(baseType, targetElement, {
          packageKey: packageKey,
          packageData: packageData,
          ...data // Spread semua data termasuk chartType, applications, token dari submenu
        });
      }

      switch (action) {
        case "contentProgress":
          return this.progress.insertPercentage(targetElement, {
            value: 50,
            label: packageKey ? `${packageKey} Progress` : "Progress",
            packageKey: packageKey,
            packageData: packageData,
            ...data,
          });

        case "contentPercentage":
          return this.percentage.insertPercentage(targetElement, {
            value: 75,
            label: packageKey ? `${packageKey} Percentage` : "Percentage",
            packageKey: packageKey,
            packageData: packageData,
            ...data,
          });

        case "contentProgres":
          return { success: false, error: "Progres component not available" };

        case "contentNarasi":
          return this.narasi.insertNarasi(targetElement, {
            title: packageKey ? `${packageKey} Narasi` : "Narasi",
            content: this.getNarasiContentForPackage(packageKey, packageType),
            packageKey: packageKey,
            packageData: packageData,
            ...data,
          });

        case "contentForm":
          return this.form.insertForm(targetElement, {
            title: packageKey ? `${packageKey} Form` : "Contact Form",
            fields: this.getFormFieldsForPackage(packageKey, packageType),
            packageKey: packageKey,
            packageData: packageData,
            ...data,
          });

        case "contentTabel":
          return this.tabel.insertTabel(targetElement, {
            title: packageKey ? `${packageKey} Data` : "Data Table",
            packageKey: packageKey,
            packageData: packageData,
            ...data,
          });

        case "contentSearch":
          return this.search.insertSearch(targetElement, {
            placeholder: packageKey ? `Search ${packageKey}...` : "Search...",
            buttonText: packageKey ? `Search ${packageKey}` : "Search",
            packageKey: packageKey,
            packageData: packageData,
            ...data,
          });


        default:
          return { success: false, error: `Unknown action: ${action}` };
      }
    } catch (error) {
      console.error(`❌ Error executing content action ${action}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get narasi content based on package type
   */
  getNarasiContentForPackage(packageKey, packageType) {
    const contentMap = {
      petani: `Ini adalah narasi untuk data ${packageKey}. Berisi informasi tentang petani dan aktivitas pertanian mereka.`,
      transaksi: `Ini adalah narasi untuk data ${packageKey}. Berisi informasi tentang transaksi dan keuangan.`,
      project: `Ini adalah narasi untuk project ${packageKey}. Berisi informasi tentang status dan progress project.`,
      default: "This is a sample narasi content...",
    };
    return contentMap[packageType] || contentMap["default"];
  }

  /**
   * Get form fields based on package type
   */
  getFormFieldsForPackage(packageKey, packageType) {
    const fieldsMap = {
      petani: [
        {
          name: "nama_petani",
          label: "Nama Petani",
          type: "text",
          required: true,
        },
        {
          name: "luas_lahan",
          label: "Luas Lahan (hektar)",
          type: "number",
          required: true,
        },
        {
          name: "jenis_tanaman",
          label: "Jenis Tanaman",
          type: "text",
          required: true,
        },
        { name: "alamat", label: "Alamat", type: "textarea", required: false },
      ],
      transaksi: [
        {
          name: "nomor_transaksi",
          label: "Nomor Transaksi",
          type: "text",
          required: true,
        },
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        { name: "jumlah", label: "Jumlah", type: "number", required: true },
        {
          name: "keterangan",
          label: "Keterangan",
          type: "textarea",
          required: false,
        },
      ],
      project: [
        {
          name: "nama_project",
          label: "Nama Project",
          type: "text",
          required: true,
        },
        { name: "status", label: "Status", type: "text", required: true },
        { name: "deadline", label: "Deadline", type: "date", required: true },
        {
          name: "deskripsi",
          label: "Deskripsi",
          type: "textarea",
          required: false,
        },
      ],
      default: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        {
          name: "message",
          label: "Message",
          type: "textarea",
          required: false,
        },
      ],
    };
    return fieldsMap[packageType] || fieldsMap["default"];
  }

  /**
   * Get table columns based on package type
   */
  getTableColumnsForPackage(packageKey, packageType) {
    const columnsMap = {
      petani: [
        { key: "nama", label: "Nama Petani" },
        { key: "luas_lahan", label: "Luas Lahan" },
        { key: "jenis_tanaman", label: "Jenis Tanaman" },
        { key: "status", label: "Status" },
      ],
      transaksi: [
        { key: "nomor", label: "Nomor Transaksi" },
        { key: "tanggal", label: "Tanggal" },
        { key: "jumlah", label: "Jumlah" },
        { key: "status", label: "Status" },
      ],
      project: [
        { key: "nama", label: "Nama Project" },
        { key: "status", label: "Status" },
        { key: "progress", label: "Progress" },
        { key: "deadline", label: "Deadline" },
      ],
      default: [
        { key: "name", label: "Name" },
        { key: "age", label: "Age" },
        { key: "email", label: "Email" },
      ],
    };
    return columnsMap[packageType] || columnsMap["default"];
  }

  /**
   * Get table rows based on package type
   */
  getTableRowsForPackage(packageKey, packageType) {
    const rowsMap = {
      petani: [
        {
          nama: "Ahmad Susanto",
          luas_lahan: "2.5",
          jenis_tanaman: "Padi",
          status: "Aktif",
        },
        {
          nama: "Siti Rahayu",
          luas_lahan: "1.8",
          jenis_tanaman: "Jagung",
          status: "Aktif",
        },
        {
          nama: "Budi Santoso",
          luas_lahan: "3.2",
          jenis_tanaman: "Kedelai",
          status: "Non-Aktif",
        },
      ],
      transaksi: [
        {
          nomor: "TXN001",
          tanggal: "2024-01-15",
          jumlah: "1500000",
          status: "Lunas",
        },
        {
          nomor: "TXN002",
          tanggal: "2024-01-16",
          jumlah: "750000",
          status: "Pending",
        },
        {
          nomor: "TXN003",
          tanggal: "2024-01-17",
          jumlah: "2000000",
          status: "Lunas",
        },
      ],
      project: [
        {
          nama: "Project Alpha",
          status: "Active",
          progress: "75%",
          deadline: "2024-02-15",
        },
        {
          nama: "Project Beta",
          status: "Pending",
          progress: "25%",
          deadline: "2024-03-01",
        },
        {
          nama: "Project Gamma",
          status: "Completed",
          progress: "100%",
          deadline: "2024-01-30",
        },
      ],
      default: [
        { name: "John Doe", age: 30, email: "john@example.com" },
        { name: "Jane Smith", age: 25, email: "jane@example.com" },
        { name: "Bob Johnson", age: 35, email: "bob@example.com" },
      ],
    };
    return rowsMap[packageType] || rowsMap["default"];
  }

  /**
   * Insert content element with specific type
   */
  insertContentElement(type, targetElement, options = {}) {
    return this.handleContentAction(
      `content${type.charAt(0).toUpperCase() + type.slice(1)}`,
      {
        targetElement,
        ...options,
      }
    );
  }

  /**
   * Get database instance for Content components
   */
  getDatabase() {
    return this.db;
  }

  /**
   * Get stored data from database
   */
  async getStoredData() {
    if (!this.db) {
      return [];
    }

    try {
      return await this.db.waitForDataLoad();
    } catch (error) {
      console.error("Failed to get stored data:", error);
      return [];
    }
  }

  /**
   * Check if database is ready
   */
  isDatabaseReady() {
    return this.db && this.db.isStoredDataLoaded();
  }

  /**
   * Add database reference to all Content components
   */
  addDatabaseToComponents() {
    const components = [
      this.progress,
      this.percentage,
      this.narasi,
      this.form,
      this.tabel,
      this.search,
    ];

    components.forEach((component) => {
      if (component) {
        // Add database access methods to each component
        component.getDatabase = () => this.getDatabase();
        component.getStoredData = () => this.getStoredData();
        component.isDatabaseReady = () => this.isDatabaseReady();

        // Add database reference
        component.db = this.db;
      }
    });
  }
}

export { contentObject };
