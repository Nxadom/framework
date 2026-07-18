
/** Deteksi mode gelap/terang — cocokkan dengan .command-line.light */
function _isNpmDarkMode() {
  try {
    const cmdLine = document.querySelector('.command-line');
    return cmdLine ? !cmdLine.classList.contains('light') : true;
  } catch {
    return true;
  }
}

/** Kembalikan warna verb yang cocok dengan mode saat ini. */
function _npmVerbColors(darkBg, darkColor, lightBg, lightColor) {
  return _isNpmDarkMode()
    ? { background: darkBg, color: darkColor }
    : { background: lightBg, color: lightColor };
}

export class NexaNpm {
  constructor() {
    this.spinnerInterval = null;
    this.textInterval = null;
    this.spinner = '|/-\\';
    this._spinnerPhase = 0;
    this._instalRoot = null;
  }

  async init() {
    try {
      await this.ensureStylesheet();
      setTimeout(async () => {
        try {
          this.initializeSpinner();
          this.initializeTexts();
        } catch (error) {
          console.error('❌ Error initializing NexaNpm:', error);
        }
      }, 100);
    } catch (error) {
      console.error('❌ Error loading NexaNpm stylesheet:', error);
    }
  }

  async ensureStylesheet() {
    try {
      if (typeof NXUI !== 'undefined' && NXUI.NexaStylesheet && typeof NXUI.NexaStylesheet.Dom === 'function') {
        await NXUI.NexaStylesheet.Dom([`npm.css?v=${Date.now()}`]);
      }
    } catch (error) {
      console.error('❌ NexaNpm ensureStylesheet:', error);
    }
  }

  initializeSpinner() {
    const spinnerDiv = document.getElementById('nexa-npm-spinner');
    if (!spinnerDiv) return;

    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
    }

