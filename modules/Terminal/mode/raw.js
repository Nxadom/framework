import { TabelRaw } from '../raw/index.js';

export async function raw(cmd) {
  try {
    const data = [
      { version: '1.0.3', status: 'development', description: 'New features' },
      { version: '1.0.2', status: 'production', description: 'Bug fixes' },
    ];
    const table = new TabelRaw(data, {
      border: true,
      headerStyle: 'double',
      showIndex: true,
      indexHeader: 'No',
      columnAlign: {
        version: 'center',
        status: 'center',
      },
      maxWidth: 100,
    });

    const tableHTML = table.renderHTML();
    cmd.output(tableHTML);
  } catch (error) {
    console.error('❌ mode raw failed:', error);
    cmd.error('Gagal memuat mode raw');
  }
}
