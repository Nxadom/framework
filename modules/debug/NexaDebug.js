/**
 * NexaDebug — Standalone Static Code Analysis & Debugging Engine
 * Tidak bergantung pada Terminal.
 *
 * Usage (Electron):
 *   const dbg = NexaDebug.route();
 *   await dbg.start("/path/to/project");
 *   dbg.report(cmd);
 *
 * Usage (Custom adapter):
 *   const dbg = new NexaDebug({
 *     readFolder: async (path) => [...],
 *     readFile:   async (path) => "...",
 *   });
 *   await dbg.start("/path/to/project");
 *   console.log(dbg.summary(), dbg.detailErrors());
 */
export class NexaDebug {
  constructor(adapter = {}) {
    this._readFolder = adapter.readFolder || (() => Promise.resolve([]));
    this._readFile   = adapter.readFile   || (() => Promise.resolve(null));
    this.scanResult   = { dirs: [], files: [], totalSize: 0 };
    this.metricsResult  = null;
    this.errorsResult  = null;
    this.staticResult  = null;
    this.ragIndex   = null;
    this.ragChunks   = [];
    this._basePath = "";
  }

  /** Factory: buat instance yang sudah terhubung ke Electron IPC (discovery API) */
  static route() {
    return new NexaDebug({
      readFolder: async (path) => {
        try {
          const api = window.electronAPI;
          if (!api?.discoveryReadFolder) return [];
          const row = await api.discoveryReadFolder(String(path || ""));
          if (!row?.ok) return [];
          return Array.isArray(row.entries) ? row.entries : [];
        } catch { return []; }
      },
      readFile: async (path) => {
        try {
          const api = window.electronAPI;
          if (!api?.discoveryReadFile) return null;
          const row = await api.discoveryReadFile(String(path || ""));
          if (!row?.ok) return null;
          return String(row.content || row.text || "");
        } catch { return null; }
      },
    });
  }

  // ── START ──

  async start(dirPath) {
    this._basePath = String(dirPath || "").replace(/\\/g, "/").replace(/\/+$/, "");
    const [scan, metrics, errors, staticRes] = await Promise.all([
      this._scanAll(this._basePath),
      this._checkMetrics(this._basePath),
      this._validateAllFiles(this._basePath),
      this._staticScanAll(this._basePath),
    ]);
    this.scanResult  = scan;
    this.metricsResult = metrics;
    this.errorsResult  = errors;
    this.staticResult  = staticRes;
    return { scan, metrics, errors, static: staticRes };
  }

  summary() {
    const s = this.scanResult || {};
    const m = this.metricsResult?.totals || {};
    const e = this.errorsResult || {};
    const st = this.staticResult?.summary || {};
    return {
      folders: s.dirs?.length || 0, files: s.files?.length || 0, totalSize: s.totalSize || 0,
      effectiveLines: m.effectiveLines || 0, totalLines: m.lines || 0,
      complexity: m.complexity || 0, avgComplexity: m.files ? (m.complexity / m.files).toFixed(1) : "0",
      imports: m.imports || 0, issues: m.issues || 0,
      syntaxErrorFiles: Object.keys(e).filter(k => k !== "_meta").length,
      totalErrors: e._meta?.errorCount || 0,
      totalWarnings: st.warnings || 0,
      totalInfo: st.info || 0,
      staticWarnings: st.warnings || 0, staticInfo: st.info || 0,
    };
  }

  /** Kembalikan daftar error detail: file, line, col, type, severity, message, suggestion */
  detailErrors() {
    const errors = this.errorsResult || {};
    const stat = this.staticResult || { fileIssues: {} };
    const result = {
      syntaxErrors: [],
      staticWarnings: [],
      staticInfo: [],
    };
    const fname = (p) => p.replace(/\\/g, "/").split("/").pop();

    // Syntax errors
    for (const file of Object.keys(errors).filter(k => k !== "_meta")) {
      const entry = errors[file];
      for (const e of entry.errors) {
        result.syntaxErrors.push({
          file: file,
          filename: fname(file),
          line: e.line,
          col: e.col,
          type: e.errorType || e.type,
          severity: e.severity,
          confidence: e.confidence,
          message: e.message,
          suggestion: e.suggestion || "",
          analyzer: e.analyzer || "",
        });
      }
    }

    // Static warnings / info
    for (const file of Object.keys(stat.fileIssues)) {
      for (const iss of stat.fileIssues[file]) {
        const obj = { file: file, filename: fname(file), line: iss.line, code: iss.code, message: iss.message };
        if (iss.severity === "warning") {
          result.staticWarnings.push(obj);
        } else {
          result.staticInfo.push(obj);
        }
      }
    }

    return result;
  }

  /**
   * Render laporan lengkap ke terminal (cmd) — summary + errors detail.
   * Ini satu-satunya method yang perlu disentuh pengguna setelah start().
   * @param {object} cmd — terminal cmd object (punya .output, .info, .success, .error)
   */
  report(cmd) {
    if (!cmd) { console.log(this.summary()); console.log(this.detailErrors()); return; }
    const sum = this.summary();
    const detail = this.detailErrors();

    cmd.info("─ NexaDebug Summary " + "─".repeat(40));
    cmd.output(`  Folders: ${sum.folders} | Files: ${sum.files} | Lines: ${sum.effectiveLines}/${sum.totalLines}`);
    cmd.output(`  Total Errors: ${sum.totalErrors} | Warnings: ${sum.staticWarnings} | Info: ${sum.staticInfo}`);
    cmd.output(`  Syntax Error Files: ${sum.syntaxErrorFiles} | Avg Complexity: ${sum.avgComplexity}`);

    if (detail.syntaxErrors.length > 0) {
      cmd.info("─ Syntax Errors " + "─".repeat(46));
      for (const e of detail.syntaxErrors) {
        cmd.output(`  ${e.file}`);
        cmd.output(`    L${e.line}:${e.col}  [${e.severity}] ${e.type}`);
        cmd.output(`    ${e.message}`);
        if (e.suggestion) cmd.output(`    Fix: ${e.suggestion}`);
      }
    }

    if (detail.staticWarnings.length > 0) {
      cmd.info("─ Static Warnings " + "─".repeat(44));
      for (const w of detail.staticWarnings) {
        cmd.output(`  ${w.file}:${w.line}  [${w.code}] ${w.message}`);
      }
    }

    if (detail.staticInfo.length > 0) {
      cmd.info("─ Static Info " + "─".repeat(48));
      for (const i of detail.staticInfo) {
        cmd.output(`  ${i.file}:${i.line}  [${i.code}] ${i.message}`);
      }
    }
    cmd.success("─ NexaDebug Done " + "─".repeat(44));
  }

  // ── HELPERS ──

  _rel(fullPath) { return fullPath.replace(this._basePath + "/", "").replace(/\\/g, "/"); }

  static _isCodeFile(name) {
    const exts = [".js",".jsx",".ts",".tsx",".mjs",".cjs",".mts",".cts",".vue",".svelte",".html",".htm",".css",".scss",".less",".sass",".json",".jsonc",".py",".php",".rb",".go",".rs",".java",".kt",".swift",".sql",".xml",".yml",".yaml",".toml",".ini",".cfg",".sh",".bash",".bat",".cmd",".ps1",".md",".mdx",".txt",".env",".env.example"];
    const ext = name.includes(".") ? "." + name.split(".").pop().toLowerCase() : "";
    return exts.includes(ext);
  }

