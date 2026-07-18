/**
 * Applications/data.js - Data Application Handler
 * Menampilkan konten data di target element saat user mengklik item
 */
export async function appData(data) {
  try {
    console.log('data:', data.applications);
    // Ambil targetElement dari data
     const targetElement = data.targetElement;
    
    if (!targetElement) {
      console.error('❌ appData: targetElement tidak ditemukan', data);
      return { 
        success: false, 
        error: 'Target element tidak ditemukan' 
      };
    }
     const Federated= new NXUI.Federated({
       id:data.token
     });
      const dataTabel= await Federated.get(data.applications);
 

    // Buat HTML konten untuk menampilkan informasi data
    const contentHTML = `
      <div class="nexa-app-data-container" style="
        padding: 20px;
        margin: 10px 0;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        background: #f8f9fa;
      ">
       Hello
      </div>
    `;

    // Insert konten ke target element
    targetElement.insertAdjacentHTML("beforeend", contentHTML);
    return {
      success: true,
      message: `Data application berhasil ditampilkan untuk type: ${data.baseType}`,
      element: appDataElement
    };

  } catch (error) {
    console.error('❌ Error di appData:', error);
    return {
      success: false,
      error: error.message
    };
  }
}