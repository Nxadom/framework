/**
 * NexaCmirror6 — Adapter CodeMirror 6 dengan API identik NexaCmirror (CM5).
 * Drop-in replacement: ganti import NexaCmirror → NexaCmirror6.
 */

let CM6 = null;
let _loadPromise = null;
let _loaded = false;

async function loadCM6() {
  if (_loaded) return CM6;
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    const base = typeof window !== 'undefined' && window.__NX_BASE_URL__
      ? window.__NX_BASE_URL__
      : '';
    const url = base + '/assets/modules/codemirror6/codemirror6.bundle.js';
    CM6 = await import(/* webpackIgnore: true */ url);
    _loaded = true;
    return CM6;
  })();
  return _loadPromise;
}

// ── Tema Dracula default ──────────────────────────────────────────────────────
function buildDraculaTheme(CM) {
  const { EditorView, HighlightStyle, syntaxHighlighting, tags: t } = CM;
  const theme = EditorView.theme({
    '&': { color: '#f8f8f2', backgroundColor: '#282a36', height: '100%' },
    '.cm-content': { caretColor: '#f8f8f0' },
    '.cm-cursor': { borderLeftColor: '#f8f8f0' },
    '.cm-selectionBackground, ::selection': { backgroundColor: '#44475a' },
    '.cm-activeLine': { backgroundColor: '#44475a55' },
    '.cm-gutters': { backgroundColor: '#282a36', color: '#6272a4', border: 'none', borderRight: '1px solid #44475a' },
    '.cm-activeLineGutter': { backgroundColor: '#44475a55', color: '#a0aec0' },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px' },
    '.cm-matchingBracket': { color: '#ffffff', backgroundColor: '#44475a' },
    '.cm-searchMatch': { backgroundColor: '#ffb86c55' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: '#ff79c655' },
    '.cm-tooltip': { backgroundColor: '#282a36', border: '1px solid #44475a' },
    '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: '#44475a' },
  }, { dark: true });
  const highlight = syntaxHighlighting(HighlightStyle.define([
    { tag: t.keyword, color: '#ff79c6' },
    { tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName], color: '#8be9fd' },
    { tag: [t.function(t.variableName), t.labelName], color: '#50fa7b' },
    { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: '#bd93f9' },
    { tag: [t.definition(t.name), t.separator], color: '#f8f8f2' },
    { tag: [t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: '#ffb86c' },
    { tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)], color: '#f8f8f2' },
    { tag: [t.meta, t.comment], color: '#6272a4' },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.strikethrough, textDecoration: 'line-through' },
    { tag: t.link, color: '#6272a4', textDecoration: 'underline' },
    { tag: t.heading, fontWeight: 'bold', color: '#bd93f9' },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#bd93f9' },
    { tag: [t.processingInstruction, t.string, t.inserted], color: '#f1fa8c' },
    { tag: t.invalid, color: '#f8f8f2', borderBottom: '1px dotted #ff5555' },
    { tag: t.tagName, color: '#ff79c6' },
    { tag: t.attributeName, color: '#50fa7b' },
    { tag: t.attributeValue, color: '#f1fa8c' },
  ]));
  return [theme, highlight];
}

