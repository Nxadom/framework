import { NexaNpm } from '../npm/index.js';
import NexaMarkdown from '../../markdown/NexaMarkdown.js';

const _sessions = new WeakMap();

function _base(p) {
  return String(p || '').replace(/\\/g, '/').split('/').pop() || String(p || '');
}
function _short(s, max = 38) {
  const str = String(s || '').trim();
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function _getSession(cmd) {
  if (!_sessions.has(cmd.container)) _sessions.set(cmd.container, { messages: [] });
  return _sessions.get(cmd.container);
}

export function agent(cmd) {
  try {
    const session = _getSession(cmd);
    if (session.messages.length === 0) {
      const cwd = String(cmd.workingDirectory || '').trim();
      cmd.info('=== NxCode Agent ===');
      if (cwd) cmd.info(`📁 ${cwd}`);
      cmd.info('Ketik prompt. Ketik "exit" untuk keluar.');
      cmd.info('');
    }
    _agentLoop(cmd, session);
  } catch (err) {
    console.error('❌ agent command failed:', err);
    cmd.startNewCommand();
  }
  return false;
}

function _agentLoop(cmd, session) {
  cmd.prompt('You:', (userPrompt) => {
    if (!userPrompt || !userPrompt.trim()) {
      _agentLoop(cmd, session);
      return;
    }
    const trimmed = userPrompt.trim();
    if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
      cmd.info('');
      cmd.info('Agent ditutup.');
      _sessions.delete(cmd.container);
      cmd.startNewCommand();
      return;
    }
    _sendToAgent(cmd, session, trimmed, () => {
      cmd.info('');
      _agentLoop(cmd, session);
    });
  });
}

