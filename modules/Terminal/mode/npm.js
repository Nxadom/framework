import { NexaNpm } from '../npm/index.js';

export async function npm(cmd) {
  try {
    const nexaNpm = new NexaNpm();
    await nexaNpm.init();
    const html = nexaNpm.render();
    cmd.output(html);
    cmd.commandRow.hideTime();
    cmd.commandRow.commandEntry.classList.add('block');
    cmd.startNewCommand();
    return false;
  } catch (error) {
    console.error('❌ mode npm failed:', error);
    cmd.error('Gagal memuat mode npm');
    return null;
  }
}