function buildMonokaiSublimeTheme(CM) {
  const { EditorView, HighlightStyle, syntaxHighlighting, tags: t } = CM;
  const c = {
    background: '#272822', foreground: '#f8f8f2', cursor: '#f8f8f0',
    selection: '#4a4a76', activeLine: '#3e3d3257', matchingBracket: '#3e3d32',
    keyword: '#F92672', variable: '#FD971F', function: '#66D9EF',
    string: '#E6DB74', constant: '#AE81FF', type: '#66D9EF',
    class: '#A6E22E', number: '#AE81FF', comment: '#88846f',
    heading: '#A6E22E', invalid: '#F44747', regexp: '#E6DB74', tag: '#F92672',
  };
  const theme = EditorView.theme({
    '&': { color: c.foreground, backgroundColor: c.background, height: '100%' },
    '.cm-content': { caretColor: c.cursor },
    '.cm-cursor': { borderLeftColor: c.cursor },
    '.cm-selectionBackground, ::selection': { backgroundColor: c.selection },
    '.cm-activeLine': { backgroundColor: c.activeLine },
    '.cm-gutters': { backgroundColor: c.background, color: '#75715e', border: 'none', borderRight: '1px solid #3e3d32' },
    '.cm-activeLineGutter': { backgroundColor: c.activeLine, color: '#a59f85' },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px' },
    '.cm-matchingBracket': { backgroundColor: c.matchingBracket, outline: 'none' },
    '.cm-tooltip': { backgroundColor: '#414339', border: '1px solid #3e3d32' },
    '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: '#3e3d32' },
  }, { dark: true });
  const highlight = syntaxHighlighting(HighlightStyle.define([
    { tag: t.keyword, color: c.keyword },
    { tag: [t.name, t.deleted, t.character, t.macroName], color: c.variable },
    { tag: t.propertyName, color: c.function },
    { tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: c.string },
    { tag: [t.function(t.variableName), t.labelName], color: c.function },
    { tag: [t.color, t.constant(t.name), t.standard(t.name)], color: c.constant },
    { tag: [t.definition(t.name), t.separator], color: c.variable },
    { tag: t.className, color: c.class },
    { tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: c.number },
    { tag: t.typeName, color: c.type },
    { tag: [t.operator, t.operatorKeyword], color: c.keyword },
    { tag: [t.url, t.escape, t.regexp, t.link], color: c.regexp },
    { tag: [t.meta, t.comment], color: c.comment },
    { tag: t.tagName, color: c.tag },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.link, textDecoration: 'underline' },
    { tag: t.heading, fontWeight: 'bold', color: c.heading },
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: c.variable },
    { tag: t.invalid, color: c.invalid },
    { tag: t.strikethrough, textDecoration: 'line-through' },
    { tag: t.attributeName, color: c.class },
    { tag: t.attributeValue, color: c.string },
  ]));
  return [theme, highlight];
}

function buildLightTheme(CM) {
  const { EditorView, HighlightStyle, syntaxHighlighting, tags: t } = CM;
  const theme = EditorView.theme({
    '&': { color: '#24292e', backgroundColor: '#ffffff', height: '100%' },
    '.cm-content': { caretColor: '#24292e' },
    '.cm-cursor': { borderLeftColor: '#24292e' },
    '.cm-selectionBackground, ::selection': { backgroundColor: '#b3d7ff' },
    '.cm-activeLine': { backgroundColor: '#f6f8fa' },
    '.cm-gutters': { backgroundColor: '#f6f8fa', color: '#6e7781', border: 'none', borderRight: '1px solid #e1e4e8' },
    '.cm-activeLineGutter': { backgroundColor: '#eaf0f8' },
    '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px' },
    '.cm-matchingBracket': { backgroundColor: '#c8e1ff', color: '#24292e' },
    '.cm-tooltip': { backgroundColor: '#ffffff', border: '1px solid #e1e4e8' },
    '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: '#e1e4e8' },
  }, { dark: false });
  const highlight = syntaxHighlighting(HighlightStyle.define([
    { tag: t.keyword, color: '#d73a49', fontWeight: 'bold' },
    { tag: [t.name, t.deleted], color: '#24292e' },
    { tag: [t.function(t.variableName), t.labelName], color: '#6f42c1' },
    { tag: [t.typeName, t.className], color: '#e36209' },
    { tag: t.number, color: '#005cc5' },
    { tag: [t.operator, t.operatorKeyword], color: '#d73a49' },
    { tag: [t.meta, t.comment], color: '#6a737d', fontStyle: 'italic' },
    { tag: [t.processingInstruction, t.string, t.inserted], color: '#032f62' },
    { tag: t.regexp, color: '#032f62' },
    { tag: [t.atom, t.bool], color: '#005cc5' },
    { tag: t.tagName, color: '#22863a' },
    { tag: t.attributeName, color: '#6f42c1' },
    { tag: t.attributeValue, color: '#032f62' },
    { tag: t.strong, fontWeight: 'bold' },
    { tag: t.emphasis, fontStyle: 'italic' },
    { tag: t.invalid, color: '#cb2431' },
  ]));
  return [theme, highlight];
}

function getThemeExtensions(CM, themeName) {
  switch (themeName) {
    case 'monokai-sublime':
    case 'monokai': return buildMonokaiSublimeTheme(CM);
    case 'dracula': return buildDraculaTheme(CM);
    case 'default':
    case 'eclipse':
    case 'neo':
    case 'idea': return buildLightTheme(CM);
    default: return buildDraculaTheme(CM);
  }
}