async function _sendToAgent(cmd, session, userPrompt, onDone) {
  const npmUi = new NexaNpm();
  let progressShown = false;

  const _destroyProgress = () => {
    if (!progressShown) return;
    progressShown = false;
    npmUi.destroy();
    try { cmd.commandRow?.commandRow?.remove(); } catch (_) {}
    cmd.commandRow = null;
  };

  // Baca cwd per-prompt: cmd.workingDirectory adalah sumber paling akurat (langsung dari terminal aktif)
  let cwd = String(cmd.workingDirectory || '').trim();
  if (!cwd) {
    try {
      const raw = localStorage.getItem('nx-terminal-active-cwd');
      if (raw) cwd = JSON.parse(raw)?.cwd || '';
    } catch (_) {}
  }

  let editContext = null;
  if (cwd) {
    try {
      const { buildFolderContext } = await import('../../../../templates/chat/sistem/context/folder-context.js');
      const folderName = cwd.replace(/\\/g, '/').split('/').pop() || cwd;
      const folderCtx = await buildFolderContext(cwd, folderName);
      editContext = {
        agentMode: true,
        folderContexts: [folderCtx],
      };
    } catch (_) {
      editContext = {
        agentMode: true,
        folderContexts: [{
          folderPath: cwd,
          folderName: cwd.replace(/\\/g, '/').split('/').pop() || cwd,
          files: [],
        }],
      };
    }
  }

  try {
    // Dynamic import agar tidak memblokir load awal beranda.js
    const { runAgentChatCompletion } = await import('../../../../templates/chat/AI/agent-executor.js');

    await npmUi.ensureStylesheet();
    const progressHtml = npmUi.renderStartStopWait({ kind: 'start', cwd: cwd || 'NxCode Agent' });
    cmd.output(progressHtml);
    progressShown = true;
    if (cmd.commandRow) {
      cmd.commandRow.hideTime();
      cmd.commandRow.commandEntry.classList.add('block');
    }
    const entryEl = cmd.commandRow?.commandEntry;
    if (entryEl) npmUi.initStartStopWait(entryEl, { kind: 'start', cwd: cwd || 'NxCode Agent' });

    session.messages.push({ role: 'user', content: userPrompt });

    // Pemangkasan thread: hapus pesan lama saat token estimasi >60k agar context tidak overflow
    // Pertahankan pesan pertama (system context) + 4 pesan terakhir
    const TERMINAL_THREAD_TOKEN_WARN = 60000;
    const threadChars = session.messages.reduce((n, m) => n + String(m.content || '').length, 0);
    if (threadChars / 4 > TERMINAL_THREAD_TOKEN_WARN && session.messages.length > 6) {
      const keep = 4;
      const removed = session.messages.splice(1, session.messages.length - 1 - keep);
      if (removed.length > 0) {
        session.messages.splice(1, 0, {
          role: 'user',
          content: `[${removed.length} pesan lama dihapus untuk menjaga performa. Fokus pada permintaan terakhir.]`,
        });
        cmd.info(`  ⚡ Thread dipangkas (${removed.length} pesan dihapus).`);
      }
    }

    let responseText = '';
    const _toolLabels = {
      read_file:      (c) => `Membaca ${_base(c.path || c.query || 'file')}`,
      write_file:     (c) => `Menulis ${_base(c.path || 'file')}`,
      list_files:     ()  => 'Daftar file project',
      search_code:    (c) => `Cari "${_short(c.query || c.pattern || '', 32)}"`,
      search_files:   (c) => `Cari file "${_short(c.pattern || c.query || '', 32)}"`,
      find_symbol:    (c) => `Cari simbol "${_short(c.name || c.symbol || '', 28)}"`,
      run_terminal:   (c) => `$ ${_short(c.command || '', 42)}`,
      run_in_terminal:(c) => `→ Terminal: ${_short(c.command || '', 42)}`,
      detect_project: ()  => 'Deteksi project…',
      check_server:   (c) => `Cek server :${c.port || '?'}`,
      fetch_url:      (c) => `Fetch ${_short(c.url || '', 40)}`,
    };

    // Inject cwd ke system prompt — aturan khusus Terminal Agent
    const folderName = cwd ? cwd.replace(/\\/g, '/').split('/').pop() : '';
    const cwdAppendix = cwd
      ? `\n\n**Terminal Agent — Aturan wajib:**
- Direktori kerja aktif: \`${cwd}\`
- Selalu gunakan path absolut penuh saat memanggil tool. Contoh: \`${cwd}/server.js\` — JANGAN \`server.js\` atau \`${folderName}/server.js\`
- Selalu sertakan \`"cwd": "${cwd}"\` di setiap tool call run_terminal
- Jika run_terminal gagal (ok: false atau exitCode != 0): WAJIB baca field \`output\` dan \`error\` — jangan abaikan, jangan klaim server berjalan jika ada error
- JANGAN tulis instruksi manual ke user — langsung KERJAKAN dengan tool
- Jika user minta "jalankan server": deteksi script dari package.json lalu LANGSUNG jalankan dengan run_terminal. Jika port tidak terdeteksi otomatis, tetap jalankan dengan script yang ada (npm start / node server.js) — port akan terlihat di output terminal. JANGAN minta user untuk edit file atau cek port dulu`
      : '';

    const { content } = await runAgentChatCompletion(
      session.messages,
      {
        editContext,
        agentType: 'agent',
        systemAppendix: cwdAppendix || undefined,
        onDelta: (delta) => {
          responseText += delta;
        },
      },
      {
        onToolCallStart(toolName, callObj) {
          _destroyProgress();
          const fn = _toolLabels[toolName];
          const label = fn ? fn(callObj || {}) : toolName;
          cmd.info(`  ⟳ ${label}`);
        },
        onToolCallEnd(key, toolName, callObj, result) {
          const ok = result?.ok !== false;
          const fn = _toolLabels[toolName];
          const label = fn ? fn(callObj || {}) : toolName;
          cmd.info(`  ${ok ? '✓' : '✗'} ${label}`);
        },
        onLastStep() {
          _destroyProgress();
        },
        onAskUser(command, reason) {
          return new Promise((resolve) => {
            _destroyProgress();
            const label = reason ? `${reason}\n  $ ${command}` : `$ ${command}`;
            cmd.confirm(`Izinkan: ${label}`, (allowed) => resolve(allowed));
          });
        },
      }
    );

    const finalContent = content || responseText;
    if (finalContent) session.messages.push({ role: 'assistant', content: finalContent });

    _destroyProgress();

    if (finalContent && String(finalContent).trim()) {
      await _outputAgentResponse(cmd, finalContent);
    }

  } catch (err) {
    _destroyProgress();
    cmd.error('Agent gagal: ' + String(err?.message || err));
  } finally {
    onDone();
  }
}

async function _outputAgentResponse(cmd, text) {
  // Buat row output baru via cmd.output('') — ini setup commandRow + disable
  cmd.output('');
  const entry = cmd.commandRow?.commandEntry;
  if (!entry) return;

  // Render NexaMarkdown ke wrapper — listener link (nx-browser-open) terikat ke wrapper
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'font-size:11px;line-height:1.6;';
  await NexaMarkdown.fromContent(text).Chat(wrapper);
  wrapper.querySelectorAll('pre, table').forEach((el) => {
    el.classList.add('nx-scroll', 'nx-scroll-thin');
  });

  // Append wrapper langsung ke commandEntry — listener tetap aktif, tidak perlu innerHTML
  entry.innerHTML = '';
  entry.appendChild(wrapper);
}
