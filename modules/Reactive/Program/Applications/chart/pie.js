/**
 * Pie Chart Configuration Module
 * Modular configuration for Pie Chart type
 */

export const pieChartConfig = {
  type: "pie",
  name: "Pie Chart",
  modalTitle: "Insert Pie Chart",
  defaultSampleData: "Product A,Product B,Product C\n30,45,25",
  defaultTitle: "Pie Chart",
  
  /**
   * Parse CSV data for pie chart
   * Pie chart format: header = labels, single data row
   */
  parseData(lines, colors, defaultColors) {
    // Untuk pie: header = labels, single data row
    const labels = lines[0].split(",").map((label) => label.trim());

    if (lines.length < 2) {
      throw new Error("Pie chart requires labels and data values");
    }

    const values = lines[1]
      .split(",")
      .map((val) => parseFloat(val.trim()) || 0);

    // Generate colors untuk setiap slice
    const backgroundColors = [];
    for (let i = 0; i < labels.length; i++) {
      const sliceColor =
        colors.length > i && colors[i]
          ? colors[i]
          : defaultColors[i % defaultColors.length];
      backgroundColors.push(sliceColor);
    }

    const datasets = [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1,
      },
    ];

    return { labels, datasets };
  },

  /**
   * Get Chart.js configuration for pie chart
   */
  getChartConfig(labels, datasets, config) {
    return {
      type: "pie",
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
            position: "right",
          },
        },
        animation: config.enableAnimation,
      },
    };
  }
};

