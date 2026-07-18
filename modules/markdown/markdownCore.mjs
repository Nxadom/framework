/**
 * Inti render pratinjau Markdown — modul mandiri di assets/modules/markdown.
 * Engine: ./markdownEngine.mjs (esbuild dari npm, npm run vendor:markdown)
 * Runtime: dompurify, mermaid, highlight.js CSS dari /node_modules/…
 */

import { renderMarkdown } from './markdownEngine.mjs';

export const PREVIEW_MAX_CHARS = 220000;
export const CHAT_MAX_CHARS = 12000;

/** @typedef {'doc'|'chat'} NexaMarkdownMode */
export const NEXA_MARKDOWN_MODE = Object.freeze({
	DOC: 'doc',
	CHAT: 'chat',
});

function previewOrigin() {
	try {
		return typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
	} catch {
		return '';
	}
}

/** URL paket npm yang di-serve dari project root (/node_modules/…). */
export function nodeModulesUrl(relPath) {
	const rel = String(relPath || '').replace(/^\/+/, '');
	const o = previewOrigin();
	return o && rel ? `${o}/node_modules/${rel}` : '';
}

export function isPreviewDarkMode() {
	try {
		if (document.body?.classList?.contains('dark-mode-grid')) return true;
		return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
	} catch {
		return false;
	}
}

let __purify = undefined;
async function loadDOMPurify() {
	if (__purify !== undefined) return __purify;
	const url = nodeModulesUrl('dompurify/dist/purify.es.mjs');
	if (!url) {
		__purify = null;
		return null;
	}
	try {
		const mod = await import(/* webpackIgnore: true */ url);
		__purify = mod.default || mod;
	} catch {
		__purify = null;
	}
	return __purify;
}

export async function sanitizeMarkdownHtml(html) {
	if (!html || typeof html !== 'string') return '';
	const P = await loadDOMPurify();
	if (P && typeof P.sanitize === 'function') {
		return P.sanitize(html, {
			USE_PROFILES: { html: true },
			ADD_TAGS: ['input'],
			ADD_ATTR: ['type', 'checked', 'disabled', 'id', 'class', 'aria-hidden', 'tabindex'],
		});
	}
	return html;
}

export function ensureHighlightCss() {
	const href = isPreviewDarkMode()
		? nodeModulesUrl('highlight.js/styles/github-dark.min.css')
		: nodeModulesUrl('highlight.js/styles/github.min.css');
	if (!href) return;
	const existing = document.getElementById('nx-markdown-hljs-theme');
	if (existing?.getAttribute('href') === href) return;
	existing?.remove();
	const link = document.createElement('link');
	link.id = 'nx-markdown-hljs-theme';
	link.rel = 'stylesheet';
	link.href = href;
	document.head.appendChild(link);
}

let __mermaidApi = null;
async function loadMermaid() {
	if (__mermaidApi) return __mermaidApi;
	const url = nodeModulesUrl('mermaid/dist/mermaid.core.mjs');
	if (!url) return null;
	try {
		const mod = await import(/* webpackIgnore: true */ url);
		__mermaidApi = mod.default || mod.mermaid || mod;
	} catch {
		__mermaidApi = null;
	}
	return __mermaidApi;
}

export async function renderMermaidBlocks(root) {
	if (!(root instanceof HTMLElement)) return;
	const nodes = root.querySelectorAll('pre.mermaid');
	if (!nodes.length) return;
	const mermaid = await loadMermaid();
	if (!mermaid?.run) return;
	try {
		mermaid.initialize?.({
			startOnLoad: false,
			theme: isPreviewDarkMode() ? 'dark' : 'default',
			securityLevel: 'strict',
		});
		await mermaid.run({ nodes: [...nodes] });
	} catch {
		/* diagram invalid */
	}
}

function truncateMarkdown(raw, maxChars) {
	const limit = Number.isFinite(maxChars) && maxChars > 0 ? maxChars : PREVIEW_MAX_CHARS;
	const full = String(raw ?? '');
	if (full.length <= limit) return full;
	return `${full.slice(0, limit)}\n\n_(Pratinjau dipotong: berkas > ${limit.toLocaleString()} karakter)_`;
}

