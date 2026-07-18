
export async function appProgres(data) {
  try {
    // Extract targetElement from data
    const targetElement = data.targetElement;
    
    if (!targetElement) {
      return {
        success: false,
        error: 'Target element tidak ditemukan'
      };
    }
    
const Federated= new NXUI.Federated({
  id:data.token,
  ...data
});
 
console.log('data:', data);
 const dataTabel= await Federated.analysis(data.failed);
 console.log('dataTabel:', dataTabel);

    // Generate and return HTML
    const dataList = dataTabel.response || [];
    
    // Normalize data: support both 'progres' and 'persen', 'kecamatan' and 'title'
    const normalizedData = dataList.map(item => ({
      ...item,
      // Use progres if available, otherwise use persen (remove % if exists)
      progres: item.progres !== undefined ? item.progres : (item.persen ? parseFloat(item.persen.replace('%', '')) : 0),
      // Use kecamatan if available, otherwise use title
      title: item.kecamatan || item.title || 'Unknown',
      // Format persen for display (add % if not present)
      persen: item.progres !== undefined ? `${item.progres}%` : (item.persen || '0%')
    }));
    
    // Calculate totals for summary (dinamis berdasarkan data)
    const totalItems = normalizedData.reduce((sum, item) => sum + (parseInt(item.total) || 0), 0);
    const totalData = normalizedData.length;
    const avgPersen = normalizedData.length > 0 
      ? (normalizedData.reduce((sum, item) => sum + (parseFloat(item.progres) || 0), 0) / normalizedData.length).toFixed(1)
      : 0;
    
    // Find data with highest progress
    const highestProgressData = normalizedData.length > 0
      ? normalizedData.reduce((max, item) => {
          const currentPersen = parseFloat(item.progres) || 0;
          const maxPersen = parseFloat(max.progres) || 0;
          return currentPersen > maxPersen ? item : max;
        }, normalizedData[0])
      : null;
    
    const highestProgressTitle = highestProgressData ? highestProgressData.title : '-';
    const highestProgressValue = highestProgressData ? highestProgressData.persen : '-';
    
    // Base array warna pastel
    const basePastelColors = [
      '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4',
      '#B4E4FF', '#FFCCCB', '#C7CEEA', '#B5EAD7', '#FFD3A5', '#FDFD96',
      '#C3B1E1', '#A8E6CF', '#FFAAA5', '#D4A5FF', '#FFB6C1', '#B0E0E6',
      '#F0E68C', '#98D8C8', '#F7DC6F', '#AED6F1', '#F8BBD0', '#C8E6C9'
    ];
    
    // Function to generate pastel color dynamically using HSL
    const generatePastelColor = (index) => {
      // Jika masih dalam range base colors, gunakan base colors
      if (index < basePastelColors.length) {
        return basePastelColors[index];
      }
      
      // Generate warna pastel dinamis menggunakan HSL
      // Menggunakan golden ratio untuk distribusi warna yang baik
      const hue = (index * 137.508) % 360; // Golden angle approximation
      const saturation = 60 + (index % 3) * 10; // 60-80% untuk pastel
      const lightness = 75 + (index % 2) * 5; // 75-80% untuk pastel yang lembut
      
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };
    
    // Function to get pastel color based on index (fully dynamic)
    const getPastelColor = (index) => {
      return generatePastelColor(index);
    };
    
    // Function to calculate brightness and determine text color (supports hex and HSL)
    const getTextColor = (color) => {
      let r, g, b;
      
      // Check if color is HSL format
      if (color.startsWith('hsl(')) {
        // Extract HSL values
        const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (hslMatch) {
          const h = parseInt(hslMatch[1]) / 360;
          const s = parseInt(hslMatch[2]) / 100;
          const l = parseInt(hslMatch[3]) / 100;
          
          // Convert HSL to RGB
          const c = (1 - Math.abs(2 * l - 1)) * s;
          const x = c * (1 - Math.abs((h * 6) % 2 - 1));
          const m = l - c / 2;
          
          if (h < 1/6) { r = c; g = x; b = 0; }
          else if (h < 2/6) { r = x; g = c; b = 0; }
          else if (h < 3/6) { r = 0; g = c; b = x; }
          else if (h < 4/6) { r = 0; g = x; b = c; }
          else if (h < 5/6) { r = x; g = 0; b = c; }
          else { r = c; g = 0; b = x; }
          
          r = Math.round((r + m) * 255);
          g = Math.round((g + m) * 255);
          b = Math.round((b + m) * 255);
        } else {
          // Fallback untuk pastel (lightness tinggi = terang)
          return '#333333';
        }
      } else {
        // Convert hex to RGB
        const hex = color.replace('#', '');
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
      }
      
      // Calculate brightness using relative luminance formula
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      
      // Return dark text for light backgrounds, light text for dark backgrounds
      return brightness > 155 ? '#333333' : '#ffffff';
    };
    
    const tableRows = normalizedData.map((item, index) => {
      // Extract numeric value from progres (already a number)
      const persenValue = parseFloat(item.progres) || 0;
      const progressColor = getPastelColor(index);
      const textColor = getTextColor(progressColor);
      
      return `
        <tr>
          <td class="text-center" style="width: 50px;">${index + 1}</td>
          <td style="font-weight: 500;font-weight:bold">${item.title}</td>
          <td class="text-center" style="width: 80px;">${item.total}</td>
          <td class="text-center" style="width: 80px;">${item.persen}</td>
          <td style="width: 200px; position: relative;">
            <div class="nx-progress" style="position: relative;">
              <div class="nx-progress-bar with-label" style="width: ${persenValue}%; background-color: ${progressColor}; color: ${textColor};">
                ${persenValue >= 5 ? item.persen : ''}
              </div>
              ${persenValue < 5 ? `<span style="position: absolute; left: ${Math.max(persenValue + 2, 0)}%; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: #212529; white-space: nowrap; padding-left: 4px; font-weight: 500;">${item.persen}</span>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
  const contentHTML = `
      <div style="font-family: 'Montserrat', Arial, sans-serif;">
        <!-- Header Laporan -->
        <div style="
          background: #ffffff;
          border: 1px solid #dee2e6;
          border-bottom: 0px solid #fff;
          border-radius: 4px;
          padding: 20px;
          margin-bottom: 0px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
              <h2 style="
                margin: 0 0 8px 0;
                font-size: 20px;
                font-weight: 600;
                color: #212529;
              ">Laporan Progress Perkembangan Data</h2>
              <p style="
                margin: 0;
                font-size: 13px;
                color: #6c757d;
              ">Ringkasan statistik dan progress perkembangan aplikasi</p>
            </div>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
              <div style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 12px 20px;
                text-align: center;
                min-width: 120px;
              ">
                <div style="font-size: 24px; font-weight: 600; margin-bottom: 4px; color: #212529;">${totalData}</div>
                <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Total Data</div>
              </div>
              <div style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 12px 20px;
                text-align: center;
                min-width: 120px;
              ">
                <div style="font-size: 24px; font-weight: 600; margin-bottom: 4px; color: #212529;">${totalItems}</div>
                <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Total Item</div>
              </div>
              <div style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 12px 20px;
                text-align: center;
                min-width: 120px;
              ">
                <div style="font-size: 24px; font-weight: 600; margin-bottom: 4px; color: #212529;">${avgPersen}%</div>
                <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Rata-rata</div>
              </div>
              <div style="
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                padding: 12px 20px;
                text-align: center;
                min-width: 150px;
              ">
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 4px; color: #212529; line-height: 1.3;">${highestProgressTitle}</div>
                <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Progress Terbesar (${highestProgressValue})</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tabel -->
        <div >
          <table class="nx-table nx-table-bordered">
          <thead>
            <tr>
              <th class="text-center" style="width: 50px;">No</th>
              <th>Data</th>
              <th class="text-center" style="width: 80px;">Total</th>
              <th class="text-center" style="width: 80px;">Persentase</th>
              <th class="text-center">Progress Bar</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        </div>
      </div>
    `;




    // Insert konten ke target element
    targetElement.insertAdjacentHTML("beforeend", contentHTML);
    return {
      success: true,
      message: `Progress application berhasil ditampilkan`,
      element: targetElement
    };

  } catch (error) {
    console.error('❌ Error di appProgres:', error);
    return {
      success: false,
      error: error.message
    };
  }
}