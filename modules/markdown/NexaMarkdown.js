/**
 * NexaMarkdown — render markdown multi-konteks (dokumen, chat, …).
 *
 * Engine & npm: ./markdownCore.mjs + /node_modules/…
 *
 * @example Dokumen (path + Preview)
 * await new NexaMarkdown('D:/Framework/docs/Checkable.md').Preview('#panel');
 *
 * @example Chat (string langsung)
 * await NexaMarkdown.fromContent('**Halo** dari _assistant_').Chat(bubbleEl);
 */

import {
	CHAT_MAX_CHARS,
	NEXA_MARKDOWN_MODE,
	PREVIEW_MAX_CHARS,
	mountMarkdownContent,
	renderMarkdownHtml,
} from './markdownCore.mjs';

function resolveElement(target) {
	if (!target) return null;
	if (target instanceof HTMLElement) return target;
	if (typeof target === 'string') return document.querySelector(target);
	return null;
}

function defaultClassForMode(mode) {
	return mode === NEXA_MARKDOWN_MODE.CHAT
		? 'nexa-markdown-chat'
		: 'beranda-discovery-md-preview';
}

export class NexaMarkdown {
	/**
	 * @param {string} [filePath] — path absolut berkas .md (opsional jika `content` di-set)
	 * @param {{
	 *   mode?: 'doc'|'chat',
	 *   target?: string|HTMLElement,
	 *   content?: string,
	 *   className?: string,
	 *   maxChars?: number,
	 *   mermaid?: boolean,
	 *   wireLinks?: boolean,
	 * }} [options]
	 */
	constructor(filePath = '', options = {}) {
		this.filePath = String(filePath || '').trim();
		const mode = options.mode === NEXA_MARKDOWN_MODE.CHAT ? NEXA_MARKDOWN_MODE.CHAT : NEXA_MARKDOWN_MODE.DOC;
		this.options = {
			mode,
			target: null,
			content: null,
			className: defaultClassForMode(mode),
			maxChars: mode === NEXA_MARKDOWN_MODE.CHAT ? CHAT_MAX_CHARS : PREVIEW_MAX_CHARS,
			mermaid: mode === NEXA_MARKDOWN_MODE.DOC,
			wireLinks: true,
			...options,
			mode,
		};
		this._markdown = null;
		this._loadPromise = null;
		this._linkDispose = null;
	}

	/** Instance chat dari string (tanpa baca disk). */
	static fromContent(content, options = {}) {
		return new NexaMarkdown('', {
			...options,
			content: String(content ?? ''),
			mode: options.mode ?? NEXA_MARKDOWN_MODE.CHAT,
		});
	}

	/** Instance dokumen dari path berkas. */
	static fromFile(filePath, options = {}) {
		return new NexaMarkdown(filePath, {
			...options,
			mode: NEXA_MARKDOWN_MODE.DOC,
		});
	}

	setContent(content) {
		this._markdown = String(content ?? '');
		this._loadPromise = null;
		return this;
	}

	/** @returns {Promise<string>} */
	async load() {
		if (this._markdown != null) return this._markdown;
		if (this._loadPromise) return this._loadPromise;

		this._loadPromise = (async () => {
			if (this.options.content != null) {
				this._markdown = String(this.options.content);
				return this._markdown;
			}
			if (!this.filePath) {
				throw new Error('NexaMarkdown: path berkas kosong (gunakan content atau fromContent).');
			}

			const api = typeof window !== 'undefined' ? window.electronAPI : null;
			if (!api?.discoveryReadFile) {
				throw new Error(
					'NexaMarkdown: electronAPI.discoveryReadFile tidak tersedia. Jalankan di Electron.',
				);
			}

			const result = await api.discoveryReadFile(this.filePath);
			if (!result?.ok) {
				throw new Error(result?.error || 'Gagal membaca berkas markdown.');
			}
			if (result.kind === 'image') {
				throw new Error('Path merujuk ke gambar, bukan berkas markdown teks.');
			}

			this._markdown = String(result.content ?? '');
			return this._markdown;
		})();

		try {
			return await this._loadPromise;
		} finally {
			this._loadPromise = null;
		}
	}

	createElement() {
		const el = document.createElement('div');
		const cls = String(this.options.className || '').trim();
		if (cls) el.className = cls;
		return el;
	}

	applyClasses(el) {
		const cls = String(this.options.className || '').trim();
		if (!cls || !(el instanceof HTMLElement)) return;
		for (const name of cls.split(/\s+/)) {
			if (name) el.classList.add(name);
		}
	}

	/**
	 * Render ke DOM sesuai mode instance (`doc` | `chat`).
	 * @param {string|HTMLElement} [target]
	 * @returns {Promise<HTMLElement>}
	 */
	async render(target) {
		const md = await this.load();
		let el = resolveElement(target) || resolveElement(this.options.target);

		if (!el) {
			el = this.createElement();
		} else {
			this.applyClasses(el);
		}

		this._linkDispose?.();
		await mountMarkdownContent(el, md, {
			mode: this.options.mode,
			maxChars: this.options.maxChars,
			mermaid: this.options.mermaid,
			wireLinks: this.options.wireLinks,
		});

		return el;
	}

	/** Pratinjau dokumen penuh (mode `doc`). */
	async Preview(target) {
		this.options.mode = NEXA_MARKDOWN_MODE.DOC;
		if (!this.options.className || this.options.className === 'nexa-markdown-chat') {
			this.options.className = defaultClassForMode(NEXA_MARKDOWN_MODE.DOC);
		}
		return this.render(target);
	}

	/** Bubble / pesan chat (mode `chat`). */
	async Chat(target) {
		this.options.mode = NEXA_MARKDOWN_MODE.CHAT;
		if (!this.options.className || this.options.className === 'beranda-discovery-md-preview') {
			this.options.className = defaultClassForMode(NEXA_MARKDOWN_MODE.CHAT);
		}
		this.options.mermaid = false;
		if (this.options.maxChars === PREVIEW_MAX_CHARS) {
			this.options.maxChars = CHAT_MAX_CHARS;
		}
		return this.render(target);
	}

	/** @returns {Promise<string>} HTML aman (tanpa mount DOM). */
	async html() {
		const md = await this.load();
		return renderMarkdownHtml(md, { maxChars: this.options.maxChars });
	}

	dispose() {
		this._linkDispose?.();
		this._linkDispose = null;
	}
}

export default NexaMarkdown;
