import { CommandLine } from './bundle.min.js';
import { NexaCommand } from './app.min.js';
import { controllers } from './controllers.js';

function resolveTerminalThemeClass() {
    try {
        const rootDark = document.documentElement?.classList?.contains('dark-mode-grid');
        const bodyDark = document.body?.classList?.contains('dark-mode-grid');
        return rootDark || bodyDark ? '' : ' light';
    } catch {
        return '';
    }
}

function getResponsiveTerminalHeight() {
    try {
        return 'auto';
    } catch {
        return 'auto';
    }
}

function ensureTerminalRuntimeTypographyStyle() {
    try {
        const styleId = 'nexa-terminal-runtime-typography';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
.command-line table.nexa-terminal-table,.command-line table.nexa-terminal-table *{
border:0!important;box-shadow:none!important;outline:none!important}
.command-line table.nexa-terminal-table{
display:table!important;border-collapse:collapse!important;border-spacing:0!important;
width:100%!important;margin:0!important;padding:0!important;background:transparent!important}
.command-line table.nexa-terminal-table tr{display:table-row!important}
.command-line table.nexa-terminal-table td,.command-line table.nexa-terminal-table th{
display:table-cell!important;padding:1px 6px!important;margin:0!important;background:transparent!important;
vertical-align:top!important;line-height:1.2!important}
`;
        document.head.appendChild(style);
    } catch {
        /* ignore */
    }
}

/** Sisipkan teks di posisi kursor via Selection API — bekerja tanpa transient-activation. */
function terminalInsertTextAtCursor(text) {
    try {
        const sel = window.getSelection();
        if (!sel?.rangeCount) return false;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
    } catch {
        return false;
    }
}

export class NexaTerminal {
    constructor(data) {
        this.logs = [];
        this.id = 'NexaTerminal';
        this._domViewElementId = `command-linedomView-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        this._domViewRetainFocusCleanup = null;
        this._domViewResizeCleanup = null;
        this._domViewContextMenuCleanup = null;
        this._destroyed = false;
        this._loggerSource = 'NexaTerminal';
        // Mode panel terintegrasi — tidak daftarkan shortcut modal global
        this._panelMode = Boolean(data?.panelMode);

        this._themeCleanup = null;
        this.handleKeyDown = this.handleKeyDown.bind(this);
        if (!this._panelMode) {
            // Shortcut Ctrl+Z/Ctrl+Shift+X hanya untuk mode modal standalone
            document.addEventListener('keydown', this.handleKeyDown, true);
        }
    }

    /** Sinkronkan class tema terminal dengan mode gelap/terang saat ini. */
    _syncThemeClass() {
        const el = document.getElementById(this._domViewElementId);
        if (!el) return;
        const rootDark = document.documentElement?.classList?.contains('dark-mode-grid');
        const bodyDark = document.body?.classList?.contains('dark-mode-grid');
        const isDark = rootDark || bodyDark;
        el.classList.toggle('light', !isDark);
    }

    /** Pantau perubahan tema (seperti beranda.js via MutationObserver + events). */
    _attachThemeSync() {
        this._detachThemeSync();
        this._syncThemeClass();
        const observer = new MutationObserver(() => {
            this._syncThemeClass();
        });
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class'],
        });
        const onStorage = (e) => {
            if (e.key === 'darkMode') {
                requestAnimationFrame(() => this._syncThemeClass());
            }
        };
        window.addEventListener('storage', onStorage);
        const onThemeChanged = () => {
            requestAnimationFrame(() => this._syncThemeClass());
        };
        window.addEventListener('beranda:settings-theme-changed', onThemeChanged);
        this._themeCleanup = () => {
            observer.disconnect();
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('beranda:settings-theme-changed', onThemeChanged);
        };
    }

    _detachThemeSync() {
        if (typeof this._themeCleanup === 'function') {
            this._themeCleanup();
            this._themeCleanup = null;
        }
    }

    _retireDomViewFocusRetention() {
        if (typeof this._domViewRetainFocusCleanup === 'function') {
            this._domViewRetainFocusCleanup();
            this._domViewRetainFocusCleanup = null;
        }
    }

    _retireDomViewPasteSanitizer() {
        if (typeof this._domViewPasteSanitizerCleanup === 'function') {
            this._domViewPasteSanitizerCleanup();
            this._domViewPasteSanitizerCleanup = null;
        }
    }

    /** Intercept paste — hanya sisipkan plain text, buang semua tag HTML dari clipboard. */
    _attachPasteSanitizer(commandLineElement) {
        this._retireDomViewPasteSanitizer();
        if (!commandLineElement) return;

        const onPaste = (e) => {
            // Hanya berlaku jika paste ke dalam input terminal
            const target = e.target;
            if (!target?.isContentEditable && target?.tagName !== 'INPUT' && target?.tagName !== 'TEXTAREA') return;

            // Ambil plain text saja — getText('text/plain') strip semua HTML
            const text = (e.clipboardData || window.clipboardData)?.getData('text/plain') || '';
            if (!text) return;
            const clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

            // Coba insert via Selection API
            const inserted = terminalInsertTextAtCursor(clean);
            if (inserted) {
                e.preventDefault();
            }
            // Jika gagal, biarkan native paste default berjalan
        };

        commandLineElement.addEventListener('paste', onPaste, true);
        this._domViewPasteSanitizerCleanup = () => {
            commandLineElement.removeEventListener('paste', onPaste, true);
        };
    }

    _retireDomViewResizeObserver() {
        if (typeof this._domViewResizeCleanup === 'function') {
            this._domViewResizeCleanup();
            this._domViewResizeCleanup = null;
        }
    }

    _retireDomViewContextMenu() {
        if (typeof this._domViewContextMenuCleanup === 'function') {
            this._domViewContextMenuCleanup();
            this._domViewContextMenuCleanup = null;
        }
    }

    _applyResponsiveDomViewLayout(commandLineElement) {
        if (!commandLineElement) return;
        commandLineElement.style.height = '100%';
        commandLineElement.style.minHeight = '0';
        commandLineElement.style.maxHeight = 'none';
        commandLineElement.style.width = '100%';
        commandLineElement.style.overflow = 'auto';
    }

    _attachDomViewResizeObserver(commandLineElement) {
        this._retireDomViewResizeObserver();
        if (!commandLineElement) return;

        const host = commandLineElement.parentElement;
        if (!host) return;

        let rafId = 0;
        const notifyResize = () => {
            if (rafId) return;
            rafId = window.requestAnimationFrame(() => {
                rafId = 0;
                this._applyResponsiveDomViewLayout(commandLineElement);
            });
        };

        notifyResize();

        if (typeof ResizeObserver === 'function') {
            const observer = new ResizeObserver(() => notifyResize());
            observer.observe(host);
            this._domViewResizeCleanup = () => {
                observer.disconnect();
                if (rafId) {
                    window.cancelAnimationFrame(rafId);
                    rafId = 0;
                }
            };
            return;
        }

        const onResize = () => notifyResize();
        window.addEventListener('resize', onResize, { passive: true });
        this._domViewResizeCleanup = () => {
            window.removeEventListener('resize', onResize);
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
            }
        };
    }

    _placeCaretAtEnd(el) {
        try {
            if (!el) return;
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } catch {
            /* ignore */
        }
    }

    _focusActiveEntry(commandLineElement) {
        try {
            const entry = commandLineElement?.querySelector?.('.command-row.active .command-entry');
            if (entry && entry.isContentEditable) {
                entry.focus();
                this._placeCaretAtEnd(entry);
                return true;
            }
        } catch {
            /* ignore */
        }
        return false;
    }

    _ensureDomViewInputReady(commandLineElement) {
        let tries = 0;
        const tick = () => {
            if (!commandLineElement?.isConnected) return;
            if (this._focusActiveEntry(commandLineElement)) return;
            if (tries++ < 40) setTimeout(tick, 50);
        };
        tick();
    }

    _attachDomViewFocusRetention(commandLineElement) {
        this._retireDomViewFocusRetention();
        const onClick = (e) => {
            if (!commandLineElement?.isConnected) return;
            const selectedText = String(window.getSelection?.()?.toString?.() || '').trim();
            if (selectedText) return;
            if (e?.target?.closest?.('.command-entry[contenteditable="true"]')) return;
            requestAnimationFrame(() => {
                this._focusActiveEntry(commandLineElement);
            });
        };
        commandLineElement.addEventListener('click', onClick);
        this._domViewRetainFocusCleanup = () => {
            commandLineElement.removeEventListener('click', onClick);
        };
    }

    _attachTerminalContextMenu(commandLineElement) {
        this._retireDomViewContextMenu();
        if (!commandLineElement) return;

        const removeExisting = () => {
            const old = document.getElementById('nexa-terminal-context-menu');
            if (old) old.remove();
        };

        const hideMenu = () => removeExisting();
        const copyTextSafely = async (text) => {
            const value = String(text || '');
            if (!value) return false;
            const api = globalThis.electronAPI || globalThis.window?.electronAPI;
            if (api?.writeClipboardText) {
                try {
                    await api.writeClipboardText(value);
                    return true;
                } catch {
                    /* fallback */
                }
            }
            if (navigator.clipboard?.writeText) {
                try {
                    await navigator.clipboard.writeText(value);
                    return true;
                } catch {
                    /* fallback below */
                }
            }
            try {
                const ta = document.createElement('textarea');
                ta.value = value;
                ta.setAttribute('readonly', 'true');
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                ta.style.pointerEvents = 'none';
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand('copy');
                ta.remove();
                return ok;
            } catch {
                return false;
            }
        };

        const createItem = (label, onClick, disabled = false) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = label;
            btn.disabled = disabled;
            btn.className = 'nexa-terminal-context-item';
            btn.style.padding = '6px 10px';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.background = 'transparent';
            btn.style.color = disabled ? '#888' : '#e8e8e8';
            btn.style.textAlign = 'left';
            btn.style.cursor = disabled ? 'default' : 'pointer';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                hideMenu();
                onClick?.();
            });
            btn.addEventListener('mouseenter', () => {
                if (!btn.disabled) btn.style.background = '#094771';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'transparent';
            });
            return btn;
        };

        const readSelectionText = () => String(window.getSelection?.()?.toString?.() || '').trim();
        const focusEntry = () => {
            let entry = commandLineElement.querySelector('.command-row.active .command-entry');
            // Jika entry tidak editable (row sudah dieksekusi), buat prompt baru dulu
            if (!entry || !entry.isContentEditable) {
                try {
                    // Coba startNewCommand via cmd global jika tersedia
                    if (typeof NexaCommand?.instance === 'function') {
                        // Tidak ada akses langsung ke cmd, coba dispatch event
                    }
                    // Cari entry contentEditable manapun di terminal
                    entry = commandLineElement.querySelector('.command-entry[contenteditable="true"]');
                } catch {
                    entry = null;
                }
                if (!entry) {
                    // Fallback: coba buat prompt baru via klik pada terminal
                    const inputRow = commandLineElement.querySelector('.command-row:last-child .command-entry');
                    if (inputRow && !inputRow.isContentEditable) {
                        try {
                            // Trigger new command dengan mengirim Enter kosong
                            const lastInput = commandLineElement.querySelector('.command-entry');
                            if (lastInput) {
                                lastInput.contentEditable = true;
                                lastInput.focus();
                                this._placeCaretAtEnd(lastInput);
                                return lastInput;
                            }
                        } catch {
                            /* ignore */
                        }
                    }
                    return null;
                }
            }
            try {
                entry.focus();
                this._placeCaretAtEnd(entry);
            } catch {
                /* ignore */
            }
            return entry;
        };

        const onContextMenu = (e) => {
            if (!commandLineElement.isConnected) {
                this._retireDomViewContextMenu();
                return;
            }
            if (!commandLineElement.contains(e.target)) return;
            e.preventDefault();
            hideMenu();
            const menu = document.createElement('div');
            menu.id = 'nexa-terminal-context-menu';
            menu.className = 'nexa-terminal-context-menu';
            menu.style.position = 'fixed';
            menu.style.left = `${e.clientX}px`;
            menu.style.top = `${e.clientY}px`;
            menu.style.zIndex = '100000';
            menu.style.minWidth = '150px';
            menu.style.background = '#2a2d35';
            menu.style.border = '1px solid #454a55';
            menu.style.borderRadius = '6px';
            menu.style.padding = '4px';
            menu.style.display = 'grid';
            menu.style.gap = '2px';

            const selected = readSelectionText();
            menu.appendChild(createItem('Copy', () => {
                const text = readSelectionText();
                if (!text) return;
                // Fallback textarea + execCommand('copy') — paling reliable di Electron
                try {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', 'true');
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    ta.style.pointerEvents = 'none';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    ta.remove();
                } catch {
                    /* ignore */
                }
            }, !selected));
            menu.appendChild(createItem('Paste', () => {
                const entry = focusEntry();
                if (!entry) {
                    console.warn('[terminal] Paste skipped: no active entry found');
                    return;
                }
                // Baca clipboard langsung lewat IPC electronAPI (pasti jalan tanpa permission)
                const api = globalThis.electronAPI || globalThis.window?.electronAPI;
                if (api?.readClipboardText) {
                    api.readClipboardText().then((res) => {
                        let clip = '';
                        if (res && typeof res === 'object' && res.text !== undefined) {
                            clip = String(res.text || '');
                        } else if (typeof res === 'string') {
                            clip = res;
                        }
                        if (clip) {
                            entry.focus();
                            const ok = terminalInsertTextAtCursor(clip);
                            if (!ok) console.warn('[terminal] Paste: insertTextAtCursor failed');
                        } else {
                            console.warn('[terminal] Paste: clipboard empty');
                        }
                    }).catch((err) => {
                        console.warn('[terminal] Paste IPC failed:', err);
                    });
                } else {
                    console.warn('[terminal] Paste: electronAPI.readClipboardText unavailable');
                }
            }));
            menu.appendChild(createItem('Select All', () => {
                const range = document.createRange();
                range.selectNodeContents(commandLineElement);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
            }));
            if (selected) {
                const sep = document.createElement('div');
                sep.style.cssText = 'height:1px;background:rgba(255,255,255,.1);margin:2px 0;';
                menu.appendChild(sep);
                menu.appendChild(createItem('Add Chat', () => {
                    const text = readSelectionText();
                    if (!text) return;
                    // Cari composer chat di dokumen — [data-beranda-chat-input]
                    const composer = document.querySelector('[data-beranda-chat-input]');
                    if (!composer) return;
                    composer.focus();
                    // Sisipkan di posisi kursor atau append jika tidak ada seleksi
                    const sel2 = window.getSelection();
                    if (sel2 && sel2.rangeCount && composer.contains(sel2.anchorNode)) {
                        const range2 = sel2.getRangeAt(0);
                        range2.deleteContents();
                        range2.insertNode(document.createTextNode(text));
                        range2.collapse(false);
                        sel2.removeAllRanges();
                        sel2.addRange(range2);
                    } else {
                        // Append ke akhir konten composer
                        const existing = composer.textContent || '';
                        const separator = existing.trim() ? '\n' : '';
                        composer.textContent = existing + separator + text;
                        // Pindah kursor ke akhir
                        const range2 = document.createRange();
                        range2.selectNodeContents(composer);
                        range2.collapse(false);
                        const sel3 = window.getSelection();
                        sel3?.removeAllRanges();
                        sel3?.addRange(range2);
                    }
                    // Trigger input event agar sistem chat tahu konten berubah
                    composer.dispatchEvent(new Event('input', { bubbles: true }));
                }));
            }

            document.body.appendChild(menu);
        };

        const onDocMouseDown = (e) => {
            const menu = document.getElementById('nexa-terminal-context-menu');
            if (menu && !menu.contains(e.target)) hideMenu();
        };
        const onEsc = (e) => {
            if (e.key === 'Escape') hideMenu();
        };

        document.addEventListener('contextmenu', onContextMenu);
        document.addEventListener('mousedown', onDocMouseDown, true);
        document.addEventListener('keydown', onEsc, true);
        this._domViewContextMenuCleanup = () => {
            document.removeEventListener('contextmenu', onContextMenu);
            document.removeEventListener('mousedown', onDocMouseDown, true);
            document.removeEventListener('keydown', onEsc, true);
            hideMenu();
        };
    }
    
    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.push({
            timestamp,
            message,
            type
        });
    }

    _logError(action, error) {
        const message = String(error?.message || error || 'unknown-error');
        try {
            console.error(`[terminal][${this._loggerSource}] ${action}: ${message}`, error);
        } catch {
            /* ignore */
        }
        this.addLog(`${action}: ${message}`, 'error');
        try {
            globalThis.electronAPI?.logError?.(
                'error',
                `[terminal] ${action}: ${message}`,
                String(error?.stack || ''),
                this._loggerSource,
            );
        } catch {
            /* ignore */
        }
    }
    
    /**
     * Daftarkan perintah shell yang tidak ada di NexaCommand bawaan.
     * Perintah diteruskan ke Electron via terminalShellExec.
     */
    _registerShellCommands(cmd, commandLineElement) {
        if (!cmd || typeof cmd.addCommand !== 'function') return;

        const api = globalThis.electronAPI || globalThis.window?.electronAPI;

        // Ambil CWD aktif dari prompt terminal atau dataset host
        const getCwd = () => {
            // Coba baca dari properti internal NexaCommand
            const internal = cmd.cwd || cmd._cwd || cmd.currentDir || cmd.workingDir || '';
            if (internal) return String(internal).trim();
            // Fallback: parse dari baris prompt terakhir "[HH:MM:SS]PATH>"
            try {
                const rows = commandLineElement.querySelectorAll('.command-row');
                for (let i = rows.length - 1; i >= 0; i--) {
                    const prompt = rows[i].querySelector('.command-prompt, .prompt, [class*="prompt"]');
                    const text = String(prompt?.textContent || '').trim();
                    // Format: "D:\path>" atau "D:/path>"
                    const m = text.match(/([A-Za-z]:[/\\][^>]*)/);
                    if (m) return m[1].replace(/[/\\]+$/, '');
                }
            } catch { /* ignore */ }
            // Fallback terakhir: dataset host
            const host = commandLineElement.closest?.('[data-terminal-cwd]') ||
                          commandLineElement.parentElement?.closest?.('[data-terminal-cwd]');
            return String(host?.dataset?.terminalCwd || '').trim();
        };

        // Jalankan perintah shell dan tampilkan output di terminal
        const runShell = async (command) => {
            const cwd = getCwd();
            if (!cwd) {
                cmd.output('[Shell] CWD tidak diketahui — gunakan cd <path> terlebih dahulu.');
                cmd.startNewCommand();
                return;
            }
            if (!api?.terminalShellExec) {
                cmd.output('[Shell] API shell tidak tersedia.');
                cmd.startNewCommand();
                return;
            }
            try {
                const _shell = (() => { try { return localStorage.getItem('beranda-terminal-active-shell') || 'default'; } catch { return 'default'; } })();
                const result = await api.terminalShellExec({ command, cwd, shell: _shell });
                const out = [result.stdout, result.stderr].filter(Boolean).join('\n').trimEnd();
                if (out) cmd.output(out);
                if (!result.ok && result.error && !out) cmd.output(`[Error] ${result.error}`);
            } catch (err) {
                this._logError('runShell', err);
                cmd.output(`[Error] ${err?.message || err}`);
            }
            cmd.startNewCommand();
        };

        // ── Windows ──────────────────────────────────────────────────────────
        cmd.addCommand('rmdir', (args) => { void runShell(`rmdir ${String(args || '').trim()}`); }, 'Hapus direktori (rmdir /s untuk rekursif)');
        cmd.addCommand('rd',    (args) => { void runShell(`rmdir ${String(args || '').trim()}`); }, 'Alias rmdir');
        cmd.addCommand('del',   (args) => { void runShell(`del ${String(args || '').trim()}`);   }, 'Hapus file');
        cmd.addCommand('erase', (args) => { void runShell(`del ${String(args || '').trim()}`);   }, 'Alias del');
        cmd.addCommand('md',    (args) => { void runShell(`mkdir ${String(args || '').trim()}`); }, 'Buat direktori (alias mkdir)');
        cmd.addCommand('move',  (args) => { void runShell(`move ${String(args || '').trim()}`);  }, 'Pindah/rename file');
        cmd.addCommand('copy',  (args) => { void runShell(`copy ${String(args || '').trim()}`);  }, 'Salin file');
        cmd.addCommand('xcopy', (args) => { void runShell(`xcopy ${String(args || '').trim()}`); }, 'Salin direktori rekursif');
        cmd.addCommand('type',  (args) => { void runShell(`type ${String(args || '').trim()}`);  }, 'Tampilkan isi file');
        cmd.addCommand('ren',   (args) => { void runShell(`ren ${String(args || '').trim()}`);   }, 'Rename file');
        cmd.addCommand('attrib',(args) => { void runShell(`attrib ${String(args || '').trim()}`);}, 'Atribut file');

        // ── Unix/cross-platform ───────────────────────────────────────────────
        cmd.addCommand('rm',    (args) => { void runShell(`rm ${String(args || '').trim()}`);    }, 'Hapus file/direktori');
        cmd.addCommand('mv',    (args) => { void runShell(`mv ${String(args || '').trim()}`);    }, 'Pindah/rename file');
        cmd.addCommand('cp',    (args) => { void runShell(`cp ${String(args || '').trim()}`);    }, 'Salin file');
        cmd.addCommand('cat',   (args) => { void runShell(`cat ${String(args || '').trim()}`);   }, 'Tampilkan isi file');
        cmd.addCommand('touch', (args) => { void runShell(`type nul > ${String(args || '').trim()}`); }, 'Buat file kosong');
        cmd.addCommand('find',  (args) => { void runShell(`find ${String(args || '').trim()}`);  }, 'Cari file');
        cmd.addCommand('grep',  (args) => { void runShell(`grep ${String(args || '').trim()}`);  }, 'Cari teks dalam file');
        cmd.addCommand('where', (args) => { void runShell(`where ${String(args || '').trim()}`); }, 'Lokasi executable');
        cmd.addCommand('which', (args) => { void runShell(`where ${String(args || '').trim()}`); }, 'Lokasi executable (alias where)');

        // ── Package managers ──────────────────────────────────────────────────
        cmd.addCommand('npm',   (args) => { void runShell(`npm ${String(args || '').trim()}`);   }, 'Node package manager');
        cmd.addCommand('npx',   (args) => { void runShell(`npx ${String(args || '').trim()}`);   }, 'Jalankan package npm');
        cmd.addCommand('pnpm',  (args) => { void runShell(`pnpm ${String(args || '').trim()}`);  }, 'pnpm package manager');
        cmd.addCommand('yarn',  (args) => { void runShell(`yarn ${String(args || '').trim()}`);  }, 'Yarn package manager');
        cmd.addCommand('bun',   (args) => { void runShell(`bun ${String(args || '').trim()}`);   }, 'Bun runtime & package manager');
        cmd.addCommand('node',  (args) => { void runShell(`node ${String(args || '').trim()}`);  }, 'Jalankan script Node.js');
        cmd.addCommand('git',   (args) => { void runShell(`git ${String(args || '').trim()}`);   }, 'Git version control');

        // ── Clear screen ──────────────────────────────────────────────────────
        cmd.addCommand('cls',   () => { try { cmd.clear?.(); } catch { /* ignore */ } cmd.startNewCommand(); }, 'Bersihkan layar');
        cmd.addCommand('clear', () => { try { cmd.clear?.(); } catch { /* ignore */ } cmd.startNewCommand(); }, 'Bersihkan layar');
    }

    async domView() {

    const themeClass = resolveTerminalThemeClass();
    const elementId = this._domViewElementId || `command-linedomView-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this._domViewElementId = elementId;

    setTimeout(async () => {
      try {
        await NXUI.NexaStylesheet.Dom([
            'app.min.css',
        ]);
        ensureTerminalRuntimeTypographyStyle();
        const db = new NXUI.NexaDb();
        await db.initDatabase();
        await db.Ref();
        const commandLineElement = document.getElementById(elementId);
        if (!commandLineElement) {
            return;
        }
            this._attachThemeSync();
            this._applyResponsiveDomViewLayout(commandLineElement);
            const credential = await controllers();
            const cmd = NexaCommand.instance(commandLineElement, credential,db);
            if (typeof NexaCommand.hydrateCliHistory === 'function') {
                await NexaCommand.hydrateCliHistory(cmd);
            }

            // Panel terintegrasi gunakan command streaming bawaan NexaCommand (app.min.js).
            // Hindari override command native agar requestId/state/stop tetap konsisten.
            if (!this._panelMode) {
                this._registerShellCommands(cmd, commandLineElement);
            }

            if (credential?.email) {
                cmd.startNewCommand();
            } else {
                cmd.output('Type [login] to login');
                cmd.run('login');
            }

            this._attachDomViewFocusRetention(commandLineElement);
            this._attachDomViewResizeObserver(commandLineElement);
            this._attachTerminalContextMenu(commandLineElement);
            this._attachPasteSanitizer(commandLineElement);
            this._ensureDomViewInputReady(commandLineElement);

            } catch (error) {
                this._logError('domView:init', error);
      }
    }, 100);
            return `<div id="${elementId}" class="command-line${themeClass}" style="height:100%;min-height:0;max-height:none;width:100%;overflow:auto;"></div>`
    }
    async open() {
        if (typeof NXUI === 'undefined') {
            return;
        }

        const themeClass = resolveTerminalThemeClass();
        try {
            await NXUI.NexaStylesheet.Dom([
                'app.min.css',
            ]);
            ensureTerminalRuntimeTypographyStyle();

            const db = new NXUI.NexaDb();
            await db.initDatabase();
            await db.Ref();

            const modalID = "open_" + this.id;
            NXUI.modalHTML({
                elementById: modalID,
                styleClass: "w-700px",
                minimize: true,
                label: `Terminal`,
                setDataBy: false,
                onclick: false,
                content: `<div id="command-line" class="command-line${themeClass}" style="height:${getResponsiveTerminalHeight()};min-height:270px;max-height:calc(100vh - 180px);overflow:auto;"></div>`,
            });
            NXUI.nexaModal.open(modalID);
            NXUI.id("body_"+modalID).setStyle("padding", "0px")
            // Wait for DOM to be ready
            // await new Promise(resolve => setTimeout(resolve, 200));
            
            const commandLineElement = document.getElementById('command-line');
            if (!commandLineElement) {
                return;
            }
            this._attachThemeSync();
      // const cmd2 = DemoCommand.instance(document.getElementById('command-line-2'));
    // cmd2.output('Type any username to login');
    // cmd2.run('login');
                const credential = await controllers();
                const cmd = NexaCommand.instance(commandLineElement, credential, db);
                if (typeof NexaCommand.hydrateCliHistory === 'function') {
                    await NexaCommand.hydrateCliHistory(cmd);
                }

                if (credential?.oauth) {
                    cmd.info('Type [help] to show available commands');
                    cmd.info('Quick shell: pwd, cd <path>, ls [path], dir [path]');
                    cmd.startNewCommand();
                } else {
                    cmd.output('Type [login] to login');
                    cmd.run('login');
                }
                if (!this._panelMode) {
                    this._registerShellCommands(cmd, commandLineElement);
                }
        } catch (error) {
            this._logError('open:init', error);
            throw error;
        }
        



    }
    
    /**
     * Bersihkan semua listener dan resource — panggil saat panel di-unmount.
     * Aman dipanggil berkali-kali.
     */
    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        this._detachThemeSync();
        this._retireDomViewFocusRetention();
        this._retireDomViewResizeObserver();
        this._retireDomViewContextMenu();
        this._retireDomViewPasteSanitizer();
        // Hapus global keyboard listener (penting — cegah memory leak)
        document.removeEventListener('keydown', this.handleKeyDown, true);
    }

    /**
     * Paksa ulang layout terminal — berguna setelah panel di-resize.
     */
    refit() {
        try {
            const el = document.getElementById(this._domViewElementId);
            if (el) this._applyResponsiveDomViewLayout(el);
        } catch (error) {
            this._logError('refit', error);
        }
    }

    close() {
        // Selalu hapus keyboard listener terlepas dari mode
        document.removeEventListener('keydown', this.handleKeyDown, true);
        this._retireDomViewFocusRetention();
        this._retireDomViewResizeObserver();
        this._retireDomViewContextMenu();
        if (typeof NXUI === 'undefined') {
            return;
        }
        const modalID = "open_" + this.id;
        NXUI.nexaModal.close(modalID);
    }
    
    showHelp() {
    }
    
    clearLogs() {
        this.logs.length = 0;
    }
    
    handleKeyDown(e) {
        // Check for Ctrl+Z, Ctrl+Shift+Z, or Ctrl+Shift+X
        const isZ = e.keyCode === 90 || e.key === 'z' || e.key === 'Z';
        const isX = e.keyCode === 88 || e.key === 'x' || e.key === 'X';
        
        // Must have Ctrl pressed
        if (!e.ctrlKey) {
            return;
        }
        
        // Don't handle if user is typing in input/textarea (unless terminal is open)
        const terminalOpen = document.getElementById('command-line') !== null;
        if (!terminalOpen && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
            return;
        }
        
        // Ctrl+Z (without Shift) - Open terminal
        if (isZ && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.open();
        }
        // Ctrl+Shift+Z - Open terminal
        else if (isZ && e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.open();
        }
        // Ctrl+Shift+X - Close terminal
        else if (isX && e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            this.close();
        }
    }
    
    get shortcuts() {
        return {
            'Ctrl+Z': 'Open',
            'Ctrl+Shift+Z': 'Open',
            'Ctrl+Shift+X': 'Close'
        };
    }
}
