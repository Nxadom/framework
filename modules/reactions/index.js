/**
 * Facebook Reactions — Entry Point ES6 Module
 *
 * Re-export class + konstanta + helper + auto-init.
 *
 * @example
 *   // Auto-init (cukup import)
 *   import './assets/modules/reactions/index.js';
 *
 *   // Manual
 *   import { createReactions, FacebookReactions, REACTION_ICONS } from './assets/modules/reactions/index.js';
 *   createReactions('#my-container', { storageKey: 'my_reaction' });
 */

import FacebookReactions from './script.js';

/* ---------------------------------------------------------------------- */
/*  Named exports — konstanta                                              */
/* ---------------------------------------------------------------------- */

export const REACTION_ICONS = Object.freeze({
  like:  'thumb_up',
  love:  'favorite',
  haha:  'emoji_emotions',
  wow:   'sentiment_very_satisfied',
  sad:   'sentiment_dissatisfied',
  angry: 'mood_bad'
});

export const REACTION_LABELS = Object.freeze({
  like:  'Like',
  love:  'Love',
  haha:  'Haha',
  wow:   'Wow',
  sad:   'Sad',
  angry: 'Angry'
});

export const REACTION_COLORS = Object.freeze({
  like:  '#1877f2',
  love:  '#e74c3c',
  haha:  '#f39c12',
  wow:   '#f39c12',
  sad:   '#f39c12',
  angry: '#e67e22'
});

/* ---------------------------------------------------------------------- */
/*  Helper factory                                                        */
/* ---------------------------------------------------------------------- */

/**
 * Buat instance FacebookReactions dengan mudah.
 * @param   {string|HTMLElement} container  Selector atau element
 * @param   {Object}             [options]  Opsional tambahan
 * @returns {FacebookReactions}
 */
export function createReactions(container, options = {}) {
  return new FacebookReactions({ container, ...options });
}

/* ---------------------------------------------------------------------- */
/*  Auto-init                                                             */
/* ---------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Cari elemen dengan data-reactions attribute
  const targets = document.querySelectorAll('[data-reactions]');

  if (targets.length) {
    targets.forEach(el => new FacebookReactions({ container: el }));
  }

  // Fallback: jika ada #reactions-app dan belum di-init
  const app = document.getElementById('reactions-app');
  if (!targets.length && app && !app.querySelector('.box')) {
    new FacebookReactions({ container: app });
  }
});

/* ---------------------------------------------------------------------- */
/*  Re-export default agar bisa: import FacebookReactions from '...'       */
/* ---------------------------------------------------------------------- */
export { FacebookReactions };
export default FacebookReactions;
