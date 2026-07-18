/** Konversi objek tree (nested folder/file) ke array baris ASCII tree. */
function renderTreeLines(node, prefix = '') {
  const lines = [];
  const keys = Object.keys(node);
  keys.forEach((key, i) => {
    const isLeaf = i === keys.length - 1;
    const connector = isLeaf ? '└── ' : '├── ';
    const indent = prefix + (isLeaf ? '    ' : '│   ');

    const value = node[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Folder
      lines.push(prefix + connector + key + '/');
      lines.push(...renderTreeLines(value, indent));
    } else {
      // File
      lines.push(prefix + connector + key);
    }
  });
  return lines;
}

/** Baca satu folder via Electron IPC, return array { name, type } atau [] jika error. */
async function readFolder(folderPath) {
  try {
    const api = window.electronAPI || window.electronAPI;
    if (!api?.discoveryReadFolder) return [];
    const row = await api.discoveryReadFolder(String(folderPath || ''));
    if (!row?.ok) return [];
    return Array.isArray(row.entries) ? row.entries : [];
  } catch {
    return [];
  }
}

/** Rekursif bangun tree object dari filesystem */
async function buildFileTree(folderPath) {
  const entries = await readFolder(folderPath);
  const tree = {};

  // Urut: folder dulu, lalu file, masing-masing alphabetical
  const dirs = entries.filter((e) => e?.type === 'directory');
  const files = entries.filter((e) => e?.type !== 'directory');
  const sorted = [
    ...dirs.sort((a, b) => String(a.name).localeCompare(String(b.name))),
    ...files.sort((a, b) => String(a.name).localeCompare(String(b.name))),
  ];

  for (const entry of sorted) {
    const name = String(entry.name || '');
    if (entry.type === 'directory') {
      const subPath = folderPath.replace(/\\/g, '/').replace(/\/+$/, '') + '/' + name;
      tree[name] = await buildFileTree(subPath);
    } else {
      tree[name] = null;
    }
  }

  return tree;
}

export async function tree(cmd) {
  try {
    const Directory = String(cmd.workingDirectory || '').trim();
    cmd.info('=== Tree Viewer (mode tree) ===');
    cmd.info('');

    // Baca folder
    const treeObj = await buildFileTree(Directory.replace(/\\/g, '/'));

    if (Object.keys(treeObj).length === 0) {
      cmd.info('📁  ' + Directory + ' (empty)');
      cmd.info('');
      return false;
    }

    cmd.info('📁  ' + Directory + ':');
    cmd.info('');
    const treeLines = renderTreeLines(treeObj);
    cmd.output('<pre style="margin:0;line-height:1.5;font-family:monospace">' + treeLines.join('\n') + '</pre>');
    cmd.info('');

    return false;
  } catch (error) {
    console.error('❌ mode tree failed:', error);
    return null;
  }
}
