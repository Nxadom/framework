export function txt(tabel) {
  // Color palette for different item names
  const colorPalette = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#C9CBCF",
    "#FF99CC",
    "#4BC0C0",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
  ];

  // Function to get color for item name
  const getItemColor = (itemName, index) => {
    if (index < colorPalette.length) {
      return colorPalette[index];
    } else {
      // Generate random color if exceeds palette
      const randomColor = () =>
        Math.floor(Math.random() * 16777215).toString(16);
      return `#${randomColor()}`;
    }
  };

  // Calculate total percentage for overall progress
  const totalPercent =
    Math.round(
      tabel.percent.reduce((sum, item) => sum + item.percent, 0) * 100
    ) / 100; // Round to 2 decimal places
  const totalItems = tabel.percent.reduce((sum, item) => sum + item.total, 0);

  // Find item with highest percentage
  const highestPercentItem = tabel.percent.reduce((max, item) =>
    item.percent > max.percent ? item : max
  );
  const highestPercentIndex = tabel.percent.findIndex(
    (item) => item === highestPercentItem
  );

  return `
    <div class="nx-row">
      <div class="nx-col-12">
        <div class="nx-card">
          <div class="nx-card-header">
            <h3 class="nx-card-title">
              <i class="fas fa-chart-pie" style="color: #FF6384;"></i> 
              Progress Report
            </h3>
            <div class="nx-summary">
              <span class="nx-badge nx-badge-primary">Total: ${totalItems} Items</span>
              <span class="nx-badge nx-badge-success">Overall: ${totalPercent}%</span>
            </div>
          </div>
          
          <div class="nx-card-body">
            <div class="nx-progress-overview">
              <div class="nx-progress-info">
                <div class="nx-progress-stats">
                  <div class="nx-stat-highlight">
                    <i class="fas fa-trophy" style="color: ${getItemColor(
                      highestPercentItem.name,
                      highestPercentIndex
                    )};"></i>
                    <div class="nx-stat-details">
                      <span class="nx-stat-label">Highest Progress</span>
                      <span class="nx-stat-value">${
                        highestPercentItem.label
                      } - ${
    Math.round(highestPercentItem.percent * 100) / 100
  }%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="nx-progress-bar-container">
                <div class="nx-progress-bar" style="width: ${totalPercent}%">
                  <span class="nx-progress-text">${totalPercent}% Complete</span>
                </div>
              </div>
            </div>
            
           <div class="nx-data-grid1 nx-row">
              ${tabel.percent
                .map(
                  (item, index) => `
                <div class="nx-col-6 mb-12px">
                <div class="nx-data-item" style="border-left-color: ${getItemColor(
                  item.name,
                  index
                )};">
                  <div class="nx-item-header">
                    <div class="nx-item-info">
                      <h4 class="nx-item-title">${item.label}</h4>
                      <span class="nx-item-type">${item.name}</span>
                    </div>
                    <div class="nx-item-stats">
                      <span class="nx-stat-item">
                        <i class="fas fa-list" style="color: ${getItemColor(
                          item.name,
                          index
                        )};"></i>
                        ${item.total} Total
                      </span>
                      <span class="nx-stat-item">
                        <i class="fas fa-percentage" style="color: ${getItemColor(
                          item.name,
                          index
                        )};"></i>
                        ${Math.round(item.percent * 100) / 100}%
                      </span>
                    </div>
                  </div>
                  
                  <div class="nx-progress-section">
                    <div class="nx-progress-labels">
                      <span>Progress</span>
                      <span>${Math.round(item.progres * 100) / 100}%</span>
                    </div>
                    <div class="nx-progress-bar-container">
                      <div class="nx-progress-bar nx-progress-bar-sm" style="width: ${
                        item.progres
                      }%; background: linear-gradient(90deg, ${getItemColor(
                    item.name,
                    index
                  )}, ${getItemColor(item.name, index)}CC);">
                        <span class="nx-progress-text">${
                          Math.round(item.progres * 100) / 100
                        }%</span>
                      </div>
                    </div>
                  </div>
                  
                 
                </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      .nx-card {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        margin-bottom: 20px;
      }
      
      .nx-card-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .nx-card-title {
        margin: 0;
        color: #333;
        font-size: 1.2em;
      }
      
      .nx-card-title i {
        margin-right: 8px;
        color: #007bff;
      }
      
      .nx-summary {
        display: flex;
        gap: 10px;
      }
      
      .nx-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85em;
        font-weight: 500;
      }
      
      .nx-badge-primary {
        background: #e3f2fd;
        color: #1976d2;
      }
      
      .nx-badge-success {
        background: #e8f5e8;
        color: #2e7d32;
      }
      
      .nx-card-body {
        padding: 20px;
      }
      
      .nx-progress-overview {
        margin-bottom: 30px;
      }
      
      .nx-progress-info {
        margin-bottom: 20px;
      }
      
      .nx-progress-stats {
        display: flex;
        justify-content: center;
      }
      
      .nx-stat-highlight {
        display: flex;
        align-items: center;
        gap: 12px;
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        padding: 15px 20px;
        border-radius: 12px;
        border: 2px solid #dee2e6;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        min-width: 300px;
        justify-content: center;
      }
      
      .nx-stat-highlight i {
        font-size: 1.5em;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      }
      
      .nx-stat-details {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .nx-stat-label {
        font-size: 0.85em;
        color: #6c757d;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }
      
      .nx-stat-value {
        font-size: 1.1em;
        color: #343a40;
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .nx-progress-bar-container {
        background: #f5f5f5;
        border-radius: 10px;
        height: 20px;
        overflow: hidden;
        position: relative;
      }
      
      .nx-progress-bar {
        background: linear-gradient(90deg, #4caf50, #8bc34a);
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s ease;
        position: relative;
      }
      
      .nx-progress-bar-sm {
        height: 12px;
      }
      
      .nx-progress-text {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: white;
        font-size: 0.8em;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      }
      
      .nx-data-grid {
        display: grid;
        gap: 20px;
      }
      
      .nx-data-grid1 {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
      }
      
      .nx-col-6 {
        flex: 0 0 calc(50% - 10px);
        max-width: calc(50% - 10px);
      }
      
      .mb-12px {
        margin-bottom: 12px;
      }
      
      .nx-data-item {
        background: #fafafa;
        border-radius: 8px;
        padding: 20px;
        border-left: 4px solid #007bff;
      }
      
      .nx-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .nx-item-title {
        margin: 0;
        color: #333;
        font-size: 1.1em;
      }
      
      .nx-item-type {
        color: #666;
        font-size: 0.9em;
        text-transform: capitalize;
      }
      
      .nx-item-stats {
        display: flex;
        gap: 15px;
      }
      
      .nx-stat-item {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #666;
        font-size: 0.9em;
      }
      
      .nx-stat-item i {
        color: #007bff;
      }
      
      .nx-progress-section {
        margin-bottom: 15px;
      }
      
      .nx-progress-labels {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.9em;
        color: #666;
      }
      
      .nx-status-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .nx-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      
      .nx-status-complete {
        /* Color will be set inline */
      }
      
      .nx-status-progress {
        /* Color will be set inline */
      }
      
      .nx-status-pending {
        /* Color will be set inline */
      }
      
      .nx-status-text {
        font-size: 0.9em;
        color: #666;
        font-weight: 500;
      }
      
      @media (max-width: 768px) {
        .nx-item-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        
        .nx-item-stats {
          flex-wrap: wrap;
        }
        
        .nx-col-6 {
          flex: 0 0 100%;
          max-width: 100%;
        }
        
        .nx-stat-highlight {
          min-width: auto;
          padding: 12px 16px;
        }
        
        .nx-stat-details {
          text-align: left;
        }
      }
    </style>
  `;
}