    this.spinnerInterval = setInterval(() => {
      const random = Math.floor(Math.random() * (5 - 0 + 1)) + 0;
      spinnerDiv.innerHTML = this.spinner.charAt(random);
    }, 100);
  }

  initializeTexts() {
    const verb = document.getElementById('nexa-npm-verb');
    const mapToRegistry = document.getElementById('nexa-npm-mapToRegistry');
    const uri = document.getElementById('nexa-npm-uri');

    if (!verb || !mapToRegistry || !uri) return;

    verb.innerHTML = 'verb';
    mapToRegistry.innerHTML = 'mapToRegistry';

    if (this.textInterval) {
      clearInterval(this.textInterval);
    }

    this.textInterval = setInterval(() => {
      const vs = ['verb', 'sill'];
      const random = Math.floor(Math.random() * (1 - 0 + 1)) + 0;

      verb.innerHTML = vs[random];

      if (verb.innerHTML === 'sill') {
        const c = _npmVerbColors('#fff', '#000', '#1e40af', '#fff');
        verb.style.background = c.background;
        verb.style.color = c.color;

        mapToRegistry.innerHTML = 'mapToRegistry';
        uri.innerHTML = 'C:\\Users\\Nexa\\AppData\\Roaming';
      } else {
        const c = _npmVerbColors('#000', 'blue', '#bfdbfe', '#1e40af');
        verb.style.background = c.background;
        verb.style.color = c.color;

        mapToRegistry.innerHTML = 'afterAdd';
        uri.textContent = 'Menyinkronkan registry…';
      }
    }, 1000);
  }

  /**
   * UI progres untuk perintah terminal `instal` / `modules` (unduh ZIP GitHub NexaJS).
   * @param {{ pack: string, ref: string, spec?: string, modulesOnly?: boolean }} meta
   */
  renderInstalNexaJs(meta) {
    const pack = String(meta && meta.pack ? meta.pack : '').trim() || 'web';
    const ref = String(meta && meta.ref ? meta.ref : 'main').trim() || 'main';
    const spec = meta && meta.spec != null ? String(meta.spec).trim() : `${pack}@${ref === 'main' ? 'latest' : ref}`;
    const modulesOnly = !!(meta && meta.modulesOnly);
    const prefix = modulesOnly ? 'modules:' : 'instal:';
    return '<div class="nexa-npm-progress nexa-npm-instal">'
      + '<div class="nexa-npm-loader-container"><span class="nexa-npm-loader nexa-npm-instal-loader"></span><span class="nexa-npm-loader-points nexa-npm-instal-loader-points">[ . . . . . . . . . . . . . . . . . . . . ]</span></div>'
      + '<span class="nexa-npm-spinner-char nexa-npm-instal-spinner">|</span>'
      + '<span class="nexa-npm-instal-prefix">' + this._escHtml(prefix) + '</span>'
      + '<span class="nexa-npm-status-verb nexa-npm-instal-verb">fetch</span>'
      + '<span class="nexa-npm-status-scope nexa-npm-instal-scope">' + this._escHtml(spec) + '</span>'
      + '<span class="nexa-npm-status-uri nexa-npm-instal-uri">Menyiapkan berkas…</span>'
      + '</div>';
  }

  _escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Jalankan animasi di dalam node .nexa-npm-instal (biasanya commandEntry terminal).
   */
  initInstal(containerEl, meta) {
    const root =
      containerEl &&
      (containerEl.querySelector('.nexa-npm-progress.nexa-npm-instal') ||
        (containerEl.classList && containerEl.classList.contains('nexa-npm-instal')
          ? containerEl
          : null));
    if (!root) return;
    this._instalRoot = root;

    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
    }
    if (this.textInterval) {
      clearInterval(this.textInterval);
    }

    const spinnerChar = root.querySelector('.nexa-npm-instal-spinner');
    this._spinnerPhase = 0;
    if (spinnerChar) {
      this.spinnerInterval = setInterval(() => {
        spinnerChar.textContent = this.spinner.charAt(this._spinnerPhase % this.spinner.length);
        this._spinnerPhase++;
      }, 120);
    }

    const verbEl = root.querySelector('.nexa-npm-instal-verb');
    const scopeEl = root.querySelector('.nexa-npm-instal-scope');
    const uriEl = root.querySelector('.nexa-npm-instal-uri');
    if (!verbEl || !scopeEl || !uriEl) return;

    const pack = String(meta && meta.pack ? meta.pack : 'web').trim() || 'web';
    const ref = String(meta && meta.ref ? meta.ref : 'main').trim() || 'main';
    const targetDir = meta && meta.targetDir != null ? String(meta.targetDir).trim() : '';
    const modulesOnly = !!(meta && meta.modulesOnly);
    const scopeShort =
      targetDir.length > 40 ? '…' + targetDir.slice(-36) : targetDir || '(cwd)';
    const phases = modulesOnly
      ? [
          {
            verb: 'fetch',
            scope: `NexaJS/${pack}/assets/modules`,
            uri: 'Mengunduh arsip NexaJS…',
            verbStyle: _npmVerbColors('#000', '#6af', '#dbeafe', '#1d4ed8'),
          },
          {
            verb: 'extract',
            scope: `${pack} → assets/modules`,
            uri: 'Mengekstrak modul dari arsip…',
            verbStyle: _npmVerbColors('#1a1a1a', '#9f6', '#dcfce7', '#15803d'),
          },
          {
            verb: 'write',
            scope: scopeShort,
            uri: 'Menulis ke folder assets/modules…',
            verbStyle: _npmVerbColors('#000', '#fa6', '#fff7ed', '#c2410c'),
          },
        ]
      : [
          {
            verb: 'fetch',
            scope: `NexaJS/${pack}@${ref === 'main' ? 'main' : ref}`,
            uri: 'Mengunduh paket…',
            verbStyle: _npmVerbColors('#000', '#6af', '#dbeafe', '#1d4ed8'),
          },
          {
            verb: 'extract',
            scope: `${pack}.zip → folder sementara`,
            uri: 'Mengekstrak berkas dari arsip…',
            verbStyle: _npmVerbColors('#1a1a1a', '#9f6', '#dcfce7', '#15803d'),
          },
          {
            verb: 'write',
            scope: targetDir || '(cwd)',
            uri: 'Menyalin ke folder proyek Anda…',
            verbStyle: _npmVerbColors('#000', '#fa6', '#fff7ed', '#c2410c'),
          },
        ];
    let i = 0;
    const apply = () => {
      const p = phases[i % phases.length];
      verbEl.textContent = p.verb;
      scopeEl.textContent = p.scope;
      uriEl.textContent = p.uri;
      Object.assign(verbEl.style, p.verbStyle);
      i++;
    };
    apply();
    this.textInterval = setInterval(apply, 1400);
  }

  /**
   * UI progres untuk perintah terminal `npm instal` / `npm install`.
   * @param {{ cwd?: string }} meta
   */
  renderNpmInstalProgress(meta) {
    const cwd = meta && meta.cwd != null ? String(meta.cwd).trim() : '';
    const label = cwd ? this._escHtml(cwd) : 'package.json';
    return '<div class="nexa-npm-progress nexa-npm-npm-install">'
      + '<div class="nexa-npm-loader-container"><span class="nexa-npm-loader nexa-npm-npm-install-loader"></span><span class="nexa-npm-loader-points nexa-npm-npm-install-loader-points">[ . . . . . . . . . . . . . . . . . . . . ]</span></div>'
      + '<span class="nexa-npm-spinner-char nexa-npm-npm-install-spinner">|</span>'
      + '<span class="nexa-npm-npm-install-prefix">npm:</span>'
      + '<span class="nexa-npm-status-verb nexa-npm-npm-install-verb">resolve</span>'
      + '<span class="nexa-npm-status-scope nexa-npm-npm-install-scope">' + label + '</span>'
      + '<span class="nexa-npm-status-uri nexa-npm-npm-install-uri">Menyiapkan npm install…</span>'
      + '</div>';
  }

  /**
   * Animasi fase npm install (tanpa URL).
   */
  initNpmInstal(containerEl, meta) {
    const root =
      containerEl &&
      (containerEl.querySelector('.nexa-npm-progress.nexa-npm-npm-install') ||
        (containerEl.classList && containerEl.classList.contains('nexa-npm-npm-install')
          ? containerEl
          : null));
    if (!root) return;
    this._instalRoot = root;

    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
    }
    if (this.textInterval) {
      clearInterval(this.textInterval);
    }

    const spinnerChar = root.querySelector('.nexa-npm-npm-install-spinner');
    this._spinnerPhase = 0;
    if (spinnerChar) {
      this.spinnerInterval = setInterval(() => {
        spinnerChar.textContent = this.spinner.charAt(this._spinnerPhase % this.spinner.length);
        this._spinnerPhase++;
      }, 120);
    }

    const verbEl = root.querySelector('.nexa-npm-npm-install-verb');
    const scopeEl = root.querySelector('.nexa-npm-npm-install-scope');
    const uriEl = root.querySelector('.nexa-npm-npm-install-uri');
    if (!verbEl || !scopeEl || !uriEl) return;

    const targetDir = meta && meta.targetDir != null ? String(meta.targetDir).trim() : '';
    const scopeShort =
      targetDir.length > 48 ? '…' + targetDir.slice(-44) : targetDir || '(cwd)';
    const phases = [
      {
        verb: 'resolve',
        scope: 'package.json',
        uri: 'Membaca dependensi proyek…',
        verbStyle: _npmVerbColors('#000', '#6af', '#dbeafe', '#1d4ed8'),
      },
      {
        verb: 'fetch',
        scope: scopeShort,
        uri: 'Mengunduh paket dari registry…',
        verbStyle: _npmVerbColors('#1a1a1a', '#9f6', '#dcfce7', '#15803d'),
      },
      {
        verb: 'reify',
        scope: 'node_modules',
        uri: 'Mengekstrak dan menulis berkas…',
        verbStyle: _npmVerbColors('#000', '#fa6', '#fff7ed', '#c2410c'),
      },
      {
        verb: 'finalize',
        scope: scopeShort,
        uri: 'Menyelesaikan instalasi…',
        verbStyle: _npmVerbColors('#1a1a2e', '#ccf', '#eef2ff', '#4338ca'),
      },
    ];
    let i = 0;
    const apply = () => {
      const p = phases[i % phases.length];
      verbEl.textContent = p.verb;
      scopeEl.textContent = p.scope;
      uriEl.textContent = p.uri;
      Object.assign(verbEl.style, p.verbStyle);
      i++;
    };
    apply();
    this.textInterval = setInterval(apply, 1500);
  }

  /**
   * UI progres untuk `instal backend` (unduh nxdom/backend + composer install).
   * @param {{ label?: string }} meta
   */
  renderComposerCreateProgress(meta) {
    const label =
      meta && meta.label != null && String(meta.label).trim() !== ''
        ? this._escHtml(String(meta.label).trim())
        : 'nxdom/backend';
    return '<div class="nexa-npm-progress nexa-npm-npm-install">'
      + '<div class="nexa-npm-loader-container"><span class="nexa-npm-loader nexa-npm-npm-install-loader"></span><span class="nexa-npm-loader-points nexa-npm-npm-install-loader-points">[ . . . . . . . . . . . . . . . . . . . . ]</span></div>'
      + '<span class="nexa-npm-spinner-char nexa-npm-npm-install-spinner">|</span>'
      + '<span class="nexa-npm-npm-install-prefix">nxdom:</span>'
      + '<span class="nexa-npm-status-verb nexa-npm-npm-install-verb">fetch</span>'
      + '<span class="nexa-npm-status-scope nexa-npm-npm-install-scope">' + label + '</span>'
      + '<span class="nexa-npm-status-uri nexa-npm-npm-install-uri">github.com/iyanrsaleh/nxdom/backend…</span>'
      + '</div>';
  }

  /**
   * Animasi fase unduh backend + composer install.
   */
  initComposerCreate(containerEl, meta) {
    const root =
      containerEl &&
      (containerEl.querySelector('.nexa-npm-progress.nexa-npm-npm-install') ||
        (containerEl.classList && containerEl.classList.contains('nexa-npm-npm-install')
          ? containerEl
          : null));
    if (!root) return;
    this._instalRoot = root;

    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
    }
    if (this.textInterval) {
      clearInterval(this.textInterval);
    }

    const spinnerChar = root.querySelector('.nexa-npm-npm-install-spinner');
    this._spinnerPhase = 0;
    if (spinnerChar) {
      this.spinnerInterval = setInterval(() => {
        spinnerChar.textContent = this.spinner.charAt(this._spinnerPhase % this.spinner.length);
        this._spinnerPhase++;
      }, 120);
    }

    const verbEl = root.querySelector('.nexa-npm-npm-install-verb');
    const scopeEl = root.querySelector('.nexa-npm-npm-install-scope');
    const uriEl = root.querySelector('.nexa-npm-npm-install-uri');
    if (!verbEl || !scopeEl || !uriEl) return;

    const targetDir = meta && meta.targetDir != null ? String(meta.targetDir).trim() : '';
    const scopeShort =
      targetDir.length > 48 ? '…' + targetDir.slice(-44) : targetDir || '(cwd)';
    const phases = [
      {
        verb: 'fetch',
        scope: 'github.com/iyanrsaleh/nxdom',
        uri: 'Mengunduh arsip backend/…',
        verbStyle: _npmVerbColors('#000', '#6af', '#dbeafe', '#1d4ed8'),
      },
      {
        verb: 'extract',
        scope: scopeShort,
        uri: 'Menyalin scaffold backend…',
        verbStyle: _npmVerbColors('#1a1a1a', '#9f6', '#dcfce7', '#15803d'),
      },
      {
        verb: 'install',
        scope: 'vendor/',
        uri: 'composer install…',
        verbStyle: _npmVerbColors('#000', '#fa6', '#fff7ed', '#c2410c'),
      },
      {
        verb: 'finalize',
        scope: scopeShort,
        uri: 'Menyelesaikan instal backend…',
        verbStyle: _npmVerbColors('#1a1a2e', '#ccf', '#eef2ff', '#4338ca'),
      },
    ];
    let i = 0;
    const apply = () => {
      const p = phases[i % phases.length];
      verbEl.textContent = p.verb;
      scopeEl.textContent = p.scope;
      uriEl.textContent = p.uri;
      Object.assign(verbEl.style, p.verbStyle);
      i++;
    };
    apply();
    this.textInterval = setInterval(apply, 1500);
  }

  render() {
    return '<div class="nexa-npm-progress">'
      + '<div class="nexa-npm-loader-container"><span id="nexa-npm-loader"></span><span id="nexa-npm-loader-points">[ . . . . . . . . . . . . . . . . . . . . ]</span></div>'
      + '<span id="nexa-npm-spinner"></span>'
      + '<span>fetchMetadata:</span>'
      + '<span id="nexa-npm-verb">verb</span>'
      + '<span id="nexa-npm-mapToRegistry">mapToRegistry</span>'
      + '<span id="nexa-npm-uri">Menyinkronkan registry…</span>'
      + '</div>';
  }

  /**
   * UI menunggu untuk perintah terminal `start` / `stop` (IPC ke main, server/Metro).
   * @param {{ kind: 'start'|'stop', cwd?: string }} meta
   */
  renderStartStopWait(meta) {
    const kind = String(meta && meta.kind ? meta.kind : 'start').toLowerCase();
    const prefix = kind === 'stop' ? 'stop:' : 'start:';
    const cwd = meta && meta.cwd != null ? String(meta.cwd).trim() : '';
    const scope0 = cwd
      ? this._escHtml(cwd.length > 44 ? '\u2026' + cwd.slice(-40) : cwd)
      : '(cwd)';
    return '<div class="nexa-npm-progress nexa-npm-term-wait">'
      + '<div class="nexa-npm-loader-container"><span class="nexa-npm-loader nexa-npm-term-wait-loader"></span><span class="nexa-npm-loader-points nexa-npm-term-wait-loader-points">[ . . . . . . . . . . . . . . . . . . . . ]</span></div>'
      + '<span class="nexa-npm-spinner-char nexa-npm-term-wait-spinner">|</span>'
      + '<span class="nexa-npm-term-wait-prefix">' + this._escHtml(prefix) + '</span>'
      + '<span class="nexa-npm-status-verb nexa-npm-term-wait-verb">ipc</span>'
      + '<span class="nexa-npm-status-scope nexa-npm-term-wait-scope">' + scope0 + '</span>'
      + '<span class="nexa-npm-status-uri nexa-npm-term-wait-uri">Menghubungi proses aplikasi…</span>'
      + '</div>';
  }

  /**
   * Animasi fase start/stop di dalam baris .nexa-npm-term-wait.
   * @param {HTMLElement} containerEl — biasanya commandRow.commandEntry
   * @param {{ kind: 'start'|'stop', cwd?: string }} meta
   */
  initStartStopWait(containerEl, meta) {
    const root =
      containerEl &&
      (containerEl.querySelector('.nexa-npm-progress.nexa-npm-term-wait') ||
        (containerEl.classList &&
        containerEl.classList.contains('nexa-npm-term-wait')
          ? containerEl
          : null));
    if (!root) return;
    this._instalRoot = root;

    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
    }
    if (this.textInterval) {
      clearInterval(this.textInterval);
    }

    const spinnerChar = root.querySelector('.nexa-npm-term-wait-spinner');
    this._spinnerPhase = 0;
    if (spinnerChar) {
      this.spinnerInterval = setInterval(() => {
        spinnerChar.textContent = this.spinner.charAt(this._spinnerPhase % this.spinner.length);
        this._spinnerPhase++;
      }, 120);
    }

    const verbEl = root.querySelector('.nexa-npm-term-wait-verb');
    const scopeEl = root.querySelector('.nexa-npm-term-wait-scope');
    const uriEl = root.querySelector('.nexa-npm-term-wait-uri');
    if (!verbEl || !scopeEl || !uriEl) return;
