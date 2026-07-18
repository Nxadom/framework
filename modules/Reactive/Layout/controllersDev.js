
export async function controllers() {
  try {
    // Ambil data storages saat ini
    const dataByFailed = await window.NXUI.ref.getAll("nexaStore");
    const storages = dataByFailed.data || [];

    // Gabungkan semua layar.data dari semua storage items
    const allLayarData = [];
    storages.forEach(storage => {
      if (storage?.layar?.data && Array.isArray(storage.layar.data)) {
        storage.layar.data.forEach(item => {
          const row = storage.layar[item];
          if (row) {
            // Jika type adalah "chart", tambahkan submenu dengan daftar chart types
            // Gunakan action yang unik dengan prefix "app" untuk menghindari tabrakan dengan action lain
            if (row?.type === "chart") {
              console.log('📊 Membuat submenu chart untuk:', {
                token: row?.token,
                label: row?.label,
                hasApplications: !!row.applications,
                applications: row.applications
              });
            }
           
            const chartSubmenu = row?.type === "chart" ? [
              {
                id: `${row?.token}-chart-bar`,
                icon: "bar-chart-2",
                text: "Bar Chart",
               // action: "appChartDataInsertBar",
                showCondition: "hasNoSelectedText",
                chartType: "bar",
                 action: row?.type+"Applications",
                applications: row.applications,
                token: row?.token
              },
              {
                id: `${row?.token}-chart-line`,
                icon: "trending-up",
                text: "Line Chart",
               // action: "appChartDataInsertLine",
                showCondition: "hasNoSelectedText",
                chartType: "line",
                 action: row?.type+"Applications",
                applications: row.applications,
                token: row?.token
              },
              {
                id: `${row?.token}-chart-pie`,
                icon: "pie-chart",
                text: "Pie Chart",
               // action: "appChartDataInsertPie",
                showCondition: "hasNoSelectedText",
                chartType: "pie",
                 action: row?.type+"Applications",
                applications: row.applications,
                token: row?.token
              },
              {
                id: `${row?.token}-chart-doughnut`,
                icon: "disc",
                text: "Doughnut Chart",
                //action: "appChartDataInsertDoughnut",
                showCondition: "hasNoSelectedText",
                chartType: "doughnut",
                 action: row?.type+"Applications",
                applications: row.applications,
                token: row?.token
              },
              {
                id: `${row?.token}-chart-radar`,
                icon: "activity",
                text: "Radar Chart",
                //action: "appChartDataInsertRadar",
                showCondition: "hasNoSelectedText",
                chartType: "radar",
                 action: row?.type+"Applications",
                applications: row.applications,
                token: row?.token
              }
            ] : undefined;

            allLayarData.push({
              failed: item,
              id: row?.token,
              icon: row?.icon,
              className: row?.className,
              token: row?.token,
              text: row?.label,
              type: row?.type,
              action: row?.type+"Applications",
              showCondition: "hasNoSelectedText",
              applications: row.applications, // Include applications data untuk ContentObject
              submenu: chartSubmenu // Tambahkan submenu jika type adalah "chart"
            });
          }
        });
      }
    });
    
    const result = allLayarData;

    const findDataByFailed = (data, failedValue) => {
      if (!failedValue) return [];
      // Gunakan filter untuk mendapatkan semua item dengan className yang sama (case-insensitive)
      return data.filter(item => {
        const match = item.className?.toLowerCase() === failedValue?.toLowerCase();
        return match;
      });
    };

    const complexQuery = await new NXUI.NexaModels()
      .Storage("controllers")
      .select(["*"])
      .where("userid", NEXA.userId)
      .where("categori", "Accses")
      .get();
    
    // Konversi data array menjadi array of objects dengan semua data lengkap
    const result2 = [];
    complexQuery.data.forEach((item) => {
      // Hanya tambahkan jika status = 1
      if (item.status === "1") {
        // Coba beberapa kemungkinan field untuk matching
        const searchClassName = item.className || item.appname || item.label;
        const foundSubmenu = findDataByFailed(result, searchClassName);
        
        result2.push({
          id: item.appid,
          icon: item.appicon ?? item.icon ?? "inventory_2",
          text: item.appname ?? item.label,
          action: "contentElements",
          showCondition: "hasNoSelectedText",
          submenu: foundSubmenu,
        });
      }
    });
    
    console.log('label:', result2);
    return result2;
    
  } catch (error) {
    console.error("❌ Manual mode initialization failed:", error);
    return error;
  }
}