  static _isSkippableDir(name) {
    return ["node_modules",".git",".svn","__pycache__",".next","dist","build",".cache"].includes(name);
  }

  // ── SCANNING ──

  async _scanAll(dirPath) {
    const results = { dirs: [], files: [], totalSize: 0 };
    const walk = async (path) => {
      const entries = await this._readFolder(path);
      const sorted = [...(entries || [])].sort((a, b) => String(a.name||"").localeCompare(String(b.name||"")));
      for (const e of sorted) {
        if (NexaDebug._isSkippableDir(e.name)) continue;
        const full = path + "/" + e.name;
        if (e.type === "directory") { results.dirs.push(full); await walk(full); }
        else { results.files.push({ path: full, name: e.name }); if (typeof e.size==="number") results.totalSize += e.size; }
      }
    };
    await walk(dirPath);
    return results;
  }

  async searchFilesByName(dirPath, query) {
    const q = String(query||"").toLowerCase(), matches = [];
    const walk = async (path) => {
      const entries = await this._readFolder(path);
      for (const e of entries||[]) {
        if (NexaDebug._isSkippableDir(e.name)) continue;
        const full = path + "/" + e.name;
        if (e.type === "directory") await walk(full);
        else if (e.name.toLowerCase().includes(q)) matches.push({ path: full, name: e.name });
      }
    };
    await walk(dirPath);
    return matches;
  }

  async grepFiles(dirPath, query, extFilter = "") {
    const q = String(query||"").toLowerCase(), matches = [];
    const exts = String(extFilter).split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
    const walk = async (path) => {
      const entries = await this._readFolder(path);
      for (const e of entries||[]) {
        if (NexaDebug._isSkippableDir(e.name)) continue;
        const full = path + "/" + e.name;
        if (e.type === "directory") await walk(full);
        else {
          const ext = e.name.includes(".") ? "." + e.name.split(".").pop().toLowerCase() : "";
          if (exts.length>0 && !exts.some(x=>ext===x||ext.endsWith(x))) continue;
          const content = await this._readFile(full);
          if (!content) continue;
          const lines = content.split("\n");
          for (let i=0;i<lines.length;i++) if (lines[i].toLowerCase().includes(q)) matches.push({file:full,line:i+1,text:lines[i].trim().substring(0,200)});
        }
      }
    };
    await walk(dirPath);
    return matches;
  }

  // ── SYNTAX VALIDATION ──

