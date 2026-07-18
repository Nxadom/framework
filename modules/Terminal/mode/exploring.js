/**
 * exploring — Search Tool, File Reader, RAG Engine + Analisis Proyek
 *
 * Subcommands:
 *   exploring                          — Scan proyek (default)
 *   exploring scan [path]             — Scan proyek: daftar file & folder
 *   exploring search <query> [ext]    — Cari file berdasarkan nama
 *   exploring grep <query> [ext]      — Cari teks di dalam file
 *   exploring read <filepath>         — Baca isi file
 *   exploring errors [dir]            — Validasi sintaks file: deteksi error nyata
 *   exploring trace <file>            — Trace call chain / dependency graph
 *   exploring static [dir]            — Analisis statis kode tanpa menjalankan
 *   exploring check [dir]             — Checker tools: metrics, pattern deteksi
 *   exploring compare <f1> <f2>       — Bandingkan alur logika antar file
 *   exploring rag <query>             — RAG: chunk + retrieve + context
 *   exploring index                   — Index ulang proyek
 *   exploring help                    — Tampilkan menu
 */
import { NexaNpm } from '../npm/index.js';
import { TabelRaw } from '../raw/index.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Baca folder via Electron IPC, return { name, type }[] */
async function readFolder(folderPath) {
  try {
    const api = window.electronAPI;
    if (!api?.discoveryReadFolder) return [];
    const row = await api.discoveryReadFolder(String(folderPath || ''));
    if (!row?.ok) return [];
    return Array.isArray(row.entries) ? row.entries : [];
  } catch { return []; }
}

/** Baca file via Electron IPC, return string konten */
async function readFileContent(filePath) {
  try {
    const api = window.electronAPI;
    if (!api?.discoveryReadFile) return null;
    const row = await api.discoveryReadFile(String(filePath || ''));
    if (!row?.ok) return null;
    return String(row.content || row.text || '');
  } catch { return null; }
}

