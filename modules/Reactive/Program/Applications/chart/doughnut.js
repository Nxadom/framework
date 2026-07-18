/**
 * Doughnut Chart Configuration Module
 * Modular configuration for Doughnut Chart type
 */

export const doughnutChartConfig = {
  type: "doughnut",
  name: "Donut Chart",
  modalTitle: "Insert Donut Chart",
  defaultSampleData: "Desktop,Mobile,Tablet\n60,30,10",
  defaultTitle: "Donut Chart",
  
  /**
   * Parse CSV data for doughnut chart
   * Doughnut chart format: header = labels, single data row
   */
  parseData(lines, colors, defaultColors) {
    // Untuk doughnut: header = labels, single data row
    const labels = lines[0].split(",").map((label) => label.trim());

    if (lines.length < 2) {
      throw new Error("Doughnut chart requires labels and data values");
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
   * Get Chart.js configuration for doughnut chart
   */
  getChartConfig(labels, datasets, config) {
    return {
      type: "doughnut",
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
        cutout: "50%", // Donut hole
      },
    };
  }
};

