import { CommandLine, CommandRow } from './bundle.min.js';
import { JsonViewer } from '../Json/bundle.js';
import { NexaNpm } from './NexaNpm.js';
import { developer } from './developer.js';
import { bundle } from './bundle.js';
import { rtdbRotifications } from './notifications.js';

import { allVersion, tabelVersion, packaceVersion } from './version.js';
import { TabelRaw, createTableHTML } from './tabelRaw.js';
import { registerServerCommands } from './server/index.js';

export let NexaCommand;

(() => {
    "use strict";

    NexaCommand = {};

    const CLI_HISTORY_STORE = 'bucketsCli';

    function nexaCliSortHistoryRows(rows) {
        if (!Array.isArray(rows)) {
            return [];
        }
        return [...rows].sort((a, b) => {
            const ta = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
            const tb = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
            return ta - tb;
        });
    }

    async function nexaPersistCliCommand(command) {
        const raw = String(command || '').trim();
        if (!raw) {
            return;
        }
        if (typeof NXUI === 'undefined' || !NXUI.ref || typeof NXUI.ref.set !== 'function') {
            return;
        }
        const id = `cli_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        try {
            await NXUI.ref.set(CLI_HISTORY_STORE, { id, command: raw });
        } catch {
            /* ignore */
        }
    }

    NexaCommand.hydrateCliHistory = async function (cmd) {
        if (!cmd) {
            return;
        }
        if (typeof NXUI === 'undefined' || !NXUI.ref || typeof NXUI.ref.getAll !== 'function') {
            return;
        }
        try {
            const res = await NXUI.ref.getAll(CLI_HISTORY_STORE);
            const rows = res && Array.isArray(res.data) ? res.data : [];
            const sorted = nexaCliSortHistoryRows(rows);
            const commands = sorted
                .map((row) => String(row?.command != null ? row.command : '').trim())
                .filter((s) => s.length > 0);
            cmd.history = commands;
            cmd.currentHistoryIndex = cmd.history.length;
        } catch {
            /* ignore */
        }
    };

    NexaCommand.instance = (selector, credential = null,db=null) => {
        // Get username from credential if oauth is true, otherwise use default
        const initialUsername = (credential?.oauth && credential?.data?.email) 
            ? credential.data.email 
            : null;
        
        const cmd = new CommandLine(selector, initialUsername);
        
        // Store credential and db in closure for access by command handlers
        let userCredential = credential;
        let userDb = db;

        function nexaRemoveTerminalProgressRow(term) {
            const cr = term.commandRow;
            if (cr && cr.commandRow) {
                try {
                    cr.commandRow.remove();
                } catch {
                    /* ignore */
                }
            }
            term.commandRow = null;
        }

        async function nexaRunWithTermWait(commandRef, kind, cwdHint, workFn) {
            const npmUi = new NexaNpm();
            let progressShown = false;
            try {
                await npmUi.ensureStylesheet();
                const progressHtml = npmUi.renderStartStopWait({
                    kind,
                    cwd: cwdHint != null ? String(cwdHint) : '',
                });
                commandRef.output(progressHtml);
                progressShown = true;
                if (commandRef.commandRow) {
                    commandRef.commandRow.hideTime();
                    commandRef.commandRow.commandEntry.classList.add('block');
                }
                const entryEl = commandRef.commandRow && commandRef.commandRow.commandEntry;
                if (entryEl) {
                    npmUi.initStartStopWait(entryEl, {
                        kind,
                        cwd: cwdHint != null ? String(cwdHint) : '',
                    });
                }
                await new Promise((resolve) => {
                    if (typeof requestAnimationFrame === 'function') {
                        requestAnimationFrame(() => requestAnimationFrame(resolve));
                    } else {
                        setTimeout(resolve, 50);
                    }
                });
                return await workFn();
            } finally {
                npmUi.destroy();
                if (progressShown) {
                    nexaRemoveTerminalProgressRow(commandRef);
                }
            }
        }

        const normalizeSlash = (value) => String(value || '').replace(/\/+/g, '/').replace(/\\+/g, '/');

        const resolveInitialCwd = () => {
            try {
                const terminalHost = selector && typeof selector.closest === 'function'
                    ? selector.closest('.beranda-terminal-host')
                    : null;
                const hostCwd = String(terminalHost?.dataset?.terminalCwd || '').trim();
                if (hostCwd) {
                    return shellNormalize(hostCwd);
                }
                const raw = localStorage.getItem('nx-discovery-editor-active');
                if (!raw) return 'D:/';
                const row = JSON.parse(raw);
                const filePath = String(row?.filePath || '').trim();
                if (!filePath) return 'D:/';
                const clean = normalizeSlash(filePath);
                const parts = clean.split('/').filter(Boolean);
                if (!parts.length) return 'D:/';
                parts.pop();
                if (!parts.length) return 'D:/';
                const maybeDrive = parts[0];
                if (/^[a-zA-Z]:$/.test(maybeDrive)) {
                    return `${maybeDrive}/${parts.slice(1).join('/')}`.replace(/\/+$/g, '') || `${maybeDrive}/`;
                }
                return `/${parts.join('/')}`;
            } catch {
                return 'D:/';
            }
        };

        const toDisplayPath = (value) => String(value || '').replace(/\//g, '\\');

        const shellJoin = (base, input) => {
            const cleanBase = normalizeSlash(base || 'D:/');
            const cleanInput = normalizeSlash(input || '');
            if (!cleanInput) return cleanBase;
            if (/^[a-zA-Z]:\//.test(cleanInput) || cleanInput.startsWith('/')) {
                return cleanInput;
            }
            const combined = `${cleanBase.replace(/\/+$/g, '')}/${cleanInput}`;
            return combined;
        };

        const shellNormalize = (inputPath) => {
            const src = normalizeSlash(inputPath || '');
            const hasDrive = /^[a-zA-Z]:\//.test(src);
            const drive = hasDrive ? src.slice(0, 2) : '';
            const rest = hasDrive ? src.slice(2) : src;
            const stack = [];
            for (const seg of rest.split('/')) {
                if (!seg || seg === '.') continue;
                if (seg === '..') {
                    if (stack.length > 0) stack.pop();
                    continue;
                }
                stack.push(seg);
            }
            if (hasDrive) {
                if (stack.length === 0) {
                    return `${drive}/`;
                }
                return `${drive}/${stack.join('/')}`.replace(/\/+$/g, '');
            }
            return `/${stack.join('/')}`.replace(/\/+$/g, '') || '/';
        };

        const shellResolvePath = (pathArg) => {
            const input = String(pathArg || '').trim();
            if (!input) return shellCwd;
            return shellNormalize(shellJoin(shellCwd, input));
        };

        const syncPromptWorkingDirectory = () => {
            try {
                cmd.workingDirectory = toDisplayPath(shellCwd);
                const host = selector && typeof selector.closest === 'function'
                    ? selector.closest('.beranda-terminal-host')
                    : null;
                if (host) {
                    host.dataset.terminalCwd = toDisplayPath(shellCwd);
                }
            } catch {
                /* ignore */
            }
        };

        const shouldTreatInputAsPathLike = (value) => {
            const s = String(value || '').trim();
            if (!s) {
                return false;
            }
            // Perintah multi-kata seperti `npm start` jangan dipaksa jadi `cd ...`.
            if (/\s+/.test(s)) {
                return false;
            }
            if (/^[A-Za-z]:[\\/]/.test(s) || /^[A-Za-z]:$/.test(s)) {
                return true;
            }
            if (/^\\\\/.test(s)) {
                return true;
            }
            if (s === '.' || s === '..') {
                return true;
            }
            if (/^\.[\\/]/.test(s) || /^\.\.[\\/]/.test(s)) {
                return true;
            }
            if (shellCwd) {
                const firstSeg = s.split(/\s+/)[0];
                const lowFirst = firstSeg.toLowerCase();
                for (let i = 0; i < cmd.commands.length; i++) {
                    if (cmd.commands[i].resolved.getCommand().toLowerCase() === lowFirst) {
                        return false;
                    }
                }
                if (/^[\w.\-\\/\s]+$/.test(s)) {
                    return true;
                }
            }
            return false;
        };

        let shellCwd = shellNormalize(resolveInitialCwd());
        syncPromptWorkingDirectory();
        const origRun = cmd.run.bind(cmd);
        cmd.run = function (command) {
            const raw = String(command || '').trim();
            const effectiveCommand = shouldTreatInputAsPathLike(raw) ? `cd ${raw}` : raw;
            void nexaPersistCliCommand(effectiveCommand);
            // Cek apakah command terdaftar
            const firstWord = raw.split(/\s+/)[0] || '';
            const isRegistered = firstWord && cmd.commands.some(
                (c) => c.resolved.getCommand().toLowerCase() === firstWord.toLowerCase()
            );
            if (isRegistered) {
                origRun(effectiveCommand);
                return;
            }
            // Tidak terdaftar — coba native shell
            if (firstWord && !/^(cd|home|help|clear|cls|pwd|login|logout|date|whoami|shortcuts|output-mode|output-clean|output-raw|clean|raw|shell-stop|stop-shell)$/i.test(firstWord)) {
                // dispatch ke native shell — stop() otomatis setelah command selesai
                const runPromise = runNativeShellCommand(raw);
                if (runPromise && typeof runPromise.then === 'function') {
                    runPromise.then(() => { try { cmd.stop(); } catch { /* ignore */ } });
                }
                return;
            }
            // Fallback: biarkan origRun yang menangani error
            origRun(effectiveCommand);
        };

        /**
         * Set command line username  by command argument
         */
        cmd.addCommand("update-user username", (command) => {
            cmd.setUsername(command.getArgument('username'));
        }, "Set username  by command argument");
 
        /**
         * Set command line username from prompt
         */
        cmd.addCommand("nxdev",async  function promptHandler() {
            return  await developer(cmd);
        }, 'Developer Extensions');


        cmd.addCommand("nx args*", async function (command) {
            const args = String(command.getArgument('args') || '').trim();
            const firstArg = args.split(/\s+/)[0] || '';
            if (firstArg) {
                // Route ke handler berikutnya berdasarkan firstArg
                // Misal: nx dev → firstArg = 'dev'
                if (firstArg === 'dev') {
                   return await developer(cmd)
                } else if (firstArg === 'bundle') {
                   return await bundle(cmd)
                } else if (firstArg === 'test') {
                   const { nxTest } = await import('../developer/test/index.js');
                   return await nxTest(cmd)
                } else {
                cmd.success(`${firstArg}`);
                }
            } else {
                cmd.success('nx (no arguments)');
            }
        }, "Developer Extensions (nx <subcommand>)");
 


      
        
        /**
         * Set command line username from prompt
         */
        cmd.addCommand("prompt", function promptHandler() {
            const retryPrompt = (userInput) => {
                if (userInput === '') {
                    cmd.error("Your name cannot be empty!");
                    cmd.prompt("type your name", retryPrompt);
                } else {
                    cmd.setUsername(userInput);
                    cmd.startNewCommand();
                }
            };
            cmd.prompt("type your name", retryPrompt);
            return false;
        }, 'Set username from prompt ');

        /**
         * Confirmation to remove all file ;)
         */
        cmd.addCommand("rm", function () {
            cmd.confirm("Are yous sure to delete all files?", (yes) => {
                if (yes) {
                    cmd.error("Permission denied!!");
                } else {
                    cmd.success("Great :)");
                }
                cmd.startNewCommand();
            });
            return false;
        }, 'Remove all files.');
       
      
        /**
         * Help :)
         */
        cmd.addCommand("help", function () {
            const helpResults = [];
            for (let command = 0; command < cmd.commands.length; command++) {
                const commandName = cmd.commands[command].resolved.getSignature();
                helpResults.push(commandName);
                helpResults.push(cmd.commands[command].description);
            }
            cmd.list(helpResults, 2);
        }, "Show available commands");

        /**
         * Clear terminal screen
         */
        cmd.addCommand("clear", function () {
            cmd.container.innerHTML = '';
            cmd.startNewCommand();
            return false;
        }, 'Clear terminal screen');

        cmd.addCommand("cls", function () {
            cmd.container.innerHTML = '';
            cmd.startNewCommand();
            return false;
        }, 'Clear terminal screen (alias)');

        cmd.addCommand("pwd", function () {
            cmd.output(toDisplayPath(shellCwd));
            try { cmd.commandRow?.hideTime?.(); } catch { /* ignore */ }
        }, 'Show current working directory');

        cmd.addCommand("cd path?", async function (command) {
            const pathArg = String(command.getArgument('path') || '').trim();
            if (!pathArg) {
                cmd.output(toDisplayPath(shellCwd));
                return;
            }

            const target = shellResolvePath(pathArg);
            if (window.electronAPI?.discoveryReadFolder) {
                try {
                    const row = await window.electronAPI.discoveryReadFolder(target.replace(/\//g, '\\'));
                    if (!row?.ok) {
                        cmd.error(`Path not found: ${toDisplayPath(target)}`);
                        return;
                    }
                    shellCwd = shellNormalize(normalizeSlash(row.path || target));
                    syncPromptWorkingDirectory();
                    cmd.success(toDisplayPath(shellCwd));
                    return;
                } catch {
                    cmd.error(`Path not found: ${toDisplayPath(target)}`);
                    return;
                }
            }

            shellCwd = target;
            syncPromptWorkingDirectory();
            cmd.success(toDisplayPath(shellCwd));
        }, 'Change current directory');

        cmd.addCommand('home', function () {
            shellCwd = shellNormalize('D:/');
            syncPromptWorkingDirectory();
            cmd.success('cwd reset to home');
        }, 'Reset cwd to default');

        cmd.addCommand("ls path?", async function (command) {
            const pathArg = String(command.getArgument('path') || '').trim();
            const target = shellResolvePath(pathArg);

            if (window.electronAPI?.discoveryReadFolder) {
                try {
                    const row = await window.electronAPI.discoveryReadFolder(target.replace(/\//g, '\\'));
                    if (!row?.ok) {
                        cmd.error(`Cannot read path: ${toDisplayPath(target)}`);
                        return;
                    }
                    const entries = Array.isArray(row.entries) ? row.entries : [];
                    const items = entries.map((entry) => {
                        const prefix = entry?.type === 'directory' ? '[DIR] ' : '      ';
                        return `${prefix}${String(entry?.name || '')}`;
                    });
                    if (!items.length) {
                        cmd.info('(empty)');
                        return;
                    }
                    cmd.list(items, 1);
                    return;
                } catch {
                    cmd.error(`Cannot read path: ${toDisplayPath(target)}`);
                    return;
                }
            }

            cmd.list([
                'Applications',
                'Library',
                'Users',
                'etc',
                'home',
                'var',
                'System',
            ], 1);
        }, 'List directory files');

        cmd.addCommand("dir path?", async function (command) {
            const pathArg = String(command.getArgument('path') || '').trim();
            const target = shellResolvePath(pathArg);

            if (window.electronAPI?.discoveryReadFolder) {
                try {
                    const row = await window.electronAPI.discoveryReadFolder(target.replace(/\//g, '\\'));
                    if (!row?.ok) {
                        cmd.error(`Cannot read path: ${toDisplayPath(target)}`);
                        return;
                    }
                    const entries = Array.isArray(row.entries) ? row.entries : [];
                    const items = entries.map((entry) => {
                        const prefix = entry?.type === 'directory' ? '[DIR] ' : '      ';
                        return `${prefix}${String(entry?.name || '')}`;
                    });
                    if (!items.length) {
                        cmd.info('(empty)');
                        return;
                    }
                    cmd.list(items, 1);
                    return;
                } catch {
                    cmd.error(`Cannot read path: ${toDisplayPath(target)}`);
                    return;
                }
            }

            cmd.list([
                'Applications',
                'Library',
                'Users',
                'etc',
                'home',
                'var',
                'System',
            ], 1);
        }, 'Alias for ls');

        const interactiveSession = { requestId: '', isExpo: false, webUrl: '', openingWeb: false };
        const OUTPUT_MODE_STORAGE_KEY = 'nx-terminal-output-mode';
        const readTerminalOutputMode = () => {
            try {
                const raw = String(localStorage.getItem(OUTPUT_MODE_STORAGE_KEY) || '').trim().toLowerCase();
                return raw === 'raw' ? 'raw' : 'clean';
            } catch {
                return 'clean';
            }
        };
        const writeTerminalOutputMode = (mode) => {
            const normalized = String(mode || '').trim().toLowerCase() === 'raw' ? 'raw' : 'clean';
            try {
                localStorage.setItem(OUTPUT_MODE_STORAGE_KEY, normalized);
            } catch {
                /* ignore */
            }
            return normalized;
        };
        let terminalOutputMode = readTerminalOutputMode();
        let activeShellRequestId = '';
        const resolveTerminalHost = () => {
            try {
                return selector && typeof selector.closest === 'function'
                    ? selector.closest('.beranda-terminal-host')
                    : null;
            } catch {
                return null;
            }
        };
        const dispatchTerminalState = (state, extra = {}) => {
            const host = resolveTerminalHost();
            const hostId = String(host?.dataset?.terminalHostId || '').trim();
            const cwd = toDisplayPath(shellCwd);
            if (host) {
                host.dataset.terminalProcessState = String(state || 'idle');
                host.dataset.terminalCwd = cwd;
                if (activeShellRequestId) {
                    host.dataset.terminalRequestId = activeShellRequestId;
                } else {
                    delete host.dataset.terminalRequestId;
                }
            }
            if (typeof window !== 'undefined') {
                window.dispatchEvent(
                    new CustomEvent('nexa-terminal-state', {
                        detail: {
                            hostId,
                            state,
                            cwd,
                            requestId: activeShellRequestId,
                            ...extra,
                        },
                    }),
                );
            }
        };
        const isInteractiveShellCommand = (text) => /^(npm|pnpm|yarn)\s+(start|run\s+dev)\b/i.test(String(text || '').trim())
            || /^(npx\s+expo|expo)\s+start\b/i.test(String(text || '').trim());
        const mapKeyToPty = (e) => {
            if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) return '\x03';
            if (e.key === 'Enter') return '\r';
            if (e.key === 'Tab') return '\t';
            if (e.key === 'Backspace') return '\x7f';
            if (e.key === 'ArrowUp') return '\x1b[A';
            if (e.key === 'ArrowDown') return '\x1b[B';
            if (e.key === 'ArrowRight') return '\x1b[C';
            if (e.key === 'ArrowLeft') return '\x1b[D';
            if (e.key === 'Escape') return '\x1b';
            if (e.key.length === 1 && !e.metaKey && !e.altKey) return e.key;
            return '';
        };
        const decodeTerminalDisplayUrls = (text) => {
            try {
                if (cmd?._decodeDisplayUrls) return cmd._decodeDisplayUrls(text);
            } catch { /* ignore */ }
            let s = String(text || '');
            s = s.replace(/\b(url=)([^&\s'"<>]+)/gi, (_, key, value) => {
                if (!/%[0-9A-Fa-f]{2}/.test(value)) return key + value;
                try {
                    return key + decodeURIComponent(value.replace(/\+/g, '%2B'));
                } catch {
                    return key + value;
                }
            });
            s = s.replace(/https?%3A%2F%2F[^\s)]+/gi, (token) => {
                try { return decodeURIComponent(token); } catch { return token; }
            });
            return s;
        };
        const parseExpoWebUrl = (text) => {
            const decoded = decodeTerminalDisplayUrls(text);
            const m = decoded.match(/Web is waiting on\s+(https?:\/\/[^\s]+)/i);
            if (m?.[1]) return String(m[1]).trim();
            const q = decoded.match(/\burl=(https?:\/\/[^&\s]+)/i);
            if (q?.[1]) return String(q[1]).trim();
            const enc = String(text || '').match(/\burl=(https?%3A%2F%2F[^&\s]+)/i);
            if (enc?.[1]) {
                try { return decodeURIComponent(enc[1].replace(/\+/g, '%2B')); } catch { /* ignore */ }
            }
            return '';
        };
        const openExpoWebInBerandaWebview = async () => {
            if (interactiveSession.openingWeb) {
                cmd.info('Expo webview masih diproses, mohon tunggu...');
                return true;
            }
            const url = String(interactiveSession.webUrl || '').trim();
            if (!url) {
                cmd.warning('URL Expo web belum siap. Tunggu "Web is waiting on ..." lalu tekan v lagi.');
                return false;
            }
            interactiveSession.openingWeb = true;
            cmd.info(`Membuka Expo webview panel... ${url}`);
            try {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                const isReady = async () => {
                    if (!window.electronAPI?.warmExpoWeb) return false;
                    try {
                        const res = await window.electronAPI.warmExpoWeb({ url });
                        return Boolean(res?.ok);
                    } catch {
                        return false;
                    }
                };
                let ready = await isReady();
                for (let i = 0; !ready && i < 16; i += 1) {
                    await wait(250);
                    ready = await isReady();
                }
                let opened = null;
                if (typeof globalThis.openBerandaWebviewPanel === 'function') {
                    opened = await globalThis.openBerandaWebviewPanel(url);
                } else if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('nexa-open-webview-panel', { detail: { url } }));
                    opened = { ok: true };
                }
                if (opened?.ok === false) {
                    cmd.error(String(opened?.error || 'Gagal membuka panel Webview.'));
                    return false;
                }
                cmd.info(`Expo web ditampilkan di panel Webview: ${url}`);
                return true;
            } catch {
                cmd.error('Gagal membuka panel Webview.');
                return false;
            } finally {
                interactiveSession.openingWeb = false;
            }
        };
        const openExpoWebInElectron = async () => {
            if (interactiveSession.openingWeb) {
                cmd.info('Expo web masih diproses, mohon tunggu...');
                return true;
            }
            const url = String(interactiveSession.webUrl || '').trim();
            if (!url || !window.electronAPI?.openWebWindow) {
                cmd.warning('URL Expo web belum siap. Tunggu "Web is waiting on ..." lalu tekan w lagi.');
                return false;
            }
            interactiveSession.openingWeb = true;
            cmd.info(`Membuka Expo web... ${url}`);
            try {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                const isReady = async () => {
                    if (!window.electronAPI?.warmExpoWeb) return false;
                    try {
                        const res = await window.electronAPI.warmExpoWeb({ url });
                        return Boolean(res?.ok);
                    } catch {
                        return false;
                    }
                };
                let ready = await isReady();
                for (let i = 0; !ready && i < 16; i += 1) {
                    await wait(250);
                    ready = await isReady();
                }
                await window.electronAPI.openWebWindow({
                    url,
                    width: 390,
                    height: 844,
                    minWidth: 360,
                    minHeight: 640,
                    title: `Expo Web - ${url}`,
                    reload: true,
                });
                cmd.info(`Expo web opened in Electron: ${url}`);
                return true;
            } catch {
                cmd.error('Gagal membuka Expo web window.');
                return false;
            } finally {
                interactiveSession.openingWeb = false;
            }
        };
        cmd.container.setAttribute('tabindex', '0');
        cmd.container.addEventListener('keydown', async (e) => {
            const reqId = String(interactiveSession.requestId || '');
            if (!reqId) return;
            if (interactiveSession.isExpo && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const key = String(e.key || '').toLowerCase();
                if (key === 'w') {
                    const opened = await openExpoWebInElectron();
                    if (opened) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }
                if (key === 'v') {
                    const opened = await openExpoWebInBerandaWebview();
                    if (opened) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                }
            }
            const data = mapKeyToPty(e);
            if (!data || !window.electronAPI?.terminalShellWrite) return;
            e.preventDefault();
            e.stopPropagation();
            void window.electronAPI.terminalShellWrite({ requestId: reqId, data });
        }, true);

        const runNativeShellCommand = async (fullCommand) => {
            const raw = String(fullCommand || '').trim();
            if (!raw) return;
            let execCommand = raw;
            if (!window.electronAPI?.terminalShellStream || !window.electronAPI?.onTerminalShellData || !window.electronAPI?.onTerminalShellExit) {
                cmd.error('API terminalShellStream belum tersedia. Restart aplikasi Electron.');
                return;
            }
            if (/^npm\s+start$/i.test(raw) && window.electronAPI?.discoveryReadFile && window.electronAPI?.terminalCheckPort && window.electronAPI?.terminalFreePort) {
                try {
                    const packagePath = `${shellCwd.replace(/\//g, '\\')}\\package.json`;
                    const pkgRes = await window.electronAPI.discoveryReadFile(packagePath);
                    if (pkgRes?.ok && pkgRes?.content) {
                        const pkg = JSON.parse(String(pkgRes.content || '{}'));
                        const startScript = String(pkg?.scripts?.start || '').trim();
                        // Guard khusus Electron app: pakai user-data-dir lokal agar cache tidak bentrok permission di %APPDATA%.
                        if (/\belectron(?:mon)?\b/i.test(startScript) && !/--user-data-dir\b/i.test(raw)) {
                            const userDataDir = `${shellCwd.replace(/\//g, '\\')}\\.electron-userdata-dev`;
                            execCommand = `${raw} -- --user-data-dir="${userDataDir}" --disable-gpu-shader-disk-cache`;
                        }
                        const m = startScript.match(/\bexpo\s+start\b[\s\S]*?--port\s+(\d+)/i);
                        const port = Number(m?.[1] || 0);
                        if (Number.isFinite(port) && port > 0) {
                            const state = await window.electronAPI.terminalCheckPort({ port });
                            if (state?.ok && state?.free === false) {
                                const freed = await window.electronAPI.terminalFreePort({ port });
                                if (freed?.ok && Array.isArray(freed.killed) && freed.killed.length > 0) {
                                    cmd.warning(`Port ${port} sedang dipakai, proses lama dihentikan: ${freed.killed.join(', ')}`);
                                }
                                const verify = await window.electronAPI.terminalCheckPort({ port });
                                if (!verify?.ok || verify?.free === false) {
                                    cmd.error(`Port ${port} masih dipakai proses lain. Stop dulu proses di luar aplikasi, lalu jalankan lagi npm start.`);
                                    return;
                                }
                            }
                        }
                    }
                } catch {
                    /* ignore */
                }
            }
            const cwdWin = shellCwd.replace(/\//g, '\\');
            const requestId = `term_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            activeShellRequestId = requestId;
            const isElectronNpmStart = /^npm\s+start\b/i.test(execCommand)
                && /--user-data-dir\s*=|--user-data-dir\s+"|--disable-gpu-shader-disk-cache/i.test(execCommand);
            const interactive = isInteractiveShellCommand(execCommand) && !isElectronNpmStart;
            if (interactive) {
                interactiveSession.requestId = requestId;
                interactiveSession.isExpo = /\b(?:npx\s+expo|expo)\s+start\b/i.test(execCommand)
                    || /^npm\s+start$/i.test(execCommand)
                    || /^npm\s+run\s+dev$/i.test(execCommand);
                interactiveSession.webUrl = '';
                try { cmd.container.focus(); } catch { /* ignore */ }
            }
            dispatchTerminalState('running', { command: execCommand, interactive: Boolean(interactive) });
            const stdoutState = { buffer: '' };
            const stderrState = { buffer: '' };
            const streamOut = { liveRow: null, progressRow: null, lastLine: '' };

            const isBundlerProgressLine = (text) => {
                const t = String(text || '').trim();
                if (!t) return false;
                if (/^Web Bundled\s+\d+ms/i.test(t)) return true;
                return /^Web\s+\S+/.test(t) && /[░▓▒█]/.test(t);
            };

            const splitConcatenatedOutput = (text) => {
                let s = String(text || '');
                s = s.replace(/reserved\.([A-Za-z]:\\)/g, 'reserved.\n$1');
                s = s.replace(/([^\n\r])>(?=[A-Za-z/\\])/g, '$1\n>');
                s = s.replace(/([^\n\r])(Starting project at )/g, '$1\n$2');
                s = s.replace(/([^\n\r])(Starting Metro Bundler)/g, '$1\n$2');
                s = s.replace(/(\.mjs)([A-Z])/g, '$1\n$2');
                s = s.replace(/(\.)\[electronmon\]/g, '$1\n[electronmon]');
                return s;
            };

            const normalizeTerminalNoiseLine = (line) => {
                let text = String(line ?? '').replace(/\u0000/g, '').trimEnd();
                if (!text) return '';

                // Mode raw: tampilkan output asli (hanya strip karakter null)
                if (terminalOutputMode === 'raw') return text;

                // Artefak auto-confirm PTY lama: "YD:\path>"
                text = text.replace(/^Y(?=[A-Za-z]:[\\/])/, '');

                // Jika prompt menempel di depan output, buang bagian prompt-nya.
                text = text.replace(/^[A-Za-z]:[\\/][^>]*>\s*(?=[A-Za-z]:[\\/].+)/, '');

                // Noise bawaan cmd/windows yang tidak relevan untuk user.
                if (/^Microsoft Windows \[Version/i.test(text)) return '';
                if (/^\(c\) Microsoft Corporation\./i.test(text)) return '';
                if (/^>\s*chcp\s+65001\s*$/i.test(text)) return '';
                if (/^>\s*nul\s*$/i.test(text)) return '';

                // Prompt murni (tanpa output) cukup diabaikan agar tidak berantakan.
                if (/^[A-Za-z]:[\\/].*>\s*$/.test(text)) return '';

                // Duplicate info dari shell wrapper, sudah cukup diwakili status akhir terminal.
                if (/electron\.exe exited with signal sigint/i.test(text)) return '';

                // Sembunyikan command internal hasil injeksi flag cache agar output tetap bersih.
                if (/^>\s*electron\b/i.test(text) && /--user-data-dir|--disable-gpu-shader-disk-cache/i.test(text)) {
                    return '';
                }

                return text;
            };

            const fixTerminalEncoding = (text) => {
                let s = String(text || '');
                if (!s) return s;
                const replacements = [
                    ['≡ƒöÇ', '🔀'],
                    ['ΓåÆ', '→'],
                    ['Γ£à', '✅'],
                    ['â†’', '→'],
                    ['âœ…', '✅'],
                ];
                for (const [bad, good] of replacements) {
                    if (s.includes(bad)) s = s.split(bad).join(good);
                }
                if (/ΓåÆ|Γ£à|≡ƒ|â†|âœ|Ã.|Â./.test(s)) {
                    try {
                        const bytes = new Uint8Array(s.length);
                        for (let i = 0; i < s.length; i += 1) bytes[i] = s.charCodeAt(i) & 0xff;
                        const recovered = new TextDecoder('utf-8').decode(bytes);
                        if (recovered && !/[\uFFFD]{2,}/.test(recovered)) s = recovered;
                    } catch { /* ignore */ }
                }
                return s;
            };

            const stripTerminalControls = (chunk) => {
                let s = fixTerminalEncoding(String(chunk || ''));
                s = s.replace(/\x1B\][^\x07\x1B]*(?:\x07|\x1B\\)/g, '');
                s = s.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '');
                s = s.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, (ch) => (
                    ch === '\n' || ch === '\r' || ch === '\t' ? ch : ''
                ));
                return s;
            };

            const renderStreamText = (text) => {
                const decoded = decodeTerminalDisplayUrls(text);
                try {
                    return cmd._renderAnsiToHtml ? cmd._renderAnsiToHtml(decoded) : decoded;
                } catch {
                    return decoded;
                }
            };

            const finalizeLiveStreamRow = () => {
                if (!streamOut.liveRow) return;
                try { streamOut.liveRow.disable(); } catch { /* ignore */ }
                try { streamOut.liveRow.hideTime?.(); } catch { /* ignore */ }
                streamOut.liveRow = null;
            };

            const writeStreamLine = (line, kind = 'stdout') => {
                finalizeLiveStreamRow();
                const text = normalizeTerminalNoiseLine(line);
                if (!text) return;
                const norm = text.replace(/\s+/g, ' ').trim();
                const lastNorm = String(streamOut.lastLine || '').replace(/\s+/g, ' ').trim();
                if (norm && norm === lastNorm) return;

                if (isBundlerProgressLine(text)) {
                    if (!streamOut.progressRow) {
                        streamOut.progressRow = new CommandRow(cmd, () => {});
                        try { streamOut.progressRow.disable(); } catch { /* ignore */ }
                        try { streamOut.progressRow.hideUser(); } catch { /* ignore */ }
                        try { streamOut.progressRow.hideTime(); } catch { /* ignore */ }
                    }
                    streamOut.progressRow.setEntry(renderStreamText(text));
                    streamOut.lastLine = text;
                    try { cmd.commandRow?.disable?.(); } catch { /* ignore */ }
                    return;
                }

                streamOut.progressRow = null;
                streamOut.lastLine = text;
                const row = new CommandRow(cmd, () => {});
                try { row.disable(); } catch { /* ignore */ }
                try { row.hideUser(); } catch { /* ignore */ }
                try { row.hideTime(); } catch { /* ignore */ }
                row.setEntry(renderStreamText(text));
                if (kind === 'stderr') {
                    try { row.commandEntry?.classList?.add('error'); } catch { /* ignore */ }
                }
                try { cmd.commandRow?.disable?.(); } catch { /* ignore */ }
            };

            const updateLiveStreamLine = (line, kind = 'stdout') => {
                const text = normalizeTerminalNoiseLine(line);
                if (!text) {
                    finalizeLiveStreamRow();
                    return;
                }
                if (isBundlerProgressLine(text)) {
                    writeStreamLine(text, kind);
                    return;
                }
                if (!streamOut.liveRow) {
                    streamOut.liveRow = new CommandRow(cmd, () => {});
                    try { streamOut.liveRow.disable(); } catch { /* ignore */ }
                    try { streamOut.liveRow.hideUser(); } catch { /* ignore */ }
                    try { streamOut.liveRow.hideTime(); } catch { /* ignore */ }
                    try { cmd.commandRow?.disable?.(); } catch { /* ignore */ }
                }
                streamOut.liveRow.setEntry(renderStreamText(text));
                if (kind === 'stderr') {
                    try { streamOut.liveRow.commandEntry?.classList?.add('error'); } catch { /* ignore */ }
                }
            };

            const ingestTerminalChunk = (state, chunk, kind = 'stdout') => {
                const s = splitConcatenatedOutput(stripTerminalControls(chunk));
                const expoUrl = parseExpoWebUrl(s);
                if (expoUrl) interactiveSession.webUrl = expoUrl;

                for (let i = 0; i < s.length; i += 1) {
                    const ch = s[i];
                    if (ch === '\r') {
                        if (s[i + 1] === '\n') {
                            writeStreamLine(state.buffer, kind);
                            state.buffer = '';
                            i += 1;
                        } else {
                            // Progress bar TTY: \r menimpa baris yang sama, bukan baris baru.
                            state.buffer = '';
                        }
                    } else if (ch === '\n') {
                        writeStreamLine(state.buffer, kind);
                        state.buffer = '';
                    } else {
                        state.buffer += ch;
                    }
                }

                if (state.buffer) {
                    updateLiveStreamLine(state.buffer, kind);
                }
            };

            const flushTerminalStream = (state, kind = 'stdout', force = false) => {
                if (force && state.buffer) {
                    writeStreamLine(state.buffer, kind);
                    state.buffer = '';
                }
                finalizeLiveStreamRow();
                if (force) {
                    streamOut.progressRow = null;
                    streamOut.lastLine = '';
                }
            };

            const execResult = await new Promise((resolve) => {
                const offData = window.electronAPI.onTerminalShellData((payload) => {
                    if (!payload || payload.requestId !== requestId) return;
                    if (payload.stream === 'stderr') {
                        ingestTerminalChunk(stderrState, payload.data || '', 'stderr');
                    } else {
                        ingestTerminalChunk(stdoutState, payload.data || '', 'stdout');
                    }
                });
                const offExit = window.electronAPI.onTerminalShellExit((payload) => {
                    if (!payload || payload.requestId !== requestId) return;
                    if (interactiveSession.requestId === requestId) {
                        interactiveSession.requestId = '';
                        interactiveSession.isExpo = false;
                        interactiveSession.webUrl = '';
                        interactiveSession.openingWeb = false;
                    }
                    flushTerminalStream(stdoutState, 'stdout', true);
                    flushTerminalStream(stderrState, 'stderr', true);
                    offData?.();
                    offExit?.();
                    if (payload.error) {
                        cmd.error(String(payload.error));
                        activeShellRequestId = '';
                        dispatchTerminalState('error', {
                            command: execCommand,
                            exitCode: Number(payload.exitCode || 1),
                            error: String(payload.error),
                        });
                        resolve({ exitCode: Number(payload.exitCode || 1), error: String(payload.error) });
                        return;
                    }
                    activeShellRequestId = '';
                    dispatchTerminalState(Number(payload.exitCode || 0) === 0 ? 'success' : 'error', {
                        command: execCommand,
                        exitCode: Number(payload.exitCode || 0),
                    });
                    resolve({ exitCode: Number(payload.exitCode || 0), error: '' });
                });
                void window.electronAPI.terminalShellStream({
                    requestId,
                    command: execCommand,
                    cwd: cwdWin,
                }).catch((err) => {
                    offData?.();
                    offExit?.();
                    if (interactiveSession.requestId === requestId) {
                        interactiveSession.requestId = '';
                        interactiveSession.isExpo = false;
                        interactiveSession.webUrl = '';
                        interactiveSession.openingWeb = false;
                    }
                    cmd.error(String(err?.message || err));
                    activeShellRequestId = '';
                    dispatchTerminalState('error', {
                        command: execCommand,
                        exitCode: 1,
                        error: String(err?.message || err),
                    });
                    resolve({ exitCode: 1, error: String(err?.message || err) });
                });
            });
            const exitCode = Number(execResult?.exitCode || 0);
            if (exitCode !== 0) {
                if (!execResult?.error) {
                    cmd.error(`Command exited with code ${exitCode}`);
                }
            }
        };

        const stopActiveNativeShell = async () => {
            const reqId = String(activeShellRequestId || interactiveSession.requestId || '').trim();
            if (!reqId) {
                cmd.info('Tidak ada proses shell aktif.');
                dispatchTerminalState('idle', { stopped: false, message: 'no-active-process' });
                return;
            }

            if (!window.electronAPI?.terminalShellStop) {
                cmd.error('API terminalShellStop belum tersedia. Restart aplikasi Electron.');
                dispatchTerminalState('error', {
                    requestId: reqId,
                    stopped: false,
                    error: 'terminalShellStop-unavailable',
                });
                return;
            }

            try {
                const stopped = await window.electronAPI.terminalShellStop({ requestId: reqId, signal: 'SIGINT' });
                if (!stopped?.ok) {
                    cmd.error(String(stopped?.error || 'Gagal menghentikan proses shell aktif.'));
                    dispatchTerminalState('error', {
                        requestId: reqId,
                        stopped: false,
                        error: String(stopped?.error || 'stop-failed'),
                    });
                    return;
                }
                cmd.warning('Proses shell dihentikan oleh pengguna.');
                dispatchTerminalState('error', {
                    requestId: reqId,
                    stopped: true,
                    reason: 'user-stop',
                });
            } catch (e) {
                cmd.error(String(e?.message || e));
                dispatchTerminalState('error', {
                    requestId: reqId,
                    stopped: false,
                    error: String(e?.message || e),
                });
            }
        };

        cmd.addCommand('shell-stop', async function () {
            await stopActiveNativeShell();
        }, 'Stop active native shell process in current terminal tab');
        cmd.addCommand('stop-shell', async function () {
            await stopActiveNativeShell();
        }, 'Alias shell-stop');

        cmd.addCommand('output-mode mode?', function (command) {
            const modeArg = String(command.getArgument('mode') || '').trim().toLowerCase();
            if (!modeArg) {
                cmd.info(`Output mode: ${terminalOutputMode}`);
                cmd.info('Gunakan: output-mode clean | output-mode raw');
                return;
            }
            if (modeArg !== 'clean' && modeArg !== 'raw') {
                cmd.error('Mode tidak valid. Pakai: clean atau raw.');
                return;
            }
            terminalOutputMode = writeTerminalOutputMode(modeArg);
            cmd.success(`Output mode diubah ke: ${terminalOutputMode}`);
        }, 'Set/get terminal output mode (clean/raw)');

        cmd.addCommand('output-clean', function () {
            terminalOutputMode = writeTerminalOutputMode('clean');
            cmd.success('Output mode: clean');
        }, 'Set output mode ke clean');

        cmd.addCommand('output-raw', function () {
            terminalOutputMode = writeTerminalOutputMode('raw');
            cmd.success('Output mode: raw');
        }, 'Set output mode ke raw');

        cmd.addCommand('clean', function () {
            terminalOutputMode = writeTerminalOutputMode('clean');
            cmd.success('Output mode: clean');
        }, 'Alias output-clean');

        cmd.addCommand('raw', function () {
            terminalOutputMode = writeTerminalOutputMode('raw');
            cmd.success('Output mode: raw');
        }, 'Alias output-raw');

        const registerNativeShellAlias = (name) => {
            cmd.addCommand(`${name} args*`, async function (command) {
                const args = String(command.getArgument('args') || '').trim();
                const full = `${name}${args ? ` ${args}` : ''}`;
                await runNativeShellCommand(full);
            }, `Run native ${name} command`);
        };

        ['npm', 'npx', 'node', 'git', 'yarn', 'pnpm', 'rmdir', 'del', 'rd', 'mkdir', 'copy', 'move', 'xcopy', 'ren', 'type', 'fc', 'attrib', 'tree', 'robocopy'].forEach(registerNativeShellAlias);

        dispatchTerminalState('idle', { ready: true });

        registerServerCommands(cmd, {
          shellCwd: { get: () => shellCwd, set: (v) => { shellCwd = v; } },
          shellNormalize,
          normalizeSlash,
          toDisplayPath,
          shellResolvePath,
          syncPromptWorkingDirectory,
          interactiveSession,
          runNativeShellCommand,
          nexaRunWithTermWait,
        });

        cmd.addCommand("date", function () {
            cmd.output(new Date().toString());
            try { cmd.commandRow?.hideTime?.(); } catch { /* ignore */ }
        }, 'Show current date and time');

        cmd.addCommand("whoami", function () {
            cmd.output(String(cmd.username || 'NEXA'));
            try { cmd.commandRow?.hideTime?.(); } catch { /* ignore */ }
        }, 'Show current username');

        cmd.addCommand("shortcuts", function () {
            cmd.list([
                'Ctrl + c : Cancel command',
                'Ctrl + r : Clear screen',
                'Arrow Up : Previous command',
                'Arrow Down : Next command',
                'Tab : Autocomplete command',
                'start [port] : Start static server from cwd',
                'dev [port] : Start dev/static server from cwd',
                'stop [port] : Stop one server or all',
                'servers : List active servers',
                'restart <port> : Restart server by port',
            ], 1);
        }, 'Show keyboard shortcuts');

        cmd.addCommand("login", function loginHandler() {
            const user = userCredential;

            const doneLogin = async (username) => {
                cmd.success('System ready to use...');
                cmd.setUsername(username);
                try {
                    if (window?.NXUI?.ref?.mergeData) {
                        await window.NXUI.ref.mergeData('bucketsStore', 'credential', {
                            oauth: true,
                            updatedAt: new Date().toISOString(),
                        }, {
                            deepMerge: true,
                            createIfNotExists: true,
                        });
                    }
                } catch {
                    /* ignore */
                }
                cmd.startNewCommand();
            };

            if (user?.data?.email && user?.data?.password) {
                const askEmail = () => cmd.prompt('Enter your email: ', (email) => {
                    if (String(email || '').trim() !== String(user.data.email || '').trim()) {
                        cmd.error('Invalid email address!');
                        askEmail();
                        return;
                    }
                    cmd.secret('Enter your password: ', (password) => {
                        if (String(password || '') !== String(user.data.password || '')) {
                            cmd.error('Wrong password');
                            cmd.startNewCommand();
                            return;
                        }
                        void doneLogin(email);
                    });
                });
                askEmail();
                return false;
            }

            cmd.prompt('Enter your username: ', (username) => {
                if (!String(username || '').trim()) {
                    cmd.error('Username cannot be empty');
                    cmd.startNewCommand();
                    return;
                }
                void doneLogin(String(username || '').trim());
            });
            return false;
        }, 'Login to terminal session');

        cmd.addCommand("logout", async function logoutHandler() {
            cmd.info('Logging out...');
            try {
                if (window?.NXUI?.ref?.mergeData) {
                    await window.NXUI.ref.mergeData('bucketsStore', 'credential', {
                        oauth: false,
                        applications: false,
                        updatedAt: new Date().toISOString(),
                    }, {
                        deepMerge: true,
                        createIfNotExists: true,
                    });
                }
            } catch {
                /* ignore */
            }
            cmd.setUsername('NEXA');
            cmd.success('Logged out successfully');
            cmd.startNewCommand();
        }, 'Logout from current session');



    
       
        return cmd;
    };

})();