export async function renderMarkdownHtml(rawMarkdown, opts = {}) {
	const raw = truncateMarkdown(rawMarkdown, opts.maxChars);
	ensureHighlightCss();
	let html = renderMarkdown(raw);
	// Hapus anchor permalink ¶ di semua mode — tidak perlu tampil di UI
	if (opts.stripPermalinks !== false) {
		html = html.replace(/<a\b[^>]*\bnx-md-header-anchor\b[^>]*>[\s\S]*?<\/a>/g, '');
	}
	return sanitizeMarkdownHtml(html);
}

function handleMarkdownLinkClick(e, link, root, mode = NEXA_MARKDOWN_MODE.DOC) {
	const href = (link.getAttribute('href') || '').trim();

	if (e.ctrlKey || e.metaKey || e.button === 1 || e.button === 2) {
		return false;
	}

	if (!href || href === '#') {
		return mode === NEXA_MARKDOWN_MODE.CHAT ? false : true;
	}

	if (
		href.startsWith('mailto:') ||
		href.startsWith('tel:') ||
		href.startsWith('javascript:') ||
		href.startsWith('data:')
	) {
		return false;
	}

	if (href.startsWith('#')) {
		scrollPreviewToHash(root, href);
		return true;
	}

	if (href.startsWith('http://') || href.startsWith('https://')) {
		// Semua link http/https → browser panel internal (jangan ganti tampilan sistem)
		e.preventDefault();
		window.dispatchEvent(new CustomEvent('nx-browser-open', { detail: { url: href } }));
		return true;
	}

	if (mode === NEXA_MARKDOWN_MODE.CHAT) {
		return false;
	}

	// DOC mode, path relatif — buka di browser panel, jangan window.open
	try {
		const resolved = new URL(href, window.location.href);
		e.preventDefault();
		window.dispatchEvent(new CustomEvent('nx-browser-open', { detail: { url: resolved.href } }));
	} catch {
		/* abaikan URL tidak valid */
	}
	return true;
}

function normalizeMountMode(mode) {
	return mode === NEXA_MARKDOWN_MODE.CHAT ? NEXA_MARKDOWN_MODE.CHAT : NEXA_MARKDOWN_MODE.DOC;
}

/**
 * Render markdown ke elemen DOM.
 * @param {HTMLElement} el
 * @param {string} rawMarkdown
 * @param {{
 *   mode?: NexaMarkdownMode,
 *   maxChars?: number,
 *   mermaid?: boolean,
 *   wireLinks?: boolean,
 *   loadingClass?: string,
 *   errClass?: string,
 * }} [opts]
 */
export async function mountMarkdownContent(el, rawMarkdown, opts = {}) {
	if (!(el instanceof HTMLElement)) {
		throw new Error('mountMarkdownContent: el harus HTMLElement');
	}

	const mode = normalizeMountMode(opts.mode);
	const maxChars =
		opts.maxChars ??
		(mode === NEXA_MARKDOWN_MODE.CHAT ? CHAT_MAX_CHARS : PREVIEW_MAX_CHARS);
	const useMermaid = opts.mermaid !== false && mode === NEXA_MARKDOWN_MODE.DOC;
	const useLinks = opts.wireLinks !== false;

	const loadingClass =
		opts.loadingClass ||
		(mode === NEXA_MARKDOWN_MODE.CHAT
			? 'nexa-markdown-chat--loading'
			: 'beranda-discovery-md-preview--loading');
	const errClass =
		opts.errClass ||
		(mode === NEXA_MARKDOWN_MODE.CHAT
			? 'nexa-markdown-chat__err'
			: 'beranda-discovery-md-preview__err');

	el.dataset.nxMarkdownMode = mode;
	if (mode === NEXA_MARKDOWN_MODE.CHAT) {
		el.setAttribute('data-nx-markdown-chat', '');
		el.removeAttribute('data-nx-markdown-preview');
	} else {
		el.setAttribute('data-nx-markdown-preview', '');
		el.removeAttribute('data-nx-markdown-chat');
	}

	el.classList.add(loadingClass);
	ensureHighlightCss();

	try {
		const raw = truncateMarkdown(rawMarkdown, maxChars);
		const len = String(rawMarkdown ?? '').length;
		if (len > 55000 && typeof requestIdleCallback === 'function') {
			await new Promise((res) => requestIdleCallback(() => res(), { timeout: 1200 }));
		} else if (len > 55000) {
			await new Promise((r) => setTimeout(r, 0));
		}

		const html = await renderMarkdownHtml(raw, { maxChars, mode });
		el.innerHTML = html || '<p><em>(kosong)</em></p>';
		if (useMermaid) await renderMermaidBlocks(el);
		if (useLinks) wireMarkdownLinks(el, { mode });
	} catch (e) {
		el.innerHTML = `<p class="${errClass}">${String(e?.message || e)}</p>`;
		throw e;
	} finally {
		el.classList.remove(loadingClass);
	}
}