/** Escape HTML untuk output aman */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Parsing command args — { _, flags } */
function parseArgs(raw) {
  const tokens = String(raw || '').trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  const args = tokens.map(t => t.replace(/^["']|["']$/g, ''));
  const cmd = args[0] || '';
  const rest = args.slice(1);
  return { cmd, args: rest, raw: rest.join(' ') };
}

/** Dapatkan path absolut via workingDirectory cmd */
function resolvePath(cmd, input) {
  const wd = String(cmd.workingDirectory || '').trim().replace(/\\/g, '/').replace(/\/+$/, '');
  if (!input) return wd;
  const normal = input.replace(/\\/g, '/');
  if (/^[a-zA-Z]:\//.test(normal) || normal.startsWith('/')) return normal;
  return wd + '/' + normal;
}

/** Cek apakah path adalah file dengan ekstensi kode yang bisa dianalisis */
function isCodeFile(name) {
  const codeExts = [
    '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts',
    '.vue', '.svelte',
    '.html', '.htm',
    '.css', '.scss', '.less', '.sass',
    '.json', '.jsonc',
    '.py', '.php', '.rb', '.go', '.rs', '.java', '.kt', '.swift',
    '.sql', '.xml', '.yml', '.yaml', '.toml', '.ini', '.cfg',
    '.sh', '.bash', '.bat', '.cmd', '.ps1',
    '.md', '.mdx', '.txt',
    '.env', '.env.example',
  ];
  const ext = name.includes('.') ? '.' + name.split('.').pop().toLowerCase() : '';
  return codeExts.includes(ext);
}

function isSkippableDir(name) {
  return name === 'node_modules' || name === '.git' || name === '.svn' || name === '__pycache__' || name === '.next' || name === 'dist' || name === 'build' || name === '.cache';
}

// ─── 1. Search Tool ─────────────────────────────────────────────────────────

/** Scan proyek — rekursif kumpulkan semua entry */
async function scanAll(dirPath) {
  const results = { dirs: [], files: [], totalSize: 0 };
  async function walk(path) {
    const entries = await readFolder(path);
    const sorted = [...entries].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    for (const e of sorted) {
      if (isSkippableDir(e.name)) continue;
      const full = path + '/' + e.name;
      if (e.type === 'directory') {
        results.dirs.push(full);
        await walk(full);
      } else {
        results.files.push({ path: full, name: e.name });
        if (typeof e.size === 'number') results.totalSize += e.size;
      }
    }
  }
  await walk(dirPath);
  return results;
}

/** Cari file berdasarkan nama (case-insensitive) */
async function searchFilesByName(dirPath, query) {
  const q = String(query || '').toLowerCase();
  const matches = [];
  async function walk(path) {
    const entries = await readFolder(path);
    for (const e of entries) {
      if (isSkippableDir(e.name)) continue;
      const full = path + '/' + e.name;
      if (e.type === 'directory') {
        await walk(full);
      } else if (e.name.toLowerCase().includes(q)) {
        matches.push({ path: full, name: e.name });
      }
    }
  }
  await walk(dirPath);
  return matches;
}

/** Cari teks di dalam file (grep) */
async function grepFiles(dirPath, query, extFilter) {
  const q = String(query || '').toLowerCase();
  const matches = [];
  const exts = String(extFilter || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

  async function walk(path) {
    const entries = await readFolder(path);
    for (const e of entries) {
      if (isSkippableDir(e.name)) continue;
      const full = path + '/' + e.name;
      if (e.type === 'directory') {
        await walk(full);
      } else {
        const ext = e.name.includes('.') ? '.' + e.name.split('.').pop().toLowerCase() : '';
        if (exts.length > 0 && !exts.some(x => ext === x || ext.endsWith(x))) continue;
        const content = await readFileContent(full);
        if (content == null) continue;
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(q)) {
            matches.push({ file: full, line: i + 1, text: lines[i].trim().substring(0, 200) });
          }
        }
      }
    }
  }
  await walk(dirPath);
  return matches;
}

// ─── 2. File Reader ─────────────────────────────────────────────────────────

function syntaxClass(ext) {
  const map = {
    '.js': 'language-javascript', '.jsx': 'language-javascript',
    '.ts': 'language-typescript', '.tsx': 'language-typescript',
    '.json': 'language-json', '.html': 'language-html', '.css': 'language-css',
    '.md': 'language-markdown', '.py': 'language-python',
    '.php': 'language-php', '.sql': 'language-sql',
    '.xml': 'language-xml', '.yml': 'language-yaml', '.yaml': 'language-yaml',
    '.sh': 'language-bash', '.bat': 'language-batch',
  };
  return map[ext] || 'language-plaintext';
}

// ─── 3. Real Error Validator ───────────────────────────────────────────────

/**
 * Forward scan untuk menemukan baris error JS secara akurat.
 * V8 di Electron renderer TIDAK menyertakan posisi error dari new Function().
 * Strategi: ganti baris dengan `void 0;` (valid JS). Baris yang jika diganti
 * membuat kode valid adalah baris error.
 */
function findErrorLineJS(lines, fullErrorMsg) {
  if (!lines || lines.length === 0) return { line: 1, col: 1 };
  const fullSrc = lines.join('\n');
  try { new Function(fullSrc); return { line: 0, col: 1 }; } catch {}

  // Ganti tiap baris dengan `void 0;`. Baris yang membuat kode valid = error.
  const maxCheck = Math.min(lines.length, 100);
  const start = Math.max(0, lines.length - maxCheck);
  for (let i = lines.length - 1; i >= start; i--) {
    const modified = lines.map((l, idx) => idx === i ? 'void 0;' : l).join('\n');
    try {
      new Function(modified);
      // Error hilang setelah ganti baris i → baris i (1-indexed = i+1) adalah error
      const errLine = lines[i] || '';
      let col = 1;
      if (fullErrorMsg) {
        const m = fullErrorMsg.match(/'([^']+)'/);
        const t = m ? m[1] : '';
        if (t && errLine) { const idx = errLine.lastIndexOf(t); if (idx >= 0) col = idx + 1; }
      }
      return { line: i + 1, col };
    } catch {}
  }
  return { line: 1, col: 1 };
}

/**
 * Hasilkan saran perbaikan berdasarkan pesan error
 */
function suggestFix(message, type, ext) {
  const m = (message || '').toLowerCase();
  const t = (type || '').toLowerCase();

  if (m.includes('unexpected token')) {
    if (m.includes('}')) return 'Remove or add missing opening brace \'{\' before this token.';
    if (m.includes('{')) return 'Add missing closing brace \'}\' after this block.';
    if (m.includes(')')) return 'Add missing opening parenthesis \'(\' before this token.';
    if (m.includes('(')) return 'Add missing closing parenthesis \')\' after this expression.';
    if (m.includes(';')) return 'Remove unexpected semicolon.';
    if (m.includes('string')) return 'Check string quoting — missing or extra quotes.';
    if (m.includes('identifier')) return 'Add missing operator or semicolon before identifier.';
    if (m.includes('invalid keyword')) {
      return 'Use valid keyword without trailing characters.';
    }
    return 'Review syntax around this token.';
  }
  if (m.includes('unexpected identifier')) {
    return 'Add missing operator or comma before identifier.';
  }
  if (t === 'undeclared-var' || m.includes('not declared') || m.includes('is not defined')) {
    const varMatch = message.match(/"([^"]+)"/);
    if (varMatch) return `Declare "${varMatch[1]}" using var/let/const before use.`;
    return 'Declare the variable before using it.';
  }
  if (m.includes('missing') && m.includes('class')) {
    return 'Add missing class name or body braces.';
  }
  if (m.includes('missing') && (m.includes('formal') || m.includes('parameter'))) {
    return 'Add required function parameters.';
  }
  if (m.includes('unterminated string') || m.includes('unclosed string') || m.includes('unclosed quote')) {
    return 'Close the string with matching quote character.';
  }
  if (m.includes('json parse')) {
    return 'Fix JSON syntax: check for trailing commas, missing quotes, or extra braces.';
  }
  if (m.includes('unmatched closing tag')) {
    const match = message.match(/<\/\w+/);
    return 'Remove or match ' + (match ? match[0] + '>' : 'the closing tag') + ' with an opening tag.';
  }
  if (m.includes('unclosed tag')) {
    const match = message.match(/<\w+/);
    return 'Add closing tag for ' + (match ? match[0] + '>' : 'the unclosed tag') + '.';
  }
  if (m.includes('unclosed')) {
    const braceMatch = message.match(/(\{)/);
    if (braceMatch) return 'Add missing closing brace \'}\'.';
    return 'Close the unclosed block or bracket.';
  }
  if (m.includes('too many') || m.includes('extra closing')) {
    return 'Remove the extra closing brace \'}\'.';
  }
  if (m.includes('indentation mismatch')) {
    return 'Fix indentation to match expected level.';
  }
  if (m.includes('missing semicolon')) {
    return 'Add semicolon at end of previous statement.';
  }
  if (t.includes('potential-error') || t.includes('potential')) {
    return 'Review code for possible runtime error.';
  }
  if (m.includes('yaml') || m.includes('indented content after blank')) {
    return 'Remove blank line or fix indentation in YAML block.';
  }
  if (t.includes('html-error')) {
    return 'Fix HTML tag nesting or closing order.';
  }
  if (t.includes('css-error')) {
    return 'Fix CSS brace balance.';
  }
  if (t.includes('shell-error')) {
    return 'Close the unclosed quote or backtick.';
  }
  if (t.includes('python-error')) {
    return 'Fix Python indentation or syntax.';
  }
  return 'Review the indicated line for syntax issues.';
}

/** Dapatkan kategori berdasarkan type dan pesan error */
function errorCategory(type, message) {
  const m = (message || '').toLowerCase();
  const t = (type || '').toLowerCase();

  if (m.includes('json')) return 'JSON Syntax Error';
  if (m.includes('html') || t.includes('html')) return 'HTML Error';
  if (m.includes('css') || t.includes('css')) return 'CSS Error';
  if (m.includes('python') || t.includes('python')) return 'Python Error';
  if (m.includes('shell') || t.includes('shell') || t.includes('bash')) return 'Shell Syntax Error';
  if (m.includes('yaml') || t.includes('yaml')) return 'YAML Syntax Error';
  if (m.includes('validator')) return 'Validator Internal Error';
  if (m.includes('potential') || t.includes('potential')) return 'Potential Runtime Error';
  if (t === 'undeclared-var') return 'Potential Runtime Error';
  if (t === 'empty-catch') return 'Code Quality';
  return 'Syntax Error';
}

/** Dapatkan human-readable error type dari type + message */
function errorType(type, message) {
  const m = (message || '').toLowerCase();
  const t = (type || '').toLowerCase();

  // console-log check first
  if (t === 'console-log') return 'Console Log';
  if (t === 'magic-number') return 'Magic Number';
  if (t === 'undeclared-var') return 'Undeclared Variable';
  if (t === 'empty-catch') return 'Empty Catch Block';

  // syntax-error rules
  if (t === 'syntax-error') {
    if (m.includes('semicolon')) return 'Missing Semicolon';
    if (m.includes(';')) return 'Unexpected Token';
    if (m.includes('}') || m.includes('{')) return 'Unbalanced Braces';
    if (m.includes('json')) return 'JSON Parse Error';
    return 'Unexpected Token';
  }

  // html-error rules
  if (t === 'html-error') {
    if (m.includes('unclosed tag')) return 'Unclosed Tag';
    if (m.includes('unmatched')) return 'Mismatched Tag';
    return 'Unclosed Tag';
  }

  // css-error
  if (t === 'css-error') return 'Unbalanced Braces';

  // python-error
  if (t === 'python-error') return 'Indentation Error';

  // shell-error
  if (t === 'shell-error') return 'Unclosed String';

  // yaml-error
  if (t === 'yaml-error') return 'YAML Syntax Error';

  // php-error rules
  if (t === 'php-error') {
    if (m.includes('semicolon')) return 'Missing Semicolon';
    if (m.includes('unclosed')) return 'Unclosed Brace';
    if (m.includes('too many')) return 'Extra Brace';
    return 'PHP Syntax Error';
  }

  // potential-error rules
  if (t === 'potential-error') {
    if (m.includes('semicolon')) return 'Missing Semicolon';
    return 'Potential Runtime Error';
  }

  // Fallback: check message content
  if (m.includes('semicolon')) return 'Missing Semicolon';
  if (m.includes('unclosed')) return 'Unclosed String';
  if (m.includes('indent')) return 'Indentation Error';
  if (m.includes('json')) return 'JSON Parse Error';
  return 'Syntax Error';
}

/** Dapatkan nama analyzer berdasarkan ekstensi file */
function analyzerSource(ext) {
  const map = {
    '.json': 'JSON Parser',
    '.js': 'JavaScript Parser (new Function())',
    '.jsx': 'JavaScript Parser (new Function())',
    '.mjs': 'JavaScript Parser (new Function())',
    '.cjs': 'JavaScript Parser (new Function())',
    '.ts': 'TypeScript Parser (stripped)',
    '.tsx': 'TypeScript Parser (stripped)',
    '.mts': 'TypeScript Parser (stripped)',
    '.cts': 'TypeScript Parser (stripped)',
    '.html': 'HTML Structure Validator',
    '.htm': 'HTML Structure Validator',
    '.css': 'CSS Brace Checker',
    '.scss': 'CSS Brace Checker',
    '.less': 'CSS Brace Checker',
    '.sass': 'CSS Brace Checker',
    '.py': 'Python Indentation Validator',
    '.php': 'PHP Syntax Analyzer',
    '.sh': 'Shell Quote Balancer',
    '.bash': 'Shell Quote Balancer',
    '.bat': 'Batch Syntax Check',
    '.cmd': 'Batch Syntax Check',
    '.ps1': 'PowerShell Syntax Check',
    '.sql': 'SQL Balancer',
    '.xml': 'XML Tag Validator',
    '.yml': 'YAML Syntax Check',
    '.yaml': 'YAML Syntax Check',
    '.toml': 'TOML Syntax Check',
    '.ini': 'INI Syntax Check',
    '.cfg': 'INI Syntax Check',
    '.vue': 'Vue/Svelte Analyzer',
    '.svelte': 'Vue/Svelte Analyzer',
    '.md': 'Markdown Validator',
    '.mdx': 'Markdown Validator',
    '.env': 'ENV Format Check',
  };
  return map[ext] || 'Generic Syntax Validator';
}

/** Hapus error duplikat dari array */
function deduplicateErrors(errors) {
  const seen = new Set();
  return errors.filter(e => {
    const key = `${e.line}|${e.col}|${e.type}|${e.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Enrich error object dengan severity, confidence, category, suggestion, errorType, analyzer */
function enrichError(error, ext) {
  const sev = error.severity || 'HIGH';
  const conf = error.confidence || '100%';
  const cat = error.category || errorCategory(error.type, error.message);
  const sug = error.suggestion || suggestFix(error.message, error.type, ext);
  const et = error.errorType || errorType(error.type, error.message);
  const aSrc = error.analyzer || analyzerSource(ext);
  return { ...error, severity: sev, confidence: conf, category: cat, suggestion: sug, errorType: et, analyzer: aSrc };
}

/** Validasi sintaks file secara nyata, bukan sekedar regex pattern */
const VALIDATION_HANDLERS = {
  '.json': (name, content, lines, ext) => {
    const errors = [];
    try {
      JSON.parse(content);
    } catch (e) {
      const msg = String(e.message || '');
      const lineMatch = msg.match(/position\s+(\d+)/i) || msg.match(/at\s+line\s+(\d+)/i) || msg.match(/line\s+(\d+)/i);
      let line = 1, col = 1;
      if (lineMatch) {
        line = parseInt(lineMatch[1]);
        let pos = parseInt(lineMatch[1]);
        if (!isNaN(pos) && pos < content.length) {
          const before = content.substring(0, pos);
          line = before.split('\n').length;
          col = pos - before.lastIndexOf('\n');
        }
      }
      errors.push(enrichError({
        line, col, type: 'syntax-error', message: 'JSON parse error: ' + msg.substring(0, 120),
        severity: 'HIGH', confidence: '100%'
      }, ext));
    }
    return errors;
  },

  '.js': (name, content, lines, ext) => {
    const errors = [];
    const seenLines = new Set();

    // Phase 0: Skip file yang mengandung JSX — <ComponentName> tidak bisa di-parse oleh new Function()
    if (ext === '.jsx' || /<[A-Z]\w+(?:\s|>)/.test(content)) return errors;

    // Phase 1: regex-based detection and fix of stuck-to-keyword tokens
    // Replaces bad "function1ssssssssssss" with valid "function" per line
    let currentLines = lines.map(l => l);
    const kwRe = /\b(function|class|var|let|const|if|for|while|switch|catch|return|throw|import|export)(\w+)/g;
    for (let i = 0; i < currentLines.length; i++) {
      const lineMatches = [];
      kwRe.lastIndex = 0;
      let m;
      while ((m = kwRe.exec(currentLines[i])) !== null) {
        lineMatches.push({ full: m[0], keyword: m[1], index: m.index });
      }
      if (lineMatches.length > 0) {
        for (const lm of lineMatches) {
          if (seenLines.has(i + 1)) continue;
          seenLines.add(i + 1);
          errors.push(enrichError({
            line: i + 1, col: lm.index + 1, type: 'syntax-error',
            message: 'Unexpected token: invalid keyword "' + lm.full + '"',
            severity: 'HIGH', confidence: '100%'
          }, ext));
        }
        currentLines[i] = currentLines[i].replace(kwRe, '$1');
      }
    }

    // Phase 1b: Handle ES module keywords (export, import) untuk new Function() compatibility
    // Khusus import multi-line: jaga keseimbangan braces
    let inImportBlock = false;
    for (let i = 0; i < currentLines.length; i++) {
      const trimmed = currentLines[i].trimStart();

      // `export` at line start — strip keyword
      if (trimmed.startsWith('export ')) {
        currentLines[i] = currentLines[i].replace(/^\s*export\s+(default\s+)?/, '');
      }

      // `import {` tanpa } di baris yang sama = awal multi-line import block
      const afterImport = trimmed.startsWith('import ') ? trimmed.replace(/^import\s+/, '') : '';
      if (afterImport && afterImport.startsWith('{') && !afterImport.includes('}')) {
        currentLines[i] = '{';   // jaga buka kurung
        inImportBlock = true;
        continue;
      }

      // Di dalam multi-line import block
      if (inImportBlock) {
        if (trimmed.startsWith('} from')) {
          currentLines[i] = '}'; // jaga tutup kurung
          inImportBlock = false;
        } else {
          currentLines[i] = '// ' + currentLines[i]; // komen baris interior
        }
        continue;
      }

      // Import lain (single-line dsb) — comment out seluruhnya
      if (trimmed.startsWith('import ')) {
        currentLines[i] = '// ' + currentLines[i];
      }
    }

    // Phase 1c: Deteksi JSX — <ComponentName> atau <tag>, baik .jsx maupun .js
    const isJSX = ext === '.jsx' || /<[A-Z]\w+/.test(content);
    // Phase 2: new Function() parsing — SKIP untuk file JSX (tidak bisa di-parse oleh Function)
    if (isJSX) return errors;
    const MAX_PASSES = 50;
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      const src = currentLines.join('\n');
      try {
        new Function(src);
        break;
      } catch (e) {
        if (!(e instanceof SyntaxError)) break;
        const msg = String(e.message || '');
        let errLine = 1;
        let errCol = 1;
        // V8 stack: <anonymous>:LINE:COL
        const stackMatch = (e.stack || '').match(/<anonymous>:(\d+):(\d+)/);
        if (stackMatch) {
          errLine = parseInt(stackMatch[1]);
          errCol = parseInt(stackMatch[2]);
        }
        if (seenLines.has(errLine)) break;
        seenLines.add(errLine);

        let col = errCol || 1;
        const errLineContent = currentLines[errLine - 1] || '';
        const tokenMatch = msg.match(/'([^']+)'/);
        if (tokenMatch) {
          const tIdx = errLineContent.indexOf(tokenMatch[1]);
          if (tIdx >= 0) col = tIdx + 1;
        }

        errors.push(enrichError({
          line: errLine, col: col, type: 'syntax-error', message: msg.substring(0, 150),
          severity: 'HIGH', confidence: '100%'
        }, ext));

        // Remove the line content but preserve brace balance
        const errIdx = errLine - 1;
        if (errIdx < 0 || errIdx >= currentLines.length) break;
        const trimmed = currentLines[errIdx].trim();
        const indent = currentLines[errIdx].match(/^\s*/)[0];
        if (trimmed === '}') {
          currentLines[errIdx] = indent + ';';
        } else if (trimmed.endsWith('{')) {
          currentLines[errIdx] = indent + '{}';
        } else {
          currentLines[errIdx] = indent + 'void 0;';
        }
      }
    }
    // Deteksi missing semicolon berbahaya (specific patterns)
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (i > 0 && /^\s*\(/.test(lines[i]) && !/[;{(\[=,]\s*$/.test(lines[i - 1].trim())) {
        const prevTrimmed = lines[i - 1].trim();
        if (prevTrimmed && !prevTrimmed.endsWith(';') && !prevTrimmed.endsWith('{') && !prevTrimmed.endsWith('(') && !prevTrimmed.endsWith('[') && !prevTrimmed.endsWith(',') && !prevTrimmed.endsWith('}')) {
          if (!prevTrimmed.startsWith('//') && !prevTrimmed.startsWith('*')) {
            errors.push(enrichError({
              line: i + 1, col: 1, type: 'potential-error',
              message: 'Possible missing semicolon before IIFE \u2014 can cause "is not a function" error',
              severity: 'MEDIUM', confidence: '70%'
            }, ext));
          }
        }
      }
    }
    return errors;
  },

  '.jsx': (n, c, l, e) => VALIDATION_HANDLERS['.js'](n, c, l, '.jsx'),
  '.mjs': (n, c, l, e) => VALIDATION_HANDLERS['.js'](n, c, l, '.mjs'),
  '.cjs': (n, c, l, e) => VALIDATION_HANDLERS['.js'](n, c, l, '.cjs'),

  '.ts': (name, content, lines, ext) => {
    const errors = [];
    try {
      new Function(content
        .replace(/:(\s*)\w+(<[^>]*>)?(\s*)(=?)/g, '$1$4')
        .replace(/\bas\s+\w+/g, '')
        .replace(/\binterface\s+\w+[\s\S]*?\{[\s\S]*?\}/g, '')
        .replace(/\btype\s+\w+\s*=/g, 'const _type_ =')
      );
    } catch (e) {
      if (e instanceof SyntaxError) {
        const msg = String(e.message || '');
        const m = msg.match(/(\d+)/);
        errors.push(enrichError({
          line: m ? parseInt(m[1]) : 1, col: 1, type: 'syntax-error',
          message: 'TS parse: ' + msg.substring(0, 150),
          severity: 'HIGH', confidence: '90%'
        }, ext));
      }
    }
    return errors;
  },

  '.tsx': (n, c, l, e) => VALIDATION_HANDLERS['.ts'](n, c, l, '.tsx'),
  '.mts': (n, c, l, e) => VALIDATION_HANDLERS['.ts'](n, c, l, '.mts'),
  '.cts': (n, c, l, e) => VALIDATION_HANDLERS['.ts'](n, c, l, '.cts'),

  '.html': (name, content, lines, ext) => {
    const errors = [];
    const tagStack = [];
    const tagRe = /<\/?(\w+)[^>]*>/g;
    let match;
    while ((match = tagRe.exec(content)) !== null) {
      const isClosing = match[0].startsWith('</');
      const tagName = match[1].toLowerCase();
      const lineNum = content.substring(0, match.index).split('\n').length;
      if (tagName === 'br' || tagName === 'hr' || tagName === 'img' || tagName === 'input' ||
          tagName === 'meta' || tagName === 'link' || tagName === 'area' || tagName === 'base' ||
          tagName === 'col' || tagName === 'embed' || tagName === 'source' || tagName === 'track' ||
          tagName === 'wbr') continue;
      if (!isClosing) {
        tagStack.push({ tag: tagName, line: lineNum });
      } else {
        const lastIdx = tagStack.length - 1;
        if (lastIdx >= 0 && tagStack[lastIdx].tag === tagName) {
          tagStack.pop();
        } else {
          errors.push(enrichError({
            line: lineNum, col: 1, type: 'html-error',
            message: `Unmatched closing tag </${tagName}>`,
            severity: 'HIGH', confidence: '100%'
          }, ext));
        }
      }
    }
    for (const t of tagStack) {
      errors.push(enrichError({
        line: t.line, col: 1, type: 'html-error',
        message: `Unclosed tag <${t.tag}>`,
        severity: 'HIGH', confidence: '100%'
      }, ext));
    }
    return errors;
  },

  '.htm': (n, c, l, e) => VALIDATION_HANDLERS['.html'](n, c, l, '.htm'),

  '.css': (name, content, lines, ext) => {
    const errors = [];
    let braceCount = 0;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      else if (content[i] === '}') braceCount--;
    }
    if (braceCount > 0) {
      errors.push(enrichError({
        line: lines.length, col: 1, type: 'css-error',
        message: `Unclosed { \u2014 ${braceCount} brace(s) not closed`,
        severity: 'HIGH', confidence: '100%'
      }, ext));
    } else if (braceCount < 0) {
      errors.push(enrichError({
        line: 1, col: 1, type: 'css-error',
        message: `Too many } \u2014 ${-braceCount} extra closing brace(s)`,
        severity: 'HIGH', confidence: '100%'
      }, ext));
    }
    return errors;
  },

  '.scss': (n, c, l, e) => VALIDATION_HANDLERS['.css'](n, c, l, '.scss'),
  '.less': (n, c, l, e) => VALIDATION_HANDLERS['.css'](n, c, l, '.less'),
  '.sass': (n, c, l, e) => VALIDATION_HANDLERS['.css'](n, c, l, '.sass'),
  '.jsonc': (n, c, l, e) => VALIDATION_HANDLERS['.json'](n, c, l, '.jsonc'),

  '.py': (name, content, lines, ext) => {
    const errors = [];
    let indentStack = [0];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trimStart();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('"""') || trimmed.startsWith("'''")) continue;
      const indent = line.length - trimmed.length;
      if (indent > indentStack[indentStack.length - 1]) {
        indentStack.push(indent);
      } else if (indent < indentStack[indentStack.length - 1]) {
        while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
          indentStack.pop();
        }
        if (indent !== indentStack[indentStack.length - 1] && indent !== 0) {
          errors.push(enrichError({
            line: i + 1, col: indent + 1, type: 'python-error',
            message: `Indentation mismatch: ${indent} spaces, expected ${indentStack[indentStack.length - 1]}`,
            severity: 'HIGH', confidence: '100%'
          }, ext));
        }
      }
    }
    return errors;
  },

  '.php': (name, content, lines, ext) => {
    const errors = [];
    if (!/<\?(php|=)/.test(content.trim())) {
      errors.push(enrichError({ line: 1, col: 1, type: 'php-error', message: 'Missing PHP opening tag <?php', severity: 'HIGH', confidence: '100%' }, ext));
    } else {
      // Phase 1: detect stuck-to-keyword tokens (function1, class2, etc.)
      const phpKwRe = /\b(function|class|if|else|for|foreach|while|switch|case|default|try|catch|return|break|continue|new|print|echo|throw|declare|include|require|namespace|use|extends|implements|interface|trait|abstract|private|public|protected|static|final|const|var)\d+/g;
      let phpm;
      while ((phpm = phpKwRe.exec(content)) !== null) {
        const lineNum = content.substring(0, phpm.index).split('\n').length;
        const lineStart = content.lastIndexOf('\n', phpm.index) + 1;
        const col = phpm.index - lineStart + 1;
        errors.push(enrichError({
          line: lineNum, col: col > 0 ? col : 1,
          type: 'syntax-error',
          message: 'Unexpected token: invalid keyword "' + phpm[0] + '"',
          severity: 'HIGH', confidence: '100%'
        }, ext));
      }

      let inStr = false, strChar = '', braceCount = 0, parenCount = 0;
      let lastBraceLine = 1, lastParenLine = 1;
      for (let i = 0; i < content.length; i++) {
        const ch = content[i];
        const lineNum = content.substring(0, i).split('\n').length;
        if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strChar = ch; continue; }
        if (inStr && ch === strChar) { inStr = false; continue; }
        if (inStr && ch === '\\') { i++; continue; }
        if (!inStr) {
          if (ch === '{') { braceCount++; lastBraceLine = lineNum; }
          else if (ch === '}') { braceCount--; lastBraceLine = lineNum; }
          else if (ch === '(') { parenCount++; lastParenLine = lineNum; }
          else if (ch === ')') { parenCount--; lastParenLine = lineNum; }
        }
      }
      if (braceCount > 0) errors.push(enrichError({ line: lastBraceLine, col: 1, type: 'php-error', message: 'Unclosed { \u2014 ' + braceCount + ' brace(s) not closed', severity: 'HIGH', confidence: '100%' }, ext));
      if (braceCount < 0) errors.push(enrichError({ line: 1, col: 1, type: 'php-error', message: 'Too many } \u2014 ' + (-braceCount) + ' extra closing brace(s)', severity: 'HIGH', confidence: '100%' }, ext));
      if (inStr) errors.push(enrichError({ line: lines.length, col: 1, type: 'php-error', message: 'Unclosed string', severity: 'HIGH', confidence: '100%' }, ext));
      // Missing semicolon detection
      for (let i = 0; i < lines.length; i++) {
        const t = lines[i].trim();
        if (t && !t.endsWith(';') && !t.endsWith('{') && !t.endsWith('}') && !t.endsWith('?>') && !t.startsWith('//') && !t.startsWith('#') && !t.startsWith('<?') && !t.startsWith('/*') && !t.endsWith('*/') && !t.startsWith('*') && !/^(if|else|for|foreach|while|switch|case|default|try|catch|function|class|abstract|private|public|protected|static|return|break|continue|new)\b/.test(t) && !/^\s*$/.test(t) && !/^\s*\/\//.test(t)) {
          errors.push(enrichError({
            line: i + 1, col: t.length + 1, type: 'syntax-error',
            message: 'Missing semicolon at end of statement',
            severity: 'HIGH', confidence: '90%'
          }, ext));
        }
      }
    }
    return errors;
  },

  '.sh': (name, content, lines, ext) => {
    const errors = [];
    let inSingle = false, inDouble = false, inBacktick = false;
    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (ch === "'" && !inDouble && !inBacktick) inSingle = !inSingle;
      else if (ch === '"' && !inSingle && !inBacktick) inDouble = !inDouble;
      else if (ch === '`' && !inSingle && !inDouble) inBacktick = !inBacktick;
    }
    if (inSingle) errors.push(enrichError({ line: lines.length, col: 1, type: 'shell-error', message: 'Unclosed single quote', severity: 'HIGH', confidence: '100%' }, ext));
    if (inDouble) errors.push(enrichError({ line: lines.length, col: 1, type: 'shell-error', message: 'Unclosed double quote', severity: 'HIGH', confidence: '100%' }, ext));
    if (inBacktick) errors.push(enrichError({ line: lines.length, col: 1, type: 'shell-error', message: 'Unclosed backtick', severity: 'HIGH', confidence: '100%' }, ext));
    return errors;
  },

  '.bash': (n, c, l, e) => VALIDATION_HANDLERS['.sh'](n, c, l, '.bash'),

  '.yaml': (name, content, lines, ext) => {
    const errors = [];
    for (let i = 1; i < Math.min(lines.length, 100); i++) {
      if (lines[i].trim() && lines[i].startsWith(' ') && !lines[i-1].trim()) {
        errors.push(enrichError({
          line: i + 1, col: 1, type: 'yaml-error',
          message: 'Indented content after blank line \u2014 possible YAML error',
          severity: 'MEDIUM', confidence: '70%'
        }, ext));
        break;
      }
    }
    return errors;
  },

  '.yml': (n, c, l, e) => VALIDATION_HANDLERS['.yaml'](n, c, l, '.yml'),

  '.bat': (name, content, lines, ext) => {
    const errors = [];
    let inDouble = false;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '"') inDouble = !inDouble;
    }
    if (inDouble) errors.push(enrichError({ line: lines.length, col: 1, type: 'shell-error', message: 'Unclosed double quote', severity: 'HIGH', confidence: '100%' }, ext));
    return errors;
  },

  '.cmd': (n, c, l, e) => VALIDATION_HANDLERS['.bat'](n, c, l, '.cmd'),

  '.ps1': (name, content, lines, ext) => {
    const errors = [];
    let inStr = false, strChar = '', braceCount = 0, parenCount = 0, bracketCount = 0;
    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strChar = ch; continue; }
      if (inStr && ch === strChar) { inStr = false; continue; }
      if (inStr && ch === '`') { i++; continue; }
      if (!inStr) {
        if (ch === '{') braceCount++;
        else if (ch === '}') braceCount--;
        else if (ch === '(') parenCount++;
        else if (ch === ')') parenCount--;
        else if (ch === '[') bracketCount++;
        else if (ch === ']') bracketCount--;
      }
    }
    if (braceCount !== 0) errors.push(enrichError({ line: 1, col: 1, type: 'syntax-error', message: (braceCount > 0 ? `Unclosed { \u2014 ${braceCount} not closed` : `Too many } \u2014 ${-braceCount} extra`), severity: 'HIGH', confidence: '100%' }, ext));
    if (parenCount !== 0) errors.push(enrichError({ line: 1, col: 1, type: 'syntax-error', message: (parenCount > 0 ? `Unclosed ( \u2014 ${parenCount} not closed` : `Too many ) \u2014 ${-parenCount} extra`), severity: 'HIGH', confidence: '100%' }, ext));
    if (bracketCount !== 0) errors.push(enrichError({ line: 1, col: 1, type: 'syntax-error', message: (bracketCount > 0 ? `Unclosed [ \u2014 ${bracketCount} not closed` : `Too many ] \u2014 ${-bracketCount} extra`), severity: 'HIGH', confidence: '100%' }, ext));
    if (inStr) errors.push(enrichError({ line: lines.length, col: 1, type: 'syntax-error', message: 'Unclosed string', severity: 'HIGH', confidence: '100%' }, ext));
    return errors;
  },

  '.sql': (name, content, lines, ext) => {
    const errors = [];
    let inStr = false, strChar = '', parenCount = 0;
    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strChar = ch; continue; }
      if (inStr && ch === strChar) { inStr = false; continue; }
      if (inStr && ch === '\\') { i++; continue; }
      if (!inStr) {
        if (ch === '(') parenCount++;
        else if (ch === ')') parenCount--;
      }
    }
    if (parenCount > 0) errors.push(enrichError({ line: lines.length, col: 1, type: 'syntax-error', message: `Unclosed ( \u2014 ${parenCount} not closed`, severity: 'HIGH', confidence: '100%' }, ext));
    if (parenCount < 0) errors.push(enrichError({ line: 1, col: 1, type: 'syntax-error', message: `Too many ) \u2014 ${-parenCount} extra`, severity: 'HIGH', confidence: '100%' }, ext));
    if (inStr) errors.push(enrichError({ line: lines.length, col: 1, type: 'syntax-error', message: 'Unclosed string', severity: 'HIGH', confidence: '100%' }, ext));
    return errors;
  },

  '.xml': (name, content, lines, ext) => {
    const errors = [];
    const tagStack = [];
    const tagRe = /<\/?(\w+)[^>]*\/?>/g;
    let match;
    while ((match = tagRe.exec(content)) !== null) {
      if (match[0].endsWith('/>')) continue;
      const isClosing = match[0].startsWith('</');
      const tagName = match[1].toLowerCase();
      const lineNum = content.substring(0, match.index).split('\n').length;
      if (!isClosing) {
        tagStack.push({ tag: tagName, line: lineNum });
      } else {
        const lastIdx = tagStack.length - 1;
        if (lastIdx >= 0 && tagStack[lastIdx].tag === tagName) {
          tagStack.pop();
        } else {
          errors.push(enrichError({
            line: lineNum, col: 1, type: 'syntax-error',
            message: `Unmatched closing tag </${tagName}>`,
            severity: 'HIGH', confidence: '100%'
          }, ext));
        }
      }
    }
    for (const t of tagStack) {
      errors.push(enrichError({
        line: t.line, col: 1, type: 'syntax-error',
        message: `Unclosed tag <${t.tag}>`,
        severity: 'HIGH', confidence: '100%'
      }, ext));
    }
    return errors;
  },

  '.toml': (name, content, lines, ext) => {
    const errors = [];
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('[')) continue;
      if (!/^[\w.\-]+\s*=\s*/.test(trimmed)) {
        errors.push(enrichError({
          line: i + 1, col: 1, type: 'syntax-error',
          message: 'Invalid TOML format: expected key = value',
          severity: 'MEDIUM', confidence: '70%'
        }, ext));
      }
    }
    return errors;
  },

  '.ini': (name, content, lines, ext) => {
    const errors = [];
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('#') || trimmed.startsWith('[')) continue;
      if (!/^[\w.\-]+\s*[:=]\s*/.test(trimmed)) {
        errors.push(enrichError({
          line: i + 1, col: 1, type: 'syntax-error',
          message: 'Invalid INI format: expected key = value',
          severity: 'MEDIUM', confidence: '70%'
        }, ext));
      }
    }
    return errors;
  },

  '.cfg': (n, c, l, e) => VALIDATION_HANDLERS['.ini'](n, c, l, '.cfg'),

  '.vue': (name, content, lines, ext) => {
    const errors = [];
    const tmplMatch = content.match(/<template>([\s\S]*)<\/template>/i);
    if (tmplMatch) {
      errors.push(...VALIDATION_HANDLERS['.html'](name, tmplMatch[1], tmplMatch[1].split('\n'), '.html'));
    }
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*)<\/script>/i);
    if (scriptMatch && scriptMatch[1].trim()) {
      errors.push(...VALIDATION_HANDLERS['.js'](name, scriptMatch[1], scriptMatch[1].split('\n'), '.js'));
    }
    return errors;
  },

  '.svelte': (n, c, l, e) => VALIDATION_HANDLERS['.vue'](n, c, l, '.svelte'),

  '.md': (name, content, lines, ext) => {
    const errors = [];
    const fenceRe = /^```/gm;
    let count = 0;
    while (fenceRe.exec(content) !== null) count++;
    if (count % 2 !== 0) {
      const lineNum = content.substring(0, content.lastIndexOf('```')).split('\n').length + 1;
      errors.push(enrichError({
        line: lineNum, col: 1, type: 'syntax-error',
        message: 'Unclosed code block (odd number of ``` fences)',
        severity: 'MEDIUM', confidence: '80%'
      }, ext));
    }
    return errors;
  },

  '.mdx': (n, c, l, e) => VALIDATION_HANDLERS['.md'](n, c, l, '.mdx'),

  '.env': (name, content, lines, ext) => {
    const errors = [];
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
      if (!/^[\w.]+(\s*=\s*|:\s*)/.test(trimmed)) {
        errors.push(enrichError({
          line: i + 1, col: 1, type: 'syntax-error',
          message: 'Invalid .env format: expected KEY=value',
          severity: 'MEDIUM', confidence: '70%'
        }, ext));
      }
    }
    return errors;
  },

  _generic: (name, content, lines, ext) => {
    const errors = [];
    let inStr = false, strChar = '', braceCount = 0, parenCount = 0, bracketCount = 0;
    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (!inStr && (ch === '"' || ch === "'")) { inStr = true; strChar = ch; continue; }
      if (inStr && ch === strChar) { inStr = false; continue; }
      if (inStr && ch === '\\') { i++; continue; }
      if (!inStr) {
        if (ch === '{') braceCount++;
        else if (ch === '}') braceCount--;
        else if (ch === '(') parenCount++;
        else if (ch === ')') parenCount--;
        else if (ch === '[') bracketCount++;
        else if (ch === ']') bracketCount--;
      }
    }
    if (braceCount > 0) errors.push(enrichError({ line: lines.length, col: 1, type: 'syntax-error', message: `Unclosed { \u2014 ${braceCount} not closed`, severity: 'HIGH', confidence: '100%' }, ext));
    if (braceCount < 0) errors.push(enrichError({ line: 1, col: 1, type: 'syntax-error', message: `Too many } \u2014 ${-braceCount} extra`, severity: 'HIGH', confidence: '100%' }, ext));
    if (parenCount > 0) errors.push(enrichError({ line: lines.length, col: 1, type: 'syntax-error', message: `Unclosed ( \u2014 ${parenCount} not closed`, severity: 'HIGH', confidence: '100%' }, ext));
    if (parenCount < 0) errors.push(enrichError({ line: 1, col: 1, type: 'syntax-error', message: `Too many ) \u2014 ${-parenCount} extra`, severity: 'HIGH', confidence: '100%' }, ext));
    if (bracketCount > 0) errors.push(enrichError({ line: lines.length, col: 1, type: 'syntax-error', message: `Unclosed [ \u2014 ${bracketCount} not closed`, severity: 'HIGH', confidence: '100%' }, ext));
    if (bracketCount < 0) errors.push(enrichError({ line: 1, col: 1, type: 'syntax-error', message: `Too many ] \u2014 ${-bracketCount} extra`, severity: 'HIGH', confidence: '100%' }, ext));
    if (inStr) errors.push(enrichError({ line: lines.length, col: 1, type: 'syntax-error', message: 'Unclosed string', severity: 'HIGH', confidence: '100%' }, ext));
    return errors;
  },
};

