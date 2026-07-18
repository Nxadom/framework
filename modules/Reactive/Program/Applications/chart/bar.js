/**
 * Bar Chart Configuration Module
 * Modular configuration for Bar Chart type
 */

export const barChartConfig = {
  type: "bar",
  name: "Bar Chart",
  modalTitle: "Insert Bar Chart",
  defaultSampleData: "Sales,Revenue,Profit\n100,200,50\n150,300,75\n120,250,60",
  defaultTitle: "Bar Chart",
  
  /**
   * Parse CSV data for bar chart
   * Bar chart format: header = categories, multiple data rows
   */
  parseData(lines, colors, defaultColors) {
    const categories = lines[0].split(",").map((label) => label.trim());
    
    // Parse data rows
    const dataRows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(",")
        .map((val) => parseFloat(val.trim()) || 0);
      dataRows.push(values);
    }

    // Generate labels untuk sumbu X (Data Point 1, 2, 3, dst)
    const labels = dataRows.map((_, index) => `Data Point ${index + 1}`);

    // Create datasets - satu untuk setiap kategori (Sales, Revenue, Profit)
    const datasets = [];

    for (
      let categoryIndex = 0;
      categoryIndex < categories.length;
      categoryIndex++
    ) {
      const categoryName = categories[categoryIndex];

      // Ambil data untuk kategori ini dari semua baris
      const categoryData = dataRows.map((row) => row[categoryIndex] || 0);

      // Tentukan warna untuk kategori ini
      const categoryColor =
        colors.length > categoryIndex && colors[categoryIndex]
          ? colors[categoryIndex]
          : defaultColors[categoryIndex % defaultColors.length];

      datasets.push({
        label: categoryName, // Gunakan nama kategori (Sales, Revenue, Profit)
        data: categoryData,
        backgroundColor: categoryColor,
        borderColor: categoryColor,
        borderWidth: 1,
      });
    }

    return { labels, datasets };
  },

  /**
   * Get Chart.js configuration for bar chart
   */
  getChartConfig(labels, datasets, config) {
    return {
      type: "bar",
      data: {
        labels: labels,
        datasets: datasets,
      },
      options: {
        responsive: config.responsive,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: config.title,
          },
          legend: {
            display: config.showLegend,
          },
        },
        animation: config.enableAnimation,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };
  }
};