// C:\Users\ianob\AppData\Local\Programs\NexaCli
    const kind = String(meta && meta.kind ? meta.kind : 'start').toLowerCase();
    const targetDir = meta && meta.cwd != null ? String(meta.cwd).trim() : '';
    const scopeShort =
      targetDir.length > 48 ? '\u2026' + targetDir.slice(-44) : targetDir || '(cwd)';

    const phasesStart = [
      {
        verb: 'ipc',
        scope: scopeShort,
        uri: 'Menghubungi proses AppData…',
        verbStyle: _npmVerbColors('#000', '#6af', '#dbeafe', '#1d4ed8'),
      },
      {
        verb: 'spawn',
        scope: 'server / Metro',
        uri: 'Menyiapkan server proyek (bisa beberapa detik)…',
        verbStyle: _npmVerbColors('#1a1a1a', '#9f6', '#dcfce7', '#15803d'),
      },
      {
        verb: 'listen',
        scope: '127.0.0.1',
        uri: 'Menunggu port siap menerima koneksi…',
        verbStyle: _npmVerbColors('#000', '#fa6', '#fff7ed', '#c2410c'),
      },
      {
        verb: 'open',
        scope: 'pratinjau / browser',
        uri: 'Membuka URL proyek…',
        verbStyle: _npmVerbColors('#1a1a2e', '#ccf', '#eef2ff', '#4338ca'),
      },
    ];
    const phasesStop = [
      {
        verb: 'ipc',
        scope: scopeShort,
        uri: 'Mengirim permintaan hentikan ke AppData',
        verbStyle: _npmVerbColors('#000', '#f66', '#fee2e2', '#dc2626'),
      },
      {
        verb: 'signal',
        scope: 'port / proses',
        uri: 'Menghentikan server, npm run dev, atau Expo web…',
        verbStyle: _npmVerbColors('#1a1a1a', '#fc6', '#fef3c7', '#d97706'),
      },
      {
        verb: 'cleanup',
        scope: 'Nexa',
        uri: 'Membersihkan daftar server terminal…',
        verbStyle: _npmVerbColors('#000', '#9cf', '#e0f2fe', '#0369a1'),
      },
    ];
    const phases = kind === 'stop' ? phasesStop : phasesStart;
    let i = 0;
    const apply = () => {
      const p = phases[i % phases.length];
      verbEl.textContent = p.verb;
      scopeEl.textContent = p.scope;
      uriEl.textContent = p.uri;
      Object.assign(verbEl.style, p.verbStyle);
      i++;
    };
    apply();
    this.textInterval = setInterval(apply, 1500);
  }

  destroy() {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = null;
    }
    if (this.textInterval) {
      clearInterval(this.textInterval);
      this.textInterval = null;
    }
    this._instalRoot = null;
  }
}