function validateFileSyntax(name, content) {
  const errors = [];
  const ext = name.includes('.') ? '.' + name.split('.').pop().toLowerCase() : '';
  const lines = content.split('\n');

  if (!content || content.length < 3) return errors;

  const handler = VALIDATION_HANDLERS[ext] || VALIDATION_HANDLERS._generic;
  try {
    return handler(name, content, lines, ext);
  } catch (e) {
    errors.push(enrichError({
      line: 1, col: 1, type: 'validator-error',
      message: 'Validator internal: ' + String(e.message || '').substring(0, 100),
      severity: 'HIGH', confidence: '100%'
    }, ext));
    return errors;
  }
}

/** Scan semua file dengan validasi sintaks nyata */
async function validateAllFiles(dirPath) {
  const results = {};
  let scannedCount = 0;
  let errorCount = 0;

  async function walk(path) {
    const entries = await readFolder(path);
    for (const e of entries) {
      if (isSkippableDir(e.name)) continue;
      const full = path + '/' + e.name;
      if (e.type === 'directory') {
        await walk(full);
      } else if (isCodeFile(e.name)) {
        const content = await readFileContent(full);
        if (!content || content.length < 3) continue;
        scannedCount++;
        const rawErrors = validateFileSyntax(e.name, content);
        const errors = deduplicateErrors(rawErrors);
        if (errors.length > 0) {
          // Simpan lines untuk code snippet rendering
          results[full] = { lines: content.split('\n'), errors };
          errorCount += errors.length;
        }
      }
    }
  }
  await walk(dirPath);
  results._meta = { scannedCount, errorCount };
  return results;
}

// ─── 4. Call Stack / Dependency Trace ───────────────────────────────────────

/** Parse import/require statements dari konten JS/TS */
function parseImports(code, filePath) {
  const imports = [];
  const lines = code.split('\n');

  // Static imports: import X from 'path'
  const importRe = /import\s+(?:\{[^}]*\}|[^;{]+)\s+from\s+['"]([^'"]+)['"]\s*;?/g;
  let m;
  while ((m = importRe.exec(code)) !== null) {
    imports.push({ type: 'import', source: filePath, target: m[1], raw: m[0].substring(0, 80) });
  }

  // require()
  const requireRe = /(?:const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = requireRe.exec(code)) !== null) {
    imports.push({ type: 'require', source: filePath, target: m[1], raw: m[0].substring(0, 80) });
  }

  // Dynamic import()
  const dynamicRe = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = dynamicRe.exec(code)) !== null) {
    imports.push({ type: 'dynamic-import', source: filePath, target: m[1], raw: m[0].substring(0, 80) });
  }

  return imports;
}

/** Ekstrak definisi fungsi/class dari file */
function parseDefinitions(code) {
  const defs = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Function declaration
    let fn = line.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/);
    if (fn) { defs.push({ type: 'function', name: fn[1], line: i + 1 }); continue; }

    // Arrow function assigned to const/let/var
    fn = line.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/);
    if (fn) { defs.push({ type: 'arrow-fn', name: fn[1], line: i + 1 }); continue; }

    // Class
    let cls = line.match(/^(?:export\s+)?class\s+(\w+)/);
    if (cls) { defs.push({ type: 'class', name: cls[1], line: i + 1 }); continue; }

    // Method in class
    let method = line.match(/^\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/);
    if (method && !/^(if|for|while|switch|catch|return|function|const|let|var|class)\b/.test(method[1])) {
      defs.push({ type: 'method', name: method[1], line: i + 1 });
    }
  }

  return defs;
}

/** Resolve relative import path ke path absolut */
function resolveImportPath(importerPath, importTarget) {
  if (importTarget.startsWith('.') || importTarget.startsWith('..')) {
    const baseDir = importerPath.includes('/') ? importerPath.substring(0, importerPath.lastIndexOf('/')) : '';
    const parts = importTarget.split('/');
    const resolved = [];
    for (const p of (baseDir ? baseDir.split('/') : [])) resolved.push(p);
    for (const p of parts) {
      if (p === '.') continue;
      if (p === '..') { if (resolved.length > 0) resolved.pop(); }
      else resolved.push(p);
    }
    return resolved.join('/');
  }
  return null; // external package
}

/** Trace call chain dari file — cari import + definisi */
async function traceFile(filePath, depth = 0, maxDepth = 3, visited = new Set()) {
  if (depth > maxDepth || visited.has(filePath)) return null;
  visited.add(filePath);

  const content = await readFileContent(filePath);
  if (!content) return null;

  const defs = parseDefinitions(content);
  const imports = parseImports(content, filePath);

  // Resolve imports recursively
  const resolvedImports = [];
  for (const imp of imports) {
    const resolvedPath = resolveImportPath(filePath, imp.target);
    if (resolvedPath) {
      const fullPath = resolvedPath.endsWith('.js') || resolvedPath.endsWith('.ts') || resolvedPath.endsWith('.jsx') || resolvedPath.endsWith('.tsx')
        ? resolvedPath : resolvedPath + '.js';
      const child = await traceFile(fullPath, depth + 1, maxDepth, visited);
      resolvedImports.push({ ...imp, resolvedPath: fullPath, child });
    } else {
      resolvedImports.push({ ...imp, resolvedPath: null, child: null });
    }
  }

  return { filePath, defs, imports: resolvedImports, depth };
}

/** Collect dependencies flat dari hasil trace */
function flattenDeps(trace, depth = 0) {
  if (!trace) return [];
  const result = [{ filePath: trace.filePath, depth, defs: trace.defs, importCount: trace.imports.length }];
  for (const imp of trace.imports) {
    if (imp.child) {
      result.push(...flattenDeps(imp.child, depth + 1));
    }
  }
  return result;
}

// ─── 5. Static Analysis ──────────────────────────────────────────────────────

