export async function mode(cmd, route, extraArgs = '') {
  try {
    if (!route) {
      return getDefaultContent(cmd);
    }

    const safeActionName = String(route).trim().toLowerCase();
    if (!safeActionName) {
      return getDefaultContent(cmd, route);
    }

    // Tempelkan argumen tambahan ke cmd agar bisa dibaca oleh mode function
    if (extraArgs) {
      cmd._modeArgs = String(extraArgs).trim();
    } else {
      cmd._modeArgs = '';
    }

    const module = await import(`./${safeActionName}.js`);
    const contentFunction = module?.[safeActionName];

    if (typeof contentFunction !== 'function') {
      return getDefaultContent(cmd, route);
    }

    return await contentFunction(cmd);
  } catch (error) {
    return getDefaultContent(cmd, route);
  }
}

export function getDefaultContent(cmd,route) {
   cmd.error('Tidak Terdaftar: mode '+route);
   cmd.info('Buat fille:'+route+".js");
   cmd.info('Degan Fungsi:'+route+"(cmd)");
}
