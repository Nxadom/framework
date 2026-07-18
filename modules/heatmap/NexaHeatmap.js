// ─────────────────────────────────────────────────────────────────────────────
// NexaHeatmap — GitHub-style contribution graph (SVG native, tanpa Cal-Heatmap)
//
// Usage:
//   await NXUI.Heatmap.mountPanel(container, { entries, filters, years, renderExtra });
//   await NXUI.Heatmap({ target: el, legendTarget: el2, entries, year: 2026 });
// ─────────────────────────────────────────────────────────────────────────────

const HEATMAP_BASE = new URL('./', import.meta.url).href;

const CELL = 11;
const GUTTER = 2;

let cssLoaded = false;

function _ensureCss() {
  if (cssLoaded || document.getElementById('nexa-heatmap-panel-css')) {
    cssLoaded = true;
    return;
  }
  const el = document.createElement('link');
  el.rel = 'stylesheet';
  el.href = `${HEATMAP_BASE}nexa-heatmap.css`;
  el.id = 'nexa-heatmap-panel-css';
  document.head.appendChild(el);
  cssLoaded = true;
}

/** Kunci tanggal YYYY-MM-DD — sama dengan field ISO di history (bagian tanggal). */
export function _entryDateKey(entry) {
  const raw = entry?.timestamp || entry?.date;
  if (!raw) return '';
  const s = String(raw);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const dt = new Date(raw);
  if (Number.isNaN(+dt)) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function _dateKeyFromDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function entriesToHeatmapData(entries) {
  const countByDate = {};
  (entries || []).forEach(e => {
    const d = _entryDateKey(e);
    if (d) countByDate[d] = (countByDate[d] || 0) + 1;
  });
  return Object.entries(countByDate).map(([date, value]) => ({ date, value }));
}

export function computeHeatmapStats(entries) {
  const countByDate = {};
  (entries || []).forEach(e => {
    const d = _entryDateKey(e);
    if (d) countByDate[d] = (countByDate[d] || 0) + 1;
  });

  const byMonth = {};
  (entries || []).forEach(e => {
    const m = _entryDateKey(e).slice(0, 7);
    if (m) byMonth[m] = (byMonth[m] || 0) + 1;
  });

  let bestMonth = null;
  let bestMonthCount = 0;
  Object.entries(byMonth).forEach(([m, c]) => {
    if (c > bestMonthCount) { bestMonthCount = c; bestMonth = m; }
  });

  let bestDay = null;
  let bestDayCount = 0;
  Object.entries(countByDate).forEach(([d, c]) => {
    if (c > bestDayCount) { bestDayCount = c; bestDay = d; }
  });

  const sorted = Object.keys(countByDate).filter(d => countByDate[d] > 0).sort();
  let longest = 0;
  let streak = 0;
  let prev = null;
  sorted.forEach(d => {
    if (prev && (new Date(d + 'T12:00:00') - new Date(prev + 'T12:00:00')) / 86400000 === 1) streak++;
    else streak = 1;
    if (streak > longest) longest = streak;
    prev = d;
  });

  let current = 0;
  const chk = new Date();
  chk.setHours(12, 0, 0, 0);
  for (;;) {
    const key = _entryDateKey({ timestamp: chk });
    if (!countByDate[key]) break;
    current++;
    chk.setDate(chk.getDate() - 1);
  }

  return { total: (entries || []).length, bestMonth, bestDay, longest, current };
}

function _resolveEl(target) {
  if (!target) return null;
  return typeof target === 'string' ? document.querySelector(target) : target;
}

function _getDateRange(year) {
  const nowYear = new Date().getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!year || year === nowYear) {
    const start = new Date(today);
    start.setDate(start.getDate() - 364);
    start.setHours(0, 0, 0, 0);
    return { start, max: today };
  }

  const start = new Date(year, 0, 1);
  start.setHours(0, 0, 0, 0);
  const max = new Date(year, 11, 31);
  max.setHours(0, 0, 0, 0);
  return { start, max };
}

function _levelIndex(v, max) {
  if (!v) return 0;
  const steps = [
    1,
    Math.max(2, Math.ceil(max * 0.25)),
    Math.max(3, Math.ceil(max * 0.5)),
    Math.max(4, Math.ceil(max * 0.75)),
  ];
  if (v >= steps[3]) return 4;
  if (v >= steps[2]) return 3;
  if (v >= steps[1]) return 2;
  if (v >= steps[0]) return 1;
  return 0;
}

function _startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function _addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function _mondayOf(d) {
  const x = _startOfDay(d);
  const dow = x.getDay();
  const back = dow === 0 ? 6 : dow - 1;
  return _addDays(x, -back);
}