/** Analisis statis — deteksi potensi masalah dalam kode */
function staticAnalyzeCode(name, code) {
  const issues = [];
  const lines = code.split('\n');

  // Skip binary/non-code files
  if (!code || code.length < 10) return issues;

  const ext = name.includes('.') ? '.' + name.split('.').pop().toLowerCase() : '';
  // Skip static analysis untuk file data (SQL, CSV, TSV, JSON, YAML, dll)
  const dataExts = ['.sql','.csv','.tsv','.json','.jsonc','.yaml','.yml','.xml','.ini','.cfg','.toml','.md','.mdx'];
  if (dataExts.includes(ext)) return issues;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ln = i + 1;

    // console.log left in code
    if (/console\.(log|debug|dir)\s*\(/.test(line) && !/\/\/\s*(todo|fixme|xxx)/i.test(line)) {
      issues.push({ line: ln, severity: 'info', code: 'console-log', message: 'Console log left in production code' });
    }

    // TODO / FIXME / XXX
    if (/\/\/\s*(todo|fixme|xxx)/i.test(line)) {
      const label = line.match(/\/\/\s*(todo|fixme|xxx)[:\s]*(.*)/i);
      issues.push({ line: ln, severity: 'warning', code: 'todo', message: `${(label ? label[1].toUpperCase() : 'TODO')}: ${label ? label[2] : ''}` });
    }

    // Very long line
    if (line.length > 200 && line.trim()) {
      issues.push({ line: ln, severity: 'warning', code: 'long-line', message: `Line too long (${line.length} chars > 200)` });
    }

    // Unused catch variable pattern: catch(e){} or catch(err){}
    if (/catch\s*\(\s*\w+\s*\)\s*\{\s*\}\s*$/.test(line.trim())) {
      issues.push({ line: ln, severity: 'warning', code: 'empty-catch', message: 'Empty catch block — error swallowed' });
    }

    // // @ts-ignore
    if (/\/\/\s*@ts-ignore/.test(line)) {
      issues.push({ line: ln, severity: 'info', code: 'ts-ignore', message: '@ts-ignore suppression' });
    }

    // any type (TS)
    if (/:\s*any\b/.test(line) && /\.(ts|tsx)$/i.test(ext)) {
      issues.push({ line: ln, severity: 'info', code: 'any-type', message: '`any` type used — consider typing' });
    }

    // Magic numbers (exclude 0, 1, -1, 100)
    const magicNum = line.match(/(?<![.\w])[2-9]\d{0,2}(?![.\w])/);
    if (magicNum && !/^\s*\/\//.test(line) && !/['"`]/.test(line) && !/\/\*/.test(line)) {
      const val = parseInt(magicNum[0]);
      if (val > 1 && val !== 100 && val !== 200 && val !== 300 && val !== 400 && val !== 404 && val !== 500) {
        // Only flag if it looks like a magic number (not array index, not simple math)
        if (!/\[\d+\]/.test(line) && !/^\s*\d+\s*$/.test(line.trim())) {
          issues.push({ line: ln, severity: 'info', code: 'magic-number', message: `Magic number: ${val}` });
        }
      }
    }

    // Nested callback > 3 levels (callback hell indicator)
    if (/>\s*function\s*\(/.test(line) || /\s*=>\s*\{[^}]*=>/.test(line)) {
      if (i > 0 && /function|=>/.test(lines[i - 1])) {
        issues.push({ line: ln, severity: 'warning', code: 'callback-hell', message: 'Deeply nested callback' });
      }
    }
  }

  // Global checks
  // Count function length
  const fnMatches = code.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)[\s\S]*?^}/gm);
  if (fnMatches) {
    for (const fn of fnMatches) {
      const fnLines = fn.split('\n').length;
      const fnName = fn.match(/function\s+(\w+)/);
      if (fnLines > 100 && fnName) {
        const lineNum = code.substring(0, code.indexOf(fn)).split('\n').length;
        issues.push({ line: lineNum, severity: 'warning', code: 'long-function', message: `Function "${fnName[1]}" is ${fnLines} lines (consider refactoring)` });
      }
    }
  }

  // Undeclared variable references (potential ReferenceError)
  if (/\.(js|jsx|mjs|cjs|ts|tsx|mts|cts)$/i.test(ext)) {
    // Collect all declared identifiers
    const declared = new Set();
    // var/let/const
    const varRe = /\b(?:var|let|const)\s+(\w+)\s*[=;]/g;
    let vm;
    while ((vm = varRe.exec(code)) !== null) declared.add(vm[1]);
    // Function declarations
    const fnDecRe = /\bfunction\s+(\w+)\s*\(/g;
    while ((vm = fnDecRe.exec(code)) !== null) declared.add(vm[1]);
    // Function parameters
    const paramRe = /(?:function|=>)\s*\(?([^)]*)\)?\s*[={]/g;
    while ((vm = paramRe.exec(code)) !== null) {
      vm[1].split(',').forEach(p => {
        const pn = p.trim().split('=')[0].trim().split(/\s+/).pop();
        if (pn && !/^\d/.test(pn)) declared.add(pn);
      });
    }
    // catch(e) parameters
    const catchRe = /catch\s*\(\s*(\w+)\s*\)/g;
    while ((vm = catchRe.exec(code)) !== null) declared.add(vm[1]);
    // Import bindings (default, named, namespace)
    const importRe = /import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from/g;
    while ((vm = importRe.exec(code)) !== null) {
      if (vm[1]) vm[1].split(',').forEach(s => { const n = s.trim().split(/\s+as\s+/).pop().trim(); if (n) declared.add(n); });
      if (vm[2]) declared.add(vm[2]);
      if (vm[3]) declared.add(vm[3]);
    }

    // Common globals to skip
    const globals = new Set([
      'console', 'window', 'document', 'global', 'process', 'Buffer',
      'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
      'require', 'module', 'exports', '__dirname', '__filename',
      'fetch', 'Promise', 'JSON', 'Math', 'Date', 'Array', 'Object',
      'String', 'Number', 'Boolean', 'RegExp', 'Error', 'Map', 'Set',
      'WeakMap', 'WeakSet', 'Symbol', 'Proxy', 'Reflect',
      'undefined', 'null', 'true', 'false', 'this', 'arguments',
      'isNaN', 'isFinite', 'parseInt', 'parseFloat', 'encodeURI',
      'encodeURIComponent', 'decodeURI', 'decodeURIComponent',
      'Infinity', 'NaN',
    ]);

    // Check return statements for undeclared identifiers
    // return x; or return x (ASI), or return x }
    const returnRe = /\breturn\s+(\w+)(?:\s*[;}]|\s*$)/gm;
    let rm;
    while ((rm = returnRe.exec(code)) !== null) {
      const varName = rm[1];
      const lineNum = code.substring(0, rm.index).split('\n').length;
      if (!declared.has(varName) && !globals.has(varName)) {
        issues.push({
          line: lineNum, severity: 'warning', code: 'undeclared-var',
          message: `Potential ReferenceError: "${varName}" is not declared in this scope`
        });
      }
    }

    // Check assignments to undeclared variables (e.g. reject(err) where reject is not declared)
    // Simple case: identifier = ... at start of statement (not var/let/const)
    const assignRe = /^(\s*)(\w+)\s*=\s*/gm;
    while ((rm = assignRe.exec(code)) !== null) {
      const varName = rm[2];
      // Skip common patterns: this.x, exports.x, module.x
      if (rm.input.substring(0, rm.index).match(/(this|exports|module|global)\.\s*$/)) continue;
      const lineNum = code.substring(0, rm.index).split('\n').length;
      if (!declared.has(varName) && !globals.has(varName)) {
        issues.push({
          line: lineNum, severity: 'warning', code: 'undeclared-var',
          message: `Potential ReferenceError: "${varName}" is assigned but not declared`
        });
      }
    }
  }

  // PHP undeclared variable references
  if (/\.(php)$/i.test(ext)) {
    const declared = new Set();
    function addPhpVar(name) {
      const clean = name.replace(/^&/, '');
      if (clean && clean.startsWith('$')) declared.add(clean);
    }
    // $var = ... (assignment)
    const assignRe = /(\$\w+)\s*=/g;
    let vm;
    while ((vm = assignRe.exec(code)) !== null) addPhpVar(vm[1]);
    // function name($param, &$ref)
    const funcRe = /function\s+\w+\s*\(([^)]*)\)/g;
    while ((vm = funcRe.exec(code)) !== null) {
      vm[1].split(',').forEach(p => {
        const trimmed = p.trim();
        if (trimmed.startsWith('$')) addPhpVar(trimmed.split('=')[0].trim());
      });
    }
    // catch(Exception $e)
    const catchRe = /catch\s*\([^)]*?(\$\w+)\s*\)/g;
    while ((vm = catchRe.exec(code)) !== null) addPhpVar(vm[1]);

    // PHP superglobals
    const phpGlobals = new Set([
      '$_GET', '$_POST', '$_REQUEST', '$_SERVER', '$_SESSION', '$_COOKIE',
      '$_FILES', '$_ENV', '$GLOBALS', '$this',
    ]);

    // Check PHP variable usage: $var NOT preceded by -> and NOT followed by =
    const usageRe = /(\$\w+)\b(?!\s*=)/g;
    while ((vm = usageRe.exec(code)) !== null) {
      const varName = vm[1];
      if (declared.has(varName) || phpGlobals.has(varName)) continue;
      // Skip if inside a function parameter list
      const ctxBefore = code.substring(Math.max(0, vm.index - 60), vm.index);
      if (/function\s+\w+\s*\([^)]*$/.test(ctxBefore)) continue;
      const lineNum = code.substring(0, vm.index).split('\n').length;
      issues.push({
        line: lineNum, severity: 'warning', code: 'undeclared-var',
        message: `Potential PHP Warning: "${varName}" is not assigned in this scope`
      });
    }
  }

  return issues;
}

/** Scan semua file kode untuk static analysis */
async function staticScanAll(dirPath) {
  const results = { fileIssues: {}, summary: { errors: 0, warnings: 0, info: 0 } };
  async function walk(path) {
    const entries = await readFolder(path);
    for (const e of entries) {
      if (isSkippableDir(e.name)) continue;
      const full = path + '/' + e.name;
      if (e.type === 'directory') {
        await walk(full);
      } else if (isCodeFile(e.name)) {
        const content = await readFileContent(full);
        if (!content) continue;
        const issues = staticAnalyzeCode(e.name, content);
        if (issues.length > 0) {
          results.fileIssues[full] = issues;
          for (const iss of issues) {
            if (iss.severity === 'error') results.summary.errors++;
            else if (iss.severity === 'warning') results.summary.warnings++;
            else results.summary.info++;
          }
        }
      }
    }
  }
  await walk(dirPath);
  return results;
}

// ─── 6. Checker Tools ───────────────────────────────────────────────────────

/** Metric: hitung baris kode efektif per file */
function countEffectiveLines(code) {
  const lines = code.split('\n');
  let effective = 0;
  let inBlockComment = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (inBlockComment) {
      if (trimmed.includes('*/')) { inBlockComment = false; }
      continue;
    }
    if (trimmed.startsWith('//')) continue;
    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) { inBlockComment = true; }
      continue;
    }
    effective++;
  }
  return effective;
}