  static _enrichError(error, ext) {
    return {...error, severity: error.severity||"HIGH", confidence: error.confidence||"100%",
      category: error.category||NexaDebug._errorCategory(error.type,error.message),
      suggestion: error.suggestion||NexaDebug._suggestFix(error.message,error.type,ext),
      errorType: error.errorType||NexaDebug._errorType(error.type,error.message),
      analyzer: error.analyzer||NexaDebug._analyzerSource(ext)};
  }
  static _deduplicateErrors(errors) {
    const seen = new Set();
    return errors.filter(e=>{const k=`${e.line}|${e.col}|${e.type}|${e.message}`;if(seen.has(k))return false;seen.add(k);return true;});
  }
  static _errorCategory(type,msg) {const m=(msg||"").toLowerCase(),t=(type||"").toLowerCase();if(m.includes("json"))return"JSON Syntax Error";if(m.includes("html")||t.includes("html"))return"HTML Error";if(m.includes("css")||t.includes("css"))return"CSS Error";if(m.includes("python")||t.includes("python"))return"Python Error";if(m.includes("shell")||t.includes("shell")||t.includes("bash"))return"Shell Syntax Error";if(m.includes("yaml")||t.includes("yaml"))return"YAML Syntax Error";if(m.includes("validator"))return"Validator Internal Error";if(m.includes("potential")||t.includes("potential"))return"Potential Runtime Error";if(t==="undeclared-var")return"Potential Runtime Error";if(t==="empty-catch")return"Code Quality";return"Syntax Error";}
  static _errorType(type,msg) {const m=(msg||"").toLowerCase(),t=(type||"").toLowerCase();if(t==="console-log")return"Console Log";if(t==="magic-number")return"Magic Number";if(t==="undeclared-var")return"Undeclared Variable";if(t==="empty-catch")return"Empty Catch Block";if(t==="syntax-error"){if(m.includes("semicolon"))return"Missing Semicolon";if(m.includes(";"))return"Unexpected Token";if(m.includes("}")||m.includes("{"))return"Unbalanced Braces";if(m.includes("json"))return"JSON Parse Error";return"Unexpected Token";}if(t==="html-error"){if(m.includes("unclosed tag"))return"Unclosed Tag";if(m.includes("unmatched"))return"Mismatched Tag";return"Unclosed Tag";}if(t==="css-error")return"Unbalanced Braces";if(t==="python-error")return"Indentation Error";if(t==="shell-error")return"Unclosed String";if(t==="yaml-error")return"YAML Syntax Error";if(t==="php-error"){if(m.includes("semicolon"))return"Missing Semicolon";if(m.includes("unclosed"))return"Unclosed Brace";if(m.includes("too many"))return"Extra Brace";return"PHP Syntax Error";}if(m.includes("semicolon"))return"Missing Semicolon";if(m.includes("unclosed"))return"Unclosed String";if(m.includes("indent"))return"Indentation Error";if(m.includes("json"))return"JSON Parse Error";return"Syntax Error";}
  static _analyzerSource(ext) {const map={".json":"JSON Parser",".js":"JS Parser (new Function())",".jsx":"JS Parser",".mjs":"JS Parser",".cjs":"JS Parser",".ts":"TS Parser",".tsx":"TS Parser",".mts":"TS Parser",".cts":"TS Parser",".html":"HTML Validator",".htm":"HTML Validator",".css":"CSS Checker",".scss":"CSS Checker",".less":"CSS Checker",".sass":"CSS Checker",".py":"Python Validator",".php":"PHP Analyzer",".sh":"Shell Balancer",".bash":"Shell Balancer",".bat":"Batch Check",".cmd":"Batch Check",".ps1":"PS Check",".sql":"SQL Balancer",".xml":"XML Validator",".yml":"YAML Check",".yaml":"YAML Check",".toml":"TOML Check",".ini":"INI Check",".cfg":"INI Check",".vue":"Vue/Svelte Analyzer",".svelte":"Vue/Svelte Analyzer",".md":"MD Validator",".mdx":"MD Validator",".env":"ENV Check"};return map[ext]||"Generic Validator";}
  static _suggestFix(message, type, ext) {
    const m=(message||"").toLowerCase(),t=(type||"").toLowerCase();
    if(m.includes("unexpected token")){if(m.includes("}"))return"Remove or add missing opening brace '{' before this token.";if(m.includes("{"))return"Add missing closing brace '}' after this block.";if(m.includes(")"))return"Add missing opening parenthesis '(' before this token.";if(m.includes("("))return"Add missing closing parenthesis ')' after this expression.";if(m.includes("string"))return"Check string quoting - missing or extra quotes.";if(m.includes("identifier"))return"Add missing operator or semicolon before identifier.";if(m.includes("invalid keyword"))return"Use valid keyword without trailing characters.";return"Review syntax around this token.";}
    if(m.includes("unexpected identifier"))return"Add missing operator or comma before identifier.";
    if(t==="undeclared-var"||m.includes("not declared")||m.includes("is not defined")){const vm=message.match(/"([^"]+)"/);if(vm)return"Declare \""+vm[1]+"\" using var/let/const before use.";return"Declare the variable before using it.";}
    if(m.includes("unterminated string")||m.includes("unclosed string")||m.includes("unclosed quote"))return"Close the string with matching quote character.";
    if(m.includes("json parse"))return"Fix JSON syntax: check for trailing commas, missing quotes, or extra braces.";
    if(m.includes("unmatched closing tag")){const m2=message.match(/<\/\w+/);return"Remove or match "+(m2?m2[0]+">":"the closing tag")+" with an opening tag.";}
    if(m.includes("unclosed tag")){const m2=message.match(/<\w+/);return"Add closing tag for "+(m2?m2[0]+">":"the unclosed tag")+".";}
    if(m.includes("unclosed"))return"Close the unclosed block or bracket.";
    if(m.includes("too many")||m.includes("extra closing"))return"Remove the extra closing brace '}'.";
    if(m.includes("missing semicolon"))return"Add semicolon at end of previous statement.";
    if(m.includes("yaml")||m.includes("indented content after blank"))return"Remove blank line or fix indentation in YAML block.";
    if(t.includes("html-error"))return"Fix HTML tag nesting or closing order.";
    if(t.includes("css-error"))return"Fix CSS brace balance.";
    if(t.includes("shell-error"))return"Close the unclosed quote or backtick.";
    if(t.includes("python-error"))return"Fix Python indentation or syntax.";
    return"Review the indicated line for syntax issues.";
  }

  // ── Validator per file type ──

  static _validateJS(content, lines, ext) {
    const errors=[],seen=new Set();let cur=lines.map(l=>l);
    // Skip JSX sepenuhnya — <ComponentName> tidak bisa di-parse
    if (ext===".jsx" || /<\/?[A-Z]\w*(?:\s[^>]*)?\/?>/.test(content)) return errors;
    const kwRe=/\b(function|class|var|let|const|if|for|while|switch|catch|return|throw|import|export)(\w+)/g;
    for(let i=0;i<cur.length;i++){kwRe.lastIndex=0;let m;while((m=kwRe.exec(cur[i]))!==null){if(!seen.has(i+1)){seen.add(i+1);errors.push(NexaDebug._enrichError({line:i+1,col:m.index+1,type:"syntax-error",message:"Unexpected token: invalid keyword \""+m[0]+"\"",severity:"HIGH",confidence:"100%"},ext));}cur[i]=cur[i].replace(kwRe,"$1");}}
    for(let i=0;i<cur.length;i++){const t=cur[i].trimStart();if(t.startsWith("export "))cur[i]=cur[i].replace(/^\s*export\s+(default\s+)?/,"");}
    // Handle import: single-line comment, multi-line jaga braces balance
    let inImport=false;
    for(let i=0;i<cur.length;i++){const t=cur[i].trimStart();
    if(t.startsWith("import ")){const after=t.replace(/^import\s+/,"");
      if(after.startsWith("{")&&!after.includes("}")){cur[i]="{";inImport=true;continue;}
      cur[i]="// "+cur[i];}
    if(inImport){if(t.startsWith("} from")){cur[i]="}";inImport=false;}else{cur[i]="// "+cur[i];}}}
    // new Function() — skip untuk JSX (sudah di-return di atas)
    for(let p=0;p<50;p++){try{new Function(cur.join("\n"));break}catch(e){if(!(e instanceof SyntaxError))break;const msg=String(e.message||"");let el=1,ec=1;const sm=(e.stack||"").match(/<anonymous>:(\d+):(\d+)/);if(sm){el=parseInt(sm[1]);ec=parseInt(sm[2]);}if(seen.has(el))break;seen.add(el);let col=ec||1;const elc=cur[el-1]||"";const tm=msg.match(/'([^']+)'/);if(tm){const ti=elc.indexOf(tm[1]);if(ti>=0)col=ti+1;}errors.push(NexaDebug._enrichError({line:el,col,type:"syntax-error",message:msg.substring(0,150),severity:"HIGH",confidence:"100%"},ext));const ei=el-1;if(ei<0||ei>=cur.length)break;const ind=cur[ei].match(/^\s*/)[0];const tr=cur[ei].trim();if(tr==="}")cur[ei]=ind+";";else if(tr.endsWith("{"))cur[ei]=ind+"{}";else cur[ei]=ind+"void 0;";}}
    for(let i=0;i<lines.length;i++){if(i>0&&/^\s*\(/.test(lines[i])&&!/[;{(\[=,]\s*$/.test(lines[i-1].trim())){const pt=lines[i-1].trim();if(pt&&!pt.endsWith(";")&&!pt.endsWith("{")&&!pt.endsWith("(")&&!pt.endsWith("[")&&!pt.endsWith(",")&&!pt.endsWith("}")&&!pt.startsWith("//")&&!pt.startsWith("*")){errors.push(NexaDebug._enrichError({line:i+1,col:1,type:"potential-error",message:"Possible missing semicolon before IIFE - can cause \"is not a function\" error",severity:"MEDIUM",confidence:"70%"},ext));}}}
    return errors;
  }

  static _validateHTML(content, lines, ext) {
    const errors=[],stack=[],voids=new Set(["br","hr","img","input","meta","link","area","base","col","embed","source","track","wbr"]);
    const re=/<\/?(\w+)[^>]*>/g;let m;
    while((m=re.exec(content))!==null){const ic=m[0].startsWith("</"),tag=m[1].toLowerCase(),ln=content.substring(0,m.index).split("\n").length;if(voids.has(tag))continue;if(!ic)stack.push({tag,line:ln});else{const li=stack.length-1;if(li>=0&&stack[li].tag===tag)stack.pop();else errors.push(NexaDebug._enrichError({line:ln,col:1,type:"html-error",message:"Unmatched closing tag </"+tag+">",severity:"HIGH",confidence:"100%"},ext));}}
    for(const t of stack)errors.push(NexaDebug._enrichError({line:t.line,col:1,type:"html-error",message:"Unclosed tag <"+t.tag+">",severity:"HIGH",confidence:"100%"},ext));
    return errors;
  }

  static _validateCSS(content, lines, ext) {
    const errors=[];let bc=0;
    for(let i=0;i<content.length;i++){if(content[i]==="{")bc++;else if(content[i]==="}")bc--;}
    if(bc>0)errors.push(NexaDebug._enrichError({line:lines.length,col:1,type:"css-error",message:"Unclosed { - "+bc+" brace(s) not closed",severity:"HIGH",confidence:"100%"},ext));
    else if(bc<0)errors.push(NexaDebug._enrichError({line:1,col:1,type:"css-error",message:"Too many } - "+(-bc)+" extra closing brace(s)",severity:"HIGH",confidence:"100%"},ext));
    return errors;
  }

  static _validatePHP(content, lines, ext) {
    const errors=[];
    if(!/<\?(php|=)/.test(content.trim())){errors.push(NexaDebug._enrichError({line:1,col:1,type:"php-error",message:"Missing PHP opening tag <?php",severity:"HIGH",confidence:"100%"},ext));return errors;}
    const kwRe=/\b(function|class|if|else|for|foreach|while|switch|case|default|try|catch|return|break|continue|new|print|echo|throw|declare|include|require|namespace|use|extends|implements|interface|trait|abstract|private|public|protected|static|final|const|var)\d+/g;let pm;
    while((pm=kwRe.exec(content))!==null){const ln=content.substring(0,pm.index).split("\n").length,ls=content.lastIndexOf("\n",pm.index)+1,co=pm.index-ls+1;errors.push(NexaDebug._enrichError({line:ln,col:co>0?co:1,type:"syntax-error",message:"Unexpected token: invalid keyword \""+pm[0]+"\"",severity:"HIGH",confidence:"100%"},ext));}
    let is=false,sc="",bc=0;let lbl=1;
    for(let i=0;i<content.length;i++){const ch=content[i],ln=content.substring(0,i).split("\n").length;if(!is&&(ch==="\""||ch==="'")){is=true;sc=ch;continue;}if(is&&ch===sc){is=false;continue;}if(is&&ch==="\\"){i++;continue;}if(!is){if(ch==="{"){bc++;lbl=ln;}else if(ch==="}"){bc--;lbl=ln;}}}
    if(bc>0)errors.push(NexaDebug._enrichError({line:lbl,col:1,type:"php-error",message:"Unclosed { - "+bc+" brace(s) not closed",severity:"HIGH",confidence:"100%"},ext));
    if(bc<0)errors.push(NexaDebug._enrichError({line:1,col:1,type:"php-error",message:"Too many } - "+(-bc)+" extra",severity:"HIGH",confidence:"100%"},ext));
    if(is)errors.push(NexaDebug._enrichError({line:lines.length,col:1,type:"php-error",message:"Unclosed string",severity:"HIGH",confidence:"100%"},ext));
    for(let i=0;i<lines.length;i++){const t=lines[i].trim();if(t&&!t.endsWith(";")&&!t.endsWith("{")&&!t.endsWith("}")&&!t.endsWith("?>")&&!t.startsWith("//")&&!t.startsWith("#")&&!t.startsWith("<?")&&!t.startsWith("/*")&&!t.endsWith("*/")&&!t.startsWith("*")&&!/^(if|else|for|foreach|while|switch|case|default|try|catch|function|class|abstract|private|public|protected|static|return|break|continue|new)\b/.test(t)&&!/^\s*$/.test(t)){errors.push(NexaDebug._enrichError({line:i+1,col:t.length+1,type:"syntax-error",message:"Missing semicolon at end of statement",severity:"HIGH",confidence:"90%"},ext));}}
    return errors;
  }

  static validateFileSyntax(name, content) {
    const ext=name.includes(".")?"."+name.split(".").pop().toLowerCase():"",lines=content.split("\n");
    if(!content||content.length<3)return[];
    try{
      if(ext===".json"||ext===".jsonc"){try{JSON.parse(content)}catch(e){const msg=String(e.message||"");let l=1,c=1;const lm=msg.match(/position\s+(\d+)/i)||msg.match(/at\s+line\s+(\d+)/i)||msg.match(/line\s+(\d+)/i);if(lm){let pos=parseInt(lm[1]);if(!isNaN(pos)&&pos<content.length){const bf=content.substring(0,pos);l=bf.split("\n").length;c=pos-bf.lastIndexOf("\n");}}return[NexaDebug._enrichError({line:l,col:c,type:"syntax-error",message:"JSON parse error: "+msg.substring(0,120),severity:"HIGH",confidence:"100%"},ext)];}return[];}
      if(ext===".js"||ext===".jsx"||ext===".mjs"||ext===".cjs")return NexaDebug._validateJS(content,lines,ext);
      if(ext===".ts"||ext===".tsx"||ext===".mts"||ext===".cts"){try{new Function(content.replace(/:(\s*)\w+(<[^>]*>)?(\s*)(=?)/g,"$1$4").replace(/\bas\s+\w+/g,"").replace(/\binterface\s+\w+[\s\S]*?\{[\s\S]*?\}/g,"").replace(/\btype\s+\w+\s*=/g,"const _type_ ="))}catch(e){if(e instanceof SyntaxError){const msg=String(e.message||""),m2=msg.match(/(\d+)/);return[NexaDebug._enrichError({line:m2?parseInt(m2[1]):1,col:1,type:"syntax-error",message:"TS parse: "+msg.substring(0,150),severity:"HIGH",confidence:"90%"},ext)];}}return[];}
      if(ext===".html"||ext===".htm")return NexaDebug._validateHTML(content,lines,ext);
      if(ext===".css"||ext===".scss"||ext===".less"||ext===".sass")return NexaDebug._validateCSS(content,lines,ext);
      if(ext===".php")return NexaDebug._validatePHP(content,lines,ext);
      if(ext===".py"){const e=[];let is2=[0];for(let i=0;i<lines.length;i++){const t2=lines[i].trimStart();if(!t2||t2.startsWith("#")||t2.startsWith("\"\"\"")||t2.startsWith("'''"))continue;const ind=lines[i].length-t2.length;if(ind>is2[is2.length-1])is2.push(ind);else if(ind<is2[is2.length-1]){while(is2.length>1&&ind<is2[is2.length-1])is2.pop();if(ind!==is2[is2.length-1]&&ind!==0)e.push(NexaDebug._enrichError({line:i+1,col:ind+1,type:"python-error",message:"Indentation mismatch: "+ind+" spaces, expected "+is2[is2.length-1],severity:"HIGH",confidence:"100%"},ext));}}return e;}
      if(ext===".sh"||ext===".bash"){const e=[];let si=false,di=false,bi=false;for(let i=0;i<content.length;i++){const ch=content[i];if(ch==="'"&&!di&&!bi)si=!si;else if(ch==="\""&&!si&&!bi)di=!di;else if(ch==="`"&&!si&&!di)bi=!bi;}if(si)e.push(NexaDebug._enrichError({line:lines.length,col:1,type:"shell-error",message:"Unclosed single quote",severity:"HIGH",confidence:"100%"},ext));if(di)e.push(NexaDebug._enrichError({line:lines.length,col:1,type:"shell-error",message:"Unclosed double quote",severity:"HIGH",confidence:"100%"},ext));if(bi)e.push(NexaDebug._enrichError({line:lines.length,col:1,type:"shell-error",message:"Unclosed backtick",severity:"HIGH",confidence:"100%"},ext));return e;}
      if(ext===".bat"||ext===".cmd"){let di2=false;for(let i=0;i<content.length;i++)if(content[i]==="\"")di2=!di2;if(di2)return[NexaDebug._enrichError({line:lines.length,col:1,type:"shell-error",message:"Unclosed double quote",severity:"HIGH",confidence:"100%"},ext)];return[];}
      if(ext===".ps1"){let is3=false,sc3="",bc=0,pc=0,bkc=0;for(let i=0;i<content.length;i++){const ch=content[i];if(!is3&&(ch==="\""||ch==="'")){is3=true;sc3=ch;continue;}if(is3&&ch===sc3){is3=false;continue;}if(is3&&ch==="`"){i++;continue;}if(!is3){if(ch==="{")bc++;else if(ch==="}")bc--;else if(ch==="(")pc++;else if(ch===")")pc--;else if(ch==="[")bkc++;else if(ch==="]")bkc--;}}const e=[];if(bc!==0)e.push(NexaDebug._enrichError({line:1,col:1,type:"syntax-error",message:bc>0?"Unclosed { - "+bc+" not closed":"Too many } - "+(-bc)+" extra",severity:"HIGH",confidence:"100%"},ext));if(pc!==0)e.push(NexaDebug._enrichError({line:1,col:1,type:"syntax-error",message:pc>0?"Unclosed ( - "+pc+" not closed":"Too many ) - "+(-pc)+" extra",severity:"HIGH",confidence:"100%"},ext));if(bkc!==0)e.push(NexaDebug._enrichError({line:1,col:1,type:"syntax-error",message:bkc>0?"Unclosed [ - "+bkc+" not closed":"Too many ] - "+(-bkc)+" extra",severity:"HIGH",confidence:"100%"},ext));if(is3)e.push(NexaDebug._enrichError({line:lines.length,col:1,type:"syntax-error",message:"Unclosed string",severity:"HIGH",confidence:"100%"},ext));return e;}
      if(ext===".sql"){let is4=false,sc4="",pc=0;for(let i=0;i<content.length;i++){const ch=content[i];if(!is4&&(ch==="\""||ch==="'")){is4=true;sc4=ch;continue;}if(is4&&ch===sc4){is4=false;continue;}if(is4&&ch==="\\"){i++;continue;}if(!is4){if(ch==="(")pc++;else if(ch===")")pc--;}}const e=[];if(pc>0)e.push(NexaDebug._enrichError({line:lines.length,col:1,type:"syntax-error",message:"Unclosed ( - "+pc+" not closed",severity:"HIGH",confidence:"100%"},ext));if(pc<0)e.push(NexaDebug._enrichError({line:1,col:1,type:"syntax-error",message:"Too many ) - "+(-pc)+" extra",severity:"HIGH",confidence:"100%"},ext));if(is4)e.push(NexaDebug._enrichError({line:lines.length,col:1,type:"syntax-error",message:"Unclosed string",severity:"HIGH",confidence:"100%"},ext));return e;}
      if(ext===".yaml"||ext===".yml"){for(let i=1;i<Math.min(lines.length,100);i++)if(lines[i].trim()&&lines[i].startsWith(" ")&&!lines[i-1].trim())return[NexaDebug._enrichError({line:i+1,col:1,type:"yaml-error",message:"Indented content after blank line - possible YAML error",severity:"MEDIUM",confidence:"70%"},ext)];return[];}
      if(ext===".xml"){const e=[],stack=[];const re=/<\/?(\w+)[^>]*\/?>/g;let m2;while((m2=re.exec(content))!==null){if(m2[0].endsWith("/>"))continue;const ic=m2[0].startsWith("</"),tag=m2[1].toLowerCase(),ln=content.substring(0,m2.index).split("\n").length;if(!ic)stack.push({tag,line:ln});else{const li=stack.length-1;if(li>=0&&stack[li].tag===tag)stack.pop();else e.push(NexaDebug._enrichError({line:ln,col:1,type:"syntax-error",message:"Unmatched closing tag </"+tag+">",severity:"HIGH",confidence:"100%"},ext));}}for(const t of stack)e.push(NexaDebug._enrichError({line:t.line,col:1,type:"syntax-error",message:"Unclosed tag <"+t.tag+">",severity:"HIGH",confidence:"100%"},ext));return e;}
      if(ext===".toml"){const e=[];for(let i=0;i<lines.length;i++){const t=lines[i].trim();if(!t||t.startsWith("#")||t.startsWith("["))continue;if(!/^[\w.\-]+\s*=\s*/.test(t))e.push(NexaDebug._enrichError({line:i+1,col:1,type:"syntax-error",message:"Invalid TOML format: expected key = value",severity:"MEDIUM",confidence:"70%"},ext));}return e;}
      if(ext===".ini"||ext===".cfg"){const e=[];for(let i=0;i<lines.length;i++){const t=lines[i].trim();if(!t||t.startsWith(";")||t.startsWith("#")||t.startsWith("["))continue;if(!/^[\w.\-]+\s*[:=]\s*/.test(t))e.push(NexaDebug._enrichError({line:i+1,col:1,type:"syntax-error",message:"Invalid INI format: expected key = value",severity:"MEDIUM",confidence:"70%"},ext));}return e;}
      if(ext===".vue"||ext===".svelte"){const e=[];const tm=content.match(/<template>([\s\S]*)<\/template>/i);if(tm)e.push(...NexaDebug._validateHTML(tm[1],tm[1].split("\n"),".html"));const sm=content.match(/<script[^>]*>([\s\S]*)<\/script>/i);if(sm&&sm[1].trim())e.push(...NexaDebug._validateJS(sm[1],sm[1].split("\n"),".js"));return e;}
      if(ext===".md"||ext===".mdx"){let count=0;const re=/^```/gm;while(re.exec(content)!==null)count++;if(count%2!==0){const ln=content.substring(0,content.lastIndexOf("```")).split("\n").length+1;return[NexaDebug._enrichError({line:ln,col:1,type:"syntax-error",message:"Unclosed code block (odd number of ``` fences)",severity:"MEDIUM",confidence:"80%"},ext)];}return[];}
      if(ext===".env"){const e=[];for(let i=0;i<lines.length;i++){const t=lines[i].trim();if(!t||t.startsWith("#")||t.startsWith("//"))continue;if(!/^[\w.]+(\s*=\s*|:\s*)/.test(t))e.push(NexaDebug._enrichError({line:i+1,col:1,type:"syntax-error",message:"Invalid .env format: expected KEY=value",severity:"MEDIUM",confidence:"70%"},ext));}return e;}
    }catch(e){return[NexaDebug._enrichError({line:1,col:1,type:"validator-error",message:"Validator internal: "+String(e.message||"").substring(0,100),severity:"HIGH",confidence:"100%"},ext)];}
    // Generic fallback: brace/paren/bracket balancer
    const e=[];let is5=false,sc5="",bc=0,pc=0,bkc=0;
    for(let i=0;i<content.length;i++){const ch=content[i];if(!is5&&(ch==="\""||ch==="'")){is5=true;sc5=ch;continue;}if(is5&&ch===sc5){is5=false;continue;}if(is5&&ch==="\\"){i++;continue;}if(!is5){if(ch==="{")bc++;else if(ch==="}")bc--;else if(ch==="(")pc++;else if(ch===")")pc--;else if(ch==="[")bkc++;else if(ch==="]")bkc--;}}
    if(bc>0)e.push(NexaDebug._enrichError({line:lines.length,col:1,type:"syntax-error",message:"Unclosed { - "+bc+" not closed",severity:"HIGH",confidence:"100%"},ext));
    if(bc<0)e.push(NexaDebug._enrichError({line:1,col:1,type:"syntax-error",message:"Too many } - "+(-bc)+" extra",severity:"HIGH",confidence:"100%"},ext));
    if(pc>0)e.push(NexaDebug._enrichError({line:lines.length,col:1,type:"syntax-error",message:"Unclosed ( - "+pc+" not closed",severity:"HIGH",confidence:"100%"},ext));
    if(pc<0)e.push(NexaDebug._enrichError({line:1,col:1,type:"syntax-error",message:"Too many ) - "+(-pc)+" extra",severity:"HIGH",confidence:"100%"},ext));
    if(bkc>0)e.push(NexaDebug._enrichError({line:lines.length,col:1,type:"syntax-error",message:"Unclosed [ - "+bkc+" not closed",severity:"HIGH",confidence:"100%"},ext));
    if(bkc<0)e.push(NexaDebug._enrichError({line:1,col:1,type:"syntax-error",message:"Too many ] - "+(-bkc)+" extra",severity:"HIGH",confidence:"100%"},ext));
    if(is5)e.push(NexaDebug._enrichError({line:lines.length,col:1,type:"syntax-error",message:"Unclosed string",severity:"HIGH",confidence:"100%"},ext));
    return e;
  }

  async _validateAllFiles(dirPath) {
    const r={_meta:{scannedCount:0,errorCount:0}};
    const walk=async(path)=>{const entries=await this._readFolder(path);for(const e of entries||[]){if(NexaDebug._isSkippableDir(e.name))continue;const full=path+"/"+e.name;if(e.type==="directory")await walk(full);else if(NexaDebug._isCodeFile(e.name)){const c=await this._readFile(full);if(!c||c.length<3)continue;r._meta.scannedCount++;const re=NexaDebug._deduplicateErrors(NexaDebug.validateFileSyntax(e.name,c));if(re.length>0){r[full]={lines:c.split("\n"),errors:re};r._meta.errorCount+=re.length;}}}};await walk(dirPath);return r;
  }

  // ── DEPENDENCY / TRACE ──

  static parseImports(code, filePath) {
    const imports=[];
    let m;const ir=/import\s+(?:\{[^}]*\}|[^;{]+)\s+from\s+['"]([^'"]+)['"]\s*;?/g;while((m=ir.exec(code))!==null)imports.push({type:"import",source:filePath,target:m[1],raw:m[0].substring(0,80)});
    const rr=/(?:const|let|var)\s+\w+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;while((m=rr.exec(code))!==null)imports.push({type:"require",source:filePath,target:m[1],raw:m[0].substring(0,80)});
    const dr=/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;while((m=dr.exec(code))!==null)imports.push({type:"dynamic-import",source:filePath,target:m[1],raw:m[0].substring(0,80)});
    return imports;
  }

  static parseDefinitions(code) {
    const defs=[],lines=code.split("\n");
    for(let i=0;i<lines.length;i++){const l=lines[i];let fn=l.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/);if(fn){defs.push({type:"function",name:fn[1],line:i+1});continue;}fn=l.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/);if(fn){defs.push({type:"arrow-fn",name:fn[1],line:i+1});continue;}let cls=l.match(/^(?:export\s+)?class\s+(\w+)/);if(cls){defs.push({type:"class",name:cls[1],line:i+1});continue;}let mt=l.match(/^\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/);if(mt&&!/^(if|for|while|switch|catch|return|function|const|let|var|class)\b/.test(mt[1]))defs.push({type:"method",name:mt[1],line:i+1});}
    return defs;
  }

  static resolveImportPath(impPath, target) {
    if(!target.startsWith(".")&&!target.startsWith(".."))return null;
    const base=impPath.includes("/")?impPath.substring(0,impPath.lastIndexOf("/")):"",parts=target.split("/"),res=[];
    for(const p of(base?base.split("/"):[]))res.push(p);
    for(const p of parts){if(p===".")continue;if(p===".."){if(res.length>0)res.pop();}else res.push(p);}
    return res.join("/");
  }

  async traceFile(filePath, depth=0, maxDepth=3, visited=new Set()) {
    if(depth>maxDepth||visited.has(filePath))return null;visited.add(filePath);
    const c=await this._readFile(filePath);if(!c)return null;
    const defs=NexaDebug.parseDefinitions(c),imports=NexaDebug.parseImports(c,filePath),resolved=[];
    for(const imp of imports){const rp=NexaDebug.resolveImportPath(filePath,imp.target);if(rp){const fp=/\.(js|ts|jsx|tsx)$/.test(rp)?rp:rp+".js";const ch=await this.traceFile(fp,depth+1,maxDepth,visited);resolved.push({...imp,resolvedPath:fp,child:ch});}else resolved.push({...imp,resolvedPath:null,child:null});}
    return {filePath,defs,imports:resolved,depth};
  }

  static flattenDeps(trace, depth=0) {
    if(!trace)return[];const r=[{filePath:trace.filePath,depth,defs:trace.defs,importCount:trace.imports.length}];for(const imp of trace.imports)if(imp.child)r.push(...NexaDebug.flattenDeps(imp.child,depth+1));return r;
  }

  // ── STATIC ANALYSIS ──

  static _GLOBALS_JS=new Set(["console","window","document","global","process","Buffer","setTimeout","setInterval","clearTimeout","clearInterval","require","module","exports","__dirname","__filename","fetch","Promise","JSON","Math","Date","Array","Object","String","Number","Boolean","RegExp","Error","Map","Set","WeakMap","WeakSet","Symbol","Proxy","Reflect","undefined","null","true","false","this","arguments","isNaN","isFinite","parseInt","parseFloat","encodeURI","encodeURIComponent","decodeURI","decodeURIComponent","Infinity","NaN"]);
  static _GLOBALS_PHP=new Set(["$_GET","$_POST","$_REQUEST","$_SERVER","$_SESSION","$_COOKIE","$_FILES","$_ENV","$GLOBALS","$this"]);

  static staticAnalyzeCode(name, code) {
    const issues=[],lines=code.split("\n");if(!code||code.length<10)return issues;
    const ext=name.includes(".")?"."+name.split(".").pop().toLowerCase():"";
    // Skip static analysis untuk file data
    const dataExts=[".sql",".csv",".tsv",".json",".jsonc",".yaml",".yml",".xml",".ini",".cfg",".toml",".md",".mdx"];
    if (dataExts.includes(ext)) return issues;
    for(let i=0;i<lines.length;i++){const l=lines[i],ln=i+1;
      if(/console\.(log|debug|dir)\s*\(/.test(l)&&!/\/\/\s*(todo|fixme|xxx)/i.test(l))issues.push({line:ln,severity:"info",code:"console-log",message:"Console log left in production code"});
      if(/\/\/\s*(todo|fixme|xxx)/i.test(l)){const lb=l.match(/\/\/\s*(todo|fixme|xxx)[:\s]*(.*)/i);issues.push({line:ln,severity:"warning",code:"todo",message:`${(lb?lb[1].toUpperCase():"TODO")}: ${lb?lb[2]:""}`});}
      if(l.length>200&&l.trim())issues.push({line:ln,severity:"warning",code:"long-line",message:`Line too long (${l.length} chars > 200)`});
      if(/catch\s*\(\s*\w+\s*\)\s*\{\s*\}\s*$/.test(l.trim()))issues.push({line:ln,severity:"warning",code:"empty-catch",message:"Empty catch block - error swallowed"});
      if(/\/\/\s*@ts-ignore/.test(l))issues.push({line:ln,severity:"info",code:"ts-ignore",message:"@ts-ignore suppression"});
      if(/:\s*any\b/.test(l)&&/\.(ts|tsx)$/i.test(ext))issues.push({line:ln,severity:"info",code:"any-type",message:"`any` type used - consider typing"});
      const mn=l.match(/(?<![.\w])[2-9]\d{0,2}(?![.\w])/);if(mn&&!/^\s*\/\//.test(l)&&!/['"`]/.test(l)&&!/\/\*/.test(l)){const v=parseInt(mn[0]);if(v>1&&v!==100&&v!==200&&v!==300&&v!==400&&v!==404&&v!==500&&!/\[\d+\]/.test(l)&&!/^\s*\d+\s*$/.test(l.trim()))issues.push({line:ln,severity:"info",code:"magic-number",message:`Magic number: ${v}`});}
    }
    const fnMatches=code.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)[\s\S]*?^}/gm);if(fnMatches)for(const fn of fnMatches){const fl=fn.split("\n").length,fnName=fn.match(/function\s+(\w+)/);if(fl>100&&fnName){const ln=code.substring(0,code.indexOf(fn)).split("\n").length;issues.push({line:ln,severity:"warning",code:"long-function",message:`Function "${fnName[1]}" is ${fl} lines (consider refactoring)`});}}
    if(/\.(js|jsx|mjs|cjs|ts|tsx|mts|cts)$/i.test(ext)){const dec=new Set();let vm;const vr=/\b(?:var|let|const)\s+(\w+)\s*[=;]/g;while((vm=vr.exec(code))!==null)dec.add(vm[1]);const fr=/\bfunction\s+(\w+)\s*\(/g;while((vm=fr.exec(code))!==null)dec.add(vm[1]);const pr=/(?:function|=>)\s*\(?([^)]*)\)?\s*[={]/g;while((vm=pr.exec(code))!==null)vm[1].split(",").forEach(p=>{const pn=p.trim().split("=")[0].trim().split(/\s+/).pop();if(pn&&!/^\d/.test(pn))dec.add(pn);});const cr=/catch\s*\(\s*(\w+)\s*\)/g;while((vm=cr.exec(code))!==null)dec.add(vm[1]);const imr=/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from/g;while((vm=imr.exec(code))!==null){if(vm[1])vm[1].split(",").forEach(s=>{const n=s.trim().split(/\s+as\s+/).pop().trim();if(n)dec.add(n);});if(vm[2])dec.add(vm[2]);if(vm[3])dec.add(vm[3]);}
    const retR=/\breturn\s+(\w+)(?:\s*[;}]|\s*$)/gm;while((vm=retR.exec(code))!==null){const vn=vm[1],ln=code.substring(0,vm.index).split("\n").length;if(!dec.has(vn)&&!NexaDebug._GLOBALS_JS.has(vn))issues.push({line:ln,severity:"warning",code:"undeclared-var",message:`Potential ReferenceError: "${vn}" is not declared in this scope`});}
    const assR=/^(\s*)(\w+)\s*=\s*/gm;while((vm=assR.exec(code))!==null){const vn=vm[2];if(vm.input.substring(0,vm.index).match(/(this|exports|module|global)\.\s*$/))continue;const ln=code.substring(0,vm.index).split("\n").length;if(!dec.has(vn)&&!NexaDebug._GLOBALS_JS.has(vn))issues.push({line:ln,severity:"warning",code:"undeclared-var",message:`Potential ReferenceError: "${vn}" is assigned but not declared`});}}
    if(/\.(php)$/i.test(ext)){const dec=new Set();const apv=(n)=>{const cl=n.replace(/^&/,"");if(cl&&cl.startsWith("$"))dec.add(cl);};let vm;const ar=/(\$\w+)\s*=/g;while((vm=ar.exec(code))!==null)apv(vm[1]);const fr=/(?:function|class)\s+\w+\s*\(([^)]*)\)/g;while((vm=fr.exec(code))!==null)vm[1].split(",").forEach(p=>{const t=p.trim();if(t.startsWith("$"))apv(t.split("=")[0].trim());});const cr=/catch\s*\([^)]*?(\$\w+)\s*\)/g;while((vm=cr.exec(code))!==null)apv(vm[1]);const ur=/(\$\w+)\b(?!\s*=)/g;while((vm=ur.exec(code))!==null){const vn=vm[1];if(dec.has(vn)||NexaDebug._GLOBALS_PHP.has(vn))continue;const ctx=code.substring(Math.max(0,vm.index-60),vm.index);if(/(?:function|class)\s+\w+\s*\([^)]*$/.test(ctx))continue;const ln=code.substring(0,vm.index).split("\n").length;issues.push({line:ln,severity:"warning",code:"undeclared-var",message:`Potential PHP Warning: "${vn}" is not assigned in this scope`});}}
    return issues;
  }

  async _staticScanAll(dirPath) {
    const r={fileIssues:{},summary:{errors:0,warnings:0,info:0}};
    const walk=async(path)=>{const entries=await this._readFolder(path);for(const e of entries||[]){if(NexaDebug._isSkippableDir(e.name))continue;const full=path+"/"+e.name;if(e.type==="directory")await walk(full);else if(NexaDebug._isCodeFile(e.name)){const c=await this._readFile(full);if(!c)continue;const issues=NexaDebug.staticAnalyzeCode(e.name,c);if(issues.length>0){r.fileIssues[full]=issues;for(const iss of issues){if(iss.severity==="error")r.summary.errors++;else if(iss.severity==="warning")r.summary.warnings++;else r.summary.info++;}}}}};await walk(dirPath);return r;
  }

  // ── METRICS ──

  static countEffectiveLines(code) {
    const lines=code.split("\n");let e=0,ib=false;
    for(const l of lines){const t=l.trim();if(!t)continue;if(ib){if(t.includes("*/"))ib=false;continue;}if(t.startsWith("//"))continue;if(t.startsWith("/*")){if(!t.includes("*/"))ib=true;continue;}e++;}
    return e;
  }

  static estimateComplexity(code) {const dp=(code.match(/\b(if|else\s+if|for|while|case\s+|catch\s*\(|&&|\|\|)\b/g)||[]).length;return Math.max(1,dp+1);}

  async _checkMetrics(dirPath) {
    const m={files:[],totals:{files:0,lines:0,effectiveLines:0,complexity:0,imports:0,issues:0}};
    const walk=async(path)=>{const entries=await this._readFolder(path);for(const e of entries||[]){if(NexaDebug._isSkippableDir(e.name))continue;const full=path+"/"+e.name;if(e.type==="directory")await walk(full);else if(NexaDebug._isCodeFile(e.name)){const c=await this._readFile(full);if(!c)continue;const tl=c.split("\n").length,el=NexaDebug.countEffectiveLines(c),cx=NexaDebug.estimateComplexity(c),ic=NexaDebug.parseImports(c,full).length,isc=NexaDebug.staticAnalyzeCode(e.name,c).length,rel=full.replace(dirPath+"/","");m.files.push({path:rel,lines:tl,effective:el,complexity:cx,imports:ic,issues:isc});m.totals.files++;m.totals.lines+=tl;m.totals.effectiveLines+=el;m.totals.complexity+=cx;m.totals.imports+=ic;m.totals.issues+=isc;}}};await walk(dirPath);m.files.sort((a,b)=>b.complexity-a.complexity||b.lines-a.lines);return m;
  }

  // ── FLOW ──

  static extractFlow(code) {
    const flow=[],lines=code.split("\n");
    for(let i=0;i<lines.length;i++){const l=lines[i],ln=i+1;
      if(/^(export\s+default\s+|export\s+)/.test(l.trim()))flow.push({line:ln,type:"export",detail:l.trim().substring(0,80)});
      let d=l.match(/^(?:export\s+)?(?:async\s+)?function\s+(\w+)/);if(d){flow.push({line:ln,type:"function-def",detail:d[1]});continue;}
      let cl=l.match(/^(?:export\s+)?class\s+(\w+)/);if(cl){flow.push({line:ln,type:"class-def",detail:cl[1]});continue;}
      let fa=l.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/);if(fa){flow.push({line:ln,type:"arrow-fn",detail:fa[1]});continue;}
      if(/\b(if\s*\(|else if\s*\(|switch\s*\()/.test(l)&&!/^\s*\/\//.test(l))flow.push({line:ln,type:"conditional",detail:l.trim().substring(0,60)});
      if(/\b(for\s*\(|while\s*\(|do\s*\{)/.test(l)&&!/^\s*\/\//.test(l))flow.push({line:ln,type:"loop",detail:l.trim().substring(0,60)});
      if(/^\s*return\b/.test(l)&&!/^\s*\/\//.test(l))flow.push({line:ln,type:"return",detail:l.trim().substring(0,80)});
      if(/^\s*throw\b/.test(l))flow.push({line:ln,type:"throw",detail:l.trim().substring(0,80)});
      if(/^\s*try\s*\{/.test(l))flow.push({line:ln,type:"try",detail:"try {"});
      if(/^\s*\}\s*catch\s*\(/.test(l))flow.push({line:ln,type:"catch",detail:l.trim().substring(0,60)});
      if(/\.then\s*\(/.test(l)&&!/^\s*\/\//.test(l))flow.push({line:ln,type:"promise-then",detail:l.trim().substring(0,60)});
      if(/\.catch\s*\(/.test(l)&&!/^\s*\/\//.test(l))flow.push({line:ln,type:"promise-catch",detail:l.trim().substring(0,60)});
      if(/\bawait\b/.test(l)&&!/^\s*\/\//.test(l))flow.push({line:ln,type:"await",detail:l.trim().substring(0,60)});
    }
    return flow;
  }

  static compareFlow(flowA,flowB){const gA={},gB={};for(const f of flowA){if(!gA[f.type])gA[f.type]=[];gA[f.type].push(f);}for(const f of flowB){if(!gB[f.type])gB[f.type]=[];gB[f.type].push(f);}const all=new Set([...Object.keys(gA),...Object.keys(gB)]),cmp=[];for(const t of all){const ca=gA[t]?gA[t].length:0,cb=gB[t]?gB[t].length:0;cmp.push({type:t,countA:ca,countB:cb,diff:cb-ca});}return cmp;}

  // ── RAG ENGINE ──

  static chunkContent(content,filePath,maxChunkSize=1500){const lines=content.split("\n"),chunks=[];let cur=[],cs=0;const flush=()=>{if(cur.length===0)return;const t=cur.join("\n").trim();if(t)chunks.push({text:t,lines:cur,filePath});cur=[];cs=0;};for(let i=0;i<lines.length;i++){const l=lines[i];if(l.trim()===""&&cs>0){flush();continue;}if(/^\s*(async\s+)?(function|class|const\s+\w+\s*=\s*\(|export\s+default|export\s+function|export\s+class)\b/.test(l)&&cs>0){flush();}cur.push(l);cs+=l.length+1;if(cs>=maxChunkSize)flush();}flush();return chunks;}
  static tokenize(text){return String(text||"").toLowerCase().replace(/[^a-z0-9_]/g," ").split(/\s+/).filter(Boolean);}
  static termFreq(tokens){const tf={};for(const t of tokens)tf[t]=(tf[t]||0)+1;const len=tokens.length||1;for(const k in tf)tf[k]/=len;return tf;}
  static buildIndex(chunks){const dc=chunks.length,df={};const td=chunks.map((ch,idx)=>{const tokens=NexaDebug.tokenize(ch.text),unique=new Set(tokens);for(const t of unique)df[t]=(df[t]||0)+1;return{idx,tokens,tf:NexaDebug.termFreq(tokens)};});const idf={};for(const t in df)idf[t]=Math.log((dc+1)/(df[t]+1))+1;return{chunks,tokenizedDocs:td,idf,docCount:dc};}
  static retrieve(query,index,topK=5){const qt=NexaDebug.tokenize(query);if(qt.length===0)return[];const qtf=NexaDebug.termFreq(qt),scores=[];for(const doc of index.tokenizedDocs){let score=0;for(const t in qtf){if(index.idf[t])score+=qtf[t]*(doc.tf[t]||0)*index.idf[t]*index.idf[t];}if(score>0)scores.push({idx:doc.idx,score});}scores.sort((a,b)=>b.score-a.score);return scores.slice(0,topK).map(s=>({...index.chunks[s.idx],score:s.score,snippet:index.chunks[s.idx].text.substring(0,300)}));}
  static formatRagContext(results){if(!results.length)return"Tidak ada hasil relevan ditemukan.";let ctx="Konteks dari proyek:\n\n";for(const r of results){ctx+=`--- ${r.filePath} (relevansi: ${r.score.toFixed(4)}) ---\n`;ctx+=r.text.substring(0,2000)+"\n\n";}return ctx;}

  async ensureIndex(dirPath){if(this.ragIndex&&this._indexedPath===dirPath)return{index:this.ragIndex,chunks:this.ragChunks};const all=await this._scanAll(dirPath),chunks=[];for(const f of all.files){const c=await this._readFile(f.path);if(c)chunks.push(...NexaDebug.chunkContent(c,f.path));}this.ragIndex=NexaDebug.buildIndex(chunks);this.ragChunks=chunks;this._indexedPath=dirPath;return{index:this.ragIndex,chunks:this.ragChunks};}
  async rag(query,dirPath,topK=5){const dir=dirPath||this._basePath;const{index,chunks}=await this.ensureIndex(dir);if(chunks.length===0)return[];return NexaDebug.retrieve(query,index,topK);}
}

export default NexaDebug;