/** Satu kolom minggu hanya di satu blok bulan (hindari duplikat di perbatasan). */
function _weekBelongsToMonth(weekStart, y, mo) {
  const mon = _startOfDay(weekStart);
  const monthFirst = new Date(y, mo, 1);

  if (mon.getMonth() === mo && mon.getFullYear() === y) return true;

  if (mon < monthFirst) {
    const sun = _addDays(mon, 6);
    if (sun < monthFirst) return false;
    const prevMo = mo === 0 ? 11 : mo - 1;
    const prevY = mo === 0 ? y - 1 : y;
    if (mon.getMonth() === prevMo && mon.getFullYear() === prevY) return false;
    return true;
  }
  return false;
}

/** Satu blok per bulan; 7 baris Sen–Min, slot kosong = penjaga baris. */
function _buildMonthBlocks(startDate, endDate) {
  const start = _startOfDay(startDate);
  const end = _startOfDay(endDate);
  const blocks = [];

  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cur <= endMonth) {
    const y = cur.getFullYear();
    const mo = cur.getMonth();
    const monthEnd = new Date(y, mo + 1, 0);
    if (monthEnd < start) {
      cur = new Date(y, mo + 1, 1);
      continue;
    }

    const rangeFrom = cur < start ? start : _startOfDay(cur);
    const rangeTo = monthEnd > end ? end : _startOfDay(monthEnd);

    const weekStarts = new Set();
    for (let d = new Date(rangeFrom); d <= rangeTo; d = _addDays(d, 1)) {
      weekStarts.add(+_mondayOf(d));
    }

    const weeks = [...weekStarts]
      .sort((a, b) => a - b)
      .filter(ws => _weekBelongsToMonth(new Date(ws), y, mo))
      .map(ws => {
        const weekStart = new Date(ws);
        const slots = Array(7).fill(null);
        for (let i = 0; i < 7; i++) {
          const day = _addDays(weekStart, i);
          const inMonth = day.getMonth() === mo && day.getFullYear() === y;
          const inRange = day >= start && day <= end;
          if (inMonth && inRange) slots[i] = { key: _dateKeyFromDate(day) };
        }
        return slots;
      })
      .filter(week => week.some(Boolean));

    if (weeks.length) {
      blocks.push({
        label: cur.toLocaleString('en', { month: 'short' }),
        year: y,
        weeks,
      });
    }
    cur = new Date(y, mo + 1, 1);
  }
  return blocks;
}

function _monthBlockLabel(block, prevBlock) {
  if (!prevBlock || prevBlock.label !== block.label || prevBlock.year === block.year) return block.label;
  return `${block.label} '${String(block.year).slice(-2)}`;
}

function _escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function _renderLegend(legendEl, max) {
  if (!legendEl) return;
  const steps = max <= 1
    ? [1]
    : [1, Math.ceil(max * 0.25), Math.ceil(max * 0.5), Math.ceil(max * 0.75)].filter((v, i, a) => i === 0 || v > a[i - 1]);

  legendEl.innerHTML = `
    <div class="nx-hm-legend-inner">
      <span class="nx-hm-legend-less">Less</span>
      ${[0, 1, 2, 3, 4].map(lv => `<span class="nx-hm-legend-swatch nx-hm-lv${lv}"></span>`).join('')}
      <span class="nx-hm-legend-more">More</span>
      ${steps.length > 1 ? `<span class="nx-hm-legend-steps">${steps.join(' · ')}</span>` : ''}
    </div>
  `;
}

