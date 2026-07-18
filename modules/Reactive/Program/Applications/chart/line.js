/**
 * Line Chart Configuration Module
 * Modular configuration for Line Chart type
 */

export const lineChartConfig = {
  type: "line",
  name: "Line Chart",
  modalTitle: "Insert Line Chart",
  defaultSampleData: "Jan,Feb,Mar,Apr\n10,20,15,25\n8,18,12,22",
  defaultTitle: "Line Chart",
  
  /**
   * Parse CSV data for line chart
   * Line chart format: header = categories, multiple data rows
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

    // Create datasets - satu untuk setiap kategori
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
        label: categoryName,
        data: categoryData,
        backgroundColor: categoryColor + "40", // Semi-transparent
        borderColor: categoryColor,
        borderWidth: 2,
        fill: false,
        tension: 0.1, // Smooth line
      });
    }

    return { labels, datasets };
  },

  /**
   * Get Chart.js configuration for line chart
   */
  getChartConfig(labels, datasets, config) {
    return {
      type: "line",
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

