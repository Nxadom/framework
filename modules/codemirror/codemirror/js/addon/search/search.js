// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object")
    mod(require("../../lib/codemirror"), require("./searchcursor"), require("../dialog/dialog"));
  else if (typeof define == "function" && define.amd)
    define(["../../lib/codemirror", "./searchcursor", "../dialog/dialog"], mod);
  else
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  // ── Overlay ───────────────────────────────────────────────────────────────

  function searchOverlay(query, caseInsensitive) {
    if (typeof query == "string")
      query = new RegExp(query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), caseInsensitive ? "gi" : "g");
    else if (!query.global)
      query = new RegExp(query.source, query.ignoreCase ? "gi" : "g");
    return {token: function(stream) {
      query.lastIndex = stream.pos;
      var match = query.exec(stream.string);
      if (match && match.index == stream.pos) { stream.pos += match[0].length || 1; return "searching"; }
      else if (match) { stream.pos = match.index; }
      else { stream.skipToEnd(); }
    }};
  }

  function SearchState() {
    this.posFrom = this.posTo = this.lastQuery = this.query = null;
    this.overlay = null;
  }
  function getSearchState(cm) {
    return cm.state.search || (cm.state.search = new SearchState());
  }
  function queryCaseInsensitive(query) {
    return typeof query == "string" && query == query.toLowerCase();
  }
  function getSearchCursor(cm, query, pos) {
    return cm.getSearchCursor(query, pos, queryCaseInsensitive(query));
  }

  // ── Parse ─────────────────────────────────────────────────────────────────

  function parseString(string) {
    return string.replace(/\\(.)/g, function(_, ch) {
      if (ch == "n") return "\n";
      if (ch == "r") return "\r";
      return ch;
    });
  }

  function parseQuery(query, useRegex, matchCase, matchWord) {
    var isRE = useRegex && query.match(/^\/(.*)\/([a-z]*)$/);
    if (useRegex && isRE) {
      try { query = new RegExp(isRE[1], isRE[2].indexOf("i") == -1 ? "" : "i"); }
      catch(e) {}
    } else if (useRegex) {
      try { query = new RegExp(query, matchCase ? "" : "i"); }
      catch(e) { query = parseString(query); }
    } else {
      query = parseString(query);
    }
    if (matchWord && typeof query == "string") {
      query = new RegExp("\\b" + query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "\\b", matchCase ? "g" : "gi");
    }
    if (typeof query == "string" ? query == "" : query.test(""))
      query = /x^/;
    return query;
  }

  // ── State flags ───────────────────────────────────────────────────────────

  var _matchCase = false;
  var _matchWord = false;
  var _useRegex  = false;

  // ── VS Code–style dialog HTML ─────────────────────────────────────────────

  var _ico = '<span class="material-symbols-outlined nx-cm-msi" aria-hidden="true">';

  function buildFindDialog(initialValue) {
    return (
      '<div class="nx-cm-find-widget">' +
        '<div class="nx-cm-find-row">' +
          '<div class="nx-cm-find-input-wrap">' +
            '<input type="text" class="nx-cm-find-input CodeMirror-search-field" placeholder="Find" value="' + _esc(initialValue || '') + '" />' +
            '<span class="nx-cm-find-count" aria-live="polite"></span>' +
            '<div class="nx-cm-find-toggles">' +
              '<button type="button" class="nx-cm-toggle' + (_matchCase ? ' is-active' : '') + '" data-nx-toggle="case" title="Match Case (Alt+C)">' + _ico + 'match_case</span></button>' +
              '<button type="button" class="nx-cm-toggle' + (_matchWord ? ' is-active' : '') + '" data-nx-toggle="word" title="Match Whole Word (Alt+W)">' + _ico + 'match_word</span></button>' +
              '<button type="button" class="nx-cm-toggle' + (_useRegex  ? ' is-active' : '') + '" data-nx-toggle="regex" title="Use Regular Expression (Alt+R)">' + _ico + 'regular_expression</span></button>' +
            '</div>' +
          '</div>' +
          '<div class="nx-cm-find-actions">' +
            '<button type="button" class="nx-cm-icon-btn" data-nx-action="prev" title="Previous Match (Shift+F3)">' + _ico + 'arrow_upward</span></button>' +
            '<button type="button" class="nx-cm-icon-btn" data-nx-action="next" title="Next Match (F3)">' + _ico + 'arrow_downward</span></button>' +
            '<button type="button" class="nx-cm-icon-btn nx-cm-close-btn" data-nx-action="close" title="Close (Esc)">' + _ico + 'close</span></button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function buildReplaceDialog(initialValue) {
    return (
      '<div class="nx-cm-find-widget nx-cm-find-widget--replace">' +
        '<div class="nx-cm-find-row">' +
          '<div class="nx-cm-find-input-wrap">' +
            '<input type="text" class="nx-cm-find-input CodeMirror-search-field" placeholder="Find" value="' + _esc(initialValue || '') + '" />' +
            '<span class="nx-cm-find-count" aria-live="polite"></span>' +
            '<div class="nx-cm-find-toggles">' +
              '<button type="button" class="nx-cm-toggle' + (_matchCase ? ' is-active' : '') + '" data-nx-toggle="case" title="Match Case (Alt+C)">' + _ico + 'match_case</span></button>' +
              '<button type="button" class="nx-cm-toggle' + (_matchWord ? ' is-active' : '') + '" data-nx-toggle="word" title="Match Whole Word (Alt+W)">' + _ico + 'match_word</span></button>' +
              '<button type="button" class="nx-cm-toggle' + (_useRegex  ? ' is-active' : '') + '" data-nx-toggle="regex" title="Use Regular Expression (Alt+R)">' + _ico + 'regular_expression</span></button>' +
            '</div>' +
          '</div>' +
          '<div class="nx-cm-find-actions">' +
            '<button type="button" class="nx-cm-icon-btn" data-nx-action="prev" title="Previous Match (Shift+F3)">' + _ico + 'arrow_upward</span></button>' +
            '<button type="button" class="nx-cm-icon-btn" data-nx-action="next" title="Next Match (F3)">' + _ico + 'arrow_downward</span></button>' +
            '<button type="button" class="nx-cm-icon-btn nx-cm-close-btn" data-nx-action="close" title="Close (Esc)">' + _ico + 'close</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="nx-cm-replace-row">' +
          '<div class="nx-cm-find-input-wrap">' +
            '<input type="text" class="nx-cm-replace-input" placeholder="Replace" />' +
          '</div>' +
          '<div class="nx-cm-replace-actions">' +
            '<button type="button" class="nx-cm-repl-action-btn" data-nx-action="replace-one" title="Replace (Enter)">' + _ico + 'find_replace</span> Replace</button>' +
            '<button type="button" class="nx-cm-repl-action-btn" data-nx-action="replace-all" title="Replace All (Ctrl+Alt+Enter)">' + _ico + 'published_with_changes</span> All</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Count matches ─────────────────────────────────────────────────────────

  function countMatches(cm, query) {
    if (!query || (typeof query == 'string' ? !query : query.test(''))) return 0;
    var count = 0;
    var cursor = getSearchCursor(cm, query, CodeMirror.Pos(cm.firstLine(), 0));
    while (cursor.findNext()) { count++; if (count > 999) return '999+'; }
    return count;
  }

  function updateCount(cm, dialog, query) {
    var countEl = dialog && dialog.querySelector('.nx-cm-find-count');
    if (!countEl) return;
    var state = getSearchState(cm);
    if (!state.query) { countEl.textContent = ''; return; }
    var n = countMatches(cm, state.query);
    countEl.textContent = n === 0 ? 'No results' : n + (typeof n === 'number' && n > 1 ? ' matches' : ' match');
  }

  // ── Core search ───────────────────────────────────────────────────────────

  function startSearch(cm, state, query) {
    state.queryText = query;
    state.query = parseQuery(query, _useRegex, _matchCase, _matchWord);
    cm.removeOverlay(state.overlay, queryCaseInsensitive(state.query));
    state.overlay = searchOverlay(state.query, queryCaseInsensitive(state.query));
    cm.addOverlay(state.overlay);
    if (cm.showMatchesOnScrollbar) {
      if (state.annotate) { state.annotate.clear(); state.annotate = null; }
      state.annotate = cm.showMatchesOnScrollbar(state.query, queryCaseInsensitive(state.query));
    }
  }

  function findNext(cm, rev, callback) { cm.operation(function() {
    var state = getSearchState(cm);
    var cursor = getSearchCursor(cm, state.query, rev ? state.posFrom : state.posTo);
    if (!cursor.find(rev)) {
      cursor = getSearchCursor(cm, state.query, rev ? CodeMirror.Pos(cm.lastLine()) : CodeMirror.Pos(cm.firstLine(), 0));
      if (!cursor.find(rev)) return;
    }
    cm.setSelection(cursor.from(), cursor.to());
    cm.scrollIntoView({from: cursor.from(), to: cursor.to()}, 20);
    state.posFrom = cursor.from(); state.posTo = cursor.to();
    if (callback) callback(cursor.from(), cursor.to());
  }); }

  function clearSearch(cm) { cm.operation(function() {
    var state = getSearchState(cm);
    state.lastQuery = state.query;
    if (!state.query) return;
    state.query = state.queryText = null;
    cm.removeOverlay(state.overlay);
    if (state.annotate) { state.annotate.clear(); state.annotate = null; }
  }); }

  function replaceAll(cm, query, text) {
    cm.operation(function() {
      for (var cursor = getSearchCursor(cm, query); cursor.findNext();) {
        if (typeof query != "string") {
          var match = cm.getRange(cursor.from(), cursor.to()).match(query);
          cursor.replace(text.replace(/\$(\d)/g, function(_, i) { return match[i]; }));
        } else cursor.replace(text);
      }
    });
  }

  // ── Wire widget interactivity ─────────────────────────────────────────────

  function wireWidget(cm, dialogEl, isReplace, closeDialog) {
    var findInput    = dialogEl.querySelector('.nx-cm-find-input');
    var replInput    = dialogEl.querySelector('.nx-cm-replace-input');
    var countEl      = dialogEl.querySelector('.nx-cm-find-count');
    var toggleBtns   = dialogEl.querySelectorAll('[data-nx-toggle]');
    var state        = getSearchState(cm);

    function runSearch(query) {
      if (!query) { clearSearch(cm); if (countEl) countEl.textContent = ''; return; }
      if (query !== state.queryText) {
        startSearch(cm, state, query);
        state.posFrom = state.posTo = cm.getCursor();
      }
      findNext(cm, false);
      updateCount(cm, dialogEl, query);
    }

    function refreshToggles() {
      toggleBtns.forEach(function(btn) {
        var t = btn.dataset.nxToggle;
        btn.classList.toggle('is-active',
          t === 'case'  ? _matchCase :
          t === 'word'  ? _matchWord : _useRegex);
      });
    }

    // Input events
    if (findInput) {
      findInput.addEventListener('input', function() { runSearch(findInput.value); });
      findInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { closeDialog(); return; }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (e.shiftKey) findNext(cm, true);
          else { runSearch(findInput.value); }
          updateCount(cm, dialogEl, findInput.value);
        }
        if (e.key === 'F3') { e.preventDefault(); findNext(cm, e.shiftKey); }
      });
      // Initial search if value present
      if (findInput.value) {
        setTimeout(function() { runSearch(findInput.value); }, 0);
      }
    }

    if (replInput) {
      replInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { closeDialog(); }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.altKey) {
          e.preventDefault();
          var q = state.query; if (!q) return;
          replaceAll(cm, q, parseString(replInput.value));
          clearSearch(cm);
          closeDialog();
        }
      });
    }

    // Toggles
    toggleBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var t = btn.dataset.nxToggle;
        if (t === 'case')  _matchCase = !_matchCase;
        if (t === 'word')  _matchWord = !_matchWord;
        if (t === 'regex') _useRegex  = !_useRegex;
        refreshToggles();
        if (findInput && findInput.value) {
          clearSearch(cm);
          runSearch(findInput.value);
        }
      });
    });

    // Action buttons
    dialogEl.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-nx-action]');
      if (!btn) return;
      var act = btn.dataset.nxAction;
      if (act === 'close') { closeDialog(); return; }
      if (act === 'next')  { findNext(cm, false); return; }
      if (act === 'prev')  { findNext(cm, true);  return; }
      if (act === 'replace-one' && replInput) {
        var q = state.query; if (!q) return;
        var cursor = getSearchCursor(cm, q, cm.getCursor('from'));
        if (cursor.findNext()) {
          cm.setSelection(cursor.from(), cursor.to());
          cursor.replace(parseString(replInput.value));
          findNext(cm, false);
          updateCount(cm, dialogEl, findInput ? findInput.value : '');
        }
        return;
      }
      if (act === 'replace-all' && replInput) {
        var q2 = state.query; if (!q2) return;
        replaceAll(cm, q2, parseString(replInput.value));
        clearSearch(cm);
        if (countEl) countEl.textContent = '';
        closeDialog();
        return;
      }
    });

    // Focus find input
    if (findInput) setTimeout(function() { findInput.focus(); findInput.select(); }, 0);
  }

  // ── doSearch (Ctrl+F) ─────────────────────────────────────────────────────

  function doSearch(cm, rev, persistent, immediate) {
    var state = getSearchState(cm);
    if (state.query) {
      // Already open — just navigate
      if (!persistent) return findNext(cm, rev);
    }
    var q = cm.getSelection() || state.lastQuery || '';

    if (!cm.openDialog) {
      // Fallback: no dialog support
      var query = prompt("Search for:", q);
      if (query) cm.operation(function() {
        startSearch(cm, state, query);
        state.posFrom = state.posTo = cm.getCursor();
        findNext(cm, rev);
      });
      return;
    }

    var tpl = document.createElement('div');
    tpl.innerHTML = buildFindDialog(q);
    var widget = tpl.firstChild;

    var closeRef = [null];
    closeRef[0] = cm.openDialog(widget, function() {}, {
      closeOnEnter: false,
      closeOnBlur: false,
      onClose: function() { clearSearch(cm); }
    });

    wireWidget(cm, widget, false, function() {
      clearSearch(cm);
      if (closeRef[0]) closeRef[0]();
    });

    if (immediate && q) {
      startSearch(cm, state, q);
      state.posFrom = state.posTo = cm.getCursor();
      findNext(cm, rev);
    }
  }

  // ── replace (Ctrl+H) ─────────────────────────────────────────────────────

  function replace(cm) {
    if (cm.getOption("readOnly")) return;
    var state  = getSearchState(cm);
    var q      = cm.getSelection() || state.lastQuery || '';

    if (!cm.openDialog) {
      var query = prompt("Replace:", q);
      if (!query) return;
      query = parseQuery(query, _useRegex, _matchCase, _matchWord);
      var text = prompt("Replace with:", "");
      if (text == null) return;
      replaceAll(cm, query, parseString(text));
      return;
    }

    var tpl = document.createElement('div');
    tpl.innerHTML = buildReplaceDialog(q);
    var widget = tpl.firstChild;

    var closeRef = [null];
    closeRef[0] = cm.openDialog(widget, function() {}, {
      closeOnEnter: false,
      closeOnBlur: false,
      onClose: function() { clearSearch(cm); }
    });

    wireWidget(cm, widget, true, function() {
      clearSearch(cm);
      if (closeRef[0]) closeRef[0]();
    });
  }

  // ── Register commands ─────────────────────────────────────────────────────

  CodeMirror.commands.find            = function(cm) { clearSearch(cm); doSearch(cm); };
  CodeMirror.commands.findPersistent  = function(cm) { clearSearch(cm); doSearch(cm, false, true); };
  CodeMirror.commands.findPersistentNext = function(cm) { doSearch(cm, false, true, true); };
  CodeMirror.commands.findPersistentPrev = function(cm) { doSearch(cm, true,  true, true); };
  CodeMirror.commands.findNext        = doSearch;
  CodeMirror.commands.findPrev        = function(cm) { doSearch(cm, true); };
  CodeMirror.commands.clearSearch     = clearSearch;
  CodeMirror.commands.replace         = replace;
  CodeMirror.commands.replaceAll      = function(cm) { replace(cm); };
});
