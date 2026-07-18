/**
 * Radar Chart Configuration Module
 * Modular configuration for Radar Chart type
 */

export const radarChartConfig = {
  type: "radar",
  name: "Radar Chart",
  modalTitle: "Insert Radar Chart",
  defaultSampleData: "Speed,Quality,Price,Support\n8,9,6,7\n6,8,9,8",
  defaultTitle: "Radar Chart",
  
  /**
   * Parse CSV data for radar chart
   * Radar chart format: header = axes, setiap baris = dataset
   */
  parseData(lines, colors, defaultColors) {
    // Untuk radar chart: header = axes, setiap baris = dataset
    const labels = lines[0].split(",").map((label) => label.trim()); // Speed, Quality, Price, Support

    // Parse data rows - setiap baris adalah satu dataset
    const datasets = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(",")
        .map((val) => parseFloat(val.trim()) || 0);

      // Tentukan warna untuk dataset ini
      const datasetColor =
        colors.length > i - 1 && colors[i - 1]
          ? colors[i - 1]
          : defaultColors[(i - 1) % defaultColors.length];

      datasets.push({
        label: `Dataset ${i}`, // Dataset 1, Dataset 2, dst
        data: values,
        backgroundColor: datasetColor + "40", // Semi-transparent for radar
        borderColor: datasetColor,
        pointBackgroundColor: datasetColor,
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: datasetColor,
        borderWidth: 2,
      });
    }

    return { labels, datasets };
  },

  /**
   * Get Chart.js configuration for radar chart
   */
  getChartConfig(labels, datasets, config) {
    return {
      type: "radar",
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
          r: {
            beginAtZero: true,
          },
        },
      },
    };
  }
};