/** Metric: hitung cyclomatic complexity (sederhana) */
function estimateComplexity(code) {
  const decisionPoints = (code.match(/\b(if|else\s+if|for|while|case\s+|catch\s*\(|&&|\|\|)\b/g) || []).length;
  return Math.max(1, decisionPoints + 1);
}

/** Checker — hitung metrik kualitas untuk semua file */
async function checkMetrics(dirPath) {
  const metrics = { files: [], totals: { files: 0, lines: 0, effectiveLines: 0, complexity: 0, imports: 0, issues: 0 } };

  async function walk(path) {
    const entries = await readFolder(path);
    for (const e of entries) {
      if (isSkippableDir(e.name)) continue;
      const full = path + '/' + e.name;
      if (e.type === 'directory') {
        await walk(full);
      } else if (isCodeFile(e.name)) {
        const content = await readFileContent(full);
        if (!content) continue;
        const totalLines = content.split('\n').length;
        const effLines = countEffectiveLines(content);
        const complexity = estimateComplexity(content);
        const importCount = parseImports(content, full).length;
        const issueCount = staticAnalyzeCode(e.name, content).length;
        const rel = full.replace(dirPath + '/', '');

        metrics.files.push({
          path: rel,
          lines: totalLines,
          effective: effLines,
          complexity,
          imports: importCount,
          issues: issueCount,
        });
        metrics.totals.files++;
        metrics.totals.lines += totalLines;
        metrics.totals.effectiveLines += effLines;
        metrics.totals.complexity += complexity;
        metrics.totals.imports += importCount;
        metrics.totals.issues += issueCount;
      }
    }
  }
  await walk(dirPath);

  // Sort by complexity descending
  metrics.files.sort((a, b) => b.complexity - a.complexity || b.lines - a.lines);
  return metrics;
}

// ─── 7. Logic Flow Compare ──────────────────────────────────────────────────

/** Ekstrak flow: urutan definisi, export, conditional branches */
function extractFlow(code) {
  const flow = [];
  const lines = code.split('\n');
  let inFunction = null;
  let funcBodyLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ln = i + 1;

    // Export
    if (/^(export\s+default\s+|export\s+)/.test(line.trim())) {
      flow.push({ line: ln, type: 'export', detail: line.trim().substring(0, 80) });
    }

    // Function/class definition
    let def = line.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
    if (def) {
      flow.push({ line: ln, type: 'function-def', detail: def[1] });
      inFunction = def[1];
      funcBodyLines = 0;
      continue;
    }

    let cls = line.match(/^(?:export\s+)?class\s+(\w+)/);
    if (cls) {
      flow.push({ line: ln, type: 'class-def', detail: cls[1] });
      continue;
    }

    // Assignment of function to variable
    let fnAssign = line.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/);
    if (fnAssign) {
      flow.push({ line: ln, type: 'arrow-fn', detail: fnAssign[1] });
      inFunction = fnAssign[1];
      funcBodyLines = 0;
      continue;
    }

    // Conditional branches
    if (/\b(if\s*\(|else if\s*\(|switch\s*\()/.test(line) && !/^\s*\/\//.test(line)) {
      flow.push({ line: ln, type: 'conditional', detail: line.trim().substring(0, 60) });
    }

    // Loop
    if (/\b(for\s*\(|while\s*\(|do\s*\{)/.test(line) && !/^\s*\/\//.test(line)) {
      flow.push({ line: ln, type: 'loop', detail: line.trim().substring(0, 60) });
    }

    // Return
    if (/^\s*return\b/.test(line) && !/^\s*\/\//.test(line)) {
      flow.push({ line: ln, type: 'return', detail: line.trim().substring(0, 80) });
    }

    // Throw
    if (/^\s*throw\b/.test(line)) {
      flow.push({ line: ln, type: 'throw', detail: line.trim().substring(0, 80) });
    }

    // Try-catch
    if (/^\s*try\s*\{/.test(line)) {
      flow.push({ line: ln, type: 'try', detail: 'try {' });
    }
    if (/^\s*\}\s*catch\s*\(/.test(line)) {
      flow.push({ line: ln, type: 'catch', detail: line.trim().substring(0, 60) });
    }

    // Promise .then().catch()
    if (/\.then\s*\(/.test(line) && !/^\s*\/\//.test(line)) {
      flow.push({ line: ln, type: 'promise-then', detail: line.trim().substring(0, 60) });
    }
    if (/\.catch\s*\(/.test(line) && !/^\s*\/\//.test(line)) {
      flow.push({ line: ln, type: 'promise-catch', detail: line.trim().substring(0, 60) });
    }

    // Await
    if (/\bawait\b/.test(line) && !/^\s*\/\//.test(line)) {
      flow.push({ line: ln, type: 'await', detail: line.trim().substring(0, 80) });
    }
  }

  return flow;
}

/** Bandingkan flow antar dua file */
function compareFlow(flowA, flowB) {
  // Group by type
  const groupByType = (flow) => {
    const groups = {};
    for (const f of flow) {
      if (!groups[f.type]) groups[f.type] = [];
      groups[f.type].push(f);
    }
    return groups;
  };

  const gA = groupByType(flowA);
  const gB = groupByType(flowB);
  const allTypes = new Set([...Object.keys(gA), ...Object.keys(gB)]);

  const comparison = [];
  for (const type of allTypes) {
    const countA = gA[type] ? gA[type].length : 0;
    const countB = gB[type] ? gB[type].length : 0;
    comparison.push({ type, countA, countB, diff: countB - countA });
  }
  return comparison;
}

// ─── 8. RAG Engine ──────────────────────────────────────────────────────────

/** Chunk file content menjadi segmen-segmen */
function chunkContent(content, filePath, maxChunkSize = 1500) {
  const lines = content.split('\n');
  const chunks = [];
  let current = [];
  let currentSize = 0;

  function flush() {
    if (current.length === 0) return;
    const text = current.join('\n').trim();
    if (text) {
      chunks.push({ text, lines: current, filePath });
    }
    current = [];
    currentSize = 0;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '' && currentSize > 0) { flush(); continue; }
    if (/^\s*(async\s+)?(function|class|const\s+\w+\s*=\s*\(|export\s+default|export\s+function|export\s+class)\b/.test(line) && currentSize > 0) { flush(); }
    current.push(line);
    currentSize += line.length + 1;
    if (currentSize >= maxChunkSize) { flush(); }
  }
  flush();
  return chunks;
}

function tokenize(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9_]/g, ' ').split(/\s+/).filter(Boolean);
}

function termFreq(tokens) {
  const tf = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  const len = tokens.length || 1;
  for (const k in tf) tf[k] /= len;
  return tf;
}

function buildIndex(chunks) {
  const docCount = chunks.length;
  const df = {};
  const tokenizedDocs = chunks.map((chunk, idx) => {
    const tokens = tokenize(chunk.text);
    const unique = new Set(tokens);
    for (const t of unique) df[t] = (df[t] || 0) + 1;
    return { idx, tokens, tf: termFreq(tokens) };
  });
  const idf = {};
  for (const t in df) idf[t] = Math.log((docCount + 1) / (df[t] + 1)) + 1;
  return { chunks, tokenizedDocs, idf, docCount };
}

function retrieve(query, index, topK = 5) {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const qTf = termFreq(qTokens);
  const scores = [];
  for (const doc of index.tokenizedDocs) {
    let score = 0;
    for (const t in qTf) {
      if (index.idf[t]) score += qTf[t] * (doc.tf[t] || 0) * index.idf[t] * index.idf[t];
    }
    if (score > 0) scores.push({ idx: doc.idx, score });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK).map(s => ({ ...index.chunks[s.idx], score: s.score, snippet: index.chunks[s.idx].text.substring(0, 300) }));
}

function formatRagContext(results) {
  if (!results.length) return 'Tidak ada hasil relevan ditemukan.';
  let ctx = 'Konteks dari proyek:\n\n';
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    ctx += `--- ${r.filePath} (relevansi: ${r.score.toFixed(4)}) ---\n`;
    ctx += r.text.substring(0, 2000) + '\n\n';
  }
  return ctx;
}

let _ragCache = { indexedPath: null, index: null, chunks: [] };

async function ensureIndex(dirPath) {
  if (_ragCache.indexedPath === dirPath && _ragCache.index) return _ragCache;
  const all = await scanAll(dirPath);
  const allChunks = [];
  for (const f of all.files) {
    const content = await readFileContent(f.path);
    if (content) allChunks.push(...chunkContent(content, f.path));
  }
  const index = buildIndex(allChunks);
  _ragCache = { indexedPath: dirPath, index, chunks: allChunks };
  return _ragCache;
}

// ─── 9. Output Helpers ──────────────────────────────────────────────────────

function wrapHtml(content) {
  return content;
}

function colorSpan(text, color) {
  return escHtml(text);
}

function boldSpan(text) {
  return escHtml(text);
}

/** Render severity badge */
function sevBadge(severity) {
  return severity.toUpperCase();
}

/** Render code badge */
function codeBadge(code) {
  return escHtml(code);
}

// ─── 10. Main ───────────────────────────────────────────────────────────────

export async function exploring(cmd) {
  try {
    const allArgs = String(cmd._modeArgs || cmd.getArgument?.('args') || '').trim();
    const { cmd: sub, args, raw } = parseArgs(allArgs);
    const Directory = String(cmd.workingDirectory || '').trim().replace(/\\/g, '/').replace(/\/+$/, '');

    switch (sub) {

      // ── help ──────────────────────────────────────────────────────
      case 'help':
      case '--help':
      case '-h':
        cmd.info('=== Exploring Mode — Menu ===');
        
        cmd.output('exploring scan [path]');
        cmd.output('  Scan proyek: file & folder');
        
        cmd.output('exploring search <query> [ext]');
        cmd.output('  Cari file berdasarkan nama');
        
        cmd.output('exploring grep <query> [ext]');
        cmd.output('  Cari teks di dalam file');
        
        cmd.output('exploring read <filepath>');
        cmd.output('  Baca isi file');
        
        cmd.output('exploring errors [dir]');
        cmd.output('  Validasi sintaks: deteksi error nyata (JSON parse, JS syntax, HTML, CSS)');
        
        cmd.output('exploring trace <file>');
        cmd.output('  Trace call chain / dependency graph');
        
        cmd.output('exploring static [dir]');
        cmd.output('  Analisis statis kode tanpa menjalankan');
        
        cmd.output('exploring check [dir]');
        cmd.output('  Checker: metrics, complexity, quality');
        
        cmd.output('exploring compare <f1> <f2>');
        cmd.output('  Bandingkan alur logika antar file');
        
        cmd.output('exploring rag <query>');
        cmd.output('  RAG: chunk -> retrieve -> context AI');
        
        cmd.output('exploring index');
        cmd.output('  Index ulang proyek');
        
        cmd.output('exploring help');
        cmd.output('  Tampilkan menu ini');
        return false;

      // ── default: Project Overview (komprehensif) ─────────────────
      case '': {
        const scanPath = resolvePath(cmd, '');
        cmd.info('🔍  === Project Overview ===');
          const nexaNpm = new NexaNpm();
           await nexaNpm.init();
           const Scanning = nexaNpm.render();
           cmd.output(Scanning);
           cmd.commandRow.hideTime();
           cmd.commandRow.commandEntry.classList.add('block');
        // cmd.output(wrapHtml(colorSpan('⏳  Scanning project + analyzing code...', '#4fc1ff')));
        
        const startAll = Date.now();

        // Jalankan semua analisis paralel
        const [scanResult, metricsResult, errorsResult, staticResult] = await Promise.all([
          scanAll(scanPath),
          checkMetrics(scanPath),
          validateAllFiles(scanPath),
          staticScanAll(scanPath),
        ]);


        const elapsedAll = ((Date.now() - startAll) / 1000).toFixed(1);

        if (scanResult.dirs.length === 0 && scanResult.files.length === 0) {
          cmd.warning('Proyek kosong atau tidak terbaca.');
          return false;
        }

        // ── Summary Dashboard ───────────────────────────────────────
        const { totals } = metricsResult;
        const errFileKeys = Object.keys(errorsResult).filter(k => k !== '_meta');
        let totalErrors = 0;
        const rootCauseCountPerFile = {};

        const summaryTable = new TabelRaw([
          { Metric: 'Folders', Value: String(scanResult.dirs.length) },
          { Metric: 'Files', Value: String(scanResult.files.length) },
          { Metric: 'Size', Value: scanResult.totalSize > 0 ? formatSize(scanResult.totalSize) : '—' },
          { Metric: 'Eff. Lines', Value: `${totals.effectiveLines}/${totals.lines}` },
          { Metric: 'Complexity', Value: String(totals.complexity) + (totals.files > 0 ? ` (avg ${(totals.complexity / totals.files).toFixed(1)})` : '') },
          { Metric: 'Imports', Value: String(totals.imports) },
          { Metric: 'Static Issues', Value: String(staticResult.summary.warnings) },
          { Metric: 'Info Items', Value: String(staticResult.summary.info) },
          { Metric: 'Syntax Errors', Value: String(errFileKeys.length) + ' files' },
        ], {
          border: true,
          headerStyle: 'double',
          showIndex: false,
          columnAlign: { Value: 'right' },
          maxWidth: 80,
        });
        cmd.output(summaryTable.renderHTML());
        

        // ── Topology: tree ──────────────────────────────────────
        // Build tree object from scanResult (dirs + files)
        const scanRoot = {};
        for (const d of scanResult.dirs) {
          const rel = d.replace(scanPath.replace(/\\/g, '/') + '/', '').replace(/\\/g, '/');
          const parts = rel.split('/');
          let node = scanRoot;
          for (const part of parts) {
            if (!node[part]) node[part] = {};
            node = node[part];
          }
        }
        for (const f of scanResult.files) {
          const rel = f.path.replace(scanPath.replace(/\\/g, '/') + '/', '').replace(/\\/g, '/');
          const parts = rel.split('/');
          let node = scanRoot;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!node[parts[i]]) node[parts[i]] = {};
            node = node[parts[i]];
          }
          node[parts[parts.length - 1]] = null;
        }

        function renderTree(node, prefix) {
          const lines = [];
          const keys = Object.keys(node).sort((a, b) => a.localeCompare(b));
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const last = i === keys.length - 1;
            const connector = last ? '\u2514\u2500\u2500 ' : '\u251c\u2500\u2500 ';
            const indent = prefix + (last ? '    ' : '\u2502   ');
            if (node[key] && node[key] !== null) {
              lines.push(prefix + connector + key + '/');
              lines.push(...renderTree(node[key], indent));
            } else {
              lines.push(prefix + connector + escHtml(key));
            }
          }
          return lines;
        }

        if (Object.keys(scanRoot).length > 0) {
          cmd.info('\uD83D\uDCC1  ' + scanPath.replace(/\\/g, '/') + '/');
          cmd.output('<pre style="margin:0;line-height:1.5;font-family:monospace">' + renderTree(scanRoot, '  ').join('\n') + '</pre>');
        }

        // ── File types breakdown ────────────────────────────────────
        const extCounts = {};
        for (const f of scanResult.files) {
          const ext = f.name.includes('.') ? f.name.split('.').pop().toLowerCase() : '(no ext)';
          extCounts[ext] = (extCounts[ext] || 0) + 1;
        }
        const sortedExts = Object.keys(extCounts).sort((a, b) => extCounts[b] - extCounts[a]);

        // ── Helper: render code snippet with caret ──────────────────
        function renderOverviewSnippet(lines, lineNum, colNum) {
          const idx = lineNum - 1;
          if (idx < 0 || idx >= lines.length) return '';
          const before = Math.min(2, idx);
          const after = Math.min(2, lines.length - idx - 1);
          const startLine = idx - before;
          const endLine = idx + after;
          const maxLineNo = endLine + 1;
          const gutterPad = String(maxLineNo).length;
          const snippetLines = [];
          for (let i = startLine; i <= endLine; i++) {
            const lineNo = i + 1;
            const gutter = String(lineNo).padStart(gutterPad) + '│ ';
            if (i === idx) {
              snippetLines.push(gutter + escHtml(lines[i]));
              const caretPos = gutter.length + (colNum || 1) - 1;
              snippetLines.push(' '.repeat(caretPos) + '^');
            } else {
              snippetLines.push(gutter + escHtml(lines[i]));
            }
          }
          return snippetLines.join('\n');
        }

        // ── Data preparation: root causes & counts ──────────────────
        const fileKeys = Object.keys(staticResult.fileIssues);
        if (errFileKeys.length > 0) {
          for (const f of errFileKeys) {
            const entry = errorsResult[f];
            const errs = entry.errors;
            const rel = f.replace(scanPath + '/', '');
            errs.sort((a, b) => a.line - b.line);
            const grouped = [];
            let currentGroup = null;
            for (const r of errs) {
              const et = r.errorType || r.type || 'Syntax Error';
              const msgKey = (r.message || '').replace(/\s*L\d+.*$/, '').trim();
              if (currentGroup && currentGroup.errorType === et && currentGroup.msgKey === msgKey && r.line === currentGroup.lastLine + 1) {
                currentGroup.errors.push(r);
                currentGroup.lastLine = r.line;
              } else {
                currentGroup = { errorType: et, msgKey, errors: [r], lastLine: r.line };
                grouped.push(currentGroup);
              }
            }
            const rootCauses = [];
            for (const group of grouped) { rootCauses.push(group.errors[0]); }
            for (const root of rootCauses) { totalErrors++; }
            rootCauseCountPerFile[rel] = rootCauses.length;
          }
        }

        // ── Data preparation: summary counts ────────────────────────
        let totalWarnings = 0;
        let totalInfo = 0;
        if (fileKeys.length > 0) {
          for (const file of fileKeys) {
            for (const iss of staticResult.fileIssues[file]) {
              if (iss.severity === 'warning') totalWarnings++;
              else if (iss.severity === 'info') totalInfo++;
            }
          }
        }

        // ── Data preparation: affected files set ────────────────────
        const allAffectedSet = new Set();
        if (errFileKeys.length > 0) { for (const f of errFileKeys) { allAffectedSet.add(f.replace(scanPath + '/', '')); } }
        if (fileKeys.length > 0) { for (const f of fileKeys) { allAffectedSet.add(f.replace(scanPath + '/', '')); } }
        const allAffected = [...allAffectedSet].sort();

        // ── Data preparation: lang stats ────────────────────────────
        const langData = {};
        if (errFileKeys.length > 0) {
          const langCounts = {};
          const langErrCounts = {};
            const langMap = {
              '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript',
              '.ts': 'TypeScript', '.tsx': 'TypeScript', '.mts': 'TypeScript', '.cts': 'TypeScript',
            '.html': 'HTML', '.htm': 'HTML', '.css': 'CSS', '.scss': 'CSS', '.less': 'CSS', '.sass': 'CSS',
            '.json': 'JSON', '.jsonc': 'JSON', '.py': 'Python', '.php': 'PHP',
            '.sh': 'Shell', '.bash': 'Shell', '.yaml': 'YAML', '.yml': 'YAML',
            '.xml': 'XML', '.sql': 'SQL', '.vue': 'Vue/Svelte', '.svelte': 'Vue/Svelte',
            '.md': 'Markdown', '.mdx': 'Markdown', '.env': 'ENV',
            '.bat': 'Batch', '.cmd': 'Batch', '.ps1': 'PowerShell', '.toml': 'TOML', '.ini': 'INI', '.cfg': 'INI',
          };
          for (const f of errFileKeys) {
            const ext = f.includes('.') ? '.' + f.split('.').pop().toLowerCase() : '';
            const lang = langMap[ext] || 'Other';
            langCounts[lang] = (langCounts[lang] || 0) + 1;
            langErrCounts[lang] = (langErrCounts[lang] || 0) + (rootCauseCountPerFile[f.replace(scanPath + '/', '')] || errorsResult[f].errors.length);
          }
          for (const lang of Object.keys(langCounts).sort((a, b) => langCounts[b] - langCounts[a])) {
            langData[lang] = { files: langCounts[lang], errors: langErrCounts[lang] };
          }
        }

        // ── Data preparation: affected file issues ──────────────────
        const affectedFileIssues = {};
          for (const rel of allAffected) {
            const fullPath = scanPath + '/' + rel;
            const fileIssues = [];
            if (errorsResult[fullPath]) {
              const rawErrs = errorsResult[fullPath].errors;
              let prevErr = null;
              for (const e of rawErrs) {
                const et = e.errorType || e.type || 'Syntax Error';
                const msgKey = (e.message || '').replace(/L\d+.*$/, '').trim();
                const prevMsgKey = prevErr ? (prevErr.message || '').replace(/L\d+.*$/, '').trim() : '';
              if (!(prevErr && (prevErr.errorType || prevErr.type || 'Syntax Error') === et && prevMsgKey === msgKey && e.line === prevErr.line + 1)) {
                fileIssues.push({ severity: e.severity || 'HIGH', label: et });
                }
                prevErr = e;
              }
            }
            if (staticResult.fileIssues && staticResult.fileIssues[fullPath]) {
              for (const iss of staticResult.fileIssues[fullPath]) {
              fileIssues.push({ severity: (iss.severity || 'info').toUpperCase(), label: iss.code || iss.message.substring(0, 40) });
            }
          }
          affectedFileIssues[rel] = fileIssues;
        }

        // ── Data preparation: priority list ─────────────────────────
          const priorityList = [];
        if (errFileKeys.length > 0 || fileKeys.length > 0) {
          for (const f of errFileKeys) {
            const entry = errorsResult[f];
            const rel = f.replace(scanPath + '/', '');
            const rawErrs = entry.errors;
            let rootCauseCount = 0;
            let prevErr = null;
            let maxConfidence = 0;
            for (const e of rawErrs) {
              const et = e.errorType || e.type || 'Syntax Error';
              const msgKey = (e.message || '').replace(/L\d+.*$/, '').trim();
              const prevMsgKey = prevErr ? (prevErr.message || '').replace(/L\d+.*$/, '').trim() : '';
              if (!(prevErr && (prevErr.errorType || prevErr.type || 'Syntax Error') === et && prevMsgKey === msgKey && e.line === prevErr.line + 1)) rootCauseCount++;
              const confVal = parseInt(String(e.confidence || '0').replace('%', '')) || 0;
              if (confVal > maxConfidence) maxConfidence = confVal;
              prevErr = e;
            }
            const hasHigh = entry.errors.some(e => (e.severity || 'HIGH') === 'HIGH');
            const hasMed = entry.errors.some(e => (e.severity || 'HIGH') === 'MEDIUM');
            const label = hasHigh ? 'HIGH' : (hasMed ? 'MEDIUM' : 'LOW');
            const priority = hasHigh ? 0 : (hasMed ? 1 : 2);
            priorityList.push({ rel, priority, label, detail: rootCauseCount > 0 ? rootCauseCount + ' root cause' + (rootCauseCount > 1 ? 's' : '') : '', confidence: maxConfidence });
          }
          for (const f of fileKeys) {
            const rel = f.replace(scanPath + '/', '');
            if (errFileKeys.includes(f)) continue;
            const warnings = staticResult.fileIssues[f].filter(i => i.severity === 'warning').length;
            const infos = staticResult.fileIssues[f].filter(i => i.severity === 'info').length;
            const detail = [];
            if (warnings > 0) detail.push(warnings + ' warning(s)');
            if (infos > 0) detail.push(infos + ' info item(s)');
            priorityList.push({ rel, priority: warnings > 0 ? 1 : 2, label: warnings > 0 ? 'MEDIUM' : 'LOW', detail: detail.join(', '), confidence: 0 });
          }
          priorityList.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            if (b.confidence !== a.confidence) return b.confidence - a.confidence;
            return 0;
          });
        }

        // ── Data preparation: fixes per file ────────────────────────
        const fixesData = {};
        if (errFileKeys.length > 0) {
          for (const f of errFileKeys) {
            const entry = errorsResult[f];
            const lines = entry.lines;
            const errs = entry.errors;
            const rel = f.replace(scanPath + '/', '');
            const shownLines = new Set();
            const fixes = [];
            let prevErr = null;
            const rootErrs = [];
            for (const r of errs) {
              const et = r.errorType || r.type || 'Syntax Error';
              const msgKey = (r.message || '').replace(/L\d+.*$/, '').trim();
              const prevMsgKey = prevErr ? (prevErr.message || '').replace(/L\d+.*$/, '').trim() : '';
              if (!(prevErr && (prevErr.errorType || prevErr.type || 'Syntax Error') === et && prevMsgKey === msgKey && r.line === prevErr.line + 1)) rootErrs.push(r);
              prevErr = r;
            }
            for (const r of rootErrs.slice(0, 5)) {
              if (shownLines.has(r.line)) continue;
              shownLines.add(r.line);
              const sug = r.suggestion || '';
              const lineContent = (lines && lines[r.line - 1]) ? lines[r.line - 1] : '';
              const et = r.errorType || r.type || '';
              const msg = r.message || '';
              let fixLine = '';
              if (sug) fixLine = sug;
              else if (et === 'Missing Semicolon' || msg.includes('Missing Semicolon') || msg.includes('missing semicolon') || msg.includes('semicolon')) fixLine = lineContent + ';';
              else if (et.startsWith('Unclosed Tag') || et.startsWith('Unclosed tag') || msg.includes('Unclosed Tag') || msg.includes('unclosed tag')) {
                const tagMatch = lineContent.match(/<(\w+)/);
                if (tagMatch) fixLine = lineContent.replace(/<(\w+)[^>]*>.*$/, '<' + tagMatch[1] + '>' + '</' + tagMatch[1] + '>');
                else fixLine = lineContent;
              } else fixLine = lineContent;
              fixes.push({ line: r.line, col: r.col, text: fixLine.substring(0, 120) });
            }
            fixesData[rel] = fixes;
          }
        }

        // ── Data preparation: syntax error grouped data ────────────
        const syntaxGroups = {};
        if (errFileKeys.length > 0) {
          for (const f of errFileKeys) {
            const entry = errorsResult[f];
            const lines = entry.lines;
            const errs = entry.errors;
            const rel = f.replace(scanPath + '/', '');
            errs.sort((a, b) => a.line - b.line);
            const grouped = [];
            let currentGroup = null;
            for (const r of errs) {
              const et = r.errorType || r.type || 'Syntax Error';
              const msgKey = (r.message || '').replace(/\s*L\d+.*$/, '').trim();
              if (currentGroup && currentGroup.errorType === et && currentGroup.msgKey === msgKey && r.line === currentGroup.lastLine + 1) {
                currentGroup.errors.push(r); currentGroup.lastLine = r.line;
              } else {
                currentGroup = { errorType: et, msgKey, errors: [r], lastLine: r.line };
                grouped.push(currentGroup);
              }
            }
            syntaxGroups[rel] = { lines, grouped };
          }
        }

        // ── Staged display via setTimeout chain ────────────────────
        setTimeout(() => {
          // Step 2: Static Issues Overview
          if (fileKeys.length > 0) {
            cmd.info('⚠️  Static Issues (' + staticResult.summary.warnings + ' warnings, ' + staticResult.summary.info + ' info):');
            const sortedFiles = fileKeys.sort((a, b) => staticResult.fileIssues[b].length - staticResult.fileIssues[a].length);
            for (const file of sortedFiles.slice(0, 5)) {
              const issues = staticResult.fileIssues[file];
              const rel = file.replace(scanPath + '/', '');
              cmd.output(escHtml(rel) + ' — ' + issues.length + ' issues');
              for (const iss of issues.slice(0, 3)) {
                cmd.output('  ' + iss.severity.toUpperCase() + ' L' + String(iss.line) + ' ' + iss.code + ' ' + escHtml(iss.message.substring(0, 80)));
              }
              if (issues.length > 3) cmd.output('  ... ' + (issues.length - 3) + ' more');
            }
            if (sortedFiles.length > 5) cmd.info('... dan ' + (sortedFiles.length - 5) + ' file lainnya');
          }

          setTimeout(() => {
              // Step 3: Syntax Errors
              if (errFileKeys.length > 0) {
                cmd.info('🔴  Syntax Errors — ' + errFileKeys.length + ' file(s):');
                for (const f of errFileKeys) {
                  const rel = f.replace(scanPath + '/', '');
                  const g = syntaxGroups[rel];
                  if (!g) continue;
                  let snippetCount = 0;
                  for (const group of g.grouped) {
                    const rootErr = group.errors[0];
                    const loc = rootErr.col ? 'L' + rootErr.line + ':' + rootErr.col : 'L' + rootErr.line;
                    const sev = rootErr.severity || 'HIGH';
                    const conf = rootErr.confidence || '100%';
                    const et = group.errorType;
                    cmd.output('📄 ' + escHtml(rel) + ' ' + loc + ' [Root Cause] ' + escHtml(et) + ' (' + sev + ', ' + conf + ')');
                    if (snippetCount < 3 && g.lines) {
                      const idx = rootErr.line - 1;
                      if (idx >= 0 && idx < g.lines.length) {
                        cmd.output('<pre>' + renderOverviewSnippet(g.lines, rootErr.line, rootErr.col) + '</pre>');
                        snippetCount++;
                      }
                    }
                    if (group.errors.length > 1) {
                      for (let i = 1; i < group.errors.length; i++) {
                        const suppressed = group.errors[i];
                        const sLoc = suppressed.col ? 'L' + suppressed.line + ':' + suppressed.col : 'L' + suppressed.line;
                        cmd.output('  \u23ed ' + sLoc + ' Suppressed (caused by previous error)');
                      }
                    }
                  }
                }
              }

              setTimeout(() => {
                // Step 4: Suggested Fixes
                if (errFileKeys.length > 0) {
                  cmd.info('🔧  Suggested Fixes');
                  for (const f of errFileKeys) {
                    const rel = f.replace(scanPath + '/', '');
                    const fixes = fixesData[rel] || [];
                    if (fixes.length > 0) {
                      cmd.output(escHtml(rel));
                      for (const fix of fixes) {
                        const locStr = fix.col ? 'L' + fix.line + ':' + fix.col : 'L' + fix.line;
                        cmd.output('  ' + locStr + ': ' + escHtml(fix.text));
                      }
                    }
                  }
                }

                setTimeout(() => {
                  // Step 5: Error Summary + Language
                  cmd.info('🔴  Error Summary');
                  cmd.output('Syntax Errors: ' + (totalErrors || 0) + ' | Warnings: ' + totalWarnings + ' | Info: ' + totalInfo);

                  if (errFileKeys.length > 0) {
                    cmd.info('📊  Error Statistics');
                    for (const lang of Object.keys(langData).sort((a, b) => langData[b].files - langData[a].files)) {
                      cmd.output('  ' + lang + ': ' + langData[lang].files + ' file' + (langData[lang].files > 1 ? 's' : '') + ', ' + langData[lang].errors + ' error' + (langData[lang].errors > 1 ? 's' : ''));
                    }
                  }

                  setTimeout(() => {
                    // Step 6: Files Requiring Attention
                    if (allAffected.length > 0) {
                      cmd.info('📋  Files Requiring Attention');
                      for (const rel of allAffected) {
                        const fileIssues = affectedFileIssues[rel] || [];
                        if (fileIssues.length > 0) {
                          cmd.output(escHtml(rel));
                          for (const fi of fileIssues) {
                            cmd.output('  ' + fi.severity + ' - ' + escHtml(fi.label));
                          }
                        }
                      }
                    }

                    setTimeout(() => {
                      // Step 7: Debug Priority
                      if (priorityList.length > 0) {
                        cmd.info('🔥  Debug Priority');
                        let rank = 1;
                        for (const p of priorityList) {
                          const confStr = p.confidence > 0 ? ', ' + p.confidence + '%' : '';
                          cmd.output('  ' + rank + '. ' + escHtml(p.rel) + ' (' + p.label + confStr + ') — ' + escHtml(p.detail));
                          rank++;
                        }
                      }

                      setTimeout(() => {
                        // Step 8: Most Complex Files + Success
                        if (metricsResult.files.length > 0) {
                          cmd.info('⚡  Most Complex Files:');
                          for (const f of metricsResult.files.slice(0, 5)) {
                            const bar = '█'.repeat(Math.min(Math.ceil(f.complexity / 2), 15));
                            const fileCol = escHtml(f.path).padEnd(30);
                            const compCol = String(f.complexity).padStart(3);
                            const barCol = bar.padEnd(17);
                            const linesCol = String(f.effective).padStart(4);
                            cmd.output('  ' + fileCol + ' : ' + compCol + ' ' + barCol + ' (' + linesCol + ' lines)');
                          }
                        }
                        cmd.success('✅  Overview selesai dalam ' + elapsedAll + 's');

                        // ── AI Context ──
                        cmd.info('── AI Debug Summary ──────────────────────────────────────');
                        let aiCtx = '── AI Debug Summary ──\n\n';
                        aiCtx += 'Files With Errors: ' + errFileKeys.length + '\n';
                        aiCtx += 'Total Errors: ' + (totalErrors || 0) + '\n';
                        aiCtx += 'Total Warnings: ' + (totalWarnings || 0) + '\n\n';
        if (errFileKeys.length > 0) {
          for (const f of errFileKeys) {
            const entry = errorsResult[f];
            const lines = entry.lines;
            const errs = entry.errors;
            const rel = f.replace(scanPath + '/', '');
            let prevErr = null;
            const rootErrs = [];
            for (const r of errs) {
              const et = r.errorType || r.type || 'Syntax Error';
              const msgKey = (r.message || '').replace(/L\d+.*$/, '').trim();
              const prevMsgKey = prevErr ? (prevErr.message || '').replace(/L\d+.*$/, '').trim() : '';
                              if (!(prevErr && (prevErr.errorType || prevErr.type || 'Syntax Error') === et && prevMsgKey === msgKey && r.line === prevErr.line + 1)) rootErrs.push(r);
              prevErr = r;
            }
                            aiCtx += rel + '\n';
            for (const r of rootErrs) {
                              aiCtx += '  ' + (r.severity || 'HIGH') + ' ' + (r.errorType || r.type || 'Syntax Error') + ' (L' + r.line + ')\n';
            }
            if (lines) {
              const allErrLines = rootErrs.map(r => r.line).sort((a, b) => a - b);
              const firstErrLine = allErrLines[0];
              const lastErrLine = allErrLines[allErrLines.length - 1];
              const startLine = Math.max(0, firstErrLine - 3);
              const endLine = Math.min(lines.length, lastErrLine + 1);
                              aiCtx += '\nSnippet:\n';
              for (let i = startLine; i < endLine; i++) {
                                aiCtx += (i + 1) + '| ' + lines[i] + '\n';
              }
            }
            aiCtx += '\n';
          }
                          aiCtx += 'Suggested Fixes:\n';
          for (const f of errFileKeys) {
            const entry = errorsResult[f];
            const errs = entry.errors;
                            const lines2 = entry.lines;
            let prevErr = null;
            const rootErrs = [];
            for (const r of errs) {
              const et = r.errorType || r.type || 'Syntax Error';
              const msgKey = (r.message || '').replace(/L\d+.*$/, '').trim();
              const prevMsgKey = prevErr ? (prevErr.message || '').replace(/L\d+.*$/, '').trim() : '';
                              if (!(prevErr && (prevErr.errorType || prevErr.type || 'Syntax Error') === et && prevMsgKey === msgKey && r.line === prevErr.line + 1)) rootErrs.push(r);
              prevErr = r;
            }
            for (const r of rootErrs) {
              const sug = r.suggestion || '';
                              const lineContent = (lines2 && lines2[r.line - 1]) ? lines2[r.line - 1] : '';
              const et = r.errorType || r.type || '';
              const msg = r.message || '';
              let fixText = '';
                              if (sug) fixText = sug;
                              else if (et === 'Missing Semicolon' || msg.includes('Missing Semicolon') || msg.includes('semicolon')) fixText = "Add ';' after " + lineContent.trim().substring(0, 40) + '.';
                              else if (et.startsWith('Unclosed Brace') || msg.includes('Unclosed Brace') || msg.includes('unclosed brace') || msg.includes('Unclosed {')) fixText = "Add missing closing brace '}'.";
                              else if (et.startsWith('Unclosed Tag') || et.startsWith('Unclosed tag') || msg.includes('Unclosed Tag')) fixText = 'Close the <' + ((lineContent.match(/<(\w+)/) || ['', 'tag'])[1]) + '> tag.';
                              else if (et.startsWith('Extra Brace') || msg.includes('Extra Brace')) fixText = "Remove the extra '}'.";
                              else if (et === 'Unbalanced Braces' || et === 'Unclosed String' || msg.includes('Unclosed String')) fixText = 'Check for unclosed braces or quotes.';
                              else fixText = 'Review ' + lineContent.trim().substring(0, 40) + ' for syntax.';
                              aiCtx += '  ' + r.line + ': ' + fixText + '\n';
                            }
                          }
                        }
                        if (fileKeys.length > 0) {
                          const warnings2 = staticResult.summary.warnings || 0;
                          const infos2 = staticResult.summary.info || 0;
                          if (warnings2 > 0) {
                            aiCtx += '\nStatic Warnings:\n';
                            for (const file of fileKeys) {
                              const warningsList = staticResult.fileIssues[file].filter(i => i.severity === 'warning');
                              if (warningsList.length > 0) {
                                const rel = file.replace(scanPath + '/', '');
                                aiCtx += '  ' + rel + '\n';
                                for (const w of warningsList) aiCtx += '    ' + (w.code || w.message.substring(0, 40)) + ' at L' + (w.line || '?') + '\n';
                              }
                            }
                          }
                        }
                        aiCtx += 'End Summary\n';
                        cmd.output('<pre>' + escHtml(aiCtx) + '</pre>');
                        cmd.info('── End of AI Context ──────────────────────────────────');

                        // Sembunyikan animasi scanning setelah semua step selesai
                        nexaNpm.destroy();
                        const npmContainer = document.querySelector('.nexa-npm-progress');
                        if (npmContainer?.parentNode) {
                            npmContainer.parentNode.removeChild(npmContainer);
                        }
                      }, 800);
                    }, 600);
                  }, 600);
                }, 600);
              }, 800);
            }, 800);
          }, 800);
         
        return false;
      }
      case 'scan': {
        const scanPath = resolvePath(cmd, args[0] || '');
        cmd.info(`🔍  Scanning: ${scanPath}`);

        const result = await scanAll(scanPath);
        if (result.dirs.length === 0 && result.files.length === 0) {
          cmd.warning('Proyek kosong atau tidak terbaca.');
          return false;
        }
        cmd.output('📁 Folders: ' + result.dirs.length + ' | 📄 Files: ' + result.files.length +
          (result.totalSize > 0 ? ' | 📦 Size: ' + formatSize(result.totalSize) : ''));

        // Build tree object from scanResult
        const treeRoot = {};
        for (const d of result.dirs) {
          const rel = d.replace(scanPath.replace(/\\/g, '/') + '/', '').replace(/\\/g, '/');
          const parts = rel.split('/');
          let node = treeRoot;
          for (const part of parts) {
            if (!node[part]) node[part] = {};
            node = node[part];
          }
        }
        for (const f of result.files) {
          const rel = f.path.replace(scanPath.replace(/\\/g, '/') + '/', '').replace(/\\/g, '/');
          const parts = rel.split('/');
          let node = treeRoot;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!node[parts[i]]) node[parts[i]] = {};
            node = node[parts[i]];
          }
          node[parts[parts.length - 1]] = null;
        }

        function renderTree(node, prefix) {
          const lines = [];
          const keys = Object.keys(node).sort((a, b) => a.localeCompare(b));
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const last = i === keys.length - 1;
            const connector = last ? '\u2514\u2500\u2500 ' : '\u251c\u2500\u2500 ';
            const indent = prefix + (last ? '    ' : '\u2502   ');
            if (node[key] && node[key] !== null) {
              lines.push(prefix + connector + key + '/');
              lines.push(...renderTree(node[key], indent));
            } else {
              lines.push(prefix + connector + escHtml(key));
            }
          }
          return lines;
        }

        if (Object.keys(treeRoot).length > 0) {
          cmd.info('\uD83D\uDCC1  ' + scanPath.replace(/\\/g, '/') + '/');
          cmd.output('<pre style="margin:0;line-height:1.5;font-family:monospace">' + renderTree(treeRoot, '  ').join('\n') + '</pre>');
        }

        cmd.success(`✅  Scan selesai: ${result.dirs.length} folder, ${result.files.length} file`);
        return false;
      }

      // ── search ────────────────────────────────────────────────────
      case 'search': {
        const query = args[0];
        if (!query) { cmd.error('Usage: mode exploring search <query> [ext]'); return false; }
        const extFilter = args[1] || '';
        cmd.info(`🔍  Mencari file: "${query}"`);
        
        const matches = await searchFilesByName(Directory, query);
        if (matches.length === 0) { cmd.warning('Tidak ada file yang cocok.'); return false; }
        let filtered = matches;
        if (extFilter) {
          const exts = extFilter.split(',').map(s => '.' + s.trim().toLowerCase().replace(/^\./, ''));
          filtered = matches.filter(m => exts.some(e => m.name.toLowerCase().endsWith(e)));
        }
        cmd.success(`Ditemukan ${filtered.length} file:`);
        
        const items = filtered.map((m, i) => `${String(i + 1).padStart(3)}. ${escHtml(m.path.replace(Directory + '/', ''))}`);
        for (let i = 0; i < items.length; i += 20) cmd.output(wrapHtml(items.slice(i, i + 20).join('<br>')));
        return false;
      }

      // ── grep ──────────────────────────────────────────────────────
      case 'grep': {
        const query = args[0];
        if (!query) { cmd.error('Usage: mode exploring grep <query> [ext1,ext2,...]'); return false; }
        const extFilter = args[1] || '';
        cmd.info(`🔍  Mencari teks: "${query}"`);
        
        const matches = await grepFiles(Directory, query, extFilter);
        if (matches.length === 0) { cmd.warning('Tidak ada hasil grep.'); return false; }
        const grouped = {};
        for (const m of matches) { if (!grouped[m.file]) grouped[m.file] = []; grouped[m.file].push(m); }
        const fileKeys = Object.keys(grouped);
        cmd.success(`Ditemukan ${matches.length} kecocokan di ${fileKeys.length} file:`);
        
        for (const file of fileKeys.slice(0, 20)) {
          const lines = grouped[file];
          cmd.output(wrapHtml(boldSpan(file.replace(Directory + '/', '')) + ` (${lines.length} baris)`));
          for (const ln of lines.slice(0, 5)) {
            cmd.output(wrapHtml(`  ${colorSpan(String(ln.line).padStart(4), '#888')} │ ${escHtml(ln.text)}`));
          }
          if (lines.length > 5) cmd.output(wrapHtml(`  ${colorSpan('... ' + (lines.length - 5) + ' more', '#666')}`));
        }
        if (fileKeys.length > 20) cmd.info(`... dan ${fileKeys.length - 20} file lainnya`);
        return false;
      }

      // ── read ──────────────────────────────────────────────────────
      case 'read': {
        const fileArg = args[0];
        if (!fileArg) { cmd.error('Usage: mode exploring read <filepath>'); return false; }
        const fullPath = resolvePath(cmd, fileArg);
        cmd.info(`📖  Reading: ${fullPath}`);
        
        const content = await readFileContent(fullPath);
        if (content == null) { cmd.error(`File tidak ditemukan: ${fullPath}`); return false; }
        const ext = fullPath.includes('.') ? '.' + fullPath.split('.').pop().toLowerCase() : '';
        const lineCount = content.split('\n').length;
        const sizeKB = (content.length / 1024).toFixed(1);
        cmd.output(wrapHtml(
          `${colorSpan('Lines', '#4fc1ff')}: ${boldSpan(String(lineCount))} | ` +
          `${colorSpan('Size', '#9f6')}: ${boldSpan(sizeKB + ' KB')} | ` +
          `${colorSpan('Type', '#fa6')}: ${boldSpan(ext || 'unknown')}`
        ));
        
        const lines = content.split('\n');
        const maxLines = Math.min(lines.length, 200);
        const codeLines = [];
        for (let i = 0; i < maxLines; i++) codeLines.push(`${colorSpan(String(i + 1).padStart(4), '#555')} │ ${escHtml(lines[i])}`);
        cmd.output(wrapHtml(`<pre>${codeLines.join('\n')}</pre>`));
        if (lines.length > 200) cmd.info(`... ${lines.length - 200} more lines (truncated)`);
        return false;
      }

      // ── errors ────────────────────────────────────────────────────
      case 'errors': {
        const scanPath = resolvePath(cmd, args[0] || '');
        cmd.info(`🔍  Error Scan: ${scanPath}`);
        

        const start = Date.now();
        const { files } = await scanAll(scanPath);
        const codeFiles = files.filter(f => isCodeFile(f.name));

        // ── Collect issues per category per file ────────────────────
        const fileLines = {};        // filePath -> string[]
        const syntaxIssues = {};     // filePath -> [{line, col, type, message, source, severity, confidence}]
        const staticIssues = {};     // filePath -> [{...}]
        const patternIssues = {};    // filePath -> [{...}]
        const affectedFiles = new Set();

        let syntaxCount = 0;
        let staticCount = 0;
        let patternCount = 0;

        const patterns = [
          { regex: /console\.error\s*\(/, type: 'console-error', msg: 'console.error() call' },
          { regex: /console\.warn\s*\(/, type: 'console-warn', msg: 'console.warn() call' },
          { regex: /\bthrow\s/, type: 'throw', msg: 'throw statement' },
          { regex: /\.catch\s*\(/, type: 'catch', msg: '.catch() chain' },
          { regex: /\breject\s*\(/, type: 'reject', msg: 'reject() call' },
        ];

        for (const fi of codeFiles) {
          const content = await readFileContent(fi.path);
          if (!content || content.length < 3) continue;
          const lines = content.split('\n');
          fileLines[fi.path] = lines;

          // 1) Syntax check
          const syntaxRaw = validateFileSyntax(fi.name, content);
          const syntaxErrs = deduplicateErrors(syntaxRaw);
          for (const e of syntaxErrs) {
            const issue = {
              line: e.line,
              col: e.col || 1,
              type: e.type || 'syntax-error',
              message: e.message,
              source: 'syntax',
              severity: e.severity || 'HIGH',
              confidence: e.confidence || '100%',
              category: e.category || '',
              errorType: e.errorType || '',
              analyzer: e.analyzer || '',
              hint: e.message,
            };
            if (!syntaxIssues[fi.path]) syntaxIssues[fi.path] = [];
            syntaxIssues[fi.path].push(issue);
            syntaxCount++;
            affectedFiles.add(fi.path);
          }

          // 2) Static analysis (skip 'info' severity)
          const staticArr = staticAnalyzeCode(fi.name, content);
          for (const s of staticArr) {
            if (s.severity === 'info') continue;
            const issue = {
              line: s.line,
              col: s.col || 1,
              type: s.code,
              message: s.message,
              source: 'static',
              severity: s.severity.toUpperCase(),
              confidence: '—',
              hint: s.message,
            };
            if (!staticIssues[fi.path]) staticIssues[fi.path] = [];
            staticIssues[fi.path].push(issue);
            staticCount++;
            affectedFiles.add(fi.path);
          }

          // 3) Pattern-based detection
          for (let i = 0; i < lines.length; i++) {
            const ln = i + 1;
            const line = lines[i];
            for (const p of patterns) {
              const match = line.match(p.regex);
              if (match) {
                const idx = match.index;
                const issue = {
                  line: ln,
                  col: idx + 1,
                  type: p.type,
                  message: p.msg,
                  source: 'pattern',
                  severity: 'MEDIUM',
                  confidence: '90%',
                  hint: p.msg,
                };
                if (!patternIssues[fi.path]) patternIssues[fi.path] = [];
                patternIssues[fi.path].push(issue);
                patternCount++;
                affectedFiles.add(fi.path);
              }
            }
          }

          // Sort issues per file by line/col
          for (const map of [syntaxIssues, staticIssues, patternIssues]) {
            if (map[fi.path]) {
              map[fi.path].sort((a, b) => a.line - b.line || (a.col || 0) - (b.col || 0));
            }
          }
        }

        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        const totalIssues = syntaxCount + staticCount + patternCount;
        const allIssuePaths = [...affectedFiles].sort();

        // ── Scan summary ─────────────────────────────────────────────
        cmd.output(wrapHtml(
          `${colorSpan('📄 Scanned', '#4fc1ff')}: ${boldSpan(String(codeFiles.length))} file(s) | ` +
          `${colorSpan('🔴 Syntax', '#ef4444')}: ${boldSpan(String(syntaxCount))} | ` +
          `${colorSpan('🟡 Static', '#f59e0b')}: ${boldSpan(String(staticCount))} | ` +
          `${colorSpan('🔵 Patterns', '#3b82f6')}: ${boldSpan(String(patternCount))}` +
          (totalIssues > 0 ? ` | ${colorSpan('⚠️  Total', '#f59e0b')}: ${boldSpan(String(totalIssues))} in ${boldSpan(String(allIssuePaths.length))} file(s)` : '')
        ));
        

        if (totalIssues === 0) {
          cmd.success(`✅  Done ${elapsed}s — ${codeFiles.length} files scanned, 0 issues`);
          return false;
        }

        // ── Helper: render code snippet with caret ──────────────────
        function renderSnippet(lines, lineNum, colNum) {
          const idx = lineNum - 1;
          if (idx < 0 || idx >= lines.length) return '';
          const before = Math.min(3, idx);
          const after = Math.min(2, lines.length - idx - 1);
          const startLine = idx - before;
          const endLine = idx + after;
          const maxLineNo = endLine + 1;
          const gutterPad = String(maxLineNo).length;
          const snippetLines = [];
          for (let i = startLine; i <= endLine; i++) {
            const lineNo = i + 1;
            const gutter = `${String(lineNo).padStart(gutterPad)}│ `;
            if (i === idx) {
              snippetLines.push(`${gutter}${escHtml(lines[i])}`);
              const col = colNum || 1;
              const caretPos = gutter.length + col - 1;
              snippetLines.push(`${' '.repeat(caretPos)}^`);
            } else {
              snippetLines.push(`${gutter}${escHtml(lines[i])}`);
            }
          }
          return snippetLines.join('<br>');
        }

        // ── Emit issues for a section ────────────────────────────────
        function emitSection(headerEmoji, headerTitle, issuesMap/*, severityColor*/) {
          const filePaths = Object.keys(issuesMap).sort();
          if (filePaths.length === 0) return;

          cmd.info(headerEmoji + ' ' + headerTitle);

          for (const file of filePaths) {
            const issues = issuesMap[file];
            const lines = fileLines[file];
            const rel = file.replace(scanPath + '/', '');

            for (const iss of issues) {
              cmd.output(iss.severity + ' | Conf: ' + iss.confidence + ' | ' + rel + ' | L' + iss.line + ':C' + iss.col + ' | ' + iss.message);
              
              if (lines) {
                const snippet = renderSnippet(lines, iss.line, iss.col);
                cmd.output(snippet);
              }
            }
          }
        }

        // ── 1. Syntax Errors ─────────────────────────────────────────
        emitSection('🔴', 'Syntax Errors', syntaxIssues, '#ef4444');

        // ── 2. Static Issues ─────────────────────────────────────────
        emitSection('⚠️', 'Static Issues', staticIssues, '#f59e0b');

        // ── 3. Pattern Issues ────────────────────────────────────────
        emitSection('📋', 'Pattern Issues', patternIssues, '#3b82f6');

        // ── 4. Error Summary ─────────────────────────────────────────
        cmd.info('📊  Error Summary');
        
        cmd.output(wrapHtml(
          `${colorSpan('Syntax Errors', '#ef4444')}: ${boldSpan(String(syntaxCount))}`
        ));
        cmd.output(wrapHtml(
          `${colorSpan('Static Issues', '#f59e0b')}: ${boldSpan(String(staticCount))}`
        ));
        cmd.output(wrapHtml(
          `${colorSpan('Pattern Issues', '#3b82f6')}: ${boldSpan(String(patternCount))}`
        ));
        cmd.output(wrapHtml(
          `${colorSpan('Total', '#fff')}: ${boldSpan(String(totalIssues))}`
        ));
        

        // ── 5. Affected Files ────────────────────────────────────────
        cmd.info('📋  Affected Files');
        
        for (const file of allIssuePaths) {
          const rel = file.replace(scanPath + '/', '');
          const sCount = syntaxIssues[file] ? syntaxIssues[file].length : 0;
          const stCount = staticIssues[file] ? staticIssues[file].length : 0;
          const pCount = patternIssues[file] ? patternIssues[file].length : 0;
          const parts = [];
          if (sCount > 0) parts.push(`${colorSpan(String(sCount) + ' syntax', '#ef4444')}`);
          if (stCount > 0) parts.push(`${colorSpan(String(stCount) + ' static', '#f59e0b')}`);
          if (pCount > 0) parts.push(`${colorSpan(String(pCount) + ' pattern', '#3b82f6')}`);
          cmd.output(wrapHtml(
            `  ${boldSpan(escHtml(rel))} — ${parts.join(', ')}`
          ));
        }
        

        // ── 6. Debug Priority ────────────────────────────────────────
        cmd.info('🔥  Debug Priority');
        

        // Priority: files with syntax > pattern > static
        function filePriority(file) {
          if (syntaxIssues[file] && syntaxIssues[file].length > 0) return 0;
          if (patternIssues[file] && patternIssues[file].length > 0) return 1;
          return 2;
        }
        function priorityLabel(file) {
          if (syntaxIssues[file] && syntaxIssues[file].length > 0) return 'HIGH';
          if (patternIssues[file] && patternIssues[file].length > 0) return 'MEDIUM';
          return 'LOW';
        }

        const sortedByPriority = [...allIssuePaths].sort((a, b) => filePriority(a) - filePriority(b));
        let rank = 1;
        for (const file of sortedByPriority) {
          const rel = file.replace(scanPath + '/', '');
          const sCount = syntaxIssues[file] ? syntaxIssues[file].length : 0;
          const stCount = staticIssues[file] ? staticIssues[file].length : 0;
          const pCount = patternIssues[file] ? patternIssues[file].length : 0;
          const details = [];
          if (sCount > 0) details.push(`${sCount} syntax error(s)`);
          if (stCount > 0) details.push(`${stCount} static warning(s)`);
          if (pCount > 0) details.push(`${pCount} pattern issue(s)`);
          const label = priorityLabel(file);
          const labelColor = label === 'HIGH' ? '#ef4444' : (label === 'MEDIUM' ? '#f59e0b' : '#888');
          cmd.output(wrapHtml(
            `  ${rank}. ${boldSpan(escHtml(rel))} — ${details.join(', ')} ${colorSpan('(' + label + ')', labelColor)}`
          ));
          rank++;
        }
        

        cmd.success(`✅  Done ${elapsed}s — ${codeFiles.length} files, ${totalIssues} issues in ${allIssuePaths.length} files`);
        

        // ── AI Context ──────────────────────────────────────────────
        cmd.info('── Error Scan for AI ────────────────────────────');
        

        let aiCtx = `Top Errors\n\n`;

        const allFilesForAi = [...allIssuePaths].sort();
        for (const file of allFilesForAi) {
          const rel = file.replace(scanPath + '/', '');
          const lines = fileLines[file];
          aiCtx += `${rel}\n`;

          const allIssues = [
            ...(syntaxIssues[file] || []),
            ...(staticIssues[file] || []),
            ...(patternIssues[file] || []),
          ].sort((a, b) => a.line - b.line || (a.col || 0) - (b.col || 0));

          for (const iss of allIssues) {
            const loc = `L${iss.line}:C${iss.col}`;
            const codeLine = (lines && iss.line - 1 >= 0 && iss.line - 1 < lines.length)
              ? lines[iss.line - 1].trim().substring(0, 120)
              : '(n/a)';
            const fileName = file.split('/').pop() || '';
            const fileExt = fileName.includes('.') ? '.' + fileName.split('.').pop().toLowerCase() : '';
            const et = iss.errorType || errorType(iss.type, iss.message);
            const aSrc = iss.analyzer || (iss.source === 'syntax' ? analyzerSource(fileExt) : '');
            aiCtx += `  ${loc} [${iss.type}] ${iss.message}\n`;
            aiCtx += `    Error Type: ${et}\n`;
            aiCtx += `    Analyzer: ${aSrc}\n`;
            aiCtx += `    Severity: ${iss.severity}\n`;
            aiCtx += `    Code: ${codeLine}\n`;
          }
          aiCtx += '\n';
        }

        cmd.output(wrapHtml(
          `<pre>${escHtml(aiCtx)}</pre>`
        ));
        
        cmd.info('── End of AI Context ─────────────────────────');
        return false;
      }

      // ── trace ─────────────────────────────────────────────────────
      case 'trace': {
        const fileArg = args[0];
        if (!fileArg) { cmd.error('Usage: mode exploring trace <filepath>'); return false; }
        const fullPath = resolvePath(cmd, fileArg);
        cmd.info(`🔍  Tracing dependencies: ${fullPath}`);
        

        const start = Date.now();
        const trace = await traceFile(fullPath, 0, 3);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);

        if (!trace) {
          cmd.error(`File tidak ditemukan atau tidak terbaca: ${fullPath}`);
          return false;
        }

        const deps = flattenDeps(trace);
        cmd.success(`✅  Trace selesai — ${deps.length} file dalam rantai (${elapsed}s)`);
        

        // Dependency tree (visual)
        cmd.info('📦  Dependency Tree:');
        function renderDepTree(dep, prefix = '') {
          const connector = dep.depth === 0 ? '' : (dep.depth === 1 ? '└── ' : '├── ');
          const indent = dep.depth === 0 ? '' : (prefix + '    ');
          const rel = dep.filePath.replace(Directory + '/', '');
          const defStr = dep.defs.length > 0 ? ` (${dep.defs.map(d => d.name).join(', ')})` : '';
          cmd.output(wrapHtml(
            `${colorSpan('  '.repeat(dep.depth) + connector, '#888')}${boldSpan(escHtml(rel))}${colorSpan(defStr, '#666')}`
          ));
        }
        for (const d of deps) renderDepTree(d);

        

        // Function definitions
        cmd.info('📋  Function/Class Definitions:');
        for (const d of deps) {
          if (d.defs.length > 0) {
            const rel = d.filePath.replace(Directory + '/', '');
            cmd.output(wrapHtml(boldSpan(escHtml(rel))));
            for (const def of d.defs) {
              cmd.output(wrapHtml(`  ${colorSpan('L' + String(def.line), '#888')} ${codeBadge(def.type)} ${escHtml(def.name)}`));
            }
          }
        }

        // ── AI Context ──────────────────────────────────────────────
        
        cmd.info('── Call Chain for AI ───────────────────────────');
        

        let aiCtx = `Dependency trace for "${fullPath}":\n\n`;
        aiCtx += `Chain: ${deps.length} files\n\n`;
        for (const d of deps) {
          const rel = d.filePath.replace(Directory + '/', '');
          const indent = '  '.repeat(d.depth);
          const defStr = d.defs.length > 0 ? ` {${d.defs.map(x => x.name).join(', ')}}` : '';
          aiCtx += `${indent}- ${rel}${defStr}\n`;
        }
        cmd.output(wrapHtml(
          `<pre>${escHtml(aiCtx)}</pre>`
        ));
        
        cmd.info('── End of AI Context ─────────────────────────');
        return false;
      }

      // ── static ────────────────────────────────────────────────────
      case 'static': {
        const scanPath = resolvePath(cmd, args[0] || '');
        cmd.info(`🔍  Static Analysis: ${scanPath}`);
        
        cmd.output(wrapHtml(colorSpan('⏳  Menganalisis kode secara statis...', '#4fc1ff')));
        

        const start = Date.now();
        const results = await staticScanAll(scanPath);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);

        if (Object.keys(results.fileIssues).length === 0) {
          cmd.success(`✅  Tidak ada isu statis ditemukan (${elapsed}s)`);
          return false;
        }

        cmd.success(`✅  Analisis selesai dalam ${elapsed}s`);
        cmd.output(wrapHtml(
          `${colorSpan('🔴 Errors', '#ef4444')}: ${boldSpan(String(results.summary.errors))} | ` +
          `${colorSpan('🟡 Warnings', '#f59e0b')}: ${boldSpan(String(results.summary.warnings))} | ` +
          `${colorSpan('🔵 Info', '#3b82f6')}: ${boldSpan(String(results.summary.info))}`
        ));
        

        // Group by issue code
        const byCode = {};
        for (const file in results.fileIssues) {
          for (const iss of results.fileIssues[file]) {
            if (!byCode[iss.code]) byCode[iss.code] = [];
            byCode[iss.code].push({ ...iss, file });
          }
        }

        // Show issue codes sorted by count
        cmd.info('📊  Issue Breakdown:');
        const sortedCodes = Object.keys(byCode).sort((a, b) => byCode[b].length - byCode[a].length);
        for (const code of sortedCodes) {
          const items = byCode[code];
          const sev = items[0].severity;
          cmd.output(wrapHtml(
            `  ${sevBadge(sev)} ${codeBadge(code)} ${colorSpan(String(items.length), '#9f6')}x`
          ));
        }
        

        // Show detail per file (top 15 files)
        cmd.info('📋  Files with issues:');
        const sortedFiles = Object.keys(results.fileIssues).sort((a, b) => results.fileIssues[b].length - results.fileIssues[a].length);
        for (const file of sortedFiles.slice(0, 15)) {
          const issues = results.fileIssues[file];
          const rel = file.replace(scanPath + '/', '');
          cmd.output(wrapHtml(boldSpan(escHtml(rel)) + ` — ${colorSpan(String(issues.length) + ' issues', '#f59e0b')}`));
          for (const iss of issues.slice(0, 4)) {
            cmd.output(wrapHtml(
              `  ${sevBadge(iss.severity)} ${colorSpan('L' + String(iss.line), '#888')} ${codeBadge(iss.code)} ${escHtml(iss.message)}`
            ));
          }
          if (issues.length > 4) cmd.output(wrapHtml(`  ${colorSpan('... ' + (issues.length - 4) + ' more', '#666')}`));
        }
        if (sortedFiles.length > 15) cmd.info(`... dan ${sortedFiles.length - 15} file lainnya`);

        // ── AI Context ──────────────────────────────────────────────
        
        cmd.info('── Static Analysis for AI ───────────────────────');
        

        let aiCtx = `Static Analysis Report for "${scanPath}":\n\n`;
        aiCtx += `Summary: ${results.summary.errors} errors, ${results.summary.warnings} warnings, ${results.summary.info} info\n\n`;
        aiCtx += `Issue breakdown:\n`;
        for (const code of sortedCodes) {
          aiCtx += `  ${code}: ${byCode[code].length} occurrences\n`;
        }
        aiCtx += `\nFiles with most issues:\n`;
        for (const file of sortedFiles.slice(0, 10)) {
          const rel = file.replace(scanPath + '/', '');
          aiCtx += `  ${rel}: ${results.fileIssues[file].length} issues\n`;
          for (const iss of results.fileIssues[file].slice(0, 3)) {
            aiCtx += `    L${iss.line} [${iss.severity}] ${iss.code}: ${iss.message}\n`;
          }
        }
        cmd.output(wrapHtml(
          `<pre>${escHtml(aiCtx)}</pre>`
        ));
        
        cmd.info('── End of AI Context ─────────────────────────');
        return false;
      }

      // ── check ─────────────────────────────────────────────────────
      case 'check': {
        const scanPath = resolvePath(cmd, args[0] || '');
        cmd.info(`🔍  Code Metrics Check: ${scanPath}`);
        
        cmd.output(wrapHtml(colorSpan('⏳  Menghitung metrik kode...', '#4fc1ff')));
        

        const start = Date.now();
        const metrics = await checkMetrics(scanPath);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);

        cmd.success(`✅  Metrics selesai dalam ${elapsed}s`);
        

        // Summary cards
        const { totals } = metrics;
        const avg = totals.files > 0 ? (totals.complexity / totals.files).toFixed(1) : 0;
        const checkTable = new TabelRaw([
          { Metric: 'Files', Value: String(totals.files) },
          { Metric: 'Lines', Value: `${totals.effectiveLines} / ${totals.lines}` },
          { Metric: 'Complexity', Value: String(totals.complexity) },
          { Metric: 'Imports', Value: String(totals.imports) },
          { Metric: 'Issues', Value: String(totals.issues) },
          { Metric: 'Avg Complexity', Value: avg },
        ], {
          border: true,
          headerStyle: 'double',
          showIndex: false,
          columnAlign: { Value: 'right' },
          maxWidth: 80,
        });
        cmd.output(checkTable.renderHTML());
        

        // Top complex files
        cmd.info('📋  Most Complex Files:');
        for (const f of metrics.files.slice(0, 15)) {
          const complexityBar = '█'.repeat(Math.min(f.complexity, 30));
          const fileCol = escHtml(f.path).padEnd(30);
          const compCol = String(f.complexity).padStart(3);
          const barCol = complexityBar.padEnd(32);
          const linesCol = (f.effective + '/' + f.lines).padStart(8);
          cmd.output('  ' + fileCol + ' : ' + compCol + ' ' + barCol + ' ' + linesCol + ' lines  | Issues: ' + f.issues);
        }
        if (metrics.files.length > 15) cmd.info(`... dan ${metrics.files.length - 15} file lainnya`);

        // ── AI Context ──────────────────────────────────────────────
        
        cmd.info('── Code Metrics for AI ─────────────────────────');
        

        let aiCtx = `Code Metrics Report for "${scanPath}":\n\n`;
        aiCtx += `Files: ${totals.files}\n`;
        aiCtx += `Lines: ${totals.effectiveLines} effective / ${totals.lines} total\n`;
        aiCtx += `Total Cyclomatic Complexity: ${totals.complexity}\n`;
        aiCtx += `Average Complexity per File: ${totals.files > 0 ? (totals.complexity / totals.files).toFixed(1) : 0}\n`;
        aiCtx += `Total Imports: ${totals.imports}\n`;
        aiCtx += `Total Issues: ${totals.issues}\n\n`;
        aiCtx += `Most Complex Files:\n`;
        for (const f of metrics.files.slice(0, 10)) {
          aiCtx += `  ${f.path}: complexity=${f.complexity}, lines=${f.effective}/${f.lines}, issues=${f.issues}\n`;
        }
        cmd.output(wrapHtml(
          `<pre>${escHtml(aiCtx)}</pre>`
        ));
        
        cmd.info('── End of AI Context ─────────────────────────');
        return false;
      }

      // ── compare ───────────────────────────────────────────────────
      case 'compare': {
        const fileArg1 = args[0];
        const fileArg2 = args[1];
        if (!fileArg1 || !fileArg2) {
          cmd.error('Usage: mode exploring compare <filepath1> <filepath2>');
          return false;
        }
        const fullPath1 = resolvePath(cmd, fileArg1);
        const fullPath2 = resolvePath(cmd, fileArg2);

        cmd.info(`🔍  Comparing logic flow:`);
        cmd.output(wrapHtml(`  ${boldSpan(escHtml(fullPath1.replace(Directory + '/', '')))}`));
        cmd.output(wrapHtml(`  ${boldSpan(escHtml(fullPath2.replace(Directory + '/', '')))}`));
        

        const content1 = await readFileContent(fullPath1);
        const content2 = await readFileContent(fullPath2);
        if (!content1 || !content2) {
          cmd.error('Salah satu file tidak ditemukan atau tidak terbaca.');
          return false;
        }

        const flow1 = extractFlow(content1);
        const flow2 = extractFlow(content2);
        const comparison = compareFlow(flow1, flow2);

        // File info
        const lines1 = content1.split('\n').length;
        const lines2 = content2.split('\n').length;
        cmd.output(wrapHtml(
          `${boldSpan('File 1:')} ${colorSpan(String(lines1) + ' lines', '#4fc1ff')} | ` +
          `${boldSpan('File 2:')} ${colorSpan(String(lines2) + ' lines', '#9f6')}`
        ));
        

        // Flow structure comparison
        cmd.info('📊  Flow Structure Comparison:');
        cmd.output('  Element Type       | File 1 | File 2');
        cmd.output('  ───────────────────┼────────┼─────────');
        for (const c of comparison) {
          const diffStr = c.diff > 0 ? `+${c.diff}` : (c.diff < 0 ? String(c.diff) : '');
          const typePad = String(c.type).padEnd(18);
          const countA = String(c.countA).padStart(6);
          const countB = String(c.countB).padStart(6);
          cmd.output(`  ${typePad}│ ${countA} │ ${countB} ${diffStr}`);
        }
        

        // Detailed flow per file
        function renderFlow(flow, label) {
          cmd.output(label);
          for (const f of flow) {
            const iconMap = {
              'function-def': 'ƒ', 'arrow-fn': 'λ', 'class-def': 'C', 'export': '⇽',
              'conditional': '◆', 'loop': '⟳', 'return': '←', 'throw': '✕',
              'try': '△', 'catch': '▽', 'promise-then': '→', 'promise-catch': '→!',
              'await': '⏳',
            };
            const icon = iconMap[f.type] || '·';
            cmd.output(`  ${icon} L${f.line} ${f.type} ${f.detail.substring(0, 80)}`);
          }
        }
        renderFlow(flow1, `📋  File 1 Flow (${fullPath1.replace(Directory + '/', '')}):`);
        
        renderFlow(flow2, `📋  File 2 Flow (${fullPath2.replace(Directory + '/', '')}):`);

        // ── AI Context ──────────────────────────────────────────────
        
        cmd.info('── Flow Comparison for AI ──────────────────────');
        

        let aiCtx = `Logic Flow Comparison:\n\n`;
        aiCtx += `File 1: ${fullPath1.replace(Directory + '/', '')} (${lines1} lines)\n`;
        aiCtx += `File 2: ${fullPath2.replace(Directory + '/', '')} (${lines2} lines)\n\n`;
        aiCtx += `Structural differences:\n`;
        for (const c of comparison) {
          if (c.diff !== 0) {
            aiCtx += `  ${c.type}: ${c.countA} → ${c.countB} (${c.diff > 0 ? '+' : ''}${c.diff})\n`;
          }
        }
        aiCtx += `\nFile 1 flow (${flow1.length} steps):\n`;
        for (const f of flow1.slice(0, 20)) {
          aiCtx += `  L${f.line} [${f.type}] ${f.detail}\n`;
        }
        aiCtx += `\nFile 2 flow (${flow2.length} steps):\n`;
        for (const f of flow2.slice(0, 20)) {
          aiCtx += `  L${f.line} [${f.type}] ${f.detail}\n`;
        }
        cmd.output(wrapHtml(
          `<pre>${escHtml(aiCtx)}</pre>`
        ));
        
        cmd.info('── End of AI Context ─────────────────────────');
        return false;
      }

      // ── index ──────────────────────────────────────────────────────
      case 'index': {
        cmd.info(`📦  Indexing project: ${Directory}`);
        
        cmd.output(wrapHtml(colorSpan('⏳  Scanning dan chunking file...', '#4fc1ff')));
        
        const start = Date.now();
        const result = await ensureIndex(Directory);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        cmd.success(`✅  Index selesai dalam ${elapsed}s`);
        cmd.output(wrapHtml(
          `${colorSpan('Chunks', '#4fc1ff')}: ${boldSpan(String(result.chunks.length))} | ` +
          `${colorSpan('Vocabulary', '#9f6')}: ${boldSpan(String(Object.keys(result.index.idf).length))} terms`
        ));
        return false;
      }

      // ── rag ────────────────────────────────────────────────────────
      case 'rag': {
        const query = args.join(' ');
        if (!query) { cmd.error('Usage: mode exploring rag <query>'); return false; }
        cmd.info(`🧠  RAG Query: "${query}"`);
        
        const start = Date.now();
        const { index, chunks } = await ensureIndex(Directory);
        if (chunks.length === 0) { cmd.warning('Tidak ada chunk tersedia. Jalankan "mode exploring index" terlebih dahulu.'); return false; }
        const topK = Math.min(Number(args.find(a => /^\d+$/.test(a)) || 5), 20);
        const results = retrieve(query, index, topK);
        const elapsed = ((Date.now() - start) * 1000).toFixed(0);
        cmd.success(`Retrieved ${results.length} chunks in ${elapsed}ms`);
        
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          cmd.output(wrapHtml(
            `${colorSpan(`[${i + 1}]`, '#4fc1ff')} ${boldSpan(escHtml(r.filePath.replace(Directory + '/', '')))} ` +
            `${colorSpan(`(score: ${r.score.toFixed(4)})`, '#888')}`
          ));
          cmd.output(wrapHtml(
            `<pre>${escHtml(r.snippet.substring(0, 500))}</pre>`
          ));
        }
        
        cmd.info('── Generated AI Context ──────────────────────');
        
        const aiContext = formatRagContext(results);
        cmd.output(wrapHtml(
          `<pre>${escHtml(aiContext)}</pre>`
        ));
        
        cmd.info('── End of AI Context ─────────────────────────');
        return false;
      }

      default:
        cmd.error(`Subcommand tidak dikenal: "${sub}"`);
        cmd.info('Gunakan "mode exploring" untuk melihat menu.');
        return false;
    }

  } catch (error) {
    console.error('❌ mode exploring failed:', error);
    cmd.error('Error: ' + (error.message || error));
    return null;
  }
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