function _renderHeatmapChart(container, heatmapData, dateRange) {
  const countByDate = new Map();
  (heatmapData || []).forEach(({ date, value }) => {
    if (date) countByDate.set(date, +value || 0);
  });
  const max = Math.max(1, ...[...countByDate.values(), 0]);
  const blocks = _buildMonthBlocks(dateRange.start, dateRange.max);

  let prevBlock = null;
  const monthsHtml = blocks.map(block => {
    const lab = _monthBlockLabel(block, prevBlock);
    prevBlock = block;

    const cols = block.weeks.map(week => {
      const cells = week.map(slot => {
        if (!slot) {
          return '<span class="nx-hm-slot nx-hm-slot--pad" aria-hidden="true"></span>';
        }
        const count = countByDate.get(slot.key) || 0;
        const lv = _levelIndex(count, max);
        const tip = `${slot.key}: ${count} navigation${count !== 1 ? 's' : ''}`;
        return `<span class="nx-hm-slot nx-hm-cell nx-hm-lv${lv}" title="${_escAttr(tip)}"></span>`;
      }).join('');
      return `<div class="nx-hm-wcol">${cells}</div>`;
    }).join('');

    return `
      <div class="nx-hm-mblock" role="group" aria-label="${_escAttr(lab)}">
        <div class="nx-hm-mblock-label">${lab}</div>
        <div class="nx-hm-mblock-grid">${cols}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="nx-hm-dom" role="img" aria-label="Navigation activity heatmap">
      <div class="nx-hm-months-row">${monthsHtml}</div>
    </div>
  `;
  return max;
}

function _fmtNum(n) {
  return Number(n).toLocaleString();
}

function _fmtMonthFull(ym) {
  if (!ym) return '—';
  const [y, m] = ym.split('-');
  return new Date(+y, +m - 1).toLocaleString('en', { month: 'long' });
}

function _fmtDayShort(d) {
  if (!d) return '—';
  return new Date(d + 'T12:00:00').toLocaleString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function _scopeEntries(entries, year, nowYear) {
  if (!year || year === nowYear) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 364);
    cutoff.setHours(0, 0, 0, 0);
    return entries.filter(e => e.timestamp && new Date(e.timestamp) >= cutoff);
  }
  return entries.filter(e => String(e.timestamp || '').startsWith(year + '-'));
}

function _filterByRoute(entries, filter) {
  if (!filter || filter === 'All') return entries;
  const k = filter.toLowerCase();
  return entries.filter(e => String(e.route || '').toLowerCase() === k);
}

export class NexaHeatmap {
  #opts = {};
  #targetEl = null;
  #legendEl = null;

  static create(opts = {}) {
    const hm = new NexaHeatmap(opts);
    hm.render().catch(err => console.error('NexaHeatmap.render error:', err));
    return hm;
  }

  constructor(opts = {}) {
    this.#opts = opts;
  }

  async render(overrideOpts = {}) {
    _ensureCss();
    const opts = { ...this.#opts, ...overrideOpts };
    const { target, legendTarget, data, entries, year } = opts;

    let el = _resolveEl(target);
    if (!el) {
      console.warn('NexaHeatmap: target tidak ditemukan');
      return this;
    }

    this.#targetEl = el;
    const heatmapData = Array.isArray(data) ? data : entriesToHeatmapData(entries);
    const dateRange = _getDateRange(year);

    if (!el.id) el.id = `nx-hm-chart-${Math.random().toString(36).slice(2, 8)}`;
    el.classList.add('nx-hm-chart');

    const legendEl = _resolveEl(legendTarget);
    this.#legendEl = legendEl;
    if (legendEl) legendEl.classList.add('nx-hm-legend');

    const max = _renderHeatmapChart(el, heatmapData, dateRange);
    _renderLegend(legendEl, max);

    this.#opts = opts;
    return this;
  }

  async update(overrideOpts = {}) {
    return this.render({ ...this.#opts, ...overrideOpts });
  }

  destroy() {
    if (this.#targetEl) this.#targetEl.innerHTML = '';
    if (this.#legendEl) this.#legendEl.innerHTML = '';
  }
}

/** Panel lengkap: filter, heatmap, statistik, tahun. */
async function mountPanel(container, opts = {}) {
  if (!container) return null;
  _ensureCss();

  const {
    entries = [],
    filters = [{ key: 'All', label: 'All' }],
    years = [new Date().getFullYear()],
    selectedYear = years[0],
    selectedFilter = 'All',
    renderExtra,
    titleUnit = 'navigations',
  } = opts;

  const nowYear = new Date().getFullYear();
  let year = selectedYear;
  let filter = selectedFilter;
  let heatmapInst = null;
  let panelRoot = container.querySelector('.nx-hm-root');

  const yearLabel = y => (y === nowYear ? 'in the last year' : `in ${y}`);
  const getScoped = () => _scopeEntries(entries, year, nowYear);
  const getFiltered = () => _filterByRoute(getScoped(), filter);

  const updateStatsDom = () => {
    const stats = computeHeatmapStats(getFiltered());
    panelRoot.querySelector('[data-nx-hm="title"]').textContent =
      `${_fmtNum(stats.total)} ${titleUnit} ${yearLabel(year)}`;
    panelRoot.querySelector('[data-nx-hm="best-month"]').textContent = _fmtMonthFull(stats.bestMonth);
    panelRoot.querySelector('[data-nx-hm="best-day"]').textContent = _fmtDayShort(stats.bestDay);
    panelRoot.querySelector('[data-nx-hm="longest"]').textContent = `${stats.longest}d`;
    panelRoot.querySelector('[data-nx-hm="current"]').textContent = `${stats.current}d`;
    const extra = panelRoot.querySelector('[data-nx-hm="extra"]');
    if (extra && typeof renderExtra === 'function') {
      extra.innerHTML = renderExtra(getScoped(), { routeLabel: opts.routeLabel });
    }
  };

  const paintChart = async () => {
    if (!heatmapInst) {
      heatmapInst = new NexaHeatmap({
        target: panelRoot.querySelector('[data-nx-hm="chart"]'),
        legendTarget: panelRoot.querySelector('[data-nx-hm="legend"]'),
      });
    }
    await heatmapInst.render({ entries: getFiltered(), year });
  };

  const refresh = async () => {
    updateStatsDom();
    await paintChart();
  };

  if (panelRoot) {
    heatmapInst?.destroy();
    panelRoot.remove();
  }

  const initialStats = computeHeatmapStats(getFiltered());

  container.innerHTML = `
    <div class="nx-hm-root nx-hm-layout">
      <div class="nx-hm-main">
        <div class="nx-hm-card">
          <div class="nx-hm-card-head">
            <span class="nx-hm-title" data-nx-hm="title">${_fmtNum(initialStats.total)} ${titleUnit} ${yearLabel(year)}</span>
            <div class="nx-hm-filters" data-nx-hm="filters">
              ${filters.map(f =>
                `<button type="button" class="nx-hm-fbtn${f.key === filter ? ' active' : ''}" data-filter="${f.key}" title="${f.key}">${f.label}</button>`
              ).join('')}
            </div>
          </div>
          <div class="nx-hm-scroll">
            <div data-nx-hm="chart"></div>
          </div>
          <div data-nx-hm="legend"></div>
          <div class="nx-hm-stats">
            <div><div class="nx-hm-slabel">Most Active Month</div><div class="nx-hm-sval" data-nx-hm="best-month">${_fmtMonthFull(initialStats.bestMonth)}</div></div>
            <div><div class="nx-hm-slabel">Most Active Day</div><div class="nx-hm-sval" data-nx-hm="best-day">${_fmtDayShort(initialStats.bestDay)}</div></div>
            <div><div class="nx-hm-slabel">Longest Streak</div><div class="nx-hm-sval" data-nx-hm="longest">${initialStats.longest}d</div></div>
            <div><div class="nx-hm-slabel">Current Streak</div><div class="nx-hm-sval" data-nx-hm="current">${initialStats.current}d</div></div>
          </div>
        </div>
        ${typeof renderExtra === 'function' ? '<div class="nx-hm-extra" data-nx-hm="extra"></div>' : ''}
      </div>
      <div class="nx-hm-years" data-nx-hm="years">
        ${years.map(y =>
          `<button type="button" class="nx-hm-year-btn${y === year ? ' active' : ''}" data-year="${y}">${y}</button>`
        ).join('')}
      </div>
    </div>
  `;

  panelRoot = container.querySelector('.nx-hm-root');

  panelRoot.querySelector('[data-nx-hm="filters"]').addEventListener('click', e => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    filter = btn.dataset.filter;
    panelRoot.querySelectorAll('.nx-hm-fbtn').forEach(b => b.classList.toggle('active', b === btn));
    void refresh();
  });

  panelRoot.querySelector('[data-nx-hm="years"]').addEventListener('click', e => {
    const btn = e.target.closest('[data-year]');
    if (!btn) return;
    year = +btn.dataset.year;
    panelRoot.querySelectorAll('.nx-hm-year-btn').forEach(b => b.classList.toggle('active', b === btn));
    void refresh();
  });

  await refresh();

  return {
    refresh,
    destroy: () => {
      heatmapInst?.destroy();
      container.innerHTML = '';
    },
  };
}

const _NexaHeatmapFactory = function (opts = {}) {
  return NexaHeatmap.create(opts);
};
Object.setPrototypeOf(_NexaHeatmapFactory, NexaHeatmap);
_NexaHeatmapFactory.prototype = NexaHeatmap.prototype;
_NexaHeatmapFactory.create = NexaHeatmap.create;
_NexaHeatmapFactory.mountPanel = mountPanel;
_NexaHeatmapFactory.entriesToHeatmapData = entriesToHeatmapData;
_NexaHeatmapFactory.computeHeatmapStats = computeHeatmapStats;
NexaHeatmap.entriesToHeatmapData = entriesToHeatmapData;
NexaHeatmap.computeHeatmapStats = computeHeatmapStats;
NexaHeatmap.mountPanel = mountPanel;

export default _NexaHeatmapFactory;
