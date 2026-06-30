/**
 * db.js — Buckets helper untuk extension developer.
 *
 * Menggunakan store 'developer' yang sudah terdaftar di sistem (NexaDb.js).
 * Tidak perlu mendaftarkan store baru — tidak akan mengganggu data internal.
 *
 * Semua key otomatis diberi prefix "<extensionId>:" sehingga data antar
 * extension tidak pernah saling tindih meski menggunakan store yang sama.
 *
 * Cara pakai:
 *   import { db } from './buckets/db.js';
 *
 *   await db.set('config', { theme: 'dark' });
 *   const data = await db.get('config');
 *   const all  = await db.getAll();
 *   await db.delete('config');
 */

import { getDeveloperExtension } from '../../extensions.js';

const EXTENSION_ID = 'dev_example'; // harus sama dengan "id" di package.json

function _prefix(key) {
  return `${EXTENSION_ID}:${key}`;
}

function _ref() {
  const ref = globalThis.NXUI?.ref;
  if (!ref) throw new Error(`[${EXTENSION_ID}] NXUI.ref belum tersedia.`);
  return ref;
}

/**
 * Simpan data.
 * @param {string} key
 * @param {object} data
 */
export async function set(key, data) {
  const id = _prefix(key);
  await _ref().set('developer', { id, ...data, _extId: EXTENSION_ID, updatedAt: Date.now() });
}

/**
 * Ambil satu data berdasarkan key.
 * @param {string} key
 * @returns {object|null}
 */
export async function get(key) {
  return await _ref().get('developer', _prefix(key)) ?? null;
}

/**
 * Ambil semua data milik extension ini saja.
 * @returns {object[]}
 */
export async function getAll() {
  const all = await _ref().getAll('developer') ?? [];
  const rows = Array.isArray(all) ? all : Object.values(all);
  return rows.filter(row => row?._extId === EXTENSION_ID);
}

/**
 * Hapus data berdasarkan key.
 * @param {string} key
 */
export async function del(key) {
  await _ref().delete('developer', _prefix(key));
}

/** Objek shorthand — alternatif import satu-satu. */
export const db = { set, get, getAll, del };
