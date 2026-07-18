/**
 * Applications/index.js - Dynamic Application Controller
 * Routes to appropriate application handler based on type
 */

export async function appControllers(data) {
  try {
    if (!data || !data.type) {
      console.error('❌ appControllers: data atau data.type tidak ada', data);
      return { success: false, error: 'Data atau type tidak ditemukan' };
    }

    const type = data.type.toLowerCase();
    
    // Mapping type ke function name
    const functionMap = {
      'data': 'appData',
      'chart': 'appChart', // Chart juga menggunakan appData
      'progres': 'appProgres',
      'petir': 'appData', // fallback untuk petir
    };
    const functionName = functionMap[type] || 'appData';
      // Dynamic import module berdasarkan type
       const module = await import(`./${type}.js`);
      //const module = await import(`./data.js`);
    
      // Ambil function dari module
      const contentFunction = module[functionName];
    
      if (!contentFunction || typeof contentFunction !== 'function') {
        console.error(`❌ Function ${functionName} tidak ditemukan di module ${type}.js`);
        return { success: false, error: `Function ${functionName} tidak ditemukan` };
      }

      // Panggil function dengan data
      const result = await contentFunction(data);
    
      return result;
  } catch (error) {
    console.error('❌ Error di appControllers:', error);
    return { success: false, error: error.message };
  }
}