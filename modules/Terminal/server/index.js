/**
 * Daftarkan command preview & run:
 *   run, target run, mobile
 *
 * @param {object} cmd    - Instance CommandLine
 * @param {object} ctx    - Dependency injection dari closure parent
 * @param {object}   ctx.shellCwd             - Getter/setter { get: fn, set: fn }
 * @param {Function} ctx.shellNormalize       - shellNormalize(path)
 * @param {Function} ctx.normalizeSlash       - normalizeSlash(path)
 * @param {Function} ctx.toDisplayPath        - toDisplayPath(path)
 * @param {Function} ctx.shellResolvePath     - shellResolvePath(path)
 * @param {object}   ctx.interactiveSession   - { nodeServerPort, nodeServerUrl, nodeServerOpened }
 * @param {Function} ctx.runNativeShellCommand - runNativeShellCommand(command)
 */
export function registerServerCommands(cmd, ctx) {
  if (!cmd || typeof cmd.addCommand !== 'function') return;

  const {
    shellCwd,
    shellNormalize,
    normalizeSlash,
    toDisplayPath,
    shellResolvePath,
    interactiveSession,
    runNativeShellCommand,
  } = ctx;

  // ──────────────────────────────────────────────────────────
  // resolveRunTargetPath
  // ──────────────────────────────────────────────────────────
  const resolveRunTargetPath = (rawTarget = '') => {
    const inputRaw = String(rawTarget || '').trim();
    const input = inputRaw.startsWith('@') ? inputRaw.slice(1) : inputRaw;

    if (input) {
      return shellResolvePath(input);
    }

    return shellResolvePath('index.html');
  };

  // ──────────────────────────────────────────────────────────
  // openPreviewWindow
  // ──────────────────────────────────────────────────────────
  const openPreviewWindow = async (targetPath) => {
    const filePath = shellNormalize(normalizeSlash(targetPath || ''));
    if (!filePath) {
      cmd.error('Target file tidak ditemukan. Gunakan: run <file.html>');
      return;
    }

    const lower = filePath.toLowerCase();
    if (!(lower.endsWith('.html') || lower.endsWith('.htm'))) {
      cmd.error('Hanya file HTML yang bisa di-run. Contoh: run index.html');
      return;
    }

    if (window.electronAPI?.openFilePreview) {
      try {
        const result = await window.electronAPI.openFilePreview(filePath.replace(/\//g, '\\'), {
          width: 1180,
          height: 760,
          title: `Preview - ${String(filePath).split('/').pop()}`,
        });
        if (!result?.ok) {
          cmd.error(`Gagal membuka preview window: ${String(result?.error || 'unknown-error')}`);
          return;
        }
        cmd.success(`Preview opened: ${toDisplayPath(filePath)}`);
        return;
      } catch (e) {
        cmd.error(`Gagal membuka preview window: ${String(e?.message || e)}`);
        return;
      }
    }

    const fileUrl = `file:///${encodeURI(filePath.replace(/\\/g, '/'))}`;
    const opened = window.open(fileUrl, '_blank', 'noopener');
    if (!opened) {
      cmd.error('Gagal membuka preview window. Cek izin pop-up/jendela baru.');
      return;
    }
    cmd.success(`Preview opened: ${toDisplayPath(filePath)}`);
  };

  // ──────────────────────────────────────────────────────────
  // detectAndRunNodeProject
  // ──────────────────────────────────────────────────────────
  const detectAndRunNodeProject = async () => {
    const cwdWin = String(shellCwd.get()).replace(/\//g, '\\');
    const detectFile = async (filename) => {
      if (!window.electronAPI?.discoveryReadFile) return null;
      try {
        const res = await window.electronAPI.discoveryReadFile(`${cwdWin}\\${filename}`);
        return res?.ok ? (res.content || '') : null;
      } catch { return null; }
    };

    const ensurePortFree = async (port) => {
      if (!Number.isFinite(port) || port <= 0) return true;
      if (!window.electronAPI?.terminalCheckPort || !window.electronAPI?.terminalFreePort) return true;
      try {
        const state = await window.electronAPI.terminalCheckPort({ port });
        if (state?.ok && state?.free === false) {
          const freed = await window.electronAPI.terminalFreePort({ port });
          if (freed?.ok && Array.isArray(freed.killed) && freed.killed.length > 0) {
            cmd.warning(`Port ${port} sedang dipakai, proses lama dihentikan: ${freed.killed.join(', ')}`);
          }
          const verify = await window.electronAPI.terminalCheckPort({ port });
          if (!verify?.ok || verify?.free === false) {
            cmd.error(`Port ${port} masih dipakai proses lain. Stop dulu proses di luar aplikasi, lalu coba lagi.`);
            return false;
          }
        }
      } catch { /* ignore */ }
      return true;
    };

    const detectPort = (script) => {
      const m = script.match(/--port\s+(\d+)/i);
      if (m) return Number(m[1]);
      if (/express/i.test(script)) return 3000;
      return 0;
    };

    const pkgRaw = await detectFile('package.json');
    if (pkgRaw) {
      try {
        const pkg = JSON.parse(String(pkgRaw));
        const startScript = String(pkg?.scripts?.start || '').trim();
        const mainEntry = String(pkg?.main || '').trim();

        // Ekstrak nama file entry dari npm start script (mis. "node server.js" → "server.js")
        const extractEntryFromScript = (script) => {
          const m = script.match(/(?:^|&&|\|\|)\s*(?:node(?:mon)?|ts-node)\s+([\w./\\-]+\.(?:js|ts|mjs|cjs))/i);
          return m ? m[1].trim() : '';
        };

        const port = detectPort(startScript) || detectPort(mainEntry) || 3000;

        if (startScript) {
          // Verifikasi file entry point ada sebelum jalankan npm start
          const entryFromScript = extractEntryFromScript(startScript);
          if (entryFromScript) {
            const entryContent = await detectFile(entryFromScript);
            if (!entryContent && entryContent !== '') {
              cmd.error(`📦 package.json ditemukan tapi entry "${entryFromScript}" tidak ada di folder ini.`);
              cmd.info(`💡 Buat file "${entryFromScript}" atau periksa isi package.json scripts.start`);
              return true;
            }
          }

          const portOk = await ensurePortFree(port);
          if (!portOk) return true;

          interactiveSession.nodeServerPort = port;
          interactiveSession.nodeServerUrl = '';
          interactiveSession.nodeServerOpened = false;

          cmd.info(`📦 Detected Node.js project: "${pkg.name || 'unknown'}"`);
          cmd.info(`🚀 Running: npm start (port ${port})`);
          cmd.info(`⏳ Server akan terbuka otomatis setelah siap...\n`);
          await runNativeShellCommand('npm start');
          return true;
        }

        if (mainEntry) {
          // Verifikasi main entry ada
          const mainContent = await detectFile(mainEntry);
          if (!mainContent && mainContent !== '') {
            cmd.error(`📦 package.json ditemukan tapi main "${mainEntry}" tidak ada di folder ini.`);
            return true;
          }

          const portOk = await ensurePortFree(port);
          if (!portOk) return true;

          interactiveSession.nodeServerPort = port;
          interactiveSession.nodeServerUrl = '';
          interactiveSession.nodeServerOpened = false;

          cmd.info(`📦 Detected Node.js project: "${pkg.name || 'unknown'}"`);
          cmd.info(`🚀 Running: node ${mainEntry} (port ${port})`);
          cmd.info(`⏳ Server akan terbuka otomatis setelah siap...\n`);
          await runNativeShellCommand(`node ${mainEntry}`);
          return true;
        }
      } catch { /* invalid JSON, skip */ }
    }

    const serverRaw = await detectFile('server.js');
    if (serverRaw) {
      const portOk = await ensurePortFree(3000);
      if (!portOk) return true;
      interactiveSession.nodeServerPort = 3000;
      interactiveSession.nodeServerUrl = '';
      interactiveSession.nodeServerOpened = false;
      cmd.info(`🚀 Running: node server.js (port 3000)`);
      cmd.info(`⏳ Server akan terbuka otomatis setelah siap...\n`);
      await runNativeShellCommand('node server.js');
      return true;
    }

    const appRaw = await detectFile('app.js');
    if (appRaw) {
      const portOk = await ensurePortFree(3000);
      if (!portOk) return true;
      interactiveSession.nodeServerPort = 3000;
      interactiveSession.nodeServerUrl = '';
      interactiveSession.nodeServerOpened = false;
      cmd.info(`🚀 Running: node app.js (port 3000)`);
      cmd.info(`⏳ Server akan terbuka otomatis setelah siap...\n`);
      await runNativeShellCommand('node app.js');
      return true;
    }

    return false;
  };

  // ──────────────────────────────────────────────────────────
  // openHtmlInMobileShell
  // ──────────────────────────────────────────────────────────
  const openHtmlInMobileShell = async (htmlContent, sourceLabel) => {
    if (!window.electronAPI?.buildMobileFrameFromContent) {
      cmd.error('buildMobileFrameFromContent API belum tersedia.');
      return;
    }
    try {
      const res = await window.electronAPI.buildMobileFrameFromContent({ content: htmlContent });
      if (!res?.ok) {
        cmd.error(`Gagal membuat mobile frame: ${String(res?.error || 'unknown')}`);
        return;
      }
      if (typeof globalThis.openBerandaWebviewHtml === 'function') {
        globalThis.openBerandaWebviewHtml(res.frameHtml, String(sourceLabel || ''));
      }
    } catch (e) {
      cmd.error(`Gagal membuka mobile preview: ${String(e?.message || e)}`);
    }
  };

  // ──────────────────────────────────────────────────────────
  // openMobileWebview
  // ──────────────────────────────────────────────────────────
  const openMobileWebview = async (urlArg) => {
    let targetUrl = String(urlArg || '').trim();

    const isHtmlPath = /\.html?$/i.test(targetUrl) && !/^https?:\/\//i.test(targetUrl) && !/^file:\/\//i.test(targetUrl);
    if (targetUrl && isHtmlPath && window.electronAPI?.discoveryReadFile) {
      const resolved = shellResolvePath(targetUrl);
      const winPath = resolved.replace(/\//g, '\\');
      try {
        const res = await window.electronAPI.discoveryReadFile(winPath);
        if (res?.ok && res?.content) {
          cmd.info(`Membuka mobile preview: ${toDisplayPath(resolved)}`);
          await openHtmlInMobileShell(res.content, toDisplayPath(resolved));
          return;
        }
      } catch { /* ignore */ }
      cmd.error(`File tidak ditemukan: ${toDisplayPath(resolved)}`);
      return;
    }

    if (!targetUrl && window.electronAPI?.discoveryReadFile) {
      const cwdWin = String(shellCwd.get()).replace(/\//g, '\\');
      let isNodeServer = false;
      let nodePort = 0;

      try {
        const pkgRes = await window.electronAPI.discoveryReadFile(`${cwdWin}\\package.json`);
        if (pkgRes?.ok && pkgRes?.content) {
          const pkg = JSON.parse(String(pkgRes.content));
          const startScript = String(pkg?.scripts?.start || pkg?.scripts?.dev || '');
          const hasServerKeyword = /\b(node|nodemon|ts-node|express|fastify|koa|hapi|nest|next|nuxt|vite|webpack-dev-server|serve)\b/i.test(startScript);
          if (startScript && hasServerKeyword) {
            isNodeServer = true;
            const mPort = startScript.match(/(?:--port\s+|PORT=)(\d+)/i);
            nodePort = mPort ? Number(mPort[1]) : 3000;
          }
        }
      } catch { /* ignore */ }

      if (isNodeServer) {
        const port = nodePort || 3000;
        targetUrl = `http://localhost:${port}`;

        let serverReady = false;
        if (window.electronAPI?.terminalCheckPort) {
          try {
            const state = await window.electronAPI.terminalCheckPort({ port });
            serverReady = state?.ok && state?.free === false;
          } catch { /* ignore */ }
        }

        if (serverReady) {
          cmd.info(`Membuka mobile preview: ${targetUrl}`);
          if (typeof globalThis.openBerandaWebviewPanel === 'function') {
            await globalThis.openBerandaWebviewPanel(targetUrl);
          }
        } else {
          cmd.info(`🚀 Menjalankan server port ${port}, webview akan terbuka otomatis...`);
          interactiveSession.nodeServerPort = port;
          interactiveSession.nodeServerUrl = '';
          interactiveSession.nodeServerOpened = false;
          const _urlToOpen = targetUrl;
          const _waitAndOpenWebview = async () => {
            const wait = (ms) => new Promise((r) => setTimeout(r, ms));
            let ready = false;
            for (let i = 0; !ready && i < 120; i++) {
              await wait(500);
              if (window.electronAPI?.terminalCheckPort) {
                try {
                  const s = await window.electronAPI.terminalCheckPort({ port });
                  ready = s?.ok && s?.free === false;
                } catch { /* ignore */ }
              }
            }
            if (ready && typeof globalThis.openBerandaWebviewPanel === 'function') {
              cmd.info(`Membuka mobile preview: ${_urlToOpen}`);
              await globalThis.openBerandaWebviewPanel(_urlToOpen);
            }
          };
          void runNativeShellCommand('npm start');
          void _waitAndOpenWebview();
        }
        return;
      }

      try {
        const htmlRes = await window.electronAPI.discoveryReadFile(`${cwdWin}\\index.html`);
        if (htmlRes?.ok && htmlRes?.content) {
          const resolved = shellResolvePath('index.html');
          cmd.info(`Membuka mobile preview: ${toDisplayPath(resolved)}`);
          await openHtmlInMobileShell(htmlRes.content, toDisplayPath(resolved));
          return;
        }
      } catch { /* ignore */ }
    }

    if (!targetUrl) targetUrl = 'http://localhost:3000';
    if (!/^https?:\/\/|^file:\/\//i.test(targetUrl)) targetUrl = `http://${targetUrl}`;
    cmd.info(`Membuka mobile preview: ${targetUrl}`);
    if (typeof globalThis.openBerandaWebviewPanel === 'function') {
      const result = await globalThis.openBerandaWebviewPanel(targetUrl);
      if (result?.ok === false) {
        cmd.error(`Gagal membuka webview: ${String(result?.error || 'unknown')}`);
      }
    } else {
      cmd.error('openBerandaWebviewPanel belum tersedia. Pastikan beranda sudah dimuat.');
    }
  };

  // ──────────────────────────────────────────────────────────
  // Command: run
  // ──────────────────────────────────────────────────────────
  cmd.addCommand('run target?', async function (command) {
    const targetArg = String(command.getArgument('target') || '').trim();

    if (/^mobile(\s+\S+)?$/i.test(targetArg)) {
      const mobileTarget = targetArg.replace(/^mobile\s*/i, '').trim();
      await openMobileWebview(mobileTarget);
      return;
    }

    if (!targetArg) {
      const nodeStarted = await detectAndRunNodeProject();
      if (nodeStarted) return;

      const targetPath = resolveRunTargetPath('');
      await openPreviewWindow(targetPath);
      return;
    }

    const targetPath = resolveRunTargetPath(targetArg);
    await openPreviewWindow(targetPath);
  }, 'Run project (HTML preview) or Node.js server (run / run index.html)');

  // ──────────────────────────────────────────────────────────
  // Command: target run
  // ──────────────────────────────────────────────────────────
  cmd.addCommand('target run', async function (command) {
    const targetArg = String(command.getArgument('target') || '').trim();
    const targetPath = resolveRunTargetPath(targetArg);
    await openPreviewWindow(targetPath);
  }, 'Open HTML preview in new window (@file.html run)');

  // ──────────────────────────────────────────────────────────
  // Command: mobile
  // ──────────────────────────────────────────────────────────
  cmd.addCommand('mobile url?', async function (command) {
    const urlArg = String(command.getArgument('url') || '').trim();
    await openMobileWebview(urlArg);
  }, 'Open Node.js server in mobile webview panel (mobile [url])');
}