// ── Language mapping ──────────────────────────────────────────────────────────
function getLanguageExtension(CM, mode) {
  if (!mode) return [];
  const name = typeof mode === 'string' ? mode : (mode.name || '');
  const isTS = typeof mode === 'object' && mode.typescript;
  const isJSON = typeof mode === 'object' && mode.json;
  const isJSX = typeof mode === 'object' && mode.jsx;
  const SL = CM.StreamLanguage;

  if (name === 'javascript' && isJSON) return CM.json ? [CM.json()] : [CM.javascript({ jsx: false })];
  if (name === 'javascript' || name === 'js') return [CM.javascript({ jsx: isJSX || !isTS, typescript: isTS })];
  if (name === 'typescript' || name === 'ts') return [CM.javascript({ typescript: true })];
  if (name === 'htmlmixed' || name === 'html') return [CM.html({ matchClosingTags: true, autoCloseTags: true })];
  if (name === 'css' || name === 'scss' || name === 'less') return [CM.css()];
  if (name === 'sql' || name.includes('sql')) return [CM.sql({ dialect: CM.MySQL })];
  if (name === 'markdown' || name === 'text/x-markdown') return [CM.markdown()];
  if (name === 'xml' || name === 'svg') return [CM.xml()];
  if (name === 'php' || name === 'application/x-httpd-php') return [CM.php()];
  if (name === 'yaml') return [CM.yaml()];
  // Legacy modes via StreamLanguage
  if (SL) {
    if (name === 'python' || name === 'py') return [SL.define(CM.python)];
    if (name === 'ruby' || name === 'rb') return [SL.define(CM.ruby)];
    if (name === 'go') return [SL.define(CM.go)];
    if (name === 'rust' || name === 'rs') return [SL.define(CM.rust)];
    if (name === 'java') return [SL.define(CM.java)];
    if (name === 'kotlin' || name === 'kt') return [SL.define(CM.kotlin)];
    if (name === 'csharp' || name === 'cs') return [SL.define(CM.csharp)];
    if (name === 'swift') return [SL.define(CM.swift)];
    if (name === 'lua') return [SL.define(CM.lua)];
    if (name === 'dart') return [SL.define(CM.dart)];
    if (name === 'shell' || name === 'sh' || name === 'bash') return [SL.define(CM.shell)];
    if (name === 'powershell' || name === 'ps1') return [SL.define(CM.powerShell)];
    if (name === 'dockerfile') return [SL.define(CM.dockerFile)];
    if (name === 'toml') return [SL.define(CM.toml)];
    if (name === 'perl' || name === 'pl') return [SL.define(CM.perl)];
  }
  return [];
}

// ── NexaCmirror6 class ────────────────────────────────────────────────────────
export class NexaCmirror6 {
  static _loadPromise = null;
  static _loaded = false;

  constructor(element, options = {}) {
    this._options = options;
    this._element = typeof element === 'string'
      ? document.getElementById(element) || document.querySelector('#' + element)
      : element;
    this._view = null;
    this._listeners = {};
    this._theme = options.theme || 'dracula';
    this._mode = options.mode || 'htmlmixed';
    this._readOnly = options.readOnly || false;
    this._fontSize = options.fontSize || '14px';
    this._lineNumbers = options.lineNumbers !== false;
    this._lineWrapping = options.lineWrapping === true;
    this._tabSize = options.tabSize || 2;
    this._indentUnit = options.indentUnit || 2;
    this._cm6 = null;
    this._diagnostics = [];
    this._ready = false;
    this._pendingValue = options.value || '';
    this._extraKeys = options.extraKeys || {};
    this._completionSources = [];
    this._autocompleteCompartment = null;

    if (NexaCmirror6._loaded && CM6) {
      this._init(CM6);
    }
  }

  async _waitReady() {
    if (this._ready) return;
    await NexaCmirror6.loadDependencies();
    if (!this._view) this._init(CM6);
    await new Promise(r => setTimeout(r, 0));
  }

