/**
 * ProgramFiles - Menu Structure for Program Files
 * Provides menu structure for Program Files context menu
 */
import { appControllers } from "./Applications/index.js";
import { chartElements } from "./Applications/chart.js";
class ProgramFiles {
  constructor() {
    // Initialize if needed
  }

  /**
   * Get menu structure for Program Files
   * @returns {Promise<Array>} Menu structure array
   */
  async struktur() {
    try {
      // Get program files data from storage
      const NXUI = window.NXUI || globalThis.NXUI;
      if (!NXUI || !NXUI.ref) {
        console.warn("NXUI.ref is not available");
        return this.getDefaultMenu();
      }

      const appData = await NXUI.ref.getAll("programFiles");
      
      // If no data, return default menu
      if (!appData || !appData.data || appData.data.length === 0) {
        return this.getDefaultMenu();
      }

      // Return menu with submenu from program files data
      return [
        {
          id: "program-files",
          icon: "apps",
          iconType: "material",
          text: "Program Files",
          showCondition: "hasNoSelectedText",
          submenu: appData.data
        },
      ];
    } catch (error) {
      console.error("❌ ProgramFiles struktur failed:", error);
      return this.getDefaultMenu();
    }
  }
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
    // Panggil appControllers dengan data lengkap
    return await appControllers(appData);
  }

  /**
   * Handle chart action dari submenu
   * Action format: appChartDataInsertBar, appChartDataInsertLine, appChartDataInsertPie, dll
   */
  async handleChartAction(action, targetElement, data = {}) {
    try {
      console.log('🎯 handleChartAction dipanggil:', {
        action: action,
        hasTargetElement: !!targetElement,
        hasApplications: !!data.applications,
        hasToken: !!data.token,
        dataKeys: Object.keys(data)
      });
      
      // Ekstrak chartType dari action (appChartDataInsertBar -> "bar")
      const chartTypeMap = {
        "appChartDataInsertBar": "bar",
        "appChartDataInsertLine": "line",
        "appChartDataInsertPie": "pie",
        "appChartDataInsertDoughnut": "doughnut",
        "appChartDataInsertRadar": "radar"
      };
      
      const chartType = chartTypeMap[action] || "bar";
      console.log('📊 Chart type yang dipilih:', chartType);
      
      // Jika ada data.applications, ambil data dari API terlebih dahulu
      let chartData = [];
      
      if (data.applications && data.token) {
        try {
          const Federated = new NXUI.Federated({
            id: data.token
          });
          const dataTabel = await Federated.get(data.applications);
          
          // Proses data sama seperti di data.js
          if (dataTabel && dataTabel.response) {
            if (Array.isArray(dataTabel.response)) {
              chartData = dataTabel.response;
            } else if (typeof dataTabel.response === 'object') {
              const keys = Object.keys(dataTabel.response);
              const arrayKey = keys.find(key => Array.isArray(dataTabel.response[key]));
              if (arrayKey) {
                chartData = dataTabel.response[arrayKey];
              } else {
                chartData = [dataTabel.response];
              }
            }
            
            // Transformasi data jika diperlukan
            if (chartData.length > 0 && !chartData[0].hasOwnProperty('title')) {
              chartData = chartData.map((item, index) => {
                if (typeof item === 'object') {
                  const keys = Object.keys(item);
                  const titleKey = keys.find(k => 
                    k.toLowerCase().includes('title') || 
                    k.toLowerCase().includes('name') || 
                    k.toLowerCase().includes('label')
                  ) || keys[0];
                  const totalKey = keys.find(k => 
                    k.toLowerCase().includes('total') || 
                    k.toLowerCase().includes('count') || 
                    k.toLowerCase().includes('value')
                  ) || keys[1] || keys[keys.length - 1];
                  
                  return {
                    title: item[titleKey] || `Item ${index + 1}`,
                    total: Number(item[totalKey]) || 0
                  };
                }
                return {
                  title: `Item ${index + 1}`,
                  total: Number(item) || 0
                };
              });
            }
          }
        } catch (error) {
          console.error('❌ Error fetching chart data:', error);
        }
      }
      
      // Konversi chartData ke CSV format
      if (chartData && chartData.length > 0) {
        const labels = chartData.map(item => {
          return item.title || item.name || item.label || 'Unknown';
        }).join(',');
        
        const values = chartData.map(item => {
          const value = item.total || item.count || item.value || 0;
          return Number(value) || 0;
        }).join(',');
        
        const csvData = `${labels}\n${values}`;
        
        // Simpan data ke window SEBELUM memanggil contextInsertChart
        window.chartDataCSV = csvData;
        window.chartData = chartData;
        
        console.log('✅ Data chart disiapkan:', {
          itemCount: chartData.length,
          csvLength: csvData.length,
          csvPreview: csvData.substring(0, 100) + '...',
          chartType: chartType
        });
      } else {
        console.warn('⚠️ Chart data kosong atau tidak valid');
        // Tetap lanjutkan dengan sample data jika data kosong
        window.chartDataCSV = null;
        window.chartData = null;
      }
      
      // Pastikan chartElements memiliki targetElement yang benar
      if (this.chartElements) {
        this.chartElements.interactions.targetElement = targetElement;
        window.chartElementsInstance = this.chartElements;
        window.chartTargetElement = targetElement;
        
        console.log('📊 Memanggil contextInsertChart dengan:', {
          chartType: chartType,
          hasData: !!window.chartDataCSV,
          targetElement: !!targetElement
        });
        
        // Panggil contextInsertChart - data sudah tersedia di window.chartDataCSV
        return this.chartElements.contextInsertChart(chartType);
      } else {
        console.error('❌ Chart elements tidak diinisialisasi');
        return { success: false, error: "Chart elements not initialized" };
      }
    } catch (error) {
      console.error(`❌ Error handling chart action ${action}:`, error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Get default menu structure
   * @returns {Array} Default menu structure
   */
  getDefaultMenu() {
    return [
      {
        id: "program-files",
        icon: "apps",
        iconType: "material",
        text: "Program Files",
        action: "programFiles",
        showCondition: "hasNoSelectedText",
      },
    ];
  }
}

export { ProgramFiles };