/** Alias mode dokumen (Discovery, Preview berkas). */
export async function mountMarkdownPreview(previewEl, rawMarkdown, opts = {}) {
	return mountMarkdownContent(previewEl, rawMarkdown, {
		...opts,
		mode: NEXA_MARKDOWN_MODE.DOC,
	});
}

const previewLinkWires = new WeakMap();

/** Slug seperti GitHub — selaras dengan daftar isi manual & markdown-it-anchor. */
function githubLikeSlugify(str) {
	return String(str ?? '')
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^\p{L}\p{N}\s-]/gu, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

function headingPlainText(el) {
	if (!(el instanceof HTMLElement)) return '';
	return String(el.textContent || '')
		.replace(/\u00b6/g, '')
		.replace(/^\s*¶\s*/u, '')
		.trim();
}

function findPreviewAnchor(previewRoot, fragment) {
	if (!(previewRoot instanceof HTMLElement) || !fragment) return null;
	const frag = decodeURIComponent(String(fragment).trim());
	if (!frag) return null;

	if (typeof CSS !== 'undefined' && CSS.escape) {
		try {
			const byId = previewRoot.querySelector('#' + CSS.escape(frag));
			if (byId) return byId;
		} catch {
			/* abaikan */
		}
	}

	try {
		const byAttr = previewRoot.querySelector(
			'[id="' + frag.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]',
		);
		if (byAttr) return byAttr;
	} catch {
		/* abaikan */
	}

	const byName = previewRoot.querySelector('a[name="' + frag.replace(/"/g, '\\"') + '"]');
	if (byName) return byName;

	const fragSlug = githubLikeSlugify(frag);
	if (!fragSlug) return null;

	for (const h of previewRoot.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
		if (h.id) {
			if (h.id === frag || githubLikeSlugify(h.id) === fragSlug) return h;
		}
		const textSlug = githubLikeSlugify(headingPlainText(h));
		if (textSlug === fragSlug) return h;
	}

	return null;
}

function scrollPreviewToHash(previewRoot, href) {
	if (!(previewRoot instanceof HTMLElement) || !href?.startsWith('#') || href.length < 2) {
		return false;
	}
	const frag = decodeURIComponent(href.slice(1));
	const anchorEl = findPreviewAnchor(previewRoot, frag);
	if (!anchorEl) return false;

	const top =
		previewRoot.scrollTop +
		(anchorEl.getBoundingClientRect().top - previewRoot.getBoundingClientRect().top) -
		8;
	previewRoot.scrollTo({
		top: Math.max(0, top),
		behavior: 'smooth',
	});
	return true;
}

/**
 * Klik tautan di blok markdown — mandiri, bukan rute SPA.
 * @param {HTMLElement} rootEl
 * @param {{ mode?: NexaMarkdownMode }} [opts]
 * @returns {() => void} dispose
 */
export function wireMarkdownLinks(rootEl, opts = {}) {
	if (!(rootEl instanceof HTMLElement)) return () => {};

	const mode = normalizeMountMode(opts.mode);

	const prev = previewLinkWires.get(rootEl);
	prev?.abort?.();

	const ac = new AbortController();
	previewLinkWires.set(rootEl, ac);

	rootEl.addEventListener(
		'click',
		(e) => {
			const link = e.target.closest('a');
			if (!link || !rootEl.contains(link)) return;
			if (!handleMarkdownLinkClick(e, link, rootEl, mode)) return;
			e.preventDefault();
			e.stopPropagation();
			if (typeof e.stopImmediatePropagation === 'function') {
				e.stopImmediatePropagation();
			}
		},
		{ capture: true, signal: ac.signal },
	);

	return () => {
		ac.abort();
		previewLinkWires.delete(rootEl);
		rootEl.removeAttribute('data-nx-markdown-preview');
		rootEl.removeAttribute('data-nx-markdown-chat');
		delete rootEl.dataset.nxMarkdownMode;
	};
}

/** @deprecated gunakan wireMarkdownLinks */
export function wireMarkdownPreviewLinks(previewEl) {
	return wireMarkdownLinks(previewEl, { mode: NEXA_MARKDOWN_MODE.DOC });
}