  _init(CM) {
    this._cm6 = CM;
    const {
      EditorView, EditorState, Compartment, basicSetup,
      keymap, defaultKeymap, historyKeymap, searchKeymap, completionKeymap,
      indentWithTab, lineNumbers, highlightActiveLine, drawSelection,
      highlightSpecialChars, foldGutter, dropCursor, rectangularSelection,
      crosshairCursor, highlightActiveLineGutter,
      autocompletion, closeBrackets, closeBracketsKeymap, lintKeymap,
      search, openSearchPanel, indentUnit, tooltips, history,
    } = CM;

    const langExt = getLanguageExtension(CM, this._mode);
    const themeExt = getThemeExtensions(CM, this._theme);

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) this._emit('change', this, update);
      if (update.docChanged) this._emit('changes', this, [update]);
      if (update.selectionSet) this._emit('cursorActivity', this);
    });

    const focusExt = EditorView.domEventHandlers({
      focus: () => { this._emit('focus', this); return false; },
      blur: () => { this._emit('blur', this); return false; },
    });

    // Konversi extraKeys CM5 → CM6 keymap
    // CM5: 'Ctrl-K', 'Cmd-F' → CM6: 'Ctrl-k', 'Mod-f'
    const cm5KeyToCm6 = (key) => {
      return key
        .replace(/^Cmd-/, 'Mod-')
        .replace(/-([A-Z])$/, (_, c) => '-' + c.toLowerCase());
    };
    const extraKeymap = Object.entries(this._extraKeys).map(([key, fn]) => ({
      key: cm5KeyToCm6(key),
      run: (view) => {
        try {
          const result = fn(this);
          // false = tidak di-handle, biarkan CM6 lanjut ke keymap berikutnya
          if (result === false) return false;
        } catch(e) { console.error('[NexaCmirror6] extraKey error:', e); }
        return true;
      },
    }));

    // Custom search panel — skin nx-cm-* di atas CM6 panel asli
    const _ico = (name) => `<span class="material-symbols-outlined nx-cm-msi" aria-hidden="true">${name}</span>`;

    const injectNxPanel = (view, isReplace) => {
      const panel = view.dom.querySelector('.cm-search');
      if (!panel) return;
      if (panel.querySelector('.nx-cm-find-widget')) {
        panel.querySelector('.nx-cm-find-input')?.focus();
        return;
      }

      // Sembunyikan CM6 native panel tapi tetap aktif (agar query CM6 tetap jalan)
      panel.style.cssText = 'position:absolute;opacity:0;pointer-events:none;width:0;height:0;overflow:hidden;';

      // Ambil input/button asli CM6 untuk di-proxy
      const cm6FindInput = panel.querySelector('input[name="search"]');
      const cm6ReplaceInput = panel.querySelector('input[name="replace"]');
      const cm6NextBtn = panel.querySelector('button[name="next"]');
      const cm6PrevBtn = panel.querySelector('button[name="prev"]');
      const cm6ReplaceBtn = panel.querySelector('button[name="replace"]');
      const cm6ReplaceAllBtn = panel.querySelector('button[name="replaceAll"]');
      const cm6CaseCheck = panel.querySelector('input[name="case"]');
      const cm6WordCheck = panel.querySelector('input[name="word"]') || panel.querySelector('input[name="wor"]');
      const cm6ReCheck = panel.querySelector('input[name="re"]');
      const cm6CloseBtn = panel.querySelector('button[name="close"]');

      // Buat UI kustom nx-cm-*
      const wrap = document.createElement('div');
      wrap.className = 'nx-cm-find-widget' + (isReplace ? ' nx-cm-find-widget--replace' : '');
      wrap.innerHTML = `
        <div class="nx-cm-find-row">
          <div class="nx-cm-find-input-wrap">
            <input type="text" class="nx-cm-find-input" placeholder="Find" />
            <span class="nx-cm-find-count" aria-live="polite"></span>
            <div class="nx-cm-find-toggles">
              <button type="button" class="nx-cm-toggle" data-nx-toggle="case" title="Match Case">${_ico('match_case')}</button>
              <button type="button" class="nx-cm-toggle" data-nx-toggle="word" title="Match Whole Word">${_ico('match_word')}</button>
              <button type="button" class="nx-cm-toggle" data-nx-toggle="regex" title="Use Regular Expression">${_ico('regular_expression')}</button>
            </div>
          </div>
          <div class="nx-cm-find-actions">
            <button type="button" class="nx-cm-icon-btn" data-nx-action="prev" title="Previous Match">${_ico('arrow_upward')}</button>
            <button type="button" class="nx-cm-icon-btn" data-nx-action="next" title="Next Match">${_ico('arrow_downward')}</button>
            <button type="button" class="nx-cm-icon-btn nx-cm-close-btn" data-nx-action="close" title="Close">${_ico('close')}</button>
          </div>
        </div>
        ${isReplace ? `
        <div class="nx-cm-replace-row">
          <div class="nx-cm-find-input-wrap">
            <input type="text" class="nx-cm-replace-input" placeholder="Replace" />
          </div>
          <div class="nx-cm-replace-actions">
            <button type="button" class="nx-cm-repl-action-btn" data-nx-action="replace-one" title="Replace">${_ico('find_replace')} Replace</button>
            <button type="button" class="nx-cm-repl-action-btn" data-nx-action="replace-all" title="Replace All">${_ico('published_with_changes')} All</button>
          </div>
        </div>` : ''}
      `;

      const findInput = wrap.querySelector('.nx-cm-find-input');
      const replaceInput = wrap.querySelector('.nx-cm-replace-input');

      // Proxy input ke CM6 native input
      const syncFind = () => {
        if (cm6FindInput) {
          cm6FindInput.value = findInput.value;
          cm6FindInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };
      const syncReplace = () => {
        if (cm6ReplaceInput) {
          cm6ReplaceInput.value = replaceInput?.value || '';
          cm6ReplaceInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };

      findInput?.addEventListener('input', syncFind);
      findInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); cm6NextBtn?.click(); }
        else if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); cm6PrevBtn?.click(); }
        else if (e.key === 'Escape') { cm6CloseBtn?.click(); view.focus(); }
        else if (e.key === 'F3') { e.preventDefault(); e.shiftKey ? cm6PrevBtn?.click() : cm6NextBtn?.click(); }
      });
      replaceInput?.addEventListener('input', syncReplace);
      replaceInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); cm6ReplaceBtn?.click(); }
        else if (e.key === 'Escape') { cm6CloseBtn?.click(); view.focus(); }
      });

      // Toggle buttons proxy ke CM6 checkbox
      wrap.querySelectorAll('[data-nx-toggle]').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = btn.dataset.nxToggle;
          if (t === 'case') { cm6CaseCheck.checked = !cm6CaseCheck.checked; cm6CaseCheck.dispatchEvent(new Event('change', { bubbles: true })); }
          else if (t === 'word') { cm6WordCheck.checked = !cm6WordCheck.checked; cm6WordCheck.dispatchEvent(new Event('change', { bubbles: true })); }
          else if (t === 'regex') { cm6ReCheck.checked = !cm6ReCheck.checked; cm6ReCheck.dispatchEvent(new Event('change', { bubbles: true })); }
          btn.classList.toggle('is-active');
        });
      });

      // Action buttons proxy ke CM6
      wrap.addEventListener('mousedown', (e) => {
        const btn = e.target.closest('[data-nx-action]');
        if (!btn) return;
        e.preventDefault();
        const a = btn.dataset.nxAction;
        if (a === 'next') cm6NextBtn?.click();
        else if (a === 'prev') cm6PrevBtn?.click();
        else if (a === 'close') { cm6CloseBtn?.click(); view.focus(); }
        else if (a === 'replace-one') cm6ReplaceBtn?.click();
        else if (a === 'replace-all') cm6ReplaceAllBtn?.click();
      });

      // Sync nilai awal dari CM6 ke input kustom
      if (cm6FindInput && findInput) findInput.value = cm6FindInput.value;
      if (cm6ReplaceInput && replaceInput) replaceInput.value = cm6ReplaceInput.value;

      // Insert ke nexacmirror6-wrap sebagai absolute overlay pojok kanan atas
      this._container.appendChild(wrap);

      // Kunci scrollTop — tolak scroll ke atas yang dipicu CM6 (bukan user wheel)
      const scroller = view.scrollDOM;
      const proto = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop');
      let _locked = false;
      Object.defineProperty(scroller, 'scrollTop', {
        get: () => proto.get.call(scroller),
        set: (v) => {
          if (!_locked) proto.set.call(scroller, v);
        },
        configurable: true,
      });
      scroller.addEventListener('wheel', () => {
        _locked = false;
        clearTimeout(scroller._lockTimer);
        scroller._lockTimer = setTimeout(() => { _locked = true; }, 50);
      }, { passive: true });
      // aktifkan lock setelah panel terpasang
      setTimeout(() => { _locked = true; }, 100);

      // Handle close — hapus wrap dan restore scrollTop behaviour
      const observer = new MutationObserver(() => {
        if (!view.dom.querySelector('.cm-search')) {
          _locked = false;
          delete scroller.scrollTop;
          wrap.remove();
          observer.disconnect();
        }
      });
      observer.observe(view.dom, { childList: true, subtree: true });

      setTimeout(() => { findInput?.focus(); findInput?.select(); }, 0);
    };

    const openPanelPreserveScroll = (isReplace) => {
      if (!this._view) return;
      CM.openSearchPanel(this._view);
      setTimeout(() => injectNxPanel(this._view, isReplace), 30);
    };

    this._openFindPanel = () => openPanelPreserveScroll(false);
    this._openReplacePanel = () => openPanelPreserveScroll(true);

    // Buat container lebih awal agar bisa dipakai oleh tooltips({ parent })
    if (!this._container && this._element) {
      const container = document.createElement('div');
      container.className = 'nexacmirror6-wrap';
      const heightOpt = this._options.height;
      if (heightOpt === 'auto') {
        container.style.cssText = 'position:relative;width:100%;';
      } else {
        container.style.cssText = 'position:relative;width:100%;height:100%;';
      }
      this._element.parentNode?.insertBefore(container, this._element.nextSibling);
      this._container = container;
    }
    // Sembunyikan textarea asli selalu (saat init maupun reinit)
    if (this._element) this._element.style.display = 'none';

    const extensions = [
      ...(history ? [history()] : []),
      ...(this._lineNumbers ? [lineNumbers(), highlightActiveLineGutter(), foldGutter()] : []),
      ...(this._lineWrapping ? [EditorView.lineWrapping] : []),
      ...(indentUnit ? [indentUnit.of(' '.repeat(this._indentUnit || 2))] : []),
      EditorState.tabSize.of(this._tabSize || 2),
      highlightSpecialChars(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      closeBrackets(),
      ...(Compartment ? (() => {
        this._snippetSourceCompartment = new Compartment();
        return [this._snippetSourceCompartment.of(this._buildAutocompletion())];
      })() : [this._buildAutocompletion()]),
      search(),
      ...(tooltips ? [tooltips({ position: 'absolute' })] : []),
      keymap.of([
        ...extraKeymap,
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab,
        { key: 'Ctrl-f', run: () => { this._openFindPanel(); return true; } },
        { key: 'Mod-f', run: () => { this._openFindPanel(); return true; } },
        { key: 'Ctrl-h', run: () => { this._openReplacePanel(); return true; } },
        { key: 'Mod-h', run: () => { this._openReplacePanel(); return true; } },
      ]),
      ...themeExt,
      ...langExt,
      EditorState.readOnly.of(this._readOnly),
      updateListener,
      focusExt,
      ...(this._options.height === 'auto' ? [EditorView.theme({
        '&': { height: 'auto', minHeight: '80px' },
        '.cm-scroller': { overflow: 'visible', minHeight: '80px' },
      })] : []),
    ];

    const textarea = this._element;
    if (!textarea) return;
    if (!this._container) return;

    const container = this._container;

    // Set font size
    container.style.fontSize = typeof this._fontSize === 'number'
      ? this._fontSize + 'px' : this._fontSize;

    this._view = new EditorView({
      state: EditorState.create({
        doc: this._pendingValue,
        extensions,
      }),
      parent: container,
    });

    this._ready = true;
    this._emit('ready', this);
  }

  _emit(event, ...args) {
    const handlers = this._listeners[event];
    if (!handlers) return;
    for (const fn of handlers) { try { fn(...args); } catch { /* ignore */ } }
  }

  // ── Public API (identik NexaCmirror CM5) ──────────────────────────────────

  getValue() {
    if (!this._view) return this._pendingValue;
    return this._view.state.doc.toString();
  }

  setValue(content) {
    this._pendingValue = content;
    if (!this._view) return;
    const { EditorState } = this._cm6;
    this._view.dispatch({
      changes: { from: 0, to: this._view.state.doc.length, insert: content },
    });
  }

  setMode(mode) {
    this._mode = mode;
    if (!this._view || !this._cm6) return;
    this._reinit();
  }

  setTheme(theme) {
    this._theme = theme;
    if (!this._view || !this._cm6) return;
    this._reinit();
  }

  _reinit() {
    const value = this.getValue();
    if (this._view) { this._view.destroy(); this._view = null; }
    if (this._container) this._container.innerHTML = '';
    this._pendingValue = value;
    this._init(this._cm6);
  }

  setFontSize(fontSize) {
    this._fontSize = fontSize;
    const target = this._container || this._element;
    if (!target) return;
    target.style.fontSize = typeof fontSize === 'number' ? fontSize + 'px' : fontSize;
  }

  setSize(width, height) {
    if (!this._view) return;
    if (width != null) this._view.dom.style.width = typeof width === 'number' ? width + 'px' : width;
    if (height != null) this._view.dom.style.height = typeof height === 'number' ? height + 'px' : height;
  }

  setHeight(height) { this.setSize(null, height); }
  setWidth(width) { this.setSize(width, null); }

  setReadOnly(readOnly) {
    this._readOnly = readOnly;
    if (!this._view || !this._cm6) return;
    const { EditorState } = this._cm6;
    this._view.dispatch({ effects: EditorState.readOnly.reconfigure(readOnly) });
  }

  getCursor() {
    if (!this._view) return { line: 0, ch: 0 };
    const pos = this._view.state.selection.main.head;
    const line = this._view.state.doc.lineAt(pos);
    return { line: line.number - 1, ch: pos - line.from };
  }

  setCursor(line, ch) {
    if (!this._view) return;
    // Support both setCursor(line, ch) dan setCursor({line, ch})
    if (typeof line === 'object' && line !== null) { ch = line.ch; line = line.line; }
    const doc = this._view.state.doc;
    const lineObj = doc.line(Math.min((line || 0) + 1, doc.lines));
    const pos = Math.min(lineObj.from + (ch || 0), lineObj.to);
    this._view.dispatch({ selection: { anchor: pos } });
    this._view.focus();
  }

  getSelection() {
    if (!this._view) return '';
    const { from, to } = this._view.state.selection.main;
    return this._view.state.doc.sliceString(from, to);
  }

  replaceSelection(text) {
    if (!this._view) return;
    this._view.dispatch(this._view.state.replaceSelection(text));
  }

  getLine(line) {
    if (!this._view) return '';
    const doc = this._view.state.doc;
    if (line + 1 > doc.lines) return '';
    return doc.line(line + 1).text;
  }

  setLine(line, text) {
    if (!this._view) return;
    const doc = this._view.state.doc;
    if (line + 1 > doc.lines) return;
    const l = doc.line(line + 1);
    this._view.dispatch({ changes: { from: l.from, to: l.to, insert: text } });
  }

  removeLine(line) {
    if (!this._view) return;
    const doc = this._view.state.doc;
    if (line + 1 > doc.lines) return;
    const l = doc.line(line + 1);
    const from = l.from;
    const to = l.to + (l.to < doc.length ? 1 : 0);
    this._view.dispatch({ changes: { from, to, insert: '' } });
  }

  lineCount() {
    if (!this._view) return 0;
    return this._view.state.doc.lines;
  }

  undo() {
    if (!this._view || !this._cm6) return;
    this._cm6.undo(this._view);
  }

  redo() {
    if (!this._view || !this._cm6) return;
    this._cm6.redo(this._view);
  }

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    if (event === 'ready' && this._ready) {
      try { callback(this); } catch { /* ignore */ }
    }
  }

  off(event, callback) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(fn => fn !== callback);
  }

  focus() {
    if (this._view) this._view.focus();
  }

  refresh() {
    if (this._view) this._view.requestMeasure();
  }

  formatCode() {
    // CM6 tidak punya built-in beautifier — auto-indent seluruh dokumen
    if (!this._view || !this._cm6) return;
    const { indentSelection } = this._cm6;
    if (indentSelection) indentSelection(this._view);
  }

  save() { /* no-op — CM6 tidak pakai textarea */ }

  destroy() {
    if (this._view) { this._view.destroy(); this._view = null; }
    this._listeners = {};
    this._ready = false;
  }

  getEditor() {
    return this._view;
  }

  // Alias untuk compatibility: editor.editor === editor sendiri (bukan EditorView)
  // Semua kode lama yang pakai runtime.editor.editor.getValue() tetap bekerja.
  get editor() { return this; }

  getWrapperElement() {
    return this._container || this._element;
  }

  hasFocus() {
    return this._view ? this._view.hasFocus : false;
  }

  getScrollInfo() {
    if (!this._view) return { left: 0, top: 0 };
    const dom = this._view.scrollDOM;
    return { left: dom.scrollLeft, top: dom.scrollTop };
  }

  scrollTo(left, top) {
    if (!this._view) return;
    this._view.scrollDOM.scrollLeft = left || 0;
    this._view.scrollDOM.scrollTop = top || 0;
  }

  // Gutter/diagnostics — stub untuk compatibility
  setGutterMarker() {}
  clearGutter() {}
  addLineClass() {}
  removeLineClass() {}
  getOption() { return null; }
  setOption(key, val) {
    if (key === 'mode') this.setMode(val);
    else if (key === 'theme') this.setTheme(val);
    else if (key === 'readOnly') this.setReadOnly(val);
    else if (key === 'lineNumbers') { this._lineNumbers = Boolean(val); this._scheduleReinit(); }
    else if (key === 'lineWrapping') { this._lineWrapping = Boolean(val); this._scheduleReinit(); }
    else if (key === 'tabSize') { this._tabSize = Number(val) || 2; this._scheduleReinit(); }
    else if (key === 'indentUnit') { this._indentUnit = Number(val) || 2; this._scheduleReinit(); }
  }

  _buildAutocompletion() {
    const { autocompletion } = this._cm6;
    if (!this._completionSources.length) return autocompletion();
    // Gabung snippet sources + language data sources agar autocomplete bawaan tetap jalan
    const langDataSource = (ctx) => {
      const srcs = ctx.state.languageDataAt('autocomplete', ctx.pos);
      for (const s of srcs) {
        try {
          const r = s(ctx);
          if (r && (Array.isArray(r.options) ? r.options.length : r.from != null)) return r;
        } catch { /* ignore */ }
      }
      return null;
    };
    return autocompletion({ override: [...this._completionSources, langDataSource] });
  }

  // Tambah custom completion source via compartment reconfigure
  addCompletionSource(fn) {
    if (typeof fn !== 'function') return;
    this._completionSources.push(fn);
    if (this._view && this._snippetSourceCompartment) {
      this._view.dispatch({
        effects: this._snippetSourceCompartment.reconfigure(this._buildAutocompletion()),
      });
    } else {
      this._scheduleReinit();
    }
  }

  _scheduleReinit() {
    clearTimeout(this._reinitTimer);
    this._reinitTimer = setTimeout(() => this._reinit(), 0);
  }

  // execCommand mapping
  execCommand(cmd) {
    if (!this._view || !this._cm6) return;
    const CM = this._cm6;
    if (cmd === 'selectAll') CM.selectAll(this._view);
    else if (cmd === 'undo') CM.undo(this._view);
    else if (cmd === 'redo') CM.redo(this._view);
    else if (cmd === 'findPersistent' || cmd === 'find') this._openFindPanel?.();
    else if (cmd === 'replace') this._openReplacePanel?.();
  }

  somethingSelected() {
    if (!this._view) return false;
    const { from, to } = this._view.state.selection.main;
    return from !== to;
  }

  // CM5: getCursor('from') / getCursor('to') / getCursor()
  getCursor(which) {
    if (!this._view) return { line: 0, ch: 0 };
    const sel = this._view.state.selection.main;
    const pos = which === 'from' ? sel.from : which === 'to' ? sel.to : sel.head;
    const line = this._view.state.doc.lineAt(pos);
    return { line: line.number - 1, ch: pos - line.from };
  }

  // CM5: getRange({line,ch}, {line,ch})
  getRange(from, to) {
    if (!this._view) return '';
    const doc = this._view.state.doc;
    const fromPos = this._posFromLineCol(from.line, from.ch);
    const toPos = this._posFromLineCol(to.line, to.ch);
    return doc.sliceString(fromPos, toPos);
  }

  // CM5: replaceRange(text, from, to)
  replaceRange(text, from, to) {
    if (!this._view) return;
    const fromPos = this._posFromLineCol(from.line, from.ch);
    const toPos = to ? this._posFromLineCol(to.line, to.ch) : fromPos;
    this._view.dispatch({ changes: { from: fromPos, to: toPos, insert: text } });
  }

  // CM5: cursorCoords(pos, mode)
  cursorCoords(pos, mode) {
    if (!this._view) return { top: 0, left: 0, bottom: 0 };
    const offset = this._posFromLineCol(pos.line, pos.ch);
    const coords = this._view.coordsAtPos(offset);
    if (!coords) return { top: 0, left: 0, bottom: 0 };
    if (mode === 'page' || mode === 'window') return { top: coords.top, left: coords.left, bottom: coords.bottom };
    const domRect = this._view.dom.getBoundingClientRect();
    return { top: coords.top - domRect.top, left: coords.left - domRect.left, bottom: coords.bottom - domRect.top };
  }

  _posFromLineCol(line, ch) {
    if (!this._view) return 0;
    const doc = this._view.state.doc;
    const lineNum = Math.min(Math.max(1, line + 1), doc.lines);
    const lineObj = doc.line(lineNum);
    return Math.min(lineObj.from + (ch || 0), lineObj.to);
  }

  // ── Static methods ─────────────────────────────────────────────────────────

  static async loadDependencies() {
    if (NexaCmirror6._loaded) return;
    if (NexaCmirror6._loadPromise) return NexaCmirror6._loadPromise;
    NexaCmirror6._loadPromise = (async () => {
      const base = typeof window !== 'undefined' && window.__NX_BASE_URL__
        ? window.__NX_BASE_URL__ : '';
      const url = base + '/assets/modules/codemirror6/codemirror6.bundle.js';
      CM6 = await import(/* webpackIgnore: true */ url);
      NexaCmirror6._loaded = true;
      _loaded = true;
    })();
    return NexaCmirror6._loadPromise;
  }

  static create(element, options = {}) {
    return new NexaCmirror6(element, options);
  }

  static resetDependenciesCache() {
    NexaCmirror6._loaded = false;
    NexaCmirror6._loadPromise = null;
    _loaded = false;
    _loadPromise = null;
    CM6 = null;
  }
}

export default NexaCmirror6;
